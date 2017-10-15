import React from 'react'
import PropTypes from 'prop-types'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import Slider from 'material-ui/Slider'
import FontIcon from 'material-ui/FontIcon';
import {red500, yellow500, blue500} from 'material-ui/styles/colors';

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
    // const openBountyIcon = "https://lh3.googleusercontent.com/wdFgfoxO5xFb5s194SbECtHEe-HU3BfM5MqL3896G1esFN02J_aqp5yaQ39-IMHqRjY=w300"
    const openBountyIcon = "http://gazettereview.com/wp-content/uploads/2016/04/dob-bounty-hunter-updates-253x300.png"
    const closedBountyIcon = "https://cdn0.iconfinder.com/data/icons/flat-security-icons/512/lock.png"
    const openBountyCopy = "Open Bounty"
    const closedBountyCopy = "Bounty Ended"
    return (
      <Card
        className='col-xs-12 bountyCard'
        style={this.props.style}
      >
      <CardHeader
        title={`${this.props.totalBounty.toFixed(3)} ETH`}
        titleStyle={{fontSize: '200%'}}
        subtitle={this.props.isBountyOpen ? openBountyCopy : closedBountyCopy}
        avatar={this.props.isBountyOpen ? openBountyIcon : closedBountyIcon}
      />
        <CardText expandable={false} style={{width: '100%'}}>
          Github Issue URL: <a href={this.props.bountyKey}>{this.props.bountyKey}</a>
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
}
