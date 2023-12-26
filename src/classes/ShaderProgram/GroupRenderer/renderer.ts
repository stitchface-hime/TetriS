import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { vertex } from "./vertex";
import { fragment } from "./fragment";
import { DrawableEntity } from "@classes/DrawableEntity";
import { MAX_ERROR_BEFORE_SUPPRESS } from "src/constants";

export class GroupRenderer extends ShaderProgram {
    /**
     * A reference to the entities set of a GroupEntity.
     */
    private entitiesRef: Set<DrawableEntity> | null = null;

    private drawErrorCount = 0;

    constructor(gl: WebGLRenderingContext) {
        console.log("Creating group shader");
        super(vertex, fragment, gl);
    }

    setEntitiesRef(entitiesRef: Set<DrawableEntity>) {
        this.entitiesRef = entitiesRef;
    }

    async draw() {
        const program = this.program;
        const gl = this.gl;

        if (gl && program) {
            if (this.entitiesRef) {
                const renderToTexture = (
                    fb: WebGLFramebuffer | null,
                    sourceTexture: WebGLTexture | WebGLTexture[] | null,
                    targetTexture: WebGLTexture | null
                ) => {
                    gl.useProgram(program);

                    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, 0);

                    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

                    const positionLocation = gl.getAttribLocation(program, "a_position");
                    const texCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
                    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                    const positionBuffer = gl.createBuffer();
                    const texCoordBuffer = gl.createBuffer();

                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, canvas.width, canvas.height)), gl.STATIC_DRAW);

                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, 1, 1)), gl.STATIC_DRAW);

                    // enable arrays
                    gl.enableVertexAttribArray(positionLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                    gl.enableVertexAttribArray(texCoordLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, true, 0, 0);

                    gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);

                    if (sourceTexture) {
                        const sourceTextures = !Array.isArray(sourceTexture) ? [sourceTexture] : sourceTexture;

                        sourceTextures.forEach((texture) => {
                            gl.bindTexture(gl.TEXTURE_2D, texture);
                            gl.drawArrays(gl.TRIANGLES, 0, 6);
                        });
                    }
                };

                const canvas = gl.canvas as HTMLCanvasElement;

                // [t0: texture to render to canvas, t1: texture containing sprite to render, t2: final texture]
                const baseTextures = [gl.createTexture(), gl.createTexture(), gl.createTexture()] as const;

                baseTextures.forEach((_texture, idx) => {
                    gl.bindTexture(gl.TEXTURE_2D, baseTextures[idx]);

                    // prepare t0
                    const level = 0;
                    const internalFormat = gl.RGBA;
                    const border = 0;
                    const format = gl.RGBA;
                    const type = gl.UNSIGNED_BYTE;
                    const data = null;

                    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, canvas.clientWidth, canvas.clientHeight, border, format, type, data);

                    // Don't use linear as that requires MIPS
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                    //
                });

                const fb = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                const attachmentPoint = gl.COLOR_ATTACHMENT0;

                const entityArray = Array.from(this.entitiesRef);

                for (let i = 0; i < entityArray.length; i++) {
                    renderToTexture(fb, baseTextures[2], baseTextures[0]);

                    // render to texture 1
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[1], 0);

                    await entityArray[i].draw();

                    // render textures 0 and 1 into texture 2
                    renderToTexture(fb, [baseTextures[0], baseTextures[1]], baseTextures[2]);
                }

                {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                    gl.useProgram(program);
                    gl.bindTexture(gl.TEXTURE_2D, baseTextures[2]);

                    // clear main canvas
                    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

                    const positionLocation = gl.getAttribLocation(program, "a_position");
                    const texCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
                    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
                    // const colorLocation = gl.getUniformLocation(program, "u_color");

                    const positionBuffer = gl.createBuffer();
                    const texCoordBuffer = gl.createBuffer();

                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, canvas.width, canvas.height)), gl.STATIC_DRAW);

                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, 1, 1)), gl.STATIC_DRAW);

                    // enable arrays
                    gl.enableVertexAttribArray(positionLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                    gl.enableVertexAttribArray(texCoordLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, true, 0, 0);

                    gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
                return;
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
     * Loads the current contents of the framebuffer into an array and logs the bytes in the console.
     * Can add a custom message with the debug log à la `console.log`.
     */
    private debugTexture(message?: any, ...other: any[]) {
        const gl = this.gl;
        if (gl) {
            const canvas = gl.canvas as HTMLCanvasElement;

            let data = new Uint8Array(canvas.clientWidth * canvas.clientHeight * 4);
            gl.readPixels(0, 0, canvas.clientWidth, canvas.clientHeight, gl.RGBA, gl.UNSIGNED_BYTE, data);
            console.log(message, ...other, data);
        }
    }
}
