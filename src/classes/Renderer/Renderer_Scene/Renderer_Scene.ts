import { TextureKey } from "@data/TextureKey";
import { DrawBuffers } from "src/shaders/types";
import { Renderer } from "../Renderer";
import { ShaderProgram } from "@classes/ShaderProgram";
import { TextureManager } from "@classes/TextureManager";
import { Shader_Scene } from "@classes/ShaderProgram/Shader_Scene";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { NATIVE_RESOLUTION_H, NATIVE_RESOLUTION_W } from "src/constants";

export class Renderer_Scene extends Renderer {
    private program: ShaderProgram;
    private _textureManager: TextureManager;
    /**
     * Maximum texture units is at least 0, at most 32.
     */
    private maxTextureUnits: number;
    /**
     * This is the maximum number of supported texture units you can use at once per draw.
     */
    private maxSimultaneousTextureUnits = 4;

    private buffers: Record<AttributeName, WebGLBuffer | null> = {
        a_quadVert: null,
        a_quadVertUV: null,
        a_transform: null,
        a_transformUV: null,
        a_textureIndex: null,
        a_hsvaMod: null,
    };

    private framebuffer: WebGLFramebuffer | null = null;

    private _drawBuffers: DrawBuffers | null = null;

    constructor(gl: WebGLRenderingContext, textureManager: TextureManager) {
        super(gl);
        this.program = new ShaderProgram(...Shader_Scene, gl);
        this._textureManager = textureManager;
        this.maxTextureUnits = this.gl.getParameter(
            this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
        );

        // create and set buffers
        this.buffers.a_quadVert = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_quadVert);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(getRectangleCoords(0, 0, 1, 1)),
            gl.STATIC_DRAW
        );

        this.buffers.a_quadVertUV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_quadVertUV);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(getRectangleCoords(0, 0, 1, 1)),
            gl.STATIC_DRAW
        );

        this.buffers.a_transform = gl.createBuffer();
        this.buffers.a_transformUV = gl.createBuffer();
        this.buffers.a_textureIndex = gl.createBuffer();
        this.buffers.a_hsvaMod = gl.createBuffer();

        this.framebuffer = gl.createFramebuffer();
    }

    get textureManager() {
        return this._textureManager;
    }

    get drawBuffers() {
        return this._drawBuffers;
    }

    set drawBuffers(drawBuffers: DrawBuffers | null) {
        this._drawBuffers = drawBuffers;
    }

    /**
     * Binds all textures by key from the texture key buffer,
     * to texture units. Returns a lookup object which matches the texture key
     * to the index of the texture unit it is binded to.
     */
    private processTextureBuffer(textureKeyBuffer: TextureKey[]) {
        const uniqueTextureKeys = Array.from(new Set(textureKeyBuffer));
        const textureLookup: Partial<Record<TextureKey, number>> = {};

        for (
            let i = 0;
            i <
            Math.min(
                this.maxTextureUnits,
                uniqueTextureKeys.length,
                this.maxSimultaneousTextureUnits
            );
            i++
        ) {
            const texture = this._textureManager.getTexture(
                uniqueTextureKeys[i]
            );
            // console.log(texture, i, uniqueTextureKeys[i]);

            if (!!texture) {
                // console.log(this.gl.TEXTURE0 + i);
                this.gl.activeTexture(this.gl.TEXTURE0 + i);
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                textureLookup[uniqueTextureKeys[i]] = i;
            }
            // console.log("Run", i, uniqueTextureKeys[i]);
        }
        return textureLookup;
    }

    private textureKeyToIndex = (
        textureLookup: Partial<Record<TextureKey, number>>,
        textureKeyBuffer: TextureKey[]
    ) => {
        const textureIndexBuffer: number[] = [];
        textureKeyBuffer.forEach((key) =>
            textureIndexBuffer.push(textureLookup[key] || 0)
        );

        return textureIndexBuffer;
    };

    draw(destTexture: WebGLTexture | null = null) {
        const program = this.program.getProgram();
        const gl = this.gl;

        // ! Extensions also leak into other programs too
        const ext = gl.getExtension("ANGLE_instanced_arrays");
        if (!ext) {
            throw Error("Needs the ANGLE_instanced_arrays to work");
        }

        if (!this.drawBuffers) {
            throw Error("Cannot draw without drawbuffers");
        }

        const dimensions: [width: number, height: number] = [
            NATIVE_RESOLUTION_W,
            NATIVE_RESOLUTION_H,
        ];

        // draw to canvas
        const fb = this.framebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            attachmentPoint,
            gl.TEXTURE_2D,
            destTexture,
            0
        );

        // Clear texture
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.viewport(0, 0, ...dimensions);

        if (gl && program) {
            gl.useProgram(program);

            const textureLookup = this.processTextureBuffer(
                this.drawBuffers.textureKey
            );
            const textureIndexBuffer = this.textureKeyToIndex(
                textureLookup,
                this.drawBuffers.textureKey
            );

            // Set up uniforms
            {
                const u_texLocation = gl.getUniformLocation(
                    program,
                    "u_tex[0]"
                );
                gl.uniform1iv(u_texLocation, [0, 1, 2, 3]);

                const u_resolutionLocation = gl.getUniformLocation(
                    program,
                    "u_resolution"
                );
                gl.uniform2f(u_resolutionLocation, ...dimensions);
            }

            // Set up attribute buffers
            {
                const a_quadVertLocation = gl.getAttribLocation(
                    program,
                    "a_quadVert"
                );
                const a_quadVertUVLocation = gl.getAttribLocation(
                    program,
                    "a_quadVertUV"
                );

                const a_transformLocation = gl.getAttribLocation(
                    program,
                    "a_transform"
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_transform);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(this.drawBuffers.transform),
                    gl.STATIC_DRAW
                );

                const a_transformUVLocation = gl.getAttribLocation(
                    program,
                    "a_transformUV"
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_transformUV);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(this.drawBuffers.transformUV),
                    gl.STATIC_DRAW
                );

                const a_textureIndexLocation = gl.getAttribLocation(
                    program,
                    "a_textureIndex"
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_textureIndex);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(textureIndexBuffer),
                    gl.STATIC_DRAW
                );

                const a_hsvaModLocation = gl.getAttribLocation(
                    program,
                    "a_hsvaMod"
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_hsvaMod);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(this.drawBuffers.hsvaMod),
                    gl.STATIC_DRAW
                );

                // Set up attribute pointers
                gl.enableVertexAttribArray(a_quadVertLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_quadVert);
                gl.vertexAttribPointer(
                    a_quadVertLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_quadVertUVLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_quadVertUV);
                gl.vertexAttribPointer(
                    a_quadVertUVLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_transform);
                for (let i = 0; i < 4; i++) {
                    gl.enableVertexAttribArray(a_transformLocation + i);
                    gl.vertexAttribPointer(
                        a_transformLocation + i,
                        4,
                        gl.FLOAT,
                        false,
                        64, // 64 bytes = 16 numbers * 4 bytes in matrix
                        i * 16
                    );
                    ext.vertexAttribDivisorANGLE(a_transformLocation + i, 1);
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_transformUV);
                for (let i = 0; i < 4; i++) {
                    gl.enableVertexAttribArray(a_transformUVLocation + i);
                    gl.vertexAttribPointer(
                        a_transformUVLocation + i,
                        4,
                        gl.FLOAT,
                        false,
                        64, // 64 bytes = 16 numbers * 4 bytes in matrix
                        i * 16
                    );
                    ext.vertexAttribDivisorANGLE(a_transformUVLocation + i, 1);
                }

                gl.enableVertexAttribArray(a_textureIndexLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_textureIndex);
                gl.vertexAttribPointer(
                    a_textureIndexLocation,
                    1,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
                ext.vertexAttribDivisorANGLE(a_textureIndexLocation, 1);

                gl.enableVertexAttribArray(a_hsvaModLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.a_hsvaMod);
                gl.vertexAttribPointer(
                    a_hsvaModLocation,
                    4,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
                ext.vertexAttribDivisorANGLE(a_hsvaModLocation, 1);

                //console.log(textureIndexBuffer, drawBuffers.positionBuffer.length / 2);
                ext.drawArraysInstancedANGLE(
                    gl.TRIANGLES,
                    0,
                    6,
                    this.drawBuffers.transform.length / 16
                );
            }
        }
    }
}
