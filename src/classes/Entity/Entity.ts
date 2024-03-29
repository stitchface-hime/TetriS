import { Controller, HeldButtons } from "@classes/Controller";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Button } from "@classes/InputBinding/types";
import { Interval } from "@classes/TimeMeasure";

export abstract class Entity {
    protected parent: GroupEntity | null = null;
    protected controllers: Controller[] = [];
    protected intervals: Interval[] = [];

    getParent() {
        return this.parent;
    }

    setParent(parent: GroupEntity) {
        this.parent = parent;
    }

    unsetParent() {
        this.parent = null;
    }

    acceptInput(heldButtons: HeldButtons, releasedButtons: Button[]) {
        // no-op, implementated in each individual entity
    }

    registerInterval() {
        // TODO
    }

    registerController() {
        // TODO
    }

    destroy() {}
}
