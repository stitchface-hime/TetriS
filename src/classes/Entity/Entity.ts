import { Controller, PressedButtons } from "@classes/Controller";
import { ControllerContext } from "@classes/ControllerContext";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { ControllerPortKey } from "@classes/ControllerPortManager/types";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Button } from "@classes/InputBinding/types";
import { Interval } from "@classes/TimeMeasure";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";

export abstract class Entity {
    protected parent: GroupEntity | null = null;
    protected controllerContext: ControllerContext | null = null;
    protected intervals: Partial<Record<string, Interval>> = {};

    private intervalManager: IntervalManager;
    private controllerPortManager: ControllerPortManager;

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

    acceptInput(heldButtons: PressedButtons, releasedButtons: Button[]) {
        // no-op, implementated in each individual entity
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
            interval.clear();
            this.intervalManager.unsubscribe(interval);
            delete this.intervals[key];
        }
    }

    unregisterAllIntervals() {
        Object.keys(this.intervals).forEach((intervalKey) => {
            this.unregisterInterval(intervalKey);
        });

        this.intervals = {};
    }

    pauseInterval(key: string) {
        const interval = this.intervals[key];
        console.log("Get interval to pause", interval, key);
        if (interval) {
            interval.pause();
        }
    }

    pauseAllIntervals() {
        Object.keys(this.intervals).forEach((intervalKey) => {
            this.pauseInterval(intervalKey);
        });
    }

    resumeInterval(key: string) {
        const interval = this.intervals[key];
        if (interval) {
            interval.run();
        }
    }

    resumeAllIntervals() {
        Object.keys(this.intervals).forEach((intervalKey) => {
            this.resumeInterval(intervalKey);
        });
    }

    getController(key: ControllerPortKey) {
        return this.controllerPortManager.getControllerAtPort(key);
    }

    registerControllerContext(controller: Controller) {
        this.controllerContext = new ControllerContext(this);
        controller.subscribeContext(this.controllerContext);
    }

    unregisterControllerContext(controller: Controller) {
        if (!this.controllerContext) {
            console.warn("No controller context!");
            return;
        }

        controller.unsubscribeContext(this.controllerContext);
        this.controllerContext = null;
    }

    destroy() {
        // clean up intervals
        this.unregisterAllIntervals();
        this.controllerContext = null;
    }
}
