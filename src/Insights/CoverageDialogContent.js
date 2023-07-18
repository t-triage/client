import React, { Component } from 'react'
import Api from "../Main/Components/Api"
import axios from 'axios'
import HorizontalBarChart from './HorizontalBarChart'
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Popover from "@mui/material/Popover"
import MenuItem from "@mui/material/MenuItem"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

import CoverageAutomatedTest from './CoverageAutomatedTest'
import {TextFieldInput} from '../Admin/AdminUtils'
import ComponentsPicker from '../Main/Components/ComponentsPicker'
import {COLORS, styles} from '../Main/Components/Globals'
import withStyles from '@mui/styles/withStyles';
import * as _  from 'underscore';
import {renderCoverageChartDialog} from '../Main/Components/TriageUtils';

class CoverageDialogContent extends Component {

  constructor(props){
		super(props);

		this.state = {
			productCoverage: null,
			testsList: [],
			expandedTests: [],
			dialogIsOpen: false,
			minAmountOfTests: props.bar && props.bar.goal ? props.bar.goal : null,
			isEditing: false,
			components: []
		}
	}

	componentDidMount() {
		let mockDataTests = [
			{
				"id":673,
				"enabled":true,
				"updated":1575467555964,
				"timestamp":1575467555964,
				"duration":0.0,
				"age":0,
				"errorDetails":null,
				"errorStackTrace":null,
				"status":"PASS",
				"failedSince":1,
				"report":670,
				"standardOutput":null,
				"screenshotURLs":[
					"http://www.ttriage.com/tsections/img/workspace.png"
				],
				"videoURLs":[

				],
				"skippedMessage":null,
				"name":"updateContent",
				"suiteName":"CRUD for Content and User",
				"path":null,
				"groupName":"CRUD for Content and User",
				"displayName":"Update Content",
				"shortName":"updateContent"
			},
			{
				"id":44343,
				"enabled":true,
				"updated":1575467555964,
				"timestamp":1575467555964,
				"duration":0.0,
				"age":0,
				"errorDetails":null,
				"errorStackTrace":null,
				"status":"FAIL",
				"failedSince":1,
				"report":670,
				"standardOutput":null,
				"screenshotURLs":[
					"http://www.ttriage.com/tsections/img/workspace.png"
				],
				"videoURLs":[

				],
				"skippedMessage":null,
				"name":"updateContent",
				"suiteName":"CRUD for Content and User",
				"path":null,
				"groupName":"CRUD for Content and User",
				"displayName":"Update Content",
				"shortName":"updateContent"
			},
			{
				"id":334,
				"enabled":true,
				"updated":1575467555964,
				"timestamp":1575467555964,
				"duration":0.0,
				"age":0,
				"errorDetails":null,
				"errorStackTrace":null,
				"status":"PENDING",
				"failedSince":1,
				"report":670,
				"standardOutput":null,
				"screenshotURLs":[
					"http://www.ttriage.com/tsections/img/workspace.png"
				],
				"videoURLs":[

				],
				"skippedMessage":null,
				"name":"updateContent",
				"suiteName":"CRUD for Content and User",
				"path":null,
				"groupName":"CRUD for Content and User",
				"displayName":"Update Content",
				"shortName":"updateContent"
			},
			{
				"id":2344,
				"enabled":true,
				"updated":1575467555964,
				"timestamp":1575467555964,
				"duration":0.0,
				"age":0,
				"errorDetails":null,
				"errorStackTrace":null,
				"status":"FAIL",
				"failedSince":1,
				"report":670,
				"standardOutput":null,
				"screenshotURLs":[
					"http://www.ttriage.com/tsections/img/workspace.png"
				],
				"videoURLs":[

				],
				"skippedMessage":null,
				"name":"updateContent",
				"suiteName":"CRUD for Content and User",
				"path":null,
				"groupName":"CRUD for Content and User",
				"displayName":"Update Content",
				"shortName":"updateContent"
			},
			{
				"id":654,
				"enabled":true,
				"updated":1575467555964,
				"timestamp":1575467555964,
				"duration":0.0,
				"age":0,
				"errorDetails":null,
				"errorStackTrace":null,
				"status":"PASS",
				"failedSince":1,
				"report":670,
				"standardOutput":null,
				"screenshotURLs":[
					"http://www.ttriage.com/tsections/img/workspace.png"
				],
				"videoURLs":[

				],
				"skippedMessage":null,
				"name":"updateContent",
				"suiteName":"CRUD for Content and User",
				"path":null,
				"groupName":"CRUD for Content and User",
				"displayName":"Update Content",
				"shortName":"updateContent"
			},
			{
				"id":456,
				"enabled":true,
				"updated":1575467555964,
				"timestamp":1575467555964,
				"duration":0.0,
				"age":0,
				"errorDetails":null,
				"errorStackTrace":null,
				"status":"FAIL",
				"failedSince":1,
				"report":670,
				"standardOutput":null,
				"screenshotURLs":[
					"http://www.ttriage.com/tsections/img/workspace.png"
				],
				"videoURLs":[

				],
				"skippedMessage":null,
				"name":"updateContent",
				"suiteName":"CRUD for Content and User",
				"path":null,
				"groupName":"CRUD for Content and User",
				"displayName":"Update Content",
				"shortName":"updateContent"
			}
		]

		this.setState({
			testsList: mockDataTests
		})
	}

	handleExpantion(id) {
		let {expandedTests} = this.state
		let index = expandedTests.indexOf(id)
		if (index !== -1) {
			expandedTests.splice(index, 1)
		}
		else {
			expandedTests.push(id)
		}
		this.setState({
			expandedTests,
		})
	}

	saveTest(id) {
		this.handleExpantion(id)
	}


	select = name => event => {
		this.setState({
			[name]: event.target.value,
			isEditing: true
		})
	}

	onCancel = field => {
  	const { bar } = this.props
        this.setState({
            [field]: bar && bar.goal ? bar.goal : null,
            isEditing: false
        })
	}

    onSave = field => {
        this.setState({
            isEditing: false
        })
    }

	render () {
		let {testsList, minAmountOfTests, components, expandedTests, isEditing} = this.state;
		const {bar} = this.props;

		return (
			<div>
				<Grid container spacing={16} style={{ marginTop: 0, marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
					<Grid item xs={6}>
						<TextFieldInput
							id="MinimumAmountTests"
							classes={{
								root: 'inputTestToCreate'
							}}
							label="Goal: Increase amount of tests"
							placeholder="Amount of tests to create"
							type="number"
							value={minAmountOfTests}
							onChange={this.select("minAmountOfTests")}
						/>
					</Grid>
					{isEditing && <div style={{ marginTop: 16, marginBottom: 0, display: 'flex', justifyContent: 'flex-end', maxHeight: '34px' }}>
						<Button
							type="button"
							className="globalButton"
							onClick={this.onCancel.bind(this, "minAmountOfTests")}
							variant="contained"
							color="secondary">
							Cancel
						</Button>
						<Button
							type="submit"
							className="globalButton"
							variant="contained"
                            onClick={this.onSave.bind(this, "minAmountOfTests")}
							style={{ marginLeft: 8 }}
							color="primary">
							Save
						</Button>
					</div>}
				</Grid>
				{testsList.length > 0 && testsList.map((execution, index) => {
					let test = execution;

					return <CoverageAutomatedTest
						test={execution}
						key={index}
						expandedTests={expandedTests}
						handleExpantion={this.handleExpantion.bind(this)}
					/>

				})}
			</div>)
	}

}

export default withStyles(styles)(CoverageDialogContent)
