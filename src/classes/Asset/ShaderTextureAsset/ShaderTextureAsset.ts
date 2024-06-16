import { ShaderProgram } from "@classes/ShaderProgram";
import { Asset } from "../Asset";
import { TextureManager } from "@classes/TextureManager";

export class ShaderTextureAsset extends Asset {
    protected program: ShaderProgram;
    private _texture: WebGLTexture | null = null;
    private textureManager: TextureManager;

    constructor(
        id: string,
        program: ShaderProgram,
        textureManager: TextureManager
    ) {
        super(id);
        this.program = program;
        this.textureManager = textureManager;
    }

    get texture() {
        return this._texture;
    }

    protected createTexture() {
        const gl = this.program.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;

        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            1,
            1,
            border,
            format,
            type,
            data
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        if (texture) {
            this.program.draw(texture);
            this.textureManager.load(this.id, texture, true);
            return texture;
        }

        return null;
    }

    load(onLoad?: () => void) {
        const texture = this.createTexture();

        if (!texture) throw new Error("Texture asset failed to load.");
        if (!onLoad) return;

        onLoad();
    }
}
