import { Matrix } from "@classes/Matrix";
import { O_Tetromino } from "@classes/Piece/Tetromino";
import { I_Tetromino } from "@classes/Piece/Tetromino/I_Tetromino/I_Tetromino";

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

// Test 3 x 3 bounding box minos
const matrix = new Matrix(21, 10);
const piece = new O_Tetromino([4, 19], matrix);
matrix.setActivePiece(piece);

console.log(`
Clockwise
=================
`);
for (let i = 0; i < 4; i++) {
  piece.rotateClockwise();
  matrix.printMatrix(false, true);
}

console.log(`
Anticlockwise
=================
`);
for (let i = 0; i < 4; i++) {
  piece.rotateAntiClockwise();
  matrix.printMatrix(false, true);
}
