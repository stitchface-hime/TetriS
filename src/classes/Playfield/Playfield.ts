import { Game } from "@classes/Game";
import { GroupEntity } from "@classes/GroupEntity";
import { MatrixBackground } from "@classes/MatrixBackground/MatrixBackground";
import { Matrix } from "@classes/Matrix";
import { Block, Piece } from "@classes/Piece";
import { SpriteSheets } from "@data/SpriteSheets";
import { isEqual2DVectorTuples, warnIfNotInteger } from "@utils/index";
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
            warnIfNotInteger(SpriteSheets.SPR_MINO_STD.spriteSize.width * this.numColumns),
            warnIfNotInteger(SpriteSheets.SPR_MINO_STD.spriteSize.height * this.numRows),
        ];

        this.setDefaultDimensions([this.visibleDimensions[0], warnIfNotInteger((NATIVE_RESOLUTION_H + this.visibleDimensions[1]) * 0.5)]);
        this.parent = game;
        this.setRelativePosition([
            warnIfNotInteger((NATIVE_RESOLUTION_W - this.getDimensions()[0]) * 0.5),
            warnIfNotInteger(NATIVE_RESOLUTION_H - this.getDimensions()[1]),
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
     * Transforms x-y coordinates to rows and columns.
     */
    private translateToRowsColumns(coordinates: [x: number, y: number]): [row: number, column: number] {
        return [coordinates[1], coordinates[0]];
    }

    /**
     * Transforms rows and columns coordinates to x-y coordinates.
     * Syntactical sugar - performs the same function as `translateToRowsColumns`.
     */
    private translateToXY(rowCol: [row: number, column: number]): [x: number, y: number] {
        return this.translateToRowsColumns(rowCol);
    }

    /**
     * Gets the number of visible rows in the matrix which does NOT include those above the normal
     * field of play.
     */
    getTrueNumRows() {
        return this.trueNumRows;
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
        return this.blocks.length;
    }

    /**
     * Returns blocks in the matrix. (Readonly)
     */
    getBlocks(): ReadonlyArray<Block> {
        return this.blocks;
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

    getBlock(coordinates: [x: number, y: number]) {
        return this.blocks.find(this.findBlockPredicate(coordinates));
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
     * Clears a block in the matrix at specified coordinates.
     * Blocks that are coupled to this block will be decoupled.
     * Returns `Block` if it was cleared, `null` otherwise.
     */
    clearBlock(coordinates: [x: number, y: number]): Block | null {
        const blockIdx = this.getBlockIndex(coordinates);
        if (blockIdx !== -1) {
            const [block] = this.blocks.splice(blockIdx, 1);

            block.getCoupledBlocks().forEach((coupledBlock) => coupledBlock.unsetCoupledBlock(block));
            this.drawables.remove(block);

            return block;
        } else {
            return null;
        }
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
                const block = this.getBlock(this.translateToXY([rowIdx, colIdx]));

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
        return coordinates[0] < 0 || coordinates[0] >= this.numColumns || coordinates[1] < 0 || coordinates[1] >= this.trueNumRows;
    }

    /**
     * Checks whether a block is occupying a cell at a given coordinate.
     * A cell that is out of bounds is considered occupied.
     */
    hasBlockAt(coordinates: [x: number, y: number]) {
        return this.areCoordinatesOutOfBounds(coordinates) || this.getBlock(coordinates) !== undefined;
    }

    /**
     * Adds a block to the matrix. If a block already exists at that location clears existing block, then adds it.
     */
    addBlock(block: Block) {
        const activeCoordinates = block.getActiveCoordinates();

        if (this.hasBlockAt(activeCoordinates)) {
            this.clearBlock(activeCoordinates);
        }

        this.blocks.push(block);
        this.drawables.push(block);
    }

    /**
     * Adds blocks to the matrix. If a block already exists at that location clears existing block, then adds it.
     */
    addBlocks(blocks: Block[]) {
        blocks.forEach((block) => this.addBlock(block));
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
        const setRows = typeof rows === "number" ? Array.from({ length: rows }, (_v, row) => row) : rows;

        setRows.forEach((row) => {
            for (let col = 0; col < this.numColumns; col++) {
                this.addBlock(new Block(this.translateToXY([row, col]), this));
            }
        });
    }

    /**
     * Prints the matrix in array form.
     * `null` is used to represent a free cell.
     * (This is an expensive operation - Debug only)
     */
    matrixToArrays() {
        const arrays: (Block | null)[][] = new Array(this.numRows).fill(null);

        // we want each row to have a unique array
        arrays.forEach((_, rowIdx) => {
            console.log("Filling row", rowIdx);
            arrays[rowIdx] = new Array(this.numColumns).fill(null);
        });

        this.blocks.forEach((block) => {
            const [row, column] = this.translateToRowsColumns(block.getActiveCoordinates());

            arrays[row][column] = block;
        });
        console.log("Return", this.blocks);
        return arrays;
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

        const numRowsToPrint = showNonVisibleArea ? this.numRows : this.trueNumRows;

        const activePieceCoordinates = [...(this.activePiece ? this.activePiece.blocks.map((block) => block.getActiveCoordinates()) : [])];

        // reverse() reverses in-place
        const gridCopy = [...matrixArrays.slice(0, numRowsToPrint)];

        gridCopy.reverse().forEach((row, rowIdx) => {
            let rowString = "";
            row.forEach((cell, columnIdx) => {
                if (cell) {
                    rowString += "⬛";
                } else {
                    const activePieceOccupied = activePieceCoordinates.find(
                        (coordinates) => coordinates && coordinates[0] === columnIdx && coordinates[1] === numRowsToPrint - rowIdx - 1
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
