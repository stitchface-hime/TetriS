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
    protected currentTime: number | null = null;
    protected currentTimeIntervalHandle?: number = undefined;

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

    private intervalFlow = () => {
        if (this.currentTime !== null) {
            const newCurrentTime = Date.now();
            const timeDelta = newCurrentTime - this.currentTime;
            this.rollingMsCount += timeDelta;
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

            this.currentTime = newCurrentTime;
        } else {
            this.currentTime = Date.now();
        }

        this.currentTimeIntervalHandle = requestAnimationFrame(
            this.intervalFlow
        );
    };

    /**
     * Begin running callbacks at set intervals.
     */
    run() {
        if (this.currentTimeIntervalHandle === undefined) {
            this.currentTimeIntervalHandle = requestAnimationFrame(
                this.intervalFlow
            );
        }
    }

    /**
     * Pauses making any callbacks.
     */
    pause() {
        this.currentTime = null;
        if (this.currentTimeIntervalHandle) {
            cancelAnimationFrame(this.currentTimeIntervalHandle);
        }
        this.currentTimeIntervalHandle = undefined;
    }

    /**
     * Resets the interval back to its initial state.
     * Can be used in debounce fashion to delay callbacks being made if this is
     * called prior to any callbacks being made.
     */
    reset() {
        this.currentTime = null;
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
