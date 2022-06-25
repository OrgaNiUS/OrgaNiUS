import { CreateGetFunctionWithParams, CreatePostFunction } from "./API";

type ProjectGetParams = {
    projectid: string;
};
export const ProjectGet = CreateGetFunctionWithParams<ProjectGetParams>("/project_get");

type ProjectCreateData = {
    name: string;
    description: string;
};
export const ProjectCreate = CreatePostFunction<ProjectCreateData>("/project_create");
