import { Matrix } from "@classes/Matrix";
import { T_Tetromino } from "@classes/Piece/Tetromino";
import { TST } from "matrixPatterns";

const matrix = new Matrix(22, 10);
const piece = new T_Tetromino([4, 18], matrix);
matrix.setActivePiece(piece);
// TST set up
matrix.fillMatrix(TST);

piece.rotateAntiClockwise();
piece.rotateClockwise();
matrix.printMatrix();

/* console.log(piece.rotateAntiClockwise()); // 3
console.log(piece.rotateAntiClockwise()); // 2
console.log(piece.rotateAntiClockwise()); // 1
console.log(piece.rotateAntiClockwise()); // 0
console.log(piece.rotateClockwise()); // 1
console.log(piece.rotateClockwise()); // 2
console.log(piece.rotateClockwise()); // 3
console.log(piece.rotateClockwise()); // 0 */
