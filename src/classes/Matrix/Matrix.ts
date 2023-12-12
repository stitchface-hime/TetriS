import { GameEntity } from "@classes/GameEntity/GameEntity";
import { Block, Piece } from "@classes/Piece";
import { DrawMatrix } from "@classes/ShaderProgram";
import { SpriteSheets } from "@data/SpriteSheets";
import { isEqual2DVectorTuples, warnIfNotInteger } from "@utils/index";

export class Matrix extends GameEntity {
    private blocks: Block[] = [];
    private numRows: number;
    private numVisibleRows: number;
    private numColumns: number;

    // TODO: Is this required now that we're keeping track of blocks?
    private numCellsOccupied: number;
    private activePiece: Piece | null;

    /**
     * The play area of the game. This is the area in the scene
     * where gridlines will be rendered.
     */
    private playArea: { width: number; height: number } = {
        width: 0,
        height: 0,
    };

    protected renderer: DrawMatrix;

    /**
     * When constructing the matrix, the matrix will have twice the number of rows
     * you specify to account for blocks above the visible part of the matrix.
     */
    constructor(numRows: number, numColumns: number, renderer?: DrawMatrix) {
        super();
        this.numRows = numRows * 2;
        this.numVisibleRows = numRows;
        this.numColumns = numColumns;
        this.numCellsOccupied = 0;

        this.renderer = renderer || new DrawMatrix(this);
        this.activePiece = null;
    }

    private updateDimensions() {
        const canvas = this.gameRenderer?.getCanvas();

        if (canvas) {
            this.setDefaultDimensions([canvas.clientWidth, canvas.clientHeight]);
        }
    }

    setRenderer(renderer: DrawMatrix) {
        this.renderer = renderer;
    }

    /**
     * Sets the play area of the matrix, the game renderer must be set before calling this.
     * Also updates the dimensions of this entity.
     */
    updatePlayArea() {
        const canvas = this.gameRenderer?.getCanvas();

        if (canvas) {
            this.playArea = {
                width: warnIfNotInteger(SpriteSheets.STANDARD_MINO.spriteSize.width * this.numColumns),
                // height of matrix minus the buffer area above the rows
                height: warnIfNotInteger(SpriteSheets.STANDARD_MINO.spriteSize.height * this.numVisibleRows),
            };

            this.updateDimensions();
        } else {
            throw new Error("Could not set play area. Did you forget to set a game renderer and set its canvas?");
        }
    }

    /**
     * Gets the play area. Useful for positioning blocks within the matrix.
     */
    getPlayArea() {
        return this.playArea;
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
     * Returns blocks in the matrix. (Readonly)
     */
    getBlocks(): ReadonlyArray<Block> {
        return this.blocks;
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

    private findBlockPredicate = (coordinates: [x: number, y: number]) => (block: Block) => isEqual2DVectorTuples(block.getActiveCoordinates(), coordinates);

    getBlock(coordinates: [x: number, y: number]) {
        return this.blocks.find(this.findBlockPredicate(coordinates));
    }

    /**
     * Returns the index of the block with coordinates is found in the array, -1 otherwise.
     */
    private getBlockIndex(coordinates: [x: number, y: number]) {
        return this.blocks.findIndex(this.findBlockPredicate(coordinates));
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
            this.numCellsOccupied -= 1;

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

    private areCoordinatesOutOfBounds(coordinates: [x: number, y: number]) {
        return coordinates[0] < 0 || coordinates[0] >= this.numColumns || coordinates[1] < 0 || coordinates[1] >= this.numRows;
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
        this.numCellsOccupied += 1;
    }

    /**
     * Adds blocks to the matrix. If a block already exists at that location clears existing block, then adds it.
     */
    addBlocks(blocks: Block[]) {
        blocks.forEach((block) => this.addBlock(block));
    }

    /**
     * Locks the active piece and blocks will become part of the matrix.
     */
    lockActivePiece() {
        if (this.activePiece) {
            // blocks will no longer be tied to a piece
            this.activePiece.lockPiece();

            this.addBlocks(this.activePiece.getBlocks());
        }

        this.activePiece = null;
    }
    // Debug methods (do not use in production)

    /**
     * Adds some blocks to the matrix at supplied coordinates. (Debug only)
     */
    addBlocksByCoordinates(coordinatesList: [x: number, y: number][]) {
        coordinatesList.forEach((coordinates) => {
            this.addBlock(new Block(coordinates, this));
            this.numCellsOccupied += 1;
        });
    }

    /**
     * Removes some blocks in the matrix at supplied coordinates. (Debug only)
     */
    removeBlocks(coordinatesList: [x: number, y: number][]) {
        coordinatesList.forEach((coordinates) => {
            this.clearBlock(coordinates);
            this.numCellsOccupied -= 1;
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

        const numRowsToPrint = showNonVisibleArea ? this.numRows : this.numVisibleRows;

        const activePieceCoordinates = [...(this.activePiece ? this.activePiece.getBlocks().map((block) => block.getActiveCoordinates()) : [])];

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
        console.log("Occupied cells:", this.numCellsOccupied);
        console.log("\n");
    }

    async draw() {
        this.updatePlayArea();
        this.renderer.draw();
    }
}
