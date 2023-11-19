/**
 * Returns the Hadamard product of two vectors.
 * (component-wise product)
 */
export const product2DVectorTuples = (
    v1: [number, number],
    v2: [number, number]
): [number, number] => {
    return [v1[0] * v2[0], v1[1] * v2[1]];
};
