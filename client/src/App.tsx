import "./App.css";
import {Homepage, Navbar, Page404, Projects, Settings, Login, User, Registration} from "./index";
import React from "react";
import {Route, Routes} from "react-router-dom";

function App() {

    return (
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/registration" element={<Registration/>}/>
        </Routes>
    );

    // return (
    //     <>
    //         <Navbar/>
    //         <Routes>
    //             <Route path="/" element={<Homepage/>}/>
    //             <Route path="/projects" element={<Projects/>}/>
    //             <Route path="/settings" element={<Settings/>}/>
    //             <Route path="/user/:username" element={<User/>}/>
    //             {/* catch all path send to Page404 */}
    //             <Route path="*" element={<Page404/>}/>
    //         </Routes>
    //     </>
    // )

}

export default App;
