import { GameEntity } from "@classes/GameEntity";
import { DrawSprite } from "@classes/ShaderProgram";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";
export class GameRenderer {
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
            throw new Error(
                "Failed to register entity, unable to obtain rendering context."
            );
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
     * Renders the scene with the given entities, entities are drawn in order.
     * Entities at the front are drawn first.
     */
    renderScene() {
        const gl = this.getRenderingContext();
        if (gl) {
            this.entities.forEach((entity) => {
                entity.draw();
            });
            return;
        } else {
            throw new Error("Failed to render, no canvas was set.");
        }
    }
}
