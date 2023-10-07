import { ShaderProgramError } from "@classes/Error";
import { ShaderProgram } from "../ShaderProgram";
import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { getRectangleCoords } from "@utils/index";
import {
    DEFAULT_MATRIX_BORDER_WIDTH,
    DEFAULT_MATRIX_OPACITY,
    MATRIX_BUFFER_ZONE_RATIO,
} from "src/constants";
import { HexString } from "src/shaders/types";
import { hexToRgb } from "@utils/hexToRgb";
import { generateGrid } from "./data";
import { DrawSprite } from "../DrawSprite";

export class DebugFramebuffers extends ShaderProgram {
    private rows: number;
    private columns: number;
    // TODO: Magic numbers
    private opacity = DEFAULT_MATRIX_OPACITY;
    private borderWidth = 1;
    private borderColor: HexString = "#ffffff";
    private color: HexString = "#ffffff";

    constructor(
        gl: WebGLRenderingContext,
        rows: number,
        columns: number,
        autoBuild = true
    ) {
        super(vertex, fragment, gl, autoBuild);
        this.rows = rows;
        this.columns = columns;
    }

    draw() {
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
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
            const positionLocation = gl.getAttribLocation(
                program,
                "a_position"
            );
            const texCoordLocation = gl.getAttribLocation(
                program,
                "a_texcoord"
            );
            const resolutionLocation = gl.getUniformLocation(
                program,
                "u_resolution"
            );

            const positionBuffer = gl.createBuffer();
            const texCoordBuffer = gl.createBuffer();

            {
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([
                        0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

                        0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,

                        0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

                        0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,

                        0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

                        0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
                    ]),
                    gl.STATIC_DRAW
                );
            }
            const lineTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, lineTexture);
            {
                // define size and format of level 0
                const level = 0;
                const internalFormat = gl.RGBA;
                const width = 1;
                const height = 1;
                const border = 0;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;
                const data = new Uint8Array([255, 123, 255, 123]);
                const alignment = 1;
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    level,
                    internalFormat,
                    width,
                    height,
                    border,
                    format,
                    type,
                    data
                );

                // set the filtering so we don't need mips and it's not filtered
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MIN_FILTER,
                    gl.NEAREST
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MAG_FILTER,
                    gl.NEAREST
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE
                );

                // set the filtering so we don't need mips
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MIN_FILTER,
                    gl.LINEAR
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE
                );
            }

            const targetTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, targetTexture);

            {
                // define size and format of level 0
                const level = 0;
                const internalFormat = gl.RGBA;
                const border = 0;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;
                const data = null;

                gl.texImage2D(
                    gl.TEXTURE_2D,
                    level,
                    internalFormat,
                    canvas.width,
                    canvas.height,
                    border,
                    format,
                    type,
                    data
                );

                // set the filtering so we don't need mips
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MIN_FILTER,
                    gl.LINEAR
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE
                );
            }

            // Create and bind the framebuffer
            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            console.log("draw");

            const attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                attachmentPoint,
                gl.TEXTURE_2D,
                targetTexture,
                0
            );

            {
                const gridlines = generateGrid(
                    this.rows,
                    this.columns,
                    this.borderWidth,
                    playArea.width,
                    playArea.height
                );
                // render to the texture stored in the frame buffer (targetTexture)
                gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

                // use the texture we created for the lines
                gl.bindTexture(gl.TEXTURE_2D, lineTexture);

                // Tell WebGL how to convert from clip space to pixels
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                // Clear the canvas AND the depth buffer.
                gl.clearColor(0, 0, 0, 0.5);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gridlines.forEach((line) => {
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferData(
                        gl.ARRAY_BUFFER,
                        new Float32Array(line),
                        gl.STATIC_DRAW
                    );

                    gl.enableVertexAttribArray(positionLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.vertexAttribPointer(
                        positionLocation,
                        2,
                        gl.FLOAT,
                        false,
                        0,
                        0
                    );

                    gl.enableVertexAttribArray(texCoordLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.vertexAttribPointer(
                        texCoordLocation,
                        2,
                        gl.FLOAT,
                        true,
                        0,
                        0
                    );

                    gl.uniform2f(
                        resolutionLocation,
                        canvas.clientWidth,
                        canvas.clientHeight
                    );

                    // draw too framebuffer
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                });
            }

            {
                // render to the canvas
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                // render the cube with the texture we just rendered to
                gl.bindTexture(gl.TEXTURE_2D, targetTexture);

                // Tell WebGL how to convert from clip space to pixels
                gl.viewport(0, 0, gl.canvas.width / 2, gl.canvas.height / 2);

                // Clear the canvas AND the depth buffer.
                gl.clearColor(1, 0.5, 0.5, 0.5); // clear to white
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(
                        getRectangleCoords(0, 0, canvas.width, canvas.height)
                    ),
                    gl.STATIC_DRAW
                );

                gl.enableVertexAttribArray(positionLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.vertexAttribPointer(
                    positionLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(texCoordLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                gl.vertexAttribPointer(
                    texCoordLocation,
                    2,
                    gl.FLOAT,
                    true,
                    0,
                    0
                );

                gl.uniform2f(
                    resolutionLocation,
                    canvas.clientWidth,
                    canvas.clientHeight
                );

                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
        }
    }

    setOpacity(opacity: number) {
        this.opacity = opacity;
    }

    setColor(color: HexString) {
        this.color = color;
    }
}
