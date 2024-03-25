import { FRAME_MS } from "src/constants";
import { Interval } from "./Interval";

type IntervalManagerKey = string | number;

/**
 * Manages all intervals for a given class. A decorator around a `Map` object used to store the
 * `Interval` instances.
 */
export class IntervalManager {
    private globalIntervalHandle?: number = undefined;
    private globalPause: boolean = false;
    private then: number | null = null;

    private subscriptions: Map<IntervalManagerKey, Interval> = new Map();

    constructor() {
        this.tick();
    }

    private tick() {
        const now = Date.now();
        if (this.then === null) {
            this.then = now;
        }
        if (!this.globalPause) {
            const delta = now - this.then;

            this.advanceAllIntervals(delta);
            // offset to ensure that each `then` is exactly `tickInterval` apart
            this.then = now;
            this.globalIntervalHandle = requestAnimationFrame(() => this.tick());
        } else {
            if (this.globalIntervalHandle !== undefined) {
                cancelAnimationFrame(this.globalIntervalHandle);
            }
        }
    }

    /**
     *
     */
    advanceAllIntervals(ms: number) {
        this.subscriptions.forEach((interval) => interval.increaseTimeElapsed(ms));
    }

    /**
     * Adds a new interval into the manager with a given key.
     * The interval will automatically run once added unless specified otherwise.
     */
    subscribe(key: IntervalManagerKey, interval: Interval, autoRun = true) {
        this.subscriptions.set(key, interval);
        if (autoRun) {
            interval.run();
        }
    }

    /**
     * Returns the given interval from a given key. Returns `undefined` if no interval
     * can be found with the given key.
     */
    getInterval(key: IntervalManagerKey): Interval | undefined {
        return this.subscriptions.get(key);
    }

    /**
     * Removes an interval from the manager with a given key.
     */
    unsubscribe(key: IntervalManagerKey) {
        this.subscriptions.get(key)?.clear();
        this.subscriptions.delete(key);
    }

    /**
     * Pauses all intervals within the manager.
     */
    pauseAll() {
        this.subscriptions.forEach((interval) => interval.pause());
    }

    /**
     * Resets all intervals within the manager.
     */
    resetAll() {
        this.subscriptions.forEach((interval) => interval.reset());
    }

    /**
     * Removes all intervals from the manager.
     */
    unsubscribeAll() {
        this.subscriptions.forEach((interval) => interval.clear());
        this.subscriptions.clear();
    }
}
