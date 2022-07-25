// This is a global context that can be used to share state variables across all pages
import React, { useContext, useState } from "react";
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

const MetamaskWalletContext = React.createContext();

// For subpages that require the context to use
export function useMetamaskWalletContext() {
    return useContext(MetamaskWalletContext);
}

// For app.js to use
export function MetamaskWalletProvider({ children }) {
    // Initialize an alchemy-web3 instance:
    const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${apiKey}`);

    // State variables
    const [currentAccountAddress, setCurrentAccountAddress] = useState("");
    const [currentAccountEthBal, setCurrentAccountEthBal] = useState(0);
    const [currentAccountVoteBal, setCurrentAccountVoteBal] = useState(0);
    const [metamaskExistCheck, setMetamaskExistCheck] = useState(true);
    const [currentChainId, setCurrentChainId] = useState(0);

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
        <MetamaskWalletContext.Provider
            value={{
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
            }}
        >
            {children}
        </MetamaskWalletContext.Provider>
    );
}
