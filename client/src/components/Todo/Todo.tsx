import { useContext, useState } from "react";
import { DataContext } from "../../context/DataProvider";
import { filterTaskOptions } from "../../functions/events";
import Modal from "../Modal";
import TodoGrid from "./TodoGrid";
import TodoList from "./TodoList";
import { TodoProvider } from "./TodoProvider";

export type TodoView = "list" | "grid" | "project";

/**
 * Handles data and functions related to both TodoList and TodoGrid.
 */
const Todo = (): JSX.Element => {
    const data = useContext(DataContext);

    const filterOptions: filterTaskOptions = {
        done: false,
        expired: false,
        personal: true,
        project: true,
        searchTerm: "",
    };

    const [isModalShown, setIsModalShown] = useState<boolean>(false);

    return (
        <TodoProvider {...{ projectid: "", tasks: data.tasks, defaultFilterOptions: filterOptions, setIsModalShown }}>
            <>
                <Modal
                    {...{
                        active: isModalShown,
                        body: <TodoGrid {...{ view: "grid" }} />,
                        callback: () => setIsModalShown(false),
                    }}
                />
                <TodoList />
            </>
        </TodoProvider>
    );
};

export default Todo;
