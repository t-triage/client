import React, { Component } from 'react';

import { styles, COLORS } from '../Main/Components/Globals'

import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import withStyles from '@mui/styles/withStyles';

import HelpIcon from "@mui/icons-material/Help"

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
        const { active, totalCommits } = this.props;

        if (active) {
            const { payload, label } = this.props;
            
            let {fill, authorName, commitCount } = payload[0].payload;

            return (
                <div className="insightsCustomTooltip chartTotalSummaryTooltip"
                     style={{ color: fill }}>
                    {
                        authorName !== '' && (
                            <p className="label">
                                {
                                    `${authorName}: ${commitCount} - ${((commitCount * 100)/totalCommits).toFixed(1)}%`
                                }
                            </p>
                        )
                    }
                    {
                        authorName === '' && (
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
class CommitsByPersonChart extends Component {

    prevY = 0;

    renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, index, authorName, fill, value }) {
        const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
        const x  = cx + radius * Math.cos(-midAngle * RADIAN);
        let y = cy  + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x < cx ? x - 8 : x + 8}
                y={y}
                fill={fill}
                textAnchor={x > cx ? 'start' : 'end'}
                style={{ fontSize: '.875rem' }}
                dominantBaseline="central">
                {authorName}
            </text>
        );
    };

    render() {
        let {title, repoLog,totalCommits,  classes, randomColors, tooltip} = this.props;

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
                    {`${title}`}
                </h4>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    {
                        repoLog && repoLog.length > 0 && (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={repoLog}
                                        dataKey='commitCount'
                                        labelLine={repoLog.length === 1 ? false : true}
                                        isAnimationActive={false}
                                        label={this.renderCustomizedLabel.bind(this)}>
                                        {
                                            repoLog.map((entry, index) => <Cell key={index} fill={
                                                entry.key === '' ? COLORS.grey :
                                                    !randomColors ? CUSTOM_COLORS[index % CUSTOM_COLORS.length] : CUSTOM_COLORS1[index % CUSTOM_COLORS1.length]
                                            }/>)
                                        }
                                    </Pie>

                                    <TooltipRechart
                                        content={<CustomTooltip totalCommits={totalCommits} />} />
                                </PieChart>
                            </ResponsiveContainer>
                        )
                    }
                    {
                        repoLog && repoLog.length === 0 &&
                        (
                        <p className="label" style={{color: 'darkgray'}}>
                            No data available
                        </p>
                        )
                    }
                    {
                        !repoLog && <div className="circularProgressContainer">
                            <CircularProgress color="primary" />
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(CommitsByPersonChart)
