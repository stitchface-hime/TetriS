import { GameEntity } from "@classes/GameEntity";
import { DrawSprite } from "@classes/ShaderProgram";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";
export class GameRenderer {
    private spriteSheets: Record<string, SpriteSheet> = {};

    private entities: Set<GameEntity> = new Set();
    private canvas: HTMLCanvasElement | null = null;
    private spriteRenderer: DrawSprite | null = null;

    constructor() {}
    /**
     * Loads a sprite sheet given its source.
     * @param src source of the sprite sheet.
     * @param sheetId an id used to identify the loaded sprite sheet later.
     * @param spriteSize the size of each individual sprite.
     */
    load({ id, src, spriteSize }: SpriteSheetDetails) {
        this.spriteSheets[id] = {
            id,
            image: null,
            loaded: false,
            spriteSize,
        };
        const image = new Image();
        image.src = src;

        const promise = new Promise<void>((resolve) => {
            image.onload = () => {
                // TODO: What happens if same sheet is loaded twice?
                this.spriteSheets[id].loaded = true;
                this.spriteSheets[id].image = image;

                resolve();
            };
        });

        return promise;
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

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    setSpriteRenderer(spriteRenderer: DrawSprite) {
        this.spriteRenderer = spriteRenderer;
    }

    unsetSpriteRenderer() {
        this.spriteRenderer = null;
    }

    /**
     * Registers an entity within the game. Does nothing if you register
     * an entity with the same reference more than once.
     */
    registerEntity(entity: GameEntity) {
        this.entities.add(entity);
        const spriteSheetData = entity.getActiveSpriteSheetData();
        if (spriteSheetData) {
            const { id, src, width, height, spriteSize } = spriteSheetData;

            this.load({
                id,
                src,
                width,
                height,
                spriteSize,
            });
        }
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
        const gl = this.canvas?.getContext("webgl");
        if (gl && this.spriteRenderer) {
            const spriteRenderer = this.spriteRenderer;

            this.entities.forEach((entity) => {
                const activeSpriteSheetId =
                    entity.getActiveSpriteSheetData()?.id;
                const spriteSheet = activeSpriteSheetId
                    ? this.spriteSheets[activeSpriteSheetId]
                    : undefined;

                // Pass sprite sheet to entity drawer
                entity.draw(gl, spriteRenderer, spriteSheet);
            });
            return;
        } else {
            throw new Error("Failed to render, no canvas was set.");
        }
    }
}
