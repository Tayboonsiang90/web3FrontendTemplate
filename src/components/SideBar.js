/* IMPORTING DEPENDENCIES
 */
// Pages import for <Link></Link> to work
import Link1 from "../pages/Link1";
import Link2 from "../pages/Link2";
import Home from "../pages/Home";
import FAQ from "../pages/FAQ";
// React Imports
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect } from "react";
// MUI Imports
import { AppBar, Box, Button, Toolbar, IconButton } from "@mui/material"; // For the Navbar
import MenuIcon from "@mui/icons-material/Menu"; // For the Navbar
import { Drawer, CssBaseline, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"; // For the Sidebar
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import HomeIcon from "@mui/icons-material/Home";

/* ENVIRONMENT VARIABLES (EXPOSED)
 */
const drawerWidth = 270; // Width of Drawer, MUI

/* STANDARD HELPER FUNCTIONS
 */
function camelize(str) {
    // Converts any string to CamelCase
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

export default function SideBar() {
    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
                }}
            >
                <Toolbar sx={{ mt: 1, mb: 1 }} />
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {["Home", "Link 1", "Link 2"].map((text, index) => (
                            <ListItem key={text} disablePadding>
                                <Link to={"/" + text.replace(/\s+/g, "")}>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <HomeIcon></HomeIcon>
                                        </ListItemIcon>
                                        <ListItemText primary={text} />
                                    </ListItemButton>
                                </Link>
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                    <List>
                        {["FAQ", "Contact Us"].map((text, index) => (
                            <ListItem key={text} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}
