import React, { Component } from "react"
import Grid from "@mui/material/Grid"

import InfoBox from "./InfoBox"
import Tooltip from "@mui/material/Tooltip"
import withStyles from '@mui/styles/withStyles';

import { styles, COLORS } from './Globals'

import { red as Red, blue as Blue, amber as Amber } from '@mui/material/colors';

const height = 12;

class StatusBox extends Component {
    constructor(props) {
        super(props)
    }

    getPercentage(build, type) {
        let {
          barNewFails,
          barFails,
          barNowPassing,
          barManualTriaged,
          barAutoTriaged,
        } = build;

        switch (type) {
          case 'newFails':
              return `${barNewFails}%`;
          case 'fails':
              return `${barFails}%`;
          case 'nowPassing':
              return `${barNowPassing}%`;
          case 'manualTriaged':
              return `${barManualTriaged}%`;
          case 'autoTriaged':
              return `${barAutoTriaged}%`;
          default:
              return '100%';
        }
    }

    getTooltipContent() {
      let {build} = this.props;
      if (build.totalTests != 0) {
        var percentage = (build.passCount / build.totalTests) * 100
      } else
        var percentage = 0

      return (
        <div>
          <div style={{ marginBottom: 5, fontWeight: 'bold' }}>
              <span>{`To Triage: ${build.totalTestsToTriage}`}</span>
          </div>
          <div style={{ color: COLORS.newFail, marginBottom: 5, marginLeft: 15 }}>
              <span>{`New Fails: ${build.totalNewFails}`}</span>
          </div>
          <div style={{ color: COLORS.fail, marginBottom: 5, marginLeft: 15 }}>
              <span>{`Fails: ${build.totalFails}`}</span>
          </div>
          <div style={{ color: COLORS.newPass, marginBottom: 5, marginLeft: 15 }}>
              <span>{`New Pass: ${build.totalNowPassing}`}</span>
          </div>
          <div style={{ color: COLORS.manualTriaged }}>
              <span>{`Manually Triaged: ${build.manualTriaged}`}</span>
          </div>
          <div>
              <span>{`Auto Triaged: ${build.autoTriaged}`}</span>
          </div>
          <div style={{ color: COLORS.newPass }}>
              <span>{`Pass: ${build.passCount} - ${Math.floor(percentage)}%`}</span>
          </div>
        </div>
      )
    }

    render() {
        let {build, classes} = this.props;

        return (
            <Tooltip
                classes={{
                  tooltip: classes.tooltip,
                  popper: classes.popper,
                }}
                title={this.getTooltipContent()}>
                <Grid container style={{ boxShadow: '0 1px 10px #ccc' }}>
                    <Grid item style={{
                        backgroundColor: COLORS.newFail,
                        width: this.getPercentage(build, 'newFails'),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.fail,
                        width: this.getPercentage(build, 'fails'),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.newPass,
                        width: this.getPercentage(build, 'nowPassing'),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.manualTriaged,
                        width: this.getPercentage(build, 'manualTriaged'),
                        height,
                      }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.autoTriaged,
                        width: this.getPercentage(build, 'autoTriaged'),
                        height,
                      }}></Grid>
                </Grid>
            </Tooltip>
        )
    }
}

export default withStyles(styles)(StatusBox)
