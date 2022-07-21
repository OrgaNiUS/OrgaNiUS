import {
    CreateDeleteFunctionWithParams,
    CreateGetFunctionWithParams,
    CreatePatchFunction,
    CreatePostFunction,
    CreatePostFunctionWithFormData,
} from "./API";

type EventCreateParams = {
    name: string;
    start: string; // ISO 8601 format
    end: string; // ISO 8601 format
    projectid?: string;
};
export const EventCreate = CreatePostFunction<EventCreateParams>("/event_create");

type EventGetParams = {
    eventid: string;
};
export const EventGet = CreateGetFunctionWithParams<EventGetParams>("/event_get");

// Get All User Events: Leave projectid as empty string
// Get All Project Events: Put relevant projectid
type EventGetAllParams = {
    projectid: string;
};
export const EventGetAll = CreateGetFunctionWithParams<EventGetAllParams>("/event_get_all");

export type EventPatchParams = {
    eventid: string;
    name?: string;
    start?: string; // ISO 8601 format
    end?: string; // ISO 8601 format
};
export const EventPatch = CreatePatchFunction<EventPatchParams>("/event_modify");

type EventDeleteParams = {
    eventid: string;
    projectid?: string; // if associated with a project
};
export const EventDelete = CreateDeleteFunctionWithParams<EventDeleteParams>("/event_delete");

type EventNusmodsParams = {
    url: string;
};
export const EventNusmods = CreatePostFunction<EventNusmodsParams>("/event_nusmods");

export const EventIcs = CreatePostFunctionWithFormData("/event_ics");
