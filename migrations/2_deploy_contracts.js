var GitBounty = artifacts.require("./GitBounty.sol");
var GitBountyCreator = artifacts.require("./GitBountyCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(GitBounty);
  deployer.deploy(GitBountyCreator);
};