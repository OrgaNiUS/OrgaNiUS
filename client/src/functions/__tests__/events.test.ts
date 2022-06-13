import { IEvent, ITask } from "../../types";
import { mergeEventArrays } from "../events";

describe("mergeEventArrays", () => {
    const event1: IEvent = {
        name: "event 1",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 1, 1),
        important: false,
    };
    const event2: IEvent = {
        name: "event 2",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 0, 1),
        important: true,
    };
    const events: IEvent[] = [event1, event2];
    const task1: ITask = {
        name: "Some task",
        description: "",
        tags: [],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    };
    const event3: IEvent = {
        name: task1.name,
        start: task1.deadline as Date,
        end: task1.deadline as Date,
        important: false,
    };
    const task2: ITask = {
        name: "Another task",
        description: "",
        tags: [],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    };
    const event4: IEvent = {
        name: task2.name,
        start: task2.deadline as Date,
        end: task2.deadline as Date,
        important: true,
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
