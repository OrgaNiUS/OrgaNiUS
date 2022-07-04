import { createContext, useContext, useEffect, useState } from "react";
import { ProjectCreate, ProjectGet, ProjectGetAll } from "../api/ProjectAPI";
import { TaskCreate, TaskDelete, TaskGetAll, TaskPatch, TaskPatchData } from "../api/TaskAPI";
import { mergeEventArrays } from "../functions/events";
import { IEvent, IProject, IProjectCondensed, ITask, IUser, MaybeProject } from "../types";
import AuthContext from "./AuthProvider";

// TODO: This is only for testing purposes because actual events integration are to be implemented later on.
// const initialEvents: IEvent[] = [
//     {
//         name: "event 1",
//         start: new Date(2022, 5, 1),
//         end: new Date(2022, 5, 4),
//     },
//     {
//         name: "event 2",
//         start: new Date(2022, 5, 1),
//         end: new Date(2022, 5, 1),
//     },
//     {
//         name: "very loooooooooooooooooooooooooooooooooooong name",
//         start: new Date(2022, 5, 1),
//         end: new Date(2022, 5, 1),
//     },
//     {
//         name: "All day event!",
//         start: new Date(2022, 5, 14),
//         end: new Date(2022, 5, 14),
//         allDay: true,
//     },
//     {
//         name: "Starts yesterday, ends tomorrow.",
//         start: new Date(Date.now() - 1000 * 60 * 60 * 24),
//         end: new Date(Date.now() + 1000 * 60 * 60 * 24),
//         allDay: true,
//     },
// ];

/**
 * addTask: the "id" field will be overridden so you can leave it blank.
 * removeTask: provide the "id" of the task to be removed.
 */
interface IDataContext {
    tasks: ITask[];
    addTask: (task: ITask, projectid?: string) => Promise<ITask | undefined>;
    patchTask: (task: Partial<ITask>) => void;
    removeTasks: (ids: string[], projectid?: string) => void;
    events: IEvent[];
    mergedEvents: IEvent[];
    projects: IProjectCondensed[];
    getProject: (id: string) => Promise<[MaybeProject, ITask[]]>;
    addProject: (project: IProject) => Promise<[string, string]>;
}

const defaultDataContext: IDataContext = {
    tasks: [],
    addTask: (_) => Promise.resolve(undefined),
    patchTask: (_) => {},
    removeTasks: (_) => {},
    events: [],
    mergedEvents: [],
    projects: [],
    getProject: (_) => Promise.resolve([undefined, []]),
    addProject: (_) => Promise.resolve(["", ""]),
};

export const DataContext = createContext<IDataContext>(defaultDataContext);

/**
 * Responsible for passing data between the client and the server, from the client side.
 */
