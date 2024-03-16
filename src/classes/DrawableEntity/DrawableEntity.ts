import { Entity } from "@classes/Entity";
import { TextureManager } from "@classes/TextureManager";
import { TextureKey } from "@data/TextureKey";
import { DrawBuffers } from "src/shaders/types";

export abstract class DrawableEntity extends Entity {
    constructor() {
        super();
    }

    /**
     * Creates a texture and loads it into the texture manager.
     * To be called only when there are no entries with the texture key within the supplied texture manager.
     */
    abstract loadIntoTextureManager(gl: WebGLRenderingContext, textureManager: TextureManager, textureKey: TextureKey): Promise<void>;

    /**
     * Returns entity buffers containing:
     * - entity position (12 elements in buffer per entity)
     * - entity texture coordinates (12 elements in buffer per entity)
     * - entity texture key (1 element in buffer per entity)
     *
     * If a texture does not exist within the supplied texture manager with the returned texture key,
     * this function will be required to create a texture and load it into the texture manager keyed by texture key.
     */
    abstract getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager): Promise<DrawBuffers>;
}
