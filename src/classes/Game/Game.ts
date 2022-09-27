import { Matrix } from "@classes/Matrix";
import { Piece } from "@classes/Piece";
import { PieceFactory, PieceId } from "@classes/PieceFactory";
import { PieceQueue } from "@classes/PieceQueue";
import { GameOverCode } from "./GameOverCode";

export class Game {
    private numRows: number;
    private numColumns: number;

    private matrix: Matrix;
    private spawnCoordinates: [x: number, y: number];

    private holdPieceId: PieceId | null = null;
    private activePiece: Piece | null = null;
    private pieceFactory: PieceFactory;
    private nextQueue: PieceQueue;

    private linesCleared = 0;
    private level = 1;
    private maxLevel = 15;
    private levelLineQuota = 10;
    private combo = -1;

    /**
     *
     */
    private spawnRetries = 2;
    private gravity = 1;

    private lockDelayFrameLimit = 30;
    private lockDelayFrames = 0;

    private highestGroundedRow = 0;

    private groundedMoveLimit = 15;
    private groundedMoves = 0;

    private grounded = false;

    private canHold = true;

    private gamePaused = false;
    private gameOver = false;

    constructor(
        numRows: number,
        numColumns: number,
        pieceQueue: PieceQueue,
        spawnCoordinates: [x: number, y: number]
    ) {
        this.pieceFactory = new PieceFactory();
        this.numRows = numRows;
        this.numColumns = numColumns;
        this.matrix = new Matrix(numRows, numColumns);
        this.nextQueue = pieceQueue;
        this.spawnCoordinates = spawnCoordinates;
    }

    /* Game flow methods */

    /**
     * Ticks the game and decides what happens in the given frame.
     */
    tick() {
        if (!this.gameOver) {
            if (!this.activePiece) {
                this.resetLockDelay();
                const spawnSuccessful = this.spawnNextPiece();
                if (!spawnSuccessful) {
                    this.triggerGameOver(GameOverCode.BLOCK_OUT);
                }
            } else {
                this.dropFlow();
            }
        }
    }

    /**
     * The flow for an active piece to drop automatically.
     */
    private dropFlow() {
        const autoDropped = this.autoDropPiece();
        // if piece was able to be moved down,
        if (autoDropped) {
            // if soft dropped, add score
            // reset lock delay
            this.resetLockDelay();
        } else {
            // check if there is a lock
            this.lockPiece();
        }
    }

    /**
     * The flow for an active piece to auto lock.
     */
    private autoLockFlow() {
        if (
            this.activePiece &&
            this.activePiece.getBottomBoundRow() < this.highestGroundedRow
        ) {
            this.resetLockDelay();
        }
        this.initializeLockDelay();
    }

    private autoDropPiece() {
        return !!this.activePiece?.moveDown();
    }

    private resetLockDelay() {
        this.highestGroundedRow = this.numRows - 1;
        this.groundedMoves = 0;
        this.lockDelayFrames = 0;
    }

    private initializeLockDelay() {}

