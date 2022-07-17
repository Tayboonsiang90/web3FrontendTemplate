import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GlobalProvider } from "./contexts/globalProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <GlobalProvider>
        <App />
    </GlobalProvider>
);
