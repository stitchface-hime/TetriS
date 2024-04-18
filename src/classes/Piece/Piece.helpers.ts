import { Matrix } from "@classes/Matrix";
import { Block } from "./Block";
import { HexString } from "src/shaders/types";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";

/**
 * Generate some blocks given a list of coordinates, matrix and renderer.
 */
export const generateBlocks = (
    intervalManager: IntervalManager,
    controllerPortManager: ControllerPortManager,
    coordinatesList: [number, number][],
    matrix: Matrix,
    color: HexString
): Block[] => {
    return coordinatesList.map((coordinates) => new Block(intervalManager, controllerPortManager, coordinates, matrix, color));
};
