import { DrawableEntity } from "@classes/DrawableEntity";
import { Contexts } from "@classes/Entity";

export abstract class TexturedEntity extends DrawableEntity {
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
