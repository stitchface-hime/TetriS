import { Stopwatch } from "./Stopwatch";
import { DEFAULT_MAX_TIME } from "./TimeMeasure.constants";

export class Timer extends Stopwatch {
  protected initialRunTime: number;

  constructor({
    intervalTimeout = 1,
    initialRunTime = 1,
    maxRunTime = DEFAULT_MAX_TIME,
  }: {
    intervalTimeout?: number;
    initialRunTime?: number;
    maxRunTime?: number;
  } = {}) {
    super({ intervalTimeout, initialRunTime, maxRunTime });
    this.initialRunTime = initialRunTime;
    this.forwardRun = false;
  }

  reset() {
    this.setRunTime(this.initialRunTime);
  }
}
