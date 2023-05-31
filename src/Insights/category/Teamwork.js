import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import MissingDeadlinesChart from '../MissingDeadlinesChart'
import HorizontalBarChart from '../HorizontalBarChart'
import TrendChart from '../TrendChart'
import EngEffortChart from '../EngEffortChart'
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"

export default class Teamwork extends Component {
  state = {
    automationFixedPending: null,
  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAutomationFixedPending )
        .then(res => {
            let {data} = res
            this.setState({
              automationFixedPending: data,
            })
        })
  }

  render() {
    let {automationFixedPending} = this.state
    return (
      <Grid container spacing={24} justify="center">
          <Grid item xs={10}>
              <Paper className='chartBigContainer'>
                  <TrendChart />
              </Paper>
              <Paper className='chartBigContainer'>
                  <HorizontalBarChart data={automationFixedPending} type='automationFixedPending' automationLabels  />
              </Paper>
          </Grid>
      </Grid>
    )
  }
}
