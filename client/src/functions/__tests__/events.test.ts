import { IEvent, ITask } from "../../types";
import { filterEvents, filterTasks, mergeEventArrays } from "../events";

describe("mergeEventArrays", () => {
    const event1: IEvent = {
        name: "event 1",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 1, 1),
    };
    const event2: IEvent = {
        name: "event 2",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 0, 1),
    };
    const events: IEvent[] = [event1, event2];
    const task1: ITask = {
        id: "0",
        name: "Some task",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        isDone: false,
        tags: [],
    };
    const event3: IEvent = {
        name: task1.name,
        start: task1.deadline as Date,
        end: task1.deadline as Date,
    };
    const task2: ITask = {
        id: "0",
        name: "Another task",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 - 1),
        isDone: false,
        tags: [],
    };
    const event4: IEvent = {
        name: task2.name,
        start: task2.deadline as Date,
        end: task2.deadline as Date,
    };
    const tasks: ITask[] = [task1, task2];

    it("test 1", () => {
        const merged: IEvent[] = mergeEventArrays(events, tasks);

        expect(merged[0]).toMatchObject(event2);
        expect(merged[1]).toMatchObject(event1);
        expect(merged[2]).toMatchObject(event4);
        expect(merged[3]).toMatchObject(event3);
    });
});

describe("filterEvents", () => {
    it("filter over", () => {
        const events: IEvent[] = [
            {
                name: "Ends yesterday.",
                start: new Date(Date.now() - 1000 * 60 * 60 * 24),
                end: new Date(Date.now() - 1000 * 60 * 60 * 24),
                allDay: true,
            },
        ];
        expect(filterEvents(events, { over: true })).toStrictEqual([]);
    });
});

describe("filterTasks", () => {
    it("filter done", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "name",
                description: "",
                isDone: true,
                tags: [],
            },
        ];
        expect(filterTasks(tasks, { done: true, expired: false, searchTerm: "" })).toStrictEqual([]);
    });
    it("filter expired", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "name",
                description: "",
                isDone: false,
                deadline: new Date(Date.now() - 10),
                tags: [],
            },
        ];
        expect(filterTasks(tasks, { done: false, expired: true, searchTerm: "" })).toStrictEqual([]);
    });
    it("filter both expired and done", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "name",
                description: "",
                isDone: true,
                deadline: new Date(Date.now() - 10),
                tags: [],
            },
        ];
        expect(filterTasks(tasks, { done: false, expired: false, searchTerm: "" })).toStrictEqual(tasks);
        expect(filterTasks(tasks, { done: false, expired: true, searchTerm: "" })).toStrictEqual([]);
        expect(filterTasks(tasks, { done: true, expired: false, searchTerm: "" })).toStrictEqual([]);
        expect(filterTasks(tasks, { done: true, expired: true, searchTerm: "" })).toStrictEqual([]);
    });
    it("searchTerm name", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "nameX X",
                description: "",
                isDone: true,
                deadline: new Date(Date.now() - 10),
                tags: [],
            },
        ];
        expect(filterTasks(tasks, { done: false, expired: false, searchTerm: "name" })).toStrictEqual(tasks);
    });
    it("searchTerm description", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "name",
                description: "desc1",
                isDone: true,
                deadline: new Date(Date.now() - 10),
                tags: [],
            },
        ];
        expect(filterTasks(tasks, { done: false, expired: false, searchTerm: "desc" })).toStrictEqual(tasks);
    });
    it("searchTerm tag", () => {
        const tasks: ITask[] = [
            {
                id: "0",
                name: "name",
                description: "desc",
                isDone: true,
                deadline: new Date(Date.now() - 10),
                tags: ["tag2"],
            },
        ];
        expect(filterTasks(tasks, { done: false, expired: false, searchTerm: "tag" })).toStrictEqual(tasks);
    });
});
