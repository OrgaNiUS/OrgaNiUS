import { render, screen } from "@testing-library/react";
import PreLoader from "../PreLoader";

describe("Preloader", () => {
    it("renders correctly", () => {
        render(<PreLoader />);
        expect(screen.queryByText("Loading...")).toBeVisible();
    });
});
