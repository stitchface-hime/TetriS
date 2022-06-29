import { Block, Piece } from "@classes/Piece";

export class Matrix {
  private grid: (Block | null)[][];
  private numRows: number;
  private numColumns: number;
  private numCellsOccupied: number;
  private activePiece: Piece | null;

  constructor(numRows: number, numColumns: number) {
    this.numRows = numRows;
    this.numColumns = numColumns;
    this.numCellsOccupied = 0;

    // line directly below to satify type check
    this.grid = new Array(numRows).fill(new Array(numColumns).fill(null));
    // we want each row to have a unique array
    this.grid.forEach((_, rowIdx) => {
      this.grid[rowIdx] = new Array(numColumns).fill(null);
    });

    this.activePiece = null;
  }

  private translateToRowsColumns(
    coordinates: [x: number, y: number]
  ): [row: number, column: number] {
    return [coordinates[1], coordinates[0]];
  }

  /**
   * Sets the active piece within the matrix.
   */
  setActivePiece(piece: Piece) {
    this.activePiece = piece;
  }

  /**
   * Unsets the active piece within the matrix.
   */
  unsetActivePiece() {
    this.activePiece = null;
  }

  /**
   * Shifts all rows above a starting row down a specified number of rows.
   * Used when clearing lines to bubble up the blank rows to the top of the matrix.
   */
  shiftRowsDown(startingRow: number, numRows: number) {
    const rows = this.grid.splice(startingRow, numRows);
    this.grid.push(...rows);
  }

  /**
   * Clears a block in the matrix at specified coordinates.
   * Blocks that are coupled to this block will be decoupled.
   */
  clearBlock(coordinates: [x: number, y: number]) {
    const [row, column] = this.translateToRowsColumns(coordinates);
    const gridRow = this.grid[row];

    if (gridRow) {
      const block = gridRow[column];
      if (block) {
        block
          .getCoupledBlocks()
          .forEach((coupledBlock) => coupledBlock.unsetCoupledBlock(block));
      }
      gridRow[column] = null;
    }
  }

  /**
   * Clears blocks in a range of rows.
   * When clearing lines don't forget to shift rows down.
   * @param from clear rows starting from this row
   * @param to Optional - clear up to this row (non-inclusive)
   */
  clearRows(from: number, to = from + 1) {
    for (let i = from; i < to; i++) {
      const gridRow = this.grid[i];

      if (gridRow) {
        gridRow.forEach((block) => {
          if (block) {
            this.clearBlock(block.getGlobalCoordinates());
          }
        });
      }
    }
  }

  /**
   * Checks whether a block is occupying a cell at a given coordinate.
   */
  hasBlockAt(coordinates: [x: number, y: number]) {
    const [row, column] = this.translateToRowsColumns(coordinates);

    const gridRow = this.grid[row];

    // only perform the check if the row and columns are in bounds
    if (gridRow && column >= 0 && column < this.numColumns) {
      return !!gridRow[column];
    }

    // if out of bounds consider it to be occupied
    return true;
  }

  /**
   * Adds a block to the matrix.
   */
  addBlock(block: Block) {
    const [row, column] = this.translateToRowsColumns(
      block.getGlobalCoordinates()
    );

    const gridRow = this.grid[row];

    // only perform the check if the row and columns are in bounds
    if (gridRow) {
      gridRow[column] = block;
    }
  }

  /**
   * Locks the active piece and blocks will become part of the matrix.
   */
  lockActivePiece() {
    if (this.activePiece) {
      // blocks will no longer be tied to a piece
      this.activePiece.lockPiece();
      this.activePiece.getBlocks().forEach((block) => this.addBlock(block));
    }

    this.activePiece = null;
  }
  // Debug methods (do not use in production)

  /**
   * Adds some blocks to the matrix at supplied coordinates.
   */
  addBlocks(coordinates: [x: number, y: number][]) {
    coordinates.forEach((coordinate) => {
      const [row, column] = this.translateToRowsColumns(coordinate);
      const gridRow = this.grid[row];

      if (gridRow) {
        gridRow[column] = new Block([column, row], this);
      }
    });
  }

  /**
   * Removes some blocks in the matrix at supplied coordinates.
   */
  removeBlocks(matrixCoordinates: [x: number, y: number][]) {
    matrixCoordinates.forEach((coordinate) => {
      const [row, column] = this.translateToRowsColumns(coordinate);
      const gridRow = this.grid[row];

      if (gridRow) {
        gridRow[column] = null;
      }
    });
  }

  /**
   * Fills the rows of a matrix. Supply a number `n` to fill rows from 0 to `n - 1`, or supply an
   * array of list numbers to fill rows individually
   */
  addBlockRows(rows: number | number[]) {
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        const gridRow = this.grid[row];

        if (gridRow) {
          for (let i = 0; i < this.numColumns; i++) {
            gridRow[i] = new Block([i, row], this);
          }
        }
      });
    } else {
      for (let i = 0; i < rows; i++) {
        const gridRow = this.grid[i];

        if (gridRow) {
          for (let j = 0; j < this.numColumns; j++) {
            // j = columns, x; i = rows, y
            gridRow[j] = new Block([j, i], this);
          }
        }
      }
    }
  }

  /**
   * Prints the matrix.
   *
   * `⬜` = occupied cell
   *
   * `⬛` = free cell
   *
   * `🟩` = active piece
   */
  printMatrix() {
    const activePieceCoordinates = [
      ...(this.activePiece
        ? this.activePiece
            .getBlocks()
            .map((block) => block.getGlobalCoordinates())
        : []),
    ];

    // reverse() reverses in-place
    const gridCopy = [...this.grid];

    gridCopy.reverse().forEach((row, rowIdx) => {
      let rowString = "";
      row.forEach((cell, columnIdx) => {
        if (cell) {
          rowString += "⬛";
        } else {
          const activePieceOccupied = activePieceCoordinates.find(
            (coordinates) =>
              coordinates[0] === columnIdx &&
              coordinates[1] === this.numRows - rowIdx - 1
          );
          if (activePieceOccupied) {
            rowString += "🟩";
          } else {
            rowString += "⬜";
          }
        }
      });
      console.log(rowString);
    });
    console.log("\n");
  }
}
