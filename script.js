const tileSize = 32;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

document.addEventListener("touchstart", function (e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// === LEVELS ===
const levels = [
  // Level 1 — original
  [
    "##############################",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                   F        #",
    "#   $           ######       #",
    "#   ##                       #",
    "#           #                #",
    "#                            #",
    "#       $                    #",
    "#    ######                  #",
    "#                            #",
    "#                            #",
    "# #   $    1      x  #       #",
    "# #####################      #",
    "#                            #",
    "#                       $    #",
    "#                     #####  #",
    "#                            #",
    "#   $             x          #",
    "#  ##           ######       #",
    "#                            #",
    "#                      $     #",
    "#       ######        ##     #",
    "#                            #",
    "#                            #",
    "#  S                         #",
    "##############################"
  ],
  // Level 2
  [
    "##############################",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#             F              #",
    "#           #####            #",
    "#                            #",
    "#        #      $            #",
    "#  x          ####           #",
    "# ###                 #      #",
    "#                 x          #",
    "#     $         ######       #",
    "#     #                      #",
    "#                            #",
    "#          @@@@              #",
    "#                            #",
    "#                            #",
    "#           x       $        #",
    "#         ####    ####       #",
    "#                            #",
    "#                            #",
    "#                       @@@@ #",
    "#                            #",
    "#                            #",
    "#             #   1  $  #    #",
    "#  $         ############    #",
    "# ######                     #",
    "#                            #",
    "#         ######             #",
    "#                            #",
    "#                            #",
    "#                ######      #",
    "#                            #",
    "#                            #",
    "#                            #",
    "# S                          #",
    "##############################"
  ],
  // Level 3
  [
    "##############################",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#    F                       #",
    "#   #####     #              #",
    "#                  #####     #",
    "#     x                      #",
    "#   ####                     #",
    "#                            #",
    "#            @@@@@           #",
    "#                            #",
    "#                            #",
    "#      ######    #           #",
    "#                    $       #",
    "#                   ####     #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#   ----                     #",
    "#          #     3        #  #",
    "#         #################  #",
    "#                            #",
    "#  x                  $      #",
    "# #####             ######   #",
    "#                            #",
    "#                            #",
    "#                            #",
    "#         #######            #",
    "#                            #",
    "#                            #",
    "#                      $     #",
    "#     2             #######  #",
    "# #########                  #",
    "#                            #",
    "#              ----          #",
    "#                            #",
    "#                   #######  #",
    "#                            #",
    "#                            #",
    "# S                          #",
    "##############################"
  ]
];

// === CONTROL CHARACTERS ===
const tileColors = {
  '#': '#444',         // Solid block
  '-': '#b5651d',      // Moving platform
  '@': '#ad00ad',      // Spinning platform
  ' ': '#aee7ff',      // Empty space
  'S': '#0f0',         // Start position
  'F': '#ff9800',      // Finish (orange for clarity)
  '$': '#ff0',         // Coin
  'x': '#999',         // Scam coin
  '1': '#e74c3c',      // Enemy type 1
  '2': '#27ae60',      // Enemy type 2
  '3': '#2980b9',      // Enemy type 3
  '!': '#fff'          // Text trigger
};

const player = {
  x: 0,
  y: 0,
  width: tileSize * 0.8,
  height: tileSize * 0.8,
  color: '#00f',
  dx: 0,
  dy: 0,
  speed: 2.5,
  jumpPower: 12,
  grounded: false,
  coinCount: 0
};

let cameraX = 0;
let cameraY = 0;

// Coin and scam coin storage
let coins = [];
let scamCoins = [];

// Spinning platform state
let spinningState = {
  time: 0,
  flipping: false,
  flipAngle: 0
};

function scanCoins() {
  coins = [];
  scamCoins = [];
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (level[y][x] === '$') coins.push({ x, y });
      if (level[y][x] === 'x') scamCoins.push({ x, y });
    }
  }
}

