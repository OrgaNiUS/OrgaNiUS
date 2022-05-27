import "./App.css";
import {
  Homepage,
  Login,
  Navbar,
  Page404,
  Projects,
  Registration,
  Settings,
  User,
} from "./index";
import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import AuthContext from "./context/AuthProvider";

function App() {
  const auth = useContext(AuthContext);

  return !auth.auth.loggedIn ? (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
    </Routes>
  ) : (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user/:username" element={<User />} />
        {/* catch all path send to Page404 */}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;
