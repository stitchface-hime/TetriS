import { GameEntity } from "@classes/GameEntity/GameEntity";
import { Block, Piece } from "@classes/Piece";

export class Matrix extends GameEntity {
    private grid: (Block | null)[][];
    private numRows: number;
    private numVisibleRows: number;
    private numColumns: number;
    private numCellsOccupied: number;
    private activePiece: Piece | null;

    /**
     * When constructing the matrix, the matrix will have twice the number of rows
     * you specify to account for blocks above the visible part of the matrix.
     */
    constructor(numRows: number, numColumns: number) {
        super();
        this.numRows = numRows * 2;
        this.numVisibleRows = numRows;
        this.numColumns = numColumns;
        this.numCellsOccupied = 0;

        // the assignment directly below is used to satisfy type check
        this.grid = new Array(this.numRows).fill(
            new Array(this.numColumns).fill(null)
        );

        // we want each row to have a unique array
        this.grid.forEach((_, rowIdx) => {
            this.grid[rowIdx] = new Array(this.numColumns).fill(null);
        });

        this.activePiece = null;
    }

    /**
     * Transforms x-y coordinates to rows and columns.
     */
    private translateToRowsColumns(
        coordinates: [x: number, y: number]
    ): [row: number, column: number] {
        return [coordinates[1], coordinates[0]];
    }

    /**
     * Gets the number of visible rows in the matrix which does NOT include those above the normal
     * field of play.
     */
    getNumVisibleRows() {
        return this.numVisibleRows;
    }

    /**
     * Gets the number of rows in the matrix which includes those above the normal
     * field of play.
     */
    getNumRows() {
        return this.numRows;
    }

    /**
     * Gets the number of columns in the matrix.
     */
    getNumColumns() {
        return this.numColumns;
    }

    /**
     * Gets the number of cells occupied by blocks.
     */
    getNumCellsOccupied() {
        return this.numCellsOccupied;
    }

    /**
     * Returns the grid of the matrix. (Readonly)
     */
    getGrid(): ReadonlyArray<ReadonlyArray<Block | null>> {
        return this.grid;
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
    shiftRowsDown(startingRow: number, numRows = 1) {
        const rows = this.grid.splice(startingRow, numRows);
        this.grid.push(...rows);
    }

    /**
     * Determines whether the given row forms a line.
     */
    rowFormsLine(row: number) {
        const selectedRow = this.grid[row];

        if (selectedRow) {
            return selectedRow.reduce(
                (isRowFilled, currentCell) =>
                    isRowFilled && currentCell !== null,
                true
            );
        }

        return false;
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
                    .forEach((coupledBlock) =>
                        coupledBlock.unsetCoupledBlock(block)
                    );
            }
            gridRow[column] = null;
            this.numCellsOccupied -= 1;
        }
    }

    /**
     * Clears blocks in a range of rows.
     * When clearing lines don't forget to shift rows down.
     * @param from clear rows starting from this row
     * @param to Optional - clear up to this row (non-inclusive)
     */
    clearRows(from: number, to = from + 1) {
        for (let rowIdx = from; rowIdx < to; rowIdx++) {
            const gridRow = this.grid[rowIdx];

            if (gridRow) {
                gridRow.forEach((block, colIdx) => {
                    if (block) {
                        this.clearBlock([colIdx, rowIdx]);
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
        const activeCoordinates = block.getActiveCoordinates();

        if (activeCoordinates) {
            const [row, column] =
                this.translateToRowsColumns(activeCoordinates);

            const gridRow = this.grid[row];

            // only perform the check if the row and columns are in bounds
            if (gridRow) {
                gridRow[column] = block;
                this.numCellsOccupied += 1;
            }
        }
    }

    /**
     * Locks the active piece and blocks will become part of the matrix.
     */
    lockActivePiece() {
        if (this.activePiece) {
            // blocks will no longer be tied to a piece
            this.activePiece.lockPiece();
            this.activePiece
                .getBlocks()
                .forEach((block) => this.addBlock(block));
        }

        this.activePiece = null;
    }
    // Debug methods (do not use in production)

    /**
     * Adds some blocks to the matrix at supplied coordinates. (Debug only)
     */
    addBlocks(coordinates: [x: number, y: number][]) {
        coordinates.forEach((coordinate) => {
            const [row, column] = this.translateToRowsColumns(coordinate);
            const gridRow = this.grid[row];

            if (gridRow) {
                gridRow[column] = new Block([column, row], this);
                this.numCellsOccupied += 1;
            }
        });
    }

    /**
     * Removes some blocks in the matrix at supplied coordinates. (Debug only)
     */
    removeBlocks(matrixCoordinates: [x: number, y: number][]) {
        matrixCoordinates.forEach((coordinate) => {
            const [row, column] = this.translateToRowsColumns(coordinate);
            const gridRow = this.grid[row];

            if (gridRow) {
                gridRow[column] = null;
                this.numCellsOccupied -= 1;
            }
        });
    }

    /**
     * Fills the rows of a matrix. Supply a number `n` to fill rows from 0 to `n - 1`, or supply an
     * array of list numbers to fill rows individually. (Debug only)
     */
    addBlockRows(rows: number | number[]) {
        if (Array.isArray(rows)) {
            rows.forEach((row) => {
                const gridRow = this.grid[row];

                if (gridRow) {
                    for (let i = 0; i < this.numColumns; i++) {
                        gridRow[i] = new Block([i, row], this);
                        this.numCellsOccupied += 1;
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
                        this.numCellsOccupied += 1;
                    }
                }
            }
        }
    }

    /**
     * Prints the matrix. You can also specify if you would like the
     * non-visible part of the matrix to be printed as well and if you
     * would like the row numbers printed as well. (Debug only)
     *
     * `⬜` = occupied cell
     *
     * `⬛` = free cell
     *
     * `🟩` = active piece
     */
    printMatrix(showNonVisibleArea = false, showRowNumbers = false) {
        const numRowsToPrint = showNonVisibleArea
            ? this.numRows
            : this.numVisibleRows;

        const activePieceCoordinates = [
            ...(this.activePiece
                ? this.activePiece
                      .getBlocks()
                      .map((block) => block.getActiveCoordinates())
                : []),
        ];

        // reverse() reverses in-place
        const gridCopy = [...this.grid.slice(0, numRowsToPrint)];

        gridCopy.reverse().forEach((row, rowIdx) => {
            let rowString = "";
            row.forEach((cell, columnIdx) => {
                if (cell) {
                    rowString += "⬛";
                } else {
                    const activePieceOccupied = activePieceCoordinates.find(
                        (coordinates) =>
                            coordinates &&
                            coordinates[0] === columnIdx &&
                            coordinates[1] === numRowsToPrint - rowIdx - 1
                    );
                    if (activePieceOccupied) {
                        rowString += "🟩";
                    } else {
                        rowString += "⬜";
                    }
                }
            });

            // add row number if specified
            if (showRowNumbers) {
                rowString += ` | ${gridCopy.length - 1 - rowIdx}`;
            }
            console.log(rowString);
        });
        console.log("Occupied cells:", this.numCellsOccupied);
        console.log("\n");
    }

    draw() {
        // TODO:
    }
}
