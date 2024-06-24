/**
 * Class used to render to textures from one or more programs.
 */
export abstract class Renderer {
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    get gl() {
        return this._gl;
    }

    /**
     * Draw to a specified texture.
     */
    abstract draw(destTexture: WebGLTexture | null, ...args: any[]): void;
}
