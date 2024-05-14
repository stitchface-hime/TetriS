import { Playfield } from "@classes/Playfield";
import { PieceId } from "@data/index";
import { Tetromino } from "../Tetromino";
import { I_antiClockwiseWallKickPositionOffsetData, I_clockwiseWallKickPositionOffsetData } from "../Tetromino.wallkick";
import * as Rotation from "./I_Tetromino.rotation";
import { Tuple } from "src/types";
import { HexString } from "src/shaders/types";

/**
 * The I tetromino. Below is its initial state:
 * ```
 * [_][_][_][_]
 * [1][0][2][3]
 * [_][_][_][_]
 * [_][_][_][_]
 * ```
 * Construct a new I tetromino by supplying the coordinates for the block in the cell `[0]`.
 */

export class I_Tetromino extends Tetromino {
    protected static id = PieceId.TETROMINO_I;
    protected static color: HexString = "#009fda";

    constructor(originCoordinates: [x: number, y: number], matrix: Playfield) {
        const [originX, originY] = originCoordinates;

        const blockCoordinates: Tuple<[number, number], 4> = [
            [originX, originY],
            [originX - 1, originY],
            [originX + 1, originY],
            [originX + 2, originY],
        ];

        super(
            blockCoordinates,
            matrix,
            I_Tetromino.color,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            I_clockwiseWallKickPositionOffsetData,
            I_antiClockwiseWallKickPositionOffsetData
        );

        this.coupleBlocks();
    }

    override getId() {
        return I_Tetromino.id;
    }

    protected override coupleBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            switch (i) {
                case 0:
                    this.blocks[i].setCoupledBlocks([this.blocks[1], this.blocks[2]]);
                    break;
                case 1:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
                case 2:
                    this.blocks[i].setCoupledBlocks([this.blocks[0], this.blocks[3]]);
                    break;
                case 3:
                    this.blocks[i].setCoupledBlocks([this.blocks[2]]);
                    break;
            }
        }
    }
}
