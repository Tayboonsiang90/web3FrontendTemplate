/* IMPORTING DEPENDENCIES
 */
// React Imports
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect } from "react";
// Styling
import "./App.css"; // Global Styling
import logo from "./media/logo.jpg"; // Innovation Team Logo
// Pages import for <Link></Link> to work
import Link1 from "./pages/Link1";
import Link2 from "./pages/Link2";
import Home from "./pages/Home";
// Contexts Import
import { useGlobalContext } from "./contexts/globalProvider";
// Web3 Import
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

/* ENVIRONMENT VARIABLES (EXPOSED)
 */
const apiKey = "O2R9-YptcrXeygM_lYXcmBcnQvlxnUtB"; // Alchemy API Key
const voteTokenERC20Address = "0x257D9Cf29c6f26806c94794a7F39Ee3c28cD28e7"; // ERC20 Vote Token Address

/* STANDARD FUNCTIONS
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/* REACT APP
 */
function App() {
    // Initialize an alchemy-web3 instance:
    const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${apiKey}`);

    // Global Contexts Extraction
    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    // Component Did Mount (Runs once on mounting)
    useEffect(() => {
        metamaskSetupOperations();
    }, []);

    // Checks if metamask is installed and checks if wallet is connected
    const metamaskSetupOperations = async () => {
        try {
            // The metamask provider object
            const { ethereum } = window;

            if (!ethereum) {
                // If metamask is not installed
                setMetamaskExistCheck(false);
                console.log("Metamask is not installed on this user's computer!");
            } else {
                // If metamask is installed
                console.log("Metamask is installed on this user's computer!");
                // Loading the current chainID
                await updateChainId(ethereum);
                // Loading the current connected account
                await updateConnectedAccount(ethereum);
                // Switch network to Rinkeby if it is not
                await switchToRinkebyNetwork();

                // Loading onEvent handlers for metamask
                console.log("Loading onEvent handlers...");
                window.ethereum.on("chainChanged", async () => {
                    await updateChainId(ethereum);
                    await updateConnectedAccount(ethereum);
                });
                window.ethereum.on("accountsChanged", async () => {
                    await updateConnectedAccount(ethereum);
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Function to update Chain Id state to current
    const updateChainId = async (ethereum) => {
        console.log("Checking ChainID and updating");
        await sleep(500);
        const chainId = ethereum.networkVersion;
        console.log("ChainID Found:", chainId);
        await setCurrentChainId(Number(chainId));
    };

    // Function to update current account address and balances of ETH and Vote tokens
    const updateConnectedAccount = async (ethereum) => {
        console.log("Checking connected accounts and updating");
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccountAddress(account);
            checkAddressEthBalance(account);
        } else {
            console.log("No authorized account found");
        }
    };

    // Function written to prompt user to connect his metamask wallet
    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Metamask is not installed! Please install it. ");
                return;
            }

            // Connect wallet request
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            // Switch network request
            await switchToRinkebyNetwork();

            console.log("Connected", accounts[0]);
            setCurrentAccountAddress(accounts[0]);
            checkAddressEthBalance(accounts[0]);
        } catch (error) {
            if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                alert("You have declined the wallet connection. Please try again. ");
            } else {
                console.error(error);
            }
        }
    };

    // Function written to switch networks to Rinkeby if the user isn't on the Rinkeby network
    const switchToRinkebyNetwork = async () => {
        try {
            console.log("Changing Network to Rinkeby...");
            if (!window.ethereum) throw new Error("Metamask isn't found!");
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x4" }],
            });
        } catch (err) {
            console.log(err);
        }
    };

    // Function written to update user's eth and vote token balance state for a given address
    const checkAddressEthBalance = async (address) => {
        try {
            console.log("Checking User's Balance");
            if (!window.ethereum) throw new Error("Metamask isn't found!");
            let ethQuantity = await window.ethereum.request({
                method: "eth_getBalance",
                params: [address, "latest"],
            });
            setCurrentAccountEthBal(Number((parseInt(ethQuantity, 16) / 10 ** 18).toFixed(2)));

            const data = await web3.alchemy.getTokenBalances(address, [voteTokenERC20Address]);
            setCurrentAccountVoteBal(Number((data.tokenBalances[0].tokenBalance / 10 ** 18).toFixed(2)));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Router>
            {/* Navbar  */}
            <nav className="navbar navbar-expand-lg bg-dark mb-3">
                <div className="container-fluid">
                    {/* Logo  */}
                    <img className="me-3" src={logo} alt="Logo" style={{ width: "20vh" }} />
                    {/* Dropdown Button  */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    {/* Expandable NavLinks  */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item pe-4 text-center">
                                <Link className="nav-link font-gold-big" to="/">
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item pe-4 text-center h3">
                                <Link className="nav-link font-gold-big" to="/Link1">
                                    Link 1
                                </Link>
                            </li>
                            <li className="nav-item pe-4 text-center h3">
                                <Link className="nav-link font-gold-big" to="/Link2">
                                    Link 2
                                </Link>
                            </li>
                        </ul>
                        {currentAccountAddress && (
                            <>
                                <div className="nav-item pe-2 d-flex justify-content-center">
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
                                </div>
                                <div className="nav-item d-flex justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg font-alert"
                                        onClick={() => {
                                            setCurrentAccountAddress("");
                                        }}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </>
                        )}
                        {!currentAccountAddress && (
                            <div className="nav-item d-flex justify-content-center">
                                <button type="button" className="btn btn-primary btn-lg font-alert" onClick={connectWallet}>
                                    Connect Wallet
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            {/* Main  */}
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
                                <Link className="nav-link" to="/EthFaucet">
                                    Rinkeby ETH Faucet
                                </Link>
                            </button>
                        </div>
                        <div>You can still continue but you cannot interact with any of the buttons.</div>
                        <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                )}
            </div>
            {/* Informational Modal  */}
            <div className="modal fade" id="home" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Modal title
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">...</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary">
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Routes>
                {/* Home route */}
                <Route path="/" element={<Home />} />

                {/* Link 1 route */}
                <Route path="/Link1" element={<Link1 />} />

                {/* Link 2 route */}
                <Route path="/Link2" element={<Link2 />} />
            </Routes>
        </Router>
    );
}

export default App;
