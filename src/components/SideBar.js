/* IMPORTING DEPENDENCIES
 */
// React Imports
import { Link } from "react-router-dom";
import React from "react";
// MUI Imports
import { Box, Toolbar } from "@mui/material"; // For the Navbar
import { Drawer, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"; // For the Sidebar
import LinkIcon from "@mui/icons-material/Link";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";

/* ENVIRONMENT VARIABLES (EXPOSED)
 */
const drawerWidth = 270; // Width of Drawer, MUI

/* STANDARD HELPER FUNCTIONS
 */

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
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <HomeIcon color="secondary"></HomeIcon>
                                    </ListItemIcon>
                                    <ListItemText>Home</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </Link>
                        <Link to="/Link1" style={{ textDecoration: "none" }}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <LinkIcon color="secondary"></LinkIcon>
                                    </ListItemIcon>
                                    <ListItemText>Link 1</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </Link>
                        <Link to="/Link2" style={{ textDecoration: "none" }}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <LinkIcon color="secondary"></LinkIcon>
                                    </ListItemIcon>
                                    <ListItemText color="text">Link 2</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    </List>
                    <Divider />
                    <List>
                        <Link to="/FAQ" style={{ textDecoration: "none" }}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <LiveHelpIcon color="secondary"></LiveHelpIcon>
                                    </ListItemIcon>
                                    <ListItemText>FAQ</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </Link>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <EmailIcon color="secondary"></EmailIcon>
                                    </ListItemIcon>
                                    <ListItemText>Contact Us</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    </List>
                </Box>
            </Drawer>
        </>
    );
}
