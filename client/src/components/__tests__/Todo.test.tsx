import { fireEvent, render, screen } from "@testing-library/react";
import MockDataProvider from "../../context/MockDataProvider";
import { IEvent, ITask } from "../../types";
import Todo from "../Todo";

const MockTodo = ({ tasks }: { tasks: ITask[] }): JSX.Element => {
    const initialEvents: IEvent[] = [];

    return (
        <MockDataProvider {...{ initialTasks: tasks, initialEvents }}>
            <Todo />
        </MockDataProvider>
    );
};

describe("Todo", () => {
    it("renders correctly", () => {
        const tasks: ITask[] = [];
        render(<MockTodo {...{ tasks }} />);
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
        render(<MockTodo {...{ tasks }} />);
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
        render(<MockTodo {...{ tasks }} />);
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

        render(<MockTodo {...{ tasks }} />);

        // both list and grid
        screen.queryAllByText("Filter Options").forEach((item) => expect(item).not.toBeVisible());
    });
});
