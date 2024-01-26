import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

export class MainRenderer extends ShaderProgram {
    constructor(gl: WebGLRenderingContext) {
        super(vertex, fragment, gl);
    }

    async draw(destTexture: WebGLTexture | null) {
        const program = this.program;
        const gl = this.gl;
        const canvas = gl.canvas as HTMLCanvasElement;
        const dimensions: [width: number, height: number] = [canvas.clientWidth, canvas.clientHeight];

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.resizeCanvas();
        gl.viewport(0, 0, ...dimensions);

        if (gl && program) {
            gl.useProgram(program);

            const positionLocation = gl.getAttribLocation(program, "a_position");
            const texCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
            const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

            const positionBuffer = gl.createBuffer();
            const texCoordBuffer = gl.createBuffer();

            gl.uniform2f(resolutionLocation, ...dimensions);

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, ...dimensions)), gl.STATIC_DRAW);

            // Draw the entire texture (texCoord: [0, 0, 1, 1]) into the rectangle
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, 1, 1)), gl.STATIC_DRAW);

            // enable arrays
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(texCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, true, 0, 0);

            gl.bindTexture(gl.TEXTURE_2D, destTexture);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }
}
