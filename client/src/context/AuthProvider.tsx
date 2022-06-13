import React, { createContext, useState } from "react";
import { getCookie } from "../functions/cookies";

interface AuthInterface {
    user?: string;
    loggedIn: boolean;
}

interface IAuthContext {
    auth: AuthInterface;
    setAuth: React.Dispatch<React.SetStateAction<AuthInterface>>;
}

// Gets information from JWT and returns an AuthInterface.
// Used for maintaining logged in status across refresh.
const ParseJWT = (): AuthInterface => {
    const jwt: string | undefined = getCookie("jwt");

    const user: AuthInterface = {
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

        user.user = payload.name;
        user.loggedIn = true;
        return user;
    } catch {
        return user;
    }
};

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
    const authStatus: AuthInterface = ParseJWT();
    const [auth, setAuth] = useState<AuthInterface>(authStatus);

    return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
