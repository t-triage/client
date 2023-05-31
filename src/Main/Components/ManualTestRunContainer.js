import React, { Component } from 'react'
import { _ } from 'underscore'
import axios from 'axios'
import Api from './Api'
import { Link } from 'react-router-dom'
import {COLORS, styles, TEST_PLAN_STATUS_ALL, TEST_RUN_STATUS} from './Globals';
import {withStyles} from '@material-ui/core/styles/index';

import Tooltip from "@material-ui/core/Tooltip"
import Popover from "@material-ui/core/Popover"
import MenuItem from "@material-ui/core/MenuItem"
import IconButton from "@material-ui/core/IconButton"

import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled"
import Edit from '@material-ui/icons/Edit';
import CancelIcon from "@material-ui/icons/Cancel"
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"
import MoreIcon from "../../images/MoreIcon.svg"

import ManualTestRun from './ManualTestRun'
import SearchUI from "./SearchUI";

class ManualTestRunContainer extends Component {

  constructor(props) {
  	super(props)
		this.state = {
  		isExpanded: props.expandAll,
			moreOptionsOpen: false,
			testRun: null,
			comment: '',
			status: '',
			showButtons: false,
		};
	}

	componentDidMount() {
  		let {comment} = this.props.execution
		this.setState({
			comment,
		})
	}

	componentDidUpdate(prevProps, prevState) {
  	if (prevProps.expandAll !== this.props.expandAll) {
			this.setState({
				isExpanded: this.props.expandAll
			})
		}
	}

	updateStatus(value=false) {
  	this.props.updateStatus(false)
	}

	getTestMainStep(test) {
		let mainStep = _.find(test.steps, {id: test.mainStepId})
		return mainStep ? mainStep.expectedResult : ''
	}

	saveStatus(execution, status) {
		const { testPlan } = this.props
		let {comment} = this.state
		axios({
			method: "PUT",
			url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateManualTestExecution,
			data: JSON.stringify({...execution, status, comment}),
			headers: {
				'Content-Type': 'application/json'
			},
		}).then(res => {
			this.props.fetchExecutionList(testPlan.id, false, true)
		})
	}

	onChangeComment(id, value) {
		this.props.handleEditedComments(id, value)
		this.setState({
			comment: value
		})
	}

