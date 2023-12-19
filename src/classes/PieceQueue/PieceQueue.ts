import { PieceId } from "@data/index";

/**
 * A queue containing the ids of the pieces that will fall into the matrix next.
 */
export abstract class PieceQueue {
    protected queue: PieceId[];
    protected readonly possiblePieceIds: PieceId[];

    constructor(possiblePieceIds: PieceId[], initialQueue: PieceId[]) {
        this.possiblePieceIds = possiblePieceIds;
        this.queue = initialQueue;
    }

    /**
     * Removes the next piece id in the queue and returns it.
     * Returns `undefined` if the queue is empty.
     */
    shiftNext() {
        return this.queue.shift();
    }

    /**
     * Returns the piece ids of the next `numNext` pieces in the queue. Does not change the queue.
     */
    getNext(numNext: number): PieceId[] {
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
     * Pushes a piece id onto the queue.
     */
    protected pushQueue(piece: PieceId) {
        this.queue.push(piece);
    }
}
