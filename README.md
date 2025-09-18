# 2D Platformer Game

A simple level-based 2D platformer designed for mobile devices. Built with HTML5 and JavaScript, this game delivers smooth on-screen controls and intuitive gameplay optimized for touch screens.

## Features

- **2D Platformer Gameplay**: Classic side-scrolling action with jumping, running, and exploration.
- **Level-Based Design**: Progress through levels as difficulty gradually increases.
- **Mobile Compatibility**: Fully responsive controls and layout for touchscreen play.
- **Moving Enemies**: Avoid or outsmart dynamic threats that patrol and chase.
- **Collectables**: Pick up in-game items to boost your score or unlock areas.
- **Progressive Difficulty**: Challenges ramp up as the player advances through levels.

## How to Play

- Use the on-screen **left**, **right**, and **jump** buttons to control your character.
- Reach the **goal tile** to finish each level.
- Avoid enemies and spikes, and collect any special items along the way.

## Level Control Array

This section documents all the symbols used to code the game levels. Each symbol represents a specific element in the game world:

### Basic Terrain
- `#` - **Walls/Solid Blocks** - Solid walls that players and enemies cannot pass through
- `-` - **Platforms** - Solid platforms that can be stood on
- ` ` (space) - **Empty Space** - Open areas where players can move freely
- `@` - **Spinning Platforms** - Special platforms that flip/rotate periodically, can be fallen through when spinning

### Player Elements
- `S` - **Start Point** - Where the player begins the level
- `F` - **Finish/Goal** - The end point that completes the level when reached

### Collectibles
- `$` - **Coins** - Legitimate crypto coins that increase the player's score
- `x` - **Scam Coins** - Fake coins that look like real coins but decrease points when collected

### Enemies
- `1` - **Enemy Type 1** - Yellow moving enemy that patrols platforms
- `2` - **Enemy Type 2** - Red moving enemy that patrols platforms  
- `3` - **Enemy Type 3** - Blue moving enemy that patrols platforms

### Hazards
- `!` - **Spikes/Hazards** - Dangerous white hazards that damage the player

### Interactive Tutorial Elements
- `Q` - **Start Point Info** - Displays tutorial message about starting the level
- `W` - **Coin Info** - Displays tutorial message about collecting coins
- `E` - **Scam Coin Info** - Displays tutorial message about avoiding scam coins
- `R` - **Moving Platform Info** - Displays tutorial message about moving platforms
- `T` - **Spinning Platform Info** - Displays tutorial message about spinning platforms
- `Y` - **Enemy Info** - Displays tutorial message about enemies
- `U` - **End Point Info** - Displays tutorial message about completing levels

### Moving Platforms
Moving platforms use two-character endpoint system with letters and A/B suffixes:
- `aA` and `aB` - **Platform A Endpoints** - Defines start and end points for moving platform A
- `bA` and `bB` - **Platform B Endpoints** - Defines start and end points for moving platform B  
- `cA` and `cB` - **Platform C Endpoints** - Defines start and end points for moving platform C
- (continues through alphabet: `dA`/`dB`, `eA`/`eB`, etc.)

**Note**: The platform will move back and forth between its A and B endpoints. If endpoints are vertically aligned, the platform moves vertically; if horizontally aligned, it moves horizontally.

