/* IMPORTING DEPENDENCIES
 */
// React Imports
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../contexts/globalProvider";
// Web3 Import
import { ethers } from "ethers";
// ABI Import
import governerContractABI from "../utils/Governor.json";
import minterContractABI from "../utils/NFTMinter.json";
// Dependencies Import
import axios from "axios";

/* ENVIRONMENT VARIABLES (EXPOSED)
 */
const apiKey = "O2R9-YptcrXeygM_lYXcmBcnQvlxnUtB"; // Alchemy API Key
const governorContractAddress = "0x53F2A31357d8D0FE1572c4Bfef95acf76357f717"; // Governor Contract Address
const nftMinterContractAddress = "0x3F14CC30ED2f2c7f35f4172aEa4fb98A3ab52D1A"; // NFT Minter Contract Address
const MINUTE_MS = 60000; // Pull new data Timing (ms)
const API_URL = "https://rinkeby-faucet-phillip.herokuapp.com/"; // Heroku faucet backend

/* STANDARD FUNCTIONS
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/* REACT APP
 */
export default function Home() {
    let { currentAccountAddress, metamaskExistCheck, currentChainId, currentAccountEthBal, currentAccountVoteBal, setCurrentAccountAddress, setMetamaskExistCheck, setCurrentChainId, setCurrentAccountEthBal, setCurrentAccountVoteBal } = useGlobalContext();

    const [activeProposalList, setActiveProposalList] = useState([]); // Stores all proposals data in an array
    const [expiredProposalList, setExpiredProposalList] = useState([]); // Stores all proposals data in an array
    const [proposalOptionSelect, setProposalOptionSelect] = useState([]); // Records the state of the voting choice
    const [voteFlag, setVoteFlag] = useState(false); // Flag to disable butto after tx is sent
    const [voteTxId, setVoteTxId] = useState(""); // State to store txid of Vote
    const [claimFlag, setClaimFlag] = useState(false); // Flag to disable butto after tx is sent
    const [claimTxId, setClaimTxId] = useState(""); // State to store txid of NFT Claim
    const [createFlag, setCreateFlag] = useState(false); // Flag to disable butto after tx is sent
    const [createTxId, setCreateTxId] = useState(""); // State to store txid of NFT Claim

    const [createProposal, setCreateProposal] = useState({
        proposalTitle: "",
        proposalDescription: "",
        proposalOptions: "",
        proposalNumOfOptions: "",
    }); // State to store creation of proposal

    // Component Did Mount (Runs once on mounting)
    useEffect(() => {
        extractDataFromGovernorContract();
        // To wake up the heroku backend
        axios.get(API_URL);

        // A (MINUTE_MS) timed function to retrieve new data from the contract
        const interval = setInterval(() => {
            console.log("Refreshing data...");
            extractDataFromGovernorContract();
        }, MINUTE_MS);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, []);

    // Function that extracts current data from the Governor Smart Contract and stores in the state
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

            let tempActiveState = [];
            let tempExpiredState = [];

            // Retrieve the state of all the proposals from the blockchain
            for (let i = 0; i < numOfProposal; i++) {
                let proposalObjectConstruct = {}; //the struct to store proposal
                let proposalDetailFull = await governorContract.viewProposalDetails(i);
                console.log("Downloaded a proposal", proposalDetailFull);
                let proposalDetail = proposalDetailFull[0];
                // Get the block time first to see if it has expired or not
                proposalObjectConstruct.datetimeCreated = new Date(parseInt(proposalDetail[3]) * 1000);
                proposalObjectConstruct.datetimeExpire = new Date(parseInt(proposalDetail[3]) * 1000 + 86400000);
                //
                let proposalDetailOptionString = proposalDetailFull[1];
                let proposalDetailOptionValue = proposalDetailFull[2];
                let proposalDetailVoterChoice = proposalDetailFull[3];
                let proposalDetailVoterPower = proposalDetailFull[4];

                proposalObjectConstruct.author = proposalDetail[0];
                proposalObjectConstruct.title = proposalDetail[1];
                proposalObjectConstruct.description = proposalDetail[2];
                proposalObjectConstruct.numOfOptions = parseInt(proposalDetail[4]);
                proposalObjectConstruct.optionStringArray = [];
                proposalObjectConstruct.totalVotes = (parseInt(proposalDetail[6]) / 10 ** 18).toFixed(2);
                // Iterate through the number of options and find the names
                for (let j = 0; j < proposalObjectConstruct.numOfOptions; j++) {
                    let optionStruct = {};
                    optionStruct.optionName = proposalDetailOptionString[j];
                    optionStruct.optionVoteCount = (parseInt(proposalDetailOptionValue[j]) / 10 ** 18).toFixed(2);
                    optionStruct.optionVotePrecentage = proposalObjectConstruct.totalVotes ? ((optionStruct.optionVoteCount * 100) / proposalObjectConstruct.totalVotes).toFixed(0) : 0;
                    proposalObjectConstruct.optionStringArray.push(optionStruct);
                }
                proposalObjectConstruct.numOfVoters = proposalDetail[5].length;
                proposalObjectConstruct.voterDetailsArray = [];
                for (let j = 0; j < proposalObjectConstruct.numOfVoters; j++) {
                    let voterStruct = {};
                    voterStruct.voterAddress = proposalDetail[5][j];
                    voterStruct.voterPower = (parseInt(proposalDetailVoterPower[j]) / 10 ** 18).toFixed(2);
                    voterStruct.voterChoice = parseInt(proposalDetailVoterChoice[j]);

                    proposalObjectConstruct.voterDetailsArray.push(voterStruct);
                }

                // If a proposal is active, push it to the active list
                if (parseInt(proposalDetail[3]) * 1000 + 86400000 > Date.now()) {
                    tempActiveState.push(proposalObjectConstruct);
                } else {
                    tempExpiredState.push(proposalObjectConstruct);
                }
            }
            setActiveProposalList(tempActiveState);
            setExpiredProposalList(tempExpiredState);
        } catch (e) {
            console.log(e);
        }
    };

    // Function that sends the vote recorded in the state to the Governor Smart Contract
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
                setVoteTxId(claimOwnTxn.hash);

                extractDataFromGovernorContract();

                // Wait 5 seconds then update again
                await sleep(5000);
                extractDataFromGovernorContract();

                // Wait 10 seconds then update again
                await sleep(10000);
                extractDataFromGovernorContract();

                // Wait 15 seconds then update again
                await sleep(15000);
                extractDataFromGovernorContract();

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

    // Function that mints an NFT from the NFT Minter contract
    const claimNFT = async () => {
        try {
            setClaimFlag(true);
            console.log(`Claiming NFT... `);

            const { ethereum } = window;
            if (ethereum) {
                // Standard metamask setup functions
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const nftMinterContract = new ethers.Contract(nftMinterContractAddress, minterContractABI, signer);

                let claimOwnTxn = await nftMinterContract.mintNFT();
                console.log(claimOwnTxn.hash);
                setClaimTxId(claimOwnTxn.hash);

                extractDataFromGovernorContract();

                // Wait 5 seconds then update again
                await sleep(5000);
                extractDataFromGovernorContract();

                // Wait 10 seconds then update again
                await sleep(10000);
                extractDataFromGovernorContract();

                setClaimFlag(false);
            } else {
                alert("Metamask is not installed! Please install it. ");
            }

            setClaimFlag(false);
        } catch (e) {
            alert(e["message"]);
            setClaimFlag(false);
        }
    };

    const createNewProposal = async () => {
        try {
            setCreateFlag(true);
            console.log(`Creating new proposal with the options `, createProposal.proposalTitle, createProposal.proposalDescription, JSON.parse(createProposal.proposalOptions), createProposal.proposalNumOfOptions);

            const { ethereum } = window;
            if (ethereum) {
                // Standard metamask setup functions
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const governorContract = new ethers.Contract(governorContractAddress, governerContractABI, signer);

                let createProposalTxn = await governorContract.createProposal(createProposal.proposalTitle, createProposal.proposalDescription, JSON.parse(createProposal.proposalOptions), createProposal.proposalNumOfOptions);
                console.log(createProposalTxn.hash);
                setCreateTxId(createProposalTxn.hash);

                // Wait 5 seconds then update again
                await sleep(5000);
                extractDataFromGovernorContract();

                // Wait 10 seconds then update again
                await sleep(10000);
                extractDataFromGovernorContract();

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

    /* REACT STATE CHANGE STUFF
     */
    // Updating the state of the select boxes for voting choice
    const updateStateSelectBox = (e) => {
        let proposalId = Number(e.target.getAttribute("data-tag"));
        let optionChoice = Number(e.target.value);
        console.log(`The option ${optionChoice + 1} has been selected for Proposal ${proposalId + 1}. `);
        let tempState = proposalOptionSelect;
        tempState[proposalId] = optionChoice;
        setProposalOptionSelect(tempState);
    };
    // Update the state of any event (String)
    const updateCreateProposalStateString = (e) => {
        setCreateProposal({
            ...createProposal,
            [e.target.name]: e.target.value,
        });
    };
    // Update the state of any event (Number)
    const updateCreateProposalStateNumber = (e) => {
        setCreateProposal({
            ...createProposal,
            [e.target.name]: Number(e.target.value),
        });
    };

    /* REACT RENDERING STUFF
     */
    // React rendering for Proposal Accordions
    const displayActiveProposal = () => {
        let renderResult = [];
        let count = activeProposalList.length + expiredProposalList.length;
        for (let i = count; i > expiredProposalList.length; i--) {
            let proposal = activeProposalList[i - 1 - expiredProposalList.length];
            let accordionItem = (
                <div className="accordion-item mb-2" key={count}>
                    <h2 className="accordion-header" id={"headingOne" + count}>
                        <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={"#collapseOneActive" + count}>
                            Proposal #{count}: {proposal.title}
                        </button>
                    </h2>
                    <div id={"collapseOneActive" + count} className={"accordion-collapse collapse "} data-bs-parent="#accordionActive">
                        <div className="accordion-body bg-light">
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
                                        <a href={"https://rinkeby.etherscan.io/address/" + proposal.author} target="_blank" rel="noreferrer">
                                            {proposal.author}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date/Time Submitted:</span> {proposal.datetimeCreated.toString()}
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date/Time Expiring:</span> {proposal.datetimeExpire.toString()}
                                    </div>
                                    {/* <div>
                                        <span className="fw-bold font-medium">Date Time Created:</span>
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date Time Expiring:</span>
                                    </div> */}
                                    <table className="table border mt-5 border-dark">
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
                                                        <td>
                                                            <a href={"https://rinkeby.etherscan.io/address/" + item.voterAddress} target="_blank" rel="noreferrer">
                                                                {item.voterAddress}
                                                            </a>
                                                        </td>
                                                        <td>{item.voterPower}</td>
                                                        <td>{proposal.optionStringArray[item.voterChoice].optionName}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-3">
                                    <table className="table border border-dark">
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
                                                <td className="fw-bold">Total Votes</td>
                                                <td className="fw-bold">{proposal.totalVotes}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {/* <img src="https://lh3.googleusercontent.com/g0Jw-I6-gH2DVCpnl3u8QKZVT_meR9lcJlpyeSZ-MyvwLnyEZvgyrY5frldA8HCv55s=w280" alt="new" /> */}
                                    <select className="form-select border border-danger mt-4" onChange={updateStateSelectBox} value={proposalOptionSelect[count - 1]} data-tag={count - 1}>
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
                                        <button type="button" className={`ms-2 btn btn-success btn-lg font-medium" + ${voteTxId ? "" : " disabled"}`} onClick={claimNFT}>
                                            {claimFlag ? "Please Wait..." : "Collect NFT!"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {voteTxId && (
                                    <div className="col-12">
                                        Your vote is successful.
                                        <a href={"https://rinkeby.etherscan.io/tx/" + voteTxId} target="_blank" rel="noreferrer">
                                            {voteTxId}
                                        </a>
                                    </div>
                                )}
                                {claimTxId && (
                                    <div className="col-12">
                                        Your NFT claim is successful! Congratz!
                                        <div>
                                            <a href={"https://rinkeby.etherscan.io/tx/" + claimTxId} target="_blank" rel="noreferrer">
                                                {claimTxId}
                                            </a>
                                        </div>
                                        <div>
                                            <a href={"https://testnets.opensea.io/" + currentAccountAddress} target="_blank" rel="noreferrer">
                                                View your NFT here!
                                            </a>
                                        </div>
                                    </div>
                                )}
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

    const displayExpiredProposal = () => {
        let renderResult = [];
        let count = expiredProposalList.length;
        for (let i = count; i > 0; i--) {
            let proposal = expiredProposalList[i - 1];
            let accordionItem = (
                <div className="accordion-item mb-2" key={count}>
                    <h2 className="accordion-header" id={"headingOne" + count}>
                        <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={"#collapseOne" + count}>
                            Proposal #{count}: {proposal.title}
                        </button>
                    </h2>
                    <div id={"collapseOne" + count} className={"accordion-collapse collapse "} data-bs-parent="#accordionExample">
                        <div className="accordion-body bg-light">
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
                                        <a href={"https://rinkeby.etherscan.io/address/" + proposal.author} target="_blank" rel="noreferrer">
                                            {proposal.author}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date/Time Submitted:</span> {proposal.datetimeCreated.toString()}
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date/Time Expiring:</span> {proposal.datetimeExpire.toString()}
                                    </div>
                                    {/* <div>
                                        <span className="fw-bold font-medium">Date Time Created:</span>
                                    </div>
                                    <div>
                                        <span className="fw-bold font-medium">Date Time Expiring:</span>
                                    </div> */}
                                    <table className="table border mt-5 border-dark">
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
                                                        <td>
                                                            <a href={"https://rinkeby.etherscan.io/address/" + item.voterAddress} target="_blank" rel="noreferrer">
                                                                {item.voterAddress}
                                                            </a>
                                                        </td>
                                                        <td>{item.voterPower}</td>
                                                        <td>{proposal.optionStringArray[item.voterChoice].optionName}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-3">
                                    <table className="table border border-dark">
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
                                                <td className="fw-bold">Total Votes</td>
                                                <td className="fw-bold">{proposal.totalVotes}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {/* <img src="https://lh3.googleusercontent.com/g0Jw-I6-gH2DVCpnl3u8QKZVT_meR9lcJlpyeSZ-MyvwLnyEZvgyrY5frldA8HCv55s=w280" alt="new" /> */}
                                    <select className="form-select border border-danger mt-4" onChange={updateStateSelectBox} value={proposalOptionSelect[count - 1]} data-tag={count - 1}>
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
                                        <button type="button" className="btn btn-primary btn-lg font-medium" disabled>
                                            Expired
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {voteTxId && (
                                    <div className="col-12">
                                        Your vote is successful.
                                        <a href={"https://rinkeby.etherscan.io/tx/" + voteTxId} target="_blank" rel="noreferrer">
                                            {voteTxId}
                                        </a>
                                    </div>
                                )}
                                {claimTxId && (
                                    <div className="col-12">
                                        Your NFT claim is successful! Congratz!
                                        <div>
                                            <a href={"https://rinkeby.etherscan.io/tx/" + claimTxId} target="_blank" rel="noreferrer">
                                                {claimTxId}
                                            </a>
                                        </div>
                                        <div>
                                            <a href={"https://testnets.opensea.io/" + currentAccountAddress} target="_blank" rel="noreferrer">
                                                View your NFT here!
                                            </a>
                                        </div>
                                    </div>
                                )}
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

    // React Rendering
    return (
        <React.Fragment>
            <div className="container d-flex flex-column align-items-center">
                {/* Alert telling people about free NFT  */}
                <div className={"alert alert-success alert-dismissible fade show"} role="alert">
                    <div>
                        <strong>Vote in any proposal now for an exclusive NFT! </strong>
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <div class="accordion accordion-flush w-50 border border-5" id="accordionFaq">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="flush-heading">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse" aria-expanded="false" aria-controls="flush-collapse">
                                <b className="font-gold">Frequently Asked Questions (FAQ)</b>
                            </button>
                        </h2>
                        <div id="flush-collapse" class="accordion-collapse collapse" aria-labelledby="flush-heading" data-bs-parent="#accordionFaq">
                            <div class="accordion-body">
                                <div className="accordion accordion-flush border" id="accordionFlushExample">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-headingOne">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne">
                                                1. What is Metamask?
                                            </button>
                                        </h2>
                                        <div id="flush-collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                            <div className="accordion-body">
                                                <a href="https://metamask.io/" target="_blank" rel="noreferrer">
                                                    Metamask
                                                </a>{" "}
                                                is the most widely used crypto wallet to interact with your Ethereum account. Use this{" "}
                                                <a href="https://drive.google.com/file/d/1-B5Tji0XZbZcp3KqoWnoaATXv6wL4VCG/view?usp=sharing" target="_blank" rel="noreferrer">
                                                    guide
                                                </a>{" "}
                                                to install Metamask.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-headingTwo">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo">
                                                2. What is ETH?
                                            </button>
                                        </h2>
                                        <div id="flush-collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                            <div className="accordion-body">
                                                You need ETH to make transactions on the blockchain. You can claim some ETH free{" "}
                                                <a href="https://tangerine-yeot-9ac935.netlify.app/EthFaucet" target="_blank" rel="noreferrer">
                                                    here
                                                </a>
                                                .
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-headingThree">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree">
                                                3. What is VOTE?
                                            </button>
                                        </h2>
                                        <div id="flush-collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                            <div className="accordion-body">VOTE is a token used to represent 1 voting power on the blockchain.</div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-headingFour">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseFour">
                                                4. How to get VOTE?
                                            </button>
                                        </h2>
                                        <div id="flush-collapseFour" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                            <div className="accordion-body">
                                                You can claim 100 VOTE free once{" "}
                                                <a href="https://tangerine-yeot-9ac935.netlify.app/VoteFaucet" target="_blank" rel="noreferrer">
                                                    here
                                                </a>
                                                , or buy{" "}
                                                <a href="https://app.uniswap.org/#/swap?chain=rinkeby&inputCurrency=ETH&outputCurrency=0x257D9Cf29c6f26806c94794a7F39Ee3c28cD28e7" target="_blank" rel="noreferrer">
                                                    here
                                                </a>
                                                .
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-headingFive">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseFive">
                                                5. Other questions?
                                            </button>
                                        </h2>
                                        <div id="flush-collapseFive" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                            <div className="accordion-body">Reach out to taybs@phillip.com.sg (Tay Boon Siang) via Teams messages. I'll be happy to help you get your first NFT!</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <h1 className="mt-5">
                    Active Proposal List
                    <button type="button" className="ms-5 btn btn-success btn-lg font-medium" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        Create a new Proposal
                    </button>
                </h1>
                {/* Accordion containing a list of proposals */}
                <div className={activeProposalList.length ? "d-none" : "h1 font-gold font-small"}>Loading...</div>
                <div className="accordion mt-5 w-100" id="accordionActive">
                    {displayActiveProposal()}
                </div>
                <h1 className="mt-5">Expired Proposal List</h1>
                {/* Accordion containing a list of proposals */}
                <div className={activeProposalList.length ? "d-none" : "h1 font-gold font-small"}>Loading...</div>
                <div className="accordion mt-5 w-100" id="accordionExample">
                    {displayExpiredProposal()}
                </div>
            </div>
            {/* Create Proposal Modal  */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                <div className="h3">Create your proposal here</div> <div>(Only whitelisted proposers allowed!)</div>
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="exampleFormControlInput1" className="form-label">
                                    Proposal Title
                                </label>
                                <input type="text" className="form-control" onChange={updateCreateProposalStateString} name="proposalTitle" value={createProposal.proposalTitle} placeholder="Title of my proposal"></input>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                                    Description (Be very descriptive)
                                </label>
                                <textarea className="form-control" onChange={updateCreateProposalStateString} name="proposalDescription" value={createProposal.proposalDescription} rows="3" placeholder="Description of my proposal"></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                                    Options (As many options as you want)
                                </label>
                                <input className="form-control" onChange={updateCreateProposalStateString} name="proposalOptions" value={createProposal.proposalOptions} placeholder='Format as follow ["Option 1", "Option 2", "Option 3"]'></input>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                                    Number of Options
                                </label>
                                <input type="number" className="form-control" onChange={updateCreateProposalStateNumber} name="proposalNumOfOptions" value={createProposal.proposalNumOfOptions} placeholder="In the example above, 3"></input>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={createNewProposal}>
                                {createFlag ? "Please Wait..." : "Submit Proposal Onchain"}
                            </button>
                        </div>
                        {createTxId && (
                            <div className="col-12">
                                Your proposal has been successfully submitted.
                                <a href={"https://rinkeby.etherscan.io/tx/" + createTxId} target="_blank" rel="noreferrer">
                                    {createTxId}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
