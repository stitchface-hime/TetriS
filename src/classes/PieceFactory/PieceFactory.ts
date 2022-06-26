import { Matrix } from "@classes/Matrix";
import {
  I_Tetromino,
  J_Tetromino,
  L_Tetromino,
  O_Tetromino,
  S_Tetromino,
  T_Tetromino,
  Z_Tetromino,
} from "@classes/Piece/Tetromino";
import { PieceId } from "./PieceId";

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
  makePiece(
    id: PieceId,
    originCoordinates: [x: number, y: number],
    matrix: Matrix
  ) {
    return new pieceLookUp[id](originCoordinates, matrix);
  }
}
