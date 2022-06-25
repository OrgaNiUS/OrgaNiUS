import { toTitleCase } from "../strings";

describe("toTitleCase", () => {
    it("abCA", () => {
        expect(toTitleCase("abCA")).toBe("Abca");
    });
    it("username", () => {
        expect(toTitleCase("username")).toBe("Username");
    });
    it("jIM", () => {
        expect(toTitleCase("jIM")).toBe("Jim");
    });
});
