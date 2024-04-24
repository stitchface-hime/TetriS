import { HexString } from "src/shaders/types";

/**
 * Returns a random color hex string.
 */
export const randomRgbHex = (): HexString => {
    return `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;
};
