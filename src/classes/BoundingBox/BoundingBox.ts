import { DrawableEntity } from "@classes/DrawableEntity";
import { TexturedEntity } from "@classes/TexturedEntity";
import { TextureKey } from "@data/TextureKey";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { DrawBuffers } from "src/shaders/types";

export class BoundingBox extends TexturedEntity {
    static textureKey: TextureKey = "TEX_color";
    private sourceEntity: DrawableEntity;
    private _borderWidth = 2;

    constructor(sourceEntity: DrawableEntity) {
        super();
        this.sourceEntity = sourceEntity;
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(width: number) {
        this._borderWidth = width;
    }

    private generateBoundingBox() {
        const { position, dimensions } = this.sourceEntity;
        const lines: number[][] = [];

        lines.push(
            getRectangleCoords(
                position[0],
                position[1],
                this.borderWidth,
                dimensions[1]
            ),
            getRectangleCoords(
                position[0],
                position[1],
                dimensions[0],
                this.borderWidth
            ),
            //
            getRectangleCoords(
                position[0],
                position[1] + dimensions[1] - this.borderWidth,
                dimensions[0],
                this.borderWidth
            ),
            getRectangleCoords(
                position[0] + dimensions[0] - this.borderWidth,
                position[1],
                this.borderWidth,
                dimensions[1]
            )
        );

        return lines;
    }

    getDrawBuffers(): DrawBuffers {
        return {
            // this buffer has 48 elements, 4 rectangles
            transform: this.generateBoundingBox().flat(),
            transformUV: Array(4).fill(getRectangleCoords(0, 0, 1, 1)).flat(),
            textureKey: Array(4).fill(BoundingBox.textureKey).flat(),
            hsvaMod: Array(24).fill(this.getHsvaModifier()).flat(),
        };
    }
}
