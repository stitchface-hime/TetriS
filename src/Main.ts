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
import {
  S_Twist_AC_1,
  S_Twist_C_1_R1,
  S_Twist_C_1_R3,
  TST,
} from "matrixPatterns";

const matrix = new Matrix(22, 10);
const piece = new T_Tetromino([4, 18], matrix);
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

/* matrix.removeFromMatrix([
  [6, 6],
  [6, 5],
  [6, 4],
  [6, 3],
  [5, 3],
  [4, 3],
  [3, 3],
  [3, 2],
  [3, 1],
  [3, 0],
]); */

piece.moveDown(20);
piece.moveRight(20);
piece.rotateAntiClockwise();
matrix.printMatrix();
matrix.lockActivePiece();

matrix.printMatrix();
matrix.clearRows(0, 3);
matrix.printMatrix();
// Test 3 x 3 bounding box minos
/* const matrix = new Matrix(6, 6);
const piece = new I_Tetromino([1, 1], matrix);
matrix.setActivePiece(piece);

console.log(`
Clockwise
=================
`);
for (let i = 0; i < 4; i++) {
  piece.rotateClockwise();
  matrix.printMatrix();
}

console.log(`
Anticlockwise
=================
`);
for (let i = 0; i < 4; i++) {
  piece.rotateAntiClockwise();
  matrix.printMatrix();
} */
