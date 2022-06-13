import { IEvent, ITask } from "../types";
import { isLessThan } from "./dates";

// Collection of useful helper functions for manipulating events and tasks.

/**
 * Function to merge a variable number of event or task arrays.
 *
 * @param events Optional array of events.
 * @param tasks Optional array of tasks. Tasks are skipped if there is no deadline. Tasks are marked as important if deadline is less than 3 days away.
 *
 * @returns The events/tasks merged into a single sorted array.
 */
export const mergeEventArrays = (events: IEvent[] = [], tasks: ITask[] = []): IEvent[] => {
    const result: IEvent[] = [];

    events.forEach((e) => result.push({ ...e }));
    tasks.forEach((t) => {
        // Skip task if there is no deadline defined.
        if (t.deadline === undefined) {
            return;
        }
        result.push({
            name: t.name,
            start: t.deadline,
            end: t.deadline,
            important: isLessThan(t.deadline, 3, "day"),
        });
    });

    result.sort((a, b) => {
        // Compare with start, end then name.
        const aStart = a.start.getTime();
        const bStart = b.start.getTime();
        const aEnd = a.end.getTime();
        const bEnd = b.end.getTime();

        if (aStart !== bStart) {
            return aStart - bStart;
        } else if (aEnd !== bEnd) {
            return aEnd - bEnd;
        }
        return a.name.localeCompare(b.name);
    });

    return result;
};

export interface filterTaskOptions {
    done: boolean;
    expired: boolean;
}

/**
 * Filter tasks by some options.
 * @param tasks   Tasks to be filtered by.
 * @param options Filter by options, true to be filtered away. If left blank, all options will be true.
 * @returns Filtered tasks.
 */
export const filterTasks = (tasks: ITask[], options: filterTaskOptions): ITask[] => {
    return tasks.filter((t) => {
        if (options.done && t.isDone) {
            return false;
        }
        if (options.expired) {
            if (t.deadline !== undefined && isLessThan(t.deadline, 0, "")) {
                return false;
            }
        }
        return true;
    });
};
