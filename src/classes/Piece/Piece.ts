import { PieceId } from "../../data/PieceId";
import { Block } from "./Block";
import {
    RotationBlockPositionAdjust,
    WallKickPositionOffset,
    WallKickPositionOffsetTest,
    WallKickPositionOffsetTestData,
    type RotationPositionAdjustMap,
} from "./Piece.types";

export abstract class Piece {
    protected blocks: Block[];
    /**
     * Should be between 0-3 inclusive as there are four possible rotations.
     * 0 is the the initial rotation.
     */
    protected rotationState: 0 | 1 | 2 | 3;
    protected static id: PieceId | null = null;
    protected readonly clockwiseRotationMap: RotationPositionAdjustMap;
    protected readonly antiClockwiseRotationMap: RotationPositionAdjustMap;
    protected readonly clockwiseWallKickOffsetData: WallKickPositionOffsetTestData;
    protected readonly antiClockwiseWallKickOffsetData: WallKickPositionOffsetTestData;
    protected static color: string;

    constructor(
        blocks: Block[],
        clockwiseRotationMap: RotationPositionAdjustMap,
        antiClockwiseRotationMap: RotationPositionAdjustMap,
        clockwiseWallKickOffsetData: WallKickPositionOffsetTestData,
        antiClockwiseWallKickOffsetData: WallKickPositionOffsetTestData
    ) {
        this.blocks = blocks;
        this.blocks.forEach((block) => {
            block.registerPiece(this);
        });
        this.rotationState = 0;
        this.clockwiseRotationMap = clockwiseRotationMap;
        this.antiClockwiseRotationMap = antiClockwiseRotationMap;
        this.clockwiseWallKickOffsetData = clockwiseWallKickOffsetData;
        this.antiClockwiseWallKickOffsetData = antiClockwiseWallKickOffsetData;
    }

    /**
     * Parents the blocks into this piece. (Should only be called once in the constructor.)
     */
    protected registerBlocks() {
        this.blocks.forEach((block) => {
            block.registerPiece(this);
        });
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
        return Piece.id;
    }

    // Movement methods

    /**
     * Checks if the piece can move down all blocks together a specified number of units.
     */
    canMoveDownTogether(units = 1) {
        return this.blocks.reduce(
            (canMove, block) => canMove && block.canMoveDown(units) === units,
            true
        );
    }

    /**
     * Checks if the piece can move down all blocks together a specified number of units.
     */
    private canMoveLeftTogether(units = 1) {
        return this.blocks.reduce(
            (canMove, block) => canMove && block.canMoveLeft(units) === units,
            true
        );
    }

    /**
     * Checks if the piece can move down all blocks together a specified number of units.
     */
    private canMoveRightTogether(units = 1) {
        return this.blocks.reduce(
            (canMove, block) => canMove && block.canMoveRight(units) === units,
            true
        );
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
                throw new Error(
                    "This is only callable if the piece is active!"
                );
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
     * Moves down a piece a certain number of units. If the number of units supplied
     * is greater than maximum possible movement it will move the maximum possible of units.
     * It returns whether the movement was successful or not, movement of 0 is counted as unsuccessful.
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

        return unitsToMove > 0;
    }

    /**
     * Moves left a piece a certain number of units. If the number of units supplied
     * is greater than maximum possible movement it will move the maximum possible of units.
     * It returns whether the movement was successful or not, movement of 0 is counted as unsuccessful.
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

        return unitsToMove > 0;
    }

    /**
     * Moves right a piece a certain number of units. If the number of units supplied
     * is greater than maximum possible movement it will move the maximum possible of units.
     * It returns whether the movement was successful or not, movement of 0 is counted as unsuccessful.
     */
    moveRight(units = 1): boolean {
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

        return unitsToMove > 0;
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
                    const canRotate = this.blocks.reduce(
                        (canRotate, block, blockIdx) => {
                            const blockPositionAdjust:
                                | RotationBlockPositionAdjust
                                | undefined = rotationStateAdjust[blockIdx];

                            try {
                                if (blockPositionAdjust) {
                                    return (
                                        canRotate &&
                                        block.canTranslate(
                                            blockPositionAdjust[0] +
                                                wallKickOffset[0],
                                            blockPositionAdjust[1] +
                                                wallKickOffset[1]
                                        ).canTranslate
                                    );
                                }
                                throw new Error(
                                    `Block position adjustment not found for block ${blockIdx} when checking rotation for ${this}`
                                );
                            } catch (error) {
                                console.error(error);
                                return false;
                            }
                        },
                        true
                    );
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

    /**
     * Rotate a piece either clockwise or anticlockwise
     * by translating the blocks in the piece.
     * @returns `true` if rotation successful, `false` otherwise
     */
    private rotate(
        rotationStateAdjustMap: RotationPositionAdjustMap,
        wallKickOffsetTestData: WallKickPositionOffsetTestData
    ): boolean {
        const rotationStateAdjust = rotationStateAdjustMap[this.rotationState];
        const wallKickOffsetTest = wallKickOffsetTestData[this.rotationState];

        const wallKickOffset = this.determineWallKick(
            rotationStateAdjust,
            wallKickOffsetTest
        );

        // if they can, shift the position of the blocks to rotate the piece
        if (wallKickOffset) {
            this.blocks.forEach((block, blockIdx) => {
                const blockPositionAdjust = rotationStateAdjust[blockIdx];
                try {
                    if (blockPositionAdjust) {
                        block.translate(
                            blockPositionAdjust[0] + wallKickOffset[0],
                            blockPositionAdjust[1] + wallKickOffset[1]
                        );
                    } else {
                        throw new Error(
                            `Block position adjustment not found for block ${blockIdx} when rotating ${this}`
                        );
                    }
                } catch (error) {
                    console.error(error);
                }
            });
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
        const rotationSuccess = this.rotate(
            this.clockwiseRotationMap,
            this.clockwiseWallKickOffsetData
        );

        if (rotationSuccess) {
            this.incrementRotationState();
        }

        return rotationSuccess;
    }

    /**
     * Rotate a piece clockwise
     * by translating the blocks in the piece.
     * @returns `true` if rotation successful, `false` otherwise
     */
    rotateAntiClockwise(): boolean {
        const rotationSuccess = this.rotate(
            this.antiClockwiseRotationMap,
            this.antiClockwiseWallKickOffsetData
        );

        if (rotationSuccess) {
            this.decrementRotationState();
        }

        return rotationSuccess;
    }

    // Misc. methods

    /**
     * Returns the blocks that belong to this piece.
     */
    getBlocks() {
        return this.blocks;
    }

    /**
     * Locks the piece into the matrix, taking it out of the player's control.
     * The blocks will form part of the matrix and will no longer be registered to a piece.
     * (Do not call this from anywhere else except from within a `Matrix` object!)
     */
    lockPiece() {
        this.blocks.forEach((block) => {
            block.unregisterPiece();
        });
    }

    /**
     * Get coordinates of all blocks in the piece.
     */
    getBlocksCoordinates() {
        return this.blocks.map((block) => block.getActiveCoordinates());
    }
}
