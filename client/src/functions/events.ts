import { IEvent, ITask } from "../types";

// Collection of useful helper functions for manipulating events and tasks.

/**
 * Function to merge a variable number of event or task arrays.
 *
 * @param events Optional array of events.
 * @param tasks Optional array of tasks. Tasks are skipped if there is no deadline.
 *
 * @return The events/tasks merged into a single sorted array.
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
        } else if (aEnd != bEnd) {
            return aEnd - bEnd;
        }
        return a.name.localeCompare(b.name);
    });

    return result;
};
