import { Playfield } from "@classes/Playfield";
import { PieceId } from "../../data/PieceId";
import { Block } from "./Block";
import {
    RotationBlockPositionAdjust,
    TechnicalMove,
    WallKickPositionOffset,
    WallKickPositionOffsetTest,
    WallKickPositionOffsetTestData,
    type RotationPositionAdjustMap,
} from "./Piece.types";
import { isEqual2DVectorTuples } from "@utils/isEqual2DVectorTuples";
import { GroupEntity } from "@classes/GroupEntity";

export abstract class Piece extends GroupEntity {
    protected _blocks: Block[];
    protected _ghost: Piece | null = null;
    protected matrix: Playfield;
    /**
     * Should be between 0-3 inclusive as there are four possible rotations.
     * 0 is the the initial rotation.
     */
    protected rotationState: 0 | 1 | 2 | 3;
    protected id: PieceId | null = null;
    protected readonly clockwiseRotationMap: RotationPositionAdjustMap;
    protected readonly antiClockwiseRotationMap: RotationPositionAdjustMap;
    protected readonly clockwiseWallKickOffsetData: WallKickPositionOffsetTestData;
    protected readonly antiClockwiseWallKickOffsetData: WallKickPositionOffsetTestData;

    protected prevMoveTechnical: TechnicalMove = null;

    constructor(
        matrix: Playfield,
        blocks: Block[],
        clockwiseRotationMap: RotationPositionAdjustMap,
        antiClockwiseRotationMap: RotationPositionAdjustMap,
        clockwiseWallKickOffsetData: WallKickPositionOffsetTestData,
        antiClockwiseWallKickOffsetData: WallKickPositionOffsetTestData
    ) {
        super();
        this.parent = matrix;
        this.setRelativePosition([0, 0]);

        this.matrix = matrix;
        this._blocks = blocks;
        this.drawables.push(...this.blocks);

        this.rotationState = 0;
        this.clockwiseRotationMap = clockwiseRotationMap;
        this.antiClockwiseRotationMap = antiClockwiseRotationMap;
        this.clockwiseWallKickOffsetData = clockwiseWallKickOffsetData;
        this.antiClockwiseWallKickOffsetData = antiClockwiseWallKickOffsetData;

        this.drawables.push(...this.blocks);
    }

    get blocks() {
        return this._blocks;
    }

    private set blocks(blocks: Block[]) {
        this._blocks = blocks;
    }

    get ghost() {
        return this._ghost;
    }

    set ghost(piece: Piece | null) {
        const currentGhost = this.ghost;
        this._ghost = piece;

        if (piece) {
            this.drawables.push(piece);
            this.updateGhost();
        } else {
            if (!currentGhost) return;
            this.drawables.remove(currentGhost);
        }
    }

    /**
     * Couples the blocks such that they are connected in the shape required.
     * (Should only be called once in the constructor.)
     */
    protected abstract coupleBlocks(): void;

    /**
     * Gets the piece id.
     */
    getId() {
        return this.id;
    }

    /**
     * Gets whether or not the previous move was a full, mini or not a technical move.
     */
    getPrevMoveTechnical() {
        return this.prevMoveTechnical;
    }

    // Movement methods

    /**
     * Checks if the piece can move down all blocks together a specified number of units.
     */
    canMoveDownTogether(units = 1) {
        return this.blocks.reduce((canMove, block) => canMove && block.canMoveDown(units) === units, true);
    }

    /**
     * Checks if the piece can move down all blocks together a specified number of units.
     */
    private canMoveLeftTogether(units = 1) {
        return this.blocks.reduce((canMove, block) => canMove && block.canMoveLeft(units) === units, true);
    }

    /**
     * Checks if the piece can move down all blocks together a specified number of units.
     */
    private canMoveRightTogether(units = 1) {
        return this.blocks.reduce((canMove, block) => canMove && block.canMoveRight(units) === units, true);
    }

