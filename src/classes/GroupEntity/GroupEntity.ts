import { DrawableEntity } from "@classes/DrawableEntity";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";

export abstract class GroupEntity extends DrawableEntity {
    protected entities: DrawableEntity[] = [];
    protected renderer: GroupRenderer | null;

    constructor(renderer: GroupRenderer) {
        super();
        this.renderer = renderer;
    }

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

    // TODO: Multi vs group renderer
    // Group renderer renders everything in a quad but with no overflow
    // Multi renderer renders everything but allows overflow
    abstract draw(destTexture: WebGLTexture | null): Promise<void>;
}
