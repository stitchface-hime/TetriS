import { DrawSprite } from "@classes/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { DrawBuffers, SpriteSheetDetails } from "src/shaders/types";
import { DrawableEntity } from "@classes/DrawableEntity";
import { Tuple } from "src/types";

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
export abstract class SpritedEntity extends DrawableEntity {
    /**
     * The sprite sheets that will be used when drawing this entity to the scene.
     */
    private spriteSheetDatas: Record<string, SpriteSheetDetails> = {};

    private activeSpriteSheetData: SpriteSheetDetails | null = null;

    private activeSpriteQuadCoords: Tuple<number, 12> | null = null;

    protected renderer: DrawSprite;

    /* protected animationCycles: Record<string, number[]> = {};

    protected animation: SpriteAnimation | null = {}; */

    constructor(
        renderer: DrawSprite,
        {
            position,
            scale,
            rotation,
            spriteSheetDatas = [],
        }: Partial<{
            position: [x: number, y: number];
            scale: [x: number, y: number];
            rotation: number;
            spriteSheetDatas: SpriteSheetDetails[];
        }> = {}
    ) {
        super({ position, scale, rotation });
        this.renderer = renderer;
        spriteSheetDatas.forEach((sheet) => this.registerSpriteSheetData(sheet));
    }

    assignContextToRenderer(gl: WebGLRenderingContext) {
        if (this.renderer) {
            this.renderer.setWebGLRenderingContext(gl);
        } else {
            throw new Error("Could not set assign context to renderer. Did you forget to set a renderer for this entity?");
        }
    }

    getActiveSpriteQuadCoords() {
        return this.activeSpriteQuadCoords;
    }

    getActiveSpriteSheetData() {
        return this.activeSpriteSheetData;
    }

    /**
     * Sets the active sprite sheet to use via its id.
     * Note that this also nulls out the current quad coordinates of the sprite.
     */
    setActiveSpriteSheetData(id: string) {
        const spriteSheetData = this.spriteSheetDatas[id];

        if (spriteSheetData) {
            this.activeSpriteSheetData = spriteSheetData;
            this.setDefaultDimensions([spriteSheetData.spriteSize.width, spriteSheetData.spriteSize.height]);
            this.activeSpriteQuadCoords = null;
        } else {
            throw new Error("Could not set active sprite sheet data. Did you forget to register the sprite sheet first?");
        }
    }

    registerSpriteSheetData(spriteSheetData: SpriteSheetDetails) {
        this.spriteSheetDatas[spriteSheetData.id] = spriteSheetData;
    }

    unregisterSpriteSheetData(name: string) {
        if (this.spriteSheetDatas[name]) {
            delete this.spriteSheetDatas[name];
        } else {
            throw new Error("Sprite sheet could not be found. Skipping operation.");
        }
    }

    /**
     * Sets the active sprite by the index of the sprite in the sprite sheet,
     * starting from the top left of the sprite sheet.
     */
    setActiveSpriteByIndex(spriteIdx: number) {
        // console.log("Load index", spriteIdx);
        if (this.activeSpriteSheetData) {
            const { spriteSize, width } = this.activeSpriteSheetData;

            const totalCols = Math.ceil(width / spriteSize.width);
            const row = Math.floor(spriteIdx / totalCols);
            const column = spriteIdx % totalCols;

            this.setActiveSpriteByRowCol([row, column]);
        } else {
            throw new Error("There is no active sprite sheet set. Did not set active sprite.");
        }
    }

    /**
     * Sets the active sprite by providing which row and column of the sprite within the sprite sheet,
     * the first row and first column starting at the top and left respectively. Row and columns start at index 0.
     */
    setActiveSpriteByRowCol([row, column]: [row: number, col: number]) {
        if (this.activeSpriteSheetData) {
            const { spriteSize, width, height } = this.activeSpriteSheetData;
            const totalRows = Math.ceil(height / spriteSize.height);
            const totalCols = Math.ceil(width / spriteSize.width);
            const u = column / totalCols;
            const v = row / totalRows;

            this.setActiveSpriteByUV([u, v]);
        } else {
            throw new Error("There is no active sprite sheet set. Did not set active sprite.");
        }
    }

    /**
     * Sets the active sprite by its u-v coordinates within the sprite sheet.
     * `[0,0]` being the bottom-left and `[1,1]` being the top-right of the sprite sheet.
     */
    setActiveSpriteByUV([u, v]: [u: number, v: number]) {
        if (this.activeSpriteSheetData) {
            const {
                spriteSize: { width, height },
            } = this.activeSpriteSheetData;
            this.activeSpriteQuadCoords = getRectangleCoords(u, v, width / this.activeSpriteSheetData.width, height / this.activeSpriteSheetData.height);
        } else {
            throw new Error("There is no active sprite sheet set. Did not set active sprite.");
        }
    }

    getDrawBuffers(): DrawBuffers {
        const drawBuffers: DrawBuffers = {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
        };

        // make sure all buffers have some data in them
        if (this.activeSpriteQuadCoords && this.activeSpriteSheetData) {
            drawBuffers.positionBuffer = getRectangleCoords(...this.getPosition(), ...this.getDimensions());
            drawBuffers.textureCoordBuffer = this.activeSpriteQuadCoords;
            drawBuffers.textureKeyBuffer = [this.activeSpriteSheetData.id];
        } else {
            console.warn(`Skip drawing this ${this.constructor.name} entity, either no quad coords or active sprite sheet data.`);
        }

        return drawBuffers;
    }
}
