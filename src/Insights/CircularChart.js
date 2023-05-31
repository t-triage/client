import React, { Component } from 'react';

import { styles, COLORS } from '../Main/Components/Globals'

import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import { withStyles } from '@material-ui/core/styles';

import HelpIcon from "@material-ui/icons/Help"

import {
  PieChart,
  Pie,
  Tooltip as TooltipRechart,
  Cell,
  ResponsiveContainer,
} from 'recharts'

const CUSTOM_COLORS = [COLORS.green, COLORS.red, COLORS.blue]
const CUSTOM_COLORS1 = [COLORS.green, COLORS.red, COLORS.blue, COLORS.purple, COLORS.orange, COLORS.green1, COLORS.redLight, COLORS.blueLight, COLORS.purple1, COLORS.orange1]

const RADIAN = Math.PI / 180;

class CustomTooltip extends Component {
  render() {
    const { active, totalSummary } = this.props;

    if (active) {
      const { payload, label } = this.props;
      let {value} = payload[0];
      let {fill, key, description} = payload[0].payload;

      return (
        <div className="insightsCustomTooltip chartTotalSummaryTooltip"
            style={{ color: fill }}>
            {
              key !== '' && (
                <p className="label">
                  {
                    `${description ? description : name === 'TriagedFails' ? 'Triaged Fails' : key}: ${value} - ${((value * 100)/totalSummary).toFixed(1)}%`
                  }
                </p>
              )
            }
            {
              key === '' && (
                <p className="label">
                  {`No data available`}
                </p>
              )
            }
        </div>
      );
    }

    return null;
  }
}

class CircularChart extends Component {

  prevY = 0;

  renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, index, key, fill, value }) {
    let {totalSummary} = this.props;
   	const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
    const x  = cx + radius * Math.cos(-midAngle * RADIAN);
    let y = cy  + radius * Math.sin(-midAngle * RADIAN);
    // y = this.prevY === y ? y + 15 : this.prevY - y < 5 ? y + 5 : y;
    // this.prevY = y;
    return (
      <text
          x={x < cx ? x - 8 : x + 8}
          y={y}
          fill={fill}
          textAnchor={x > cx ? 'start' : 'end'}
          style={{ fontSize: '.875rem' }}
          dominantBaseline="central">
        {`${key === 'TriagedFails' ? 'Triaged Fails' : key}`}
      </text>
    );
  };

  render() {
    let {title, testSummary, totalSummary, classes, randomColors, tooltip} = this.props;

    return (
      <div className='chartMainContainer'>
        <div className='helpIconContainer'>
          <Tooltip
              classes={{
                tooltip: classes.tooltip,
                popper: classes.popper,
              }}
              title={tooltip}>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {`${title}: ${totalSummary}`}
        </h4>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          {
            testSummary && testSummary.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testSummary}
                      dataKey='value'
                      labelLine={testSummary.length === 1 ? false : true}
                      isAnimationActive={false}
                      label={this.renderCustomizedLabel.bind(this)}>
                      {
                        testSummary.map((entry, index) => <Cell key={index} fill={
                          entry.key === '' ? COLORS.grey :
                          !randomColors ? CUSTOM_COLORS[index % CUSTOM_COLORS.length] : CUSTOM_COLORS1[index % CUSTOM_COLORS1.length]
                        }/>)
                      }
                    </Pie>
                    <TooltipRechart
                        content={<CustomTooltip totalSummary={totalSummary} />} />
                  </PieChart>
              </ResponsiveContainer>
            )
          }
          {
            testSummary && testSummary.length === 0 && (
              <div className="circularProgressContainer">
                  <div className="noRowsSuites">No data available</div>
              </div>
            )
          }
          {
            !testSummary && <div className="circularProgressContainer">
                <CircularProgress color="primary" />
              </div>
          }
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(CircularChart)
