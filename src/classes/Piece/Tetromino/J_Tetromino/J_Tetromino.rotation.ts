import { TetrominoRotationPositionAdjustMap } from "../Tetromino";

/*
Rotations:

R0:
 * ```
 * [2][_][_]
 * [1][0][3]
 * [_][_][_]
 * ```
R1:
 * ```
 * [_][1][2]
 * [_][0][_]
 * [_][3][_]
 * ```
R2:
 * ```
 * [_][_][_]
 * [3][0][1]
 * [_][_][2]
 * ```
R3:
 * ```
 * [_][3][_]
 * [_][0][_]
 * [2][1][_]
 * ```
*/

export const clockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R1
  [
    [0, 0],
    [1, 1],
    [2, 0],
    [-1, -1],
  ],
  // R1 -> R2
  [
    [0, 0],
    [1, -1],
    [0, -2],
    [-1, 1],
  ],
  // R2 -> R3
  [
    [0, 0],
    [-1, -1],
    [-2, 0],
    [1, 1],
  ],
  // R3 -> R0
  [
    [0, 0],
    [-1, 1],
    [0, 2],
    [1, -1],
  ],
];

export const antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R3
  [
    [0, 0],
    [1, -1],
    [0, -2],
    [-1, 1],
  ],
  // R1 -> R0
  [
    [0, 0],
    [-1, -1],
    [-2, 0],
    [1, 1],
  ],
  // R2 -> R1
  [
    [0, 0],
    [-1, 1],
    [0, 2],
    [1, -1],
  ],
  // R3 -> R2
  [
    [0, 0],
    [1, 1],
    [2, 0],
    [-1, -1],
  ],
];