    /**
     * Spawn a piece with the given piece id at the spawn coordinates.
     * If it is unable to spawn the piece at that location, it will try spawning it
     * one block above the previous attempt up to `this.spawnRetries` times. If spawning the piece
     * was successful, returns `true`, `false` otherwise.
     */
    private spawnPiece(pieceId?: PieceId) {
        let spawnSuccessful = false;

        for (
            let spawnAttempt = 0;
            spawnAttempt < this.spawnRetries;
            spawnAttempt++
        ) {
            const spawnedPiece = this.pieceFactory.makePiece(
                [
                    this.spawnCoordinates[0],
                    this.spawnCoordinates[1] + spawnAttempt,
                ],
                this.matrix,
                pieceId
            );

            // Does the spawned piece overlap with any blocks in the matrix?
            if (spawnedPiece) {
                const pieceDoesNotOverlap = spawnedPiece
                    .getBlocksCoordinates()
                    .reduce(
                        (noOverlap, blockCoordinates) =>
                            noOverlap &&
                            !this.matrix.hasBlockAt(blockCoordinates),
                        true
                    );

                // Set the active piece regardless of overlap
                this.activePiece = spawnedPiece;
                this.matrix.setActivePiece(spawnedPiece);

                // if it doesn't overlap, spawn successful
                if (pieceDoesNotOverlap) {
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
    private spawnNextPiece() {
        return this.spawnPiece(this.nextQueue.shiftNext());
    }

    /**
     * Get the next `numNext` piece ids from the next queue (Default: 4).
     */
    getNextQueue(numNext = 4) {
        return this.nextQueue.getNext(numNext);
    }

    /**
     * Get the coordinates of where the ghost piece will be.
     */
    getGhostPieceCoordinates() {
        if (this.activePiece) {
            const activePieceCoordinates =
                this.activePiece.getBlocksCoordinates();

            return activePieceCoordinates.map((coordinates) => {
                if (this.activePiece) {
                    return [
                        coordinates[0],
                        coordinates[1] - this.activePiece.getHardDropUnits(),
                    ];
                }
                return coordinates;
            });
        }
    }

    /**
     * Locks the active piece and takes it out of play. Also clears any lines.
     */
    private lockPiece() {
        this.matrix.lockActivePiece();

        if (this.isLockOut()) {
            this.triggerGameOver(GameOverCode.LOCK_OUT);
        }

        // clear lines if any
        this.clearLines();

        // only nullify active piece once all logic above is completed
        this.activePiece = null;
    }

    /**
     * Checks for the lock out condition.
     */
    private isLockOut() {
        return this.getActivePieceLowestRow() >= this.numRows;
    }

    /**
     * Determine which row the lowest block in the piece is occupying.
     */
    private getActivePieceLowestRow() {
        if (this.activePiece) {
            return Math.min(...this.getRowsOccupiedByActivePiece());
        }
        throw new Error("No active piece");
    }

    /**
     * Clears lines from the matrix if they are filled.
     */
    private clearLines() {
        const filledLines = this.checkLineClears();
        filledLines.forEach((row) => this.clearLine(row));
    }

    /**
     * Clears a line from the matrix at a given row.
     */
    private clearLine(row: number) {
        this.matrix.clearRows(row);
        this.matrix.shiftRowsDown(row, 1);
    }

    /**
     * Returns which rows have lines that can be cleared.
     * The array of rows must be returned in descending order.
     */
    private checkLineClears() {
        return Array.from(new Set(this.getRowsOccupiedByActivePiece()))
            .filter((row) => this.matrix.rowFormsLine(row))
            .sort((row1, row2) => row2 - row1);
    }

    /**
     * Determines the rows which are occupied by the current piece.
     */
    private getRowsOccupiedByActivePiece() {
        if (this.activePiece) {
            return this.activePiece
                .getBlocksCoordinates()
                .map((coordinates) => coordinates[1]);
        }
        return [];
    }

    /* Controller methods */

    moveLeft() {
        this.activePiece?.moveLeft();
    }

    moveRight() {
        this.activePiece?.moveRight();
    }

    rotateClockwise() {
        this.activePiece?.rotateClockwise();
    }

    rotateAntiClockwise() {
        this.activePiece?.rotateAntiClockwise();
    }

    enableSoftDrop() {
        this.gravity *= 20;
    }

    disableSoftDrop() {
        this.gravity /= 20;
    }

    hardDrop() {
        this.activePiece?.moveDown(this.activePiece.getHardDropUnits());
        this.lockPiece();
    }

    hold() {
        if (this.canHold && this.activePiece !== null) {
            if (this.holdPieceId === null) {
                // when hold piece is null, hold current piece and spawn a new piece
                this.holdPieceId = this.activePiece.getId();
                this.spawnNextPiece();
            } else {
                // otherwise swap active piece and hold piece
                this.spawnPiece(this.holdPieceId);
                this.holdPieceId = this.activePiece.getId();
            }
            this.canHold = false;
            return true;
        }
        return false;
    }

    pauseGame() {
        this.gamePaused = true;
    }

    resumeGame() {
        this.gamePaused = false;
    }

    triggerGameOver(code?: GameOverCode) {
        this.gameOver = true;
        // Debugging feature
        console.log(code);
    }

    // Matrix methods

    /**
     * Returns the grid of the matrix. (Readonly)
     */
    getMatrixGrid() {
        return this.matrix.getGrid();
    }

    /**
     * Gets the number of visible rows in the matrix which does NOT include those above the normal field of play.
     */
    getNumVisibleRows() {
        return this.matrix.getNumVisibleRows();
    }

    // ! Debug only
    getMatrix() {
        return this.matrix;
    }
}
