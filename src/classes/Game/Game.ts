import { Matrix } from "@classes/Matrix";
import { Piece } from "@classes/Piece";
import { PieceFactory, PieceId } from "@classes/PieceFactory";
import { PieceQueue } from "@classes/PieceQueue";

class Game {
  private numRows: number;
  private numColumns: number;

  private matrix: Matrix;
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
  private gravity = 1;

  private lockDelayFrameLimit = 30;
  private lockDelayFrames = 0;

  private highestGroundedRow = 0;

  private groundedMoveLimit = 15;
  private groundedMoves = 0;

  private grounded = false;

  private canHold = true;

  private gamePaused = false;

  constructor(numRows: number, numColumns: number, pieceQueue: PieceQueue) {
    this.pieceFactory = new PieceFactory();
    this.numRows = numRows;
    this.numColumns = numColumns;
    this.matrix = new Matrix(numRows, numColumns);
    this.nextQueue = pieceQueue;
  }

  /* Game flow methods */

  /**
   * Ticks the game and decides what happens in the given frame.
   */
  private tick() {
    if (!this.activePiece) {
      this.resetLockDelay();
      this.spawnNextPiece();
    } else {
      this.dropFlow();
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
   * Spawn a piece with the given piece id.
   */
  private spawnPiece(pieceId?: PieceId) {
    this.activePiece = this.pieceFactory.makePiece(
      // TODO: create a spawn table for minos
      [4, 19],
      this.matrix,
      pieceId
    );
  }

  /**
   * Spawn the next piece from the next queue.
   */
  private spawnNextPiece() {
    this.spawnPiece(this.nextQueue.shiftNext());
  }

  /**
   * Get the next `numNext` piece ids from the next queue (Default: 4).
   */
  getNextQueue(numNext = 4) {
    this.nextQueue.getNext(numNext);
  }

  /**
   * Get the coordinates of where the ghost piece will be.
   */
  getGhostPieceCoordinates() {
    if (this.activePiece) {
      const activePieceCoordinates = this.activePiece.getBlocksCoordinates();

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
   * Locks the active piece.
   */
  private lockPiece() {
    this.matrix.lockActivePiece();
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
}
