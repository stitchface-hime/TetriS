import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { ShaderProgram } from "@classes/ShaderProgram";
import { add2DVectorTuples } from "@utils/add2DVectorTuples";
import { product2DVectorTuples } from "@utils/product2DVectorTuples";

export class Entity {
    protected parent: GroupEntity | null = null;

    getParent() {
        return this.parent;
    }

    setParent(parent: GroupEntity) {
        this.parent = parent;
    }

    unsetParent() {
        this.parent = null;
    }
}
