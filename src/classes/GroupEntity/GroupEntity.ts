import { DrawableEntity } from "@classes/DrawableEntity";
import { Entity } from "@classes/Entity";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";

export abstract class GroupEntity extends Entity {
    protected entities: DrawableEntity[] = [];

    // TODO: need to implement transformations for children elements
    addEntity(entity: DrawableEntity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }

    addMultipleEntities(entities: DrawableEntity[]) {
        entities.forEach((entity) => {
            this.addEntity(entity);
        });
    }

    removeEntity(entity: DrawableEntity) {
        const index = this.entities.indexOf(entity);

        if (index !== -1) {
            return this.entities.splice(index)[0];
        }
    }

    removeMultiple(entities: DrawableEntity[]) {
        entities.forEach((entity) => {
            this.removeEntity(entity);
        });
    }

    async getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager): Promise<DrawBuffers> {
        const drawBuffers: DrawBuffers = {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
        };

        console.log("Generating buffers for entities:", this.entities);

        await Promise.all(
            this.entities.map(async (entity) => {
                const entityBuffers = await entity.getDrawBuffers(gl, textureManager);

                drawBuffers.positionBuffer.push(...entityBuffers.positionBuffer);
                drawBuffers.textureCoordBuffer.push(...entityBuffers.textureCoordBuffer);
                drawBuffers.textureKeyBuffer.push(...entityBuffers.textureKeyBuffer);
            })
        );

        return drawBuffers;
    }
}
