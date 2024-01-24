import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { vertex } from "./vertex";
import { fragment } from "./fragment";
import { DrawableEntity } from "@classes/DrawableEntity";
import { MAX_ERROR_BEFORE_SUPPRESS } from "src/constants";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { hexToRgb } from "@utils/hexToRgb";
import { Tuple } from "src/types";

export class GroupRenderer extends ShaderProgram {
    private drawErrorCount = 0;

    constructor(gl: WebGLRenderingContext) {
        super(vertex, fragment, gl);
    }

    private prepareTexture = (gl: WebGLRenderingContext, texture: WebGLTexture | null, dimensions: [width: number, height: number]) => {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, ...dimensions, border, format, type, data);

        // Don't use linear as that requires MIPS
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        //
    };

    async draw(destTexture: WebGLTexture | null, groupEntity: GroupEntity, entities: DrawableEntity[]) {
        console.log("Rendering:", groupEntity.constructor.name);
        const program = this.program;
        const gl = this.gl;
        const dimensions = groupEntity.getDimensions();

        this.resizeCanvas();
        gl.viewport(0, 0, ...dimensions);

        if (gl && program) {
            if (entities) {
                const renderToTexture = (
                    // each texture should have its own position and dimensions
                    src: {
                        texture: WebGLTexture | null;
                        position: [x: number, y: number];
                        dimensions: [width: number, height: number];
                    },
                    dest: {
                        texture: WebGLTexture | null;
                        dimensions: [width: number, height: number];
                    }
                ) => {
                    // We are drawing and overriding the source texture(s) over the destination texture
                    gl.useProgram(program);

                    const fb = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                    const attachmentPoint = gl.COLOR_ATTACHMENT0;

                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, dest.texture, 0);

                    gl.viewport(0, 0, ...dest.dimensions);

                    const positionLocation = gl.getAttribLocation(program, "a_position");
                    const texCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
                    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                    const positionBuffer = gl.createBuffer();
                    const texCoordBuffer = gl.createBuffer();

                    gl.uniform2f(resolutionLocation, ...dest.dimensions);

                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(...src.position, ...src.dimensions)), gl.STATIC_DRAW);

                    // Draw the entire texture (texCoord: [0, 0, 1, 1]) into the rectangle
                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, 1, 1)), gl.STATIC_DRAW);

                    // enable arrays
                    gl.enableVertexAttribArray(positionLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                    gl.enableVertexAttribArray(texCoordLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, true, 0, 0);

                    gl.bindTexture(gl.TEXTURE_2D, src.texture);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                };

                // [t0: intermediate result, t1: final result, t2: sprite]
                // t0 + t2 = t1
                const baseTextures: [accumulator: WebGLTexture | null, result: WebGLTexture | null, sprite: WebGLTexture | null] = [
                    gl.createTexture(),
                    destTexture,
                    gl.createTexture(),
                ] as const;

                this.prepareTexture(gl, baseTextures[0], groupEntity.getDimensions());

                const fb = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                const attachmentPoint = gl.COLOR_ATTACHMENT0;

                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];
                    // render final result into intermediate so we can perform an addition to this texture and the sprite
                    renderToTexture(
                        {
                            texture: baseTextures[1],
                            position: [0, 0],
                            dimensions: groupEntity.getDimensions(),
                        },
                        {
                            texture: baseTextures[0],
                            dimensions: groupEntity.getDimensions(),
                        }
                    );

                    this.prepareTexture(gl, baseTextures[2], entity.getDimensions());

                    // render to texture 2, which contains the sub-entity
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[2], 0);
                    console.log("Begin drawing", entity.constructor.name);
                    await entity.draw(baseTextures[2]);
                    console.log("End drawing", entity.constructor.name);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[2], 0);
                    this.debugTexture([...entity.getDimensions()], "After drawing subentity", entity.constructor.name);

                    // render textures 0 and 2 into texture 1
                    renderToTexture(
                        {
                            texture: baseTextures[0],
                            position: [0, 0],
                            dimensions: groupEntity.getDimensions(),
                        },
                        {
                            texture: baseTextures[1],
                            dimensions: groupEntity.getDimensions(),
                        }
                    );

                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[0], 0);
                    this.debugTexture([...entity.getDimensions()], "In accumulator");

                    console.log("Rendering", entity.constructor.name, "into final texture");
                    renderToTexture(
                        {
                            texture: baseTextures[2],
                            position: entity.getRelativePosition(),
                            dimensions: entity.getDimensions(),
                        },
                        {
                            texture: baseTextures[1],
                            dimensions: groupEntity.getDimensions(),
                        }
                    );
                }
                console.log("Finished drawing all subentities, returning...");
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[1], 0);
                this.debugTexture(dimensions, "Final texture");
            } else {
                this.drawErrorCount++;

                if (this.drawErrorCount < MAX_ERROR_BEFORE_SUPPRESS) {
                    if (this.drawErrorCount === MAX_ERROR_BEFORE_SUPPRESS - 1) {
                        console.error("Too many errors for this renderer instance, suppressing after this error...");
                    }
                    throw new Error("Failed to render, no reference to entities set.");
                }
            }
        } else {
            this.drawErrorCount++;

            if (this.drawErrorCount < MAX_ERROR_BEFORE_SUPPRESS) {
                if (this.drawErrorCount === MAX_ERROR_BEFORE_SUPPRESS - 1) {
                    console.error("Too many errors for this renderer instance, suppressing after this error...");
                }
                throw new Error("Failed to render, no canvas was set.");
            }
        }
    }

    /**
     * Loads the current contents of the currently bound framebuffer into an array and returns the bytes.
     */
    private getBytes = (dimensions: [width: number, height: number]) => {
        const gl = this.gl;
        if (gl) {
            let data = new Uint8Array(dimensions[0] * dimensions[1] * 4);
            gl.readPixels(0, 0, dimensions[0], dimensions[1], gl.RGBA, gl.UNSIGNED_BYTE, data);

            return data;
        }
    };

    /**
     * Loads the current contents of the currently bound framebuffer into an array and returns the pixels
     * as tuples of 4 bytes.
     */
    private getPixels = (dimensions: [width: number, height: number]) => {
        const gl = this.gl;
        if (gl) {
            let data = new Uint8Array(dimensions[0] * dimensions[1] * 4);
            let parsedData: Tuple<number, 4>[] = [];

            gl.readPixels(0, 0, dimensions[0], dimensions[1], gl.RGBA, gl.UNSIGNED_BYTE, data);

            for (let i = 0; i < data.length; i += 4) {
                parsedData.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
            }

            return parsedData;
        }
    };

    /**
     * Loads the current contents of the framebuffer into an array and logs the bytes in the console.
     * Can add a custom message with the debug log à la `console.log`.
     * Index 0 starts from the bottom of the texture.
     */
    private debugTexture(dimensions: [width: number, height: number], message?: any, ...other: any[]) {
        console.log(message, ...other, this.getBytes(dimensions));
    }

    /**
     * Loads the current contents of the framebuffer into an array and logs the bytes in the console.
     * Can add a custom message with the debug log à la `console.log`.
     * Index 0 starts from the bottom of the texture.
     */
    private debugTextureSplitIntoPx(dimensions: [width: number, height: number], message?: any, ...other: any[]) {
        console.log(message, ...other, this.getPixels(dimensions));
    }
}
