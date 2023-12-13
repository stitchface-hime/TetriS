import { DrawableEntity } from "@classes/DrawableEntity";
import { GameRenderer } from "@classes/ShaderProgram";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";

export class GroupEntity extends DrawableEntity {
    private entities: Set<DrawableEntity> = new Set();

    constructor() {
        super();
        this.renderer = new GroupRenderer(this.entities);
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
