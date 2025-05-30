---
to: src/<%= name %>/<%= name %>.rotation.ts
---
import { TetrominoRotationPositionAdjustMap } from "../Tetromino";

/*
Rotations:

R0:
 * ```
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * ```
R1:
 * ```
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * ```
R2:
 * ```
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * ```
R3:
 * ```
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * ```
*/

export const clockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R1
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  // R1 -> R2
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  // R2 -> R3
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  // R3 -> R0
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
];

export const antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap = [
  // R0 -> R3
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  // R1 -> R0
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  // R2 -> R1
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  // R3 -> R2
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
];


