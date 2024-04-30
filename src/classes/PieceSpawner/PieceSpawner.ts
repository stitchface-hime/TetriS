import { ControllerPortManager } from "@classes/ControllerPortManager";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { HoldQueue } from "@classes/HoldQueue";
import { Matrix } from "@classes/Matrix";
import { Piece } from "@classes/Piece/Piece";
import { PieceFactory } from "@classes/PieceFactory";
import { PieceQueue } from "@classes/PieceQueue";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { PieceId } from "@data/PieceId";

export class PieceSpawner extends GroupEntity {
    private pieceFactory = new PieceFactory();

    private holdQueue: HoldQueue;
    private nextQueue: PieceQueue;

    private spawnCoordinates: [x: number, y: number];
    private spawnRetries = 2;
    private activePiece: Piece | null = null;

    constructor(
        pieceQueue: PieceQueue,
        spawnCoordinates: [x: number, y: number],
        intervalManager: IntervalManager,
        controllerPortManager: ControllerPortManager
    ) {
        super(intervalManager, controllerPortManager);
        this.spawnCoordinates = spawnCoordinates;
        this.nextQueue = pieceQueue;
        this.holdQueue = new HoldQueue(intervalManager, controllerPortManager);
    }

    spawnPiece(matrix: Matrix, pieceId?: PieceId) {
        let spawnSuccessful = false;

        for (let spawnAttempt = 0; spawnAttempt < this.spawnRetries; spawnAttempt++) {
            const spawnArgs: Parameters<typeof this.pieceFactory.makePiece> = [
                this.getIntervalManager(),
                this.getControllerPortManager(),
                [this.spawnCoordinates[0], this.spawnCoordinates[1] + spawnAttempt],
                matrix,
                pieceId,
            ];

            const spawnedPiece = this.pieceFactory.makePiece(...spawnArgs);
            // TODO: Need to make this conditional if the ghost piece is turned off

            const pieceForGhost = this.pieceFactory.makePiece(...spawnArgs);

            if (spawnedPiece) {
                // Does the spawned piece overlap with any blocks in the matrix?
                const pieceDoesNotOverlap = spawnedPiece.getBlocksCoordinates().reduce(
                    (noOverlap, blockCoordinates) =>
                        // active piece should always have coordinates
                        !!blockCoordinates && noOverlap && matrix.hasBlockAt(blockCoordinates),
                    true
                );

                // Set the active piece regardless of overlap
                this.activePiece = spawnedPiece;

                // Reset certain parameters when piece is spawned
                /* this.resetGroundedState();
                this.triggerGroundedCheck(); */

                // if it doesn't overlap, spawn successful
                if (pieceDoesNotOverlap) {
                    if (pieceForGhost) {
                        this.ghostPiece = new GhostPiece(pieceForGhost);
                    }
                    matrix.setActivePiece(spawnedPiece, this.ghostPiece);
                    this.ghostPiece?.updateCoordinates(this.getGhostPieceCoordinates());
                    spawnSuccessful = true;
                    break;
                }
            }
        }

        return spawnSuccessful;
    }

    /**
     * Spawn the next piece from the next queue. If spawning the piece
     * was successful, returns `true`, `false` otherwise.
     */
    private spawnNextPiece(matrix: Matrix) {
        const nextPiece = this.spawnPiece(matrix, this.nextQueue.shiftNext());
        /* this.resetAutoDrop();
        // If gravity xG > 1G drop immediately x units when piece spawns

        this.initAutoDrop(); */
        return nextPiece;
    }

    /**
     * Get the next `numNext` piece ids from the next queue (Default: 4).
     */
    getNextQueue(numNext = 4) {
        return this.nextQueue.getNext(numNext);
    }

    hold(matrix: Matrix) {
        const currentHoldPieceId = this.holdQueue.getHoldPieceId();
        if (this.activePiece !== null) {
            const activePieceId = this.activePiece.getId();
            if (activePieceId !== null) {
                const holdSuccess = this.holdQueue.hold(activePieceId);
                if (holdSuccess) {
                    matrix.unsetActivePiece();
                    if (currentHoldPieceId === null) {
                        // when hold piece is null, hold current piece and spawn a new piece
                        this.spawnNextPiece(matrix);
                    } else {
                        // otherwise swap active piece and hold piece
                        this.spawnPiece(matrix, currentHoldPieceId);
                    }
                }
            }

            return true;
        }
        return false;
    }
}
