import { Renderer } from "@classes/Renderer";
import { Scene } from "@classes/Scene";
import {
    Shader_SolidColorQuad,
    Shader_TexturedQuad,
    ShaderProgram,
} from "@classes/ShaderProgram";
import { NATIVE_RESOLUTION_H, NATIVE_RESOLUTION_W } from "src/constants";
import { Tuple } from "src/types";
import { AttributeName } from "./types";
import { getRectangleCoords } from "@utils/getRectangleCoords";

export class Screen extends Renderer {
    private program: ShaderProgram;
    private buffers: Record<AttributeName, WebGLBuffer | null> = {
        a_position: null,
        a_textureCoord: null,
    };

    private width: number = NATIVE_RESOLUTION_W;
    private height: number = NATIVE_RESOLUTION_H;

    private _textureDimensions: Tuple<number, 2> = [
        NATIVE_RESOLUTION_W,
        NATIVE_RESOLUTION_H,
    ];
    private aspect: number;

    private _texture: WebGLTexture | null = null;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        this.program = new ShaderProgram(...Shader_TexturedQuad, gl);
        this.aspect = this.width / this.height;

        this.buffers.a_position = gl.createBuffer();
        this.buffers.a_textureCoord = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_textureCoord);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([...getRectangleCoords(0, 0, 1, 1)]),
            gl.STATIC_DRAW
        );

        this.initTexture();
    }

    get texture() {
        return this._texture;
    }

    get textureDimensions() {
        return [...this._textureDimensions];
    }

    set textureDimensions(dimensions: Tuple<number, 2>) {
        this._textureDimensions = dimensions;
    }

    /**
     * Initializes a texture, overwriting the existing texture.
     */
    private initTexture() {
        const gl = this.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            ...this.textureDimensions,
            border,
            format,
            type,
            null
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this._texture = texture;
    }

    draw(destTexture: WebGLTexture | null = null) {
        const program = this.program.getProgram();
        const gl = this.gl;

        const dimensions: [width: number, height: number] = [
            ...this.textureDimensions,
        ];

        if (this.texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        }

        // draw to canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.resizeCanvas();

        gl.viewport(0, 0, ...dimensions);

        const ext = gl.getExtension("ANGLE_instanced_arrays");
        if (!ext) {
            throw Error("Needs the ANGLE_instanced_arrays to work");
        }

        if (gl && program && this.texture) {
            gl.useProgram(program);

            // Set up uniforms

            // bind texture to unit 0
            const u_textureLocation = gl.getUniformLocation(
                program,
                "u_texture"
            );
            gl.uniform1i(u_textureLocation, 0);

            const u_resolutionLocation = gl.getUniformLocation(
                program,
                "u_resolution"
            );
            gl.uniform2f(u_resolutionLocation, ...dimensions);

            // Set up attribute buffers
            {
                const a_textureCoordLocation = gl.getAttribLocation(
                    program,
                    "a_textureCoord"
                );

                const a_positionLocation = gl.getAttribLocation(
                    program,
                    "a_position"
                );

                ext.vertexAttribDivisorANGLE(a_textureCoordLocation, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_position);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([
                        ...getRectangleCoords(
                            0,
                            0,
                            gl.canvas.width,
                            gl.canvas.width / this.aspect
                        ),
                    ]),
                    gl.STATIC_DRAW
                );
                ext.vertexAttribDivisorANGLE(a_positionLocation, 0);

                // Set up attribute pointers
                gl.enableVertexAttribArray(a_textureCoordLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_textureCoord);
                gl.vertexAttribPointer(
                    a_textureCoordLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_positionLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_position);
                gl.vertexAttribPointer(
                    a_positionLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, 1);
            }
        }
    }

    drawScene(scene: Scene) {}
}
