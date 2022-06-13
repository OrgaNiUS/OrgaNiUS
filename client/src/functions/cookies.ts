// Collection of useful helper functions for cookies.

export const getCookie = (name: string): string | undefined => {
    return document.cookie
        ?.split("; ")
        ?.find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
};

export const setCookie = (name: string, value: string): void => {
    document.cookie = `${name}=${value}`;
};
