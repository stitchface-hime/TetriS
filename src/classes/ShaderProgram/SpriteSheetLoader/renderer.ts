import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

// TODO: This probably doesn't make sense as a ShaderProgram
export class SpriteSheetLoader extends ShaderProgram {
    private _src: string;

    constructor(gl: WebGLRenderingContext, src: string) {
        super(vertex, fragment, gl);
        this._src = src;
    }

    get src() {
        return this._src;
    }

    set src(src: string) {
        this._src = src;
    }

    /**
     * Loads a sprite sheet from a source into a texture.
     */
    async draw(destTexture: WebGLTexture) {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, destTexture);

        // load the sprite sheet
        const image = new Image();
        image.src = this.src;

        const promise = new Promise((resolve) => {
            image.onload = resolve;
        });

        await promise;

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
    }
}
