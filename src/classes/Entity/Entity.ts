import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Interval } from "@classes/TimeMeasure";
import { Managers } from "./Entity.types";

export abstract class Entity {
    protected _parent: GroupEntity | null = null;
    protected intervals: Partial<Record<string, Interval>> = {};

    protected managers: Managers;

    constructor(managers: Managers = {}) {
        this.managers = managers;
    }

    get parent() {
        return this._parent;
    }

    set parent(parent: GroupEntity | null) {
        this._parent = parent;
    }

    /**
     * Alias for `Entity.parent = null`.
     */
    unsetParent() {
        this.parent = null;
    }

    destroy() {
        if (this.managers.intervalManager) {
        }
    }
}
