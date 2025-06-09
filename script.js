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
  [
    "##############################",
    "#                            #",
    "#                            #",
    "#         aAaaaaaa   aB      #",
    "#                            #",
    "#                     $      #",
    "#                           F#",
    "#               ##############",
    "#                            #",
    "#           #                #",
    "#                            #",
    "#      $                     #",
    "#    ######                  #",
    "#                            #",
    "#           $                #",
    "# # $                #       #",
    "# #####################      #",
    "#         $                  #",
    "#                      $     #",
    "#        ####         #####  #",
    "#                            #",
    "#                 $          #",
    "#               ######       #",
    "#      bA     #              #",
    "#      b                     #",
    "#                            #",
    "#              #             #",
    "#      bB        #           #",
    "#S                      $    #",
    "##############################"
  ],
  [
    "####################################################################################################",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                        3                                                         #",
    "#                             ############################                                         #",
    "#                                                                                                  #",
    "#                                                            ###########                           #",
    "#                                                         #               aA                       #",
    "#                                                 2                                                #",
    "#                                        ####################                                      #",
    "#                                                                                                  #",
    "#                               #######                                                            #",
    "#                                       #                                                          #",
    "#                                               1              #          aB                       #",
    "#                                       ####################       bA                              #",
    "#                                                                  b                               #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                  bB        ############          #",
    "#                                                                                                  #",
    "#                                                                         @@@@                     #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                              #########                           #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                    #########                                     #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                                                                                                  #",
    "#                              $              #######        @@@@@                                 #",
    "#                                                                                                  #",
    "# S           !       $        #        !               x                                          #",
    "####################################################################################################"
  ]
];

// === CONTROL CHARACTERS ===
const tileColors = {
  '#': '#444',
  '-': '#b5651d',
  '@': '#ad00ad',
  ' ': '#aee7ff',
  'S': '#0f0',
  'F': '#ff9800',
  '$': '#ff0',
  'x': '#999',
  '1': '#e74c3c',
  '2': '#27ae60',
  '3': '#2980b9',
  '!': '#fff',
  'a': '#0cf', 'b': '#f0c', 'c': '#0f8', 'd': '#fa0', 'e': '#0fa', 'f': '#a0f', 'g': '#8a0', 'h': '#08a', 'i': '#a80', 'j': '#808'
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

let coins = [];
let scamCoins = [];

// === ENEMY SYSTEM ===
let enemies = []; // {type, x, y, px, py, dir, patrolMin, patrolMax, speed, vy, grounded, jumpCooldown, jumpInterval}

/**
 * Find the patrol min and max x tile coordinates where enemy can safely walk,
 * meaning there's ground (non-space) beneath at (x, y+1)
 */
function findPlatformPatrolBounds(x, y, level) {
  let left = x, right = x;
  // Move left
  for (let lx = x; lx >= 0; lx--) {
    if (
      level[y+1] &&
      level[y+1][lx] !== ' ' &&
      level[y][lx] === ' '
    ) {
      left = lx;
    } else if (lx !== x) {
      break;
    }
  }
  // Move right
  for (let rx = x; rx < level[y].length; rx++) {
    if (
      level[y+1] &&
      level[y+1][rx] !== ' ' &&
      level[y][rx] === ' '
    ) {
      right = rx;
    } else if (rx !== x) {
      break;
    }
  }
  return { left, right };
}

function scanEnemies() {
  enemies = [];
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const char = level[y][x];
      if (char === '1' || char === '2') {
        const { left, right } = findPlatformPatrolBounds(x, y, level);
        enemies.push({
          type: char,
          x: x * tileSize,
          y: y * tileSize,
          px: x,
          py: y,
          dir: 1,
          patrolMin: left * tileSize,
          patrolMax: right * tileSize,
          speed: 1.2,
          vy: 0,
          grounded: false,
          jumpCooldown: 0,
          jumpInterval: 1000 + Math.random() * 1500,
          alive: true
        });
      }
    }
  }
}

