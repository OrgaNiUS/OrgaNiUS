import { createContext, useContext, useEffect, useState } from "react";
import { EventGetAll } from "../api/EventAPI";
import { ProjectCreate, ProjectGet, ProjectGetAll } from "../api/ProjectAPI";
import { TaskCreate, TaskDelete, TaskGetAll, TaskPatch, TaskPatchData } from "../api/TaskAPI";
import { convertMaybeISO } from "../functions/dates";
import { mergeEventArrays } from "../functions/events";
import { IEvent, IProject, IProjectCondensed, ITask, IUser, MaybeProject } from "../types";
import AuthContext from "./AuthProvider";

export interface patchTaskData extends Omit<Partial<ITask>, "id" | "assignedTo"> {
    id: string;
    addAssignedTo?: string[];
    removeAssignedTo?: string[];
    assignedTo?: IUser[];
    addTags?: string[];
    removeTags?: string[];
}

/**
 * addTask: the "id" field will be overridden so you can leave it blank.
 * removeTask: provide the "id" of the task to be removed.
 */
interface IDataContext {
    loading: boolean;
    tasks: ITask[];
    addTask: (task: ITask, projectid?: string) => Promise<ITask | undefined>;
    patchTask: (task: patchTaskData, fullTask: ITask) => void;
    removeTasks: (ids: string[], projectid?: string) => void;
    events: IEvent[];
    mergedEvents: IEvent[];
    projects: IProjectCondensed[];
    getProject: (id: string) => Promise<[MaybeProject, ITask[]]>;
    addProject: (project: IProject) => Promise<string>;
}

const defaultDataContext: IDataContext = {
    loading: false,
    tasks: [],
    addTask: (_) => Promise.resolve(undefined),
    patchTask: (_) => {},
    removeTasks: (_) => {},
    events: [],
    mergedEvents: [],
    projects: [],
    getProject: (_) => Promise.resolve([undefined, []]),
    addProject: (_) => Promise.resolve(""),
};

export const DataContext = createContext<IDataContext>(defaultDataContext);

/**
 * Responsible for passing data between the client and the server, from the client side.
 */
