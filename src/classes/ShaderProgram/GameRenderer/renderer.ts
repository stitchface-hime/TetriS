import { GameEntity } from "@classes/GameEntity";
import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

export class GameRenderer extends ShaderProgram {
    private spriteSheets: Record<string, SpriteSheet> = {};

    private entities: Set<GameEntity> = new Set();
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
    registerEntity(entity: GameEntity) {
        const gl = this.canvas?.getContext("webgl");

        if (gl) {
            this.entities.add(entity);
            entity.assignContextToRenderer(gl);
        } else {
            throw new Error("Failed to register entity, unable to obtain rendering context.");
        }
        // console.log("Registered entities:", this.entities.size);
    }

    /**
     * Register multiple entities.
     */
    registerEntities(entities: GameEntity[]) {
        entities.forEach((entity) => {
            this.registerEntity(entity);
        });
    }

    /**
     * Unregisters an entity from the game using its own reference.
     * Returns true if successfully found and removed, false if it doesn't exist.
     */
    unregisterEntity(entity: GameEntity) {
        const deleted = this.entities.delete(entity);
        return deleted;

        // TODO: Find some way to unload unused assets?
    }

    /**
     * Unregisters multiple entities.
     */
    unregisterEntities(entities: GameEntity[]) {
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
    draw() {
        const gl = this.getRenderingContext();
        const program = this.program;

        if (gl && program) {
            const canvas = gl.canvas as HTMLCanvasElement;

            // [t0: texture to render to canvas, t1: texture containing sprite to render]
            const baseTextures = [gl.createTexture(), gl.createTexture()] as const;

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

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                //
            });

            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            /* const attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[0], 0); */

            //
            let idx = 0;
            //

            console.log("Entities:", this.entities);

            gl.clearColor(1, 0, 0.6, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this.entities.forEach((entity) => {
                if (idx === 0) {
                    // Draw into texture 0
                    idx++;
                    console.log("Entity:", entity, this.entities);
                    gl.bindTexture(gl.TEXTURE_2D, baseTextures[0]);

                    // set framebuffer to point to t1
                    //console.log("Hello");
                    // gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[0], 0);
                    //console.log("Hello1");

                    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

                    entity.draw();

                    // using framebuffers, draw t0 and t1 into t0
                    /* {
                        // draw into texture 0
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[0], 0);
                        gl.bindTexture(gl.TEXTURE_2D, baseTextures[1]);

                        gl.useProgram(program);

                        const positionLocation = gl.getAttribLocation(program, "a_position");
                        const texCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
                        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                        const positionBuffer = gl.createBuffer();
                        const texCoordBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, canvas.clientWidth, canvas.clientHeight)), gl.STATIC_DRAW);

                        // set framebuffer to point to t0
                        console.log("Hello2");
                        // gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[0], 0);
                        console.log("Hello3");

                        const level = 0;
                        const internalFormat = gl.RGBA;
                        const border = 0;
                        const format = gl.RGBA;
                        const type = gl.UNSIGNED_BYTE;
                        const data = null;

                        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, canvas.clientWidth, canvas.clientHeight, border, format, type, data);

                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
                        gl.clearColor(1, 1, 1, 0);
                        gl.clear(gl.COLOR_BUFFER_BIT);

                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, gl.canvas.width, gl.canvas.height)), gl.STATIC_DRAW);

                        // enable arrays
                        gl.enableVertexAttribArray(positionLocation);
                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                        gl.enableVertexAttribArray(texCoordLocation);
                        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, true, 0, 0);

                        gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);
                        console.log("Draw");
                        gl.drawArrays(gl.TRIANGLES, 0, 6);
                        console.log("Draw1");
                    } */
                }
            });

            /* {
                gl.useProgram(program);

                const positionLocation = gl.getAttribLocation(program, "a_position");
                const texCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
                const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                const positionBuffer = gl.createBuffer();
                const texCoordBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, canvas.clientWidth, canvas.clientHeight)), gl.STATIC_DRAW);

                // set framebuffer to null to render to canvas
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.bindTexture(gl.TEXTURE_2D, baseTextures[0]);

                // gl.viewport(0, 0, canvas.clientWidth / 2, canvas.clientHeight / 2);
                gl.clearColor(1, 1, 1, 0); // clear to white
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, gl.canvas.width, gl.canvas.height)), gl.STATIC_DRAW);

                // enable arrays
                gl.enableVertexAttribArray(positionLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                gl.enableVertexAttribArray(texCoordLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, true, 0, 0);

                gl.uniform2f(resolutionLocation, canvas.clientWidth, canvas.clientHeight);

                gl.drawArrays(gl.TRIANGLES, 0, 6);
            } */

            console.log("Finish");
            return;
        } else {
            throw new Error("Failed to render, no canvas was set.");
        }
    }
}
