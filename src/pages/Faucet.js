import React, { useState } from "react";
import axios from "axios";
import { useGlobalContext } from "../contexts/globalProvider";

const API_URL = "http://localhost:8888/";

export default function Faucet() {
    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    const [faucetFlag, setFaucetFlag] = useState(false);
    const [txId, setTxId] = useState("");

    const claimFaucet = async () => {
        setFaucetFlag(true);
        console.log("Claiming 0.1 ETH for the account", currentAccountAddress);
        let message = await axios.post(API_URL + "ethfaucet", { address: currentAccountAddress });
        setTxId(message.data);
        setFaucetFlag(false);
    };

    return (
        <React.Fragment>
            <div className="container mt-5">
                <h1>This is a Rinkeby ETH faucet. Get your free Testnet ETH here!</h1>
                <h2>ETH is used to pay for transactions (gas fees).</h2>
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
                {txId && <a href={"https://rinkeby.etherscan.io/tx/" + txId}>Your transaction is complete. </a>}
            </div>
        </React.Fragment>
    );
}
