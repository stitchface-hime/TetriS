import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";

// TODO: This probably doesn't make sense as a ShaderProgram
export class SpriteSheetLoader extends ShaderProgram {
    /**
     * Loads a sprite sheet from a source into a texture.
     */
    async draw(destTexture: WebGLTexture, src: string) {
        const gl = this.getWebGLRenderingContext();
        gl.bindTexture(gl.TEXTURE_2D, destTexture);

        // load the sprite sheet
        const image = new Image();
        image.src = src;

        const promise = new Promise((resolve) => {
            image.onload = resolve;
        });

        await promise;

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }
}
