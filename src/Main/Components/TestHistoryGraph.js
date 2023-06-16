import React, { Component } from 'react';
import Api from "./Api"
import axios from 'axios'
import CircularProgress from "@mui/material/CircularProgress"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { COLORS } from './Globals'
import {
  getApplicationFailTagName,
  getTestFailTagName,
  getStatusTagColor,
  getStatusTagName,
  dialogProps,
} from './TriageUtils'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Dot,
  Tooltip as TooltipRechart,
} from 'recharts';

const CATEGORIES = [
  1, 2, 3, 4, 5
]

const CustomizedDot = (props) => {
  let {payload} = props;
  if (payload.triaged) {
    return <Dot
                {...props}
                fill={COLORS.autoTriaged}
                strokeWidth={2}
                stroke={COLORS.primary}
                r={6} />
  } else {
    return <Dot {...props} stroke={COLORS.primary} />
  }
}

class CustomTooltip extends Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      const margin = '10px 0'
      return (
        <div className="insightsCustomTooltip chartToTriageTooltip">
            <div className='chartToTriageTooltipTitle' style={{ marginTop: 0 }}>Build #{label}</div>
            <div>
              {
                payload && payload.map((data, i) => {
                  return (
                    <div key={i} style={{ color: COLORS.greyDark }}>
                      <div style={{ margin, display: 'flex', alignItems: 'center' }}>
                        <b>Date: </b>
                        {`${new Date(data.payload.timestamp).toLocaleDateString("en-US", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: false,
                        })}`}
                      </div>
                      <div style={{ margin, display: 'flex', alignItems: 'center' }}>
                        <b>Status:</b>
                        <span className="statusTag statusTagTooltip"
                              style={{
                                  backgroundColor: getStatusTagColor(data.payload.currentState),
                              }}>{getStatusTagName(data.payload.currentState)}</span>
                      </div>
                      <div style={{ margin }}><b>Product:</b> {getApplicationFailTagName(data.payload.applicationFailType)}</div>
                      <div style={{ margin }}><b>Automation Test:</b> {getTestFailTagName(data.payload.testFailType)}</div>
                      {
                        data.payload.triaged && <div style={{ display: 'flex', alignItems: 'center', color: COLORS.primary, fontWeight: 'bold' }}>
                            <CheckCircleIcon style={{ color: COLORS.primary, fontSize: '.875rem' }} /> TRIAGED
                        </div>
                      }
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

export default class TestHistoryGraph extends Component {
  state = {
    testHistory: null,
    testHistoryAll: null,
    dialogOpen: false,
  }

  renderGraphDialog() {
    let {dialogOpen, testHistoryAll} = this.state;
    let props = {
      open: dialogOpen,
      onClose: this.onDialogClose.bind(this),
    }

    return dialogOpen && (
      <Dialog
          {...dialogProps}
          {...props}
          aria-describedby="historyStats-dialog-description">
        <DialogContent id="stackTrace-dialog-description">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={testHistoryAll}
                margin={{ top: 30, right: 30, left: 30 }}>
                <XAxis
                    tickFormatter={(value) => `#${value}`}
                    dataKey="buildNumber" />
                <YAxis
                    minTickGap={0}
                    domain={[0, 6]}
                    tickFormatter={this.renderCustomizedLabel}
                    ticks={CATEGORIES}/>
                <CartesianGrid />
                <TooltipRechart content={<CustomTooltip />} />
                <Line
                    type="linear"
                    dataKey="stateNumber"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    strokeWidth={3}
                    dot={<CustomizedDot />}
                    activeDot={<CustomizedDot />} />
              </LineChart>
            </ResponsiveContainer>
        </DialogContent>
        <DialogActions>
            <Button
                onClick={props.onClose}
                className="globalButton"
                variant="contained"
                color={'primary'}>
                {'Close'}
            </Button>
        </DialogActions>
      </Dialog>
    )
  }

  onDialogOpen() {
    this.setState({
      dialogOpen: true,
    })
  }

  onDialogClose() {
    this.setState({
      dialogOpen: false,
    })
  }

  renderCustomizedLabel(value) {
    switch (value) {
      case 1:
          return "Pass"
      case 2:
          return "New\u00A0Pass"
      case 3:
          return "Permanent"
      case 4:
          return "Fail"
      case 5:
          return "New\u00A0Fail"
      default:
          return value
    }
  };

  componentDidMount() {
    this.fetchTestHistory()
  }

  fetchTestHistory() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestHistory + this.props.testId)
    .then(res => {
      let length = res.data.length;
      this.setState({
        testHistory: length > 10 ? res.data.slice(length - 10, length) : res.data,
        testHistoryAll: res.data,
      })
    })
  }

  render() {
    let {testHistory} = this.state;

    if (testHistory) {
      return  (
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={testHistory}
              margin={{ top: 5, right: 30, left: 30 }}>
              <XAxis
                  tickFormatter={(value) => `#${value}`}
                  dataKey="buildNumber" />
              <YAxis
                  minTickGap={0}
                  domain={[0, 6]}
                  tickFormatter={this.renderCustomizedLabel}
                  ticks={CATEGORIES}/>
              <CartesianGrid />
              <TooltipRechart content={<CustomTooltip />} />
              <Line
                  type="linear"
                  dataKey="stateNumber"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  strokeWidth={3}
                  dot={<CustomizedDot />}
                  activeDot={<CustomizedDot />} />
            </LineChart>
          </ResponsiveContainer>
          {this.renderGraphDialog()}
          <div style={{ textAlign: 'center' }}>
            <Button
                onClick={this.onDialogOpen.bind(this)}
                className="globalButton historyStatsShowAllButton"
                variant="text"
                color={'primary'}>
              Show All
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="circularProgressContainer">
            <CircularProgress color="primary" />
        </div>
      )
    }
  }
}
