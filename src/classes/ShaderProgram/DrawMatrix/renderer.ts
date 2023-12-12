import { ShaderProgramError } from "@classes/Error";
import { ShaderProgram } from "../ShaderProgram";
import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { getRectangleCoords, hexToClampf, hexToRgb } from "@utils/index";
import { DEFAULT_MATRIX_GRID_WIDTH, DEFAULT_MATRIX_GRID_OPACITY, MATRIX_BUFFER_ZONE_RATIO, DEFAULT_MATRIX_BG_OPACITY } from "src/constants";
import { HexString } from "src/shaders/types";
import { generateGrid } from "./data";
import { Matrix } from "@classes/Matrix";

interface RenderMatrixConfig {
    borderOpacity: number;
    borderWidth: number;
    borderColor: HexString;
    bgOpacity: number;
    bgColor: HexString;
}
export class DrawMatrix extends ShaderProgram {
    private matrix: Matrix;

    private config: RenderMatrixConfig = {
        borderOpacity: 1,
        borderWidth: DEFAULT_MATRIX_GRID_WIDTH,
        borderColor: "#ffffff",
        bgOpacity: DEFAULT_MATRIX_BG_OPACITY,
        bgColor: "#123456",
    };

    constructor(matrix: Matrix, config?: RenderMatrixConfig) {
        super(vertex, fragment);
        this.matrix = matrix;
        this.config = {
            ...this.config,
            ...config,
        };
    }

    getBorderWidth() {
        return this.config.borderWidth;
    }

    draw() {
        const gl = this.gl;
        if (gl) {
            const program = this.program;
            const canvas = gl.canvas as HTMLCanvasElement;
            const playArea = this.matrix.getPlayArea();

            // set viewport
            this.resizeCanvas();
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            if (program) {
                gl.useProgram(program);
                try {
                    const matrixBg = getRectangleCoords(0, 0, canvas.clientWidth, canvas.clientHeight);
                    // gridlines generated overflow
                    const gridlines = generateGrid(
                        this.matrix.getNumVisibleRows(),
                        this.matrix.getNumColumns(),
                        this.config.borderWidth,
                        playArea.width,
                        playArea.height
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