function isEnemyGrounded(enemy) {
  const ex = enemy.x;
  const ey = enemy.y;
  const ew = tileSize;
  const eh = tileSize;
  for (let dx of [2, ew - 2]) {
    const tx = Math.floor((ex + dx) / tileSize);
    const ty = Math.floor((ey + eh + 1) / tileSize);
    if (level[ty] && level[ty][tx] && level[ty][tx] !== ' ') return true;
    for (let p of movingPlatforms) {
      let px, py, w, h;
      if (p.vertical) {
        px = (p.aPos.x - 2.5) * tileSize;
        py = p.pos * tileSize;
        w = 6 * tileSize;
        h = tileSize;
      } else {
        px = p.pos * tileSize;
        py = p.aPos.y * tileSize;
        w = p.length * tileSize;
        h = tileSize;
      }
      if (
        ex + dx >= px &&
        ex + dx < px + w &&
        ey + eh + 1 >= py &&
        ey + eh + 1 < py + h
      ) {
        return true;
      }
    }
  }
  return false;
}

function updateEnemies(delta) {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.x += enemy.dir * enemy.speed;
    if (enemy.x < enemy.patrolMin) {
      enemy.x = enemy.patrolMin;
      enemy.dir = 1;
    }
    if (enemy.x > enemy.patrolMax) {
      enemy.x = enemy.patrolMax;
      enemy.dir = -1;
    }

    // Jump physics
    enemy.vy += 0.4;
    enemy.y += enemy.vy;

    if (isEnemyGrounded(enemy)) {
      enemy.y = Math.floor((enemy.y + tileSize) / tileSize) * tileSize - tileSize;
      enemy.vy = 0;
      enemy.grounded = true;
    } else {
      enemy.grounded = false;
    }

    enemy.jumpCooldown += delta;
    if (enemy.grounded && enemy.jumpCooldown > enemy.jumpInterval) {
      if (enemy.type === '1') {
        enemy.vy = -2;
      } else if (enemy.type === '2') {
        enemy.vy = -4;
      }
      enemy.jumpCooldown = 0;
      enemy.jumpInterval = 800 + Math.random() * 2200;
    }
  }
}

function drawEnemies() {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;
    ctx.fillStyle = tileColors[enemy.type] || "#000";
    ctx.fillRect(enemy.x - cameraX, enemy.y - cameraY, tileSize, tileSize);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(enemy.type === '1' ? "S" : "D", enemy.x - cameraX + tileSize/2, enemy.y - cameraY + tileSize/2);
  }
}

// === MOVING PLATFORM SYSTEM ===
const platformIDs = 'abcdefghij'.split('');
const endpointAChar = id => id + 'A';
const endpointBChar = id => id + 'B';
let movingPlatforms = [];

function scanMovingPlatforms() {
  movingPlatforms = [];
  for (let id of platformIDs) {
    let aPos = null, bPos = null, length = 0, vertical = false;
    for (let y = 0; y < level.length; y++) {
      for (let x = 0; x < level[y].length; x++) {
        if (level[y].substr(x, 2) === endpointAChar(id)) aPos = {x, y};
        if (level[y].substr(x, 2) === endpointBChar(id)) bPos = {x, y};
      }
    }
    if (!aPos || !bPos) continue;
    vertical = (aPos.x === bPos.x);

    if (vertical) {
      length = 1;
    } else {
      let minX = Math.min(aPos.x, bPos.x);
      let maxX = Math.max(aPos.x, bPos.x);
      length = 0;
      for (let x = minX + 1; x < maxX; x++) {
        if (level[aPos.y][x] === id) length++;
      }
      if (length === 0) length = 1;
    }
    movingPlatforms.push({
      id,
      vertical,
      aPos, bPos,
      length,
      t: 0,
      timer: 0,
      direction: 1,
      pos: vertical ? aPos.y+1 : aPos.x+2,
      lastPos: vertical ? aPos.y+1 : aPos.x+2
    });
  }
}

