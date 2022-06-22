import { Piece } from "@classes/Piece";

export abstract class PieceQueue {
  protected queue: Piece[];
  protected readonly possiblePieces: Piece[];

  constructor(possiblePieces: Piece[], initialQueue: Piece[]) {
    this.possiblePieces = possiblePieces;
    this.queue = initialQueue;
  }

  /**
   * Removes the next piece in the queue and returns it.
   * Returns `undefined` if the queue is empty.
   */
  shiftNext() {
    return this.queue.shift();
  }

  /**
   * Returns the next `numNext` pieces in the queue. Does not change the queue.
   */
  getNext(numNext: number): Piece[] {
    let boundedNumNext = numNext;
    if (boundedNumNext < 1) {
      boundedNumNext = 1;
    }

    if (boundedNumNext > this.queue.length - 1) {
      boundedNumNext = this.queue.length;
    }

    return this.queue.slice(0, boundedNumNext);
  }

  /**
   * Pushes a piece onto the queue.
   */
  protected pushQueue(piece: Piece) {
    this.queue.push(piece);
  }
}
