import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
/* Contexts (Global)
 */
import { MetamaskWalletProvider } from "./contexts/metamaskWalletProvider";
/* Material UI Themeing
 */
import { ThemeProvider } from "@mui/material/styles";
import { phillipTheme } from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <ThemeProvider theme={phillipTheme}>
        <MetamaskWalletProvider>
            <App />
        </MetamaskWalletProvider>
    </ThemeProvider>
);
