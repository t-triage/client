/* TrendGoalCommits, TrendGoalStats,TrendGoalPassRate,TrendGoalStability,TrendGoalTriageDone
Todos estos componentes son iguales, no mas cambian el endpoint al que se le pega
Habria que hacer refactorearlos en un solo componente que acepte un parametro para saber que data queremos mostrar
y en base a eso saber a que endpoint pegarle */

import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import * as _  from "underscore"

import ChartOptionsBar from './ChartOptionsBar'

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
  { title: 'Expected', name: 'triaged', color: COLORS.green },
  { title: 'Required', name: 'total', color: COLORS.blue },
  { title: 'Actual', name: 'total', color: COLORS.red },
]

class TrendGoalStats extends Component {
  state = {
      data: [],
      loading: true,
  }

	componentDidUpdate(prevProps, prevState) {
		if(this.props.executorId != prevProps.executorId || this.props.fromTime != prevProps.fromTime || this.props.toTime != prevProps.toTime) {
			this.setState({
				loading: true
			}, this.fetchData())
		}
	}

  fetchData() {
      let {executorId, fromTime, toTime} = this.props;
      axios({
          method: 'GET',
          url: Api.getBaseUrl() + this.props.endpoint, 
          params:{
              executorid: executorId,
              from: fromTime,
              to: toTime
          },
          headers: {
              'Content-Type': 'application/json; charset=UTF-8',
          },
      })
          .then((res) => {
              this.setState({
                  data: res.data,
                  loading: false,
              })
          })
  }

    render() {
    let {classes, title} = this.props;
    let {data, loading} = this.state;

    return (
      <div className='chartMainContainer'>
        <div className='helpIconContainer'>
          <Tooltip
              classes={{
                tooltip: classes.tooltip,
                popper: classes.popper,
              }}
              title={
                <div>Shows the {title} stats by day</div>
              }>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {title}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ChartOptionsBar labels={LABELS} className='chartToTriageOptionBoxSmall' style={{ width: '300px' }} />
        </div>
        <div>
          {
            loading ?
              <div className="circularProgressContainer">
                <CircularProgress color="primary" />
              </div>
            :
              (data.length > 0 ?
                <div className="chartGeneralContainer">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}
                      margin={{ top: 30, right: 30, left: 30 }}>
                      <XAxis reversed={true} interval={'preserveEnd'} dataKey="date"/>
                      <YAxis/>
                      <CartesianGrid />
                      <TooltipRechart/>
                      <Line type="linear" dataKey="expected" stroke={COLORS.green} fill={COLORS.green} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.green }} />
                      <Line type="linear" dataKey="required" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
                      <Line type="linear" dataKey="actual" stroke={COLORS.red} fill={COLORS.red} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.red }} />
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

export default withStyles(styles)(TrendGoalStats)
