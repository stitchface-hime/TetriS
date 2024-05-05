import { ControllerContext } from "@classes/ControllerContext";
import { IntervalContext } from "@classes/IntervalContext";
import { IManager } from "src/interfaces/IManager";

export interface Contexts extends Record<string, IManager | undefined> {
    intervalContext?: IntervalContext;
    controllerContext?: ControllerContext;
}
