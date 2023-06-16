import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import HorizontalBarChart from '../HorizontalBarChart'
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Popover from "@mui/material/Popover"
import MenuItem from "@mui/material/MenuItem"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

import { styles } from '../../Main/Components/Globals'
import withStyles from '@mui/styles/withStyles';

class ProductHealth extends Component {
  state = {
      toTriage: null,
      totalToTriage: 0,
      menuOpen: false,
      productList: [],
  }

  componentDidMount() {
    this.fetchProducts()
  }

  fetchProducts() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + '?query=enabled:true&sort=name,asc')
    .then(res => (
      this.setState({
        productList: res.data.content,
      })
    ))
  }

  componentWillMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetToTriage )
        .then(res => {
            let {data} = res
            let totalToTriage = 0;
            data.map(dat => {
              totalToTriage += dat.toTriage;
              return null;
            })
            this.setState({
              toTriage: data,
              totalToTriage,
            })
        })

  }

  downloadProductReport(id) {
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
    this.onMenuClose()
    axios(`${Api.getBaseUrl()}${Api.ENDPOINTS.DownloadProductReport}?productId=${id}`, {
      method: 'GET',
      responseType: 'blob',
    })
      .then(res => {
        const file = new Blob(
          [res.data],
          {type: 'application/pdf'}
        )
        const fileURL = URL.createObjectURL(file)
        window.open(fileURL)
      })
      .catch(err => {
        console.log("ERROR", err)
      })
  }

  onMenuClose() {
    this.setState({
      menuOpen: false,
    })
  }

  renderDownloadMenu() {
    let {menuOpen, productList, productSummary} = this.state
    let {classes} = this.props

    return (
      <div className='insightsDownload'>
        <Button
            id='downloadProductReportBtn'
            type="button"
            className="globalButton"
            variant="contained"
            onClick={() => this.setState({ menuOpen: true })}
            color="primary">Download Report<KeyboardArrowDownIcon className="downloadReportButtonArrow" /></Button>
        <Popover
            open={menuOpen}
            anchorEl={document.getElementById('downloadProductReportBtn')}
            classes={{
              popover: classes.popover,
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            onClose={this.onMenuClose.bind(this)}>
            {
              productList.map((prod, index) => (
                <MenuItem
                    id={prod.id}
                    className="globalMenuItem"
                    key={prod.id + index}
                    onClick={this.downloadProductReport.bind(this, prod.id)}>
                  {prod.name}
                </MenuItem>
              ))
            }
        </Popover>
      </div>
    )
  }

  render() {
    let {toTriage, totalToTriage} = this.state
    return (
      <div style={{ width: '100%' }}>
        {this.renderDownloadMenu()}
        <Grid container spacing={24} justifyContent="center">
            <Grid item xs={10}>
                <Paper className='chartBigContainer'>
                    <HorizontalBarChart
                        data={toTriage}
                        totalData={totalToTriage}
                        type='toTriage'
                        customTick />
                </Paper>
            </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(ProductHealth)
