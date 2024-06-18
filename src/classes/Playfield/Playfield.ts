import { Game } from "@classes/Game";
import { MatrixBackground } from "@classes/MatrixBackground/MatrixBackground";
import { Matrix } from "@classes/Matrix";
import { Block, Piece } from "@classes/Piece";
import { SpriteSheets } from "@data/SpriteSheets";
import { warnIfNotInteger } from "@utils/index";
import { NATIVE_RESOLUTION_H, NATIVE_RESOLUTION_W } from "src/constants";

export class Playfield extends Matrix {
    private trueNumRows: number;

    private _activePiece: Piece | null = null;

    private background: MatrixBackground;

    private visibleDimensions: [width: number, height: number];

    /**
     * When constructing the matrix, the matrix will have twice the number of rows
     * you specify to account for blocks above the visible part of the matrix.
     */
    constructor(numRows: number, numColumns: number, game: Game) {
        super(numRows, numColumns);

        this.trueNumRows = numRows * 2;

        this.visibleDimensions = [
            warnIfNotInteger(
                SpriteSheets.SPR_mino.spriteSize.width * this.numColumns
            ),
            warnIfNotInteger(
                SpriteSheets.SPR_mino.spriteSize.height * this.numRows
            ),
        ];

        this.defaultDimensions = [
            this.visibleDimensions[0],
            warnIfNotInteger(
                (NATIVE_RESOLUTION_H + this.visibleDimensions[1]) * 0.5
            ),
        ];
        this.parent = game;
        this.goToRelativePosition([
            warnIfNotInteger((NATIVE_RESOLUTION_W - this.dimensions[0]) * 0.5),
            warnIfNotInteger(NATIVE_RESOLUTION_H - this.dimensions[1]),
        ]);

        // Background for the matrix
        this.background = new MatrixBackground(this);
        this.drawables.push(this.background);

        this.background.parent = this;
    }

    get activePiece() {
        return this._activePiece;
    }

    set activePiece(piece: Piece | null) {
        if (piece !== null) {
            this.drawables.push(piece);
        } else {
            if (this.activePiece === null) return;
            this.activePiece.destroy();
            this.drawables.remove(this.activePiece);
        }
        this._activePiece = piece;
    }

    /**
     * Gets the visible dimensions within the matrix. Useful for positioning blocks within the matrix.
     */
    getVisibleDimensions() {
        return this.visibleDimensions;
    }

    /**
     * Gets the number of visible rows in the matrix which does NOT include those above the normal
     * field of play.
     */
    getTrueNumRows() {
        return this.trueNumRows;
    }

    /**
     * Shifts all rows above a starting row down a specified number of rows.
     * Used when clearing lines to bubble up the blank rows to the top of the matrix.
     * Call after clearing blocks.
     */
    shiftRowsDown(startingRow: number, numRows = 1) {
        const minRowToShift = startingRow + numRows;

        this.blocks.forEach((block) => {
            if (block.getActiveCoordinates()[1] >= minRowToShift) {
                block.moveDown(numRows, true);
            }
        });
    }

    /**
     * Determines whether the given row forms a line.
     */
    rowFormsLine(row: number) {
        for (let column = 0; column < this.numColumns; column++) {
            if (!this.getBlock([column, row])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Clears blocks in a range of rows, regardless if the rows are fully filled.
     * When clearing lines don't forget to shift rows down.
     * @param from clear rows starting from this row
     * @param to Optional - clear up to this row (non-inclusive)
     * @returns All `Block`s cleared.
     */
    clearRows(from: number, to = from + 1): Block[] {
        const blocksCleared: Block[] = [];
        for (let rowIdx = from; rowIdx < to; rowIdx++) {
            for (let colIdx = 0; colIdx < this.numColumns; colIdx++) {
                const block = this.getBlock(
                    Playfield.translateToXY([rowIdx, colIdx])
                );

                if (block) {
                    const clearedBlock = this.clearBlock([colIdx, rowIdx]);
                    if (clearedBlock) {
                        blocksCleared.push(clearedBlock);
                    }
                }
            }
        }

        return blocksCleared;
    }

    protected areCoordinatesOutOfBounds(coordinates: [x: number, y: number]) {
        return (
            coordinates[0] < 0 ||
            coordinates[0] >= this.numColumns ||
            coordinates[1] < 0 ||
            coordinates[1] >= this.trueNumRows
        );
    }

    /**
     * Locks the active piece and blocks will become part of the matrix.
     * Note that this does not unset the active piece, this will need to be done separately.
     */
    lockActivePiece() {
        if (!this.activePiece) return;
        this.addBlocks(this.activePiece.blocks);
    }
    // Debug methods (do not use in production)

    /**
     * Adds some blocks to the matrix at supplied coordinates. (Debug only)
     */
    addBlocksByCoordinates(coordinatesList: [x: number, y: number][]) {
        coordinatesList.forEach((coordinates) => {
            this.addBlock(new Block(coordinates, this));
        });
    }

    /**
     * Removes some blocks in the matrix at supplied coordinates. (Debug only)
     */
    removeBlocks(coordinatesList: [x: number, y: number][]) {
        coordinatesList.forEach((coordinates) => {
            this.clearBlock(coordinates);
        });
    }

    /**
     * Fills the rows of a matrix. Supply a number `n` to fill rows from 0 to `n - 1`, or supply an
     * array of row numbers to fill rows individually. (Debug only)
     */
    addBlockRows(rows: number | number[]) {
        const setRows =
            typeof rows === "number"
                ? Array.from({ length: rows }, (_v, row) => row)
                : rows;

        setRows.forEach((row) => {
            for (let col = 0; col < this.numColumns; col++) {
                this.addBlock(
                    new Block(Playfield.translateToXY([row, col]), this)
                );
            }
        });
    }

    /**
     * Prints the matrix. You can also specify if you would like the
     * non-visible part of the matrix to be printed as well and if you
     * would like the row numbers printed as well. (This is an expensive operation - Debug only)
     *
     * `⬜` = occupied cell
     *
     * `⬛` = free cell
     *
     * `🟩` = active piece
     */
    printMatrix(showNonVisibleArea = false, showRowNumbers = false) {
        const matrixArrays = this.matrixToArrays();

        const numRowsToPrint = showNonVisibleArea
            ? this.numRows
            : this.trueNumRows;

        const activePieceCoordinates = [
            ...(this.activePiece
                ? this.activePiece.blocks.map((block) =>
                      block.getActiveCoordinates()
                  )
                : []),
        ];

        // reverse() reverses in-place
        const gridCopy = [...matrixArrays.slice(0, numRowsToPrint)];

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
        console.log("Occupied cells:", this.getNumCellsOccupied());
        console.log("\n");
    }
}
