import { Tuple } from "src/types";

/**
 * Gives coordinates to draw a rectangle using WebGL. Note x and y are assumed to be in the bottom-left
 * of the canvas. You can also elect to flip the coordinates vertically - useful when rendering sprites from
 * a spritesheet.
 */
export const getRectangleCoords = (x: number, y: number, width: number, height: number, flipY = false): Tuple<number, 12> => {
    /** flipY = false
     * 24____5
     * | \   |
     * |  \  |
     * |   \ |
     * 1____36
     */

    /** flipY = true
     * 1____36
     * |   / |
     * |  /  |
     * | /   |
     * 24____5
     */

    // prettier-ignore
    return !flipY ? [
        // Triangle 1
        x, y,                   // 1
        x, y + height,          // 2
        x + width, y,           // 3
        // Triangle 2
        x, y + height,          // 4
        x + width, y + height,  // 5
        x + width, y            // 6
    ] : [
        // Triangle 1
        x, y + height,          // 1
        x, y,                   // 2
        x + width, y + height,  // 3
        // Triangle 2
        x, y,                   // 4
        x + width, y,           // 5
        x + width, y + height   // 6
    ];
};
