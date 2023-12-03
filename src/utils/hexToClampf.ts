import { HexString } from "src/shaders/types";
import { hexToRgb } from "./hexToRgb";

/**
 * Converts a hex color value in format #XXXXXX to an array of RGB levels from 0 to 1.
 */
export const hexToClampf = (hex: HexString): [r: number, g: number, b: number] => {
    try {
        return hexToRgb(hex).map((val) => val / 255) as [r: number, g: number, b: number];
    } catch (e) {
        throw new Error(`Could not convert to clamp float values, invalid hex value ${hex}.`);
    }
};
