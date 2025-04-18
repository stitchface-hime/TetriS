import { TetrominoRotationPositionAdjustMap } from "../Tetromino";

/*
Rotations:
R0:
 * ```
 * [_][_][_][_]
 * [_][1][2][_]
 * [_][0][3][_]
 * [_][_][_][_]
 * ```
R1:
 * ```
 * [_][_][_][_]
 * [_][0][1][_]
 * [_][3][2][_]
 * [_][_][_][_]
 * ```
R2:
 * ```
 * [_][_][_][_]
 * [_][3][0][_]
 * [_][2][1][_]
 * [_][_][_][_]
 * ```
R3:
 * ```
 * [_][_][_][_]
 * [_][2][3][_]
 * [_][1][0][_]
 * [_][_][_][_]
 * ```
*/

export const clockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R1
  [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ],
  // R1 -> R2
  [
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ],
  // R2 -> R3
  [
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 0],
  ],
  // R3 -> R0
  [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ],
];

export const antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R3
  [
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ],
  // R1 -> R0
  [
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 0],
  ],
  // R2 -> R1
  [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ],
  // R3 -> R2
  [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ],
];