function updateMovingPlatforms(delta) {
  for (let p of movingPlatforms) {
    p.lastPos = p.pos;
    const waitTime = 3000, moveTime = 5000;
    if (p.t === 0) {
      p.timer += delta;
      p.pos = p.vertical ? p.aPos.y+1 : p.aPos.x+2;
      if (p.timer >= waitTime) { p.direction = 1; p.timer = 0; p.t = 0.0001; }
    } else if (p.t === 1) {
      p.timer += delta;
      p.pos = p.vertical ? p.bPos.y-p.length : p.bPos.x-p.length;
      if (p.timer >= waitTime) { p.direction = -1; p.timer = 0; p.t = 0.9999; }
    } else {
      let progress = (delta / moveTime) * p.direction;
      p.t += progress;
      if (p.t >= 1) { p.t = 1; p.timer = 0; }
      else if (p.t <= 0) { p.t = 0; p.timer = 0; }
      if (p.vertical)
        p.pos = (1-p.t)*(p.aPos.y+1) + p.t*(p.bPos.y-p.length);
      else
        p.pos = (1-p.t)*(p.aPos.x+2) + p.t*(p.bPos.x-p.length);
    }
  }
}

// === SPINNING PLATFORM SYSTEM ===
let spinningState = {
  time: 0,
  flipping: false,
  flipAngle: 0
};
let fallingThroughSpin = false;
let fallingThroughAnyPlatform = false;
let fallingThroughUntilY = null;

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
        fallingThroughSpin = false;
        fallingThroughAnyPlatform = false;
        fallingThroughUntilY = null;
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
  scanMovingPlatforms();
  scanEnemies();
  spinningState = { time: 0, flipping: false, flipAngle: 0 };
  fallingThroughSpin = false;
  fallingThroughAnyPlatform = false;
  fallingThroughUntilY = null;
}

resetPlayerToStart();
scanCoins();
scanMovingPlatforms();
scanEnemies();

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
    if (isPlayerOnAnySpinningPlatform(player.x, player.y + player.height + 1)) {
      fallingThroughSpin = true;
    }
  }
  if (spinningState.flipping) {
    spinningState.flipAngle += Math.PI / 30;
    if (spinningState.flipAngle >= Math.PI) {
      spinningState.flipping = false;
      spinningState.flipAngle = 0;
      spinningState.time = 0;
    }
  }
}

function isSpinningPlatformSolid() {
  return !spinningState.flipping && !fallingThroughSpin;
}

function checkCollision(x, y) {
  if (fallingThroughAnyPlatform) {
    if (y + player.height < fallingThroughUntilY) {
      return false;
    } else {
      fallingThroughAnyPlatform = false;
    }
  }

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
    for (let p of movingPlatforms) {
      let px, py, w, h;
      if (p.vertical) {
        px = (p.aPos.x - 2.5) * tileSize;
        py = p.pos * tileSize;
        w = 6 * tileSize;
        h = tileSize;
      } else {
        px = p.pos * tileSize;
        py = p.aPos.y * tileSize;
        w = p.length * tileSize; h = tileSize;
      }
      if (
        cx >= px && cx < px + w &&
        cy >= py && cy < py + h
      ) {
        return true;
      }
    }
  }
  return false;
}

// --- PLATFORM RIDING HELPERS ---
let microJumpActive = false;

function getPlayerStandingPlatform() {
  for (let p of movingPlatforms) {
    let px, py, w, h;
    if (p.vertical) {
      px = (p.aPos.x - 2.5) * tileSize;
      py = p.pos * tileSize;
      w = 6 * tileSize;
      h = tileSize;
      const platformTop = py;
      if (
        player.x + player.width > px &&
        player.x < px + w &&
        Math.abs((player.y + player.height) - platformTop) < 4
      ) {
        return {p, px, py, w, h, vertical: true, platformTop};
      }
    } else {
      px = p.pos * tileSize;
      py = p.aPos.y * tileSize;
      w = p.length * tileSize;
      h = tileSize;
      const platformTop = py;
      if (
        player.x + player.width > px &&
        player.x < px + w &&
        Math.abs((player.y + player.height) - platformTop) < 4
      ) {
        return {p, px, py, w, h, vertical: false, platformTop};
      }
    }
  }
  return null;
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw &&
         ax + aw > bx &&
         ay < by + bh &&
         ay + ah > by;
}

