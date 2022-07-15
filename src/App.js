import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./App.css";
import Faucet from "./pages/Faucet";
import Home from "./pages/Home";
import ProposalMain from "./pages/ProposalMain";

function App() {
    const [currentAccount, setCurrentAccount] = useState("");

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            /*
             * Check if we're authorized to access the user's wallet
             */
            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Metamask is not installed! Please install it. ");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Router>
            <nav className="navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse d-flex justify-content-between" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item h1 me-4">
                                <Link className="nav-link" to="/">
                                    Live Voting
                                </Link>
                            </li>
                            <li className="nav-item h1 me-4">
                                <Link className="nav-link" to="/faucet">
                                    Rinkeby ETH Faucet
                                </Link>
                            </li>
                            <li className="nav-item h1 me-4">
                                <Link className="nav-link" to="/proposallist">
                                    NFT Claim
                                </Link>
                            </li>
                        </ul>
                        <div>
                            <span className="me-5">{currentAccount ? "Connected to " + currentAccount : "Not connected to any wallet"}</span>
                            <button type="button" class="btn btn-primary btn-lg" onClick={connectWallet}>
                                {currentAccount ? "Disconnect" : "Connect to Metamask"}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <Routes>
                {/* Home route */}
                <Route path="/" element={<Home />} />

                {/* Faucet route */}
                <Route path="/faucet" element={<Faucet />} />

                {/* Proposal List Main Page route */}
                <Route path="/proposallist" element={<ProposalMain />} />
            </Routes>
        </Router>
    );
}

export default App;
