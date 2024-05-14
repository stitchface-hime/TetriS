import { Playfield } from "@classes/Playfield";
import { getPlayAreaDimensions } from "./getPlayAreaDimensions";
/**
 * Obtains the anchor coordinates for a block entity given the canvas and the matrix
 * to determine where to draw the block.
 */
export const getMatrixAnchor = (canvas: HTMLCanvasElement, matrix: Playfield, blockCoordinates: [x: number, y: number]) => {
    const { clientWidth, clientHeight } = canvas;
    const columns = matrix.getNumColumns(); // 10
    const rows = matrix.getNumRows(); // 20

    const { width, height } = getPlayAreaDimensions(canvas);

    // border width to determine where to draw
};
