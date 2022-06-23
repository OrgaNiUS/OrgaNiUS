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

    return (
        <DataContext.Provider value={{ tasks, events, mergedEvents, setTasks, setEvents }}>
            {children}
        </DataContext.Provider>
    );
};

export default MockDataProvider;
