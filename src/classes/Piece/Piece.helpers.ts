import { Playfield } from "@classes/Playfield";
import { Block } from "./Block";
import { HexString } from "src/shaders/types";

/**
 * Generate some blocks given a list of coordinates, matrix and renderer.
 */
export const generateBlocks = (coordinatesList: [number, number][], matrix: Playfield, color: HexString): Block[] => {
    return coordinatesList.map((coordinates) => new Block(coordinates, matrix, color));
};
