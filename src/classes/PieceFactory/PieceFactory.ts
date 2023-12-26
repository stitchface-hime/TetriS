import { Matrix } from "@classes/Matrix";
import { I_Tetromino, J_Tetromino, L_Tetromino, O_Tetromino, S_Tetromino, T_Tetromino, Z_Tetromino } from "@classes/Piece/Tetromino";
import { DrawSprite } from "@classes/ShaderProgram";
import { PieceId } from "@data/index";

const pieceLookUp = {
    [PieceId.TETROMINO_I]: I_Tetromino,
    [PieceId.TETROMINO_J]: J_Tetromino,
    [PieceId.TETROMINO_L]: L_Tetromino,
    [PieceId.TETROMINO_O]: O_Tetromino,
    [PieceId.TETROMINO_S]: S_Tetromino,
    [PieceId.TETROMINO_T]: T_Tetromino,
    [PieceId.TETROMINO_Z]: Z_Tetromino,
};

export class PieceFactory {
    /**
     * Creates a piece using its piece id in the supplied matrix at specific coordinates.
     */
    makePiece(originCoordinates: [x: number, y: number], matrix: Matrix, renderer: DrawSprite, id?: PieceId) {
        if (id === undefined) {
            return null;
        }

        return new pieceLookUp[id](originCoordinates, renderer, matrix);
    }
}
