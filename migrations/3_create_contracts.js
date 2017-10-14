var GitBounty = artifacts.require("./GitBounty.sol");

module.exports = function(deployer) {
  deployer.deploy(GitBounty, "https://github.com/hell", ["0x1231231","0x21312312"], 213123);
};