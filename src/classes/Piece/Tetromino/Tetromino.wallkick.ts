import { type WallKickPositionOffsetTestData } from "../Piece.types";

/**
 * Clockwise wall kick position offset data for J, L, S, T, Z tetrominoes.
 */
export const J_clockwiseWallKickPositionOffsetData: WallKickPositionOffsetTestData =
  [
    // R0 -> R1
    [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    // R1 -> R2
    [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    // R2 -> R3
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    // R3 -> R0
    [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
  ];

/**
 * Anticlockwise wall kick position offset data for J, L, S, T, Z tetrominoes.
 */
export const J_antiClockwiseWallKickPositionOffsetData: WallKickPositionOffsetTestData =
  [
    // R0 -> R3
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    // R1 -> R0
    [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    // R2 -> R1
    [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    // R3 -> R2
    [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
  ];

/**
 * Clockwise wall kick position offset data for I tetromino.
 */
export const I_clockwiseWallKickPositionOffsetData: WallKickPositionOffsetTestData =
  [
    // R0 -> R1
    [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    // R1 -> R2
    [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    // R2 -> R3
    [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    // R3 -> R0
    [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
  ];

/**
 * Anticlockwise wall kick position offset data for I tetromino.
 */
export const I_antiClockwiseWallKickPositionOffsetData: WallKickPositionOffsetTestData =
  [
    // R0 -> R3
    [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    // R1 -> R0
    [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    // R2 -> R1
    [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    // R3 -> R2
    [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
  ];
