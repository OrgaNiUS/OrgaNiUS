import { render, screen } from "@testing-library/react";
import { mergeEventArrays } from "../../functions/events";
import { IEvent, ITask } from "../../types";
import Timeline from "../Timeline";

describe("Timeline", () => {
    const events: IEvent[] = [
        {
            name: "event 1",
            start: new Date(2022, 5, 1),
            end: new Date(2022, 5, 4),
        },
    ];
    const tasks: ITask[] = [
        {
            id: "0",
            name: "Task 1",
            description: "This is a short description.",
            deadline: new Date(2022, 6, 12),
            isDone: false,
            tags: ["tag1", "tag2"],
        },
    ];

    const merged: IEvent[] = mergeEventArrays(events, tasks);

    it("renders correctly", () => {
        render(<Timeline {...{ events: merged }} />);
        expect(screen.queryByText("event 1")).toBeInTheDocument();
        expect(screen.queryByText("Task 1")).toBeInTheDocument();
        expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
    });
});
