import { GroupEntity } from "@classes/GroupEntity";
import { PieceId } from "@data/index";
import { Renderer_PieceQueue } from "./PieceQueue.renderer";

/**
 * A queue containing the ids of the pieces that will fall into the matrix next.
 */
export abstract class PieceQueue extends GroupEntity {
    protected queue: PieceId[];
    protected readonly possiblePieceIds: PieceId[];
    protected renderer: Renderer_PieceQueue;

    constructor(possiblePieceIds: PieceId[], initialQueue: PieceId[], previewCount = 4) {
        super();
        this.possiblePieceIds = possiblePieceIds;
        this.queue = initialQueue;

        this.renderer = new Renderer_PieceQueue(this, previewCount);
        this.defaultDimensions = this.renderer.getDrawablesMinRectDim();
        this.drawables.push(this.renderer);
    }

    /**
     * Removes the next piece id in the queue and returns it.
     * Returns `undefined` if the queue is empty.
     */
    shiftNext() {
        const nextId = this.queue.shift();
        this.renderer.update();

        return nextId;
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
