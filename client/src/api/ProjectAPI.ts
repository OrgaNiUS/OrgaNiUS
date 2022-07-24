import {
    CreateDeleteFunctionWithParams,
    CreateGetFunction,
    CreateGetFunctionWithParams,
    CreatePatchFunction,
    CreatePostFunction,
} from "./API";

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

type ProjectLeaveData = ProjectGetParams;
export const ProjectLeave = CreatePatchFunction<ProjectLeaveData>("/project_leave");

// only for admin use
type ProjectGetApplicationsParams = ProjectGetParams;
export const ProjectGetApplications =
    CreateGetFunctionWithParams<ProjectGetApplicationsParams>("/project_get_applications");

type ProjectChooseData = {
    projectid: string;
    acceptedUsers: string[];
    rejectedUsers: string[];
};
export const ProjectChoose = CreatePatchFunction<ProjectChooseData>("/project_choose");

type ProjectModifyData = {
    name?: string;
    projectid: string;
    description?: string;
    isPublic?: boolean;
};
export const ProjectModify = CreatePatchFunction<ProjectModifyData>("/project_modify");

type ProjectRemoveUserData = {
    projectid: string;
    userids: string[];
};
export const ProjectRemoveUser = CreatePatchFunction<ProjectRemoveUserData>("/project_remove_user");

type ProjectDeleteParams = ProjectGetParams;
export const ProjectDelete = CreateDeleteFunctionWithParams<ProjectDeleteParams>("/project_delete");
