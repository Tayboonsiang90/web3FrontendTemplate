import { createTheme } from "@mui/material/styles";

export const phillipTheme = createTheme({
    palette: {
        type: "dark",
        primary: {
            main: "#003553",
            contrastText: "#ff9900",
        },
        secondary: {
            main: "#ff9900",
            contrastText: "#003553",
        },
        error: {
            main: "#f74b4b",
            contrastText: "#e0e0e0",
        },
        warning: {
            main: "#ffd162",
            contrastText: "#e0e0e0",
        },
        success: {
            main: "#75c237",
            contrastText: "#e0e0e0",
        },
        info: {
            main: "#10a0de",
            contrastText: "#e0e0e0",
        },
        divider: "#e0e0e0",
        background: {
            default: "#202020",
            paper: "#2d2d2d",
        },
        text: {
            primary: "#e0e0e0",
        },
    },
    typography: {
        button: {
            fontFamily: "Source Code Pro",
        },
        body2: {
            fontFamily: "Source Code Pro",
        },
        body1: {
            fontFamily: "Source Code Pro",
        },
        h1: {
            fontFamily: "Tourney",
        },
        h2: {
            fontFamily: "Tourney",
        },
        h3: {
            fontFamily: "Tourney",
        },
    },
});
