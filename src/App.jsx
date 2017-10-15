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
      snackbarMessage: '',
      snackbarOpen: false,
      dialogOpen: false,
      dialogData: {
        issueUrl: "",
        voters: "",
        expiresIn: ""
      },
      disabledBounties: [],
      web3: null,
      gitBountyContract: null,
      gitBountyCreatorContract: null,
      issues: []
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
      dialogOpen: false
    })
  }

  _handleDialogOpen() {
    this.setState({
      dialogOpen: true
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
            return results.map((elm, i) => ({
              key: elm[0] == "" ? `issue-${i}` : elm[0],
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
            this.setState({
              issues: results
            })
          })

      })
      .catch(console.error)
  }

  _handleNewBounty() {
    const data = this.state.dialogData

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.error(error)
        return
      }

      this.state.gitBountyCreatorContract.deployed()
        .then((instance) => {
          instance
            .createBounty(
              this.state.dialogData.issueUrl,
              this.state.dialogData.voters.split(','),
              parseInt(this.state.dialogData.expiresIn) * 60 * 60 * 24,
              {
                from: accounts[0]
              }
            )
            .then(resp => {
              console.log(resp)

              this.setState({
                snackbarOpen: true,
                snackbarMessage: "New bounty created on contract",
                dialogOpen: false,
                dialogData: {
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

  _handleContribute(contractAddress, amountInEther) {
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.error(error)
        return null
      }

      this.state.gitBountyContract.deployed({ at: contractAddress })
        .then((contractInstance) => {
          contractInstance
            .addToBounty({
              from: accounts[0], value: web3.toWei(`${amountInEther}`, 'ether')
            })
            .then(_ => {
              this.setState({
                snackbarOpen: true,
                snackbarMessage: "Thank you for your contribution!"
              })

              return null
            })
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
        .then((isDone) => {
          if(isDone) {
            this.setState({
              snackbarOpen: true,
              snackbarMessage: "Issue completed!"
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

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <AppBar
          iconElementLeft={<i></i>}
          iconElementRight={
            <img
              onClick={_ => this._handleDialogOpen()}
              src='https://cl.ly/1J350Z1H0K3d/plus.png'
              className="new-bounty-button"
            />
          }
          title="GitBounty"
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
            <div className='col-md-4 col-xs-12'>
              {
                this.state.issues.map((bounty, i) => {
                  return (
                    <Issue
                      style={{}}
                      {...bounty}
                      id={bounty.key}
                    />
                  )
                })
              }
            </div>
          </div>
        </section>
        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={_ => this.setState({ snackbarOpen: false, snackbarMessage: '' })}
        />
        <Dialog
          title="New Bounty"
          modal={false}
          open={this.state.dialogOpen}
          actions={actions}
        >
          <div className="col-xs-10">
            <TextField
              id="issue-url"
              value={this.state.dialogData.issueUrl}
              onChange={(ev) => this.setState({ dialogData: { ...this.state.dialogData, issueUrl: ev.target.value } })}
              hintText="Issue URL"
              fullWidth={true}
            />
          </div>
          <br />
          <div className="col-xs-10">
            <TextField
              id="voters"
              value={this.state.dialogData.voters}
              onChange={(ev) => this.setState({ dialogData: { ...this.state.dialogData, voters: ev.target.value } })}
              hintText="Voters (comma-separated)"
              fullWidth={true}
            />
          </div>
          <br />
          <div className="col-xs-10 row">
            <TextField
              id="expiry"
              type="number"
              value={this.state.dialogData.expiresIn}
              onChange={(ev) => this.setState({ dialogData: { ...this.state.dialogData, expiresIn: ev.target.value } })}
              hintText="Days until expiry"
              fullWidth={true}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}
export default App;
