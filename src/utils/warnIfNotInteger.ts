/**
 * Wrapper around a number, warns if number is not an integer. Useful if needing to deal with pixel-perfect values for example.
 */
export const warnIfNotInteger = (val: number) => {
    if (Number.isNaN(val) || (val | 0) === val) {
        console.warn(`Warning: ${val} is not an integer`);
    }
    return val;
};
