import { render, screen } from "@testing-library/react";
import { ITask } from "../../types";
import Task from "../Todo/Task";

const MockTask = ({ task }: { task: ITask }) => {
    return <Task {...{ task, performDone: jest.fn(), performTrash: jest.fn(), performEdit: jest.fn() }} />;
};

describe("Task", () => {
    it("standard task", () => {
        const task: ITask = {
            id: "0",
            name: "name",
            description: "description",
            deadline: new Date(3022, 0, 1),
            isDone: false,
            tags: ["tag1", "tag2"],
            assignedTo: [],
            creationTime: new Date(),
            isPersonal: true,
        };

        render(<MockTask {...{ task }} />);
        expect(screen.queryByText("name")).toBeInTheDocument();
        expect(screen.queryByText("description")).toBeInTheDocument();
        expect(screen.queryByText(/#tag1/)).toBeInTheDocument();
        expect(screen.queryByText(/#tag2/)).toBeInTheDocument();
        expect(screen.queryByText("Due on 01/01/3022")).toBeInTheDocument();
    });

    it("expired task", () => {
        const task: ITask = {
            id: "0",
            name: "name",
            description: "",
            deadline: new Date(2000, 0, 1),
            isDone: false,
            tags: ["tag1", "tag2"],
            assignedTo: [],
            creationTime: new Date(),
            isPersonal: true,
        };

        render(<MockTask {...{ task }} />);
        expect(screen.queryByText("Expired on 01/01/2000")).toBeInTheDocument();
    });

    it("due in less than 1 day", () => {
        const task: ITask = {
            id: "0",
            name: "name",
            description: "",
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 5),
            isDone: false,
            tags: ["tag1", "tag2"],
            assignedTo: [],
            creationTime: new Date(),
            isPersonal: true,
        };

        render(<MockTask {...{ task }} />);
        expect(screen.queryByText("Due in 5 hours")).toBeInTheDocument();
    });

    it("due in less than 1 week", () => {
        const task: ITask = {
            id: "0",
            name: "name",
            description: "",
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
            isDone: false,
            tags: ["tag1", "tag2"],
            assignedTo: [],
            creationTime: new Date(),
            isPersonal: true,
        };

        render(<MockTask {...{ task }} />);
        expect(screen.queryByText("Due in 5 days")).toBeInTheDocument();
    });
});
