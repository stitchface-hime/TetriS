import { DrawableEntity } from "@classes/DrawableEntity";
import { Matrix } from "@classes/Matrix/Matrix";
import { DrawMatrix } from "@classes/ShaderProgram";

export class MatrixBackground extends DrawableEntity {
    protected renderer: DrawMatrix;

    constructor(matrix: Matrix, renderer: DrawMatrix) {
        super();
        this.renderer = renderer;
        this.setDefaultDimensions(matrix.getDimensions());
        this.setParent(matrix);
        this.setRelativePosition([0, 0]);

        this.renderer.setMatrix(matrix);
    }

    getDrawBuffers() {
        // TODO
        // draw texture register it with the texture library
        // await this.renderer.draw(destTexture);

        return {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
        };
    }
}
