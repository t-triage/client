import React, { Component } from 'react';

import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import withStyles from '@mui/styles/withStyles';

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import TimerIcon from '@mui/icons-material/Timer'
import HelpIcon from "@mui/icons-material/Help"
import BugReportIcon from "@mui/icons-material/BugReport"

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
