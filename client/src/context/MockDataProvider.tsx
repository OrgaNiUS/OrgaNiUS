import { useState } from "react";
import { mergeEventArrays } from "../functions/events";
import { IEvent, IProject, IProjectCondensed, ITask, MaybeProject } from "../types";
import { DataContext, patchEventData, patchTaskData } from "./DataProvider";

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
    const [selectedEvent, setSelectedEvent] = useState<string | undefined>(undefined);
    const [editingEvent, setEditingEvent] = useState<IEvent | undefined>(undefined);
    const [projects, setProjects] = useState<IProjectCondensed[]>(initialProjects);

    const addTask = (task: ITask, _: string = ""): Promise<ITask | undefined> => {
        const newTask = { ...task, id: tasks.length.toString() };
        setTasks((t) => {
            return [...t, newTask];
        });
        return Promise.resolve(newTask);
    };

    const patchTask = (task: patchTaskData) => {
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

    const addEvent = (event: IEvent, projectid?: string) => {
        const newEvent: IEvent = { ...event, id: "" };

        setEvents((e) => [...e, newEvent]);
    };

    const patchEvent = (event: patchEventData) => {
        setEvents((e) => {
            const eventsCopy: IEvent[] = [...e];
            for (let i = 0; i < eventsCopy.length; i++) {
                const e: IEvent = { ...eventsCopy[i] };
                if (e.id !== event.id) {
                    continue;
                }
                eventsCopy[i] = {
                    id: e.id,
                    name: event.name ?? e.name,
                    start: event.start ?? e.start,
                    end: event.end ?? e.end,
                };
                break;
            }
            return eventsCopy;
        });
    };

    const removeEvent = (eventid: string, projectid?: string) => {
        setEvents((e) => e.filter((e) => e.id !== eventid));
    };

    const getProject = (id: string): Promise<[MaybeProject, ITask[], IEvent[]]> => {
        const condensedProject: IProjectCondensed | undefined = projects.find((project) => project.id === id);
        if (condensedProject === undefined) {
            return Promise.resolve([undefined, [], []]);
        }
        const project: IProject = { ...condensedProject, members: [], events: [], tasks: [], creationTime: new Date() };
        return Promise.resolve([project, [], []]);
    };

    const addProject = (project: IProject): Promise<string> => {
        const id: string = projects.length.toString();

        setProjects((p) => {
            return [...p, { ...project, id, members: [] }];
        });
        return Promise.resolve(id);
    };

    return (
        <DataContext.Provider
            value={{
                loading: false,
                tasks,
                addTask: addTask,
                patchTask,
                removeTasks,
                events,
                mergedEvents,
                selectedEvent,
                setSelectedEvent,
                editingEvent,
                setEditingEvent,
                addEvent,
                patchEvent,
                removeEvent,
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
