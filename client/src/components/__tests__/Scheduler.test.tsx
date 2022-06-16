import { render, screen } from "@testing-library/react";
import { IEvent } from "../../types";
import Scheduler from "../Scheduler";

describe("Scheduler", () => {
    const events: IEvent[] = [
        {
            name: "event 1",
            start: new Date(2022, 5, 1),
            end: new Date(2022, 5, 4),
            important: false,
        },
        {
            name: "event 2",
            start: new Date(2022, 5, 1),
            end: new Date(2022, 5, 1),
            important: true,
        },
        {
            name: "very loooooooooooooooooooooooooooooooooooong name",
            start: new Date(2022, 5, 1),
            end: new Date(2022, 5, 1),
            important: true,
        },
        {
            name: "All day event!",
            start: new Date(2022, 5, 14),
            end: new Date(2022, 5, 14),
            important: false,
            allDay: true,
        },
    ];

    it("renders correctly", () => {
        render(<Scheduler {...{ events }} />);
        const date: string = new Date().toLocaleString("default", { month: "long", year: "numeric" });
        expect(screen.queryByText(date)).toBeVisible();
    });
});
