import { ControllerPortManager } from "@classes/ControllerPortManager";
import { DrawableEntity } from "@classes/DrawableEntity";
import { Entity } from "@classes/Entity";
import { TextureManager } from "@classes/TextureManager";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { DrawBuffers } from "src/shaders/types";

/**
 * A group entity is an entity that consists of
 * - passive entities: entities that belong to the group but are not visible
 * - drawable entities: entities that belong to the group that are renderable to a texture or screen
 */
export abstract class GroupEntity extends DrawableEntity {
    protected passives: Entity[] = [];
    protected drawables: DrawableEntity[] = [];

    constructor(intervalManager: IntervalManager, controllerPortManager: ControllerPortManager) {
        super(intervalManager, controllerPortManager);
    }

    private addEntity<E extends Entity>(subgroup: E[], entity: E) {
        if (!subgroup.includes(entity)) {
            subgroup.push(entity);
        }
    }

    addPassive(entity: Entity) {
        this.addEntity(this.passives, entity);
    }

    addDrawable(entity: DrawableEntity) {
        this.addEntity(this.drawables, entity);
    }

    private addEntities<E extends Entity>(subgroup: E[], entitiesToAdd: E[]) {
        entitiesToAdd.forEach((entity) => {
            this.addEntity(subgroup, entity);
        });
    }

    addPassives(entities: Entity[]) {
        this.addEntities(this.passives, entities);
    }

    addDrawables(entities: DrawableEntity[]) {
        this.addEntities(this.drawables, entities);
    }

    private removeEntity<E extends Entity>(subgroup: E[], entity: E) {
        const index = subgroup.indexOf(entity);

        if (index !== -1) {
            return subgroup.splice(index)[0];
        }
    }

    removePassive(entity: Entity) {
        this.removeEntity(this.passives, entity);
    }

    removeDrawable(entity: DrawableEntity) {
        this.removeEntity(this.drawables, entity);
    }

    private removeEntities<E extends Entity>(subgroup: E[], entitiesToRemove: E[]) {
        entitiesToRemove.forEach((entity) => {
            this.removeEntity(subgroup, entity);
        });
    }

    removePassives(entities: Entity[]) {
        this.removeEntities(this.passives, entities);
    }

    removeDrawables(entities: DrawableEntity[]) {
        this.removeEntities(this.drawables, entities);
    }

    async getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager): Promise<DrawBuffers> {
        const drawBuffers: DrawBuffers = {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
        };

        await Promise.all(
            this.drawables.map(async (entity) => {
                const entityBuffers = await entity.getDrawBuffers(gl, textureManager);

                drawBuffers.positionBuffer.push(...entityBuffers.positionBuffer);
                drawBuffers.textureCoordBuffer.push(...entityBuffers.textureCoordBuffer);
                drawBuffers.textureKeyBuffer.push(...entityBuffers.textureKeyBuffer);
            })
        );

        return drawBuffers;
    }
}