function resetPlayerToStart() {
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (level[y][x] === 'S') {
        player.x = x * tileSize;
        player.y = y * tileSize;
        player.dx = 0;
        player.dy = 0;
        player.grounded = false;
        cameraX = 0;
        cameraY = 0;
        player.coinCount = 0;
        return;
      }
    }
  }
}

let currentLevel = 0;
let level = levels[currentLevel];

function loadLevel(n) {
  currentLevel = n;
  level = levels[currentLevel];
  resetPlayerToStart();
  scanCoins();
  spinningState = { time: 0, flipping: false, flipAngle: 0 };
}

resetPlayerToStart();
scanCoins();

const keys = { left: false, right: false, jump: false };

const controlButtons = document.querySelectorAll('.control-btn');
controlButtons.forEach(btn => {
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('mousedown', e => e.preventDefault());
  btn.addEventListener('touchstart', e => e.preventDefault());
});

document.querySelector('.left').addEventListener('touchstart', () => keys.left = true);
document.querySelector('.left').addEventListener('touchend', () => keys.left = false);
document.querySelector('.right').addEventListener('touchstart', () => keys.right = true);
document.querySelector('.right').addEventListener('touchend', () => keys.right = false);
document.querySelector('.jump').addEventListener('touchstart', () => {
  if (player.grounded) {
    player.dy = -player.jumpPower;
    player.grounded = false;
  }
});

function collectCoin(coinList, tileChar, inventoryChange) {
  for (let i = 0; i < coinList.length; i++) {
    const coin = coinList[i];
    const coinX = coin.x * tileSize;
    const coinY = coin.y * tileSize;
    const coinRect = { x: coinX, y: coinY, w: tileSize, h: tileSize };
    const playerRect = { x: player.x, y: player.y, w: player.width, h: player.height };
    if (
      playerRect.x < coinRect.x + coinRect.w &&
      playerRect.x + playerRect.w > coinRect.x &&
      playerRect.y < coinRect.y + coinRect.h &&
      playerRect.y + playerRect.h > coinRect.y
    ) {
      coinList.splice(i, 1);
      level[coin.y] = level[coin.y].substring(0, coin.x) + ' ' + level[coin.y].substring(coin.x + 1);
      inventoryChange();
      return true;
    }
  }
  return false;
}

function updateSpinningState(delta) {
  spinningState.time += delta;
  if (!spinningState.flipping && spinningState.time >= 3000) {
    spinningState.flipping = true;
    spinningState.flipAngle = 0;
    spinningState.time = 0;
  }
  if (spinningState.flipping) {
    spinningState.flipAngle += Math.PI / 10;
    if (spinningState.flipAngle >= Math.PI) {
      spinningState.flipping = false;
      spinningState.flipAngle = 0;
      spinningState.time = 0;
    }
  }
}

function isSpinningPlatformSolid() {
  // Not solid during flip (0.5s every 3s)
  return !spinningState.flipping;
}

let wasOnSpinning = false;

function updatePlayer() {
  player.dx = 0;
  if (keys.left) player.dx = -player.speed;
  if (keys.right) player.dx = player.speed;
  player.dy += 0.4;

  // --- X Axis ---
  player.x += player.dx;
  if (checkCollision(player.x, player.y)) player.x -= player.dx;

  // --- Y Axis ---
  player.y += player.dy;

  let collided = checkCollision(player.x, player.y);
  let onSpinningNow = isPlayerOnSpinningPlatform(player.x, player.y);

  // If player was on spinning platform and it just became non-solid, make player fall through
  if (wasOnSpinning && !onSpinningNow && !isSpinningPlatformSolid()) {
    collided = false;
  }

  if (collided) {
    player.y -= player.dy;
    if (player.dy > 0) player.grounded = true;
    player.dy = 0;
  } else {
    player.grounded = false;
  }

  wasOnSpinning = onSpinningNow && isSpinningPlatformSolid();

  // Coin logic
  collectCoin(coins, '$', () => { player.coinCount++; });
  collectCoin(scamCoins, 'x', () => {
    if (player.coinCount > 0) {
      player.coinCount -= Math.floor(Math.random() * player.coinCount) + 1;
      if (player.coinCount < 0) player.coinCount = 0;
    }
  });

  checkFinish();
}

