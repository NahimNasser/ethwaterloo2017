var GitBounty = artifacts.require("./GitBounty.sol");

module.exports = function(deployer) {
  deployer.deploy(GitBounty);
};