import React, { useState, useEffect } from "react";
import axios from "axios";
import { useGlobalContext } from "../contexts/globalProvider";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

// // Environment Variables
// Backend URL
const API_URL = "https://rinkeby-faucet-phillip.herokuapp.com/";
// Replace with your API Key
const apiKey = "O2R9-YptcrXeygM_lYXcmBcnQvlxnUtB";
// Replace with the contract deployer address
const deployerAddress = "0x20022983cDD1DC62Abc6fB880E760d6C7476a249";

export default function EthFaucet() {
    const web3 = createAlchemyWeb3(`https://eth-rinkeby.alchemyapi.io/v2/${apiKey}`);

    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    const [faucetFlag, setFaucetFlag] = useState(false);
    const [txId, setTxId] = useState("");
    const [faucetEthLevel, setFaucetEthLevel] = useState(0);

    // Component Did Mount (Runs once on mounting)
    useEffect(() => {
        checkFaucetEth();
    }, []);

    const claimFaucet = async () => {
        setFaucetFlag(true);
        console.log("Claiming 0.1 ETH for the account", currentAccountAddress);
        let message = await axios.post(API_URL + "ethfaucet", { address: currentAccountAddress });
        setTxId(message.data);
        checkFaucetEth();
        setFaucetFlag(false);
    };

    const checkFaucetEth = async () => {
        console.log("Checking faucet levels for", deployerAddress);
        const data = await web3.eth.getBalance(deployerAddress, "latest");
        setFaucetEthLevel((data/10**18).toFixed(1));
    };

    return (
        <React.Fragment>
            <div className="container mt-5">
                <h1>This is a Rinkeby ETH faucet. Get your free ETH here!</h1>
                <h3>ETH is used to pay for transactions (gas fees).</h3>
                <h4>Current Faucet ETH Level: {faucetEthLevel} ETH</h4>

                <div className="row">
                    <div className="col borderDark">
                        <h1></h1>
                    </div>
                    <div className="col borderDark">
                        <h1></h1>
                    </div>
                </div>
                <button type="button" className="btn btn-primary btn-lg" onClick={claimFaucet}>
                    {faucetFlag ? "Please Wait..." : "Get 0.1 Rinkeby ETH"}
                </button>
                <p>Only take what you need from this faucet!</p>
                {txId && (
                    <div>
                        0.1 ETH has been sent to your connected wallet.{" "}
                        <a href={"https://rinkeby.etherscan.io/tx/" + txId} target="_blank" rel="noreferrer">
                            {txId}
                        </a>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}
