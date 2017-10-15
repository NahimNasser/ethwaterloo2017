import Axios from 'axios'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import React, { Component } from 'react'
import AppBar from 'material-ui/AppBar'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import Issue from './Issue.jsx'

import { getWeb3 } from './utils'
import bounties from '../bounties.json'
import GitBountyJson from '../build/contracts/GitBounty.json'
import GitBountyCreatorJson from '../build/contracts/GitBountyCreator.json'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      bounties: {},
      snackbarMessage: '',
      snackbarOpen: false,
      contributeDialogOpen: false,
      contributeDialogData: {
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
      issues: require('./mocks.js').mockBounties,
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
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  _instantiateContract() {
    const gitBountyCreatorTruffleContract = TruffleContract(GitBountyCreatorJson)
    gitBountyCreatorTruffleContract.setProvider(this.state.web3.currentProvider)

    const gitBountyTruffleContract = TruffleContract(GitBountyJson)
    gitBountyTruffleContract.setProvider(this.state.web3.currentProvider)

    this.setState({
      gitBountyContract: gitBountyTruffleContract,
      gitBountyCreatorContract: gitBountyCreatorTruffleContract
    })

    this._loadBounties()
  }

  _handleDialogClose() {
    this.setState({
      contributeDialogOpen: false
    })
  }

  _handlecontributeDialogOpen() {
    this.setState({
      contributeDialogOpen: true
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
              return this.state.gitBountyContract.deployed({ at: addr }).then(inst => {
                return inst.getAllTheThings()
              })
            })

            return Promise.all(promises)
          })
          .then(results => {
            return results.map(elm => ({
              key: elm[0], 
              owner: elm[1], 
              totalBounty: elm[2].toNumber(), 
              expiresAt: elm[3].toNumber(), 
              voterAddresses: elm[4], 
              totalVotes: elm[5].toNumber(), 
              solutionAddresses: elm[6], 
              totalSolutions: elm[7].toNumber(), 
              requiredNumberOfVotes: elm[8].toNumber(), 
              isBountyOpen: elm[8].toNumber() > 0
            }))
          })
          .then(results => {
            // this.setState({
            //   issues: results
            // })
          })

      })
      .catch(console.error)
  }

  _handleNewBounty() {
    const data = this.state.contributeDialogData

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.error(error)
        return
      }

      this.state.gitBountyCreatorContract.deployed()
        .then((instance) => {
          instance
            .createBounty(
              this.state.contributeDialogData.issueUrl,
              this.state.contributeDialogData.voters.split(','),
              parseInt(this.state.contributeDialogData.expiresIn) * 60 * 60 * 24,
              {
                from: accounts[0]
              }
            )
            .then(resp => {
              console.log(resp)

              this.setState({
                snackbarOpen: true,
                snackbarMessage: "New bounty created on contract",
                contributeDialogOpen: false,
                contributeDialogData: {
                  issueUrl: "",
                  voters: "",
                  expiresIn: ""
                }
              })

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

  _markVoted() {
    let bountyInstance

    this.contract.deployed()
      .then((instance) => {
        bountyInstance = instance

        return bountyInstance.getVoters.call()
      })
      .then((voters) => {
        voters.forEach(voter => {
          if (voter !== '0x0000000000000000000000000000000000000000') {
            this.setState({
              disabledBounties: [...this.state.disabledBounties, voter]
            })
          }
        })
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  _handleContribute(address) {
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.error(error)
        return
      }

      this.state.gitBountyContract.deployed({ at: address })
        .then((contractInstance) => {
          contractInstance
            .addToBounty({from: accounts[0]})
            .then(console.log)
        })
        .catch(console.error)
    })
  }

  _handleVoteBounty(issue) {
    // Required arguments: Github Issue URL, Voter Addresses, expiresIn, 0.1eth
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]

      contracts.GitBounty.deployed({ at: address })
        .then((instance) => {
          return instance.vote(issue)
        })
        .then(function (result) {
          return this._markVoted()
        })
        .catch(function (err) {
          console.log(err.message);
        })
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
        label="Cancel"
        primary={true}
        onClick={_ => this._handleVoteClose()}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={_ => this._handleVoteSubmit()}
      />,
    ];

    return (
      <div style={{ height: '100%' }}>
        <AppBar
          iconElementLeft={<i></i>}
          iconElementRight={
            <img
              onClick={_ => this._handlecontributeDialogOpen()}
              src='https://cl.ly/1J350Z1H0K3d/plus.png'
              className="new-bounty-button"
            />
          }
          title="GitBounty"
        />
        <section className="row col-xs-12 center-xs middle-xs" style={{ height: '100%', textAlign: 'center' }}>
          <img src="https://cl.ly/2z1w1t2p1p06/hero-world.gif" style={{ paddingTop: 100 }} />
          <FlatButton
            label="Contribute"
            type="button"
            onClick={_ => this._handleContribute()}
          />

          <div className='row'>
            {
              this.state.issues.map((bounty) => {
                return (
                  <Issue
                    style={{
                    }}
                    key={bounty.key}
                    { ...bounty }
                    bountyKey={bounty.key}
                    onVoteClick={() => this.setState({ voteDialogOpen: true })}
                  />
                )
              })
            }
          </div>

          <Dialog
            title="New Bounty"
            modal={false}
            open={this.state.contributeDialogOpen}
            actions={actions}
          >
            <div>
              <TextField
                id="issue-url"
                value={this.state.contributeDialogData.issueUrl}
                onChange={(ev) => this.setState({ contributeDialogData: { ...this.state.contributeDialogData, issueUrl: ev.target.value } })}
                hintText="Issue URL"
                fullWidth={true}
              />
            </div>
            <br />
            <div>
              <TextField
                id="voters"
                value={this.state.contributeDialogData.voters}
                onChange={(ev) => this.setState({ contributeDialogData: { ...this.state.contributeDialogData, voters: ev.target.value } })}
                hintText="Voters (comma-separated)"
                fullWidth={true}
              />
            </div>
            <br />
            <div>
              <TextField
                id="expiry"
                type="number"
                value={this.state.contributeDialogData.expiresIn}
                onChange={(ev) => this.setState({ contributeDialogData: { ...this.state.contributeDialogData, expiresIn: ev.target.value } })}
                hintText="Days until expiry"
                fullWidth={true}
              />
            </div>
          </Dialog>
          <Dialog
            title="Vote"
            modal={false}
            open={this.state.voteDialogOpen}
            actions={actions}
          >
            <div>
              <TextField
                id="issue-url"
                onChange={(ev) => this.setState({ voteDialogData: { ...this.state.contributeDialogData } })}
                hintText="Solution Wallet Address"
                fullWidth={true}
              />
            </div>
          </Dialog>

          <Snackbar
            open={this.state.snackbarOpen}
            message={this.state.snackbarMessage}
            autoHideDuration={4000}
            onRequestClose={_ => this.setState({ snackbarOpen: false, snackbarMessage: '' })}
          />
        </section>
      </div>
    );
  }
}
export default App;
