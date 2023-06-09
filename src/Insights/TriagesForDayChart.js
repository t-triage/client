import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import * as _  from "underscore"

import ChartOptionsBar from './ChartOptionsBar'

import Typography from "@material-ui/core/Typography"
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

const LABELS = [
  { title: 'Triaged', name: 'triaged', color: COLORS.blue },
  { title: 'Total', name: 'total', color: COLORS.red },
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
                payload && payload.map((data, i) => {
                  return (
                    <div key={i} style={{
                      color: data.fill,
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

class TriagesForDayChart extends Component {
  state = {
    triages: [],
  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTriagesForDayForUser )
        .then(res => {
            this.setState({
              // TODO should shortlist on BE
              triages: res.data.slice(0, 6),
            })
        })
  }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.executorId != prevProps.executorId){
            this.fetchData();
        }
    }

    fetchData(){
        let {executorId} = this.props;
        axios({
            method: 'GET',
            url: Api.getBaseUrl() + Api.ENDPOINTS.GetExecutorCommitsStat,
            params:{
                executorid: executorId,
            },
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
        })
            .then((res) => {
                this.setState({
                    // TODO should shortlist on BE
                    triages: res.data,
                })
            })
    }

  render() {
    let {classes} = this.props;
    let {triages} = this.state;

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
                    The amount of triages done by day
                </div>
              }>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {'Triages per day'}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ChartOptionsBar labels={LABELS} className='chartToTriageOptionBoxSmall' style={{ width: '200px' }} />
        </div>
        <div className="chartGeneralContainer">
          {
            triages.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={triages}
                  margin={{ top: 30, right: 30, left: 30 }}>
                  <XAxis reversed={true} interval={'preserveEnd'} dataKey="shortName"/>
                  <YAxis/>
                  <CartesianGrid />
                  <TooltipRechart content={<CustomTooltip />} />
                  <Line type="linear" dataKey="triaged" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
                  <Line type="linear" dataKey="total" stroke={COLORS.red} fill={COLORS.red} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.red }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
          {
            triages.length === 0 && (
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

export default withStyles(styles)(TriagesForDayChart)
