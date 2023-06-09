import React, {Component} from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import * as _  from "underscore"

import ChartOptionsBar from './ChartOptionsBar'

import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import {withStyles} from '@material-ui/core/styles';

import HelpIcon from "@material-ui/icons/Help"

import {styles, COLORS} from '../Main/Components/Globals'


import {
    LineChart,
    Line,
    BarChart,
    Bar,
    Legend,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as TooltipRechart,
} from 'recharts';

const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

const CUSTOM_COLORS = [COLORS.green, COLORS.red, COLORS.blue, COLORS.purple, COLORS.orange, COLORS.green1, COLORS.redLight, COLORS.blueLight, COLORS.purple1, COLORS.orange1]

class CommitsByPersonAndByDayChart extends Component {
    state = {
        commits: [],
        loading: true,
    }

    componentDidMount() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetCommitsPerPersonAndPerDay)
            .then(res => {
                this.setState({
                    commits: res.data,
                    loading: false,
                })
            })
    }

    render() {
        let {classes} = this.props;
        let {commits, loading} = this.state;

        let pickedColor;
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
                                Top 7 commits authors by day in the last month
                            </div>
                        }>
                        <HelpIcon/>
                    </Tooltip>
                </div>
                <h4 className="chartTitle">
                    {'Commits per author and per day in the last month'}
                </h4>
                <div>
                    {
                        loading ?
                            <div className="circularProgressContainer">
                                <CircularProgress color="primary" />
                            </div>
                        :
                            (commits.length > 0 ?
                                <div className="chartGeneralContainer">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart
                                            margin={{top: 30, right: 30, left: 30}}>
                                            <XAxis interval={'preserveEnd'} dataKey="category"
                                                allowDuplicatedCategory={false}/>
                                            <YAxis dataKey="value"/>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <TooltipRechart/>
                                            <Legend/>
                                            {commits.map((a, i) => (
                                                    <Line
                                                        connectNulls={true}
                                                        type="linear"
                                                        dataKey="value"
                                                        data={a.data}
                                                        name={a.name}
                                                        key={a.name}
                                                        stroke={CUSTOM_COLORS[i % CUSTOM_COLORS.length]}
                                                        fill={pickedColor}
                                                        strokeWidth={3} dot={false}
                                                        activeDot={{
                                                            strokeWidth: 3,
                                                            stroke: pickedColor
                                                        }}/>
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            :
                                <p className="label" style={{color: 'darkgray'}}>
                                    No data available
                                </p>)
                    }
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(CommitsByPersonAndByDayChart)
