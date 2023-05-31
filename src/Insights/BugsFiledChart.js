import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import { _ } from "underscore"

import ChartOptionsBar from './ChartOptionsBar'

import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import { withStyles } from '@material-ui/core/styles';

import HelpIcon from "@material-ui/icons/Help"

import { styles, COLORS } from '../Main/Components/Globals'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as TooltipRechart,
} from 'recharts';

const LABELS = [
  { title: 'Total', name: 'total', color: COLORS.blue },
  { title: 'Fixed', name: 'newFixes', color: COLORS.red },
  { title: 'Open', name: 'openIssues', color: COLORS.green },
  { title: 'Reopen', name: 'reopenIssues', color: COLORS.purple },
  { title: 'Passing', name: 'passingIssues', color: COLORS.orange },
]

class CustomTooltip extends Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      return (
        <div className="insightsCustomTooltip chartToTriageTooltip">
            <div className='chartToTriageTooltipTitle'>{payload[0].payload.name}</div>
            <div>
              {
                payload && payload.map((data, i) => {
                  return (
                    <div key={i} style={{
                      color: data.fill,
                    }}>
                      <p style={{
                        margin: '10px 0',
                      }}>{`${_.find(LABELS, {name: data.dataKey}).title}: ${data.value}`}</p>
                    </div>
                  )
                })
              }
            </div>
        </div>
      );
    }

    return null;
  }
}

class BugsFiledChart extends Component {
  state = {
    bugsFiled: [],
  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetBugsFiled )
        .then(res => {
            this.setState({
              // TODO should shortlist on BE
              bugsFiled: res.data.slice(0, 6),
            })
        })
  }

  render() {
    let {classes} = this.props;
    let {bugsFiled} = this.state;

    return (
      <div className='chartMainContainer'>
        <div className='helpIconContainer'>
          <Tooltip
              classes={{
                tooltip: classes.tooltip,
                popper: classes.popper,
              }}
              title={
                <div>
                    The amount of bugs discovered by automation.
                </div>
              }>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {'Test Triaged with Automation issues'}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ChartOptionsBar labels={LABELS} className='chartToTriageOptionBoxSmall' style={{ width: '450px' }} />
        </div>
        <div className="chartGeneralContainer">
          {
            bugsFiled.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bugsFiled}
                  margin={{ top: 30, right: 30, left: 30 }}>
                  <XAxis reversed={true} interval={'preserveEnd'} dataKey="shortName"/>
                  <YAxis/>
                  <CartesianGrid />
                  <TooltipRechart content={<CustomTooltip />} />
                  <Line type="linear" dataKey="total" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
                  <Line type="linear" dataKey="newFixes" stroke={COLORS.red} fill={COLORS.red} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.red }} />
                  <Line type="linear" dataKey="openIssues" stroke={COLORS.green} fill={COLORS.green} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.green }} />
                  <Line type="linear" dataKey="reopenIssues" stroke={COLORS.purple} fill={COLORS.purple} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.purple }} />
                  <Line type="linear" dataKey="passingIssues" stroke={COLORS.orange} fill={COLORS.orange} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.orange }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
          {
            bugsFiled.length === 0 && (
              <div className="circularProgressContainer">
                  <CircularProgress color="primary" />
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(BugsFiledChart)
