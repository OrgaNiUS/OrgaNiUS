import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { mergeEventArrays } from "../functions/events";
import { IEvent, ITask } from "../types";
import { DataContext } from "./DataProvider";

const MockDataProvider = ({
    initialTasks,
    initialEvents,
    children,
}: {
    initialTasks: ITask[];
    initialEvents: IEvent[];
    children: JSX.Element;
}): JSX.Element => {
    const [tasks, setTasks] = useState<ITask[]>(initialTasks);
    const [events, setEvents] = useState<IEvent[]>(initialEvents);
    const mergedEvents = mergeEventArrays(events, tasks);

    const addTask = (task: ITask) => {
        setTasks((t) => {
            return [...t, { ...task, id: tasks.length.toString() }];
        });
    };

    const patchTask = (task: ITask) => {
        const id: number = parseInt(task.id);

        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            tasksCopy[id] = task;
            return tasksCopy;
        });
    };

    const removeTasks = (ids: string[]) => {
        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !ids.includes(t.id));

            for (let i = 0; i < tasksCopy.length; i++) {
                tasksCopy[i].id = i.toString();
            }
            return tasksCopy;
        });
    };

    const swapTasks = (startID: string, endID: string) => {
        const start: number = parseInt(startID);
        const end: number = parseInt(endID);

        setTasks((t) => {
            const tasksCopy: ITask[] = arrayMove(t, start, end);

            const loopStart: number = Math.min(start, end);
            const loopEnd: number = Math.max(start, end);
            for (let i = loopStart; i <= loopEnd; i++) {
                // update the IDs of those affected by the drag
                tasksCopy[i].id = i.toString();
            }
            return tasksCopy;
        });
    };

    return (
        <DataContext.Provider value={{ tasks, events, mergedEvents, addTask, patchTask, removeTasks, swapTasks }}>
            {children}
        </DataContext.Provider>
    );
};

export default MockDataProvider;
