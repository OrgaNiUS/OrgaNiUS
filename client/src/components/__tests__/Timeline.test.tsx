import { render, screen } from "@testing-library/react";
import { mergeEventArrays } from "../../functions/events";
import { IEvent, ITask } from "../../types";
import Timeline from "../Timeline";

describe("Timeline", () => {
    const events: IEvent[] = [
        {
            name: "event 1",
            start: new Date(Date.now() - 1000 * 60 * 60 * 24),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
    ];
    const tasks: ITask[] = [
        {
            id: "0",
            name: "Task 1",
            assignedTo: [],
            description: "This is a short description.",
            // after 1000 years, this test will fail!
            deadline: new Date(3022, 6, 12),
            creationTime: new Date(),
            isDone: false,
            tags: ["tag1", "tag2"],
            isPersonal: true,
        },
    ];

    const merged = mergeEventArrays(events, tasks);

    it("renders correctly", () => {
        render(<Timeline {...{ events: merged }} />);
        expect(screen.queryByText("event 1")).toBeInTheDocument();
        expect(screen.queryByText("Task 1")).toBeInTheDocument();
        expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
    });
});
