/**
 * Clamps a value between a min and max value.
 * - returns `val` if it is between `min` and `max`
 * - return `max` if `val >= max`
 * - return `min` if `val <= min`
 */
export const clamp = (val: number, min: number, max: number) => {
    return Math.min(Math.max(val, min), max);
};
