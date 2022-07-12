import { render, screen } from "@testing-library/react";
import PreLoader from "../PreLoader";

describe("Preloader", () => {
    it("loading", () => {
        render(<PreLoader {...{ loading: true, setLoading: jest.fn() }} />);
        expect(screen.queryByText("Loading...")).toBeVisible();
    });
    it("not loading", () => {
        render(<PreLoader {...{ loading: false, setLoading: jest.fn() }} />);
        expect(screen.queryByText("Page or resource failed to load.")).toBeVisible();
    });
});
