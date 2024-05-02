import { Interval } from "@classes/TimeMeasure";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { IManager } from "src/interfaces/IManager";

export class IntervalManagerD implements IManager {
    private _globalIntervalManager: IntervalManager;
    protected intervals: Partial<Record<string, Interval>> = {};

    constructor(globalIntervalManager: IntervalManager) {
        this._globalIntervalManager = globalIntervalManager;
    }

    get globalIntervalManager() {
        return this._globalIntervalManager;
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
            this.globalIntervalManager.subscribe(interval, autoRun);
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
            this.globalIntervalManager.unsubscribe(interval);
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

    destroy() {
        this.unregisterAllIntervals();
    }
}
