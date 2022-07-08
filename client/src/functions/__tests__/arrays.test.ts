import { getDeltaOfArrays, isEqualArrays } from "../arrays";

describe("isEqualArrays", () => {
    it("same array", () => {
        const array: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        expect(isEqualArrays(array, array)).toBe(true);
    });
    it("different array", () => {
        const array1: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const array2: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        expect(isEqualArrays(array1, array2)).toBe(false);
    });
});

describe("getDeltaOfArrays", () => {
    it("no changes", () => {
        const array: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const [added, removed] = getDeltaOfArrays(array, array);
        expect(added).toEqual([]);
        expect(removed).toEqual([]);
    });
    it("added some things", () => {
        const original: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const changed: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const [added, removed] = getDeltaOfArrays(original, changed);
        expect(added).toEqual([10, 11]);
        expect(removed).toEqual([]);
    });
    it("removed some things", () => {
        const original: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const changed: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
        const [added, removed] = getDeltaOfArrays(original, changed);
        expect(added).toEqual([]);
        expect(removed).toEqual([8, 9]);
    });
    it("added and removed some things", () => {
        const original: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const changed: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 11, 12];
        const [added, removed] = getDeltaOfArrays(original, changed);
        expect(added).toEqual([11, 12]);
        expect(removed).toEqual([8, 9]);
    });
});
