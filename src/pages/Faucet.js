import React, { useContext, useState } from "react";
import { AddressContext } from "../App";
import axios from "axios";

const API_URL = "http://localhost:8888/";

export default function Faucet() {
    let currentAccount = useContext(AddressContext);
    const [faucetFlag, setFaucetFlag] = useState(false);

    const claimFaucet = async () => {
        setFaucetFlag(true);
        console.log("This shit returns.");
        await axios.post(API_URL + "faucet", { address: currentAccount });
        console.log("This shit never returns.")
        setFaucetFlag(false);
    };

    return (
        <React.Fragment>
            <div className="container mt-5">
                <h1>This is a Rinkeby ETH faucet. Get your free Testnet ETH and VOTE tokens here!</h1>
                <div className="row">
                    <div className="col borderDark">
                        <h1></h1>
                    </div>
                    <div className="col borderDark">
                        <h1></h1>
                    </div>
                </div>
                <button type="button" className="btn btn-primary btn-lg" onClick={claimFaucet}>
                    {faucetFlag ? "Please Wait..." : "Get Rinkeby ETH + 100 VOTE Tokens"}
                </button>
            </div>
        </React.Fragment>
    );
}
