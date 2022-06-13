import { convertTime, dateDiff, isLessThan } from "../dates";

describe("convertTime", () => {
    it("10 minutes", () => {
        const millis: number = 1000 * 60 * 10;

        expect(convertTime(millis, "")).toBe(millis);
        expect(convertTime(millis)).toBe(millis);
        expect(convertTime(millis, "hour")).toBe(0);
        expect(convertTime(millis, "day")).toBe(0);
        expect(convertTime(millis, "week")).toBe(0);
    });

    it("13 hours", () => {
        const millis: number = 1000 * 60 * 60 * 13;

        expect(convertTime(millis, "")).toBe(millis);
        expect(convertTime(millis)).toBe(millis);
        expect(convertTime(millis, "hour")).toBe(13);
        expect(convertTime(millis, "day")).toBe(1);
        expect(convertTime(millis, "week")).toBe(0);
    });

    it("5 days", () => {
        const millis: number = 1000 * 60 * 60 * 24 * 5;

        expect(convertTime(millis, "")).toBe(millis);
        expect(convertTime(millis)).toBe(millis);
        expect(convertTime(millis, "hour")).toBe(24 * 5);
        expect(convertTime(millis, "day")).toBe(5);
        expect(convertTime(millis, "week")).toBe(1);
    });
});

describe("dateDiff", () => {
    it("10 minutes", () => {
        expect(dateDiff(new Date(2022, 0, 1), new Date(2022, 0, 1, 0, 10))).toBe(1000 * 60 * 10);
    });
    it("13 hours", () => {
        expect(dateDiff(new Date(2022, 0, 1), new Date(2022, 0, 1, 13))).toBe(1000 * 60 * 60 * 13);
    });
    it("5 days", () => {
        expect(dateDiff(new Date(2022, 0, 1), new Date(2022, 0, 6))).toBe(1000 * 60 * 60 * 24 * 5);
    });
});

describe("isLessThan", () => {
    it("10 minutes", () => {
        const future: Date = new Date(Date.now() + 1000 * 60 * 10);

        expect(isLessThan(future, 0, "hour")).toBe(true);
        expect(isLessThan(future, 1, "hour")).toBe(true);
        expect(isLessThan(future, 1, "day")).toBe(true);
        expect(isLessThan(future, 1, "week")).toBe(true);
    });
    it("13 hours", () => {
        const future: Date = new Date(Date.now() + 1000 * 60 * 60 * 13);

        expect(isLessThan(future, 0, "hour")).toBe(false);
        expect(isLessThan(future, 1, "hour")).toBe(false);
        expect(isLessThan(future, 1, "day")).toBe(true);
        expect(isLessThan(future, 1, "week")).toBe(true);
    });
    it("5 days", () => {
        const future: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);

        expect(isLessThan(future, 0, "hour")).toBe(false);
        expect(isLessThan(future, 1, "hour")).toBe(false);
        expect(isLessThan(future, 1, "day")).toBe(false);
        expect(isLessThan(future, 1, "week")).toBe(true);
    });
    it("7 weeks", () => {
        const future: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 7);

        expect(isLessThan(future, 0, "hour")).toBe(false);
        expect(isLessThan(future, 1, "hour")).toBe(false);
        expect(isLessThan(future, 1, "day")).toBe(false);
        expect(isLessThan(future, 1, "week")).toBe(false);
        expect(isLessThan(future, 6, "week")).toBe(false);
        expect(isLessThan(future, 7, "week")).toBe(true);
    });
});
