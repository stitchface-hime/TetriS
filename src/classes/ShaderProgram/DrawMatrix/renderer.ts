import { ShaderProgramError } from "@classes/Error";
import { ShaderProgram } from "../ShaderProgram";
import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { getRectangleCoords } from "@utils/index";
import { DEFAULT_MATRIX_GRID_WIDTH, DEFAULT_MATRIX_GRID_OPACITY, MATRIX_BUFFER_ZONE_RATIO, DEFAULT_MATRIX_BG_OPACITY } from "src/constants";
import { HexString } from "src/shaders/types";
import { hexToRgb } from "@utils/hexToRgb";
import { generateGrid } from "./data";

export class DrawMatrix extends ShaderProgram {
    /**
     * Number of visible rows in the matrix.
     */
    private rows: number;
    private columns: number;
    // TODO: Magic numbers
    private borderOpacity = DEFAULT_MATRIX_GRID_OPACITY;
    private borderWidth = DEFAULT_MATRIX_GRID_WIDTH;
    private borderColor: HexString = "#ffffff";
    private bgOpacity = DEFAULT_MATRIX_BG_OPACITY;
    private bgColor: HexString = "#000000";

    constructor(rows: number, columns: number) {
        super(vertex, fragment);
        this.rows = rows;
        this.columns = columns;
    }

    getBorderWidth() {
        return this.borderWidth;
    }

    draw() {
        const gl = this.gl;
        if (gl) {
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
                gl.clearColor(...hexToRgb(this.bgColor), this.bgOpacity);
                gl.clear(gl.COLOR_BUFFER_BIT);
                try {
                    const gridlines = generateGrid(this.rows, this.columns, this.borderWidth, playArea.width, playArea.height);
                    const positionLocation = gl.getAttribLocation(program, "a_position");
                    const colorLocation = gl.getAttribLocation(program, "a_gridColor");
                    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                    const positionBuffer = gl.createBuffer();
                    const colorBuffer = gl.createBuffer();

                    gridlines.forEach((line) => {
                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);

                        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                        gl.bufferData(
                            gl.ARRAY_BUFFER,
                            new Uint8Array(new Array(6).fill([...hexToRgb(this.borderColor), this.borderOpacity * 255]).flat()),
                            gl.STATIC_DRAW
                        );

                        gl.enableVertexAttribArray(positionLocation);
                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                        gl.enableVertexAttribArray(colorLocation);
                        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                        gl.vertexAttribPointer(colorLocation, 4, gl.UNSIGNED_BYTE, true, 0, 0);

                        gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);

                        gl.drawArrays(gl.TRIANGLES, 0, 6);
                    });
                    console.log("Drew matrix");
                } catch (e) {
                    throw new ShaderProgramError("matrix", "Unable to set attribute data.");
                }
            } else {
                throw new ShaderProgramError("matrix", `Program not found. Did you forget to build first?`);
            }
        }
    }

    setOpacity(opacity: number) {
        this.borderOpacity = opacity;
    }

    setColor(color: HexString) {
        this.bgColor = color;
    }
}
