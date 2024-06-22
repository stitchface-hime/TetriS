import { TextureManager } from "@classes/TextureManager";
import { Asset } from "../Asset";

export class ImageAsset extends Asset {
    private textureManager: TextureManager;
    private src: string;
    private _image: HTMLImageElement | null = null;

    private gl: WebGLRenderingContext;

    constructor(
        id: string,
        src: string,
        textureManager: TextureManager,
        gl: WebGLRenderingContext
    ) {
        super(id);
        this.src = src;
        this.textureManager = textureManager;
        this.gl = gl;
    }

    get image() {
        return this._image;
    }

    get dimensions() {
        return this._image
            ? [this._image?.naturalWidth, this._image?.naturalHeight]
            : null;
    }

    private set image(image: HTMLImageElement | null) {
        this._image = image;
    }

    protected createTexture() {
        if (!this.image)
            throw new Error("Image not loaded yet, failed to create texture.");

        const gl = this.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            format,
            type,
            this.image
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        if (texture) {
            this.textureManager.load(this.id, texture, true);
            return texture;
        }

        return null;
    }

    load(onLoad?: (asset: Asset) => void) {
        let texture: WebGLTexture | null = null;

        this.isLoaded = false;
        const image = new Image();
        image.src = this.src;
        image.onload = () => {
            this.image = image;
            this.createTexture();

            if (onLoad) onLoad(this);
        };
        image.onerror = (e) => {
            throw new Error("Image asset failed to load.");
        };
    }
}
