import { Tuple } from "src/types";
import { Block } from "../Block";
import { Piece } from "../Piece";
import { WallKickPositionOffsetTestData, type RotationBlockPositionAdjust } from "../Piece.types";
import { HexString } from "src/shaders/types";
import { Matrix } from "@classes/Matrix";
import { DrawSprite } from "@classes/ShaderProgram";
import { SpriteLoader } from "@classes/SpriteLoader";
import { generateBlocks } from "../Piece.helpers";

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
    protected override blocks: Tuple<Block, 4>;
    protected override readonly clockwiseRotationMap: TetrominoRotationPositionAdjustMap;
    protected override readonly antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap;

    constructor(
        coordinatesList: Tuple<[number, number], 4>,
        renderer: DrawSprite,
        matrix: Matrix,
        color: HexString,
        clockwiseRotationMap: TetrominoRotationPositionAdjustMap,
        antiClockwiseRotationMap: TetrominoRotationPositionAdjustMap,
        clockwiseWallKickOffsetData: WallKickPositionOffsetTestData,
        antiClockwiseWallKickOffsetData: WallKickPositionOffsetTestData
    ) {
        const blocks = generateBlocks(coordinatesList, renderer, matrix, color) as Tuple<Block, 4>;

        super(blocks, clockwiseRotationMap, antiClockwiseRotationMap, clockwiseWallKickOffsetData, antiClockwiseWallKickOffsetData);

        this.blocks = blocks;
        this.clockwiseRotationMap = clockwiseRotationMap;
        this.antiClockwiseRotationMap = antiClockwiseRotationMap;
    }

    getBlocks(): Tuple<Block, 4> {
        return this.blocks;
    }
}
