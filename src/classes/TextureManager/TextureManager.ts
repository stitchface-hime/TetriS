import { TextureKey } from "@data/index";

export class TextureManager {
    private loaded: Partial<Record<TextureKey, WebGLTexture>> = {};

    constructor() {}

    isLoaded(key: TextureKey) {
        return !!this.loaded[key];
    }

    /**
     * Loads the texture into this texture loader instance.
     * If it already exists, nothing will happen unless specifically called with overwrite flag, which
     * will replace the currently stored texture if it exists.
     */
    load(key: TextureKey, texture: WebGLTexture, overwrite = false) {
        if (!this.isLoaded(key) || overwrite) this.loaded[key] = texture;
    }

    unload(key: TextureKey) {
        delete this.loaded[key];
    }
}
