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
import { Contexts } from "@classes/Entity";
import { ControllerPortKey } from "@classes/ControllerPortManager/types";

export class Game extends GroupEntity implements IControllable {
    private numRows: number;

    private matrix: Matrix;

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
        contexts: Contexts = {},
        level = 1
    ) {
        super(contexts);
        this.contexts.controllerContext?.subscribeToPort(ControllerPortKey.PORT_0);
        this.numRows = numRows;
        this.progressionJudge = new ProgressionJudge(level, this.onLevelUpdate);
        this.progressionJudge.setLinesQuotaTarget(10);

        this.matrix = new Matrix(numRows, numColumns, this);

        this.drawables.push(this.matrix);

        const canvas = renderer.getWebGLRenderingContext().canvas as HTMLCanvasElement;
        this.setDefaultDimensions([canvas.clientWidth, canvas.clientHeight]);
        this.setPosition([0, 0]);

        // not ideal - probably don't want group entity as the renderer for a game anymore... unless we want ui to also appear in the screen?

        this.pieceSpawner = new PieceSpawner(pieceQueue, spawnCoordinates);
    }

    /* Game flow methods */

    async run() {
        // TODO: This is still testing
        this.contexts.intervalContext?.registerInterval(
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
        this.contexts.intervalContext?.unregisterInterval(GameIntervalKeys.RUN);
    }

    spawnPieceReset() {
        this.resetGroundedState();
        this.triggerGroundedCheck();

        this.resetAutoDrop();
        this.initAutoDrop();
    }

    /**
     * Ticks the game and decides what happens in the given frame.
     */
    async tick() {
        if (this.gameOver || this.matrix.activePiece) return;
        const spawnSuccessful = this.pieceSpawner.spawnNextPiece(this.matrix);

        this.spawnPieceReset();
        if (spawnSuccessful) return;
        this.triggerGameOver(GameOverCode.BLOCK_OUT);
    }

    private resetGroundedState() {
        if (this.matrix.activePiece) {
            this.hasGrounded = false;
            this.groundedMoves = 0;
            this.lowestGroundedRow = this.matrix.activePiece?.getBottomBoundRow();
        }
    }

    /**
     * Triggers when the active piece has grounded
     */
    private triggerGroundedCheck(wasRotationMove = false) {
        if (this.matrix.activePiece) {
            const lowestRowOccupiedByActivePiece = this.matrix.activePiece.getBottomBoundRow();

            // Begin lock delay flow as soon as piece cannot move downwards
            // and reset the number of moves the player can move
            // if the piece has grounded on a row that is lower than any row
            // it grounded on previously
            if (!this.matrix.activePiece?.canMoveDownTogether(1)) {
                if (this.lowestGroundedRow > lowestRowOccupiedByActivePiece) {
                    this.lowestGroundedRow = this.matrix.activePiece?.getBottomBoundRow();
                    // If the piece was not grounded by rotation or
                    // the piece was grounded via rotation but it has
                    // not been grounded before, reset the number of available
                    // grounded moves
                    if (!(wasRotationMove && this.hasGrounded)) {
                        this.groundedMoves = 0;
                    }
                }
                this.hasGrounded = true;
                this.autoLockFlow();
            }

            if (this.groundedMoves >= this.groundedMoveLimit && !this.matrix.activePiece.canMoveDownTogether(1)) {
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
            const intervalContext = this.contexts.intervalContext;
            if (intervalContext && intervalContext.getInterval(GameIntervalKeys.LOCK_DELAY) === undefined) {
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

        this.contexts.intervalContext?.registerInterval(GameIntervalKeys.AUTO_DROP, new Interval(FRAME_MS, () => this.dropFlow(unitsToDrop), Infinity));
    }

    private resetAutoDrop() {
        this.autoDropFrames = 0;
        this.contexts.intervalContext?.unregisterInterval(GameIntervalKeys.AUTO_DROP);
    }

    private autoDropPiece(units = 1) {
        const unitsMoved = this.matrix.activePiece?.moveDown(units);

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
        this.contexts.intervalContext?.unregisterInterval(GameIntervalKeys.LOCK_DELAY);
    }

    private initLockDelay() {
        this.contexts.intervalContext?.registerInterval(
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
     * Locks the active piece and takes it out of play. Also clears any lines.
     * Piece will not lock if there is still space underneath
     * (this behaviour can be ignored).
     */
    private lockPiece(ignoreMoveCheck = false) {
        if (!this.matrix.activePiece?.canMoveDownTogether(1) || ignoreMoveCheck) {
            const prevMoveTechnical = this.matrix.activePiece?.getPrevMoveTechnical() || null;

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
            this.matrix.activePiece = null;
            this.resetLockDelay();
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
        if (this.matrix.activePiece) {
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
        this.drawables.remove(...this.matrix.clearRows(row));

        this.matrix.shiftRowsDown(row, 1);
    }

    /**
     * Returns which rows have lines that can be cleared.
     * The array of rows must be returned in descending order.
     */
    // TODO: This overly reliant on matrix maybe move to Matrix instead
    private checkLineClears() {
        return Array.from(new Set(this.getRowsOccupiedByActivePiece()))
            .filter((row) => this.matrix.rowFormsLine(row))
            .sort((row1, row2) => row2 - row1);
    }

    /**
     * Determines the rows which are occupied by the current piece.
     */
    // TODO: This overly reliant on matrix maybe move to Matrix instead
    private getRowsOccupiedByActivePiece() {
        if (this.matrix.activePiece) {
            return this.matrix.activePiece.getBlocksCoordinates().map((coordinates) => {
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
        if (this.hasGrounded) {
            this.groundedMoves += 1;
            console.log("Moves left before lock:", this.groundedMoveLimit - this.groundedMoves);
        }
        this.triggerGroundedCheck(wasRotationMove);
    }

    moveLeft() {
        if (this.matrix.activePiece?.moveLeft()) {
            this.controlledMoveFlow();
        }
    }

    moveRight() {
        if (this.matrix.activePiece?.moveRight()) {
            this.controlledMoveFlow();
        }
    }

    rotateClockwise() {
        if (this.matrix.activePiece?.rotateClockwise()) {
            this.controlledMoveFlow(true);
        }
    }

    rotateAntiClockwise() {
        if (this.matrix.activePiece?.rotateAntiClockwise()) {
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
        const unitsMoved = this.matrix.activePiece?.moveDown(this.matrix.activePiece.getHardDropUnits());

        if (unitsMoved !== undefined) {
            this.scoreJudge.addScoreByDrop(unitsMoved, DropType.HARD);
        }

        this.lockPiece();
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.contexts.intervalContext?.pauseAllIntervals();
        } else {
            this.contexts.intervalContext?.resumeAllIntervals();
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
                        this.pieceSpawner.hold(this.matrix);
                        this.spawnPieceReset();
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
        this.contexts.intervalContext?.unregisterAllIntervals();
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
        return this.contexts.controllerContext;
    }
}
