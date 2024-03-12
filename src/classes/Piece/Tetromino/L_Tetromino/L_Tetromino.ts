import { Matrix } from "@classes/Matrix";
import { PieceId } from "@data/index";
import { Tetromino } from "../Tetromino";
import { J_antiClockwiseWallKickPositionOffsetData, J_clockwiseWallKickPositionOffsetData } from "../Tetromino.wallkick";
import * as Rotation from "./L_Tetromino.rotation";
import { HexString } from "src/shaders/types";
import { Tuple } from "src/types";

/**
 * The L tetromino. Below is its initial state:
 * ```
 * [_][_][3]
 * [1][0][2]
 * [_][_][_]
 * ```
 * Construct a new L tetromino by supplying the coordinates for the block in the cell `[0]`.
 */

export class L_Tetromino extends Tetromino {
    protected static id = PieceId.TETROMINO_L;
    protected static color: HexString = "#ff7900";

    constructor(originCoordinates: [x: number, y: number], matrix: Matrix) {
        const [originX, originY] = originCoordinates;

        const blockCoordinates: Tuple<[number, number], 4> = [
            [originX, originY],
            [originX - 1, originY],
            [originX + 1, originY],
            [originX + 1, originY + 1],
        ];

        super(
            blockCoordinates,
            matrix,
            L_Tetromino.color,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            J_clockwiseWallKickPositionOffsetData,
            J_antiClockwiseWallKickPositionOffsetData
        );

        this.registerBlocks();
        this.coupleBlocks();
    }

    override getId() {
        return L_Tetromino.id;
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
