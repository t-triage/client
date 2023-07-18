import React, { Component } from 'react'
import axios from 'axios'
import Api from "../Main/Components/Api"
import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import TextField from "@mui/material/TextField"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import HelpIcon from "@mui/icons-material/Help"
import Grid from "@mui/material/Grid"
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
    Tooltip as TooltipRechart,
} from 'recharts'

import withStyles from '@mui/styles/withStyles';
import { styles } from '../Main/Components/Globals'

const productsData = [
                        {
                          category: "Test Cases",
                        },
                        {
                          category: "Test Suites",
                        },
                        {
                          category: "Automation To Fix",
                        }
                     ]

const productsData2 = [
                       {
                         category: "Manually Triaged",
                       },
                       {
                         category: "Automation Fixed",
                       },
                       {
                         category: "Auto Triaged",
                       }
                    ]

class CustomTooltip extends Component {
  renderTooltips = (data) => {
    let array = []
      data && data.forEach(item => {
        array.push(
                <p className="label" key={Math.random()}>
                    <span className='chartToTriageTooltipTitle' style={{color: item.color}}>{item.dataKey}:</span> {item.value}
                </p>
        )
      })
      return array
  }

  render() {
    const { active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      let data = payload;
      return (
        <div key={Math.random()}>
          <div className="insightsCustomTooltip chartTotalSummaryTooltip">
            <h2 style={{fontSize: 15}}>{data && data[0].payload.category}</h2>
            { this.renderTooltips(data) }
          </div>
          <br/>
        </div>
      )
    }

    return null;
  }
}

class EngEffortChart extends Component {
    state = {
        selectedProduct: 0,
        data: null,
        data2: null,
        productList: null,
        statsList: null
    }

    onProductChange(e) {
        let {value} = e.target
        this.setState({
            selectedProduct: value,
        })
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetEngineerEffort + '?productId=' + value )
            .then(res => {
                for (const [key, value] of Object.entries(res.data)) {
                  productsData[0][key] = value[0]
                  productsData[1][key] = value[1]
                  productsData[2][key] = value[2]
                  productsData2[0][key] = value[3]
                  productsData2[1][key] = value[5]
                  productsData2[2][key] = value[4]
                }
                this.setState({
                  data: productsData,
                  data2: productsData2,
                  statsList: res.data,
                })
            })
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
              axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetEngineerEffort + '?productId=' + this.state.selectedProduct )
                  .then(res => {
                    for (const [key, value] of Object.entries(res.data)) {
                      productsData[0][key] = value[0]
                      productsData[1][key] = value[1]
                      productsData[2][key] = value[2]
                      productsData2[0][key] = value[3]
                      productsData2[1][key] = value[5]
                      productsData2[2][key] = value[4]
                    }

                    this.setState({
                      data: productsData,
                      data2: productsData2,
                      statsList: res.data,
                    })
                  })
            })
          }
      })
    }

    renderRadars = () => {
      var radars = []
      for (const [key, value] of Object.entries(this.state.statsList)) {
          let color = "#"+(Math.random()*0xFFFFFF<<0).toString(16)
          radars.push(<Radar name={key} key={Math.random()} dataKey={key} stroke={color} fill={color} fillOpacity={0} />)
      }

      return radars
    }

    render() {
        let {classes} = this.props
        let {productList, data, data2, users} = this.state

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
                          Suites that were not triaged on time.<br />i.e.the Suite whose deadlines have been Overdue for more than 4 days.
                      </div>
                    }>
                  <HelpIcon />
                </Tooltip>
              </div>
              <h4 className="chartTitle">
                  {`Engineering Effort`}
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
              <Grid container>
                <Grid item xs={6}>
                    <h4 style={{fontSize: 12, marginTop: 10}}>Engineering per assignments</h4>
                    <div className="chartGeneralContainer" style={{width: "100%", margin: "auto"}}>
                      {
                        data && data.length > 0 && (
                          <ResponsiveContainer width="100%" height={300}>
                              <RadarChart outerRadius={90} data={data}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    {this.renderRadars()}
                                <Legend />
                                <TooltipRechart
                                    content={<CustomTooltip />} />
                              </RadarChart>
                          </ResponsiveContainer>
                        )
                      }
                      {
                        data && data[0].length === 0 && (
                          <div className="circularProgressContainer">
                              <CircularProgress color="primary" />
                          </div>
                        )
                      }
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <h4 style={{fontSize: 12, marginTop: 10}}>Engineering per work done</h4>
                    <div className="chartGeneralContainer" style={{width: "100%", margin: "auto"}}>
                      {
                        data2 && data2.length > 0 && (
                          <ResponsiveContainer width="100%" height={300}>
                              <RadarChart outerRadius={90} data={data2}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    {this.renderRadars()}
                                <Legend />
                                <TooltipRechart
                                    content={<CustomTooltip />} />
                              </RadarChart>
                          </ResponsiveContainer>
                        )
                      }
                      {
                        data2 && data2[0].length === 0 && (
                          <div className="circularProgressContainer">
                              <CircularProgress color="primary" />
                          </div>
                        )
                      }
                    </div>
                </Grid>
              </Grid>
            </div>
          )
    }
}

export default withStyles(styles)(EngEffortChart)
