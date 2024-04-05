import { HeldButtons } from "@classes/Controller";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Button } from "@classes/InputBinding/types";
import { Interval } from "@classes/TimeMeasure";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";

export abstract class Entity {
    protected parent: GroupEntity | null = null;
    protected intervals: Partial<Record<string, Interval>> = {};

    private intervalManager: IntervalManager;

    constructor(intervalManager: IntervalManager, controllerPortManager: ControllerPortManager) {
        this.intervalManager = intervalManager;
    }

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

    /**
     * TODO: Can we not expose interval manager like this?
     */
    getIntervalManager() {
        return this.intervalManager;
    }

    getInterval(key: string) {
        return this.intervals[key];
    }

    /**
     * Registers an interval to this entity, which will run automatically unless otherwise specified.
     * If key already exists, does nothing.
     */
    registerInterval(key: string, interval: Interval, autoRun = true) {
        if (!this.intervals[key]) {
            this.intervalManager.subscribe(interval, autoRun);
            this.intervals[key] = interval;
        }
    }

    /**
     * Unregisters an interval from the entity if the key for it exists.
     */
    unregisterInterval(key: string) {
        const interval = this.intervals[key];
        if (interval) {
            this.intervalManager.unsubscribe(interval);
            delete this.intervals[key];
        }
    }

    unregisterAllIntervals() {
        Object.values(this.intervals).forEach((interval) => {
            if (interval) {
                this.intervalManager.unsubscribe(interval);
            }
        });
    }

    destroy() {
        // clean up intervals
        this.unregisterAllIntervals();
    }
}
