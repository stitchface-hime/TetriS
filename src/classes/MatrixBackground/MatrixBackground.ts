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

        return {
            positionBuffer: [
                ...getRectangleCoords(...this.position, ...this.dimensions),
                ...getRectangleCoords(...this.position, ...this.dimensions),
            ],
            textureCoordBuffer: [
                ...getRectangleCoords(0.5, 0, 0.5, 1),
                ...getRectangleCoords(0, 0, 0.5, 1),
            ],
            textureKeyBuffer: [
                MatrixBackground.textureKey,
                MatrixBackground.textureKey,
            ],
            hsvaModBuffer: [
                ...Array(6)
                    .fill([...sumHsvaMod])
                    .flat(),
                ...Array(6)
                    .fill([
                        sumHsvaMod[0],
                        sumHsvaMod[1],
                        sumHsvaMod[2],
                        sumHsvaMod[3],
                    ])
                    .flat(),
            ],
        };
    }
}
