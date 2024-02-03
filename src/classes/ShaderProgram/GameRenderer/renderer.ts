import { SpritedEntity } from "@classes/SpritedEntity";
import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

export class GameRenderer extends ShaderProgram {
    private spriteSheets: Record<string, SpriteSheet> = {};

    private entities: Set<SpritedEntity> = new Set();
    private canvas: HTMLCanvasElement | null = null;

    constructor() {
        super(vertex, fragment);
    }

    /**
     * Loads a sprite sheet given its source.
     * If the sprite sheet is already loaded, returns the sprite sheet.
     * You can set the `reload` flag to load the image regardless if it has already been loaded.
     */
    async load({ id, src, spriteSize }: SpriteSheetDetails, reload = false) {
        // load the sprite sheet
        if (!this.spriteSheets[id] || reload) {
            this.spriteSheets[id] = {
                id,
                image: null,
                loaded: false,
                spriteSize,
            };
            const image = new Image();
            image.src = src;

            const promise = new Promise((resolve) => {
                image.onload = resolve;
            });

            await promise;

            this.spriteSheets[id].loaded = true;
            this.spriteSheets[id].image = image;
        }

        // or use existing
        return this.spriteSheets[id];
    }

    loadMultiple(sheetsData: SpriteSheetDetails[]) {
        sheetsData.forEach((data) => this.load(data));
    }

    unload(sheetId: string) {
        if (this.spriteSheets[sheetId]) {
            delete this.spriteSheets[sheetId];
        } else {
            console.warn("Sprite sheet not present, no operation occurred.");
        }
    }

    getCanvas() {
        return this.canvas;
    }

    getRenderingContext() {
        return this.canvas?.getContext("webgl") || null;
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // Load images into a texture such that the image is loaded into the texture
        // top-left to bottom-right
        const gl = this.canvas?.getContext("webgl");
        if (gl) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.setWebGLRenderingContext(gl);
        }
    }

    getEntities() {
        return this.entities;
    }

    /**
     * Registers an entity within the game. Does nothing if you register
     * an entity with the same reference more than once.
     */
    registerEntity(entity: SpritedEntity) {
        const gl = this.canvas?.getContext("webgl");

        if (gl) {
            this.entities.add(entity);
            entity.setGameRenderer(this);
            entity.assignContextToRenderer(gl);
        } else {
            throw new Error("Failed to register entity, unable to obtain rendering context.");
        }
        // console.log("Registered entities:", this.entities.size);
    }

    /**
     * Register multiple entities.
     */
    registerEntities(entities: SpritedEntity[]) {
        entities.forEach((entity) => {
            this.registerEntity(entity);
        });
    }

    /**
     * Unregisters an entity from the game using its own reference.
     * Returns true if successfully found and removed, false if it doesn't exist.
     */
    unregisterEntity(entity: SpritedEntity) {
        const deleted = this.entities.delete(entity);
        return deleted;

        // TODO: Find some way to unload unused assets?
    }

    /**
     * Unregisters multiple entities.
     */
    unregisterEntities(entities: SpritedEntity[]) {
        entities.forEach((entity) => this.unregisterEntity(entity));
    }

    /**
     * Sets the canvas dimensions according to the current size of the canvas if ti has been resized.
     */
    protected resizeCanvas() {
        const gl = this.getRenderingContext();

        if (gl) {
            const canvas = gl.canvas as HTMLCanvasElement;

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            canvas.width = width;
            canvas.height = height;
        }
    }

    /**
     * Renders the scene with the given entities, entities are drawn in order.
     * Entities at the front are drawn first.
     */
    async draw() {
        const gl = this.getRenderingContext();
        const program = this.program;

        if (gl && program) {
            const renderToTexture = (fb: WebGLFramebuffer | null, sourceTexture: WebGLTexture | WebGLTexture[] | null, targetTexture: WebGLTexture | null) => {
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

            const entityArray = Array.from(this.entities);

            for (let i = 0; i < entityArray.length; i++) {
                renderToTexture(fb, baseTextures[2], baseTextures[0]);

                // render to texture 1
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[1], 0);

                await entityArray[i].getDrawBuffers(gl);

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
            throw new Error("Failed to render, no canvas was set.");
        }
    }

    /**
     * Loads the current contents of the framebuffer into an array and logs the bytes in the console.
     * Can add a custom message with the debug log à la `console.log`.
     */
    private debugTexture(message?: any, ...other: any[]) {
        const gl = this.getRenderingContext();
        if (gl) {
            const canvas = gl.canvas as HTMLCanvasElement;

            let data = new Uint8Array(canvas.clientWidth * canvas.clientHeight * 4);
            gl.readPixels(0, 0, canvas.clientWidth, canvas.clientHeight, gl.RGBA, gl.UNSIGNED_BYTE, data);
            console.log(message, ...other, data);
        }
    }
}
