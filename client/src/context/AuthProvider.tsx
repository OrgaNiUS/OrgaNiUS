import axios, { AxiosInstance } from "axios";
import React, { createContext, useState } from "react";
import { getCookie } from "../functions/cookies";

interface AuthInterface {
    id?: string;
    user?: string;
    loggedIn: boolean;
}

interface IAuthContext {
    auth: AuthInterface;
    setAuth: React.Dispatch<React.SetStateAction<AuthInterface>>;
    axiosInstance: AxiosInstance;
}

// Gets information from JWT and returns an AuthInterface.
// Used for maintaining logged in status across refresh.
const ParseJWT = (): AuthInterface => {
    const jwt: string | undefined = getCookie("jwt");

    const user: AuthInterface = {
        id: "",
        user: "",
        loggedIn: false,
    };

    if (jwt === undefined) {
        return user;
    }

    // https://stackoverflow.com/a/46188039
    try {
        // atob function is deprecated but Buffer.from requires import
        const payload = JSON.parse(window.atob(jwt.split(".")[1]));

        user.id = payload.id;
        user.user = payload.name;
        user.loggedIn = true;
        return user;
    } catch {
        return user;
    }
};

// Very difficult (impossible?) to load heroku environment variables into react app.
// Thus, opt to override it with a local environment variable for development instead.
// This requires an extra .env to be placed inside "/client" folder.
const group: string = "api/v1/";
const url: string = "https://organius.jinwei.dev/";

export const API_URL = url + group;

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
});
const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
    const authStatus: AuthInterface = ParseJWT();
    const [auth, setAuth] = useState<AuthInterface>(authStatus);

    return <AuthContext.Provider value={{ auth, setAuth, axiosInstance }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
