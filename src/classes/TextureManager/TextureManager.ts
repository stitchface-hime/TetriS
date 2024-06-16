export class TextureManager {
    private loaded: Record<string, WebGLTexture> = {};

    constructor() {}

    isLoaded(key: string) {
        return !!this.loaded[key];
    }

    getTexture(key: string) {
        return this.loaded[key];
    }

    /**
     * Loads the texture into this texture loader instance.
     * If it already exists, nothing will happen unless specifically called with overwrite flag, which
     * will replace the currently stored texture if it exists.
     */
    load(key: string, texture: WebGLTexture, overwrite = false) {
        if (!this.isLoaded(key) || overwrite) this.loaded[key] = texture;
    }

    unload(key: string) {
        delete this.loaded[key];
    }
}
