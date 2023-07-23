/**
 * Runs a given callback after a certain amount of time has passed.
 * You can also have the callback repeated a certain number of times too.
 */
export class Interval {
    protected intervalMs = 0;
    protected repeatCount: number;
    protected callback: () => void;

    protected rollingMsCount = 0;
    protected repetitions = 0;

    private shouldRun = false;

    constructor(intervalMs: number, callback: () => void, repeatCount = 0) {
        this.setIntervalMs(intervalMs);
        this.repeatCount = repeatCount < 0 ? 0 : repeatCount;
        this.callback = callback;
    }

    getIntervalMs() {
        return this.intervalMs;
    }

    getRollingMsCount() {
        return this.rollingMsCount;
    }

    /**
     * Get the number of times the callback has been fired.
     */
    getRepetitions() {
        return this.repetitions;
    }

    increaseTimeElapsed(ms: number) {
        if (this.shouldRun) {
            this.rollingMsCount += ms;
            if (this.rollingMsCount >= this.intervalMs) {
                if (this.repeatCount >= 0) {
                    this.callback();
                    this.repetitions += 1;
                    this.repeatCount -= 1;
                    this.rollingMsCount -= this.intervalMs;
                } else {
                    // TODO: Does this even work?
                    this.pause();
                }
            }
        }
    }

    /**
     * Begin running callbacks at set intervals.
     */
    run() {
        this.shouldRun = true;
    }

    /**
     * Pauses making any callbacks.
     */
    pause() {
        this.shouldRun = false;
    }

    /**
     * Resets the interval back to its initial state.
     * Can be used in debounce fashion to delay callbacks being made if this is
     * called prior to any callbacks being made.
     */
    reset() {
        this.rollingMsCount = 0;
    }

    /**
     * Shorthand to pause and reset.
     */
    clear() {
        this.pause();
        this.reset();
    }

    /**
     * Set the duration before a callback is made.
     * The next callback will be made after the number of milliseconds that was specified
     * when calling this method.
     */
    setIntervalMs(intervalMs: number) {
        this.intervalMs = intervalMs < 0 ? 0 : intervalMs;
        this.rollingMsCount = 0;
    }
}
