import { render, screen } from "@testing-library/react";
import PreLoader from "../PreLoader";

describe("Preloader", () => {
    it("loading", () => {
        render(<PreLoader {...{ loading: true }} />);
        expect(screen.queryByText("Loading...")).toBeVisible();
    });
    it("not loading", () => {
        render(<PreLoader {...{ loading: false }} />);
        expect(screen.queryByText("This page failed to load.")).toBeVisible();
    });
});
