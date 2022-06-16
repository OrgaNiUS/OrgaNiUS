import "./App.css";
import {
    ForgotPwd,
    Homepage,
    Login,
    Navbar,
    Page404,
    PageDoesNotExist,
    Projects,
    Registration,
    Settings,
    UnauthorisedAccess,
    User,
} from "./index";
import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import AuthContext from "./context/AuthProvider";
import axios from "./api/axios";

function App() {
    const auth = useContext(AuthContext);

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
