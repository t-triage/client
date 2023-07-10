import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import * as _  from "underscore"

import ChartOptionsBar from './ChartOptionsBar'

import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import withStyles from '@mui/styles/withStyles';

import HelpIcon from "@mui/icons-material/Help"

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
  { title: 'Fixes', name: 'newFixes', color: COLORS.blue },
  { title: 'Fails', name: 'fails', color: COLORS.red },
  { title: 'New Tests', name: 'newTests', color: COLORS.green },
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
                payload.map((data, i) => {
                  return (
                    <div key={i} style={{
                      color: data.stroke,
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

class TrendChart extends Component {
  state = {
    trends: [],
  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetBurndown )
        .then(res => {
            this.setState({
              // TODO should shortlist on BE
              trends: res.data.slice(0, 6),
            })
        })
  }

  render() {
    let {classes} = this.props;
    let {trends} = this.state;
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
                    <div>
                        Historic chart computed the last day of the month by taking into account:
                    </div>
                    <ul style={{ paddingLeft: 20, marginTop: 5 }}>
                        <li>All the test that has failed (even if they were triaged),</li>
                        <li>New automated tests that has appeared during the month and</li>
                        <li>Automated tests that were broken and now are resolved.</li>
                    </ul>
                </div>
              }>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {'Burndown: Fails vs. new tests and fixes'}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ChartOptionsBar labels={LABELS} className='chartToTriageOptionBoxSmall' style={{ width: '250px' }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginLeft: '-50px',
          fontSize: 12,
        }}>
          {
            trends.length > 0 && (
              <ResponsiveContainer width="100%" height={278}>
                <LineChart data={trends}
                  margin={{ top: 30, right: 30, left: 30 }}>
                  <XAxis reversed={true} interval={'preserveEnd'} dataKey="shortName"/>
                  <YAxis/>
                  <CartesianGrid />
                  <TooltipRechart content={<CustomTooltip />} />
                  <Line type="linear" dataKey="newFixes" stroke={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
                  <Line type="linear" dataKey="fails" stroke={COLORS.red} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.red }} />
                  <Line type="linear" dataKey="newTests" stroke={COLORS.green} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.green }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
          {
            trends.length === 0 && (
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

export default withStyles(styles)(TrendChart)
