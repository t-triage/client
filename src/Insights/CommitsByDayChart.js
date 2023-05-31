import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import { _ } from "underscore"

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


class CustomTooltip extends Component {
    render() {
        const { active } = this.props;

        if (active) {
            const { payload, label } = this.props;
            let{commitCount} = payload[0].payload;

            return (
                <div className="insightsCustomTooltip chartToTriageTooltip">
                    <div className='chartToTriageTooltipTitle'>{payload[0].payload.commitDay}</div>
                    <div>
                        {
                            `Commit count: ${commitCount}`
                        }

                    </div>
                </div>
            );
        }

        return null;
    }
}

class CommitsByDayChart extends Component {
    state = {
        commits: [],
        loading: true,
    }

    componentDidMount() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetCommitsPerDay )
            .then(res => {
                this.setState({
                    commits: res.data,
                    loading: false
                })
            })
    }

    render() {
        let {classes} = this.props;
        let {commits, loading} = this.state;

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
                                The amount of commits done by day in the last month
                            </div>
                        }>
                        <HelpIcon />
                    </Tooltip>
                </div>
                <h4 className="chartTitle">
                    {'Commits per day in the last month'}
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
                                        <LineChart data={commits}
                                                margin={{ top: 30, right: 30, left: 30 }}>
                                            <XAxis dataKey="commitDay" interval={'preserveEnd'}/>
                                            <YAxis/>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <TooltipRechart content={<CustomTooltip />} />
                                            <Line type="monotone"   dataKey="commitCount" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
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

export default withStyles(styles)(CommitsByDayChart)
