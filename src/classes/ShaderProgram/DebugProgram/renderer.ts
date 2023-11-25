import { ShaderProgramError } from "@classes/Error";
import { ShaderProgram } from "../ShaderProgram";
import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { getRectangleCoords } from "@utils/index";
import { DEFAULT_MATRIX_GRID_WIDTH, DEFAULT_MATRIX_GRID_OPACITY, MATRIX_BUFFER_ZONE_RATIO } from "src/constants";
import { HexString } from "src/shaders/types";
import { hexToRgb } from "@utils/hexToRgb";

/**
 * Not to be used anywhere but this is a minimum cut of working program.
 */
export class DebugProgram extends ShaderProgram {
    private rows: number;
    private columns: number;
    // TODO: Magic numbers
    private opacity = DEFAULT_MATRIX_GRID_OPACITY;
    private borderWidth = DEFAULT_MATRIX_GRID_WIDTH;
    private borderColor: HexString = "#000000";
    private color: HexString = "#ffffff";

    constructor(gl: WebGLRenderingContext, rows: number, columns: number, autoBuild = true) {
        super(vertex, fragment, gl, autoBuild);
        this.rows = rows;
        this.columns = columns;
    }

    draw() {
        const gl = this.gl;
        const program = this.program;
        const canvas = gl.canvas as HTMLCanvasElement;
        const playArea = {
            width: canvas.clientWidth,
            // height of matrix minus the buffer area above the rows
            height: canvas.clientHeight * (1 - MATRIX_BUFFER_ZONE_RATIO),
            // height of matrix including the buffer zone
            trueHeight: canvas.clientHeight,
        };

        // set viewport
        this.resizeCanvas();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        if (program) {
            gl.useProgram(program);

            try {
                const positionLocation = gl.getAttribLocation(program, "a_position");
                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, 150, 50)), gl.STATIC_DRAW);
                //
                const colorLocation = gl.getAttribLocation(program, "a_gridColor");
                const colorBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Uint8Array([200, 70, 120, 255, 200, 70, 120, 255, 200, 70, 120, 255, 80, 70, 200, 255, 80, 70, 200, 255, 80, 70, 200, 255]),
                    gl.STATIC_DRAW
                );
                console.log([...hexToRgb(this.borderColor), 256 * this.opacity - 1]);
                //
                gl.enableVertexAttribArray(positionLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                gl.enableVertexAttribArray(colorLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.vertexAttribPointer(colorLocation, 4, gl.UNSIGNED_BYTE, true, 0, 0);

                /* const uniforms: ShaderUniformRecord = {
                    u_resolution: {
                        type: gl.FLOAT_VEC2,
                    },
                };

                const uniformData = {
                    u_resolution: [canvas.clientWidth, canvas.clientHeight],
                };

                console.log([
                    ...hexToRgb(this.borderColor),
                    256 * this.opacity - 1,
                ]);
                setUniformData(
                    getUniformSetters(uniforms, program, gl),
                    uniformData
                ); */
                const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
                gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);

                console.log(canvas.clientWidth, canvas.clientHeight);

                console.log("Draw");
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            } catch (e) {
                throw new ShaderProgramError("debug", "Unable to set attribute data.");
            }
        } else {
            throw new ShaderProgramError("debug", `Program not found. Did you forget to build first?`);
        }
    }

    setOpacity(opacity: number) {
        this.opacity = opacity;
    }

    setColor(color: HexString) {
        this.color = color;
    }
}
