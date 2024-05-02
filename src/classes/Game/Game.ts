import { Matrix } from "@classes/Matrix";
import { Piece } from "@classes/Piece";

import { PieceQueue } from "@classes/PieceQueue";
import { Interval } from "@classes/TimeMeasure";
import { GameIntervalKeys } from "./GameIntervalKeys";
import { GameOverCode } from "./GameOverCode";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { FRAME_MS } from "src/constants";
import { ButtonFramesHeld, ButtonsHeld } from "@classes/GameController";
import { Button } from "@classes/InputBinding/types";
import { PressedButtons } from "@classes/Controller";
import { GhostPiece } from "@classes/GhostPiece";
import { ScoreJudge } from "@classes/ScoreJudge";
import { ProgressionJudge } from "@classes/ProgressionJudge";
import { DropType } from "@classes/ScoreJudge/ScoreJudge.helpers";
import { PieceSpawner } from "@classes/PieceSpawner/PieceSpawner";
import { IControllable } from "src/interfaces/IControllable";
import { ControllerContext } from "@classes/ControllerContext";
import { Managers } from "@classes/Entity";

export class Game extends GroupEntity implements IControllable {
    private numRows: number;

    private matrix: Matrix;

    private activePiece: Piece | null = null;
    private ghostPiece: GhostPiece | null = null;

    private lockDelayFrameLimit = 30;
    private lockDelayFrames = 0;

    private lowestGroundedRow = Infinity;

    // this should be extracted out
    private autoDropFrameBaseline = 0;

    private autoDropFrameTarget = 0;
    private autoDropFrames = 0;

    private groundedMoveLimit = 15;
    private groundedMoves = 0;

    private hasGrounded = false;
    private softDropEnabled = false;

    private gamePaused = false;
    private gameOver = false;

    private scoreJudge = new ScoreJudge();
    private pieceSpawner: PieceSpawner;

    private onLevelUpdate = (newLevel: number) => {
        this.autoDropFrameBaseline = (0.8 - (newLevel - 1) * 0.007) ** (newLevel - 1) * 60;
        this.autoDropFrameTarget = this.autoDropFrameBaseline;
    };

    private progressionJudge: ProgressionJudge;

    constructor(
        numRows: number,
        numColumns: number,
        pieceQueue: PieceQueue,
        spawnCoordinates: [x: number, y: number],
        // TODO: why is renderer necessary for anything except getting size of canvas
        renderer: GroupRenderer,
        managers: Managers = {};
        level = 1
    ) {
        super(managers);
        this.numRows = numRows;
        this.progressionJudge = new ProgressionJudge(level, this.onLevelUpdate);
        this.progressionJudge.setLinesQuotaTarget(10);

        this.matrix = new Matrix(intervalManager, controllerPortManager, numRows, numColumns, this);

        this.addDrawable(this.matrix);

        const canvas = renderer.getWebGLRenderingContext().canvas as HTMLCanvasElement;
        this.setDefaultDimensions([canvas.clientWidth, canvas.clientHeight]);
        this.setPosition([0, 0]);

        // not ideal - probably don't want group entity as the renderer for a game anymore... unless we want ui to also appear in the screen?

        this.pieceSpawner = new PieceSpawner(pieceQueue, spawnCoordinates, intervalManager, controllerPortManager);
    }

    /* Game flow methods */

    async run() {
        if (!this.managers.controllerContext || !this.managers.intervalManager) return;
        this.controllerContext = new ControllerContext(this, this.managers.controllerContext);

        // TODO: This is still testing
        this.registerInterval(
            GameIntervalKeys.RUN,
            new Interval(
                FRAME_MS,
                () => {
                    this.tick();
                },
                Infinity
            )
        );

        await this.tick();
    }

    halt() {
        if (this.managers.intervalManager) {
            this.unregisterInterval(GameIntervalKeys.RUN);
        }
    }

    /**
     * Ticks the game and decides what happens in the given frame.
     */
    async tick() {
        if (!this.gameOver) {
            if (!this.activePiece) {
                const spawnSuccessful = this.spawnNextPiece();
                console.log("Spawned piece");
                if (!spawnSuccessful) {
                    this.triggerGameOver(GameOverCode.BLOCK_OUT);
                }
            }
        }
    }

    private resetGroundedState() {
        if (this.activePiece) {
            this.hasGrounded = false;
            this.groundedMoves = 0;
            this.lowestGroundedRow = this.activePiece?.getBottomBoundRow();
        }
    }

