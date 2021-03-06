import Axios from 'axios'
import Web3 from 'web3'
import _ from 'lodash'
import TruffleContract from 'truffle-contract'
import React, { Component } from 'react'
import AppBar from 'material-ui/AppBar'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import ContentAddBox from 'material-ui/svg-icons/content/add-box';

import Issue from './Issue.jsx'

import { getWeb3 } from './utils'
import bounties from '../bounties.json'
import GitBountyJson from '../build/contracts/GitBounty.json'
import GitBountyCreatorJson from '../build/contracts/GitBountyCreator.json'
import {fullWhite} from 'material-ui/styles/colors';

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      bounties: {},
      bountyAbi: null,
      snackbarMessage: '',
      snackbarOpen: false,
      newDialogOpen: false,
      newDialogData: {
        issueUrl: "",
        voters: "",
        expiresIn: ""
      },
      voteDialogOpen: false,
      voteDialogData: {
      },
      disabledBounties: [],
      web3: null,
      gitBountyContract: null,
      gitBountyCreatorContract: null,
      solutionWalletAddress: '',
      issues: [],
    }
  }

  componentWillMount() {
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        this._instantiateContract()
      })
      .catch((e) => {
        console.log('Error finding web3.', e)
      })
  }

  _instantiateContract() {
    const gitBountyCreatorTruffleContract = TruffleContract(GitBountyCreatorJson)
    gitBountyCreatorTruffleContract.setProvider(this.state.web3.currentProvider)

    const gitBountyTruffleContract = TruffleContract(GitBountyJson)
    gitBountyTruffleContract.setProvider(this.state.web3.currentProvider)

    this.setState({
      gitBountyCreatorContract: gitBountyCreatorTruffleContract,
      gitBountyContract: gitBountyTruffleContract,
    })

    this._loadBounties()
  }

  _handleDialogClose() {
    this.setState({
      newDialogOpen: false
    })
  }

  _handlenewDialogOpen() {
    this.setState({
      newDialogOpen: true
    })
  }

  _handleVoteClose() {
    this.setState({
      voteDialogOpen: false
    })
  }

  _handleVoteSubmit() {
    this.setState({
      voteDialogOpen: true
    })
  }

  _loadBounties() {
    this.state.gitBountyCreatorContract.deployed()
      .then(instance => {
        return instance
          .getAllBounties()
          .then(addresses => {
            const promises = addresses.map((addr) => {
              this.setState({
                bounties: _.assign(this.state.bounties, _.set({}, addr, new this.state.web3.eth.Contract(GitBountyJson.abi, addr)))
              });

              return this.state.bounties[addr].methods.getAllTheThings().call().then(results => ({ data: results, address: addr }))
            })

            return Promise.all(promises)
          })
          .then(results => {
            console.log(results);

            return results.map(({data, address}, i) => ({
              addr: address,
              key: data[0] == "" ? `issue-${i}` : data[0],
              owner: data[1],
              totalBounty: parseInt(data[2]),
              expiresAt: parseInt(data[3]),
              voterAddresses: data[4],
              totalVotes: parseInt(data[5]),
              solutionAddresses: data[6],
              totalSolutions: parseInt(data[7]),
              requiredNumberOfVotes: parseInt(data[8]),
              isBountyOpen: data[9],
            }))
          })
          .then(results => {
            console.log(results)

            this.setState({
              issues: results
            })
          })
          .catch(console.error)

      })
      .catch(console.error)
  }

  _handleNewBounty() {
    const data = this.state.newDialogData

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.error(error)
        return
      }

      this.state.gitBountyCreatorContract.deployed()
        .then((instance) => {
          instance
            .createBounty(
              this.state.newDialogData.issueUrl,
              this.state.newDialogData.voters.split(','),
              parseInt(this.state.newDialogData.expiresIn) * 60 * 60 * 24,
              {
                from: accounts[0]
              }
            )
            .then(resp => {
              this.setState({
                snackbarOpen: true,
                snackbarMessage: "New bounty created on contract",
                newDialogOpen: false,
                newDialogData: {
                  issueUrl: "",
                  voters: "",
                  expiresIn: ""
                }
              })

              return null
            })
            .then(_ => {
              setTimeout(() => {
                this._loadBounties()
              }, 500)

              return null
            })
            .catch((err) => {
              console.error(err)

              return new Error("Failed to create new bounty")
            })
        })
        .catch(console.error)
    })
  }

  _handleContribute(contractAddress) {
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.error(error)
        return null
      }

      this.state.bounties[contractAddress].methods
            .addToBounty().send({ from: accounts[0], value: web3.toWei(1, 'ether')})
            .then(_ => {
              this.setState({
                snackbarOpen: true,
                snackbarMessage: "Thank you for your contribution!",
                voteDialogOpen: false
              })

              return this._loadBounties()
            })
        .catch(console.error)
    })
  }

  _handleVoteBounty() {
    const issue = this.state.solutionWalletAddress
    // Required arguments: Github Issue URL, Voter Addresses, expiresIn, 0.1eth
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]

      this.state.bounties[this.state.currentIssueAddress].methods.vote(issue).send( { from: account })
        .then((isDone) => {
          if(isDone) {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Issue completed!",
              voteDialogOpen: false
            })
          }

          // reload the bounties
          return this._loadBounties()
        })
        .catch(console.error)
    })
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={_ => this._handleDialogClose()}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={_ => this._handleNewBounty()}
      />,
    ];
    const voteActions = [
      <FlatButton
        key={"action-1"}
        label="Cancel"
        primary={true}
        onClick={_ => this._handleVoteClose()}
      />,
      <FlatButton
        key={"action-2"}
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={_ => this._handleVoteBounty()}
      />,
    ];

    console.log(this.issues)

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <AppBar
          iconElementLeft={<i></i>}
          iconElementRight={<RaisedButton style={{marginTop: "6px", marginRight: "5px"}} icon={<ContentAddBox />}
 backgroundColor={fullWhite} onClick={_ => this._handlenewDialogOpen()} label="Create Bounty" />}
          title="DOG - The Open Source Bounty Hunter"
        />
        <section
          className={`row col-xs-12 ${this.state.issues.length > 0 ? '' : 'center-xs middle-xs'}`}
          style={{ height: '100%', textAlign: 'center', padding: '25px' }}
        >
          {
            this.state.issues.length == 0 &&
              (
                <img src="https://cl.ly/2z1w1t2p1p06/hero-world.gif" style={{ paddingTop: 100 }} />
              )
          }
          <div className='row col-xs-12'>
            {
              this.state.issues.map((bounty) => {
                return (
                  <div key={bounty.addr} className='col-md-4 col-xs-12'>
                    <Issue
                      style={{}}
                      { ...bounty }
                      bountyKey={bounty.key}
                      onContributeClick={() => {
                        this._handleContribute(bounty.addr)
                      }}
                      onVoteClick={() => {
                        this.setState({
                          voteDialogOpen: true,
                          currentIssueAddress: bounty.addr,
                        })
                      }}
                    />
                    </div>
                  )
                })
              }
          </div>
        </section>
        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={_ => this.setState({ snackbarOpen: false, snackbarMessage: '' })}
        />
        <Dialog
          key="new-bounty-dialog"
          title="New Bounty"
          modal={false}
          open={this.state.newDialogOpen}
          actions={actions}
        >
          <div className="col-xs-12">
            <TextField
              id="issue-url"
              value={this.state.newDialogData.issueUrl}
              onChange={(ev) => this.setState({ newDialogData: { ...this.state.newDialogData, issueUrl: ev.target.value } })}
              hintText="Issue URL"
              fullWidth={true}
            />
          </div>
          <br />
          <div className="col-xs-12">
            <TextField
              id="voters"
              value={this.state.newDialogData.voters}
              onChange={(ev) => this.setState({ newDialogData: { ...this.state.newDialogData, voters: ev.target.value } })}
              hintText="Voters (comma-separated)"
              fullWidth={true}
            />
          </div>
          <br />
          <div className="col-xs-12">
            <TextField
              id="expiry"
              type="number"
              value={this.state.newDialogData.expiresIn}
              onChange={(ev) => this.setState({ newDialogData: { ...this.state.newDialogData, expiresIn: ev.target.value } })}
              hintText="Days until expiry"
              fullWidth={true}
            />
          </div>
        </Dialog>
        <Dialog
          key="vote-dialog"
          title="Vote"
          modal={false}
          open={this.state.voteDialogOpen}
          actions={voteActions}
        >
          <div>
            <TextField
              id="issue-url"
              onChange={(ev) => this.setState({ solutionWalletAddress: ev.target.value })}
              hintText="Solution Wallet Address"
              fullWidth={true}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}
export default App;
