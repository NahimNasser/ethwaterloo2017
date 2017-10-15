import React from 'react'
import PropTypes from 'prop-types'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import Slider from 'material-ui/Slider'
import * as colors from 'material-ui/styles/colors'

export default class Issue extends React.Component {
  static propTypes = {
    key: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    currentNumberOfVotes: PropTypes.number.isRequired,
    totalBounty: PropTypes.number.isRequired,
    expiresAt: PropTypes.number.isRequired,
    voterAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    isBountyOpen: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
  }

  render() {
    const numContributors = this.props.voterAddresses.length
    const currentVotePercantage = Math.round(this.props.currentNumberOfVotes / numContributors * 100)
    return (
      <Card
        className='col-md-6'
        style={this.props.style}
      >
        <CardHeader
          title={`${this.props.totalBounty.toFixed(2)} ETH`}
          subtitle={<a href={this.props.key}>{this.props.key}</a>}
          actAsExpander={false}
          showExpandableButton={false}
        />
        <CardText expandable={false} style={{ width: '100%' }}>
          <div>{this.bountyOpenComponent()}</div>
          <div>{new Date(this.props.expiresAt).toDateString()}</div>
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
