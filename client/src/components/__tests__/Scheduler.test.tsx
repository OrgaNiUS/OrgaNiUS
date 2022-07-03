import { render, screen } from "@testing-library/react";
import Scheduler from "../Scheduler";

describe("Scheduler", () => {
    it("renders correctly", () => {
        render(<Scheduler />);
        const date: string = new Date().toLocaleString("default", { month: "long", year: "numeric" });
        expect(screen.queryByText(date)).toBeVisible();
    });
});
