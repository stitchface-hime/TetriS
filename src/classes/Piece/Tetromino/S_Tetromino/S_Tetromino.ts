import { Matrix } from "@classes/Matrix";
import { PieceId } from "@data/index";
import { Block } from "../../Block";
import { Tetromino } from "../Tetromino";
import { J_antiClockwiseWallKickPositionOffsetData, J_clockwiseWallKickPositionOffsetData } from "../Tetromino.wallkick";
import * as Rotation from "./S_Tetromino.rotation";
import { HexString } from "src/shaders/types";
import { generateBlocks } from "@classes/Piece/Piece.helpers";
import { DrawSprite } from "@classes/ShaderProgram";
import { Tuple } from "src/types";

/**
 * The ? tetromino. Below is its initial state:
 * ```
 * [_][2][3]
 * [1][0][_]
 * [_][_][_]
 * ```
 * Construct a new ? tetromino by supplying the coordinates for the block in the cell `[0]`.
 */

export class S_Tetromino extends Tetromino {
    protected static id = PieceId.TETROMINO_S;
    protected static color: HexString = "#60b21c";

    constructor(originCoordinates: [x: number, y: number], renderer: DrawSprite, matrix: Matrix) {
        const [originX, originY] = originCoordinates;

        const blockCoordinates: Tuple<[number, number], 4> = [
            [originX, originY],
            [originX - 1, originY],
            [originX, originY + 1],
            [originX + 1, originY + 1],
        ];

        super(
            blockCoordinates,
            renderer,
            matrix,
            S_Tetromino.color,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            J_clockwiseWallKickPositionOffsetData,
            J_antiClockwiseWallKickPositionOffsetData
        );

        this.registerBlocks();
        this.coupleBlocks();
    }

    override getId() {
        return S_Tetromino.id;
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
