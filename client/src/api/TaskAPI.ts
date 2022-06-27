import {
    CreateDeleteFunctionWithParams,
    CreateGetFunctionWithParams,
    CreatePatchFunction,
    CreatePostFunction,
} from "./API";

/**
 * Gets all the User's tasks if no projectid given. Otherwise returns tasks associated with the projectid.
 * Empty string to not give projectid.
 */
type TaskGetAllData = {
    projectid: string;
};
export const TaskGetAll = CreateGetFunctionWithParams<TaskGetAllData>("/task_get_all");

type TaskCreateData = {
    name: string;
    description: string;
    assignedTo: string[]; // id of users
    projectid: string;
    deadline: string;
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
    projectid: string;
    tasks: string[];
};
export const TaskDelete = CreateDeleteFunctionWithParams<TaskDeleteData>("/task_delete");
