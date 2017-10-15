import React from 'react'
import PropTypes from 'prop-types'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import Slider from 'material-ui/Slider'
import * as colors from 'material-ui/styles/colors'

export default class Issue extends React.Component {
  static propTypes = {
    bountyKey: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    totalBounty: PropTypes.number.isRequired,
    expiresAt: PropTypes.number.isRequired,
    voterAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    isBountyOpen: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
  }

  render() {
    const numContributors = this.props.voterAddresses.length
    const currentVotePercantage = Math.round(this.props.totalVotes / numContributors * 100)
    return (
      <Card
        className='col-md-6'
        style={this.props.style}
      >
        <CardText expandable={false} style={{ width: '100%' }}>
          <div style={{
            fontSize: '300%',
            color: this.props.isBountyOpen ? colors.green500 : colors.red500,
          }}>
            {`${this.props.totalBounty.toFixed(3)} ETH`}
          </div>
          <div style={{
          }}>
            <a href={this.props.bountyKey}>{this.props.bountyKey}</a>
          </div>
          <div>{this.bountyOpenComponent()}</div>
          <div>{new Date(this.props.expiresAt).toDateString()}</div>
        </CardText>
        <CardActions>
          <RaisedButton
            label='Contribute'
            disabled={!this.props.isBountyOpen}
            primary
          />
          <RaisedButton
            label='Vote'
            disabled={false}
            primary
            onClick={() => this.props.onVoteClick()}
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
