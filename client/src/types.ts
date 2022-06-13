export interface IEvent {
    name: string;
    start: Date;
    end: Date;
    important: boolean;
}

export interface ITask {
    name: string;
    description: string;
    tags: string[];
    deadline?: Date;
}
