import { HeldButtons } from "@classes/Controller";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { ControllerPortKey } from "@classes/ControllerPortManager/types";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Button } from "@classes/InputBinding/types";
import { Interval } from "@classes/TimeMeasure";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { arrayFindAndDelete } from "@utils/arrayFindAndDelete";

export abstract class Entity {
    protected parent: GroupEntity | null = null;
    protected intervals: Partial<Record<string, Interval>> = {};

    private intervalManager: IntervalManager;
    private controllerPortManager: ControllerPortManager;
    private controllerPortSubscriptions: ControllerPortKey[] = [];

    constructor(intervalManager: IntervalManager, controllerPortManager: ControllerPortManager) {
        this.intervalManager = intervalManager;
        this.controllerPortManager = controllerPortManager;
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

    registerController(controllerPortKey: ControllerPortKey) {
        if (this.controllerPortManager.subscribeToControllerAt(controllerPortKey, this)) {
            this.controllerPortSubscriptions.push(controllerPortKey);
        }
    }

    unregisterController(controllerPortKey: ControllerPortKey) {
        this.controllerPortManager.unsubscribeFromControllerAt(controllerPortKey, this);
        arrayFindAndDelete(controllerPortKey, this.controllerPortSubscriptions);
    }

    unregisterAllControllers() {
        this.controllerPortSubscriptions.forEach((subscription) => this.unregisterController(subscription));
    }

    destroy() {
        // clean up intervals
        this.unregisterAllIntervals();

        // clean up controllers
        this.unregisterAllControllers();
    }
}
