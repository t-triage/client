import React, { Component } from 'react';

import Paper from "@material-ui/core/Paper"
import Tooltip from "@material-ui/core/Tooltip"
import { withStyles } from '@material-ui/core/styles';

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import TimerIcon from '@material-ui/icons/Timer'
import HelpIcon from "@material-ui/icons/Help"
import BugReportIcon from "@material-ui/icons/BugReport"

import { styles } from '../Main/Components/Globals'

class InsightsBox extends Component {

  getIcon(icon) {
    switch (icon) {
      case 'assignment':
        return <FingerprintIcon className='insightsBoxIcon' style={{ color: 'white' }} />
      case 'bugreport':
        return <BugReportIcon className='insightsBoxIcon' style={{ color: 'white' }} />
      case 'timer':
        return <TimerIcon className='insightsBoxIcon' style={{ color: 'white' }} />
      case 'check-circle':
        return <CheckCircleIcon className='insightsBoxIcon' style={{ color: 'white' }} />
      default:
        return <AssignmentIcon className='insightsBoxIcon' style={{ color: 'white' }} />
    }
  }

  render() {
    let {color, color1, title, value, icon, classes} = this.props;

    return (
      <Paper className='insightsBox'>
        <div
          className='insightsBoxSmall'
          style={{ backgroundImage: `linear-gradient(to bottom left, ${color}, ${color1})` }}>
          {this.getIcon(icon)}
        </div>
        <div className='insightsBoxData'>
          <div className='helpIconContainer'>
            <Tooltip
                classes={{
                  tooltip: classes.tooltip,
                  popper: classes.popper,
                }}
                title={this.props.help}>
              <HelpIcon />
            </Tooltip>
          </div>
          <h5 className="insightsBoxDataTitle">{title}</h5>
          <div className='insightsBoxDataValue' style={{ color }}>{value}</div>
        </div>
      </Paper>
    )
  }
}

export default withStyles(styles)(InsightsBox)
