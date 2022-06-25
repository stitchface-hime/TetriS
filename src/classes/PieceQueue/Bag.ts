import { Piece } from "@classes/Piece";
import { randomizeArray } from "@utils/index";
import { PieceQueue } from "./PieceQueue";

/**
 * A 'bag' is a type of queue that contains one of each `n` possible pieces
 * in a random order.
 *
 * The pieces in the 'bag' will then be pulled out individually until there are no more pieces.
 * When the bag is empty, pieces will then be pulled out of a new bag and the process repeats.
 */
export class Bag extends PieceQueue {
  /**
   * When the next piece is taken from the queue,
   * the next piece from the reserve bag will be added to the end of the queue.
   *
   * When the reserve bag is emptied it should be refilled.
   */
  private reserveBag: Piece[];

  constructor(possiblePieces: Piece[]) {
    super(possiblePieces, randomizeArray(possiblePieces));
    this.reserveBag = randomizeArray(possiblePieces);
  }

  override shiftNext() {
    const nextPiece = this.queue.shift();
    const nextInReserveQueue = this.shiftReserveBag();

    if (nextInReserveQueue) {
      this.pushQueue(nextInReserveQueue);
    }

    // if the reserve bag is empty, make a new bag
    if (this.reserveBag.length === 0) {
      this.reserveBag = randomizeArray(this.possiblePieces);
    }

    return nextPiece;
  }

  /**
   * Removes the next piece in the reserve bag and returns it.
   * If there are no pieces in the reserve bag, returns `undefined`.
   */
  private shiftReserveBag() {
    return this.reserveBag.shift();
  }
}
