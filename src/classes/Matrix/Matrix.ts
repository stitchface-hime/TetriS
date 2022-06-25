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

  /**
   * Sets the active piece within the matrix.
   */
  setActivePiece(piece: Piece) {
    this.activePiece = piece;
  }

  /**
   * Checks whether a block is occupying a cell at a given coordinate.
   */
  hasBlockAt(coordinates: [x: number, y: number]) {
    const [column, row] = coordinates;

    const gridRow = this.grid[row];

    // only perform the check if the row and columns are in bounds
    if (gridRow && column >= 0 && column < this.numColumns) {
      return !!gridRow[column];
    }

    // if out of bounds consider it to be occupied
    return true;
  }

  /**
   * Fills the matrix with some blocks at supplied coordinates.
   */
  fillMatrix(coordinates: [x: number, y: number][]) {
    coordinates.forEach((coordinate) => {
      const gridRow = this.grid[coordinate[1]];

      if (gridRow) {
        gridRow[coordinate[0]] = new Block(coordinate, this);
      }
    });
  }

  /**
   * Prints the matrix.
   *
   * `[O]` = occupied cell
   *
   * `[_]` = free cell
   *
   * `[■]` = active piece
   */
  printMatrix() {
    const activePieceCoordinates = [
      ...(this.activePiece
        ? this.activePiece
            .getBlocks()
            .map((block) => block.getGlobalCoordinates())
        : []),
    ];
    this.grid.reverse().forEach((row, rowIdx) => {
      let rowString = "";
      row.forEach((cell, columnIdx) => {
        if (cell) {
          rowString += "[O]";
        } else {
          const activePieceOccupied = activePieceCoordinates.find(
            (coordinates) =>
              coordinates[0] === columnIdx &&
              coordinates[1] === this.numRows - rowIdx - 1
          );
          if (activePieceOccupied) {
            rowString += "[■]";
          } else {
            rowString += "[_]";
          }
        }
      });
      console.log(rowString);
    });
  }
}