export const DataProvider = ({ children }: { children: JSX.Element }) => {
    const auth = useContext(AuthContext);

    // TODO: get initialEvents from server
    const [tasks, setTasks] = useState<ITask[]>([]);
    // until events CRUD is implemented
    // eslint-disable-next-line
    const [events, setEvents] = useState<IEvent[]>([]);
    const mergedEvents = mergeEventArrays(events, tasks);
    const [projects, setProjects] = useState<IProjectCondensed[]>([]);

    useEffect(() => {
        TaskGetAll(
            auth.axiosInstance,
            { projectid: "" },
            (response) => {
                const data = response.data;
                const tasks: ITask[] = data.tasks.map((task: any) => {
                    // if 0 seconds since epoch time, treat as no deadline
                    const deadline: Date | undefined =
                        task.deadline === "1970-01-01T00:00:00Z" ? undefined : new Date(task.deadline);
                    // assignedTo doesn't matter for personal tasks
                    const assignedTo: IUser[] = [];
                    return { ...task, creationTime: new Date(task.creationTime), deadline, assignedTo };
                });

                setTasks(tasks);
            },
            () => {}
        );

        ProjectGetAll(
            auth.axiosInstance,
            (response) => {
                const data = response.data;
                setProjects(data.projects);
            },
            () => {}
        );
    }, [auth.axiosInstance]);

    const addTask = (task: ITask, projectid: string = ""): Promise<ITask | undefined> => {
        return TaskCreate(
            auth.axiosInstance,
            {
                name: task.name,
                description: task.description,
                assignedTo: task.assignedTo.map((u) => u.id),
                projectid: projectid,
                deadline: task.deadline ? task.deadline.toISOString() : new Date(0).toISOString(),
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            },
            (response) => {
                const data = response.data;
                const newTask: ITask = { ...task, id: data.taskid };

                setTasks((t) => {
                    return [...t, newTask];
                });

                return newTask;
            },
            () => {
                return undefined;
            }
        );
    };

    const patchTask = (task: Partial<ITask>) => {
        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            for (let i = 0; i < tasksCopy.length; i++) {
                const t: ITask = { ...tasksCopy[i] };
                if (t.id !== task.id) {
                    continue;
                }
                Object.entries(task).forEach(([k, v]) => {
                    const key = k as keyof ITask;
                    // not fully typed but Partial<ITask> ensures types will match
                    (t[key] as any) = v;
                });
                tasksCopy[i] = t;
                break;
            }
            return tasksCopy;
        });

        const payload: TaskPatchData = {
            taskid: task.id ?? "",
        };

        if (task.name !== undefined) {
            payload.name = task.name;
        }
        if (task.assignedTo !== undefined) {
            payload.assignedTo = task.assignedTo.map((u) => u.id);
        }
        if (task.description !== undefined) {
            payload.description = task.description;
        }
        if (task.deadline !== undefined) {
            payload.deadline = task.deadline.toISOString();
        }
        if (task.isDone !== undefined) {
            payload.isDone = task.isDone;
        }

        TaskPatch(
            auth.axiosInstance,
            payload,
            (_) => {},
            (_) => {}
        );
    };

    const removeTasks = (ids: string[], projectid: string = "") => {
        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !ids.includes(t.id));

            return tasksCopy;
        });
        TaskDelete(
            auth.axiosInstance,
            { projectid, tasks: ids },
            (_) => {},
            (_) => {}
        );
    };

    const getProject = (id: string): Promise<[MaybeProject, ITask[]]> => {
        return ProjectGet(
            auth.axiosInstance,
            { projectid: id },
            (response) => {
                const data = response.data;
                const members = data.members;

                // convert server tasks to client tasks
                const tasks: ITask[] = data.tasks.map((task: any) => {
                    // if 0 seconds since epoch time, treat as no deadline
                    const deadline: Date | undefined =
                        task.deadline === "1970-01-01T00:00:00Z" ? undefined : new Date(task.deadline);

                    const assignedTo: IUser[] = Object.keys(task.assignedTo).map((id) =>
                        members.find((u: IUser) => u.id === id)
                    );
                    return { ...task, creationTime: new Date(task.creationTime), deadline, assignedTo };
                });

                const project: IProject = {
                    id,
                    name: data.name,
                    description: data.description,
                    members,
                    events: [],
                    tasks: tasks.map((t: ITask) => t.id),
                    creationTime: data.creationTime,
                };

                setProjects((p) => {
                    const projectsCopy: IProjectCondensed[] = [...p];
                    for (let i = 0; i < projectsCopy.length; i++) {
                        if (projectsCopy[i].id === id) {
                            // update the local copy
                            projectsCopy[i] = { id, name: data.name, description: data.description };
                            break;
                        }
                    }
                    return projectsCopy;
                });

                return [project, tasks];
            },
            () => {
                return [undefined, []];
            }
        );
    };

    const addProject = (project: IProject): Promise<[string, string]> => {
        const ownUser: IUser = { name: auth.auth.user ?? "", id: auth.auth.id ?? "" };

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
            (response) => {
                // TODO: get invite code from here & update
                const data = response.data;
                const id: string = data.projectid;

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
