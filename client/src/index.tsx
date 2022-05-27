import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

export { default as Navbar } from "./components/Navbar";
export { default as User } from "./pages/User";
export { default as Page404 } from "./pages/Page404";
export { default as Homepage } from "./pages/Homepage";
export { default as Projects } from "./pages/Projects";
export { default as Settings } from "./pages/Settings";
export { default as Login } from "./pages/Login";
export { default as Registration } from "./pages/Registration";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
