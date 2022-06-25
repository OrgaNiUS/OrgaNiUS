import { useState } from "react";
import { mergeEventArrays } from "../functions/events";
import { IEvent, IProject, ITask, MaybeProject } from "../types";
import { DataContext } from "./DataProvider";

const MockDataProvider = ({
    initialTasks,
    initialEvents,
    initialProjects,
    children,
}: {
    initialTasks: ITask[];
    initialEvents: IEvent[];
    initialProjects: IProject[];
    children: JSX.Element;
}): JSX.Element => {
    const [tasks, setTasks] = useState<ITask[]>(initialTasks);
    const [events, setEvents] = useState<IEvent[]>(initialEvents);
    const mergedEvents = mergeEventArrays(events, tasks);
    const [projects, setProjects] = useState<IProject[]>(initialProjects);

    const addTask = (task: ITask) => {
        setTasks((t) => {
            return [...t, { ...task, id: tasks.length.toString() }];
        });
    };

    const patchTask = (task: Partial<ITask>) => {
        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            for (let i = 0; i < tasksCopy.length; i++) {
                const t: ITask = tasksCopy[i];
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
    };

    const removeTasks = (ids: string[], projectid?: string) => {
        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !ids.includes(t.id));

            for (let i = 0; i < tasksCopy.length; i++) {
                tasksCopy[i].id = i.toString();
            }
            return tasksCopy;
        });
    };

    const getProject = (id: string): [MaybeProject, Promise<MaybeProject>] => {
        const project: IProject | undefined = projects.find((project) => project.id === id);
        return [project, Promise.resolve(undefined)];
    };

    const addProject = (project: IProject): Promise<[string, string]> => {
        const id: string = projects.length.toString();

        setProjects((p) => {
            return [...p, { ...project, id, members: [] }];
        });
        return Promise.resolve([id, "A72BC1"]);
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

export default MockDataProvider;