    /**
     * Gets the row that is occupied by the lowest block in the piece.
     * Only callable if piece is part of an active piece.
     */
    getBottomBoundRow() {
        return Math.min(
            ...this.blocks.map((block) => {
                const activeCoordinates = block.getActiveCoordinates();
                if (activeCoordinates) {
                    return activeCoordinates[1];
                }
                throw new Error("This is only callable if the piece is active!");
            })
        );
    }

    /**
     * Gets the number of units to move piece down if a hard drop was initiated.
     */
    getHardDropUnits() {
        let units = 0;

        while (this.canMoveDownTogether(units + 1)) {
            units += 1;
        }

        return units;
    }

    /**
     * Checks if a move is technical, that is, if it was rotated into
     * a difficult to reach position (such as a T-spin) and sets the `prevMoveTechnicalFlag` accordingly.
     * Each piece will have its own condition for what counts as a technical move.
     */
    technicalMoveCheck(wallKicked: boolean) {
        this.prevMoveTechnical = null;
    }

    /**
     * Updates the ghost piece's coordinates.
     * No effect if ghost piece is not used.
     */
    private updateGhost() {
        const ghost = this.ghost;
        if (!ghost) return;

        const hardDropUnits = this.getHardDropUnits();
        this.getBlocksCoordinates().forEach((coordinates, idx) => ghost.blocks[idx].setCoordinates([coordinates[0], coordinates[1] - hardDropUnits]));
        ghost.updateAllBlocksConnections();
    }

    /**
     * Moves down a piece a certain number of units. If the number of units supplied
     * is greater than maximum possible movement it will move the maximum possible of units.
     * It returns the number of units moved.
     */
    moveDown(units = 1) {
        let unitsToMove = 0;

        for (let i = 1; i < 1 + units; i++) {
            if (this.canMoveDownTogether(i)) {
                unitsToMove = i;
            }
        }

        if (unitsToMove > 0) {
            this.blocks.forEach((block) => {
                block.moveDown(unitsToMove);
            });
        }

        return unitsToMove;
    }

    /**
     * Moves left a piece a certain number of units. If the number of units supplied
     * is greater than maximum possible movement it will move the maximum possible of units.
     * It returns the number of units moved.
     */
    moveLeft(units = 1) {
        let unitsToMove = 0;

        for (let i = 1; i < 1 + units; i++) {
            if (this.canMoveLeftTogether(i)) {
                unitsToMove = i;
            }
        }

        if (unitsToMove > 0) {
            this.blocks.forEach((block) => {
                block.moveLeft(unitsToMove);
            });
        }

        this.updateGhost();

        return unitsToMove;
    }

    /**
     * Moves right a piece a certain number of units. If the number of units supplied
     * is greater than maximum possible movement it will move the maximum possible of units.
     * It returns the number of units moved.
     */
    moveRight(units = 1) {
        let unitsToMove = 0;

        for (let i = 1; i < 1 + units; i++) {
            if (this.canMoveRightTogether(i)) {
                unitsToMove = i;
            }
        }

        if (unitsToMove > 0) {
            this.blocks.forEach((block) => {
                block.moveRight(unitsToMove);
            });
        }

        this.updateGhost();

        return unitsToMove;
    }

    // Rotation methods
    /**
     * Determines which wall kick will be used for the rotation and
     * whether or not the rotation was successful.
     * @param rotationStateAdjust the array containing the position adjustment for each block in the piece
     * @param wallKickOffsetTestData the array containing the different wall kick position offset tests
     * @returns an object containing the wall kick test to use if successful
     * and whether or not the rotation was successful.
     */
    private determineWallKick(
        rotationStateAdjust: RotationBlockPositionAdjust[],
        wallKickOffsetTest: WallKickPositionOffsetTest
    ): WallKickPositionOffset | null {
        // check if all blocks are able to move to their new positions upon rotate
        return wallKickOffsetTest.reduce<WallKickPositionOffset | null>(
            (chosenWallKickOffset, wallKickOffset) => {
                // keep testing the different wall kick offsets until rotation is successful
                if (!chosenWallKickOffset) {
                    // determine if we can translate a block to match the piece's rotation
                    const canRotate = this.blocks.reduce((canRotate, block, blockIdx) => {
                        const blockPositionAdjust: RotationBlockPositionAdjust | undefined = rotationStateAdjust[blockIdx];

                        try {
                            if (blockPositionAdjust) {
                                return (
                                    canRotate &&
                                    block.canTranslate(blockPositionAdjust[0] + wallKickOffset[0], blockPositionAdjust[1] + wallKickOffset[1]).canTranslate
                                );
                            }
                            throw new Error(`Block position adjustment not found for block ${blockIdx} when checking rotation for ${this}`);
                        } catch (error) {
                            console.error(error);
                            return false;
                        }
                    }, true);
                    // when a rotation is successful, store the successful wall kick offset
                    if (canRotate) {
                        return wallKickOffset;
                    }
                }
                return chosenWallKickOffset;
            },
            // default no wall kick chosen
            null
        );
    }

