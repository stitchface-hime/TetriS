import { DrawableEntity } from "@classes/DrawableEntity";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";

export class GroupEntity extends DrawableEntity {
    protected entities: Set<DrawableEntity> = new Set();

    constructor(renderer: GroupRenderer) {
        super();
        this.renderer = renderer;
    }

    add(entity: DrawableEntity) {
        this.entities.add(entity);
    }

    addMultiple(entities: DrawableEntity[]) {
        entities.forEach((entity) => {
            this.add(entity);
        });
    }

    remove(entity: DrawableEntity) {
        return this.entities.delete(entity);
    }

    removeMultiple(entities: DrawableEntity[]) {
        entities.forEach((entity) => {
            this.remove(entity);
        });
    }

    async draw() {
        this.renderer?.draw();
    }
}
