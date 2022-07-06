import { Matrix } from "@classes/Matrix";
import {
  L_Tetromino,
  S_Tetromino,
  T_Tetromino,
  J_Tetromino,
  Z_Tetromino,
  I_Tetromino,
  O_Tetromino,
} from "@classes/Piece/Tetromino";
import { Bag, PieceQueue } from "@classes/PieceQueue";
import {
  S_Twist_AC_1,
  S_Twist_C_1_R1,
  S_Twist_C_1_R3,
  TST,
} from "matrixPatterns";
import { randomizeArray } from "./utils";

const matrix = new Matrix(22, 10);
const piece = new L_Tetromino([5, 19], matrix);
matrix.setActivePiece(piece);

matrix.addBlockRows(4);
matrix.removeBlocks([
  [5, 3],
  [5, 2],
  [4, 2],
  [3, 2],
  [3, 1],
  [3, 0],
  [4, 0],
]);

piece.rotateAntiClockwise();
piece.moveDown(piece.getHardDropUnits());
piece.rotateClockwise();
piece.rotateClockwise();

matrix.printMatrix();
matrix.lockActivePiece();

const rowsOccupiedByPiece = new Set(
  piece.getBlocksCoordinates().map((coordinate) => coordinate[1])
);
const rowsContainingLines = [...rowsOccupiedByPiece]
  .filter((row) => matrix.rowFormsLine(row))
  .sort()
  .reverse();

rowsContainingLines.forEach((row) => {
  matrix.clearRows(row);
  matrix.shiftRowsDown(row, 1);
});

matrix.printMatrix();

/*const piece = new T_Tetromino([4, 18], matrix);
matrix.setActivePiece(piece);



matrix.addBlockRows(3);
matrix.addBlocks([
  [7, 3],
  [7, 4],
  [6, 4],
]);
matrix.removeBlocks([
  [6, 2],
  [6, 1],
  [6, 0],
  [5, 1],
]);

piece.moveDown(20);
piece.moveRight(20);
piece.rotateAntiClockwise();
matrix.printMatrix();
matrix.lockActivePiece();

matrix.printMatrix();

// identify rows to clear
const rowsOccupiedByPiece = new Set(
  piece.getBlocksCoordinates().map((coordinate) => coordinate[1])
);
const rowsContainingLines = [...rowsOccupiedByPiece]
  .filter((row) => matrix.rowFormsLine(row))
  .sort()
  .reverse();

console.log("Clear rows:", rowsContainingLines);
rowsContainingLines.forEach((row) => {
  matrix.clearRows(row);
  matrix.shiftRowsDown(row, 1);
  matrix.printMatrix();
});

// matrix.clearRows(0, 3);
matrix.printMatrix(); */
