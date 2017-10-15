# GitBounty: EthWaterloo Competition

GitBounty is a tool which incentivizes open source work with a decentralized bounty program.


## Getting Started

1. Install and run [TestRPC](https://github.com/ethereumjs/testrpc)

2. Install the [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en) chrome extension and make sure it's connected to your TestRpc instance on localhost

3. Import one of the private keys of the accounts which TestRPC shows when the command runs

4. Run the contract migrations by stepping into the repo and then using the command `npm install && truffle deploy`

    - By default, the code will attempt to connect to an RPC server running on localhost, edit `./truffle.js` to change the network a contract is deployed to
    - [More info on truffle](https://github.com/trufflesuite/truffle) and launching contracts

5. Once your contract is compiled and migrated onto the network, you can now use the application by running `npm run start` which will start a server on port `3000`

6. On the UI, create a new bounty by clicking the button in the top right corner

    - You must provide the addresses of Ethereum accounts which are allowed to vote

7. Anyone visitng the site can contribute Ether to the total bounty but voting is restricted to allowed accounts

    - When voting, the voter must provide an Ethereum account address which belongs to the owner of a Pull-Request on an open source repository
    - The address of the PR owner must be posted by them in the PR itself

8. Once 51% (or more) of total voters have accepted a bounty proposal, the bounty will release funds to the address with the post votes


__Note:__ Steps 1 and 3 are optional and could be replaced by connected to your own provider or any of the testnets. Simply keep in mind that the contract must be deployed on whatever network you MetaMask plugin is connected to.