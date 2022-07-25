// React Imports
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect } from "react";
import logo from "../media/logo.jpg"; // Innovation Team Logo
// MUI Imports
import { AppBar, Box, Button, Toolbar, IconButton } from "@mui/material"; // For the Navbar
import MenuIcon from "@mui/icons-material/Menu"; // For the Navbar
import { Drawer, CssBaseline, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"; // For the Sidebar
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
// Contexts Import
import { useMetamaskWalletContext } from "../contexts/metamaskWalletProvider";
// Web3 Import
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

/* ENVIRONMENT VARIABLES (EXPOSED)
 */
const apiKey = "O2R9-YptcrXeygM_lYXcmBcnQvlxnUtB"; // Alchemy API Key
const voteTokenERC20Address = "0x257D9Cf29c6f26806c94794a7F39Ee3c28cD28e7"; // ERC20 Vote Token Address
const drawerWidth = 240; // Width of Drawer, MUI

/* STANDARD FUNCTIONS
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function NavBar() {
    // Initialize an alchemy-web3 instance:
    const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${apiKey}`);

    // Global Contexts Extraction
    let {
        metamaskSetupOperations,
        updateChainId,
        updateConnectedAccount,
        connectWallet,
        switchToRinkebyNetwork,
        checkAddressEthBalance,
        currentAccountAddress,
        metamaskExistCheck,
        currentChainId,
        currentAccountEthBal,
        currentAccountVoteBal,
        setCurrentAccountAddress,
        setMetamaskExistCheck,
        setCurrentChainId,
        setCurrentAccountEthBal,
        setCurrentAccountVoteBal,
    } = useMetamaskWalletContext();

    // Component Did Mount (Runs once on mounting)
    useEffect(() => {
        metamaskSetupOperations();
    }, []);

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", mt:1, mb:1 }}>
                {/* Logo and App Name  */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img className="me-5" src={logo} alt="Logo" style={{ width: "25vh" }} />
                    <Typography variant="h2">
                        App Name
                    </Typography>
                </Box>
                {/* Metamask Address Connection */}
                {currentAccountAddress && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "center", pr: 3 }}>
                            <div className="text-white text-end font-alert">
                                <div>
                                    Connected to{" "}
                                    <a href={"https://rinkeby.etherscan.io/address/" + currentAccountAddress} target="_blank" rel="noreferrer">
                                        {currentAccountAddress}
                                    </a>
                                </div>
                                <div>
                                    <i className="fa-brands fa-ethereum"></i> ETH Balance: {currentAccountEthBal}
                                </div>
                                <div>
                                    <i className="fa-solid fa-coins"></i> Vote Token Balance: {currentAccountVoteBal}
                                </div>
                            </div>
                        </Box>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => {
                                setCurrentAccountAddress("");
                            }}
                        >
                            Disconnect
                        </Button>
                    </Box>
                )}
                {!currentAccountAddress && (
                    <Button variant="contained" color="secondary" onClick={connectWallet}>
                        Connect Wallet
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}
