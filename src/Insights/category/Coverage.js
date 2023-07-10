import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import HorizontalBarChart from '../HorizontalBarChart'
import CoverageDialogContent from '../CoverageDialogContent'

import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import {COLORS, styles} from '../../Main/Components/Globals'
import withStyles from '@mui/styles/withStyles';
import * as _  from 'underscore';
import {renderCoverageChartDialog} from '../../Main/Components/TriageUtils';

class Coverage extends Component {

  constructor(props){
		super(props);

		this.state = {
			productCoverage: null,
			productList: [],
			expandedTests: [],
			dialogIsOpen: false,
			bar: null
		}
	}

	onBarClick(bar) {
		this.setState({
			dialogIsOpen: true,
			bar: bar
		})
	}

	onCloseDialog(){
		this.setState({
			dialogIsOpen: false,
			bar: null
		})
	}

  // componentDidMount() {
  //   this.fetchProducts()
  // }

  // fetchProducts() {
  //   axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + '?query=enabled:true&sort=name,asc')
  //   .then(res => (
  //     this.setState({
  //       productList: res.data.content,
  //     })
  //   ))
  // }

  componentWillMount() {
		const mockData = [
			{name: 'Documents', pass: 15, fail: 10, pending: 20},
			{name: 'Content', pass: 20, fail: 15, pending: 10, goal: 8},
			{name: 'Create', pass: 40, fail: 5, pending: 15, goal: 5},
			{name: 'Login', pass: 4, fail: 10, pending: 5},
			{name: 'Testing', pass: 10, fail: 2, pending: 5, goal: 10},
			{name: 'Anything', pass: 15, fail: 10, pending: 20, goal: 2},
			{name: 'Done', pass: 20, fail: 15, pending: 10}
		];
		this.setState({
      productCoverage: mockData
    })

    // axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProductSummary )
    //     .then(res => {
    //         let {data} = res
    //         this.setState({
    //           productCoverage: data,
    //         })
    //     })

  }

  render() {
    let {productCoverage, dialogIsOpen, bar} = this.state
    return (
        <div style={{ width: '100%' }}>
          <Grid container spacing={24} justifyContent="center">
              <Grid item xs={10}>
                  <Paper className='chartBigContainer'>
                      <HorizontalBarChart
                          data={productCoverage}
                          type='productCoverage'
                                                  onBarClick={this.onBarClick.bind(this)}
                      />
                  </Paper>
              </Grid>
          </Grid>
                  {renderCoverageChartDialog(dialogIsOpen, this.onCloseDialog.bind(this), <CoverageDialogContent bar={bar} />, bar ? bar.name : '')
                  }
        </div>
    );
  }
}

export default withStyles(styles)(Coverage)
