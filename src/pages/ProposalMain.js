import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/VoteToken.json";

export default function ProposalMain() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([]);

    const contractAddress = "0x58d8f7752F91104C966028bFE8eBbb55197d4957";

    const contractABI = abi.abi;

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                /*
                 * Call the getAllWaves method from your Smart Contract
                 */
                const waves = await wavePortalContract.getAllWaves();

                /*
                 * We only need address, timestamp, and message in our UI so let's
                 * pick those out
                 */
                let wavesCleaned = [];
                waves.forEach((wave) => {
                    wavesCleaned.push({
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message,
                    });
                });

                /*
                 * Store our data in React State
                 */
                setAllWaves(wavesCleaned);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object");
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

            getAllWaves();
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };

    /*
     * This runs our function when the page loads.
     */
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                // Free Function
                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                const waveTxn = await wavePortalContract.wave("this is a message");
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container">
            <h1>Claim your NFT here</h1>
            <button type="button" className="btn btn-primary btn-lg me-5">
                NFT Claim
            </button>
            <button type="button" className="btn btn-primary btn-lg">
                View your NFT on Opensea
            </button>
        </div>
    );
}
