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

This section describes the symbols used to code the game levels. Each character represents a different element:

### Basic Elements
- `#` - **Wall/Platform**: Solid blocks that players and enemies can't pass through
- ` ` (space) - **Empty Air**: Empty space where players can move freely
- `-` - **Wood Platform**: Decorative wooden platform
- `!` - **White Tile**: Special white decorative tile

### Player & Objectives  
- `S` - **Start Point**: Where the player spawns at the beginning of the level
- `F` - **Finish Point**: Goal tile to complete the level
- `$` - **Coin**: Collectible legitimate crypto coins for points
- `x` - **Scam Coin**: Fake coins that reduce points - avoid these!

### Enemies
- `1` - **Enemy Type 1**: Yellow enemy that moves horizontally
- `2` - **Enemy Type 2**: Red enemy that moves horizontally  
- `3` - **Enemy Type 3**: Blue enemy that moves horizontally

### Moving Platforms
- `@` - **Spinning Platform**: Purple platform that flips periodically
- `a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j` - **Moving Platform IDs**: Moving platforms between endpoints
- `aA`, `bA`, `cA`, etc. - **Platform A Endpoints**: Starting position for moving platforms
- `aB`, `bB`, `cB`, etc. - **Platform B Endpoints**: Ending position for moving platforms

### Tutorial Triggers (Help System)
- `Q` - **Start Point Tutorial**: Explains player start position
- `W` - **Coin Tutorial**: Explains legitimate coin collection
- `E` - **Scam Coin Tutorial**: Warns about fake coins  
- `R` - **Moving Platform Tutorial**: Explains moving platform mechanics
- `T` - **Spinning Platform Tutorial**: Explains spinning platform mechanics
- `Y` - **Enemy Tutorial**: Explains enemy behavior and defeat mechanics
- `U` - **End Point Tutorial**: Explains level completion

### Usage Examples
```
##############################
#                            #
#  S           $          F  #
#         ##########         #
#    1         @         2   #
# aA        bBbbbbb       aB #
##############################
```

This example level shows:
- Walls (`#`) forming the level boundary
- Start point (`S`) and finish point (`F`)
- A coin (`$`) to collect
- Two enemies (`1` and `2`)
- A spinning platform (`@`)
- A moving platform system (`aA`, `bB`, `aB`)

