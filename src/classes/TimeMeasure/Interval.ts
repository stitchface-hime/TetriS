/**
 * Runs a given callback after a certain amount of time has passed.
 * You can also have the callback repeated a certain number of times too.
 */
export class Interval {
    protected intervalMs: number;
    protected repeatCount: number;
    protected callback: () => void;

    protected rollingMsCount = 0;
    protected currentTime: number | null = null;
    protected currentTimeIntervalHandle?: ReturnType<typeof setTimeout> =
        undefined;

    constructor(intervalMs: number, callback: () => void, repeatCount = 0) {
        this.intervalMs = intervalMs;
        this.repeatCount = repeatCount < 0 ? 0 : repeatCount;
        this.callback = callback;
    }

    /**
     * Begin running callbacks at set intervals.
     */
    run() {
        if (this.currentTimeIntervalHandle === undefined) {
            this.currentTimeIntervalHandle = setInterval(() => {
                if (this.currentTime !== null) {
                    const newCurrentTime = Date.now();
                    const timeDelta = newCurrentTime - this.currentTime;

                    this.rollingMsCount += timeDelta;

                    if (this.rollingMsCount >= this.intervalMs) {
                        if (this.repeatCount >= 0) {
                            this.callback();
                            this.repeatCount -= 1;
                            this.rollingMsCount -= this.intervalMs;
                        }
                    }

                    this.currentTime = newCurrentTime;
                } else {
                    this.currentTime = Date.now();
                }
            }, 1);
        }
    }

    /**
     * Pauses making any callbacks.
     */
    pause() {
        this.currentTime = null;
        clearInterval(this.currentTimeIntervalHandle);
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
}
