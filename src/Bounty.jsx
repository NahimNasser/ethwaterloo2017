import React from 'react'
import PropTypes from 'prop-types'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import Slider from 'material-ui/Slider'
import * as colors from 'material-ui/styles/colors'

export default class Bounty extends React.Component {
  static propTypes = {
    bountyKey: PropTypes.string.isRequired,
    ownerAddress: PropTypes.string.isRequired,
    currentNumberOfVotes: PropTypes.number.isRequired,
    totalAmount: PropTypes.number.isRequired,
    expiryDate: PropTypes.number.isRequired,
    voterAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    isBountyOpen: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
  }

  render() {
    const numContributors = this.props.voterAddresses.length
    const currentVotePercantage = Math.round(this.props.currentNumberOfVotes / numContributors * 100)
    return (
      <Card
        style={this.props.style}
      >
        <CardHeader
          title={`${this.props.totalAmount.toFixed(2)} ETH`}
          subtitle={<a href={this.props.bountyKey}>{this.props.bountyKey}</a>}
          actAsExpander={false}
          showExpandableButton={false}
        />
        <CardText expandable={false} style={{ width: '100%' }}>
          <div>{this.bountyOpenComponent()}</div>
          <div>{new Date(this.props.expiryDate).toDateString()}</div>
          <div>
            There are {numContributors} contributors.
          </div>
          <div>
            Received {currentVotePercantage}% of votes (51% required).
          </div>
          <progress
            value={currentVotePercantage}
            max={51}
          />
        </CardText>
        <CardActions>
          <RaisedButton
            label='Contribute'
            disabled={!this.props.isBountyOpen}
            primary
          />
          <RaisedButton
            label='Vote'
            disabled
          />
        </CardActions>
      </Card>
    )
  }

  bountyOpenComponent = () => {
    if (this.props.isBountyOpen) {
      return (
        <div style={{
          backgroundColor: colors.green500,
          display: 'inline-block',
          padding: '4px',
        }}>OPEN</div>
      )
    }
    return (
      <div style={{
        backgroundColor: colors.red500,
        display: 'inline-block',
        padding: '4px',
      }}>CLOSED</div>
    )
  }
}
