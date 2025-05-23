import { TetrominoRotationPositionAdjustMap } from "../Tetromino";

/*
Rotations:

R0:
 * ```
 * [_][_][3]
 * [1][0][2]
 * [_][_][_]
 * ```
R1:
 * ```
 * [_][1][_]
 * [_][0][_]
 * [_][2][3]
 * ```
R2:
 * ```
 * [_][_][_]
 * [2][0][1]
 * [3][_][_]
 * ```
R3:
 * ```
 * [3][2][_]
 * [_][0][_]
 * [_][1][_]
 * ```
*/

export const clockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R1
  [
    [0, 0],
    [1, 1],
    [-1, -1],
    [0, -2],
  ],
  // R1 -> R2
  [
    [0, 0],
    [1, -1],
    [-1, 1],
    [-2, 0],
  ],
  // R2 -> R3
  [
    [0, 0],
    [-1, -1],
    [1, 1],
    [0, 2],
  ],
  // R3 -> R0
  [
    [0, 0],
    [-1, 1],
    [1, -1],
    [2, 0],
  ],
];

export const antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R3
  [
    [0, 0],
    [1, -1],
    [-1, 1],
    [-2, 0],
  ],
  // R1 -> R0
  [
    [0, 0],
    [-1, -1],
    [1, 1],
    [0, 2],
  ],
  // R2 -> R1
  [
    [0, 0],
    [-1, 1],
    [1, -1],
    [2, 0],
  ],
  // R3 -> R2
  [
    [0, 0],
    [1, 1],
    [-1, -1],
    [0, -2],
  ],
];
