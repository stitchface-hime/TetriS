import { getRectangleCoords } from "@utils/getRectangleCoords";
import { DrawBuffers, SpriteSheetDetails } from "src/shaders/types";
import { Tuple } from "src/types";
import { TexturedEntity } from "@classes/TexturedEntity";
import { Contexts } from "@classes/Entity";
import { BoundingBox } from "@classes/BoundingBox";

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
export abstract class SpritedEntity extends TexturedEntity {
    static defaultImageKernel: Tuple<number, 9> = [0, 0, 0, 0, 1, 0, 0, 0, 0];
    /**
     * The sprite sheets that will be used when drawing this entity to the scene.
     */
    private spriteSheetDatas: Record<string, SpriteSheetDetails> = {};

    private activeSpriteSheetData: SpriteSheetDetails | null = null;

    private activeSpriteQuadCoords: Tuple<number, 12> | null = null;

    /* protected animationCycles: Record<string, number[]> = {};

    protected animation: SpriteAnimation | null = {}; */

    private boundingBox = new BoundingBox(this);

    constructor(
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
        }> = {},
        contexts: Contexts = {}
    ) {
        super({ position, scale, rotation }, contexts);
        this.boundingBox.hueModifier = 120;
        spriteSheetDatas.forEach((sheet) =>
            this.registerSpriteSheetData(sheet)
        );
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
            this.defaultDimensions = [
                spriteSheetData.spriteSize.width,
                spriteSheetData.spriteSize.height,
            ];
            this.activeSpriteQuadCoords = null;
        } else {
            throw new Error(
                "Could not set active sprite sheet data. Did you forget to register the sprite sheet first?"
            );
        }
    }

    registerSpriteSheetData(spriteSheetData: SpriteSheetDetails) {
        this.spriteSheetDatas[spriteSheetData.id] = spriteSheetData;
    }

    unregisterSpriteSheetData(name: string) {
        if (this.spriteSheetDatas[name]) {
            delete this.spriteSheetDatas[name];
        } else {
            throw new Error(
                "Sprite sheet could not be found. Skipping operation."
            );
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
        if (this.activeSpriteSheetData) {
            const { spriteSize, width, height } = this.activeSpriteSheetData;
            const totalRows = Math.ceil(height / spriteSize.height);
            const totalCols = Math.ceil(width / spriteSize.width);
            const u = column / totalCols;
            const v = row / totalRows;

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
        if (this.activeSpriteSheetData) {
            const {
                spriteSize: { width, height },
            } = this.activeSpriteSheetData;
            this.activeSpriteQuadCoords = getRectangleCoords(
                u,
                v,
                width / this.activeSpriteSheetData.width,
                height / this.activeSpriteSheetData.height,
                true
            );
        } else {
            throw new Error(
                "There is no active sprite sheet set. Did not set active sprite."
            );
        }
    }

    getDrawBuffers(hsvaModBuffer: Tuple<number, 4>): DrawBuffers {
        const drawBuffers: DrawBuffers = {
            transform: [],
            transformUV: [],
            textureKey: [],
            hsvaMod: [],
        };

        // make sure all buffers have some data in them
        const boundingBoxBuffers = this.boundingBox.getDrawBuffers();

        if (this.activeSpriteQuadCoords && this.activeSpriteSheetData) {
            const sumHsvaMod = this.getHsvaModifier().map(
                (component, idx) => component + hsvaModBuffer[idx]
            ) as Tuple<number, 4>;

            drawBuffers.transform = getRectangleCoords(
                ...this.position,
                ...this.dimensions
            );
            drawBuffers.transformUV = [...this.activeSpriteQuadCoords];
            drawBuffers.textureKey = [this.activeSpriteSheetData.id];
            drawBuffers.hsvaMod = Array(6)
                .fill([...sumHsvaMod])
                .flat();
        } else {
            console.warn(
                `Skip drawing this ${this.constructor.name} entity, either no quad coords or active sprite sheet data.`
            );
        }

        /* drawBuffers.positionBuffer.push(...boundingBoxBuffers.positionBuffer);
        drawBuffers.textureCoordBuffer.push(
            ...boundingBoxBuffers.textureCoordBuffer
        );
        drawBuffers.textureKeyBuffer.push(
            ...boundingBoxBuffers.textureKeyBuffer
        );
        drawBuffers.hsvaModBuffer.push(...boundingBoxBuffers.hsvaModBuffer); */

        // bounding box

        return drawBuffers;
    }
}
