import { createContext, useState } from "react";
import { mergeEventArrays } from "../functions/events";
import { IEvent, ITask } from "../types";

// TODO: This is only for testing purposes because actual events and tasks integration are to be implemented later on.
const initialEvents: IEvent[] = [
    {
        name: "event 1",
        start: new Date(2022, 5, 1),
        end: new Date(2022, 5, 4),
    },
    {
        name: "event 2",
        start: new Date(2022, 5, 1),
        end: new Date(2022, 5, 1),
    },
    {
        name: "very loooooooooooooooooooooooooooooooooooong name",
        start: new Date(2022, 5, 1),
        end: new Date(2022, 5, 1),
    },
    {
        name: "All day event!",
        start: new Date(2022, 5, 14),
        end: new Date(2022, 5, 14),
        allDay: true,
    },
    {
        name: "Starts yesterday, ends tomorrow.",
        start: new Date(Date.now() - 1000 * 60 * 60 * 24),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24),
        allDay: true,
    },
];
const initialTasks: ITask[] = [
    {
        id: "0",
        name: "Task 1",
        description: "This is a short description.",
        deadline: new Date(2022, 6, 12),
        isDone: false,
        tags: ["tag1", "tag2"],
    },
    {
        id: "1",
        name: "5 Days Later",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        isDone: false,
        tags: [],
    },
    {
        id: "2",
        name: "13 Hours Later",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 13),
        isDone: false,
        tags: [],
    },
    {
        id: "3",
        name: "Task with only Title",
        description: "",
        isDone: false,
        tags: [],
    },
    {
        id: "4",
        name: "",
        description: "",
        isDone: false,
        tags: [],
    },
    {
        id: "5",
        name: "Task above me is empty.",
        description: "Might as well not exist, I guess.",
        isDone: false,
        tags: [],
    },
    {
        id: "6",
        name: "This task is done.",
        description: "",
        isDone: true,
        tags: [],
    },
    {
        id: "7",
        name: "This task is expired but not done.",
        description: "",
        isDone: false,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        id: "8",
        name: "This task is expired and done.",
        description: "",
        isDone: true,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        id: "9",
        name: "Really looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong name",
        description: "",
        isDone: false,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        id: "10",
        name: "Many many tags",
        description: "Just let them flow",
        isDone: false,
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
    },
    {
        id: "11",
        name: "Very long word in tag",
        description: "truncate it!",
        isDone: false,
        tags: [
            "taaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag",
        ],
    },
    {
        id: "12",
        name: "Very long word in desc",
        description:
            "truncaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaate me",
        isDone: false,
        tags: [],
    },
    // don't support something that is too ridiculously long
    {
        id: "13",
        name: "Really long description...",
        description:
            " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
        isDone: false,
        tags: [],
    },
];

interface IDataContext {
    tasks: ITask[];
    events: IEvent[];
    mergedEvents: IEvent[];
    setTasks: React.Dispatch<React.SetStateAction<ITask[]>>;
    setEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
}

const defaultDataContext: IDataContext = {
    tasks: [],
    events: [],
    mergedEvents: [],
    setTasks: (_) => {},
    setEvents: (_) => {},
};

export const DataContext = createContext<IDataContext>(defaultDataContext);

/**
 * Responsible for passing data between the client and the server, from the client side.
 */
export const DataProvider = ({ children }: { children: JSX.Element }) => {
    // TODO: get initialEvents and initialTasks from server
    const [tasks, setTasks] = useState<ITask[]>(initialTasks);
    const [events, setEvents] = useState<IEvent[]>(initialEvents);
    const mergedEvents = mergeEventArrays(events, tasks);

    return (
        <DataContext.Provider value={{ tasks, events, mergedEvents, setTasks, setEvents }}>
            {children}
        </DataContext.Provider>
    );
};
