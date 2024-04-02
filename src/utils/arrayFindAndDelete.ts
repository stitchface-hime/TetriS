/**
 * Finds the first instance of an element in an array and removes it from the array.
 */
export const arrayFindAndDelete = <T>(elem: T, arr: T[]) => {
    const idx = arr.findIndex((current) => current === elem);
    if (idx !== -1) {
        return arr.splice(idx, 1);
    }
    return [];
};
