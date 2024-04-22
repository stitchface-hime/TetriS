import { HexString } from "src/shaders/types";
import { hexToRgb } from "./hexToRgb";
import { clamp } from "./clamp";

/**
 * Converts a hex color value in format #XXXXXX to an HSV tuple
 */
export const hexToHsv = (hex: HexString): [h: number, s: number, v: number] => {
    const rgb = hexToRgb(hex).map((component) => component / 255);

    const value = Math.max(...rgb);
    const min = Math.min(...rgb);
    const chroma = value - min;

    const saturation = Math.ceil(value) * (chroma / clamp(value, 0.01, 1.0));

    const valueEqG = value === rgb[1];
    const valueEqB = value === rgb[2];

    const branch = () => {
        if (valueEqB) {
            return (rgb[0] - rgb[1]) / clamp(chroma, 0.01, 1.0) + 4;
        } else if (valueEqG) {
            return (rgb[2] - rgb[0]) / clamp(chroma, 0.01, 1.0) + 2;
        } else {
            return ((rgb[1] - rgb[2]) / clamp(chroma, 0.01, 1.0)) % 6;
        }
    };

    const hue = (Math.ceil(chroma) * 60 * branch() + 360) % 360;

    return [hue, saturation, value];
};
