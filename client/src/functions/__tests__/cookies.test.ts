import { deleteCookie, getCookie, setCookie } from "../cookies";

const writeCookie = (key: string, value: string): void => {
    // https://stackoverflow.com/a/51978914
    Object.defineProperty(window.document, "cookie", {
        writable: true,
        value: `${key}=${value}`,
    });
};

describe("getCookie", () => {
    let key: string = "test-cookie";
    let value: string = "omnomnom";

    it("write cookie", () => {
        writeCookie(key, value);
        expect(getCookie(key)).toBe(value);
    });

    it("re-write cookie", () => {
        writeCookie(key, value);
        value = "bad cookie";
        writeCookie(key, value);
        expect(getCookie(key)).toBe(value);
    });
});

describe("setCookie", () => {
    it("single cookie", () => {
        let key: string = "test-cookie";
        let value: string = "cookie-value!";

        setCookie(key, value);
        expect(window.document.cookie).toBe(`${key}=${value}; SameSite=Lax;`);
    });
});

describe("deleteCookie", () => {
    it("single cookie", () => {
        let key: string = "test-cookie";
        let value: string = "not undefined!";

        writeCookie(key, value);
        deleteCookie("jwt");
        expect(getCookie(key)).toBe(undefined);
    });
});