    /**
     * Triggers when the active piece has grounded
     */
    private triggerGroundedCheck(wasRotationMove = false) {
        if (this.activePiece) {
            const lowestRowOccupiedByActivePiece = this.activePiece.getBottomBoundRow();

            // Begin lock delay flow as soon as piece cannot move downwards
            // and reset the number of moves the player can move
            // if the piece has grounded on a row that is lower than any row
            // it grounded on previously
            if (!this.activePiece?.canMoveDownTogether(1)) {
                if (this.lowestGroundedRow > lowestRowOccupiedByActivePiece) {
                    this.lowestGroundedRow = this.activePiece?.getBottomBoundRow();
                    // If the piece was not grounded by rotation or
                    // the piece was grounded via rotation but it has
                    // not been grounded before reset the number of available
                    // grounded moves
                    if (!(wasRotationMove && this.hasGrounded)) {
                        this.groundedMoves = 0;
                    }
                }
                this.hasGrounded = true;
                this.autoLockFlow();
            }

            if (this.groundedMoves >= this.groundedMoveLimit && !this.activePiece.canMoveDownTogether(1)) {
                this.lockPiece();
            }
        }
    }

    /**
     * The flow for an active piece to drop automatically.
     */
    // TODO: Grounded flow still buggy
    private dropFlow(dropUnits = 1) {
        if (this.autoDropFrames >= this.autoDropFrameTarget) {
            // console.log("Autodrop:", this.autoDropFrames, "/", this.autoDropFrameTarget);
            this.autoDropPiece(dropUnits);
        } else {
            // console.log(this.autoDropFrames);
            this.autoDropFrames++;
        }
    }
    /**
     * The flow for an active piece to auto lock.
     */
    private autoLockFlow() {
        this.autoDropFrames = 0;
        // lock immediately if there is no frame delay
        if (this.lockDelayFrameLimit === 0) {
            this.lockPiece();
        } else {
            if (this.getInterval(GameIntervalKeys.LOCK_DELAY) === undefined) {
                this.initLockDelay();
            }
        }
    }

    private initAutoDrop() {
        const gravity = 1 / this.autoDropFrameTarget;
        const unitsToDrop = gravity < 1 ? 1 : Math.round(gravity);
        if (gravity >= 1) {
            this.autoDropPiece(unitsToDrop);
        }

        this.registerInterval(GameIntervalKeys.AUTO_DROP, new Interval(FRAME_MS, () => this.dropFlow(unitsToDrop), Infinity));
    }

    private resetAutoDrop() {
        this.autoDropFrames = 0;
        this.unregisterInterval(GameIntervalKeys.AUTO_DROP);
    }

    private autoDropPiece(units = 1) {
        const unitsMoved = this.activePiece?.moveDown(units);

        // soft drop scoring
        if (this.softDropEnabled && unitsMoved !== undefined) {
            this.scoreJudge.addScoreByDrop(unitsMoved, DropType.SOFT);
        }

        if (unitsMoved !== undefined && unitsMoved > 0) {
            this.resetLockDelay();
            this.autoDropFrames -= this.autoDropFrameTarget;
            // if soft dropped, add score
            this.triggerGroundedCheck();
        }
    }

    private resetLockDelay() {
        this.lockDelayFrames = 0;
        this.unregisterInterval(GameIntervalKeys.LOCK_DELAY);
    }

    private initLockDelay() {
        this.registerInterval(
            GameIntervalKeys.LOCK_DELAY,
            new Interval(
                FRAME_MS,
                () => {
                    if (this.lockDelayFrames >= this.lockDelayFrameLimit) {
                        this.lockPiece();
                        return;
                    }
                    this.lockDelayFrames++;
                    // console.log("Lock delay frame:", this.lockDelayFrames);
                },
                Infinity
            )
        );
    }

