import { Tuple } from "src/types";

/**
 * Gives coordinates to draw a rectangle using WebGL. Note x and y are assumed to be in the bottom-left
 * of the canvas.
 */
export const getRectangleCoords = (x: number, y: number, width: number, height: number): Tuple<number, 12> => {
    /**
     * 24____5
     * | \   |
     * |  \  |
     * |   \ |
     * 1____36
     */

    // prettier-ignore
    return [
        // Triangle 1
        x, y,                   // 1
        x, y + height,          // 2
        x + width, y,           // 3
        // Triangle 2
        x, y + height,          // 4
        x + width, y + height,  // 5
        x + width, y            // 6
    ];
};
