import React from "react";

export default function Faucet() {
    return (
        <React.Fragment>
            <div className="container mt-5">
                <h1>This is a Rinkeby ETH faucet. Get your free Testnet ETH and VOTE tokens here!</h1>
                <button type="button" class="btn btn-primary">
                    Get Rinkeby ETH + 100 VOTE Tokens
                </button>
            </div>
        </React.Fragment>
    );
}
