import React, { Component } from 'react'
import Api from "../Main/Components/Api"
import axios from 'axios'
import HorizontalBarChart from './HorizontalBarChart'
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import Popover from "@material-ui/core/Popover"
import MenuItem from "@material-ui/core/MenuItem"
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"

import {TextFieldInput} from '../Admin/AdminUtils'
import ComponentsPicker from '../Main/Components/ComponentsPicker'
import {COLORS, styles} from '../Main/Components/Globals'
import { withStyles } from '@material-ui/core/styles';
import {_} from 'underscore';
import {renderCoverageChartDialog} from '../Main/Components/TriageUtils';

class CoverageAutomatedTest extends Component {

  constructor(props){
		super(props);

		this.state = {
			components: []
		}
	}

	saveTest(id) {
		this.props.handleExpantion(id)
	}

	onComponentsChange(item) {
		let {components} = this.state;
		let itemIndex = _.findIndex(components, {id: item.id})
		if (itemIndex === -1) {
			if (components.length < 3) {
				components.push(item)
			} else {
				document.getElementById(`testComponents-error`).style.display = 'block'
			}
		} else {
			components.splice(itemIndex, 1)
			document.getElementById(`testComponents-error`).style.display = 'none'
		}
		this.setState({
			components,
		})
	}

	getTagColor(tag) {
		switch (tag) {
			case 'PASS':
				return COLORS.pass
			case 'IN_PROGRESS':
				return COLORS.inProgress
			case 'BLOCKED':
				return COLORS.blocked
			case 'FAIL':
				return COLORS.failManualTest
			case 'NO':
				return COLORS.no
			default:
				return COLORS.grey
		}
	}

	render () {
		let {components} = this.state;
		const {key, test, expandedTests} = this.props;

		return (
			<div key={`testPlan-test-${key}`} className="manualTestListItem">
				<div className="manualTestListSummary">
					<div className="manualTestListText">
						<div style={{ alignSelf: 'center', padding: '7px 0', width: 'inherit' }} onClick={this.props.handleExpantion.bind(this, test.id)}>
							<div style={{ marginBottom: '5px'}}>
								<span style={{fontWeight: 'bold', fontSize: '1.2em'}}>{test.name}</span>
								<span className="tag" style={{ backgroundColor: this.getTagColor(test.status), marginLeft: 5 }}>{test.status}</span>
							</div>
							<span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>{test.groupName}</span>
						</div>
					</div>
				</div>
				{expandedTests.indexOf(test.id) !== -1 && <div className="manuaTestListCollapse">
					<form onSubmit={this.saveTest.bind(this, test.id)}
								className="manualTestEditForm"
								style={{ width: '100%'}}>
						<Grid container spacing={16} style={{ marginTop: 0 }}>
							<Grid item xs={12} sm={12}>
								<ComponentsPicker
									id={`testComponents-new`}
									onChange={this.onComponentsChange.bind(this)}
									selectedItems={components} />
								<small id={`testComponents-error`} style={{ color: COLORS.red, display: 'none' }}>Max. of 3 components reached</small>
							</Grid>
						</Grid>
						<div style={{ marginTop: 16, marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								type="button"
								className="globalButton"
								onClick={this.props.handleExpantion.bind(this, test.id)}
								variant="contained"
								color="secondary">
								Cancel
							</Button>
							<Button
								type="submit"
								className="globalButton"
								variant="contained"
								style={{ marginLeft: 8 }}
								color="primary">
								Save
							</Button>
						</div>
					</form>
				</div>}
			</div>
		)
	}

}

export default withStyles(styles)(CoverageAutomatedTest)
