import { ControllerPortManager } from "@classes/ControllerPortManager";
import { DrawableEntity } from "@classes/DrawableEntity";
import { TextureManager } from "@classes/TextureManager";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { TextureKey } from "@data/TextureKey";

export abstract class TexturedEntity extends DrawableEntity {
    constructor(
        intervalManager: IntervalManager,
        controllerPortManager: ControllerPortManager,
        transform: Partial<{
            position: [x: number, y: number];
            scale: [x: number, y: number];
            rotation: number;
        }> = {}
    ) {
        super(intervalManager, controllerPortManager, transform);
    }

    /**
     * Creates a texture and loads it into the texture manager.
     * To be called only when there are no entries with the texture key within the supplied texture manager.
     */
    abstract loadIntoTextureManager(gl: WebGLRenderingContext, textureManager: TextureManager, textureKey: TextureKey): Promise<void>;
}
