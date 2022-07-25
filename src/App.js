/* IMPORTING DEPENDENCIES
 */
// React Imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
// Styling
import "./App.css"; // Global Styling
// MUI Imports
import { Box, Toolbar } from "@mui/material"; // For the Navbar

// Pages import for <Link></Link> to work
import Link1 from "./pages/Link1";
import Link2 from "./pages/Link2";
import Home from "./pages/Home";
import FAQ from "./pages/FAQ";
// Components Import
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";

// Contexts Import
import { useMetamaskWalletContext } from "./contexts/metamaskWalletProvider";

/* REACT APP
 */
function App() {
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

    return (
        <Router>
            <Box sx={{ display: "flex" }}>
                {/* Navbar  */}
                {NavBar()}
                {/* Sidebar */}
                {SideBar()}
                {/* Main Page */}
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar sx={{ mt: 1, mb: 1 }} />
                    <div className="container">
                        {/* Dismissable alert about the state of the user's metamask */}
                        {!metamaskExistCheck && (
                            <div className={"alert alert-danger alert-dismissible fade show"} role="alert">
                                <div>
                                    <strong>Metamask isn't installed in your browser. </strong> You can install it at{" "}
                                    <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                                        https://metamask.io/download/
                                    </a>
                                    .
                                </div>
                                <div>You can still continue but you cannot interact with any of the buttons.</div>
                                <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        )}
                        {/* Dismissable alert switching to Rinkeby Network */}
                        {metamaskExistCheck && currentChainId != 4 && (
                            <div className={"alert alert-danger alert-dismissible fade show"} role="alert">
                                <div>
                                    <strong>You are not on the Rinkeby Test Network. </strong>
                                    <button className="btn btn-primary" onClick={switchToRinkebyNetwork}>
                                        Switch to Rinkeby Network
                                    </button>
                                </div>
                                <div>This app will not work properly if you are not on the right network. </div>
                                <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        )}
                        {/* Dismissable alert about your ETH balance and a reminder to claim from faucet */}
                        {currentChainId == 4 && metamaskExistCheck && !currentAccountEthBal && (
                            <div className={"alert alert-warning alert-dismissible fade show"} role="alert">
                                <div>
                                    <strong>You do not have enough ETH to make transactions. Get some ETH from the faucet! </strong>
                                    <button className="btn btn-primary">
                                        {/* <Link className="nav-link" to="/Link1">
                                            Rinkeby ETH Faucet
                                        </Link> */}
                                    </button>
                                </div>
                                <div>You can still continue but you cannot interact with any of the buttons.</div>
                                <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        )}
                    </div>
                    <Routes>
                        {/* Home route */}
                        <Route path="/" element={<Home />} />

                        {/* Link 1 route */}
                        <Route path="/Link1" element={<Link1 />} />

                        {/* Link 2 route */}
                        <Route path="/Link2" element={<Link2 />} />

                        {/* FAQ route */}
                        <Route path="/FAQ" element={<FAQ />} />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
