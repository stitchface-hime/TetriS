/** Rotations */

/**
 * The position adjustment for a block as it rotates.
 */
export type RotationBlockPositionAdjust = [xAdjust: number, yAdjust: number];
/**
 * This is a tuple containing four `RotationBlockPositionAdjust[]`.
 * Each element in this tuple represents the position adjustment mapping for a piece
 * when it cycles through its four rotation states.
 *
 * `RotationBlockPositionAdjust[]` is an array containing the
 * position adjustments for each block in the piece when the piece rotates.
 */
export type RotationPositionAdjustMap = [
    RotationBlockPositionAdjust[],
    RotationBlockPositionAdjust[],
    RotationBlockPositionAdjust[],
    RotationBlockPositionAdjust[]
];

/** Wallkicks */

/**
 * When a piece rotates it will test out different translations of a piece until it fits somewhere.
 */
export type WallKickPositionOffset = [x: number, y: number];

/**
 * A piece will test 5 different positions after rotation.
 */
export type WallKickPositionOffsetTest = [
    WallKickPositionOffset,
    WallKickPositionOffset,
    WallKickPositionOffset,
    WallKickPositionOffset,
    WallKickPositionOffset
];

/**
 * This contains the tests for each of the four rotations.
 */
export type WallKickPositionOffsetTestData = [WallKickPositionOffsetTest, WallKickPositionOffsetTest, WallKickPositionOffsetTest, WallKickPositionOffsetTest];

export type TechnicalMove = "mini" | "full" | null;
