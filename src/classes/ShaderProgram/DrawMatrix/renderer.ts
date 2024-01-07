import { ShaderProgramError } from "@classes/Error";
import { getRectangleCoords, hexToRgb } from "@utils/index";
import { DEFAULT_MATRIX_GRID_WIDTH, DEFAULT_MATRIX_BG_OPACITY } from "src/constants";
import { HexString } from "src/shaders/types";
import { generateGrid } from "./data";
import { Matrix } from "@classes/Matrix";
import { GroupRenderer } from "../GroupRenderer";
import { ShaderProgram } from "../ShaderProgram";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

interface RenderMatrixConfig {
    borderOpacity: number;
    borderWidth: number;
    borderColor: HexString;
    bgOpacity: number;
    bgColor: HexString;
}
export class DrawMatrix extends ShaderProgram {
    private matrix: Matrix | null = null;

    private config: RenderMatrixConfig = {
        borderOpacity: 1,
        borderWidth: DEFAULT_MATRIX_GRID_WIDTH,
        borderColor: "#ffffff",
        bgOpacity: DEFAULT_MATRIX_BG_OPACITY,
        bgColor: "#123456",
    };

    constructor(gl: WebGLRenderingContext, config?: RenderMatrixConfig) {
        super(vertex, fragment, gl);
        this.config = {
            ...this.config,
            ...config,
        };
    }

    setMatrix(matrix: Matrix) {
        this.matrix = matrix;
    }

    getBorderWidth() {
        return this.config.borderWidth;
    }

    async draw() {
        const gl = this.gl;
        console.log(gl, this.matrix);
        if (gl && this.matrix) {
            const program = this.program;
            const canvas = gl.canvas as HTMLCanvasElement;
            const [matrixWidth, matrixHeight] = this.matrix.getVisibleDimensions();

            // set viewport
            this.resizeCanvas();
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            if (program) {
                gl.useProgram(program);
                try {
                    const matrixBg = getRectangleCoords(0, 0, ...this.matrix.getDimensions());
                    // gridlines generated overflow
                    const gridlines = generateGrid(
                        this.matrix.getNumVisibleRows(),
                        this.matrix.getNumColumns(),
                        this.config.borderWidth,
                        matrixWidth,
                        matrixHeight
                    );

                    const positionLocation = gl.getAttribLocation(program, "a_position");
                    const colorLocation = gl.getAttribLocation(program, "a_gridColor");
                    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                    const positionBuffer = gl.createBuffer();
                    const colorBuffer = gl.createBuffer();

                    // draw background
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(matrixBg), gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.bufferData(
                        gl.ARRAY_BUFFER,
                        new Uint8Array(new Array(6).fill([...hexToRgb(this.config.bgColor), this.config.bgOpacity * 255]).flat()),
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

                    // draw gridlines
                    gridlines.forEach((line) => {
                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);

                        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                        gl.bufferData(
                            gl.ARRAY_BUFFER,
                            new Uint8Array(new Array(6).fill([...hexToRgb(this.config.borderColor), this.config.borderOpacity * 255]).flat()),
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
                } catch (e) {
                    throw new ShaderProgramError("matrix", "Unable to set attribute data.");
                }
            } else {
                throw new ShaderProgramError("matrix", `Program not found. Did you forget to build first?`);
            }
        }
    }

    setOpacity(opacity: number) {
        this.config.borderOpacity = opacity;
    }

    setColor(color: HexString) {
        this.config.bgColor = color;
    }
}
