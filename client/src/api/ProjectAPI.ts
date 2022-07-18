import { CreateGetFunction, CreateGetFunctionWithParams, CreatePatchFunction, CreatePostFunction } from "./API";

type ProjectGetParams = {
    projectid: string;
};
export const ProjectGet = CreateGetFunctionWithParams<ProjectGetParams>("/project_get");

export const ProjectGetAll = CreateGetFunction("project_get_all");

type ProjectCreateData = {
    name: string;
    description: string;
};
export const ProjectCreate = CreatePostFunction<ProjectCreateData>("/project_create");

type ProjectInviteData = {
    users: string[] /* EXACT usernames */;
    projectid: string;
};
export const ProjectInvite = CreatePatchFunction<ProjectInviteData>("/project_invite");

type ProjectGetApplicationsParams = {
    projectid: string;
};
// only for admin use
export const ProjectGetApplications =
    CreateGetFunctionWithParams<ProjectGetApplicationsParams>("/project_get_applications");

type ProjectChooseData = {
    projectid: string;
    acceptedUsers: string[];
    rejectedUsers: string[];
};
export const ProjectChoose = CreatePatchFunction<ProjectChooseData>("/project_choose");
