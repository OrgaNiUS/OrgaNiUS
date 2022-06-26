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
