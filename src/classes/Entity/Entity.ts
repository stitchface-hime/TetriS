import { GroupEntity } from "@classes/GroupEntity";
import { Contexts } from "./Entity.types";

export abstract class Entity {
    protected _parent: GroupEntity | null = null;

    protected _contexts: Contexts;

    constructor(managers: Contexts = {}) {
        this._contexts = managers;
    }

    get parent() {
        return this._parent;
    }

    set parent(parent: GroupEntity | null) {
        this._parent = parent;
    }

    get contexts() {
        return this._contexts;
    }

    /**
     * Alias for `Entity.parent = null`.
     */
    unsetParent() {
        this.parent = null;
    }

    destroy() {
        Object.values(this.contexts).forEach((context) => {
            context?.destroy();
        });
    }
}
