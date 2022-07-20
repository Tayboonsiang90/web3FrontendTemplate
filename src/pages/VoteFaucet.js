import React, { useState } from "react";
import { useGlobalContext } from "../contexts/globalProvider";
import abi from "../utils/VoteToken.json";
import { ethers } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

// // Environment Variables
// Replace with your API Key
const apiKey = "O2R9-YptcrXeygM_lYXcmBcnQvlxnUtB";
// Replace with address of Vote Token
const contractAddress = "0x257D9Cf29c6f26806c94794a7F39Ee3c28cD28e7";
const contractABI = abi;

// Standard sleep function
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function VoteFaucet() {
    const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${apiKey}`);

    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    const [faucetFlag, setFaucetFlag] = useState(false);
    const [txId, setTxId] = useState("");

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

            const data = await web3.alchemy.getTokenBalances(address, [contractAddress]);
            setCurrentAccountVoteBal(Number((data.tokenBalances[0].tokenBalance / 10 ** 18).toFixed(2)));
        } catch (err) {
            console.log(err);
        }
    };

    const claimFaucet = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                setFaucetFlag(true);
                console.log("Claiming VOTE Faucet... ");

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const voteTokenContract = new ethers.Contract(contractAddress, contractABI, signer);

                let claimOwnTxn = await voteTokenContract.claimOwn();
                console.log(claimOwnTxn.hash);
                setTxId(claimOwnTxn.hash);

                await sleep(10000);

                checkAddressEthBalance(currentAccountAddress);

                setFaucetFlag(false);
            } else {
                alert("Metamask is not installed! Please install it. ");
                setFaucetFlag(false);
            }
        } catch (e) {
            alert(e["message"]);
        }
    };

    return (
        <React.Fragment>
            <div className="container mt-5">
                <h1 className="font-gold font-big">Have no voting power? Get 100 free VOTE tokens here!</h1>
                <h3>VOTE token represents your voting power. They can be traded, transferred, delegated. </h3>
                {currentAccountVoteBal == 0 && (
                    <button type="button" className="btn btn-primary btn-lg" onClick={claimFaucet}>
                        {faucetFlag ? "Please Wait..." : "Get 100 VOTE Tokens"}
                    </button>
                )}
                {currentAccountVoteBal > 0 && (
                    <button type="button" className="btn btn-primary btn-lg" disabled>
                        You are not eligible to claim - you already have vote tokens.
                    </button>
                )}
                {txId && (
                    <div>
                        100 VOTE has been sent to your connected wallet.{" "}
                        <a href={"https://rinkeby.etherscan.io/tx/" + txId} target="_blank" rel="noreferrer">
                            {txId}
                        </a>
                    </div>
                )}
                <div className="mt-5">
                    <h1 className="font-gold font-big">Want more voting power?</h1>
                    <a href="https://app.uniswap.org/#/swap?chain=rinkeby&inputCurrency=ETH&outputCurrency=0x257D9Cf29c6f26806c94794a7F39Ee3c28cD28e7" target="_blank" rel="noreferrer">
                        <button className="btn btn-secondary btn-lg">Buy more VOTE tokens with your Rinkeby ETH.</button>
                    </a>
                </div>
            </div>
        </React.Fragment>
    );
}
