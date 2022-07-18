import React from "react";
import { useGlobalContext } from "../contexts/globalProvider";

export default function Home() {
    let message = useGlobalContext();

    return (
        <React.Fragment>
            <div className="container">
                {/* Alert telling people about free NFT  */}
                <div className={"alert alert-success alert-dismissible fade show"} role="alert">
                    <div>
                        <strong>Vote in any proposal now for an exclusive NFT! </strong>
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <h1>Survey Question 1: </h1>
                <h2>Out of everything that we have presented, which do you think is the most useful to your department? </h2>
                <select className="form-select form-select-lg mb-3">
                    <option selected>Please choose an option</option>
                    <option value="1">Symphony</option>
                    <option value="2">OTC</option>
                    <option value="3">?????</option>
                </select>
                <button type="button" className="btn btn-primary btn-lg me-5">
                    VOTE
                </button>
                <button type="button" className="btn btn-secondary btn-lg">
                    Claim your reward NFT for voting!
                </button>
                <table className="table mt-5">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Address</th>
                            <th scope="col">Vote</th>
                            <th scope="col">Vote Power</th>
                            <th scope="col">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td>0x20022983cDD1DC62Abc6fB880E760d6C7476a249</td>
                            <td>Symphony</td>
                            <td>100 VOTE</td>
                            <td>33%</td>
                        </tr>
                        <tr>
                            <th scope="row">2</th>
                            <td>0xC4c446e9305EDfFA68a9A1BDB84A9C3b096F2B4D</td>
                            <td>OTC</td>
                            <td>200 VOTE</td>
                            <td>66%</td>
                        </tr>
                        <tr>
                            <th scope="row">3</th>
                            <td>...</td>
                            <td>...</td>
                            <td>...</td>
                            <td>...</td>
                        </tr>
                    </tbody>
                </table>
                <img src="https://s3.amazonaws.com/nettuts/677_google/chartRed.png" alt="new" />
            </div>
        </React.Fragment>
    );
}
