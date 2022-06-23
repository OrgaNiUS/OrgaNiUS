import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useContext, useState } from "react";
import { DataContext } from "../context/DataProvider";
import { filterTaskOptions, filterTasks } from "../functions/events";
import { ITask } from "../types";
import Modal from "./Modal";
import TodoGrid from "./TodoGrid";
import TodoList from "./TodoList";

const handleDragEnd = (tasks: ITask[], setTasks: React.Dispatch<React.SetStateAction<ITask[]>>) => {
    return (event: DragEndEvent) => {
        const uniqueIDToString = (x: number | string): number => {
            // just to be extra safe even though I only use string as the UniqueIdentifier
            return typeof x === "string" ? parseInt(x) : x;
        };

        const active = event.active;
        const over = event.over;
        if (over === null || active.id === over.id) {
            return;
        }

        const startID: number = uniqueIDToString(active.id);
        const endID: number = uniqueIDToString(over.id);
        const tasksCopy: ITask[] = arrayMove(tasks, startID, endID);

        const loopStart: number = Math.min(startID, endID);
        const loopEnd: number = Math.max(startID, endID);
        for (let i = loopStart; i <= loopEnd; i++) {
            // update the IDs of those affected by the drag
            tasksCopy[i].id = i.toString();
            // TODO: need to send changes to server as well
        }
        setTasks(tasksCopy);
    };
};

/**
 * Handles data and functions related to both TodoList and TodoGrid.
 */
const Todo = (): JSX.Element => {
    const data = useContext(DataContext);

    const [filterOptions, setFilterOptions] = useState<filterTaskOptions>({
        done: false,
        expired: false,
        searchTerm: "",
    });
    const [showModal, setShowModal] = useState<boolean>(false);

    const filteredTasks: ITask[] = filterTasks(data.tasks, filterOptions);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFilterOptions((opts) => {
            return { ...opts, searchTerm: event.target.value };
        });
    };

    // same props passed to both TodoList and TodoGrid
    const TodoProps = {
        tasks: data.tasks,
        filteredTasks,
        handleDragEnd: handleDragEnd(data.tasks, data.setTasks),
        filterOptions,
        setFilterOptions,
        handleSearch,
        expandClick: () => setShowModal(true),
        hideModal: () => setShowModal(false),
    };

    return (
        <>
            <Modal
                {...{
                    active: showModal,
                    body: <TodoGrid {...TodoProps} />,
                    callback: () => setShowModal(false),
                }}
            />
            <TodoList {...TodoProps} />
        </>
    );
};

export default Todo;
