import { GroupEntity } from "@classes/GroupEntity";
import { HoldQueue } from "@classes/HoldQueue";
import { Playfield } from "@classes/Playfield";
import { PieceFactory } from "@classes/PieceFactory";
import { PieceQueue } from "@classes/PieceQueue";
import { PieceId } from "@data/PieceId";

export class PieceSpawner extends GroupEntity {
    private pieceFactory = new PieceFactory();

    private holdQueue: HoldQueue;
    private nextQueue: PieceQueue;

    private spawnCoordinates: [x: number, y: number];
    private spawnRetries = 2;

    private useGhost: boolean;

    constructor(pieceQueue: PieceQueue, spawnCoordinates: [x: number, y: number], useGhost = true) {
        super();
        this.spawnCoordinates = spawnCoordinates;
        this.nextQueue = pieceQueue;
        this.holdQueue = new HoldQueue();

        this.drawables.push(this.holdQueue);
        this.useGhost = useGhost;
    }

    spawnPiece(playfield: Playfield, pieceId?: PieceId, fromHold = false) {
        let spawnSuccessful = false;

        for (let spawnAttempt = 0; spawnAttempt < this.spawnRetries; spawnAttempt++) {
            const spawnArgs: Parameters<typeof this.pieceFactory.makePiece> = [
                [this.spawnCoordinates[0], this.spawnCoordinates[1] + spawnAttempt],
                playfield,
                pieceId,
            ];

            const spawnedPiece = this.pieceFactory.makePiece(...spawnArgs);

            if (spawnedPiece) {
                // Does the spawned piece overlap with any blocks in the matrix?
                const pieceDoesNotOverlap = spawnedPiece.getBlocksCoordinates().reduce(
                    (noOverlap, blockCoordinates) =>
                        // active piece should always have coordinates
                        !!blockCoordinates && noOverlap && !playfield.hasBlockAt(blockCoordinates),
                    true
                );

                // if it doesn't overlap, spawn successful
                if (pieceDoesNotOverlap) {
                    if (this.useGhost) {
                        spawnedPiece.ghost = this.spawnGhostPiece(playfield, pieceId);
                    }
                    playfield.activePiece = spawnedPiece;
                    spawnSuccessful = true;
                    break;
                }
            }
        }

        if (!fromHold) {
            this.holdQueue.canHold = true;
        }
        return spawnSuccessful;
    }

    private spawnGhostPiece(playfield: Playfield, pieceId?: PieceId) {
        const ghostPiece = this.pieceFactory.makePiece([this.spawnCoordinates[0], this.spawnCoordinates[1]], playfield, pieceId);
        if (ghostPiece !== null) ghostPiece.saturationModifier = -0.5;

        return ghostPiece;
    }

    /**
     * Spawn the next piece from the next queue. If spawning the piece
     * was successful, returns `true`, `false` otherwise.
     */
    spawnNextPiece(playfield: Playfield, fromHold = false) {
        const nextPiece = this.spawnPiece(playfield, this.nextQueue.shiftNext(), fromHold);

        return nextPiece;
    }

    /**
     * Get the next `numNext` piece ids from the next queue (Default: 4).
     */
    getNextQueue(numNext = 4) {
        return this.nextQueue.getNext(numNext);
    }

    hold(playfield: Playfield) {
        const currentHoldPieceId = this.holdQueue.holdPieceId;
        if (playfield.activePiece !== null) {
            const activePieceId = playfield.activePiece.getId();
            if (activePieceId !== null) {
                const holdSuccess = this.holdQueue.hold(activePieceId);
                if (holdSuccess) {
                    playfield.activePiece = null;
                    if (currentHoldPieceId === null) {
                        // when hold piece is null, hold current piece and spawn a new piece
                        this.spawnNextPiece(playfield, true);
                    } else {
                        // otherwise swap active piece and hold piece
                        this.spawnPiece(playfield, currentHoldPieceId, true);
                    }
                }
            }

            return true;
        }
        return false;
    }
}
