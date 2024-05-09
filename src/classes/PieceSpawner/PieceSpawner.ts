import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { HoldQueue } from "@classes/HoldQueue";
import { Matrix } from "@classes/Matrix";
import { Piece } from "@classes/Piece/Piece";
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
        this.useGhost = useGhost;
    }

    spawnPiece(matrix: Matrix, pieceId?: PieceId, fromHold = false) {
        let spawnSuccessful = false;

        for (let spawnAttempt = 0; spawnAttempt < this.spawnRetries; spawnAttempt++) {
            const spawnArgs: Parameters<typeof this.pieceFactory.makePiece> = [
                [this.spawnCoordinates[0], this.spawnCoordinates[1] + spawnAttempt],
                matrix,
                pieceId,
            ];

            const spawnedPiece = this.pieceFactory.makePiece(...spawnArgs);

            if (spawnedPiece) {
                // Does the spawned piece overlap with any blocks in the matrix?
                const pieceDoesNotOverlap = spawnedPiece.getBlocksCoordinates().reduce(
                    (noOverlap, blockCoordinates) =>
                        // active piece should always have coordinates
                        !!blockCoordinates && noOverlap && !matrix.hasBlockAt(blockCoordinates),
                    true
                );

                // if it doesn't overlap, spawn successful
                if (pieceDoesNotOverlap) {
                    if (this.useGhost) {
                        spawnedPiece.ghost = this.spawnGhostPiece(matrix, pieceId);
                    }
                    matrix.activePiece = spawnedPiece;
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

    private spawnGhostPiece(matrix: Matrix, pieceId?: PieceId) {
        const ghostPiece = this.pieceFactory.makePiece([this.spawnCoordinates[0], this.spawnCoordinates[1]], matrix, pieceId);
        ghostPiece?.setSaturationModifier(0.3);

        return ghostPiece;
    }

    /**
     * Spawn the next piece from the next queue. If spawning the piece
     * was successful, returns `true`, `false` otherwise.
     */
    spawnNextPiece(matrix: Matrix, fromHold = false) {
        const nextPiece = this.spawnPiece(matrix, this.nextQueue.shiftNext(), fromHold);

        return nextPiece;
    }

    /**
     * Get the next `numNext` piece ids from the next queue (Default: 4).
     */
    getNextQueue(numNext = 4) {
        return this.nextQueue.getNext(numNext);
    }

    hold(matrix: Matrix) {
        const currentHoldPieceId = this.holdQueue.holdPieceId;
        if (matrix.activePiece !== null) {
            const activePieceId = matrix.activePiece.getId();
            if (activePieceId !== null) {
                const holdSuccess = this.holdQueue.hold(activePieceId);
                if (holdSuccess) {
                    matrix.activePiece = null;
                    if (currentHoldPieceId === null) {
                        // when hold piece is null, hold current piece and spawn a new piece
                        this.spawnNextPiece(matrix, true);
                    } else {
                        // otherwise swap active piece and hold piece
                        this.spawnPiece(matrix, currentHoldPieceId, true);
                    }
                }
            }

            return true;
        }
        return false;
    }
}
