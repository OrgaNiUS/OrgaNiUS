import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { mergeEventArrays } from "../functions/events";
import { IEvent, IProject, ITask } from "../types";
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
            return [...t, { ...task, dnd_id: tasks.length.toString() }];
        });
    };

    const patchTask = (task: ITask) => {
        const id: number = parseInt(task.dnd_id);

        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            tasksCopy[id] = task;
            return tasksCopy;
        });
    };

    const removeTasks = (ids: string[]) => {
        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !ids.includes(t.dnd_id));

            for (let i = 0; i < tasksCopy.length; i++) {
                tasksCopy[i].dnd_id = i.toString();
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
                tasksCopy[i].dnd_id = i.toString();
            }
            return tasksCopy;
        });
    };

    const getProject = (id: string): IProject | undefined => {
        const project: IProject | undefined = projects.find((project) => project.id === id);
        return project;
    };

    const addProject = (project: IProject): [string, string] => {
        const id: string = projects.length.toString();

        setProjects((p) => {
            return [...p, { ...project, id, members: [] }];
        });
        return [id, "A72BC1"];
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

export default MockDataProvider;
