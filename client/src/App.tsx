import "./App.css";

import React, {useContext} from "react";
import {Route, Routes} from "react-router-dom";
import AuthContext from "./context/AuthProvider";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import ForgotPwd from "./pages/ForgotPwd";
import UnauthorisedAccess from "./pages/ErrorPages/UnauthorisedAccess";
import PageDoesNotExist from "./pages/ErrorPages/PageDoesNotExist";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import User from "./pages/User";
import Page404 from "./pages/ErrorPages/Page404";

function App() {
    const auth = useContext(AuthContext);

    return !auth.auth.loggedIn ? (<Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/registration" element={<Registration/>}/>
            <Route path="/forgot_pwd" element={<ForgotPwd/>}/>
            <Route path="/projects" element={<UnauthorisedAccess/>}/>
            <Route path="/settings" element={<UnauthorisedAccess/>}/>
            <Route path="/user/:username" element={<UnauthorisedAccess/>}/>
            <Route path="*" element={<PageDoesNotExist/>}/>
        </Routes>) : (<>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Homepage/>}/>
                <Route path="/projects" element={<Projects/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/user/:username" element={<User/>}/>
                {/* catch all path send to Page404 */}
                <Route path="*" element={<Page404/>}/>
            </Routes>
        </>);
}

export default App;