    /**
     * Spawn a piece with the given piece id at the spawn coordinates.
     * If it is unable to spawn the piece at that location, it will try spawning it
     * one block above the previous attempt up to `this.spawnRetries` times. If spawning the piece
     * was successful, returns `true`, `false` otherwise.
     */
    /* private spawnPiece(pieceId?: PieceId) {
        let spawnSuccessful = false;

        for (let spawnAttempt = 0; spawnAttempt < this.spawnRetries; spawnAttempt++) {
            const spawnArgs: Parameters<typeof this.pieceFactory.makePiece> = [
                this.getIntervalManager(),
                this.getControllerPortManager(),
                [this.spawnCoordinates[0], this.spawnCoordinates[1] + spawnAttempt],
                this.matrix,
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
                        !!blockCoordinates && noOverlap && !this.matrix.hasBlockAt(blockCoordinates),
                    true
                );

                // Set the active piece regardless of overlap
                this.activePiece = spawnedPiece;

                // Reset certain parameters when piece is spawned
                this.resetGroundedState();
                this.triggerGroundedCheck();

                // if it doesn't overlap, spawn successful
                if (pieceDoesNotOverlap) {
                    if (pieceForGhost) {
                        this.ghostPiece = new GhostPiece(pieceForGhost);
                    }
                    this.matrix.setActivePiece(spawnedPiece, this.ghostPiece);
                    this.ghostPiece?.updateCoordinates(this.getGhostPieceCoordinates());
                    spawnSuccessful = true;
                    break;
                }
            }
        }

        return spawnSuccessful;
    } */

    /**
     * Get the coordinates of where the ghost piece will be.
     */
    getGhostPieceCoordinates(): [x: number, y: number][] {
        if (this.activePiece) {
            const activePieceCoordinates = this.activePiece.getBlocksCoordinates();

            const hardDropUnits = this.activePiece.getHardDropUnits();

            return activePieceCoordinates.map((coordinates) => {
                // active piece should always have coordinates
                if (this.activePiece && coordinates) {
                    return [coordinates[0], coordinates[1] - hardDropUnits];
                }
                return coordinates;
            });
        }
        return [];
    }

    /**
     * Locks the active piece and takes it out of play. Also clears any lines.
     * Piece will not lock if there is still space underneath
     * (this behaviour can be ignored).
     */
    private lockPiece(ignoreMoveCheck = false) {
        if (!this.activePiece?.canMoveDownTogether(1) || ignoreMoveCheck) {
            const prevMoveTechnical = this.activePiece?.getPrevMoveTechnical() || null;

            this.matrix.lockActivePiece();

            if (this.isLockOut()) {
                this.triggerGameOver(GameOverCode.LOCK_OUT);
            }

            // clear lines if any
            const linesCleared = this.clearLines();
            const isPerfectClear = this.matrix.getNumCellsOccupied() === 0;

            // update judges
            this.scoreJudge.addScoreByLock(this.progressionJudge.getLevel(), linesCleared, prevMoveTechnical, isPerfectClear);
            this.progressionJudge.addLinesCleared(linesCleared);

            // only nullify active piece once all logic above is completed
            this.resetLockDelay();
            this.holdQueue.resetCanHold();
            this.activePiece = null;
        }
    }

    /**
     * Checks for the lock out condition.
     * A lock out occurs when a piece locks out of bounds. (i.e. it locks in a row > matrix's visible rows)
     */
    private isLockOut() {
        return this.getActivePieceLowestRow() >= this.numRows;
    }

    /**
     * Determine which row the lowest block in the piece is occupying.
     */
    // This may be duplicate
    private getActivePieceLowestRow() {
        if (this.activePiece?.getBottomBoundRow) {
            return Math.min(...this.getRowsOccupiedByActivePiece());
        }
        // TODO:
        return -1;
        // throw new Error("No active piece");
    }

    /**
     * Clears lines from the matrix if they are filled.
     */
    private clearLines() {
        const filledLines = this.checkLineClears();
        filledLines.forEach((row) => this.clearLine(row));
        return filledLines.length;
    }

