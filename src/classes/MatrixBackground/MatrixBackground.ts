import { DrawableEntity } from "@classes/DrawableEntity";
import { Matrix } from "@classes/Matrix/Matrix";
import { DrawMatrix } from "@classes/ShaderProgram";

export class MatrixBackground extends DrawableEntity {
    protected renderer: DrawMatrix;

    constructor(matrix: Matrix, renderer: DrawMatrix) {
        console.log("Matrix background renderer", renderer);
        super();
        this.renderer = renderer;
        this.renderer.setMatrix(matrix);
    }

    async draw() {
        console.log("Draw matrix background");
        await this.renderer.draw();
    }
}
