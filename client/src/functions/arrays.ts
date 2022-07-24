// Collection of useful array functions.

/**
 * Checks if 2 arrays are equal.
 * @returns True if equal.
 */
export const isEqualArrays = <T>(a: T[], b: T[]): boolean => {
    if (a === b) {
        return true;
    } else if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
};

/**
 * Gets the delta (or difference) between 2 arrays.
 *
 * @param original The original array for comparison.
 * @param changed  The new array for comparison.
 *
 * @returns [added, removed] An array of 2 arrays which indicates added and removed respsectively.
 */
export const getDeltaOfArrays = <T>(original: T[], changed: T[]): [T[], T[]] => {
    const added: T[] = changed.filter((x) => !original.includes(x));
    const removed: T[] = original.filter((x) => !changed.includes(x));

    return [added, removed];
};

/**
 * Removes an item from array.
 *
 * @param arr The array we are opearating on.
 * @param value  The value to remove.
 *
 * @returns Modified array.
 */
export const removeFromArray = <T>(arr: Array<T>, value: T): Array<T> => { 
  return arr.filter(item => item !== value);
}