import { GameEntity } from "@classes/GameEntity";
import { DrawSprite } from "@classes/ShaderProgram";
import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { getRectangleCoords } from "@utils/getRectangleCoords";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";
export class GameRenderer extends ShaderProgram {
    private spriteSheets: Record<string, SpriteSheet> = {};

    private entities: Set<GameEntity> = new Set();
    private canvas: HTMLCanvasElement | null = null;

    constructor() {}

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
        const canvas = gl?.canvas as HTMLCanvasElement;
        if (gl && program) {
            const canvas = gl.canvas as HTMLCanvasElement;
            gl.useProgram(program);
            // create a texture to render to
            const positionLocation = gl.getAttribLocation(program, "a_position");
            const texCoordLocation = gl.getAttribLocation(program, "a_texcoord");
            const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

            const positionBuffer = gl.createBuffer();
            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.TEXTURE_2D, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleCoords(0, 0, canvas.clientWidth, canvas.clientHeight)), gl.STATIC_DRAW);

            // [t0: texture to render to canvas, t1: texture containing sprite to render]
            const baseTextures = [gl.createTexture(), gl.createTexture()] as const;

            gl.bindTexture(gl.TEXTURE_2D, baseTextures[0]);

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
            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            const attachmentPoint = gl.COLOR_ATTACHMENT0;

            this.entities.forEach((entity, idx) => {
                gl.bindTexture(gl.TEXTURE_2D, baseTextures[0]);
                const texDimensions = entity.getDimensions();
                {
                    const level = 0;
                    const internalFormat = gl.RGBA;
                    const border = 0;
                    const format = gl.RGBA;
                    const type = gl.UNSIGNED_BYTE;
                    const data = null;

                    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, ...texDimensions, border, format, type, data);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }

                // set framebuffer to point to t1
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, baseTextures[1], 0);

                this.resizeCanvas();

                gl.viewport(0, 0, ...texDimensions);
                gl.clearColor(1, 1, 1, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                entity.draw();

                // using framebuffers, draw t0 and t1 into t0
            });

            // set framebuffer to null to render to canvas
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, baseTextures[0]);

            /* gl.viewport(0, 0, canvas.clientWidth / 2, canvas.clientHeight / 2); */
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

            return;
        } else {
            throw new Error("Failed to render, no canvas was set.");
        }
    }
}
