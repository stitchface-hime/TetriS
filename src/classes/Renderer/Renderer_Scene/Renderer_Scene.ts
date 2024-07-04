import { TextureKey } from "@data/TextureKey";
import { DrawBuffers } from "src/shaders/types";
import { Renderer } from "../Renderer";
import { ShaderProgram } from "@classes/ShaderProgram";
import { TextureManager } from "@classes/TextureManager";
import { Shader_Scene } from "@classes/ShaderProgram/Shader_Scene";
import { getRectangleCoords } from "@utils/getRectangleCoords";

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

    constructor(gl: WebGLRenderingContext, textureManager: TextureManager) {
        super(gl);
        this.program = new ShaderProgram(...Shader_Scene, gl);
        this._textureManager = textureManager;
        this.maxTextureUnits = this.gl.getParameter(
            this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
        );
    }

    get textureManager() {
        return this._textureManager;
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
        // console.log(textureLookup);
        const textureIndexBuffer: number[] = [];
        textureKeyBuffer.forEach((key) =>
            textureIndexBuffer.push(...Array(6).fill(textureLookup[key] || 0))
        );
        return textureIndexBuffer;
    };

    async draw(drawBuffers: DrawBuffers) {
        const program = this.program.getProgram();
        const gl = this.gl;
        const canvas = gl.canvas as HTMLCanvasElement;
        const dimensions: [width: number, height: number] = [
            canvas.clientWidth,
            canvas.clientHeight,
        ];

        // draw to canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.resizeCanvas();
        gl.viewport(0, 0, ...dimensions);

        if (gl && program) {
            gl.useProgram(program);

            const textureLookup = this.processTextureBuffer(
                drawBuffers.textureKey
            );
            const textureIndexBuffer = this.textureKeyToIndex(
                textureLookup,
                drawBuffers.textureKey
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
                const a_quadVertBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, a_quadVertBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(getRectangleCoords(0, 0, 1, 1)),
                    gl.STATIC_DRAW
                );

                const a_quadVertUVLocation = gl.getAttribLocation(
                    program,
                    "a_quadVertUV"
                );
                const a_quadVertUVBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, a_quadVertUVBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(getRectangleCoords(0, 0, 1, 1)),
                    gl.STATIC_DRAW
                );

                const a_transformBufferLocation = gl.getAttribLocation(
                    program,
                    "a_transformBufferLocation"
                );
                const a_transformBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, a_transformBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(drawBuffers.transform),
                    gl.STATIC_DRAW
                );

                const a_transformUVLocation = gl.getAttribLocation(
                    program,
                    "a_transformUVLocation"
                );
                const a_transformUVBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, a_transformUVBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(drawBuffers.transformUV),
                    gl.STATIC_DRAW
                );

                const a_textureIndexLocation = gl.getAttribLocation(
                    program,
                    "a_textureIndex"
                );
                const a_textureIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, a_textureIndexBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(textureIndexBuffer),
                    gl.STATIC_DRAW
                );

                const a_hsvaModLocation = gl.getAttribLocation(
                    program,
                    "a_hsvaMod"
                );
                const a_hsvaModBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, a_hsvaModBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(drawBuffers.hsvaMod),
                    gl.STATIC_DRAW
                );

                // Set up attribute pointers
                gl.enableVertexAttribArray(a_quadVertLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, a_quadVertBuffer);
                gl.vertexAttribPointer(
                    a_quadVertLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_quadVertUVLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, a_quadVertUVBuffer);
                gl.vertexAttribPointer(
                    a_quadVertUVLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_transformBufferLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, a_transformBuffer);
                gl.vertexAttribPointer(
                    a_transformBufferLocation,
                    4,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_transformUVLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, a_transformUVBuffer);
                gl.vertexAttribPointer(
                    a_transformBufferLocation,
                    4,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_textureIndexLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, a_textureIndexBuffer);
                gl.vertexAttribPointer(
                    a_textureIndexLocation,
                    1,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.enableVertexAttribArray(a_hsvaModLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, a_hsvaModBuffer);
                gl.vertexAttribPointer(
                    a_hsvaModLocation,
                    4,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                //console.log(textureIndexBuffer, drawBuffers.positionBuffer.length / 2);
                gl.drawArrays(
                    gl.TRIANGLES,
                    0,
                    drawBuffers.transform.length / 2
                );
            }
        }
    }
}
