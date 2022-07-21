export interface IEvent {
    id: string;
    name: string;
    start: Date;
    end: Date;
}

// update IFields in TodoEdit and TodoCreate as well (if needed)
export interface ITask {
    id: string;
    name: string;
    assignedTo: IUser[];
    description: string;
    creationTime: Date;
    deadline?: Date;
    isDone: boolean;
    tags: string[];
    isPersonal: boolean;
}

// result of merging of Event & Task
export interface DateItem {
    id: string;
    name: string;
    start: Date;
    end: Date;
    isEvent: boolean;
}

// only storing other users data
// own user data is stored in DataContext
export interface IUser {
    id: string;
    name: string;
    role: string;
}

export interface IUserSettings {
    deadlineNotification: Date;
    webNotification: boolean;
    telegramNotification: boolean;
    emailNotification: boolean;
}

export interface IProjectCondensed {
    id: string;
    name: string;
    description: string;
}

export type MaybeProject = IProject | undefined;
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
