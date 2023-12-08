import { HexString } from "src/shaders/types";

/**
 * Converts a hex color value in format #XXXXXX to an RGB tuple
 */
export const hexToRgb = (hex: HexString): [r: number, g: number, b: number] => {
    const components = [hex.substring(1, 3), hex.substring(3, 5), hex.substring(5, 7)];

    const result = components.map((component) => Number(`0x${component}`)) as [r: number, g: number, b: number];

    if (result.findIndex((component) => Number.isNaN(component)) !== -1) {
        throw new Error(`Could not convert to RGB tuple, invalid hex value ${hex}.`);
    }

    return result;
};
