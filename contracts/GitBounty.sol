pragma solidity ^0.4.2;

contract GitBounty {

    bytes32 public key;
    address public owner;
    uint256 public totalBounty;
    uint256 public expiresAt;
    address[] public voterAddresses;
    mapping (address => uint256) public contributions;
    mapping (address => bool) public eligibleVotersAddresses;
    mapping (address => uint256) public votes;
    uint256 public requiredNumberOfVotes;
    bool public isBountyOpen;
    mapping (bytes32 => bool) private hasVotedToAddress;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    modifier isEligibleVoter {
        require(eligibleVotersAddresses[msg.sender]);
        _;
    }
    modifier bountyOpen {
        require(isBountyOpen);
        _;
    }
    modifier votedOnce(address voter, address hunter) {
        require(!hasVoted(voter, hunter));
        _;
    }
    function GitBounty(bytes32 issueUrl, address[] voters,uint256  expiresIn ) public payable {
        key = issueUrl;
        isBountyOpen = true;
        expiresAt += expiresIn + now;
        totalBounty += msg.value;
        owner = msg.sender;
        voterAddresses = voters;
        requiredNumberOfVotes = (voterAddresses.length / 2 )  + 1;
        for (uint256 i=0; i < voterAddresses.length; i++ ){
            eligibleVotersAddresses[voterAddresses[i]] = true;
        }
        contributions[msg.sender] += msg.value;
    }
    function addToBounty() public payable bountyOpen {
        contributions[msg.sender] += msg.value;
        totalBounty += msg.value;
    }
    function vote(address addr) public isEligibleVoter bountyOpen votedOnce(msg.sender, addr){
        votes[addr] += 1;
        addVotePair(msg.sender, addr);
        doCount(addr);
    }
    function doCount(address addr) private {
        if (votes[addr] >= requiredNumberOfVotes) {
            addr.transfer(totalBounty);
            isBountyOpen = false;
        }
    }
    function addVotePair(address voter, address hunter) private {
        hasVotedToAddress[keccak256(voter, hunter)] = true;
    }
    function hasVoted(address voter, address hunter) private constant returns (bool) {
        return hasVotedToAddress[keccak256(voter, hunter)];
    }

}
