import { GroupEntity } from "@classes/GroupEntity";
import { Block } from "@classes/Piece/Block";
import { SpriteSheets } from "@data/SpriteSheets";
import { isEqual2DVectorTuples } from "@utils/index";

/**
 * A matrix is a container in which blocks exist.
 */
export class Matrix extends GroupEntity {
    protected _blocks: Block[] = [];
    private _numRows: number;
    private _numColumns: number;

    constructor(numRows: number, numColumns: number) {
        super();
        this._numRows = numRows;
        this._numColumns = numColumns;

        this.setDefaultDimensions([SpriteSheets.SPR_MINO_STD.spriteSize.width * numColumns, SpriteSheets.SPR_MINO_STD.spriteSize.width * numRows]);
    }

    /**
     * Returns blocks in the matrix.
     */
    protected get blocks(): Block[] {
        return this._blocks;
    }

    protected set blocks(blocks: Block[]) {
        this._blocks = blocks;
    }

    /**
     * Returns a shallow copy of the blocks in the matrix.
     */
    getBlocks() {
        return [...this.blocks];
    }

    get numRows() {
        return this._numRows;
    }

    get numColumns() {
        return this._numColumns;
    }

    /**
     * Gets the number of cells occupied by blocks.
     */
    getNumCellsOccupied() {
        return this.blocks.length;
    }

    protected areCoordinatesOutOfBounds(coordinates: [x: number, y: number]) {
        return coordinates[0] < 0 || coordinates[0] >= this._numColumns || coordinates[1] < 0 || coordinates[1] >= this._numRows;
    }

    /**
     * Checks whether a block is occupying a cell at a given coordinate.
     * A cell that is out of bounds is considered occupied.
     */
    hasBlockAt(coordinates: [x: number, y: number]) {
        return this.areCoordinatesOutOfBounds(coordinates) || this.getBlock(coordinates) !== undefined;
    }

    protected findBlockPredicate = (coordinates: [x: number, y: number]) => (block: Block) => isEqual2DVectorTuples(block.getActiveCoordinates(), coordinates);

    getBlock(coordinates: [x: number, y: number]) {
        return this.blocks.find(this.findBlockPredicate(coordinates));
    }

    /**
     * Returns the index of the block with coordinates is found in the array, -1 otherwise.
     */
    protected getBlockIndex(coordinates: [x: number, y: number]) {
        return this.blocks.findIndex(this.findBlockPredicate(coordinates));
    }

    /**
     * Adds a block to the matrix. If a block already exists at that location clears existing block, then adds it.
     */
    addBlock(block: Block) {
        const activeCoordinates = block.getActiveCoordinates();

        if (this.hasBlockAt(activeCoordinates)) {
            this.clearBlock(activeCoordinates);
        }

        this.blocks = [...this.blocks, block];
        this.drawables.push(block);
    }

    /**
     * Adds blocks to the matrix. If a block already exists at that location clears existing block, then adds it.
     */
    addBlocks(blocks: Block[]) {
        blocks.forEach((block) => this.addBlock(block));
    }

    /**
     * Clears a block in the matrix at specified coordinates.
     * Blocks that are coupled to this block will be decoupled.
     * Returns `Block` if it was cleared, `null` otherwise.
     */
    clearBlock(coordinates: [x: number, y: number]): Block | null {
        const blocks = [...this.blocks];

        const blockIdx = this.getBlockIndex(coordinates);
        if (blockIdx !== -1) {
            const [block] = blocks.splice(blockIdx, 1);

            block.getCoupledBlocks().forEach((coupledBlock) => coupledBlock.unsetCoupledBlock(block));
            this.drawables.remove(block);

            this.blocks = blocks;
            return block;
        } else {
            return null;
        }
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
            const [row, column] = Matrix.translateToRowsColumns(block.getActiveCoordinates());

            arrays[row][column] = block;
        });
        console.log("Return", this.blocks);
        return arrays;
    }

    /**
     * Transforms x-y coordinates to rows and columns.
     */
    static translateToRowsColumns(coordinates: [x: number, y: number]): [row: number, column: number] {
        return [coordinates[1], coordinates[0]];
    }

    /**
     * Transforms rows and columns coordinates to x-y coordinates.
     * Syntactical sugar - performs the same function as `translateToRowsColumns`.
     */
    static translateToXY(rowCol: [row: number, column: number]): [x: number, y: number] {
        return Matrix.translateToRowsColumns(rowCol);
    }
}
