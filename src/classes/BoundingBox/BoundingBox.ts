import { DrawableEntity } from "@classes/DrawableEntity";
import { DrawBoundingBox } from "@classes/ShaderProgram/DrawBoundingBox";
import { TextureManager } from "@classes/TextureManager";
import { TexturedEntity } from "@classes/TexturedEntity";
import { TextureKey } from "@data/TextureKey";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { DrawBuffers } from "src/shaders/types";

export class BoundingBox extends TexturedEntity {
    static textureKey: TextureKey = "BOUNDING_BOX";
    private sourceEntity: DrawableEntity;
    private _borderWidth = 2;

    constructor(sourceEntity: DrawableEntity) {
        super();
        this.sourceEntity = sourceEntity;
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(width: number) {
        this._borderWidth = width;
    }

    private generateBoundingBox() {
        const { position, dimensions } = this.sourceEntity;
        const lines: number[][] = [];

        lines.push(
            getRectangleCoords(position[0], position[1], this.borderWidth, dimensions[1]),
            getRectangleCoords(position[0], position[1], dimensions[0], this.borderWidth),
            //
            getRectangleCoords(position[0], position[1] + dimensions[1] - this.borderWidth, dimensions[0], this.borderWidth),
            getRectangleCoords(position[0] + dimensions[0] - this.borderWidth, position[1], this.borderWidth, dimensions[1])
        );

        return lines;
    }

    async loadIntoTextureManager(gl: WebGLRenderingContext, textureManager: TextureManager, textureKey: TextureKey): Promise<void> {
        const loader = new DrawBoundingBox(gl);

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

        if (texture) {
            await loader.draw(texture);
            textureManager.load(textureKey, texture);
        } else {
            throw Error("Failed to load texture");
        }
    }

    async getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager): Promise<DrawBuffers> {
        if (!textureManager.isLoaded(BoundingBox.textureKey)) {
            await this.loadIntoTextureManager(gl, textureManager, BoundingBox.textureKey);
        }

        return {
            // this buffer has 48 elements, 4 rectangles
            positionBuffer: this.generateBoundingBox().flat(),
            textureCoordBuffer: Array(4).fill(getRectangleCoords(0, 0, 1, 1)).flat(),
            textureKeyBuffer: Array(4).fill(BoundingBox.textureKey).flat(),
            hsvaModBuffer: Array(24).fill(this.getHsvaModifier()).flat(),
        };
    }
}
