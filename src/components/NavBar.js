// React Imports
import React, { useEffect } from "react";
import logo from "../media/logo.jpg"; // Innovation Team Logo
// MUI Imports
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material"; // For the Navbar
// Contexts Import
import { useMetamaskWalletContext } from "../contexts/metamaskWalletProvider";

export default function NavBar() {
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
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", mt: 1, mb: 1 }}>
                {/* Logo and App Name  */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img className="me-5" src={logo} alt="Logo" style={{ width: "25vh" }} />
                    <Typography variant="h2" className="text-nowrap">
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
