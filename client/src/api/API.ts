import { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * All API functions take in a success and failure APICallback.
 * APICallback can be passed in as undefined for no action.
 * Success callback is called on successful request.
 * Failure callback is called on failed request.
 */
export type APICallback = ((_: any) => void) | undefined;

/**
 * Returns a get function.
 * @param url URL for request.
 * @returns Get Function.
 */
export const CreateGetFunction = (url: string) => {
    return (axiosInstance: AxiosInstance, success: APICallback, failure: APICallback) => {
        axiosInstance.get(url).then(success).catch(failure);
    };
};

/**
 * Returns a post function.
 * @param url URL for request.
 * @returns Post Function.
 */
export const CreatePostFunction = <T>(url: string) => {
    return (
        axiosInstance: AxiosInstance,
        data: T,
        headers: AxiosRequestConfig<T>,
        success: APICallback,
        failure: APICallback
    ) => {
        axiosInstance.post(url, data, headers).then(success).catch(failure);
    };
};

/**
 * Returns a patch function.
 * @param url URL for request.
 * @returns Patch Function.
 */
export const CreatePatchFunction = <T>(url: string) => {
    return (axiosInstance: AxiosInstance, payload: T, success: APICallback, failure: APICallback) => {
        axiosInstance.patch(url, payload).then(success).catch(failure);
    };
};

/**
 * Returns a delete function.
 * @param url URL for request.
 * @returns Delete Function.
 */
export const CreateDeleteFunction = (url: string) => {
    return (axiosInstance: AxiosInstance, success: APICallback, failure: APICallback) => {
        axiosInstance.delete(url).then(success).catch(failure);
    };
};
