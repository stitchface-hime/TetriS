import { Playfield } from "@classes/Playfield";
import { PieceId } from "@data/index";
import { Tetromino } from "../Tetromino";
import { J_antiClockwiseWallKickPositionOffsetData, J_clockwiseWallKickPositionOffsetData } from "../Tetromino.wallkick";
import * as Rotation from "./Z_Tetromino.rotation";
import { HexString } from "src/shaders/types";
import { Tuple } from "src/types";

/**
 * The Z tetromino. Below is its initial state:
 * ```
 * [1][2][_]
 * [_][0][3]
 * [_][_][_]
 * ```
 * Construct a new Z tetromino by supplying the coordinates for the block in the cell `[0]`.
 */

export class Z_Tetromino extends Tetromino {
    protected static id = PieceId.TETROMINO_Z;
    protected static color: HexString = "#e92939";

    constructor(originCoordinates: [x: number, y: number], matrix: Playfield) {
        const [originX, originY] = originCoordinates;

        const blockCoordinates: Tuple<[number, number], 4> = [
            [originX, originY],
            [originX - 1, originY + 1],
            [originX, originY + 1],
            [originX + 1, originY],
        ];

        super(
            blockCoordinates,
            matrix,
            Z_Tetromino.color,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            J_clockwiseWallKickPositionOffsetData,
            J_antiClockwiseWallKickPositionOffsetData
        );

        this.coupleBlocks();
    }

    override getId() {
        return Z_Tetromino.id;
    }

    protected override coupleBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            switch (i) {
                case 0:
                    this.blocks[i].setCoupledBlocks([this.blocks[2], this.blocks[3]]);
                    break;
                case 1:
                    this.blocks[i].setCoupledBlocks([this.blocks[2]]);
                    break;
                case 2:
                    this.blocks[i].setCoupledBlocks([this.blocks[1], this.blocks[0]]);
                    break;
                case 3:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
            }
        }
    }
}
