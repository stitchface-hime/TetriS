import { DrawableEntity } from "@classes/DrawableEntity";
import { Matrix } from "@classes/Matrix/Matrix";
import { DrawMatrix } from "@classes/ShaderProgram";
import { DrawBuffers } from "src/shaders/types";
import { TextureManager } from "@classes/TextureManager";
import { TextureKey } from "@data/TextureKey";
import { getRectangleCoords } from "@utils/getRectangleCoords";

export class MatrixBackground extends DrawableEntity {
    static textureKey: TextureKey = "MATRIX_BG";
    private matrix: Matrix;

    constructor(matrix: Matrix, renderer: DrawMatrix) {
        super();
        this.renderer = renderer;
        this.setDefaultDimensions(matrix.getDimensions());

        this.setParent(matrix);
        this.matrix = matrix;

        this.setRelativePosition([0, 0]);
    }

    async loadIntoTextureManager(gl: WebGLRenderingContext, textureManager: TextureManager, textureKey: TextureKey): Promise<void> {
        const loader = new DrawMatrix(gl);
        loader.setMatrix(this.matrix);

        // Set up texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

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
        if (!textureManager.isLoaded(MatrixBackground.textureKey)) {
            this.loadIntoTextureManager(gl, textureManager, MatrixBackground.textureKey);
        }

        return {
            positionBuffer: getRectangleCoords(...this.getPosition(), ...this.getDimensions()),
            textureCoordBuffer: getRectangleCoords(0, 0, 1, 1),
            textureKeyBuffer: [MatrixBackground.textureKey],
        };
    }
}
