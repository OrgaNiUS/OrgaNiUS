import { arrayMove } from "@dnd-kit/sortable";
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

/**
 * addTask: the "id" field will be overridden so you can leave it blank.
 * removeTask: provide the "id" of the task to be removed.
 */
interface IDataContext {
    tasks: ITask[];
    events: IEvent[];
    mergedEvents: IEvent[];
    addTask: (task: ITask) => void;
    removeTask: (id: string) => void;
    swapTasks: (startID: string, endID: string) => void;
}

const defaultDataContext: IDataContext = {
    tasks: [],
    events: [],
    mergedEvents: [],
    addTask: (_) => {},
    removeTask: (_) => {},
    swapTasks: (_, __) => {},
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

    const addTask = (task: ITask) => {
        setTasks((t) => {
            return [...t, { ...task, id: tasks.length.toString() }];
        });
        // TODO: add to server
    };

    const removeTask = (id: string) => {
        const tasksCopy: ITask[] = tasks.filter((t) => t.id !== id);

        for (let i = parseInt(id); i < tasks.length - 1; i++) {
            tasksCopy[i].id = i.toString();
        }
        setTasks(tasksCopy);
        // TODO: remove from server
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
        }
        // TODO: send changes to server
        setTasks(tasksCopy);
    };

    return (
        <DataContext.Provider value={{ tasks, events, mergedEvents, addTask, removeTask, swapTasks }}>
            {children}
        </DataContext.Provider>
    );
};
