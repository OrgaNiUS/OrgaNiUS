import { DragEndEvent } from "@dnd-kit/core";
import { useContext, useState } from "react";
import { DataContext } from "../context/DataProvider";
import { filterTaskOptions, filterTasks } from "../functions/events";
import { ITask } from "../types";
import Modal from "./Modal";
import TodoGrid from "./TodoGrid";
import TodoList from "./TodoList";

export type todoModes = "normal" | "trash" | "edit";

/**
 * Handles data and functions related to both TodoList and TodoGrid.
 */
const Todo = (): JSX.Element => {
    const data = useContext(DataContext);
    const [mode, setMode] = useState<todoModes>("normal");
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

    const cycleModes = () => {
        setCheckedTasks(new Set());
        setMode((m) => {
            switch (m) {
                case "normal":
                    return "trash";
                case "trash":
                    return "edit";
                case "edit":
                    return "normal";
            }
        });
    };

    const taskCheck = (id: string) => {
        if (mode !== "trash") {
            // Should not happen.
            return;
        }
        setCheckedTasks((t) => {
            const newSet = new Set(t);

            if (t.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }

            return newSet;
        });
    };

    const trashChecked = () => {
        if (mode !== "trash") {
            // Should not happen.
            return;
        }
        const toBeTrashed: string[] = Array.from(checkedTasks);
        data.removeTasks(toBeTrashed);
        setCheckedTasks(new Set());
    };

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

    const handleDragEnd = (event: DragEndEvent) => {
        const uniqueIDToString = (x: number | string): string => {
            // just to be extra safe even though I only use string as the UniqueIdentifier
            return typeof x === "string" ? x : x.toString();
        };

        const active = event.active;
        const over = event.over;
        if (over === null || active.id === over.id) {
            return;
        }

        const startID: string = uniqueIDToString(active.id);
        const endID: string = uniqueIDToString(over.id);
        data.swapTasks(startID, endID);
    };

    // same props passed to both TodoList and TodoGrid
    const TodoProps = {
        mode,
        cycleModes,
        taskCheck,
        checkedTasks,
        trashChecked,
        tasks: data.tasks,
        filteredTasks,
        handleDragEnd,
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
