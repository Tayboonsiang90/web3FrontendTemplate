import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../contexts/globalProvider";
import governerContractABI from "../utils/Governor.json";
import { ethers } from "ethers";

// // Environment Variables
// Governor Contract
const governorContractAddress = "0xF28C12b150501f0538b6dbeFB6C4c92A49D1fB8D";

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

                // Retrieve the state of all the proposals from the blockchain
                for (let i = 0; i < numOfProposal; i++) {
                    let proposalDetail = await governorContract.viewProposalDetails(i);
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
                    proposalObjectConstruct.createdAt = parseInt(proposalDetail[3]);
                    proposalObjectConstruct.numOfOptions = parseInt(proposalDetail[4]);
                    proposalObjectConstruct.optionStringArray = [];
                    // Iterate through the number of options and find the names
                    for (let j = 0; j < proposalObjectConstruct.numOfOptions; j++) {
                        let optionStruct = {};
                        optionStruct.optionName = await governorContract.proposalOptions(i, j);
                        optionStruct.optionVoteCount = parseInt(await governorContract.proposalCount(i, j)) / 10 ** 18;

                        proposalObjectConstruct.optionStringArray.push(optionStruct);
                    }
                    proposalObjectConstruct.numOfVoters = proposalDetail[5].length;
                    proposalObjectConstruct.voterDetailsArray = [];
                    for (let j = 0; j < proposalObjectConstruct.numOfVoters; j++) {
                        let voterStruct = {};
                        voterStruct.voterAddress = proposalDetail[5][j];
                        voterStruct.voterPower = parseInt(await governorContract.proposalPower(i, voterStruct.voterAddress)) / 10 ** 18;
                        // voterStruct.voterChoice = await governorContract.proposalAddressVote(i, voterStruct.voterAddress);

                        proposalObjectConstruct.voterDetailsArray.push(voterStruct);
                    }
                    proposalObjectConstruct.totalVotes = parseInt(proposalDetail[6]) / 10 ** 18;

                    let tempState = proposalList;
                    tempState[i] = proposalObjectConstruct;
                    setProposalList(tempState);
                }
            }
        } catch (e) {}
    };

    const displayProposal = () => {
        let renderResult = [];
        let count = 1;
        for (let proposal of proposalList) {
            console.log(proposal);
            let accordionItem = (
                <div class="accordion-item" key={count}>
                    <h2 class="accordion-header" id="headingOne">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                            #{count}: {proposal.title}
                        </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                            <div>Description: {proposal.description}</div>
                            <div>Proposer: {proposal.author}</div>
                            <div>Block Height: {proposal.createdAt}</div>
                            <div></div>
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
                <h1>Proposal List</h1>
                {/* Accordion containing a list of proposals */}
                <div class="accordion" id="accordionExample">
                    {displayProposal()}
                </div>
            </div>
        </React.Fragment>
    );
}
