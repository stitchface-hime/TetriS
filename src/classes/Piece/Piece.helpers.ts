import { Matrix } from "@classes/Matrix";
import { Block } from "./Block";
import { HexString } from "src/shaders/types";

/**
 * Generate some blocks given a list of coordinates, matrix and renderer.
 */
export const generateBlocks = (coordinatesList: [number, number][], matrix: Matrix, color: HexString): Block[] => {
    return coordinatesList.map((coordinates) => new Block(coordinates, matrix, color));
};
