/**
 * Gives coordinates to draw a rectangle using WebGL. Note x and y are assumed to be in the bottom-left
 * of the canvas.
 */
export const getRectangleCoords = (
    x: number,
    y: number,
    width: number,
    height: number
) => {
    return [
        // Triangle 1
        x,
        y,
        x,
        y + height,
        x + width,
        y,
        // Triangle 2
        x,
        y + height,
        x + width,
        y + height,
        x + width,
        y,
    ];
};
