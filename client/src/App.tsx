import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "./api/axios";
import "./App.css";
import Navbar from "./components/Navbar";
import AuthContext from "./context/AuthProvider";
import Page404 from "./pages/ErrorPages/Page404";
import PageDoesNotExist from "./pages/ErrorPages/PageDoesNotExist";
import UnauthorisedAccess from "./pages/ErrorPages/UnauthorisedAccess";
import ForgotPwd from "./pages/ForgotPwd";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Registration from "./pages/Registration";
import Settings from "./pages/Settings";
import User from "./pages/User";

const refreshTime = 1000 * 60 * 9.5;
const refreshJWT = () => {
    const URL = "/api/v1/refresh_jwt";
    axios.get(URL).catch((err) => console.log(err));
};

function App() {
    const auth = useContext(AuthContext);

    useEffect(() => {
        // refresh JWT every 9.5 minutes (the actual expiration time is 10 minutes, but we refresh slightly earlier)
        // https://stackoverflow.com/a/65049865
        const interval = setInterval(() => {
            if (auth.auth.loggedIn) {
                // refresh JWT only if logged in
                refreshJWT();
            }
        }, refreshTime);

        return () => clearInterval(interval);
    }, [auth.auth.loggedIn]);

    return !auth.auth.loggedIn ? (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/forgot_pwd" element={<ForgotPwd />} />
            <Route path="/projects" element={<UnauthorisedAccess />} />
            <Route path="/settings" element={<UnauthorisedAccess />} />
            <Route path="/user/:username" element={<UnauthorisedAccess />} />
            <Route path="*" element={<PageDoesNotExist />} />
        </Routes>
    ) : (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/settings" element={<Settings {...{ axios }} />} />
                <Route path="/user/:username" element={<User />} />
                {/* catch all path send to Page404 */}
                <Route path="*" element={<Page404 />} />
            </Routes>
        </>
    );
}

export default App;
