import { Matrix } from "@classes/Matrix";
import { PieceId } from "@data/index";
import { Block } from "../../Block";
import { Tetromino } from "../Tetromino";
import { J_antiClockwiseWallKickPositionOffsetData, J_clockwiseWallKickPositionOffsetData } from "../Tetromino.wallkick";
import * as Rotation from "./O_Tetromino.rotation";
import { DrawSprite } from "@classes/ShaderProgram";
import { Tuple } from "src/types";
import { HexString } from "src/shaders/types";

/**
 * The O tetromino. Below is its initial state:
 * ```
 * [_][_][_][_]
 * [_][0][1][_]
 * [_][3][2][_]
 * [_][_][_][_]
 * ```
 * Construct a new O tetromino by supplying the coordinates for the block in the cell `[0]`.
 */
export class O_Tetromino extends Tetromino {
    protected static id = PieceId.TETROMINO_O;
    protected static color: HexString = "#fecb00";

    constructor(originCoordinates: [x: number, y: number], renderer: DrawSprite, matrix: Matrix) {
        const [originX, originY] = originCoordinates;

        const blockCoordinates: Tuple<[number, number], 4> = [
            [originX, originY],
            [originX, originY + 1],
            [originX + 1, originY + 1],
            [originX + 1, originY],
        ];

        super(
            blockCoordinates,
            renderer,
            matrix,
            O_Tetromino.color,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            J_clockwiseWallKickPositionOffsetData,
            J_antiClockwiseWallKickPositionOffsetData
        );

        this.registerBlocks();
        this.coupleBlocks();
    }

    override getId() {
        return O_Tetromino.id;
    }

    protected override coupleBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            switch (i) {
                case 0:
                    this.blocks[i].setCoupledBlocks([this.blocks[1], this.blocks[3]]);
                    break;
                case 1:
                    this.blocks[i].setCoupledBlocks([this.blocks[0], this.blocks[2]]);
                    break;
                case 2:
                    this.blocks[i].setCoupledBlocks([this.blocks[1], this.blocks[3]]);
                    break;
                case 3:
                    this.blocks[i].setCoupledBlocks([this.blocks[0], this.blocks[2]]);
                    break;
            }
        }
    }
}
