import { arrayMove } from "@dnd-kit/sortable";
import { createContext, useContext, useState } from "react";
import { ProjectCreate, ProjectGet } from "../api/ProjectAPI";
import { TaskCreate, TaskDelete } from "../api/TaskAPI";
import { mergeEventArrays } from "../functions/events";
import { IEvent, IProject, ITask, IUser, MaybeProject } from "../types";
import AuthContext from "./AuthProvider";

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
        dnd_id: "0",
        name: "Task 1",
        assignedTo: [],
        description: "This is a short description.",
        deadline: new Date(2022, 6, 12),
        isDone: false,
        tags: ["tag1", "tag2"],
    },
    {
        dnd_id: "1",
        name: "5 Days Later",
        assignedTo: [],
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        isDone: false,
        tags: [],
    },
    {
        dnd_id: "2",
        name: "13 Hours Later",
        assignedTo: [],
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 13),
        isDone: false,
        tags: [],
    },
    {
        dnd_id: "3",
        name: "Task with only Title",
        assignedTo: [],
        description: "",
        isDone: false,
        tags: [],
    },
    {
        dnd_id: "4",
        name: "",
        assignedTo: [],
        description: "",
        isDone: false,
        tags: [],
    },
    {
        dnd_id: "5",
        name: "Task above me is empty.",
        assignedTo: [],
        description: "Might as well not exist, I guess.",
        isDone: false,
        tags: [],
    },
    {
        dnd_id: "6",
        name: "This task is done.",
        assignedTo: [],
        description: "",
        isDone: true,
        tags: [],
    },
    {
        dnd_id: "7",
        name: "This task is expired but not done.",
        assignedTo: [],
        description: "",
        isDone: false,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        dnd_id: "8",
        name: "This task is expired and done.",
        description: "",
        assignedTo: [],
        isDone: true,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        dnd_id: "9",
        name: "Really looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong name",
        description: "",
        isDone: false,
        assignedTo: [],
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        dnd_id: "10",
        name: "Many many tags",
        description: "Just let them flow",
        isDone: false,
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
        assignedTo: [],
    },
    {
        dnd_id: "11",
        name: "Very long word in tag",
        description: "truncate it!",
        assignedTo: [],
        isDone: false,
        tags: [
            "taaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag",
        ],
    },
    {
        dnd_id: "12",
        assignedTo: [],
        name: "Very long word in desc",
        description:
            "truncaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaate me",
        isDone: false,
        tags: [],
    },
    // don't support something that is too ridiculously long
    {
        dnd_id: "13",
        name: "Really long description...",
        assignedTo: [],
        description:
            " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
        isDone: false,
        tags: [],
    },
];

const user0: IUser = {
    name: "admin",
};
const user1: IUser = {
    name: "saraan",
};
const user2: IUser = {
    name: "jin wei",
};
const user3: IUser = {
    name: "bob",
};
const user4: IUser = {
    name: "tim",
};

const initialProjects: IProject[] = [
    {
        id: "0",
        name: "First ever project",
        description: "this is description",
        members: [user0, user1, user2, user3, user4],
        events: [],
        tasks: [],
        creationTime: new Date(),
    },
];

/**
 * addTask: the "id" field will be overridden so you can leave it blank.
 * removeTask: provide the "id" of the task to be removed.
 */
interface IDataContext {
    tasks: ITask[];
    addTask: (task: ITask) => void;
    patchTask: (task: ITask) => void;
    removeTasks: (ids: string[]) => void;
    swapTasks: (startID: string, endID: string) => void;
    events: IEvent[];
    mergedEvents: IEvent[];
    projects: IProject[];
    getProject: (id: string) => [MaybeProject, Promise<MaybeProject>];
    addProject: (project: IProject) => Promise<[string, string]>;
}

const defaultDataContext: IDataContext = {
    tasks: [],
    addTask: (_) => {},
    patchTask: (_) => {},
    removeTasks: (_) => {},
    swapTasks: (_, __) => {},
    events: [],
    mergedEvents: [],
    projects: [],
    getProject: (_) => [undefined, Promise.resolve(undefined)],
    addProject: (_) => Promise.resolve(["", ""]),
};

export const DataContext = createContext<IDataContext>(defaultDataContext);

