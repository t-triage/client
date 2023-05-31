import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import CircularChart from '../CircularChart'
import BugsFiledChart from '../BugsFiledChart'
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import SuiteEvolutionChart from '../SuiteEvolutionChart'

export default class AutomationEngine extends Component {
  state = {
    totalFailExceptions: 0,
    failExceptions: null,
  }

  componentWillMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetFailExceptions )
        .then(res => {
            let {data} = res
            let totalFailExceptions = 0;
            data.map(dat => {
              totalFailExceptions += dat.value;
              return null;
            })
            this.setState({
              failExceptions: data.length > 0 ? data : [{ key: '', value: 100 }],
              totalFailExceptions,
            })
        })
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
          <Grid item xs={10}>
              <Paper className='chartBigContainer'>
                  <CircularChart
                      title="Fail Exceptions"
                      testSummary={this.state.failExceptions}
                      totalSummary={this.state.totalFailExceptions}
                      randomColors={true}
                      tooltip={
                        <div>
                            The most common exceptions of the last 10 days.
                        </div>
                      } />
              </Paper>
              <Paper className='chartBigContainer'>
                <BugsFiledChart />
              </Paper>
              <Paper className='chartBigContainer'>
                <SuiteEvolutionChart />
              </Paper>
          </Grid>
      </Grid>
    )
  }
}
