import { CreatePatchFunction, CreatePostFunction } from "./API";

type TaskCreateData = {
    name: string;
    description: string;
    users: string[];
    projectID?: string;
};
export const TaskCreate = CreatePostFunction<TaskCreateData>("/task_create");

type TaskAddUserData = {
    taskid: string;
    users: string[];
};
export const TaskAddUser = CreatePatchFunction<TaskAddUserData>("/task_add_user");

type TaskDeleteData = {
    projectid?: string;
    tasks: string[];
};
export const TaskDelete = CreatePatchFunction<TaskDeleteData>("/task_delete");