export const DataProvider = ({ children }: { children: JSX.Element }) => {
    const auth = useContext(AuthContext);

    const [isTasksLoading, setIsTasksLoading] = useState<boolean>(true);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [isEventsLoading, setIsEventsLoading] = useState<boolean>(true);
    const [events, setEvents] = useState<IEvent[]>([]);
    const mergedEvents = mergeEventArrays(events, tasks);
    const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(true);
    const [projects, setProjects] = useState<IProjectCondensed[]>([]);

    useEffect(() => {
        TaskGetAll(
            auth.axiosInstance,
            { projectid: "" },
            (response) => {
                const data = response.data;
                const tasks: ITask[] = data.tasks.map((task: any) => {
                    // if 0 seconds since epoch time, treat as no deadline
                    const deadline: Date | undefined = convertMaybeISO(task.deadline);
                    // assignedTo doesn't matter for personal tasks
                    const assignedTo: IUser[] = [];
                    return { ...task, creationTime: new Date(task.creationTime), deadline, assignedTo };
                });

                setIsTasksLoading(false);
                setTasks(tasks);
            },
            () => {}
        );

        ProjectGetAll(
            auth.axiosInstance,
            (response) => {
                const data = response.data;

                setIsProjectsLoading(false);
                setProjects(data.projects);
            },
            () => {}
        );

        EventGetAll(
            auth.axiosInstance,
            { projectid: "" },
            (response) => {
                const data = response.data;
                const events: IEvent[] = data.events.map((event: any) => {
                    const start: Date | undefined = convertMaybeISO(event.start);
                    const end: Date | undefined = convertMaybeISO(event.end);
                    return { ...event, start, end };
                });

                setIsEventsLoading(false);
                setEvents(events);
            },
            () => {}
        );
    }, [auth.axiosInstance]);

    const addTask = (task: ITask, projectid: string = ""): Promise<ITask | undefined> => {
        const assignedTo: string[] = task.assignedTo.map((u) => u.id); /* convert to id */
        return TaskCreate(
            auth.axiosInstance,
            {
                name: task.name,
                description: task.description,
                assignedTo,
                projectid: projectid,
                deadline: task.deadline ? task.deadline.toISOString() : new Date(0).toISOString(),
                tags: task.tags,
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            },
            (response) => {
                const data = response.data;
                const newTask: ITask = { ...task, id: data.taskid };

                // only add to user if personal task OR user is included in assignedTo
                const ownUserIsAssigned: boolean = auth.auth.id !== undefined && assignedTo.includes(auth.auth.id);
                if (projectid === "" || ownUserIsAssigned) {
                    setTasks((t) => {
                        return [...t, newTask];
                    });
                }

                return newTask;
            },
            () => {
                return undefined;
            }
        );
    };

    /**
     * Do not use `assignedTo` field
     */
    const patchTask = (task: patchTaskData, fullTask: ITask) => {
        // undefined checks + check if included in add/remove array
        const shouldRemoveFromOwnUser: boolean =
            task.removeAssignedTo !== undefined &&
            auth.auth.id !== undefined &&
            task.removeAssignedTo.includes(auth.auth.id);
        const shouldAddToOwnUser: boolean =
            task.addAssignedTo !== undefined && auth.auth.id !== undefined && task.addAssignedTo.includes(auth.auth.id);

        setTasks((t) => {
            if (shouldRemoveFromOwnUser) {
                // remove current task if in local copy
                const tasksCopy: ITask[] = t.filter((t) => t.id !== task.id);
                return tasksCopy;
            }

            const tasksCopy: ITask[] = [...t];
            for (let i = 0; i < tasksCopy.length; i++) {
                const t: ITask = { ...tasksCopy[i] };
                if (t.id !== task.id) {
                    continue;
                }
                tasksCopy[i] = {
                    id: t.id,
                    name: task.name ?? t.name,
                    assignedTo: task.assignedTo ?? t.assignedTo,
                    description: task.description ?? t.description,
                    creationTime: task.creationTime ?? t.creationTime,
                    deadline: task.deadline ?? t.deadline,
                    isDone: task.isDone ?? t.isDone,
                    tags: task.tags ?? t.tags,
                    isPersonal: task.isPersonal ?? t.isPersonal,
                };
                break;
            }

            if (shouldAddToOwnUser) {
                // if this task was not in the local copy but now it is, we add it in!
                // this is the reason we have to take in the `fullTask` parameter.
                return [...tasksCopy, fullTask];
            }
            return tasksCopy;
        });

        const payload: TaskPatchData = {
            taskid: task.id ?? "",
        };

        if (task.name !== undefined) {
            payload.name = task.name;
        }
        if (task.addAssignedTo !== undefined) {
            payload.addAssignedTo = task.addAssignedTo;
        }
        if (task.removeAssignedTo !== undefined) {
            payload.removeAssignedTo = task.removeAssignedTo;
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
        if (task.addTags !== undefined) {
            payload.addTags = task.addTags;
        }
        if (task.removeTags !== undefined) {
            payload.removeTags = task.removeTags;
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
                    const deadline: Date | undefined = convertMaybeISO(task.deadline);

                    const assignedTo: IUser[] = task.assignedTo.map((id: string) =>
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

    const addProject = (project: IProject): Promise<string> => {
        const ownUser: IUser = { name: auth.auth.user ?? "", id: auth.auth.id ?? "", role: "" };

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
                const data = response.data;
                const id: string = data.projectid;

                setProjects((p) => {
                    return [...p, { ...project, id, members: [ownUser] }];
                });
                return id;
            },
            (_) => {
                return "";
            }
        );
    };

    return (
        <DataContext.Provider
            value={{
                /* if anything is still loading, it is considered loading */
                loading: isTasksLoading || isEventsLoading || isProjectsLoading,
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
