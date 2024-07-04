import { DrawableEntity } from "@classes/DrawableEntity";
import { Contexts } from "@classes/Entity";
import { clamp } from "@utils/clamp";
import { Tuple } from "src/types";

export abstract class TexturedEntity extends DrawableEntity {
    private _uvPosition: [u: number, v: number] = [0, 0];
    private _uvScale: [width: number, height: number] = [1, 1];

    /**
     * u-v position of texture, each individual component clamped between 0 and 1.
     */
    get uvPosition() {
        return this._uvPosition;
    }

    /**
     * u-v scale of texture, each individual component clamped between 0 and 1.
     */
    get uvScale() {
        return this._uvScale;
    }

    set uvPosition(position: [u: number, v: number]) {
        this._uvPosition = [clamp(position[0], 0, 1), clamp(position[1], 0, 1)];
    }

    set uvScale(scale: [u: number, v: number]) {
        this._uvScale = [clamp(scale[0], 0, 1), clamp(scale[1], 0, 1)];
    }

    /**
     * Gets the transform matrix necessary to render the texture in the entity which includes translation and scale.
     */
    getTransformUVMatrix(): Tuple<number, 16> {
        return [
            this.uvScale[0],
            0,
            0,
            0,

            0,
            this.uvScale[1],
            0,
            0,

            0,
            0,
            0,
            0,

            this.uvPosition[0],
            this.position[1],
            0,
            0,
        ];
    }

    constructor(
        transform: Partial<{
            position: [x: number, y: number];
            scale: [x: number, y: number];
            rotation: number;
        }> = {},
        contexts: Contexts = {}
    ) {
        super(transform, contexts);
    }
}