    private updateAllBlocksConnections() {
        this.blocks.forEach((block) => block.updateConnections());
    }

    /**
     * Rotate a piece either clockwise or anticlockwise
     * by translating the blocks in the piece.
     * @returns `true` if rotation successful, `false` otherwise
     */
    private rotatePiece(rotationStateAdjustMap: RotationPositionAdjustMap, wallKickOffsetTestData: WallKickPositionOffsetTestData): boolean {
        const rotationStateAdjust = rotationStateAdjustMap[this.rotationState];
        const wallKickOffsetTest = wallKickOffsetTestData[this.rotationState];

        const wallKickOffset = this.determineWallKick(rotationStateAdjust, wallKickOffsetTest);

        // if they can, shift the position of the blocks to rotate the piece
        if (wallKickOffset) {
            this.blocks.forEach((block, blockIdx) => {
                const blockPositionAdjust = rotationStateAdjust[blockIdx];
                try {
                    if (blockPositionAdjust) {
                        block.moveBlock(blockPositionAdjust[0] + wallKickOffset[0], blockPositionAdjust[1] + wallKickOffset[1]);
                    } else {
                        throw new Error(`Block position adjustment not found for block ${blockIdx} when rotating ${this}`);
                    }
                } catch (error) {
                    console.error(error);
                }
            });

            // Note: a wall kick happens if offset is not [0, 0]
            this.technicalMoveCheck(!isEqual2DVectorTuples(wallKickOffset, [0, 0]));

            this.updateAllBlocksConnections();
        }

        return !!wallKickOffset;
    }

    private incrementRotationState() {
        if (this.rotationState < 3) {
            this.rotationState += 1;
        } else {
            this.rotationState = 0;
        }
    }

    private decrementRotationState() {
        if (this.rotationState > 0) {
            this.rotationState -= 1;
        } else {
            this.rotationState = 3;
        }
    }

    /**
     * Rotate a piece clockwise
     * by translating the blocks in the piece.
     * @returns `true` if rotation successful, `false` otherwise
     */
    rotateClockwise(): boolean {
        const rotationSuccess = this.rotatePiece(this.clockwiseRotationMap, this.clockwiseWallKickOffsetData);

        if (rotationSuccess) {
            this.incrementRotationState();
            this.updateGhost();
        }

        return rotationSuccess;
    }

    /**
     * Rotate a piece clockwise
     * by translating the blocks in the piece.
     * @returns `true` if rotation successful, `false` otherwise
     */
    rotateAntiClockwise(): boolean {
        const rotationSuccess = this.rotatePiece(this.antiClockwiseRotationMap, this.antiClockwiseWallKickOffsetData);

        if (rotationSuccess) {
            this.decrementRotationState();
            this.updateGhost();
        }

        return rotationSuccess;
    }

    /**
     * Get coordinates of all blocks in the piece.
     */
    getBlocksCoordinates() {
        return this.blocks.map((block) => block.getActiveCoordinates());
    }

    destroy() {
        const ghost = this._ghost;
        if (!ghost) return;

        this.drawables.remove(ghost);
        this._ghost = null;
    }
}
