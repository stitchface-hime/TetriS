import { add2DVectorTuples } from "@utils/add2DVectorTuples";
import { getRectangleCoords } from "@utils/getRectangleCoords";

class GameEntityTransform {
    /**
     * Position of the entity within a scene.
     */
    protected position: [x: number, y: number] = [0, 0];
    /**
     * Scale of the entity within a scene.
     */
    protected scale = 1;
    /**
     * Rotation of the entity in degrees within a scene.
     */
    protected rotation = 0;

    constructor({
        position,
        scale,
        rotation,
    }: Partial<{
        position: [x: number, y: number];
        scale: number;
        rotation: number;
    }>) {
        if (position !== undefined) this.setPosition(position);
        if (scale !== undefined) this.scale = scale || this.scale;
        if (rotation !== undefined) this.rotation = rotation || this.rotation;
    }

    setPosition(position: [x: number, y: number]) {
        this.position = position;
    }

    translate(position: [x: number, y: number]) {
        this.position = add2DVectorTuples(this.position, position);
    }

    setScale(scale: number) {
        this.scale = scale;
    }

    adjustScale(scale: number) {
        this.scale += scale;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    rotate(rotation: number) {
        this.rotation += rotation;
    }
}

interface SpriteSheet {
    name: string;
    width: number;
    height: number;
    spriteInfo: {
        width: number;
        height: number;
    };
}

/* interface AnimationFrame {
    name: string;
    spriteIdx: number;
    holdCount: number;
}

interface SpriteAnimation {
    name: string;
    currentFrame: number;
    totalFrames: number;
    currentSpriteIdx: number;
    paused: boolean;
    loopCount: number;
    complete: boolean;
}

class SpriteAnimation {

}
 */
export abstract class GameEntity extends GameEntityTransform {
    /**
     * The sprite sheets that will be used when drawing this entity to the scene.
     */
    protected spriteSheets: Record<string, SpriteSheet> = {};

    protected activeSpriteSheet: SpriteSheet | null = null;

    protected activeSpriteQuadCoords: number[] | null = null;

    /* protected animationCycles: Record<string, number[]> = {};

    protected animation: SpriteAnimation | null = {}; */

    constructor({
        position,
        scale,
        rotation,
        spriteSheets = {},
    }: Partial<{
        position: [x: number, y: number];
        scale: number;
        rotation: number;
        spriteSheets: Record<string, SpriteSheet>;
    }>) {
        super({ position, scale, rotation });
        this.spriteSheets = spriteSheets;
    }

    /**
     * Sets the active sprite by the index of the sprite in the sprite sheet,
     * starting from the top left of the sprite sheet.
     */
    setActiveSpriteByIndex(spriteIdx: number) {
        if (this.activeSpriteSheet) {
            const { width: sheetWidth, spriteInfo } = this.activeSpriteSheet;

            const totalCols = Math.ceil(sheetWidth / spriteInfo.width);
            const row = Math.floor(spriteIdx / totalCols);
            const column = spriteIdx % totalCols;

            this.setActiveSpriteByRowCol([row, column]);
        } else {
            throw new Error(
                "There is no active sprite sheet set. Did not set active sprite."
            );
        }
    }

    /**
     * Sets the active sprite by providing which row and column of the sprite within the sprite sheet,
     * the first row and first column starting at the top and left respectively. Row and columns start at index 0.
     */
    setActiveSpriteByRowCol([row, column]: [row: number, col: number]) {
        if (this.activeSpriteSheet) {
            const {
                width: sheetWidth,
                height: sheetHeight,
                spriteInfo,
            } = this.activeSpriteSheet;
            const totalRows = Math.ceil(sheetHeight / spriteInfo.height);
            const totalCols = Math.ceil(sheetWidth / spriteInfo.width);
            const u = (totalCols - column) / totalCols;
            const v = (totalRows - row - 1) / totalRows;

            this.setActiveSpriteByUV([u, v]);
        } else {
            throw new Error(
                "There is no active sprite sheet set. Did not set active sprite."
            );
        }
    }

    /**
     * Sets the active sprite by its u-v coordinates within the sprite sheet.
     * `[0,0]` being the bottom-left and `[1,1]` being the top-right of the sprite sheet.
     */
    setActiveSpriteByUV([u, v]: [u: number, v: number]) {
        if (this.activeSpriteSheet) {
            const {
                spriteInfo: { width, height },
            } = this.activeSpriteSheet;
            this.activeSpriteQuadCoords = getRectangleCoords(
                u,
                v,
                width,
                height
            );
        } else {
            throw new Error(
                "There is no active sprite sheet set. Did not set active sprite."
            );
        }
    }

    draw() {}
}
