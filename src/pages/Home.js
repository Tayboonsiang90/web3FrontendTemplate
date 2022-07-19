import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../contexts/globalProvider";
import governerContractABI from "../utils/Governor.json";
import { ethers } from "ethers";

// // Environment Variables
// Replace with your API Key
const apiKey = "O2R9-YptcrXeygM_lYXcmBcnQvlxnUtB";
// Governor Contract
const governorContractAddress = "0x53F2A31357d8D0FE1572c4Bfef95acf76357f717";
// Refresh Timing
const MINUTE_MS = 600000;

export default function Home() {
    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    const [proposalList, setProposalList] = useState([]);
    const [proposalOptionSelect, setProposalOptionSelect] = useState([]);
    const [voteFlag, setVoteFlag] = useState(false);
    const [txId, setTxId] = useState("");

    // Component Did Mount (Runs once on mounting)
    useEffect(() => {
        extractDataFromGovernorContract();
        const interval = setInterval(() => {
            console.log("Refreshing data...");
            extractDataFromGovernorContract();
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, []);

    const extractDataFromGovernorContract = async () => {
        try {
            console.log("Extracting data from the Governor SC... ");
            // Standard technique to load a contract
            const provider = new ethers.providers.AlchemyProvider("rinkeby", apiKey);
            const governorContract = new ethers.Contract(governorContractAddress, governerContractABI, provider);

            // Check how many proposals are there live currently
            let numOfProposal = await governorContract.currentProposalId();
            console.log("The current number of proposals is", parseInt(numOfProposal));
            setProposalOptionSelect(new Array(parseInt(numOfProposal)));

            let tempState = new Array(numOfProposal);

            // Retrieve the state of all the proposals from the blockchain
            for (let i = 0; i < numOfProposal; i++) {
                let proposalDetailFull = await governorContract.viewProposalDetails(i);
                console.log("Downloaded a proposal", proposalDetailFull);
                let proposalDetail = proposalDetailFull[0];
                let proposalDetailOptionString = proposalDetailFull[1];
                let proposalDetailOptionValue = proposalDetailFull[2];
                let proposalDetailVoterChoice = proposalDetailFull[3];
                let proposalDetailVoterPower = proposalDetailFull[4];
                let proposalObjectConstruct = {};
                proposalObjectConstruct.author = proposalDetail[0];
                proposalObjectConstruct.title = proposalDetail[1];
                proposalObjectConstruct.description = proposalDetail[2];
                proposalObjectConstruct.createdAtBlock = parseInt(proposalDetail[3]);
                // proposalObjectConstruct.createdAtTime = (await provider.getBlock(proposalObjectConstruct.createdAtBlock)).timestamp;
                proposalObjectConstruct.numOfOptions = parseInt(proposalDetail[4]);
                proposalObjectConstruct.optionStringArray = [];
                proposalObjectConstruct.totalVotes = parseInt(proposalDetail[6]) / 10 ** 18;
                // Iterate through the number of options and find the names
                for (let j = 0; j < proposalObjectConstruct.numOfOptions; j++) {
                    let optionStruct = {};
                    optionStruct.optionName = proposalDetailOptionString[j];
                    optionStruct.optionVoteCount = parseInt(proposalDetailOptionValue[j]) / 10 ** 18;
                    optionStruct.optionVotePrecentage = proposalObjectConstruct.totalVotes ? ((optionStruct.optionVoteCount * 100) / proposalObjectConstruct.totalVotes).toFixed(0) : 0;
                    proposalObjectConstruct.optionStringArray.push(optionStruct);
                }
                proposalObjectConstruct.numOfVoters = proposalDetail[5].length;
                proposalObjectConstruct.voterDetailsArray = [];
                for (let j = 0; j < proposalObjectConstruct.numOfVoters; j++) {
                    let voterStruct = {};
                    voterStruct.voterAddress = proposalDetail[5][j];
                    voterStruct.voterPower = parseInt(proposalDetailVoterPower[j]) / 10 ** 18;
                    voterStruct.voterChoice = parseInt(proposalDetailVoterChoice[j]);

                    proposalObjectConstruct.voterDetailsArray.push(voterStruct);
                }
                tempState[numOfProposal - i - 1] = proposalObjectConstruct;
            }
            setProposalList(tempState);
        } catch (e) {
            console.log(e);
        }
    };

    const voteInGovernor = async (e) => {
        try {
            setVoteFlag(true);
            let proposalId = Number(e.target.getAttribute("data-tag"));
            let optionChoice = proposalOptionSelect[proposalId];
            console.log(`Submitting Option: ${optionChoice}, Proposal:${proposalId}. `);

            const { ethereum } = window;
            if (ethereum) {
                // Standard metamask setup functions
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const governorContract = new ethers.Contract(governorContractAddress, governerContractABI, signer);

                let claimOwnTxn = await governorContract.voteInProposal(proposalId, optionChoice);
                console.log(claimOwnTxn.hash);
                setTxId(claimOwnTxn.hash);

                setVoteFlag(false);
            } else {
                alert("Metamask is not installed! Please install it. ");
            }

            setVoteFlag(false);
        } catch (e) {
            alert(e["message"]);
            setVoteFlag(false);
        }
    };

    // Updating the state of the select boxes
    const updateState = (e) => {
        let proposalId = Number(e.target.getAttribute("data-tag"));
        let optionChoice = Number(e.target.value);
        console.log(`The option ${optionChoice + 1} has been selected for Proposal ${proposalId + 1}. `);
        let tempState = proposalOptionSelect;
        tempState[proposalId] = optionChoice;
        setProposalOptionSelect(tempState);
    };

    const displayProposal = () => {
        let renderResult = [];
        let count = proposalList.length;
        for (let proposal of proposalList) {
            let accordionItem = (
                <div className="accordion-item mb-2" key={count}>
                    <h2 className="accordion-header" id={"headingOne" + count}>
                        <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={"#collapseOne" + count}>
                            Proposal #{count}: {proposal.title}
                        </button>
                    </h2>
                    <div id={"collapseOne" + count} className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-12 h1 text-center mb-4 font-big">{proposal.title}</div>
                            </div>
                            <div className="row">
                                <div className="col-9">
                                    <div>
                                        <span className="fw-bold font-medium">Description:</span> {proposal.description}
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Proposer:</span>{" "}
                                        <a href={"https://etherscan.io/address/" + proposal.author} target="_blank" rel="noreferrer">
                                            {proposal.author}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Block Height:</span> {proposal.createdAtBlock}
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date Time Created:</span>
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date Time Expiring:</span>
                                    </div>
                                    <table className="table border mt-5">
                                        <thead>
                                            <tr>
                                                <th>Address Voted</th>
                                                <th>Voting Power</th>
                                                <th>Choice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {proposal.voterDetailsArray.map((item) => {
                                                return (
                                                    <tr key={item.voterAddress}>
                                                        <td>{item.voterAddress}</td>
                                                        <td>{item.voterPower}</td>
                                                        <td>{proposal.optionStringArray[item.voterChoice].optionName}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-3">
                                    <table className="table border">
                                        <thead>
                                            <tr>
                                                <th>Option</th>
                                                <th>Votes</th>
                                                <th>%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {proposal.optionStringArray.map((item) => {
                                                return (
                                                    <tr key={item.optionName}>
                                                        <td>{item.optionName}</td>
                                                        <td>{item.optionVoteCount}</td>
                                                        <td>{item.optionVotePrecentage}</td>
                                                    </tr>
                                                );
                                            })}
                                            <tr>
                                                <td>Total Votes</td>
                                                <td>{proposal.totalVotes}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <img src="https://lh3.googleusercontent.com/g0Jw-I6-gH2DVCpnl3u8QKZVT_meR9lcJlpyeSZ-MyvwLnyEZvgyrY5frldA8HCv55s=w280" alt="new" />
                                    <select className="form-select" onChange={updateState} value={proposalOptionSelect[count - 1]} data-tag={count - 1}>
                                        <option>Please select an option</option>
                                        {proposal.optionStringArray.map((item, i) => {
                                            return (
                                                <option key={i} value={i}>
                                                    {item.optionName}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="mt-2">
                                        <button type="button" className="btn btn-primary btn-lg font-medium" data-tag={count - 1} onClick={voteInGovernor}>
                                            {voteFlag ? "Please Wait..." : "Vote"}
                                        </button>
                                        <button type="button" className="ms-2 btn btn-success btn-lg font-medium disabled">
                                            Collect NFT!
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            renderResult.push(accordionItem);
            // react key
            count--;
        }
        return renderResult;
    };

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
                <h1 className="mt-5">
                    Proposal List
                    <button type="button" className="ms-5 btn btn-primary btn-lg font-medium">
                        Create a new Proposal
                    </button>
                </h1>

                {/* Accordion containing a list of proposals */}
                <div className="accordion mt-5" id="accordionExample">
                    {displayProposal()}
                </div>
            </div>
        </React.Fragment>
    );
}
