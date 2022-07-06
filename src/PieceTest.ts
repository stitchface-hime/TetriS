import { Matrix } from "@classes/Matrix";
import { I_Tetromino } from "@classes/Piece/Tetromino/I_Tetromino/I_Tetromino";

// Test 3 x 3 bounding box minos
const matrix = new Matrix(6, 6);
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
}
