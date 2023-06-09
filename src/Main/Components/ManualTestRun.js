import React, { Component } from 'react'
import * as _  from 'underscore'
import {COLORS, TECHNIQUE_LIST, SUITE_TYPE_LIST, MANUAL_PRIORITY_LIST, styles} from './Globals';

import InputBase from "@material-ui/core/InputBase"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import Tooltip from '@material-ui/core/Tooltip';
import StarsIcon from "@material-ui/icons/Star"
import Grid from "@material-ui/core/Grid"
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import {withStyles} from '@material-ui/core/styles/index';

class ManualTestRun extends Component {
  state = {
    testRun: null,
		comment: '',
		status: '',
		showButtons: false,
  };

	componentDidMount() {
		let {execution, editedComment, testRun} = this.props;
		let propComment = editedComment[testRun.id] !== undefined ? editedComment[testRun.id] : null
		this.setState({
			comment: propComment !== null ? propComment : execution.comment,
			showButtons: false
		})
	}

	static getDerivedStateFromProps(nextProps, prevState){
		if(nextProps.statusUpdated && nextProps.editedComment[nextProps.testRun.id] !== undefined && nextProps.editedComment[nextProps.testRun.id] !== null && nextProps.editedComment[nextProps.testRun.id] !== nextProps.execution.comment){
			return { comment: nextProps.editedComment[nextProps.testRun.id], showButtons: true};
		}
		else if (nextProps.statusUpdated) {
			return {comment: nextProps.execution.comment || '', showButtons: false}
		}
		else return null;
	}

