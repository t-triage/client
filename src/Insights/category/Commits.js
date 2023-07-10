import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'

import HorizontalBarChart from '../HorizontalBarChart'
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import CircularChart from "../CircularChart";
import BugsFiledChart from "../BugsFiledChart";
import SuiteEvolutionChart from "../SuiteEvolutionChart";
import CommitsByPersonChart from "../CommitsByPersonChart";
import TrendChart from "../TrendChart";
import CommitsByDayChart from "../CommitsByDayChart";
import CommitsByPersonAndByDayChart from "../CommitsByPersonAndByDayChart";

export default class Commits extends Component {


    state= {
        repoLog: null,
        totalCommits: 0
    }

    componentWillMount() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetCommitsPerPerson )
            .then(res => {
                let {data} = res
                let totalCommits = 0;
                data.map(dat => {
                    totalCommits += dat.commitCount;
                    return null;
                })
                this.setState({
                    repoLog: data,
                    totalCommits
                })
            })
    }


    render() {
        return (
            <Grid container spacing={24} justifyContent="center">
                <Grid item xs={10}>
                    <Paper className='chartBigContainer'>
                        <CommitsByPersonChart
                            title="Commits per author"
                            repoLog={this.state.repoLog}
                            totalCommits={this.state.totalCommits}
                            randomColors={true}
                            tooltip={
                                <div>
                                    Top 5 commits authors in the last two weeks
                                </div>
                            } />
                    </Paper>

                    <Paper className='chartBigContainer'>
                        <CommitsByDayChart />
                    </Paper>

                    <Paper className='chartBigContainer'>
                        <CommitsByPersonAndByDayChart

                            randomColors={true}
                        />
                    </Paper>
                </Grid>
            </Grid>
        );
    }

}

