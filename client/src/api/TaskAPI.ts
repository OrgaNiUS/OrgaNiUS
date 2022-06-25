import { CreatePatchFunction, CreatePostFunction } from "./API";

type TaskCreateData = {
    name: string;
    description: string;
    users: string[];
    projectID?: string;
};
export const TaskCreate = CreatePostFunction<TaskCreateData>("/task_create");

/**
 * Only fill in the fields that are to be changed.
 * assignedTo is userid.
 */
export type TaskPatchData = {
    taskid: string;
    name?: string;
    assignedTo?: string[];
    description?: string;
    deadline?: string;
    isDone?: boolean;
};
export const TaskPatch = CreatePatchFunction<TaskPatchData>("/task_modify");

type TaskDeleteData = {
    projectid?: string;
    tasks: string[];
};
export const TaskDelete = CreatePatchFunction<TaskDeleteData>("/task_delete");
