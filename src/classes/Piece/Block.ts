import { Matrix } from "@classes/Matrix";
import { Piece } from "./Piece";
import { Connection } from "@data/Connection";
import { GameEntity } from "@classes/GameEntity/GameEntity";
import { SpriteSheets } from "@data/SpriteSheets";
import { DrawSprite } from "@classes/ShaderProgram";
import { SpriteSheet } from "src/shaders/types";

/**
 * A block is a single unit that takes up one cell in the matrix.
 * It can be connected to one or more other blocks to form a piece.
 */
export class Block extends GameEntity {
    /**
     * The coordinates of the block in the matrix.
     * NOTE: `x` refers to columns and `y` refers to the rows!
     */
    private activeCoordinates: [x: number, y: number];
    private color: string;
    private matrix: Matrix;
    /**
     * The blocks that are coupled to this block in cardinal directions.
     */
    private coupledBlocks: Block[];
    /**
     * A 4-bit number to represent where the coupled blocks are.
     * A `0` bit representing no connection and a `1` bit representing a connection.
     * The bit order is top, right, bottom, left. For example, if the coupled blocks are to the left and on top of this block, this value will be
     * 9 (`1001`). This needs to be updated everytime the piece rotates.
     */
    private connections: number;
    /**
     * The piece this block belongs to. If `undefined`,
     * this block is locked in the matrix.
     */
    private associatedPiece: Piece | undefined;

    constructor(
        globalCoordinates: [x: number, y: number],
        matrix: Matrix,
        color: string = "",
        coupledBlocks: Block[] = []
    ) {
        super({ spriteSheetDatas: [SpriteSheets.STANDARD_MINO] });
        this.setActiveSpriteSheetData(SpriteSheets.STANDARD_MINO.id);

        this.activeCoordinates = globalCoordinates;
        this.matrix = matrix;
        this.color = color;

        this.coupledBlocks = [];
        this.setCoupledBlocks(coupledBlocks);

        this.associatedPiece = undefined;
        this.connections = 0;
    }

    getActiveCoordinates() {
        return this.activeCoordinates;
    }

    /**
     * Gets the blocks coupled to this block.
     */
    getCoupledBlocks() {
        return this.coupledBlocks;
    }

    /**
     * Gets how the block is connected to its coupled blocks.
     */
    getConnections() {
        return this.connections;
    }

    getColor() {
        return this.color;
    }

    setColor(color: string) {
        this.color = color;
    }

    /**
     * Determines where the coupled block is relative to this block.
     * If this block is not in a cardinal direction to the coupled block returns undefined.
     */
    private determineConnection(coupledBlock: Block) {
        const [thisX, thisY] = this.activeCoordinates;
        const [coupledX, coupledY] = coupledBlock.getActiveCoordinates();

        if (coupledX > thisX) return Connection.RIGHT;
        if (coupledX < thisX) return Connection.LEFT;
        if (coupledY > thisY) return Connection.TOP;
        if (coupledY < thisY) return Connection.BOTTOM;

        return undefined;
    }

    /**
     * Updates the connections property of this block.
     * Should be called if this block is a part of a piece and the piece rotates.
     */
    updateConnections() {
        this.connections = 0;
        this.coupledBlocks.forEach((block) => {
            const coupledConnection = this.determineConnection(block);
            if (coupledConnection !== undefined) {
                this.connections |= coupledConnection;
            }
        });

        // each sprite in the mino sprite sheet corresponds to a connection index
        this.setActiveSpriteByIndex(this.connections);
    }

    /**
     * Set the blocks that will be coupled with this block in cardinal directions.
     */
    setCoupledBlocks(blocks: Block[]) {
        this.coupledBlocks = blocks;

        // also set connection
        this.updateConnections();
    }

    /**
     * This will unset a block as being coupled with this block.
     *
     *
     * NOTE: This uses the reference of the coupled block to remove it.
     * If a block is about to be cleared from the matrix, be sure to call this
     * method on all its coupled blocks.
     */
    unsetCoupledBlock(blockToUnset: Block) {
        this.coupledBlocks = this.coupledBlocks.filter(
            (block) => block !== blockToUnset
        );

        // also update connection
        this.updateConnections();
    }

    registerPiece(piece: Piece) {
        this.associatedPiece = piece;
    }

    unregisterPiece() {
        this.associatedPiece = undefined;
    }

