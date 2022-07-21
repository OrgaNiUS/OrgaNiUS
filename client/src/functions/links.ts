// Collection of useful helper functions for links.

// There is a security risk to using target="_blank" directly.
// https://stackoverflow.com/a/63627688/
export const openInNewTab = (url: string) => {
    return () => {
        const newWindow = window.open(url, "_blank", "noopener,noreferrer");
        if (newWindow) {
            newWindow.opener = null;
        }
    };
};
