import { ControllerContext } from "@classes/ControllerContext";
import { IntervalManagerD } from "@classes/IntervalManager/IntervalManager";

export interface Managers {
    intervalManager?: IntervalManagerD;
    controllerContext?: ControllerContext;
}
