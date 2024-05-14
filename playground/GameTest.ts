import { Game } from "@classes/Game/Game";
import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";

const game = new Game(20, 10, new Bag([PieceId.TETROMINO_T]), [4, 19]);

console.log(game.getNextQueue(5));
game.getMatrix().addBlockRows(10);
game.getMatrix().removeBlocks([
  [3, 9],
  [4, 9],
  [5, 9],
  [4, 8],
  // [5, 8],
  [5, 7],
  [5, 6],
  [5, 5],
  [5, 4],
  [5, 3],
  [5, 2],
  [5, 1],
  [5, 0],
]);
game.tick();
game.getMatrix().printMatrix(true, true);

game.rotateClockwise();
game.rotateClockwise();
game.hardDrop();

game.getMatrix().printMatrix(false, true);

/* for (let i = 0; i < 22; i++) {
  console.log("Spawn");
  game.tick();
  game.getMatrix().printMatrix(true, true);

  console.log("hard");
  game.hardDrop();
  game.getMatrix().printMatrix(true, true);
} */
