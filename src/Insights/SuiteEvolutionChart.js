import React, { Component } from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import { _ } from "underscore"

import ChartOptionsBar from './ChartOptionsBar'

import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import { withStyles } from '@material-ui/core/styles';

import HelpIcon from "@material-ui/icons/Help"
import TextField from "@material-ui/core/TextField"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"

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
  { title: 'Total', name: 'total', color: COLORS.blue },
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

class SuiteEvolutionChart extends Component {
  state = {
    amountTests: [],
    selectedProduct: 0,
    productList: null,
  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + '?query=enabled:true&sort=name,asc')
      .then(res => {
        let {content} = res.data;

        if (content[0]) {
          this.setState({
            productList: content,
            selectedProduct: content[0].id,
          }, () => {
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetSuiteEvolution + '?productId=' + this.state.selectedProduct )
                .then(res => {
                    if(res.data[0].total == 0){
                        this.setState({
                            amountTests: res.data.slice(1, 7),
                        })
                    } else {
                        this.setState({
                            // TODO should shortlist on BE
                            amountTests: res.data.slice(0, 6),
                        })
                    }
                })
          })
        }
    })
  }

  onProductChange(e) {
      let {value} = e.target
      this.setState({
          selectedProduct: value,
      })
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetSuiteEvolution + '?productId=' + value )
          .then(res => {
              if(res.data[0].total == 0){
                  this.setState({
                      amountTests: res.data.slice(1, 7),
                  })
              } else {
                  this.setState({
                      // TODO should shortlist on BE
                      amountTests: res.data.slice(0, 6),
                  })
              }
          })
  }

  render() {
    let {classes} = this.props;
    let {amountTests, productList} = this.state;

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
                    The amount of bugs discovered by automation.
                </div>
              }>
            <HelpIcon />
          </Tooltip>
        </div>
        <h4 className="chartTitle">
            {'Total amount of tests that have been executed'}
        </h4>
        <div>
            {
                productList && (
                    <TextField
                        value={this.state.selectedProduct}
                        onChange={this.onProductChange.bind(this)}
                        fullWidth
                        select
                        variant="outlined"
                        style={{marginTop: 10, textAlign: 'left', width: '20%'}}
                        InputProps={{
                            style: {
                              fontSize: '.875rem'
                            }
                        }}>
                        {productList.map((product, index) => (
                          <MenuItem className="globalMenuItem" key={index} value={product.id}>
                            {product.name}
                          </MenuItem>
                        ))}
                    </TextField>
                )
            }
        </div>
        <div className="chartGeneralContainer">
          {
            amountTests.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={amountTests}
                  margin={{ top: 30, right: 30, left: 30 }}>
                  <XAxis reversed={true} interval={'preserveEnd'} dataKey="shortName"/>
                  <YAxis/>
                  <CartesianGrid />
                  <TooltipRechart content={<CustomTooltip />} />
                  <Line type="linear" dataKey="total" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
          {
            amountTests.length === 0 && (
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

export default withStyles(styles)(SuiteEvolutionChart)
