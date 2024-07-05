import { DrawBuffers } from "src/shaders/types";
import { TextureKey } from "@data/TextureKey";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { TexturedEntity } from "@classes/TexturedEntity";
import { Tuple } from "src/types";
import { Playfield } from "@classes/Playfield";

export class MatrixBackground extends TexturedEntity {
    static textureKey: TextureKey = "TEX_playfield";

    constructor(playfield: Playfield) {
        super();
        this.defaultDimensions = playfield.dimensions;

        this.parent = playfield;

        this.goToRelativePosition([0, 0]);
    }

    getDrawBuffers(hsvaModBuffer: Tuple<number, 4>): DrawBuffers {
        const sumHsvaMod = this.getHsvaModifier().map(
            (component, idx) => component + hsvaModBuffer[idx]
        ) as Tuple<number, 4>;

        this.uvScale = [0.5, 1];

        this.uvPosition = [0.5, 0];
        const gridTextureTransform = this.getTransformUVMatrix();

        this.uvPosition = [0, 0];
        const bgTextureTransform = this.getTransformUVMatrix();

        return {
            transform: Array(2).fill(this.getTransformMatrix()).flat(),
            transformUV: [...gridTextureTransform, ...bgTextureTransform],
            textureKey: [
                MatrixBackground.textureKey,
                MatrixBackground.textureKey,
            ],
            hsvaMod: [
                ...[sumHsvaMod[0], sumHsvaMod[1], sumHsvaMod[2], sumHsvaMod[3]],
                ...[
                    sumHsvaMod[0],
                    sumHsvaMod[1],
                    sumHsvaMod[2],
                    sumHsvaMod[3] - 0.5,
                ],
            ],
        };
    }
}
