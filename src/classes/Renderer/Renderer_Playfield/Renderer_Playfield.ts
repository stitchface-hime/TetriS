import { ShaderProgram, Shader_SolidColorQuad } from "@classes/ShaderProgram";
import { Renderer } from "../Renderer";
import { MINO_WIDTH_STD } from "src/constants";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { hexToRgb } from "@utils/hexToRgb";
import { ShaderProgramError } from "@classes/Error";

/**
 * Renders the grid and background on a single texture. Width of supplied texture should be twice that of the playfield. Texture looks like:
 * ```
 * __________________________
 * |   GRID     | BACKGROUND|
 * |            |           |
 * |            |           |
 * |            |           |
 * |            |           |
 * |____________|___________|
 * ```
 */
export class Renderer_Playfield extends Renderer {
    private program: ShaderProgram;
    private rows: number;
    private columns: number;
    private borderWidth = 1;

    constructor(gl: WebGLRenderingContext, rows: number, columns: number) {
        super(gl);

        this.program = new ShaderProgram(...Shader_SolidColorQuad, gl);
        this.rows = rows;
        this.columns = columns;
    }

    private generateColumnLines(
        columns: number,
        matrixWidth: number,
        matrixHeight: number
    ) {
        const columnLines: number[][] = [];

        const spacing =
            (matrixWidth - columns * this.borderWidth * 2) / columns;
        let currentDist = 0;

        for (let i = 0; i < columns + 1; i++) {
            const lineWidth =
                this.borderWidth * (i === 0 || i === columns ? 1 : 2);
            columnLines.push(
                getRectangleCoords(currentDist, 0, lineWidth, matrixHeight)
            );
            currentDist += lineWidth + spacing;
        }

        return columnLines;
    }

    private generateRowLines(
        rows: number,
        matrixWidth: number,
        matrixHeight: number
    ) {
        const rowLines: number[][] = [];

        const spacing = (matrixHeight - rows * this.borderWidth * 2) / rows;

        let currentDist = 0;

        for (let i = 0; i < rows + 1; i++) {
            const lineWidth =
                this.borderWidth * (i === 0 || i === rows ? 1 : 2);
            rowLines.push(
                getRectangleCoords(0, currentDist, matrixWidth, lineWidth)
            );
            currentDist += lineWidth + spacing;
        }

        return rowLines;
    }

    private generateGrid(
        rows: number,
        columns: number,
        blockWidth: number
    ): number[][] {
        if (rows && columns) {
            return [
                ...this.generateColumnLines(
                    columns,
                    blockWidth * columns,
                    blockWidth * rows
                ),
                ...this.generateRowLines(
                    rows,
                    blockWidth * columns,
                    blockWidth * rows
                ),
            ];
        }

        return [];
    }

    draw(destTexture: WebGLTexture | null): void {
        const gl = this.gl;

        const ext = gl.getExtension("ANGLE_instanced_arrays");
        if (!ext) {
            throw Error("Needs the ANGLE_instanced_arrays to work");
        }

        const program = this.program.getProgram();
        const dimensions: [width: number, height: number] = [
            MINO_WIDTH_STD * this.columns,
            MINO_WIDTH_STD * this.rows,
        ];
        const textureDimensions: [width: number, height: number] = [
            dimensions[0] * 2,
            dimensions[1],
        ];

        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            attachmentPoint,
            gl.TEXTURE_2D,
            destTexture,
            0
        );

        // set viewport
        gl.viewport(0, 0, ...textureDimensions);

        if (program) {
            gl.useProgram(program);

            const gridlines = this.generateGrid(
                this.rows,
                this.columns,
                MINO_WIDTH_STD
            );

            const positionLocation = gl.getAttribLocation(
                program,
                "a_position"
            );
            const colorLocation = gl.getAttribLocation(program, "a_color");
            const resolutionLocation = gl.getUniformLocation(
                program,
                "u_resolution"
            );

            const positionBuffer = gl.createBuffer();
            const colorBuffer = gl.createBuffer();

            const drawBuffers: { position: number[]; color: number[] } = {
                position: [],
                color: [],
            };

            // draw gridlines
            gridlines.forEach((line) => {
                drawBuffers.position.push(...line);
                drawBuffers.color.push(
                    ...new Array(6).fill([255, 255, 255, 255]).flat()
                );
            });

            // draw background
            drawBuffers.position.push(
                ...getRectangleCoords(
                    dimensions[0],
                    0,
                    dimensions[0],
                    dimensions[1]
                )
            );
            drawBuffers.color.push(...new Array(6).fill([0, 0, 0, 255]).flat());

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(drawBuffers.position),
                gl.STATIC_DRAW
            );

            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Uint8Array(drawBuffers.color),
                gl.STATIC_DRAW
            );

            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            ext.vertexAttribDivisorANGLE(positionLocation, 0);

            gl.enableVertexAttribArray(colorLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(
                colorLocation,
                4,
                gl.UNSIGNED_BYTE,
                true,
                0,
                0
            );
            ext.vertexAttribDivisorANGLE(colorLocation, 0);

            gl.uniform2f(resolutionLocation, ...textureDimensions);

            ext.drawArraysInstancedANGLE(
                gl.TRIANGLES,
                0,
                drawBuffers.position.length / 2,
                1
            );

            gl.drawArrays(gl.TRIANGLES, 0, drawBuffers.position.length / 2);
        }
    }
}
