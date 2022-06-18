import { fireEvent, render, screen } from "@testing-library/react";
import { ITask } from "../../types";
import Todo from "../Todo";

describe("Todo", () => {
    it("renders correctly", () => {
        const tasks: ITask[] = [];
        render(<Todo {...{ initialTasks: tasks }} />);
        expect(screen.queryByText("To-Do")).toBeInTheDocument();
    });

    it("search with no results", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "Task",
                description: "",
                tags: [],
                isDone: false,
            },
        ];
        render(<Todo {...{ initialTasks: tasks }} />);
        const searchBox = screen.getAllByPlaceholderText(/Search/);
        fireEvent.change(searchBox[0], { target: { value: "x" } });

        screen.queryAllByText("Nothing here!").forEach((item) => expect(item).toBeInTheDocument());
    });

    it("search with results", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "Task",
                description: "",
                tags: [],
                isDone: false,
            },
        ];
        render(<Todo {...{ initialTasks: tasks }} />);
        const searchBox = screen.getAllByPlaceholderText(/Search/);
        fireEvent.change(searchBox[0], { target: { value: "Task" } });

        expect(screen.queryByText("Nothing here!")).not.toBeInTheDocument();
    });

    it("filter dropdown", async () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "Task",
                description: "",
                tags: [],
                isDone: true,
            },
        ];

        render(<Todo {...{ initialTasks: tasks }} />);

        // both list and grid
        screen.queryAllByText("Filter Options").forEach((item) => expect(item).not.toBeVisible());
    });
});
