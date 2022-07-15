import {
  DEFAULT_MAX_TIME,
  H_TO_MS,
  MIN_TO_MS,
  S_TO_MS,
} from "./TimeMeasure.constants";

export class Stopwatch {
  protected forwardRun = true;
  protected currentTime: number | null = null;
  protected runTime = 0;
  protected maxRunTime: number;
  protected currentTimeIntervalHandle?: ReturnType<typeof setTimeout> =
    undefined;
  /**
   * How many milliseconds before the time updates.
   */
  protected intervalTimeout: number;

  constructor({
    intervalTimeout = 1,
    initialRunTime = 0,
    maxRunTime = DEFAULT_MAX_TIME,
  }: {
    intervalTimeout?: number;
    initialRunTime?: number;
    maxRunTime?: number;
  } = {}) {
    this.intervalTimeout = intervalTimeout;
    this.runTime = initialRunTime;
    this.maxRunTime = maxRunTime;
  }

  /**
   * Start or resume timing. No effect if it is already running.
   */
  run() {
    if (this.currentTimeIntervalHandle === undefined) {
      this.currentTimeIntervalHandle = setInterval(() => {
        if (this.currentTime !== null) {
          const newCurrentTime = Date.now();
          const timeDelta = newCurrentTime - this.currentTime;

          this.adjustRunTime((this.forwardRun ? 1 : -1) * timeDelta);

          this.currentTime = newCurrentTime;
        } else {
          this.currentTime = Date.now();
        }
      }, this.intervalTimeout);
    }
  }

  /**
   * Pauses timing.
   */
  pause() {
    this.currentTime = null;
    clearInterval(this.currentTimeIntervalHandle);
    this.currentTimeIntervalHandle = undefined;
  }

  /**
   * Reset run time to 0.
   */
  reset() {
    this.setRunTime(0);
  }

  /**
   * Stops timing and resets run time to 0,
   */
  stop() {
    this.pause();
    this.reset();
  }

  /**
   * Get the run time in milliseconds.
   */
  getRunTime() {
    return this.runTime;
  }

  /**
   * Get the run time described as hours, minutes, seconds and milliseconds.
   */
  getRunTimeData() {
    const hours = Math.floor(this.runTime / H_TO_MS);
    const minutes = Math.floor((this.runTime - hours * H_TO_MS) / MIN_TO_MS);
    const seconds = Math.floor(
      (this.runTime - hours * H_TO_MS - minutes * MIN_TO_MS) / S_TO_MS
    );
    const milliseconds = this.runTime % S_TO_MS;

    return {
      hours,
      minutes,
      seconds,
      milliseconds,
    };
  }

  /**
   * Adjust the run time by a number of milliseconds.
   */
  adjustRunTime(adjust: number) {
    if (this.runTime + adjust < 0) {
      this.runTime = 0;
    } else if (this.runTime + adjust < this.maxRunTime) {
      this.runTime += adjust;
    } else {
      this.runTime = this.maxRunTime;
    }
  }

  /**
   * Set the run time to a number of milliseconds.
   */
  setRunTime(time: number) {
    if (time < 0) {
      this.runTime = 0;
    } else if (time < this.maxRunTime) {
      this.runTime = time;
    } else {
      this.runTime = this.maxRunTime;
    }
  }
}
