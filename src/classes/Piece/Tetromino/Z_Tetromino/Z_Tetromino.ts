import { Matrix } from "@classes/Matrix";
import { PieceId } from "@data/index";
import { Block } from "../../Block";
import { Tetromino } from "../Tetromino";
import {
    J_antiClockwiseWallKickPositionOffsetData,
    J_clockwiseWallKickPositionOffsetData,
} from "../Tetromino.wallkick";
import * as Rotation from "./Z_Tetromino.rotation";

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
    protected static override color = "#e92939";

    constructor(originCoordinates: [x: number, y: number], matrix: Matrix) {
        const [originX, originY] = originCoordinates;

        const blocks: [Block, Block, Block, Block] = [
            new Block([originX, originY], matrix, Z_Tetromino.color), // 0
            new Block([originX - 1, originY + 1], matrix, Z_Tetromino.color), // 1
            new Block([originX, originY + 1], matrix, Z_Tetromino.color), // 2
            new Block([originX + 1, originY], matrix, Z_Tetromino.color), // 3
        ];

        super(
            blocks,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            J_clockwiseWallKickPositionOffsetData,
            J_antiClockwiseWallKickPositionOffsetData
        );

        this.registerBlocks();
        this.coupleBlocks();
    }

    override getId() {
        return Z_Tetromino.id;
    }

    protected override coupleBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            switch (i) {
                case 0:
                    this.blocks[i].setCoupledBlocks([
                        this.blocks[2],
                        this.blocks[3],
                    ]);
                    break;
                case 1:
                    this.blocks[i].setCoupledBlocks([this.blocks[2]]);
                    break;
                case 2:
                    this.blocks[i].setCoupledBlocks([
                        this.blocks[1],
                        this.blocks[0],
                    ]);
                    break;
                case 3:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
            }
        }
    }
}
