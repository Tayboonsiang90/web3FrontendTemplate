// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// For implementing the modifer onlyOwner
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Survey is Ownable {
    // Proposal Struct
    struct Proposal {
        address author; // Address of Proposer
        string title; // Title of Proposal
        string description; // Description of Proposal
        uint256 createdAt; // Block Height Created
        uint256 numOfOptions; // Number of Voting Options
        address[] voters; // An array of voters
        uint256 totalVotes; // Total Voted
    }

    // Part of the proposal struct
    mapping(uint256 => mapping(uint256 => string)) public proposalOptions; // Options String
    mapping(uint256 => mapping(uint256 => uint256)) public proposalCount; // Voting Count
    mapping(uint256 => mapping(address => bool)) public proposalStatus; // Voting status of a given address
    mapping(uint256 => mapping(address => uint256)) public proposalPower; // Voting power used by a given address

    // ERC20 token address
    address public voteToken;
    // Proposal Storage
    Proposal[] public proposals; // 1,2,3,4,5,...
    // Set period to cast a vote
    uint constant VOTING_PERIOD = 1 days;
    // Set proposal Id
    uint public currentProposalId = 0;
    // Member whitelist for proposal creation
    mapping(address => bool) public whitelistMembers;

    // Constructor, with parameter as the voting token
    constructor (address _voteToken) {
        voteToken = _voteToken;
    }

    // Join the whitelist as a proposer
    function join(address _newMember) public onlyOwner {
        address user = _newMember;
        require(whitelistMembers[user] = true, "Already whitelisted");
        whitelistMembers[user] = true;   
    }

    // Create a proposal, need to be whitelisted
    function createProposal(string memory _name, string memory _description, string[] memory _optionsStringArray, uint256 _numOfOptions) public returns(uint256){
        require(whitelistMembers[msg.sender] = true ,"Only whitelisted members can create a proposal");

        address[] memory voters;
        for (uint i = 0; i < _numOfOptions; i++) {
            proposalOptions[currentProposalId][i] = _optionsStringArray[i];
        }
    
        proposals[currentProposalId] = Proposal(
            msg.sender,
            _name,
            _description,
            block.timestamp,
            _numOfOptions,
            voters, // address[] voters; // An array of voters
            0 // uint256 totalVotes; // Total Voted
        );

        currentProposalId++;
        return currentProposalId; // deduct by 1 to get the real id of the proposal
    }

    // Vote in any proposal
    function voteInProposal(uint256 _proposalId, uint256 _voteOption) public {
        // Retrieve the proposal
        Proposal storage proposal = proposals[_proposalId];

        // Sanity checks
        require(proposalStatus[_proposalId][msg.sender] == false, "You have already voted. ");
        require(block.timestamp <= proposal.createdAt + VOTING_PERIOD, "The voting period is over. ");

        // Retrieve ERC20 voting power
        IERC20 vToken = IERC20(voteToken);
        uint256 senderVotePower = vToken.balanceOf(msg.sender);

        // Modify proposal struct
        proposal.voters.push(msg.sender); // Register as a voter
        proposalCount[_proposalId][_voteOption] += senderVotePower; // Increment the vote 
        proposalStatus[_proposalId][msg.sender] = true; // Mark as voted
        proposalPower[_proposalId][msg.sender] = senderVotePower; // Mark the sender voting power
        proposal.totalVotes += senderVotePower; // Increment the total votes
    }

    //// View functions
    function viewProposalStatus(uint256 _proposalId) public view returns(bool) {
        return (block.timestamp <= proposals[_proposalId].createdAt + VOTING_PERIOD);
    }

    // // // View Functions
    // function viewNumberOfProposals(uint256 _proposalId) public view returns(uint256) {
    //     return currentProposalId;
    // }

    // // View Functions
    function viewProposalDetails(uint256 _proposalId) public view returns(Proposal memory) {
        return proposals[_proposalId];
    }
}