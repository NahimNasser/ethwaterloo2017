import Axios from 'axios'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import React, {Component} from 'react'
import AppBar from 'material-ui/AppBar'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

import bounties from '../bounties.json'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)
const contracts = {}

contracts.GitBounty = TruffleContract(bounties)
// Set the provider for our contract
contracts.GitBounty.setProvider(provider)

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dialogOpen: false,
      dialogData: {
        issueUrl: "",
        voters: "",
        expiresIn: ""
      },
      disabledBounties: []
    }
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
  
  _handleSubmit() {
    
  }

  _markVoted() {
    var bountyInstance;

    contracts.GitBounty.deployed().then(function (instance) {
      bountyInstance = instance;

      return bountyInstance.getVoters.call();
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

  _handleVoteBounty(ev) {
    ev.preventDefault()

    var petId = parseInt($(event.target).data('id'))
    var bountyInstance

    // Required arguments: Github Issue URL, Voter Addresses, expiresIn, 0.1eth
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]

      contracts.GitBounty.deployed()
        .then(function (instance) {
          bountyInstance = instance

          // Execute adopt as a transaction by sending account
          return bountyInstance.vote('0x1231231')
        })
        .then(function (result) {
          return Web3App.markVoted();
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
        onClick={_ => this._handleSubmit()}
      />,
    ];

    return (
      <div style={{ height: '100%'}}>
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
        <section className="row col-xs-12 center-xs middle-xs" style={{ height: '100%', textAlign: 'center'}}>
          <img src="https://cl.ly/2z1w1t2p1p06/hero-world.gif" style={{paddingTop: 100}} />
          <Dialog
            title="New Bounty"
            modal={false}
            open={this.state.dialogOpen}
            actions={actions}
            className="row center-xs middle-xs"
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
                hintText="Hours until expiry"
                fullWidth={true}
              />
            </div>
          </Dialog>
        </section>
      </div>
    );
  }
}
export default App;
