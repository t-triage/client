import React, { Component } from 'react'
import Api from "../../Main/Components/Api"

import {Grid, Paper} from "@material-ui/core"
import TrendGoalStats from "../TrendGoalStats";
import TrendGoalDayPicker from "../TrendGoalDayPicker";
import {withStyles} from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import ExecutorsPicker from "../../Main/Components/ExecutorsPicker";
import 'react-day-picker/lib/style.css';

const BootstrapInput = withStyles(theme => ({
    input: {
        border: 'none',
    },
}))(InputBase);

export default class TrendGoals extends Component {
    constructor(props) {
        super(props)
        this.timeHandler = this.timeHandler.bind(this)
    }

    state = {
        executorId : null,
        executorName : "",
        fromTime: undefined,
        toTime: undefined,
        stats: [
            {'growth': Api.ENDPOINTS.GetExecutorGrowthStat},
            {'pass rate': Api.ENDPOINTS.GetExecutorPassingStat},
            {'stability': Api.ENDPOINTS.GetExecutorStabilityStat},
            {'triage done': Api.ENDPOINTS.GetExecutorTriageDoneStat},
            {'commits': Api.ENDPOINTS.GetExecutorCommitsStat}
        ]
    }

    fetchExecutor = (id, name) => {
        this.setState({
            executorId: id,
            executorName: name
        })
    }

    timeHandler(from, to) {
        this.setState({
            fromTime: from,
            toTime: to
        })
    }

    render() {
        let { fromTime, toTime, executorId, executorName, stats } = this.state;
        return (
            <Grid container spacing={24} justify="center">
                <Grid item xs={8}>
                    <TrendGoalDayPicker executorName={executorName} timeHandler={this.timeHandler}/>
                </Grid>
                <Grid container spacing={24} justify="flex-start">
                    <Grid item xs={2}>
                        <ExecutorsPicker fetchExecutor={this.fetchExecutor} />
                    </Grid>
                    <Grid item xs={8}>
                        {stats.map(stat => {
                            let title = Object.keys(stat)[0]
                            let endpoint = stat[title]
                            return (
                                <Paper key={`paper-${title}`} className='chartBigContainer'>
                                    <TrendGoalStats key={`chart-${title}`} endpoint={endpoint} title={title} executorId={executorId} fromTime={fromTime} toTime={toTime}/>
                                </Paper>
                            )
                        })}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}