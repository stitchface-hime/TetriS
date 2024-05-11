import { DrawableEntity } from "@classes/DrawableEntity";
import { Contexts, Entity } from "@classes/Entity";
import { EntityCollection } from "@classes/EntityCollection";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";
import { Tuple } from "src/types";

/**
 * A group entity is an entity that consists of
 * - passive entities: entities that belong to the group but are not visible
 * - drawable entities: entities that belong to the group that are renderable to a texture or screen
 *
 * When a group entity is rendered, child entities are rendered in the order they are pushed into the group entity.
 */
export abstract class GroupEntity extends DrawableEntity {
    protected _passives = new EntityCollection<Entity>();
    protected _drawables = new EntityCollection<DrawableEntity>();

    constructor(contexts: Contexts = {}) {
        super({}, contexts);
    }

    get passives() {
        return this._passives;
    }

    get drawables() {
        return this._drawables;
    }

    async getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager, hsvaModBuffer: Tuple<number, 4>): Promise<DrawBuffers> {
        const drawBuffers: DrawBuffers = {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
            hsvaModBuffer: [],
        };

        await Promise.all(
            this.drawables.entities.map(async (entity) => {
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
