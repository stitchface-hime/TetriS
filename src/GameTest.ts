import { Game } from "@classes/Game/Game";
import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";

const game = new Game(20, 10, new Bag([0, 1, 2, 3, 4, 5, 6]), [4, 19]);

console.log(game.getNextQueue(5));
game.getMatrix().addBlockRows(10);
game.getMatrix().printMatrix(true, true);
