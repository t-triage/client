import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"

import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import withStyles from '@mui/styles/withStyles';

import HelpIcon from "@mui/icons-material/Help"

import { styles, COLORS } from '../Main/Components/Globals'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as TooltipRechart,
} from 'recharts'

class CustomTooltip extends Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      return (
        <div className="insightsCustomTooltip chartToTriageTooltip">
            <div className='chartToTriageTooltipTitle'>{label}</div>
            <div>
              {
                payload && payload.map((data, i) => {
                  return (
                    <div key={i} style={{
                      color: data.fill,
                    }}>
                      <p style={{
                        margin: '10px 0',
                      }}>{`${data.name}: ${data.value}`}</p>
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

class MissingDeadlinesChart extends Component {
  state = {
    missingDeadlines: [],
  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetMissingDeadlines )
        .then(res => {
            this.setState({
              // TODO should shortlist on BE
              missingDeadlines: res.data.slice(0, 6),
            })
        })
  }

  render() {
    let {classes} = this.props;
    let {missingDeadlines} = this.state;

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
                    Suites that were not triaged on time.<br />i.e.the Suite whose deadlines have been Overdue for more than 4 days.
                </div>
              }>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {`Missing Deadlines`}
        </h4>
        <div className="chartGeneralContainer">
          {
            missingDeadlines.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    maxBarSize={20}
                    margin={{ top: 30, right: 30, left: 30 }}
                    data={missingDeadlines}>
                    <TooltipRechart content={<CustomTooltip />} />
                    <CartesianGrid/>
                    <XAxis reversed={true} interval={'preserveEnd'} dataKey="shortName" />
                    <YAxis />
                    <Bar stackId="a" dataKey="total" fill={COLORS.blue} />
                  </BarChart>
              </ResponsiveContainer>
            )
          }
          {
            missingDeadlines.length === 0 && (
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

export default withStyles(styles)(MissingDeadlinesChart)
