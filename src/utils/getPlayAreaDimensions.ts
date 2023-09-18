import { MATRIX_BUFFER_ZONE_RATIO } from "src/constants";

/**
 * Gets the dimensions of the play area.
 */
export const getPlayAreaDimensions = (canvas: HTMLCanvasElement) => ({
    width: canvas.clientWidth,
    /**
     * Height of canvas subtracted by the buffer zone above the matrix.
     */
    height: canvas.clientHeight * (1 - MATRIX_BUFFER_ZONE_RATIO),
    /**
     * Height of matrix plus the buffer zone.
     */
    trueHeight: canvas.clientHeight,
});
