export interface IEvent {
    name: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}

// update IFields in TodoEdit and TodoCreate as well (if needed)
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

// only storing other users data
// own user data is stored in DataContext
export interface IUser {
    name: string;
}

export interface IUserSettings {
    deadlineNotification: Date;
    webNotification: boolean;
    telegramNotification: boolean;
    emailNotification: boolean;
}

export interface IProject {
    id: string;
    name: string;
    description: string;
    members: IUser[];
    events: string[]; // storing only ids
    tasks: string[]; // storing only ids
    creationTime: Date;
}

export interface IProjectSettings {
    roles: { [key: string]: IProjectPermissions };
    deadlineNotification: Date;
}

export interface IProjectPermissions {
    addMember: boolean;
    removeMember: boolean;
    editName: boolean;
    editDesc: boolean;
    editSettings: boolean;
    addTask: boolean;
    removeTask: boolean;
    canAssignOthers: boolean;
}
