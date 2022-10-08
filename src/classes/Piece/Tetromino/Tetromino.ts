import { Block } from "../Block";
import { Piece } from "../Piece";
import {
    WallKickPositionOffsetTestData,
    type RotationBlockPositionAdjust,
} from "../Piece.types";

export type TetrominoRotationPositionAdjust = [
    RotationBlockPositionAdjust,
    RotationBlockPositionAdjust,
    RotationBlockPositionAdjust,
    RotationBlockPositionAdjust
];

export type TetrominoRotationPositionAdjustMap = [
    TetrominoRotationPositionAdjust,
    TetrominoRotationPositionAdjust,
    TetrominoRotationPositionAdjust,
    TetrominoRotationPositionAdjust
];

/**
 * A tetromino is a piece that contains four blocks.
 */
export abstract class Tetromino extends Piece {
    protected override blocks: [Block, Block, Block, Block];
    protected static override color: string;
    protected override readonly clockwiseRotationMap: TetrominoRotationPositionAdjustMap;
    protected override readonly antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap;

    constructor(
        blocks: [Block, Block, Block, Block],
        clockwiseRotationMap: TetrominoRotationPositionAdjustMap,
        antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap,
        clockwiseWallKickOffsetData: WallKickPositionOffsetTestData,
        antiClockwiseWallKickOffsetData: WallKickPositionOffsetTestData
    ) {
        super(
            blocks,
            clockwiseRotationMap,
            antiClockwiseRotationMap,
            clockwiseWallKickOffsetData,
            antiClockwiseWallKickOffsetData
        );
        this.blocks = blocks;
        this.clockwiseRotationMap = clockwiseRotationMap;
        this.antiClockwiseRotationMap = antiClockwiseRotationMap;
    }
}