    /**
     * Determines if the block can move down a specified number of units (default: 1 unit).
     * If the block cannot move the specified number of units, it will move as many units down
     * possible.
     * @returns number of units moved.
     */
    canMoveDown(units = 1) {
        const activeCoordinates = this.activeCoordinates;
        let unitsMoved = 0;

        if (activeCoordinates) {
            for (
                let i = activeCoordinates[1] - 1;
                i >= activeCoordinates[1] - units;
                i--
            ) {
                if (!this.matrix.hasBlockAt([activeCoordinates[0], i])) {
                    unitsMoved += 1;
                } else {
                    break;
                }
            }
        }

        /* 
    if new y-coordinate doesn't differ from current y-coordinate,
    it means the piece didn't move and the move has failed.
    */
        return unitsMoved;
    }

    /**
     * Move the block down a specified number of units. (Default: 1 unit)
     */
    moveDown(units = 1) {
        this.activeCoordinates = [
            this.activeCoordinates[0],
            this.activeCoordinates[1] - this.canMoveDown(units),
        ];
    }

    /**
     * Determines if the block can move left a specified number of units (default: 1 unit).
     * If the block cannot move the specified number of units, it will move as many units left
     * possible.
     * @returns number of units moved.
     */
    canMoveLeft(units = 1) {
        const activeCoordinates = this.activeCoordinates;
        let unitsMoved = 0;

        for (
            let i = activeCoordinates[0] - 1;
            i >= activeCoordinates[0] - units;
            i--
        ) {
            if (!this.matrix.hasBlockAt([i, activeCoordinates[1]])) {
                unitsMoved += 1;
            } else {
                break;
            }
        }

        /* 
    if new x-coordinate doesn't differ from current x-coordinate,
    it means the piece didn't move and the move has failed.
    */
        return unitsMoved;
    }

    /**
     * Move the block left a specified number of units. (Default: 1 unit)
     */
    moveLeft(units = 1) {
        this.activeCoordinates = [
            this.activeCoordinates[0] - this.canMoveLeft(units),
            this.activeCoordinates[1],
        ];
    }

    /**
     * Determines if the block can move right a specified number of units (default: 1 unit).
     * If the block cannot move the specified number of units, it will move as many units right
     * possible.
     * @returns a tuple containing number of units moved, the x-coordinate after potential movement
     * and whether or not the move would be successful. Movement of 0 is unsuccessful.
     */
    canMoveRight(units = 1) {
        const activeCoordinates = this.activeCoordinates;
        let unitsMoved = 0;

        for (
            let i = activeCoordinates[0] + 1;
            i <= activeCoordinates[0] + units;
            i++
        ) {
            if (!this.matrix.hasBlockAt([i, activeCoordinates[1]])) {
                unitsMoved += 1;
            } else {
                break;
            }
        }

        /* 
    if new x-coordinate doesn't differ from current x-coordinate,
    it means the piece didn't move and the move has failed.
    */
        return unitsMoved;
    }

    /**
     * Move the block right a specified number of units.
     */
    moveRight(units = 1) {
        this.activeCoordinates = [
            this.activeCoordinates[0] + this.canMoveRight(units),
            this.activeCoordinates[1],
        ];
    }

    /**
     * Translates block a certain number of x or y units relative from its current position.
     * Callable only if block is part of an active piece.
     * (Should only be used for piece rotation only.)
     * @returns a tuple containing the coordinates after potential translation
     * and whether or not the move would be successful.
     */
    canTranslate(
        xUnits = 0,
        yUnits = 0
    ): { newCoordinates: [x: number, y: number]; canTranslate: boolean } {
        let [newX, newY] = this.activeCoordinates;

        const potentialX = this.activeCoordinates[0] + xUnits;
        const potentialY = this.activeCoordinates[1] + yUnits;

        const canTranslate = !this.matrix.hasBlockAt([potentialX, potentialY]);

        if (canTranslate) {
            newX = potentialX;
            newY = potentialY;
        }

        return { newCoordinates: [newX, newY], canTranslate };
    }

    /**
     * Translates the block from its current position a certain number of x or y units.
     */
    moveBlock(xUnits = 0, yUnits = 0) {
        const { newCoordinates, canTranslate } = this.canTranslate(
            xUnits,
            yUnits
        );

        if (canTranslate) {
            this.activeCoordinates = [...newCoordinates];
        }
    }

    draw(
        gl: WebGLRenderingContext,
        spriteRenderer: DrawSprite,
        spriteSheet: SpriteSheet
    ) {
        // location and offset
        if (this.activeSpriteQuadCoords) {
            spriteRenderer.drawSprite(
                {
                    anchor: [0, 0],
                    textureCoordinates: [0, 0],
                },
                spriteSheet
            );
        }
    }
}