	saveComment(execution, comment) {
		const { testPlan } = this.props
		axios({
			method: "PUT",
			url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateManualTestExecution,
			data: JSON.stringify({...execution, comment}),
			headers: {
				'Content-Type': 'application/json'
			},
		}).then(res => {
			this.onChangeComment(execution.testCase.id, comment)
			this.props.fetchExecutionList(testPlan.id, false, false, true)
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

	renderRawTest() {
		const { showRawTestPlan, execution, index, editedComment, statusUpdated } = this.props;
		let {testPlan, isExpanded} = this.state
		let test = execution.testCase;
		let planStatus = _.find(TEST_PLAN_STATUS_ALL, {value: execution.status})
		return (
			<div>
				<div className="manualTestListSummary" style={{padding: '0 9px 0 0', margin: 0}}>
					<div className="manualTestListText">
						<div style={{ alignSelf: 'center', padding: '7px 0', width: 'inherit', cursor: 'initial' }}>
							<div>
								<span style={{fontWeight: 'bold', fontSize: '1.2em'}}>{'Title: ' + test.name}</span>
								<span> - Status: {planStatus ? planStatus.label : execution.status}</span>
							</div>
							<div className={"summaryComponents"} style={{display: 'inline'}}>
								<span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>{`Test ID: #${test.id} `}</span>
								{this.renderComponents(test, true)}
							</div>
						</div>
					</div>
				</div>
				<div>
					{isExpanded && (
						<ManualTestRun
							execution={execution}
							testRun={execution.testCase}
							showRawTestPlan={showRawTestPlan}
							testPlan={testPlan}
							updateStatus={this.updateStatus.bind(this)}
							statusUpdated={statusUpdated}
							editedComment={editedComment}
							onChangeComment={this.onChangeComment.bind(this)}
							onSave={this.saveComment.bind(this)}
							onClose={this.handleExpantion.bind(this)} />
					)}
				</div>
			</div>
		)
	}

	renderTags(tags, labels) {
		return tags.map((tag, index) => {
			let tagFound = _.find(labels, {value: tag});
			return (
				<div key={`runComponent-${index}-${tag}-${Math.random()}`} className="tag tag-grey chip-outlined"
						 style={{fontSize: '.875rem', marginBottom: 5, marginRight: 5}}>
					{
						labels && tagFound ?
							tagFound.label
							: tag
					}
				</div>
			)
		})
	}

	renderRawTags(tags, labels) {
		let size = tags.length;
		return <div style={{display: 'inline'}}>
			&nbsp;<span>{"- Components:"}</span>&nbsp;
			{tags.map((tag, index) => {
				let tagFound = _.find(labels, {value: tag});
				return (
					<span key={`runRawComponent-${index}-${tag}-${Math.random()}`} className="rawTag"
								style={{display: 'inline-block', fontSize: '.875rem', marginBottom: 5}}>
						{
							labels && tagFound ?
								tagFound.label
								: tag
						}
						{index !== size - 1 ? ',' : ''}
						&nbsp;
					</span>
				)
			})}
		</div>
	}

	renderComponents(testRun, rawMode=false) {
		let components = []
		if (testRun.component1Id)
			components.push(testRun.component1Name)
		if (testRun.component2Id)
			components.push(testRun.component2Name)
		if (testRun.component3Id)
			components.push(testRun.component3Name)

		return rawMode ? this.renderRawTags(components) : this.renderTags(components)
	}

	handleExpantion() {
		let { isExpanded } = this.state;

		this.setState({
			isExpanded: !isExpanded
		})
	}

	renderDetailedTest() {
		let {testPlan, isExpanded} = this.state
		let {classes, showRawTestPlan, execution, index, editedComment, statusUpdated} = this.props
		let test = execution.testCase;
		return (
			<div key={`testPlan-test-${index}`} className="manualTestListItem">
				<div className="manualTestListSummary">
					<div className="manualTestListText">
						<div style={{ alignSelf: 'center', padding: '7px 0', width: 'inherit' }} onClick={this.handleExpantion.bind(this)}>

							<div style={{ marginBottom: '5px'}}>
								<span style={{fontWeight: 'bold', fontSize: '1.2em'}}>{test.name}</span>
								<span className="tag" style={{ backgroundColor: this.getTagColor(execution.status), marginLeft: 5 }}>{execution.status}</span>
							</div>
							
							{!isExpanded && (
								<div className={"summaryComponents"} style={{display: 'inline', paddingLeft: '10px'}}>
									{this.renderComponents(test)}
								</div>
							)}
							<span style={{ color: 'rgba(0, 0, 0, 0.54)', paddingLeft: '15px' }}>
                          {!isExpanded && (
														this.getTestMainStep(test))
													}
                        </span>
						</div>
						<div style={{ display: 'flex', alignItems: 'center'}}>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title="Pass">
								<CheckCircleIcon
									style={{ fill: COLORS.pass, cursor: 'pointer', fontSize: 30 }}
									onClick={this.saveStatus.bind(this, execution, "PASS")} />
							</Tooltip>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title="In Progress">
								<PlayCircleFilled
									style={{ fill: COLORS.inProgress, cursor: 'pointer', fontSize: 30 }}
									onClick={this.saveStatus.bind(this, execution, "IN_PROGRESS")} />
							</Tooltip>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title="Blocked">
								<RemoveCircleIcon
									style={{ fill: COLORS.blocked, cursor: 'pointer', fontSize: 30 }}
									onClick={this.saveStatus.bind(this, execution, "BLOCKED")} />
							</Tooltip>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title="Fail">
								<CancelIcon
									style={{ fill: COLORS.failManualTest, cursor: 'pointer', fontSize: 30 }}
									onClick={this.saveStatus.bind(this, execution, "FAIL")} />
							</Tooltip>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title="More">
								<img
									id={"moreStatusIcon-" + test.id}
									onClick={() => this.setState({ moreOptionsOpen: test.id })}
									height={30}
									width={30}
									src={MoreIcon}
									style={{ cursor: 'pointer' }} />
							</Tooltip>
							<Popover
								id="moreStatusOptions"
								open={this.state.moreOptionsOpen === test.id}
								anchorEl={document.getElementById("moreStatusIcon-" + test.id)}
								onClose={() => this.setState({ moreOptionsOpen: false })}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'center',
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'center',
								}}
							>
								{TEST_RUN_STATUS.map(p => (
									<MenuItem
										className="globalMenuItem"
										onClick={this.saveStatus.bind(this, execution, p.value)}
										key={p.id}
										value={p.value}>
										{p.label}
									</MenuItem>
								))}
							</Popover>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title="Edit test">
								<Link style={{textDecoration: 'none'}} target="_blank" to={test.id ? `/TestRepository?externalId=${test.id}&expandTest=true` : "/TestRepository"}>
									<Edit
										style={{ fill: COLORS.greyDark, cursor: 'pointer', fontSize: 30 }}
										onClick={null} />
								</Link>
							</Tooltip>
							<Tooltip
								classes={{
									tooltip: classes.tooltip,
									popper: classes.popper,
								}} title={isExpanded ? "Collapse" : "Expand"}>
								<IconButton
									onClick={this.handleExpantion.bind(this, test.id, false)}>
									{
										isExpanded && (
											<KeyboardArrowUpIcon />
										)
									}
									{
										!isExpanded && (
											<KeyboardArrowDownIcon />
										)
									}
								</IconButton>
							</Tooltip>
						</div>
					</div>
				</div>
				{
					isExpanded && (
						<div className="manuaTestListCollapse manualTestRuns">
							<ManualTestRun
								execution={execution}
								testRun={execution.testCase}
								showRawTestPlan={showRawTestPlan}
								editedComment={editedComment}
								updateStatus={this.updateStatus.bind(this)}
								statusUpdated={statusUpdated}
								onChangeComment={this.onChangeComment.bind(this)}
								testPlan={testPlan}
								onSave={this.saveComment.bind(this)}
								onClose={this.handleExpantion.bind(this)} />
						</div>
					)
				}
			</div>
		)
	}

  render() {
    return this.props.showRawTestPlan ? this.renderRawTest() : this.renderDetailedTest();
  }
}

export default withStyles(styles)(ManualTestRunContainer);