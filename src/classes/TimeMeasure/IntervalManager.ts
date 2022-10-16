import { Interval } from "./Interval";

type IntervalManagerKey = string | number;

/**
 * Manages all intervals for a given class. A decorator around a `Map` object used to store the
 * `Interval` instances.
 */
export class IntervalManager {
    private subscriptions: Map<IntervalManagerKey, Interval> = new Map();

    /**
     * Adds a new interval into the manager with a given key.
     * The interval will automatically run once added unless specified otherwise.
     */
    subscribe(key: IntervalManagerKey, interval: Interval, autoRun = true) {
        this.subscriptions.set(key, interval);
        interval.run();
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
