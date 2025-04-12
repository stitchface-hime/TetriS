Small side-project I had been working on a while ago to learn and experiment with WebGL. It's the block puzzle game everyone is familiar with coded up using TS and WebGL.
A working version is available on the `master` branch, pull it then follow the steps below.

## Set-up
Run the development server to get started:

```bash
npm run dev
# or
yarn dev
```

Hit the `Start` button to play. On game over, refresh the page.

## How to play
`W` - Hard drop
`A`, `D` - Move left, right
`S` - Soft drop
`J` - Rotate clockwise
`B` - Rotate anticlockwise
`Q` - Hold

Rotation system is based on the Super Rotation System used in most modern implementation of the game, so T-Spin manoeuvers are possible.
NOTE: Whilst the game doesn't show it due to this being WIP, score, level and combos are calculated in the background. Clear 10 lines to level up. Level and speed caps at level 15.

![image](https://github.com/user-attachments/assets/2ebc94c7-7794-43e9-aacc-2cd8ded9afa3)
