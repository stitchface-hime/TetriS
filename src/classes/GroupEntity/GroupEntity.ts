import { DrawableEntity } from "@classes/DrawableEntity";
import { Contexts, Entity } from "@classes/Entity";
import { EntityCollection } from "@classes/EntityCollection";
import { TextureManager } from "@classes/TextureManager";
import { add2DVectorTuples } from "@utils/add2DVectorTuples";
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
    private _passives = new EntityCollection<Entity>();
    private _drawables = new EntityCollection<DrawableEntity>();

    constructor(contexts: Contexts = {}) {
        super({}, contexts);
    }

    get passives() {
        return this._passives;
    }

    get drawables() {
        return this._drawables;
    }

    override translate(translation: [x: number, y: number]) {
        super.translate(translation);

        this.drawables.entities.forEach((drawable) => {
            drawable.translate(translation);
        });
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
