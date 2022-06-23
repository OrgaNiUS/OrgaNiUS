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
        task.id = tasks.length.toString();
        setTasks((t) => {
            return { ...t, task };
        });
    };

    const removeTask = (id: string) => {
        const tasksCopy: ITask[] = tasks.filter((t) => t.id !== id);

        for (let i = parseInt(id) + 1; i < tasks.length; i++) {
            tasksCopy[i].id = i.toString();
        }
        setTasks(tasksCopy);
    };

    const swapTasks = (startID: string, endID: string) => {
        const start: number = parseInt(startID);
        const end: number = parseInt(endID);

        const tasksCopy: ITask[] = arrayMove(tasks, start, end);

        const loopStart: number = Math.min(start, end);
        const loopEnd: number = Math.max(start, end);
        for (let i = loopStart; i <= loopEnd; i++) {
            // update the IDs of those affected by the drag
            tasksCopy[i].id = i.toString();
            // TODO: send changes to server
        }
        setTasks(tasksCopy);
    };

    return (
        <DataContext.Provider value={{ tasks, events, mergedEvents, addTask, removeTask, swapTasks }}>
            {children}
        </DataContext.Provider>
    );
};

export default MockDataProvider;
