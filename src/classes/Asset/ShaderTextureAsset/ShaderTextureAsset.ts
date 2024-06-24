import { ShaderProgram } from "@classes/ShaderProgram";
import { Asset } from "../Asset";
import { TextureManager } from "@classes/TextureManager";
import { Renderer } from "@classes/Renderer";

export class ShaderTextureAsset extends Asset {
    protected renderer: Renderer;
    private _texture: WebGLTexture | null = null;
    private textureManager: TextureManager;
    protected dimensions: [width: number, height: number] = [0, 0];

    constructor(
        id: string,
        renderer: Renderer,
        dimensions: [width: number, height: number],
        textureManager: TextureManager
    ) {
        super(id);
        this.renderer = renderer;
        this.dimensions = dimensions;
        this.textureManager = textureManager;
    }

    get texture() {
        return this._texture;
    }

    protected createTexture(dimensions: [width: number, height: number]) {
        const gl = this.renderer.gl;

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
            ...dimensions,
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
            this.renderer.draw(texture);
            this.textureManager.load(this.id, texture, true);
            return texture;
        }

        return null;
    }

    load(onLoad?: (asset: Asset) => void) {
        const texture = this.createTexture(this.dimensions);

        if (!texture) throw new Error("Texture asset failed to load.");
        if (!onLoad) return;

        onLoad(this);
    }
}
