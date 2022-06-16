export interface IEvent {
    name: string;
    start: Date;
    end: Date;
    important: boolean;
    allDay?: boolean;
}

// some fields are marked as optional temporarily
export interface ITask {
    id: string;
    name: string;
    // change assignedTo to User[] type
    assignedTo?: string;
    description: string;
    creationTime?: Date;
    deadline?: Date;
    isDone: boolean;
    tags: string[];
}
