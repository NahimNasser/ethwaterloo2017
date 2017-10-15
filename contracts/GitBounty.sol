pragma solidity ^0.4.2;

contract GitBountyCreator {
    struct Bounty {
        address addr;
        uint256 totalVotes;
        uint256 totalVoters;
        uint256 payoutAmount;
    }
    mapping (string => Bounty) private bounties;
    modifier isChild(string key) {
        require(bounties[key].addr == msg.sender);
        _;
    }
    function createBounty(string issueUrl, address[] voters,uint256  expiresIn ) public payable returns(address) {
        GitBounty b = new GitBounty(issueUrl, voters, expiresIn, this);
        bounties[issueUrl] = Bounty({
            addr: b,
            totalVotes: 0,
            totalVoters: voters.length,
            payoutAmount: 0
        });
        b.addToBounty.value(msg.value)();
        return b;
    }
    function getBounty(string key) public constant returns (address, uint256, uint256, uint256) {
        return (bounties[key].addr, bounties[key].totalVotes, bounties[key].totalVoters, bounties[key].payoutAmount);
    }
    function updateBountyAmount(string key, uint256 newAmount) public isChild(key) {
        Bounty storage b = bounties[key];
        b.payoutAmount = newAmount;
        bounties[key] = b;
    }
    function updateVoteProgress(string key, uint256 newTotalVotes) public isChild(key) {
      Bounty storage b = bounties[key];
      b.totalVotes = newTotalVotes;
      bounties[key] = b;
    }
}

contract GitBounty {
    GitBountyCreator public parent;
    string public key;
    address public owner;
    uint256 public totalBounty;
    uint256 public expiresAt;
    address[] public voterAddresses;
    uint256 public totalVotes;
    mapping (address => uint256) public contributions;
    mapping (address => bool) public eligibleVotersAddresses;
    mapping (address => uint256) public votes;
    address[] public PRS;
    uint256 public totalPRS;
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
    function GitBounty(string issueUrl, address[] voters,uint256  expiresIn, GitBountyCreator parentAddress ) public payable {
        parent = parentAddress;
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
        parent.updateBountyAmount(key, totalBounty);
    }
    function vote(address addr) public isEligibleVoter bountyOpen votedOnce(msg.sender, addr){
        votes[addr] += 1;
        if (votes[addr] == 1 ) {
          // New PR vote
          PRS.push(addr);
          totalPRS++;
        }
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