function updatePlayer() {
  player.dx = 0;
  if (keys.left) player.dx = -player.speed;
  if (keys.right) player.dx = player.speed;

  player.dy += 0.4;

  player.x += player.dx;
  if (checkCollision(player.x, player.y)) player.x -= player.dx;

  player.y += player.dy;
  let collided = checkCollision(player.x, player.y);

  if (collided) {
    player.y -= player.dy;
    if (player.dy > 0) player.grounded = true;
    player.dy = 0;
  } else {
    player.grounded = false;
  }

  let riding = getPlayerStandingPlatform();
  if (riding) {
    let {p, px, py, w, h, vertical, platformTop} = riding;
    let delta;
    if (vertical) {
      delta = (p.pos - p.lastPos) * tileSize;
      player.y += delta;
    } else {
      delta = (p.pos - p.lastPos) * tileSize;
      player.x += delta;
    }
    let pressingMovement = !player.grounded;
    if (!pressingMovement) {
      player.y = platformTop - player.height;
      player.dy = 0;
      player.grounded = true;
      if ((keys.left || keys.right) && !keys.jump && !microJumpActive) {
        player.dy = -3.5;
        player.grounded = false;
        microJumpActive = true;
      }
    } else {
      microJumpActive = false;
    }
  } else {
    microJumpActive = false;
  }

  if (fallingThroughSpin) {
    if (!isPlayerOnAnySpinningPlatform(player.x, player.y + player.height / 2)) {
      fallingThroughSpin = false;
    }
  }

  collectCoin(coins, '$', () => { player.coinCount++; });
  collectCoin(scamCoins, 'x', () => {
    if (player.coinCount > 0) {
      player.coinCount -= Math.floor(Math.random() * player.coinCount) + 1;
      if (player.coinCount < 0) player.coinCount = 0;
    }
  });

  checkFinish();
}

// --- Player/Enemy collision physics ---
function handlePlayerEnemyCollision() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (!enemy.alive) continue;
    const ex = enemy.x;
    const ey = enemy.y;
    const ew = tileSize;
    const eh = tileSize;
    const px = player.x;
    const py = player.y;
    const pw = player.width;
    const ph = player.height;

    if (rectsOverlap(px, py, pw, ph, ex, ey, ew, eh)) {
      // Determine if player is coming down on top of enemy
      const playerBottom = py + ph;
      const playerPrevBottom = (py - player.dy) + ph;
      const enemyTop = ey;
      const horizontalOverlap =
        (px + pw > ex + ew * 0.15) && (px < ex + ew - ew * 0.15); // avoid edge triggers

      const topTolerance = 7;
      // Player must be falling downward and main vertical overlap is at enemy's top
      if (
        player.dy > 0 &&
        playerPrevBottom <= enemyTop + topTolerance &&
        playerBottom > enemyTop + topTolerance &&
        horizontalOverlap
      ) {
        // "Enemy kill": bounce and remove enemy
        player.dy = -player.jumpPower * 0.5;
        enemy.alive = false;
        break; // Only one enemy per frame
      }
      // Side or bottom collision: penalize player
      else {
        fallingThroughAnyPlatform = true;
        fallingThroughUntilY = player.y + player.height + 45;
        let lost = Math.floor(player.coinCount * 0.4);
        player.coinCount -= lost;
        if (player.coinCount < 0) player.coinCount = 0;
        break;
      }
    }
  }
}

