import { ShaderProgramError } from "@classes/Error";
import { getRectangleCoords, hexToRgb } from "@utils/index";
import { HexString } from "src/shaders/types";
import { ShaderProgram } from "../ShaderProgram";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

export class DrawBoundingBox extends ShaderProgram {
    private _color: HexString = "#ff0000";

    constructor(gl: WebGLRenderingContext) {
        super(vertex, fragment, gl);
    }

    get color() {
        return this._color;
    }

    set color(color: HexString) {
        this._color = color;
    }

    async draw(destTexture: WebGLTexture | null) {
        const gl = this.gl;
        if (gl) {
            const program = this.program;

            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            const attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, destTexture, 0);

            // set viewport
            this.resizeCanvas();
            gl.viewport(0, 0, 1, 1);

            if (program) {
                gl.useProgram(program);
                try {
                    const positionLocation = gl.getAttribLocation(program, "a_position");
                    const colorLocation = gl.getAttribLocation(program, "a_color");
                    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                    const positionBuffer = gl.createBuffer();
                    const colorBuffer = gl.createBuffer();

                    // draw background
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, 1, 1)), gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    // console.log(new Array(6).fill([...hexToRgb(this.color), 255]));
                    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(new Array(6).fill([...hexToRgb(this.color), 255]).flat()), gl.STATIC_DRAW);

                    gl.enableVertexAttribArray(positionLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                    gl.enableVertexAttribArray(colorLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.vertexAttribPointer(colorLocation, 4, gl.UNSIGNED_BYTE, true, 0, 0);

                    gl.uniform2f(resolutionLocation, 1, 1);

                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                } catch (e) {
                    throw new ShaderProgramError("boundingBox", "Unable to set attribute data.");
                }
            } else {
                throw new ShaderProgramError("boundingBox", `Program not found. Did you forget to build first?`);
            }
        }
    }
}
