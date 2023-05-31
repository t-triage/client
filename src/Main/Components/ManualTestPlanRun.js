import React, { Component } from 'react'
import { _ } from 'underscore'
import axios from 'axios'
import Api from './Api'
import { Link } from 'react-router-dom'

import ManualTestRunContainer from './ManualTestRunContainer'

import FormatClearIcon from '@material-ui/icons/FormatClear';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import Snackbar from '@material-ui/core/Snackbar'

import {styles, COLORS, snackbarStyle, MySnackbarContent, TEST_PLAN_STATUS_ALL} from './Globals'
import { withStyles } from '@material-ui/core/styles'
import SearchUI from "./SearchUI";
import Grid from "@material-ui/core/Grid";

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

class ManualTestPlanRun extends Component {
  state = {
    testPlan: null,
    moreOptionsOpen: false,
    openSnackbar: false,
	isLoading: true,
	statusUpdated: false,
    snackbarMsg: '',
	executions: [],
	filteredExecutions: [],
	expandedTests: [],
	editedComments: {},
	filters: {
    	filterByPassStatus: localStorage.getItem("filterByPassStatus") == "false" ? false : true,
		filterByInProgressStatus: localStorage.getItem("filterByInProgressStatus") == "false" ? false : true,
		filterByBlockedStatus: localStorage.getItem("filterByBlockedStatus") == "false" ? false : true,
		filterByFailStatus: localStorage.getItem("filterByFailStatus") == "false" ? false : true,
		filterByPendingStatus: localStorage.getItem("filterByPendingStatus") == "false" ? false : true,
		filterByNoStatus: localStorage.getItem("filterByNoStatus") == "false" ? false : true,
	}
  }

