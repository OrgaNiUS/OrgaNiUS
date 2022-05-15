import "./App.css";
import Page404 from "./components/Page404";
import React from "react";
import User from "./components/User";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>This is the main page.</div>} />
        <Route path="/projects" element={<div>This is the projects page.</div>} />
        <Route path="/settings" element={<div>This is the settings page.</div>} />
        <Route path="/user/:username" element={<User />} />
        {/* catch all path send to Page404 */}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
