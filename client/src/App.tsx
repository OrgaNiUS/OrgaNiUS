import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { UserRefreshJWT } from "./api/UserAPI";
import "./App.css";
import Navbar from "./components/Navbar";
import PreLoader from "./components/PreLoader";
import AuthContext from "./context/AuthProvider";
import { DataProvider } from "./context/DataProvider";
import PageDoesNotExist from "./pages/ErrorPages/PageDoesNotExist";
import UnauthorisedAccess from "./pages/ErrorPages/UnauthorisedAccess";
import ForgotPwd from "./pages/ForgotPwd";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Project from "./pages/Project";
import ProjectCreate from "./pages/ProjectCreate";
import Projects from "./pages/Projects";
import Registration from "./pages/Registration";
import Settings from "./pages/Settings";
import User from "./pages/User";

// JWT refresh time.
const refreshTime: number = 1000 * 60 * 9.5;

function App() {
    const auth = useContext(AuthContext);

    useEffect(() => {
        // refresh JWT every 9.5 minutes (the actual expiration time is 10 minutes, but we refresh slightly earlier)
        // https://stackoverflow.com/a/65049865
        const interval = setInterval(() => {
            if (auth.auth.loggedIn) {
                // refresh JWT only if logged in
                UserRefreshJWT(auth.axiosInstance, undefined, (err) => console.log(err));
            }
        }, refreshTime);

        return () => clearInterval(interval);
    }, [auth.axiosInstance, auth.auth.loggedIn]);

    return !auth.auth.loggedIn ? (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/forgot_pwd" element={<ForgotPwd />} />
            <Route path="/project_create" element={<UnauthorisedAccess />} />
            <Route path="/projects" element={<UnauthorisedAccess />} />
            <Route path="/project/:id" element={<UnauthorisedAccess />} />
            <Route path="/settings" element={<UnauthorisedAccess />} />
            <Route path="/user/:username" element={<UnauthorisedAccess />} />
            <Route path="*" element={<PageDoesNotExist />} />
        </Routes>
    ) : (
        <DataProvider>
            <>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/project_create" element={<ProjectCreate />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/project/:id" element={<Project />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/user/:username" element={<User />} />
                    <Route path="*" element={<PageDoesNotExist />} />
                </Routes>
            </>
        </DataProvider>
    );
}

export default App;
