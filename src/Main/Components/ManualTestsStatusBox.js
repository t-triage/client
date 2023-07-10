import React, { Component } from "react"
import Grid from "@mui/material/Grid"

import Tooltip from "@mui/material/Tooltip"
import withStyles from '@mui/styles/withStyles';

import { styles, COLORS } from './Globals'

const height = 12;

class ManualTestsStatusBox extends Component {
    constructor(props) {
        super(props)
    }

    getPercentage(value, total) {
        let percentage = total !== 0 ? Math.floor((value / total) * 100) : 100;

			return `${percentage}%`;
    }

    getTooltipContent(total) {
      let {build} = this.props;
      if (total != 0) {
        var percentage = (build.pass / total) * 100
      } else
        var percentage = 0

      return (
        <div>
          <div style={{ marginBottom: 5, fontWeight: 'bold' }}>
              <span>{`Total tests: ${total}`}</span>
          </div>
          <div style={{ color: COLORS.failManualTest, marginBottom: 5, marginLeft: 15 }}>
              <span>{`Fails: ${build.fail}`}</span>
          </div>
					<div style={{ color: COLORS.blocked, marginBottom: 5, marginLeft: 15 }}>
						<span>{`Blocked: ${build.blocked}`}</span>
					</div>
          <div style={{ color: COLORS.no, marginBottom: 5, marginLeft: 15 }}>
              <span>{`No: ${build.no}`}</span>
          </div>
          <div style={{ color: COLORS.inProgress, marginBottom: 5, marginLeft: 15  }}>
              <span>{`In Progress: ${build.inProgress}`}</span>
          </div>
					<div style={{ color: COLORS.pass, marginBottom: 5, marginLeft: 15  }}>
              <span>{`Pass: ${build.pass}`}</span>
          </div>
					<div style={{ marginBottom: 5, marginLeft: 15 }}>
						<span>{`Pending: ${build.pending}`}</span>
					</div>
          <div style={{ color: COLORS.pass }}>
              <span>{`Pass: ${build.pass} - ${Math.floor(percentage)}%`}</span>
          </div>
        </div>
      )
    }

    render() {
        let {build, classes} = this.props;
        let total = build.fail + build.blocked + build.pending + build.no + build.inProgress + build.pass;

        return (
            <Tooltip
                classes={{
                  tooltip: classes.tooltip,
                  popper: classes.popper,
                }}
                title={this.getTooltipContent(total)}>
                <Grid container style={{ boxShadow: '0 1px 10px #ccc' }}>
                    <Grid item style={{
                        backgroundColor: COLORS.failManualTest,
                        width: this.getPercentage(build.fail, total),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.blocked,
                        width: this.getPercentage(build.blocked, total),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.no,
                        width: this.getPercentage(build.no, total),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.inProgress,
                        width: this.getPercentage(build.inProgress, total),
                        height,
                      }}></Grid>
                    <Grid item style={{
                      backgroundColor: COLORS.pass,
                      width: this.getPercentage(build.pass, total),
                      height,
                    }}></Grid>
                    <Grid item style={{
                      backgroundColor: COLORS.pending,
                      width: this.getPercentage(build.pending, total),
                      height,
                    }}></Grid>
                </Grid>
            </Tooltip>
        )
    }
}

export default withStyles(styles)(ManualTestsStatusBox)
