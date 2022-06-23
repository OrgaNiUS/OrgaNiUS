import { render, screen } from "@testing-library/react";
import MockDataProvider from "../../context/MockDataProvider";
import { IEvent, ITask } from "../../types";
import Timeline from "../Timeline";

const MockTimeline = ({ events, tasks }: { events: IEvent[]; tasks: ITask[] }): JSX.Element => {
    return (
        <MockDataProvider {...{ initialTasks: tasks, initialEvents: events }}>
            <Timeline />
        </MockDataProvider>
    );
};

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
            description: "This is a short description.",
            deadline: new Date(2022, 6, 12),
            isDone: false,
            tags: ["tag1", "tag2"],
        },
    ];

    it("renders correctly", () => {
        render(<MockTimeline {...{ events, tasks }} />);
        expect(screen.queryByText("event 1")).toBeInTheDocument();
        expect(screen.queryByText("Task 1")).toBeInTheDocument();
        expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
    });
});