  componentDidMount() {
    let {testPlan} = this.props
		this.props.showLoadingSpinner(true);
		if (testPlan) {
      this.setState({
        testPlan,
      }, () => {
        this.fetchExecutionList(testPlan.id, true)
      })
    } else {
			axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.GetTestPlanById}${this.props.path.planId}`)
        .then(res => {
          this.setState({
            testPlan: res.data,
          }, () => {
            this.fetchExecutionList(res.data.id, true)
          })
        })
    }
  }

  componentDidUpdate(prevProps) {
		if (this.props.showRawTestPlan !== prevProps.showRawTestPlan
			|| this.props.expandAll !== prevProps.expandAll) {
  		this.props.showLoadingSpinner(false);
		}
	}

	updateStatus(value=false) {
		this.setState({
			statusUpdated: value
		})
	}

  fetchExecutionList(planId, expand, changeStatus=false, updateComment=false) {
	  this.props.showLoadingSpinner(true);
	  axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.GetTestsExecutionList}${planId}`)
      .then(res => {
				this.props.showLoadingSpinner(false);
				if (changeStatus) {
					this.showSnackbar('Status updated')
				}
				if (updateComment) {
					this.showSnackbar('Comment updated')
				}
				this.setState({
          			executions: res.data,
					isLoading: false,
					statusUpdated: changeStatus
        }, () => {
			this.applyFilter(this.state.filters)
			if (expand)
			res.data.map(exec => this.handleExpantion(exec.testCase.id, false))
        })
      })
  }

	filterList = (filter, state) => {
		this.setState({
			filters: state
		}, () => {

			if (this.state.filters) {
				localStorage.setItem("filterByPassStatus", state.filterByPassStatus)
				localStorage.setItem("filterByInProgressStatus", state.filterByInProgressStatus)
				localStorage.setItem("filterByBlockedStatus", state.filterByBlockedStatus)
				localStorage.setItem("filterByFailStatus", state.filterByFailStatus)
				localStorage.setItem("filterByPendingStatus", state.filterByPendingStatus)
				localStorage.setItem("filterByNoStatus", state.filterByNoStatus)
			}
			this.applyFilter(this.state.filters)
		})
	}

	applyFilter(filters) {
		let {executions} = this.state
		let filtersToApply = []

		if (filters.filterByPassStatus) {
			filtersToApply.push("PASS")
		}
		if (filters.filterByInProgressStatus) {
			filtersToApply.push("IN_PROGRESS")
		}
		if (filters.filterByBlockedStatus) {
			filtersToApply.push("BLOCKED")
		}
		if (filters.filterByFailStatus) {
			filtersToApply.push("FAIL")
		}
		if (filters.filterByPendingStatus) {
			filtersToApply.push("PENDING")
		}
		if (filters.filterByNoStatus) {
			filtersToApply.push("NO")
		}

		this.setState({
			filteredExecutions: filtersToApply.length > 0 ? executions.filter(item => filtersToApply.includes(item.status)) : executions,
		})

	}

  handleExpantion(id, changeStatus=false) {
    let {expandedTests} = this.state
    let index = expandedTests.indexOf(id)
    if (index !== -1) {
      expandedTests.splice(index, 1)
    } else if (!changeStatus) {
      expandedTests.push(id)
    }
    this.setState({
      expandedTests,
    })
  }

	handleEditedComments(id, value) {
		let comments = JSON.parse(JSON.stringify(this.state.editedComments));
		comments[id] = value;
		this.setState({
			editedComments: comments
		})
	}

	shouldComponentUpdate(nextProps, nextState) {

  	if (nextState.editedComments !== this.state.editedComments || (!nextState.statusUpdated && nextState.statusUpdated !== this.state.statusUpdated)) {
  		return false;
		}

  	return true;
	}

	getTestMainStep(test) {
    let mainStep = _.find(test.steps, {id: test.mainStepId})
    return mainStep ? mainStep.expectedResult : ''
  }

  saveStatus(execution, status) {
		this.props.showLoadingSpinner(true);
		axios({
			method: "PUT",
			url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateManualTestExecution,
			data: JSON.stringify({...execution, status}),
			headers: {
				'Content-Type': 'application/json'
			},
		}).then(res => {
			this.fetchExecutionList(this.state.testPlan.id, false, true)
		})

  }

  saveComment(execution, comment) {
		this.props.showLoadingSpinner(true);
		axios({
        method: "PUT",
        url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateManualTestExecution,
        data: JSON.stringify({...execution, comment}),
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => {
      this.fetchExecutionList(this.state.testPlan.id, false)
      this.showSnackbar('Comment updated')
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

  showSnackbar(msg) {
    this.setState({ openSnackbar: true, snackbarMsg: msg });
  };

  hideSnackbar() {
    this.setState({
      openSnackbar: false,
      snackbarMsg: '',
    })
  }

  renderSnackbar() {
    return (
      <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={2000}
          onClose={this.hideSnackbar.bind(this)}
        >
          <MySnackbarContentWrapper
            onClose={this.hideSnackbar.bind(this)}
            variant="success"
            message={this.state.snackbarMsg}
          />
      </Snackbar>
    )
  }

	renderRawTestPlan() {
  		const { showRawTestPlan, expandAll } = this.props;
		let {testPlan, filteredExecutions, editedComments, statusUpdated} = this.state

		return (
		  <div key={`testPlan-test`} className="manualTestListItem" style={{marginTop: '10px'}}>
				<div className="manuaTestListCollapse manualTestRuns" style={{display: 'flex', flexDirection: 'column'}}>
					{filteredExecutions.map((execution, index) => {
						let testId = execution.testCase.id;
						let planStatus = _.find(TEST_PLAN_STATUS_ALL, {value: execution.status})

						return <ManualTestRunContainer
							testPlan={testPlan}
							showRawTestPlan={showRawTestPlan}
							expandAll={expandAll}
							statusUpdated={statusUpdated}
							handleEditedComments={this.handleEditedComments.bind(this)}
							updateStatus={this.updateStatus.bind(this)}
							editedComment={editedComments}
							fetchExecutionList={this.fetchExecutionList.bind(this)}
							execution={execution}
							key = {'testRun-' + index}
							index={index}
						/>
					  })
				  }
        </div>
      </div>)
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

	renderDetailedTestPlan() {
		let {testPlan, executions, editedComments, statusUpdated, filteredExecutions} = this.state
		let {classes, showRawTestPlan, expandAll} = this.props

		return filteredExecutions.map((execution, index) => {
			let testId = execution.testCase.id;

			return <ManualTestRunContainer
				testPlan={testPlan}
				showRawTestPlan={showRawTestPlan}
				expandAll={expandAll}
				handleEditedComments={this.handleEditedComments.bind(this)}
				updateStatus={this.updateStatus.bind(this)}
				editedComment={editedComments}
				statusUpdated={statusUpdated}
				fetchExecutionList={this.fetchExecutionList.bind(this)}
				execution={execution}
				key = {'testRun-' + index}
				index={index}
			/>
		})

  }

	onTextFormatClick() {
  	this.props.showLoadingSpinner(true);
		_.delay(() => {this.props.onRawChange()}, 100)
	}

	onExpandClick() {
		this.props.showLoadingSpinner(true);
		_.delay(() => {this.props.onExpandChange()}, 100);
}


	render() {
    let {testPlan, executions, filteredExecutions, isLoading} = this.state
		const { classes, showRawTestPlan, expandAll } = this.props

    if (testPlan) {
      return (
        <div>
          {this.renderSnackbar()}
          {
						executions && executions.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                <span
                    style={{ cursor: 'pointer', color: COLORS.primary, fontSize: '.875rem', textTransform: 'uppercase', flexBasis:'200px' }}
                    onClick={this.onExpandClick.bind(this)}>
                  {!expandAll ? 'Expand all' : 'Collapse all'}
                </span>

				<Grid item xs={12} md={12} className='SearchUIContainer'>
				  <SearchUI isManual={true}
							filterSelected={this.filterList}/>
				</Grid>

				<div className={"showTestsButton"}
						 onClick={this.onTextFormatClick.bind(this)}>
					{showRawTestPlan ? <TextFieldsIcon /> : <FormatClearIcon />}
					{showRawTestPlan ? 'Run test cases' : 'Share'}
				</div>
              </div>

            )
          }
          { showRawTestPlan ? this.renderRawTestPlan() : this.renderDetailedTestPlan()
          }
          {
						!isLoading && executions && executions.length === 0 && (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop:"40px", padding: '40px 40px 40px 40px'}} >
                <h2 className="noRowsSuites">{"This suite contains no tests"}</h2>
                <h2 className="noRowsSuites">
                  {"Try adding some tests from the "}
                  <Link to="/TestRepository"><span style={{ color: COLORS.primary }}>Test Repository</span></Link>
                </h2>
              </div>
            )
          }
        </div>
      )
    } else {
      return <div>Please select a valid test plan</div>
    }
  }
}

export default withStyles(styles)(ManualTestPlanRun)