    /**
     * Clears a line from the matrix at a given row.
     */
    private clearLine(row: number) {
        this.removeDrawables(this.matrix.clearRows(row));

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
            return this.activePiece.getBlocksCoordinates().map((coordinates) => {
                if (coordinates) {
                    return coordinates[1];
                }
                throw Error("Active piece should always have coordinates");
            });
        }
        return [];
    }

    /* Controller methods */
    private controlledMoveFlow(wasRotationMove = false) {
        this.resetLockDelay();
        this.ghostPiece?.updateCoordinates(this.getGhostPieceCoordinates());
        if (this.hasGrounded) {
            this.groundedMoves += 1;
            console.log("Moves left before lock:", this.groundedMoveLimit - this.groundedMoves);
        }
        this.triggerGroundedCheck(wasRotationMove);
    }

    moveLeft() {
        if (this.activePiece?.moveLeft()) {
            this.controlledMoveFlow();
        }
    }

    moveRight() {
        if (this.activePiece?.moveRight()) {
            this.controlledMoveFlow();
        }
    }

    rotateClockwise() {
        if (this.activePiece?.rotateClockwise()) {
            this.controlledMoveFlow(true);
        }
    }

    rotateAntiClockwise() {
        if (this.activePiece?.rotateAntiClockwise()) {
            this.controlledMoveFlow(true);
        }
    }

    enableSoftDrop() {
        if (!this.softDropEnabled) {
            this.resetAutoDrop();
            this.softDropEnabled = true;
            this.autoDropFrameTarget = this.autoDropFrameBaseline / 20;
            this.initAutoDrop();
        }
    }

    disableSoftDrop() {
        this.resetAutoDrop();
        this.autoDropFrameTarget = this.autoDropFrameBaseline;
        this.softDropEnabled = false;
        this.initAutoDrop();
    }

    hardDrop() {
        const unitsMoved = this.activePiece?.moveDown(this.activePiece.getHardDropUnits());

        if (unitsMoved !== undefined) {
            this.scoreJudge.addScoreByDrop(unitsMoved, DropType.HARD);
        }

        this.lockPiece();
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.pauseAllIntervals();
        } else {
            this.resumeAllIntervals();
        }
    }

    private handlePressInput(button: ButtonFramesHeld) {
        if (!this.gamePaused) {
            switch (button.id) {
                case Button.BUTTON_UP: {
                    if (button.frames === 1) {
                        this.hardDrop();
                    }
                    break;
                }
                case Button.BUTTON_DOWN: {
                    this.enableSoftDrop();
                    break;
                }
                case Button.BUTTON_LEFT: {
                    // 12 is magic number for DAS
                    if (button.frames === 1 || button.frames >= 30) {
                        this.moveLeft();
                    }
                    break;
                }
                case Button.BUTTON_RIGHT: {
                    if (button.frames === 1 || button.frames >= 60) {
                        this.moveRight();
                    }
                    break;
                }
                case Button.BUTTON_0: {
                    if (button.frames === 1) {
                        this.rotateAntiClockwise();
                    }
                    break;
                }
                case Button.BUTTON_1: {
                    if (button.frames === 1) {
                        this.rotateClockwise();
                    }
                    break;
                }
                case Button.L_TRIGGER_F: {
                    if (button.frames === 1) {
                        this.hold();
                    }
                    break;
                }
                default:
                // do nothing
            }
        }

        if (button.id === Button.START && button.frames === 1) {
            this.togglePause();
        }
    }

    private handleReleaseInput(button: Button) {
        if (!this.gamePaused) {
            switch (button) {
                case Button.BUTTON_DOWN: {
                    this.disableSoftDrop();
                    break;
                }
                default:
                // do nothing
            }
        }
    }

    acceptInput(heldButtons: PressedButtons, releasedButtons: Button[]): void {
        heldButtons.forEach((button) => this.handlePressInput(button));
        releasedButtons.forEach((button) => this.handleReleaseInput(button));
    }

    handleInputState(heldButtons: ButtonsHeld, releasedButtons: Button[]) {
        heldButtons.forEach((button) => this.handlePressInput(button));
        releasedButtons.forEach((button) => this.handleReleaseInput(button));
    }

    triggerGameOver(code?: GameOverCode) {
        this.gameOver = true;
        this.unregisterAllIntervals();
        // Debugging feature
        console.log("Game over:", code);
    }

    getGameParams() {
        return {
            score: this.scoreJudge.getScore(),
            combo: this.scoreJudge.getCombo(),
            b2bCombo: this.scoreJudge.getB2bCombo(),

            level: this.progressionJudge.getLevel(),
            linesCleared: this.progressionJudge.getLinesCleared(),
        };
    }

    // Game methods
    getActivePiece() {
        return this.activePiece;
    }

    // Matrix methods

    /**
     * Returns the grid of the matrix. (Readonly)
     */
    getMatrixGrid() {
        return this.matrix.matrixToArrays();
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

    // ! Debug only
    /**
     * Returns some stats about the game.
     */
    debugDetails() {
        return {
            gravity: 1 / this.autoDropFrameBaseline,
            lockDelay: this.lockDelayFrameLimit - this.lockDelayFrames,
            autoDrop: this.autoDropFrameTarget - this.autoDropFrames,
            autoDropFrameTarget: this.autoDropFrameTarget,
            groundedMoves: this.groundedMoveLimit - this.groundedMoves,
            blocks: this.matrix.getNumCellsOccupied(),
        };
    }

    // ! Debug only
    getControllerContext() {
        return this.controllerContext;
    }
}
