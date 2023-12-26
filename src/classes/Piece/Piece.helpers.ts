import { Matrix } from "@classes/Matrix";
import { DrawSprite } from "@classes/ShaderProgram";
import { Block } from "./Block";
import { HexString } from "src/shaders/types";

/**
 * Generate some blocks given a list of coordinates, matrix and renderer.
 */
export const generateBlocks = (coordinatesList: [number, number][], renderer: DrawSprite, matrix: Matrix, color: HexString): Block[] => {
    return coordinatesList.map((coordinates) => new Block(renderer, coordinates, matrix, color));
};
