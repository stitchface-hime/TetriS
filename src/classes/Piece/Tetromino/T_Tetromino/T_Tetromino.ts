import { Playfield } from "@classes/Playfield";
import { PieceId } from "@data/index";
import { Tetromino } from "../Tetromino";
import { J_antiClockwiseWallKickPositionOffsetData, J_clockwiseWallKickPositionOffsetData } from "../Tetromino.wallkick";
import * as Rotation from "./T_Tetromino.rotation";
import { HexString } from "src/shaders/types";
import { Tuple } from "src/types";

/**
 * The T tetromino. Below is its initial state:
 * ```
 * [_][2][_]
 * [1][0][3]
 * [_][_][_]
 * ```
 * Construct a new T tetromino by supplying the coordinates for the block in the cell `[0]`.
 */

export class T_Tetromino extends Tetromino {
    protected static id = PieceId.TETROMINO_T;
    protected static color: HexString = "#952d98";

    constructor(originCoordinates: [x: number, y: number], matrix: Playfield) {
        const [originX, originY] = originCoordinates;

        const blockCoordinates: Tuple<[number, number], 4> = [
            [originX, originY],
            [originX - 1, originY],
            [originX, originY + 1],
            [originX + 1, originY],
        ];

        super(
            blockCoordinates,
            matrix,
            T_Tetromino.color,
            Rotation.clockwiseRotationMap,
            Rotation.antiClockwiseRotationMap,
            J_clockwiseWallKickPositionOffsetData,
            J_antiClockwiseWallKickPositionOffsetData
        );

        this.coupleBlocks();
    }

    override getId() {
        return T_Tetromino.id;
    }

    protected override coupleBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            switch (i) {
                case 0:
                    this.blocks[i].setCoupledBlocks([this.blocks[1], this.blocks[2], this.blocks[3]]);
                    break;
                case 1:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
                case 2:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
                case 3:
                    this.blocks[i].setCoupledBlocks([this.blocks[0]]);
                    break;
            }
        }
    }

    override technicalMoveCheck(wallKicked: boolean) {
        const [baseX, baseY] = this.blocks[0].getActiveCoordinates();
        let numTargetsOccupied = 0;
        const requiredTargetsOccupied = 3;

        const targetCoordinates: Tuple<number, 2>[] = [
            [baseX - 1, baseY - 1],
            [baseX - 1, baseY + 1],
            [baseX + 1, baseY - 1],
            [baseX + 1, baseY + 1],
        ];

        targetCoordinates.forEach((targetCoordinatesEntry) => {
            if (this.matrix.hasBlockAt(targetCoordinatesEntry)) {
                numTargetsOccupied += 1;
            }
        });

        if (numTargetsOccupied < requiredTargetsOccupied) {
            this.prevMoveTechnical = null;
            return;
        }

        this.prevMoveTechnical = wallKicked ? "mini" : "full";
    }
}
