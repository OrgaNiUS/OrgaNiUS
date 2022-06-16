import { fireEvent, render, screen } from "@testing-library/react";
import { ITask } from "../../types";
import Todo from "../Todo";

describe("Todo", () => {
    it("renders correctly", () => {
        const tasks: ITask[] = [];
        render(<Todo {...{ tasks }} />);
        expect(screen.queryByText("To-Do")).toBeInTheDocument();
    });

    it("search with no results", () => {
        const tasks: ITask[] = [
            {
                name: "Task",
                description: "",
                tags: [],
                isDone: false,
            },
        ];
        render(<Todo {...{ tasks }} />);
        const searchBox = screen.getByPlaceholderText(/Search/);
        fireEvent.change(searchBox, { target: { value: "x" } });

        expect(screen.queryByText("Nothing here!")).toBeInTheDocument();
    });

    it("search with results", () => {
        const tasks: ITask[] = [
            {
                name: "Task",
                description: "",
                tags: [],
                isDone: false,
            },
        ];
        render(<Todo {...{ tasks }} />);
        const searchBox = screen.getByPlaceholderText(/Search/);
        fireEvent.change(searchBox, { target: { value: "Task" } });

        expect(screen.queryByText("Nothing here!")).not.toBeInTheDocument();
    });

    it("filter dropdown", async () => {
        const tasks: ITask[] = [
            {
                name: "Task",
                description: "",
                tags: [],
                isDone: true,
            },
        ];

        render(<Todo {...{ tasks }} />);

        expect(screen.queryByText("Filter Options")).not.toBeVisible();
    });
});