function checkCollision(x, y) {
  // Checks for solid '#' and solid '@'
  const corners = [
    [x, y],
    [x + player.width, y],
    [x, y + player.height],
    [x + player.width, y + player.height]
  ];
  for (const [cx, cy] of corners) {
    const tx = Math.floor(cx / tileSize);
    const ty = Math.floor(cy / tileSize);
    if (level[ty] && level[ty][tx]) {
      const tile = level[ty][tx];
      if (tile === '#') return true;
      if (tile === '@' && isSpinningPlatformSolid()) return true;
    }
  }
  return false;
}

function isPlayerOnSpinningPlatform(x, y) {
  // Check if player's feet are on a spinning platform tile
  const tx1 = Math.floor(x / tileSize);
  const tx2 = Math.floor((x + player.width - 1) / tileSize);
  const ty = Math.floor((y + player.height) / tileSize);
  return (
    (level[ty] && (level[ty][tx1] === '@' || level[ty][tx2] === '@')) &&
    isSpinningPlatformSolid()
  );
}

function checkFinish() {
  const px = Math.floor((player.x + player.width / 2) / tileSize);
  const py = Math.floor((player.y + player.height / 2) / tileSize);
  if (level[py] && level[py][px] === 'F') {
    if (currentLevel < levels.length - 1) {
      loadLevel(currentLevel + 1);
    } else {
      loadLevel(0);
    }
  }
}

function drawLevel() {
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const char = level[y][x];
      if (char === '@' && spinningState.flipping) {
        // Draw flipping platform with rotation
        ctx.save();
        ctx.translate(
          x * tileSize - cameraX + tileSize / 2,
          y * tileSize - cameraY + tileSize / 2
        );
        ctx.rotate(spinningState.flipAngle);
        ctx.fillStyle = tileColors[char];
        ctx.fillRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize);
        ctx.restore();
      } else {
        const color = tileColors[char] || '#000';
        ctx.fillStyle = color;
        ctx.fillRect(x * tileSize - cameraX, y * tileSize - cameraY, tileSize, tileSize);
      }
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
}

function updateCamera() {
  const targetX = player.x + player.width / 2 - canvas.width / 2;
  const targetY = player.y + player.height / 2 - canvas.height / 2;
  cameraX += (targetX - cameraX) * 0.05;
  cameraY += (targetY - cameraY) * 0.05;
}

const debug = document.getElementById('debug');
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateDebug() {
  frameCount++;
  const now = performance.now();
  const delta = now - lastTime;
  if (delta >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = now;
  }

  let memory = 'N/A';
  if (performance.memory) {
    const usedMB = performance.memory.usedJSHeapSize / 1048576;
    memory = `${usedMB.toFixed(2)} MB`;
  }

  debug.innerText = `
Level: ${currentLevel + 1}/${levels.length}
Coins: ${player.coinCount}
X: ${player.x.toFixed(1)}
Y: ${player.y.toFixed(1)}
dx: ${player.dx.toFixed(1)}
dy: ${player.dy.toFixed(1)}
Grounded: ${player.grounded}
Keys: ${JSON.stringify(keys)}
FPS: ${fps}
Memory: ${memory}
  `.trim();
}

let prevTime = performance.now();
function gameLoop() {
  const now = performance.now();
  const delta = now - prevTime;
  prevTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateSpinningState(delta);
  updatePlayer();
  updateCamera();
  drawLevel();
  drawPlayer();
  updateDebug();
  requestAnimationFrame(gameLoop);
}

gameLoop();