/**
 * Responsible for passing data between the client and the server, from the client side.
 */
export const DataProvider = ({ children }: { children: JSX.Element }) => {
    const auth = useContext(AuthContext);

    // TODO: get initialEvents and initialTasks from server
    const [tasks, setTasks] = useState<ITask[]>(initialTasks);
    // until events CRUD is implemented
    // eslint-disable-next-line
    const [events, setEvents] = useState<IEvent[]>(initialEvents);
    const mergedEvents = mergeEventArrays(events, tasks);
    const [projects, setProjects] = useState<IProject[]>(initialProjects);

    const addTask = (task: ITask) => {
        TaskCreate(
            auth.axiosInstance,
            {
                name: task.name,
                description: task.description,
                users: task.assignedTo,
                projectID: task.projectID,
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            },
            (_) => {
                // TODO: get id from response
                setTasks((t) => {
                    return [...t, { ...task, dnd_id: tasks.length.toString() }];
                });
            },
            (_) => {}
        );
        // TODO: add to server (update id as well)
    };

    const patchTask = (task: ITask) => {
        // TODO: make this an actual patch and not put
        const id: number = parseInt(task.dnd_id);

        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            tasksCopy[id] = task;
            return tasksCopy;
        });
        // TODO: patch to server
    };

    // TODO: take projectid as well
    const removeTasks = (ids: string[]) => {
        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !ids.includes(t.dnd_id));

            for (let i = 0; i < tasksCopy.length; i++) {
                tasksCopy[i].dnd_id = i.toString();
            }
            return tasksCopy;
        });
        TaskDelete(
            auth.axiosInstance,
            { tasks: ids },
            (_) => {},
            (_) => {}
        );
    };

    const swapTasks = (startID: string, endID: string) => {
        const start: number = parseInt(startID);
        const end: number = parseInt(endID);

        // TODO: send changes to server
        setTasks((t) => {
            const tasksCopy: ITask[] = arrayMove(t, start, end);

            const loopStart: number = Math.min(start, end);
            const loopEnd: number = Math.max(start, end);
            for (let i = loopStart; i <= loopEnd; i++) {
                // update the IDs of those affected by the drag
                tasksCopy[i].dnd_id = i.toString();
            }
            return tasksCopy;
        });
    };

    const getProject = (id: string): [MaybeProject, Promise<MaybeProject>] => {
        // Simple O(n) for now, potentially use objects for O(1).
        // but n is not likely to be big.
        const local: MaybeProject = projects.find((project) => project.id === id);

        const server: Promise<MaybeProject> = ProjectGet(
            auth.axiosInstance,
            { projectid: id },
            (response) => {
                const data = response.data;
                const project: IProject = {
                    id: id,
                    name: data.name,
                    description: data.description,
                    members: [],
                    events: [],
                    tasks: [],
                    creationTime: data.creationTime,
                };

                setProjects((p) => {
                    const projectsCopy: IProject[] = [...p];
                    for (let i = 0; i < projectsCopy.length; i++) {
                        if (projectsCopy[i].id === id) {
                            // update the local copy
                            projectsCopy[i] = project;
                            break;
                        }
                    }
                    return projectsCopy;
                });

                return project;
            },
            (_) => {
                if (local !== undefined) {
                    // remove from local copy if present
                    setProjects((p) => {
                        return p.filter((p) => p.id !== id);
                    });
                }
                // if not found, return undefined
                return undefined;
            }
        );

        return [local, server];
    };

    const addProject = (project: IProject): Promise<[string, string]> => {
        const ownUser: IUser = { name: auth.auth.user ?? "" };

        return ProjectCreate(
            auth.axiosInstance,
            {
                name: project.name,
                description: project.description,
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            },
            (_) => {
                // TODO: get id and invite code from here & update
                // TODO: this id is temporary
                const id: string = projects.length.toString();

                setProjects((p) => {
                    return [...p, { ...project, id, members: [ownUser] }];
                });
                return [id, "A72BC1"];
            },
            (_) => {
                return ["", ""];
            }
        );
    };

    return (
        <DataContext.Provider
            value={{
                tasks,
                addTask,
                patchTask,
                removeTasks,
                swapTasks,
                events,
                mergedEvents,
                projects,
                getProject,
                addProject,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
