import { randomizeArray } from "@utils/index";
import { PieceQueue } from "./PieceQueue";
import { PieceId } from "@data/index";

/**
 * A 'bag' is a type of queue that contains one of each `n` possible piece ids
 * in a random order.
 *
 * The ids in the 'bag' will then be pulled out individually until there are no more ids.
 * When the bag is empty, ids will then be pulled out of a new bag and the process repeats.
 */
export class Bag extends PieceQueue {
    /**
     * When the next piece id is taken from the queue,
     * the next piece id from the reserve bag will be added to the end of the queue.
     *
     * When the reserve bag is emptied it should be refilled.
     */
    private reserveBag: PieceId[];

    constructor(possiblePieceIds: PieceId[]) {
        super(possiblePieceIds, randomizeArray(possiblePieceIds));
        this.reserveBag = randomizeArray(possiblePieceIds);
    }

    override shiftNext() {
        const nextPiece = this.queue.shift();
        const nextInReserveQueue = this.shiftReserveBag();

        if (nextInReserveQueue !== undefined) {
            this.pushQueue(nextInReserveQueue);
        }

        // if the reserve bag is empty, make a new bag
        if (this.reserveBag.length === 0) {
            this.reserveBag = randomizeArray(this.possiblePieceIds);
        }

        return nextPiece;
    }

    /**
     * Removes the next piece id in the reserve bag and returns it.
     * If there are no piece ids in the reserve bag, returns `undefined`.
     */
    private shiftReserveBag() {
        return this.reserveBag.shift();
    }
}
