import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../contexts/globalProvider";
import governerContractABI from "../utils/Governor.json";
import { ethers } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";

// // Environment Variables
// Governor Contract
const governorContractAddress = "0x53F2A31357d8D0FE1572c4Bfef95acf76357f717";

export default function Home() {
    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    const [numOfProposal, setNumOfProposal] = useState(0);
    const [proposalList, setProposalList] = useState([]);
    // Component Did Mount (Runs once on mounting)
    useEffect(() => {
        extractDataFromGovernorContract();
    }, []);

    const extractDataFromGovernorContract = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                console.log("Extracting data from the Governor SC... ");
                // Standard technique to load a contract
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const governorContract = new ethers.Contract(governorContractAddress, governerContractABI, signer);

                // Check how many proposals are there live currently
                let numOfProposal = await governorContract.currentProposalId();
                setNumOfProposal(parseInt(numOfProposal));
                console.log("The current number of proposals is", parseInt(numOfProposal));

                let tempState = [];

                // Retrieve the state of all the proposals from the blockchain
                for (let i = 0; i < numOfProposal; i++) {
                    let proposalDetailFull = await governorContract.viewProposalDetails(i);
                    console.log("Downloaded a proposal", proposalDetailFull);
                    let proposalDetail = proposalDetailFull[0];
                    let proposalDetailOptionString = proposalDetailFull[1];
                    let proposalDetailOptionValue = proposalDetailFull[2];
                    let proposalDetailVoterChoice = proposalDetailFull[3];
                    let proposalDetailVoterPower = proposalDetailFull[4];
                    // address author; // Address of Proposer
                    // string title; // Title of Proposal
                    // string description; // Description of Proposal
                    // uint256 createdAt; // Block Height Created
                    // uint256 numOfOptions; // Number of Voting Options
                    // address[] voters; // An array of voters
                    // uint256 totalVotes; // Total Voted
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
                        optionStruct.optionVotePrecentage = ((optionStruct.optionVoteCount * 100) / proposalObjectConstruct.totalVotes).toFixed(0);

                        proposalObjectConstruct.optionStringArray.push(optionStruct);
                    }
                    proposalObjectConstruct.numOfVoters = proposalDetail[5].length;
                    proposalObjectConstruct.voterDetailsArray = [];
                    for (let j = 0; j < proposalObjectConstruct.numOfVoters; j++) {
                        let voterStruct = {};
                        voterStruct.voterAddress = proposalDetail[5][j];
                        voterStruct.voterPower = parseInt(proposalDetailVoterPower[j]) / 10 ** 18;
                        voterStruct.voterChoice = proposalDetailVoterChoice[j];

                        proposalObjectConstruct.voterDetailsArray.push(voterStruct);
                    }
                    console.log(proposalObjectConstruct);
                    tempState.push(proposalObjectConstruct);
                }
                setProposalList(tempState);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const displayProposal = () => {
        let renderResult = [];
        let count = 1;
        for (let proposal of proposalList) {
            console.log(proposal);
            let accordionItem = (
                <div className="accordion-item" key={count}>
                    <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                            #{count}: {proposal.title}
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-12 h1 text-center mb-4">Title: {proposal.title}</div>
                            </div>
                            <div className="row">
                                <div className="col-8">
                                    <div>
                                        <span className="fw-bold">Description:</span> {proposal.description}
                                    </div>
                                    <div>
                                        <span className="fw-bold">Proposer:</span>{" "}
                                        <a href={"https://etherscan.io/address/" + proposal.author} target="_blank" rel="noreferrer">
                                            {proposal.author}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="fw-bold">Block Height:</span> {proposal.createdAtBlock}
                                    </div>
                                    <div>
                                        <span className="fw-bold">Date Time Created:</span>
                                    </div>
                                    <div>
                                        <span className="fw-bold">Date Time Expiring:</span>
                                    </div>
                                    <table className="table border mt-5">
                                        <thead>
                                            <tr>
                                                <th>Address</th>
                                                <th>Voting Power</th>
                                                <th>Choice</th>
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
                                </div>
                                <div className="col-1"></div>
                                <div className="col-3">
                                    <table className="table">
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
                                    <select className="form-select">
                                        <option selected>Please select an option</option>
                                        {proposal.optionStringArray.map((item) => {
                                            return <option value="1">{item.optionName}</option>;
                                        })}
                                    </select>
                                    <div className="mt-2">
                                        <button type="button" className="btn btn-primary btn-lg font-medium">
                                            Vote
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
            count++;
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
