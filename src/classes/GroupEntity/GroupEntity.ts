import { DrawableEntity } from "@classes/DrawableEntity";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";

export class GroupEntity extends DrawableEntity {
    protected entities: DrawableEntity[] = [];

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

    async draw() {
        this.renderer?.draw();
    }
}
