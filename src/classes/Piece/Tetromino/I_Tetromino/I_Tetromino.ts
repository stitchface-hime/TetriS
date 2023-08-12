import { Matrix } from "@classes/Matrix";
import { PieceId } from "@data/index";
import { Block } from "../../Block";
import { Tetromino } from "../Tetromino";
import {
    I_antiClockwiseWallKickPositionOffsetData,
    I_clockwiseWallKickPositionOffsetData,
} from "../Tetromino.wallkick";
import * as Rotation from "./I_Tetromino.rotation";

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
    protected static override id = PieceId.TETROMINO_I;
    protected static override color = "#009fda";

    constructor(originCoordinates: [x: number, y: number], matrix: Matrix) {
        const [originX, originY] = originCoordinates;

        const blocks: [Block, Block, Block, Block] = [
            new Block([originX, originY], matrix, I_Tetromino.color), // 0
            new Block([originX - 1, originY], matrix, I_Tetromino.color), // 1
            new Block([originX + 1, originY], matrix, I_Tetromino.color), // 2
            new Block([originX + 2, originY], matrix, I_Tetromino.color), // 3
        ];

        super(
            blocks,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            I_clockwiseWallKickPositionOffsetData,
            I_antiClockwiseWallKickPositionOffsetData
        );

        this.registerBlocks();
        this.coupleBlocks();
    }

    override getId() {
        return I_Tetromino.id;
    }

    protected override coupleBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            switch (i) {
                case 0:
                    this.blocks[i].setCoupledBlocks([
                        this.blocks[1],
                        this.blocks[2],
                    ]);
                    break;
                case 1:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
                case 2:
                    this.blocks[i].setCoupledBlocks([
                        this.blocks[0],
                        this.blocks[3],
                    ]);
                    break;
                case 3:
                    this.blocks[i].setCoupledBlocks([this.blocks[2]]);
                    break;
            }
        }
    }
}
