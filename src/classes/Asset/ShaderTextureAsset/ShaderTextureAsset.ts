import { ShaderProgram } from "@classes/ShaderProgram";
import { Asset } from "../Asset";

export class ShaderTextureAsset extends Asset {
    private program: ShaderProgram;
    private _texture: WebGLTexture | null = null;

    constructor(id: string, program: ShaderProgram) {
        super(id);
        this.program = program;
    }

    get texture() {
        return this._texture;
    }

    load(onLoad?: () => void) {
        const gl = this.program.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 1, 1, border, format, type, data);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        if (!onLoad) return;

        onLoad();
    }
}
