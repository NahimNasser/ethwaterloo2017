var GitBounty = artifacts.require("./GitBounty.sol");
// var OraclizeAddrResolverI = artifacts.require("./OraclizeAddrResolverI.sol");
// var OraclizeI = artifacts.require("./OraclizeI.sol");
var usingOraclize = artifacts.require("./usingOraclize.sol");
var strings = artifacts.require("./strings.sol");

// const gas = 4503599627370496;
const gas = 4294967295;
module.exports = function(deployer) {
  // deployer.deploy(OraclizeAddrResolverI, { gas } );
deployer.deploy(usingOraclize, {gas});
  deployer.deploy(strings, { gas });
  // deployer.deploy(OraclizeI, { gas } );
  // deployer.link(OraclizeAddrResolverI, usingOraclize );
  // deployer.link(OraclizeI, usingOraclize );

  deployer.link(usingOraclize, GitBounty)
  deployer.link(strings, GitBounty)
  deployer.deploy(GitBounty, "https://github.com/hell", 213123, { gas });
};
