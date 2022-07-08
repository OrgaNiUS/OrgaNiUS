import { CreateDeleteFunction, CreateGetFunction, CreatePatchFunction, CreatePostFunction } from "./API";

type UserRegisterData = {
    name: string;
    password: string;
    email: string;
};
/**
 * Handles user registration.
 * @param data Name, password and email for registration.
 */
export const UserRegister = CreatePostFunction<UserRegisterData>("/signup");

type UserRegisterVerifyData = {
    name: string;
    pin: string;
};
/**
 * Handles user registration verification.
 * @param data Name and pin for registration verification.
 */
export const UserRegisterVerify = CreatePostFunction<UserRegisterVerifyData>("/verify");

type UserLoginData = {
    name: string;
    password: string;
};
/**
 * Handles user login.
 * @param data Name and password for login.
 */
export const UserLogin = CreatePostFunction<UserLoginData>("/login");

/**
 * Handles user refresh JWT.
 */
export const UserRefreshJWT = CreateGetFunction("/refresh_jwt");

/**
 * Handles user logout.
 */
export const UserLogout = CreateDeleteFunction("/logout");

type UserFPData = {
    name: string;
};
/**
 * Handles user forget password part 1.
 * @param data Name of account to have the password reset.
 */
export const UserFP = CreatePostFunction<UserFPData>("/forgot_pw");

type UserFPVerifyData = {
    name: string;
    pin: string;
};
/**
 * Handles user forget password part 2.
 * @param data Name and pin of account to have the password reset.
 */
export const UserFPVerify = CreatePostFunction<UserFPVerifyData>("/verify_forgot_pw");

/**
 * Handles user forget password part 3.
 * @param data Name and pin and new password of account to have the password reset.
 */
type UserFPChangeData = {
    name: string;
    pin: string;
    password: string;
};
export const UserFPChange = CreatePostFunction<UserFPChangeData>("/change_forgot_pw");

/**
 * Handles user get self.
 */
export const UserGetSelf = CreateGetFunction("/own_user");

export const UserGetProjectInvites = CreateGetFunction("/user_get_project_invites");

type UserAcceptInviteData = {
    projectid: string;
};
export const UserAcceptInvite = CreatePatchFunction<UserAcceptInviteData>("/user_accept");

type UserRejectInviteData = {
    projectid: string;
};
export const UserRejectInvite = CreatePatchFunction<UserRejectInviteData>("/user_reject");

type UserPatchData = {
    name?: string;
    email?: string;
    password?: string;
};
/**
 * Handles user patch.
 */
export const UserPatch = CreatePatchFunction<UserPatchData>("/user");

/**
 * Handles user delete.
 */
export const UserDelete = CreateDeleteFunction("/user");
