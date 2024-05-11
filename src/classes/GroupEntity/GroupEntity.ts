import { DrawableEntity } from "@classes/DrawableEntity";
import { Contexts, Entity } from "@classes/Entity";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";
import { Tuple } from "src/types";

/**
 * A group entity is an entity that consists of
 * - passive entities: entities that belong to the group but are not visible
 * - drawable entities: entities that belong to the group that are renderable to a texture or screen
 */
export abstract class GroupEntity extends DrawableEntity {
    protected passives: Entity[] = [];
    protected drawables: DrawableEntity[] = [];

    constructor(contexts: Contexts = {}) {
        super({}, contexts);
    }

    private addEntity<E extends Entity>(subgroup: E[], entity: E) {
        if (!subgroup.includes(entity)) {
            subgroup.push(entity);
            entity.parent = this;
        }
    }

    /**
     * Adds entity to the end of the list of passives and parents it to this group entity.
     */
    addPassive(entity: Entity) {
        this.addEntity(this.passives, entity);
    }

    /**
     * Adds entity to the end of list of drawables and parents it to this group entity.
     */
    addDrawable(entity: DrawableEntity) {
        this.addEntity(this.drawables, entity);
    }

    private addEntities<E extends Entity>(subgroup: E[], entitiesToAdd: E[]) {
        entitiesToAdd.forEach((entity) => {
            this.addEntity(subgroup, entity);
        });
    }

    /**
     * Adds multiple entities to the end of list of passives and parents it to this group entity.
     */
    addPassives(entities: Entity[]) {
        this.addEntities(this.passives, entities);
    }

    /**
     * Adds multiple entities to the end of list of passives and parents it to this group entity.
     */
    addDrawables(entities: DrawableEntity[]) {
        this.addEntities(this.drawables, entities);
    }

    private removeEntity<E extends Entity>(subgroup: E[], entity: E) {
        const index = subgroup.indexOf(entity);

        if (index !== -1) {
            return subgroup.splice(index, 1)[0];
        }

        entity.parent = null;
    }

    /**
     * Removes entity from the list of passives and unparents it from this group entity.
     */
    removePassive(entity: Entity) {
        this.removeEntity(this.passives, entity);
    }

    /**
     * Removes entity from the list of drawables and unparents it from this group entity.
     */
    removeDrawable(entity: DrawableEntity) {
        this.removeEntity(this.drawables, entity);
    }

    private removeEntities<E extends Entity>(subgroup: E[], entitiesToRemove: E[]) {
        entitiesToRemove.forEach((entity) => {
            this.removeEntity(subgroup, entity);
        });
    }

    /**
     * Removes multiple entities from the list of passives and unparents them all from this group entity.
     */
    removePassives(entities: Entity[]) {
        this.removeEntities(this.passives, entities);
    }

    /**
     * Removes multiple entities from the list of drawables and unparents them all from this group entity.
     */
    removeDrawables(entities: DrawableEntity[]) {
        this.removeEntities(this.drawables, entities);
    }

    async getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager, hsvaModBuffer: Tuple<number, 4>): Promise<DrawBuffers> {
        const drawBuffers: DrawBuffers = {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
            hsvaModBuffer: [],
        };

        await Promise.all(
            this.drawables.map(async (entity) => {
                const sumHsvaMod = this.getHsvaModifier().map((component, idx) => component + hsvaModBuffer[idx]) as Tuple<number, 4>;

                const entityBuffers = await entity.getDrawBuffers(gl, textureManager, sumHsvaMod);

                drawBuffers.positionBuffer.push(...entityBuffers.positionBuffer);
                drawBuffers.textureCoordBuffer.push(...entityBuffers.textureCoordBuffer);
                drawBuffers.textureKeyBuffer.push(...entityBuffers.textureKeyBuffer);
                drawBuffers.hsvaModBuffer.push(...entityBuffers.hsvaModBuffer);
            })
        );

        return drawBuffers;
    }
}
