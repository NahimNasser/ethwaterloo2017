var GitBountyCreator = artifacts.require("./GitBountyCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(GitBountyCreator);
};