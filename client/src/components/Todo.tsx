import { useContext, useState } from "react";
import { css } from "styled-components";
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
    const [editingTask, setEditingTask] = useState<ITask | undefined>(undefined);

    const cycleModes = () => {
        setCheckedTasks(new Set());
        setEditingTask(undefined);
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
        if (mode === "trash") {
            // mark as trash
            setCheckedTasks((t) => {
                const newSet = new Set(t);

                if (t.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }

                return newSet;
            });
        }
        if (mode === "normal") {
            // mark as done
            const task = data.tasks.find((t) => t.id === id);
            if (task === undefined) {
                return;
            }
            data.patchTask({
                id,
                isDone: !task.isDone,
            });
        }
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
        personal: true,
        project: true,
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
        mode,
        cycleModes,
        taskCheck,
        checkedTasks,
        trashChecked,
        editingTask,
        setEditingTask,
        tasks: data.tasks,
        filteredTasks,
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
                    body: (
                        <TodoGrid
                            {...{
                                ...TodoProps,
                                containerCSS: css`
                                    height: 85vh;
                                    width: 90vw;
                                `,
                            }}
                        />
                    ),
                    callback: () => setShowModal(false),
                }}
            />
            <TodoList {...TodoProps} />
        </>
    );
};

export default Todo;