function isPlayerOnSpinningPlatform(x, y) {
  const tx1 = Math.floor(x / tileSize);
  const tx2 = Math.floor((x + player.width - 1) / tileSize);
  const ty = Math.floor((y + player.height) / tileSize);
  return (
    (level[ty] && (level[ty][tx1] === '@' || level[ty][tx2] === '@')) &&
    !spinningState.flipping
  );
}

function isPlayerOnAnySpinningPlatform(x, y) {
  const tx1 = Math.floor(x / tileSize);
  const tx2 = Math.floor((x + player.width - 1) / tileSize);
  const ty = Math.floor(y / tileSize);
  return (
    (level[ty] && (level[ty][tx1] === '@' || level[ty][tx2] === '@'))
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
  for (let p of movingPlatforms) {
    ctx.fillStyle = tileColors[p.id] || "#0cf";
    if (p.vertical) {
      let px = (p.aPos.x - 2.5) * tileSize - cameraX;
      let py = p.pos * tileSize - cameraY;
      ctx.fillRect(px, py, 6 * tileSize, tileSize);
      ctx.fillStyle = "#0ff";
      ctx.fillRect((p.aPos.x - 2.5) * tileSize - cameraX, p.aPos.y * tileSize - cameraY, 6 * tileSize, tileSize);
      ctx.fillRect((p.bPos.x - 2.5) * tileSize - cameraX, p.bPos.y * tileSize - cameraY, 6 * tileSize, tileSize);
    } else {
      let px = p.pos * tileSize - cameraX;
      let py = p.aPos.y * tileSize - cameraY;
      ctx.fillRect(px, py, p.length * tileSize, tileSize);
      ctx.fillStyle = "#0ff";
      ctx.fillRect(p.aPos.x * tileSize - cameraX, p.aPos.y * tileSize - cameraY, tileSize, tileSize);
      ctx.fillRect(p.bPos.x * tileSize - cameraX, p.bPos.y * tileSize - cameraY, tileSize, tileSize);
    }
  }

  const tilesWide = Math.ceil(canvas.width / tileSize);
  const tilesHigh = Math.ceil(canvas.height / tileSize);
  const startCol = Math.max(0, Math.floor(cameraX / tileSize));
  const endCol = Math.min(level[0].length, startCol + tilesWide + 2);
  const startRow = Math.max(0, Math.floor(cameraY / tileSize));
  const endRow = Math.min(level.length, startRow + tilesHigh + 2);

  for (let y = startRow; y < endRow; y++) {
    let x = startCol;
    while (x < endCol) {
      let char = level[y][x];
      if (
        platformIDs.includes(char) ||
        platformIDs.some(id => level[y].substr(x, 2) === endpointAChar(id) || level[y].substr(x, 2) === endpointBChar(id))
      ) {
        x++;
        continue;
      }
      if (char === '@') {
        let xStart = x;
        while (x < endCol && level[y][x] === '@') x++;
        let xEnd = x - 1;
        let groupLength = xEnd - xStart + 1;
        const centerX = (xStart + xEnd + 1) / 2 * tileSize - cameraX;
        const centerY = y * tileSize + tileSize / 2 - cameraY;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(spinningState.flipping ? spinningState.flipAngle : 0);
        ctx.fillStyle = tileColors['@'];
        ctx.fillRect(
          -(groupLength * tileSize) / 2,
          -tileSize / 2,
          groupLength * tileSize,
          tileSize
        );
        ctx.restore();
      } else if (char !== ' ') {
        const color = tileColors[char] || '#000';
        ctx.fillStyle = color;
        ctx.fillRect(x * tileSize - cameraX, y * tileSize - cameraY, tileSize, tileSize);
        x++;
      } else {
        x++;
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
  updateMovingPlatforms(delta);
  updatePlayer();
  handlePlayerEnemyCollision();
  updateEnemies(delta);
  updateCamera();
  drawLevel();
  drawPlayer();
  drawEnemies();
  updateDebug();
  requestAnimationFrame(gameLoop);
}

gameLoop();
