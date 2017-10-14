pragma solidity ^0.4.2;
import "./usingOraclize.sol";
import "./strings.sol";
/*import "../installed_contracts/oraclize/contracts/usingOraclize.sol";*/

contract GitBounty is usingOraclize {
    using strings for *;

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
    bytes32 private queryId;
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
    modifier isOraclize {
        require(msg.sender == oraclize_cbAddress());
        _;
    }
    function GitBounty(bytes32 issueUrl ,uint256  expiresIn ) public payable {
      require((msg.value >= 1 ether));

      key = issueUrl;
      expiresAt += expiresIn + now;
      totalBounty += msg.value;
      owner = msg.sender;

      contributions[msg.sender] += msg.value;
      var queryId = oraclize_query("URL", "https://raw.githubusercontent.com/NahimNasser/ethwaterloo2017/master/.voters", 300000);
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
    function __callback(bytes32 myid, string result) public isOraclize{
        isBountyOpen = true;
        var s = result.toSlice();
        var delim = ",".toSlice();
        var parts = new address[](s.count(delim) + 1);
        for(uint i = 0; i < parts.length; i++) {
            parts[i] = parseAddr(s.split(delim).toString());
        }
        voterAddresses = parts;
        requiredNumberOfVotes = (voterAddresses.length / 2 )  + 1;
        for (uint256 c=0; c < voterAddresses.length; c++ ){
          eligibleVotersAddresses[voterAddresses[c]] = true;
        }
    }

}