	componentDidUpdate(prevProps) {
		const { statusUpdated } = this.props

		if ( statusUpdated && statusUpdated !== prevProps.statusUpdated) {
			this.props.updateStatus(false);
		}
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

	renderComponents(testRun) {
		let components = []
		if (testRun.component1Id)
			components.push(testRun.component1Name)
		if (testRun.component2Id)
			components.push(testRun.component2Name)
		if (testRun.component3Id)
			components.push(testRun.component3Name)

		return this.renderTags(components)
	}

	onSave() {
		this.setState({ showButtons: false })
		this.props.onSave(this.props.execution, this.state.comment)
	}

	showButtons() {
		let {showButtons} = this.state
		if (!showButtons) {
			this.setState({
				showButtons: true,
			})
		}
	}

	renderRawTestRun() {
		let {testRun} = this.props;

		return testRun && (
			<div key={`stepList-${testRun.id ? testRun.id : 'new'}`} style={{ width: '70%', marginLeft: '40px', whiteSpace: 'pre-wrap' }}>
				{testRun.note && testRun.note.description &&
				<div>
					<br />
					<h5>DESCRIPTION</h5>
					<br />
					<div className="manualTestRunListItem" style={{marginLeft: '20px'}}>
						<span>{testRun.note.description}</span>
					</div>
				</div>
				}
				{testRun.requirement &&
				<div>
					<br />
					<h5>REQUIREMENTS</h5>
					<br />
					<div className="manualTestRunListItem" style={{marginLeft: '20px'}}>
						<span>{testRun.requirement}</span>
					</div>
				</div>
				}
				<div>
					<br />
					<h5>STEPS</h5>
					<br />
					{
						_.sortBy(testRun.steps, 'stepOrder').map((step, index) => {
							return (
								<div key={`runStep-${index}-${Math.random()}`} style={{display: 'flex', flexDirection: 'column'}}>
									<div className="manualTestRunListItem">
										<div className="manualTestStepListItemTextWrapper">
											<div className="">
												{`${index + 1}) ${step.id === testRun.mainStepId ? 'Main Step: ' : ''}${step.step}`}
											</div>
											{(step.expectedResult || step.data) &&
											<div className="">
												{step.expectedResult && <div className="">
													<div>
														<b>- Expected result: </b>
														{step.expectedResult}
													</div>
												</div> }
												{step.data && <div className="">
													<div>
														<b>- Data: </b>
														{step.data}
													</div>
												</div> }
											</div>
											}
										</div>
									</div>
									<br />
								</div>
							)
						})
					}
				</div>
				<br />
			</div>)
	}

	renderDetailedTestRun() {
		let {comment, showButtons} = this.state,
			priority = null,
			suite = null;
		const { classes, testRun, execution } = this.props;

		if (testRun) {
			priority = _.find(MANUAL_PRIORITY_LIST, {value: testRun.priority});
			suite = _.find(SUITE_TYPE_LIST, {value: testRun.suite});
		}

		return testRun && [
			<div key={`stepList-${testRun.id ? testRun.id : 'new'}`} style={{ width: '70%' }}>
				{testRun.requirement &&
				<div>
					<h5 style={{marginLeft: '40px', marginBottom: '20px'}}>REQUIREMENTS</h5>
					<div className="manualTestRunListItem" style={{marginLeft: '60px', marginBottom: '20px'}}>
						<InputBase
							id={`requirements-${testRun.id ? testRun.id : 'new'}`}
							className="disabledTextarea notGrayout"
							fullWidth
							multiline
							disabled
							inputProps={{
								style: {
									fontSize: '1rem',
									minHeight: '22px'
								},
							}}
							value={testRun.requirement}
						/>
					</div>
				</div>
				}
				<div>
					<h5 style={{marginLeft: '40px', marginBottom: '20px'}}>STEPS</h5>
					{
						_.sortBy(testRun.steps, 'stepOrder').map((step, index) => {
							return (
								<div key={`runStep-${index}-${Math.random()}`} style={{display: 'flex', flexDirection: 'column', marginBottom: '20px'}}>
									<div className="manualTestRunListItem">
										<div className="manualTestRunMainStepIcon">
											{ step.id === testRun.mainStepId &&
											<Tooltip
												classes={{
													tooltip: classes.tooltip,
													popper: classes.popper,
												}}
												title={'Main Step'}>
												<StarsIcon style={{  padding: '0px 6px', color: COLORS.yellow }} />
											</Tooltip>
											}
										</div>
										<div className="manualTestStepNumber">{index + 1}</div>
										<div className="manualTestStepListItemTextWrapper">
											<div className="stepDescription">
												{step.step}
											</div>
											{(step.expectedResult || step.data) &&
											<div className="expectedAndDataWrapper">
												{step.expectedResult && <div className="manualTestRunExpectedResult">
													<Tooltip
														classes={{
															tooltip: classes.tooltip,
															popper: classes.popper,
														}}
														title={'Expected result'}>
														<SubdirectoryArrowRightIcon />
													</Tooltip>
													<div style={{marginLeft: '5px', marginTop: '2px'}}>
														{step.expectedResult}
													</div>
												</div> }
												{step.data && <div className="manualTestRunExtraData">
													<div className="tag extraDataTag">DATA</div>
													<div>
														{step.data}
													</div>
												</div> }
											</div>
											}
										</div>
									</div>
								</div>

							)
						})
					}
				</div>
			</div>,
			<div key={`advancedInfo-${testRun.id ? testRun.id : 'new'}`} style={{ width: '25%', marginRight: '35px' }}>
				{testRun.note && testRun.note.description &&
				<div>
					<h5 style={{marginBottom: '20px'}}>DESCRIPTION</h5>
					<div className="manualTestRunListItem" style={{marginLeft: '20px', marginBottom: '20px'}}>
						<InputBase
							id={`description-${testRun.id ? testRun.id : 'new'}`}
							className="disabledTextarea"
							fullWidth
							multiline
							disabled
							inputProps={{
								style: {
									fontSize: '1rem',
									minHeight: '22px'
								},
							}}
							value={testRun.note.description}
						/>
					</div>
				</div>
				}
				<div>
					<h5 style={{marginBottom: '20px'}}>ADVANCED</h5>
					<Grid className="testRunsAdvancedWrapper" container>
						
						{testRun.automationStatus && testRun.automationStatus === "DONE" &&
						<Grid item className="manualTestRunTagContainer advancedItem">
							<div className="label highlight">Automated</div>
						</Grid>
						}
						
						<div style={{ marginBottom: '5px'}}>
							<span className="manualTestListTextGrey">{!testRun.lastExecutionDate ? '' : `Last Run: 
                          ${execution.status} on ${new Date(testRun.lastExecutionDate).toLocaleDateString("en-US", {
								month: 'long',
								day: 'numeric',
							})} by ${testRun.lastExecutionAssignee}`}</span>
						</div>
						
						
						
						<Grid item className="manualTestRunTagContainer advancedItem">
							<div className="label">ID</div>
							<div className="value">
								#{testRun.id}
								{testRun.externalId &&
								<span>#{testRun.externalId}</span>
								}
							</div>
						</Grid>
						<Grid item className="manualTestRunTagContainer advancedItem">
							<div className="label">Priority</div>
							<div className="value">{priority ? priority.label : testRun.priority}</div>
						</Grid>
						<Grid item className="manualTestRunTagContainer advancedItem">
							<div className="label">Suite Type</div>
							<div className="value">{suite ? suite.label : testRun.suite}</div>
						</Grid>
						<Grid item className="manualTestRunTagContainer advancedItem">
							<div className="label">Owner</div>
							<div className="value">{testRun.owner.displayName}</div>
						</Grid>
						{
							testRun.productName && (
								<Grid item className="manualTestRunTagContainer advancedItem">
									<div className="label">Product</div>
									<div className="value">{testRun.productName}</div>
								</Grid>
							)
						}
						{
							testRun.functionalityEntity && (
								<Grid item className="manualTestRunTagContainer advancedItem">
									<div className="label">Functionality</div>
									<div className="value">{testRun.functionalityEntity.name}</div>
								</Grid>
							)
						}
						{
							testRun.techniques.length > 0 && (
								<Grid item className="manualTestRunTagContainer advancedItem">
									<div className="label">Techniques</div>
									<div className="value">{
										this.renderTags(testRun.techniques, TECHNIQUE_LIST)
									}</div>
								</Grid>
							)
						}
						{
							(testRun.component1Name || testRun.component2Name || testRun.component3Name) && (
								<Grid item xs={12} className="manualTestRunTagContainer advancedItem">
									<div className="label">Components</div>
									<div className="value">{this.renderComponents(testRun)}</div>
								</Grid>
							)
						}
					</Grid>
					<TextField
						style={{marginTop: 20}}
						multiline
						fullWidth
						label="Comments"
						variant="outlined"
						InputLabelProps={{
							shrink: true,
						}}
						InputProps={{
							className: "textArea"
						}}
						inputProps={{
							style: {
								minHeight: '18px'
							}
						}}
						className="manualTestRunDescription"
						value={comment}
						placeholder="No comments yet"
						rowsMax={5}
						onChange={(ev) => {
							this.setState({comment: ev.target.value})
							this.showButtons()
							this.props.onChangeComment(testRun.id, ev.target.value)
						}}
						spellCheck={false}
					/>
				</div>
				{
					showButtons && (
						<div style={{ marginTop: 20, marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								className="globalButton"
								onClick={() => {
									this.setState({
										comment: execution.comment,
										showButtons: false
									})
									this.props.onChangeComment(testRun.id, execution.comment)
								}}
								variant="contained"
								color="secondary">
								Cancel
							</Button>
							<Button
								className="globalButton"
								variant="contained"
								onClick={this.onSave.bind(this)}
								style={{ marginLeft: 8 }}
								color="primary">
								Save
							</Button>
						</div>
					)
				}
			</div>
		]
	}

  render() {
    return this.props.showRawTestPlan ? this.renderRawTestRun() : this.renderDetailedTestRun();
  }
}

export default withStyles(styles)(ManualTestRun);