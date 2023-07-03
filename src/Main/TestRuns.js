import React, { Component } from 'react';
import Nav from "./Components/Nav"
import Api from "./Components/Api"
import axios from 'axios'
import * as _ from 'underscore'
import ManualTestsStatusBox from "./Components/ManualTestsStatusBox"

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton'
import CircularProgress from "@mui/material/CircularProgress"
import DoneIcon from '@mui/icons-material/Done';

import Grid from "@mui/material/Grid"
import EditIcon from "@mui/icons-material/Edit"
import ClearIcon from "@mui/icons-material/Clear"
import PlayArrowIconIcon from "@mui/icons-material/PlayArrow"
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"

import ManualTestPlanEdit from './Components/ManualTestPlanEdit'
import ManualTestPlanRun from './Components/ManualTestPlanRun'
import CopyrightFooter from "./Components/CopyrightFooter"
import history from "./Components/History"
import withStyles from '@mui/styles/withStyles';
import {styles, COLORS, WIKI_URL} from './Components/Globals'
import $ from 'jquery';
import SearchUI from "./Components/SearchUI";

const manualPlanSteps = {
  PLANS_LIST: 0,
  PLAN_RUN: 1,
}

class TestRuns extends Component {
  state = {
    currentUser: null,
    currentStage: manualPlanSteps.PLANS_LIST,
    currentUrl: this.props.match.params.path,
    helpEnabled: false,
    showRawTestPlan: false,
	expandAll: true,
    expandedPlans: [],
	testPlanList: null,
	testPlanReport: null,
    testPlanRun: null,
    planRun: null,
    select: true,
    assignPlan: '',
    filteredPlanList: null,
    filtersExpanded: false,
    filters: {
        filterByPendingStatus: localStorage.getItem("filterByPendingStatus") == "false" ? false : true
    },
  }

  componentDidMount() {
    this.fetchTestPlanList()
  }

	onHelpClick = filter => event => {
		let value = this.state[filter]
		this.setState({
			[filter]: !value
		})
	}

	onTitleClick = () => {
		history.push("/TestRuns")
		this.setState({
			currentStage: manualPlanSteps.PLANS_LIST,
			testPlanRun: null,
		})
  }

  switchToStage() {
    let currentUrl = this.props.match.path
    let {testPlanRun, testPlanList} = this.state
    if (currentUrl !== this.state.currentUrl) {
      let switchToStage = (path => {
        if (path === "/TestRuns")
          return manualPlanSteps.PLANS_LIST
        if (path === "/TestRuns/Run/:planId")
          return manualPlanSteps.PLAN_RUN
      })(currentUrl)
      if (switchToStage === manualPlanSteps.PLAN_RUN && !testPlanRun) {
        testPlanRun = _.find(testPlanList, {id: parseInt(this.props.match.params.planId)})
      }
      if (currentUrl === "/TestRuns") {
				this.fetchTestPlanList()
      }

      this.setState({
        currentStage: switchToStage,
        currentUrl,
        testPlanRun,
      })
    }
  }

  fetchTestPlanList() {
          axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestPlanList)
              .then(res => {
                  this.setState({
                      testPlanList: res.data.content,
                  })
                  this.applyFilter(this.state.filters.filterByPendingStatus)
              })
          axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestPlanReport)
              .then(res => {
                  this.setState({
                      testPlanReport: res.data,
                  })
              })
  }

  fetchCurrentUser() {
    this.setState({
      currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
    })
  }

  componentDidUpdate() {
    let {currentUser} = this.state
    this.switchToStage()
    if (!currentUser || currentUser === {}) {
      this.fetchCurrentUser()
    }
  }

  getTestMainStep(test) {
    let mainStep = _.find(test.steps, {id: test.mainStepId})
    return mainStep ? mainStep.expectedResult : ''
  }

  onPlanSave(id) {
    this.handleExpantion(id)
    this.fetchTestPlanList()
  }

  renderPlansList() {
    let {classes} = this.props;
    let {expandedPlans, select, testPlanList, testPlanReport, assignPlanId, filteredPlanList} = this.state

    return (
      <div className="manualTestListContainer">
				<div className={"manualTestListHeader"}>
					<div style={{flex: 2}}>
						<span style={{marginLeft: '15px'}}>Test plan</span>
					</div>
					<div style={{flex: 3}}>
						<span>Pending | Status</span>
					</div>
					<div>
						<span>Actions</span>
					</div>
				</div>
        {
            filteredPlanList && filteredPlanList.map((plan, index) => {
          	let planStatus = testPlanReport && _.find(testPlanReport, {id: plan.id})
            return (
              <div key={index} className="manualTestListItem">
                <div className="manualTestListSummary" style={{justifyContent: 'space-between'}}>
                  <div className="manualTestListContent"
										onClick={() => {
											history.push("/TestRuns/Run/" + plan.id)
											this.setState({
												currentStage: manualPlanSteps.PLAN_RUN,
												testPlanRun: plan,
											})
										}}>
                    <div className="manualTestListText"
                         style={{flex: 2}}>
                      <div style={{ alignSelf: 'center', padding: '7px 0', display: "flex", flexDirection: "column" }}>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: "1.2em" }}>{plan.name}</span>
                        </div>
                        <div style={{display: "flex" }}>
                          <div style={{color: 'rgba(0, 0, 0, 0.54)'}}>{plan.assignee && plan.assignee.displayName}</div>
                          <div style={{paddingLeft: 20, maxWidth: 700}}>{plan.description}</div>
                        </div>
                      </div>
                    </div>
                    {planStatus &&
                    <div className={"jobsListBox"} style={{flex: 3}}
                         onClick={() => {
                           history.push("/TestRuns/Run/" + plan.id)
                           this.setState({
                             currentStage: manualPlanSteps.PLAN_RUN,
                             testPlanRun: plan,
                           })
                         }}>
                      <div className={"jobStatusTableCell"} style={{width: '450px'}}>
                        <Grid container alignItems='center'>
                          <Grid item xs={2} md={1}>
                            <Tooltip title={`${planStatus.pending === 0 ? 'No ' : ''}Pending tests`}
                                     classes={{
                                       tooltip: classes.tooltip,
                                       popper: classes.popper,
                                     }}>
                              {planStatus.pending === 0
                                ? <DoneIcon style={{color: COLORS.pass}} />
                                : <div className="tag BuildNumberTag">{planStatus.pending}</div>
                              }
                            </Tooltip>
                          </Grid>
                          <Grid xs={9} md={10} item style={{ paddingLeft: 10 }}>
                            {<ManualTestsStatusBox build={planStatus} />}
                          </Grid>
                        </Grid>
                      </div>
                    </div>
                    }
                  </div>
                  <div>
                    <Tooltip
                      classes={{
                        tooltip: classes.tooltip,
                        popper: classes.popper,
                      }} title="Edit">
                      <IconButton onClick={this.handleExpantion.bind(this, plan.id)} size="large">
                          {
                            expandedPlans.indexOf(plan.id) === -1 ?
                              <EditIcon />
                            : <ClearIcon />
                          }
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      classes={{
                        tooltip: classes.tooltip,
                        popper: classes.popper,
                      }} title={'Run'}>
                      <IconButton
                        onClick={() => {
                          history.push("/TestRuns/Run/" + plan.id)
                          this.setState({
                            currentStage: manualPlanSteps.PLAN_RUN,
                            testPlanRun: plan,
                          })
                        }}
                        size="large">
                          <PlayArrowIconIcon />
                      </IconButton>
                    </Tooltip>
									</div>
                </div>
                {
                  expandedPlans.indexOf(plan.id) !== -1 && (
                    <div className="manuaTestListCollapse">
                      <ManualTestPlanEdit
                          testPlan={plan}
                          onSave={this.onPlanSave.bind(this)}
                          onClose={this.handleExpantion.bind(this)} />
                    </div>
                  )
                }
              </div>
            );
          })
        }
      </div>
    );
  }

  expandedFilters(filtersExpanded) {
    this.setState({
      filtersExpanded,
    })
  }

  handleExpantion(id) {
    let {expandedPlans} = this.state
    let index = expandedPlans.indexOf(id)
    if (index !== -1) {
      expandedPlans.splice(index, 1)
    } else {
      expandedPlans.push(id)
    }
    this.setState({
      expandedPlans,
    })
  }

  renderExtraContent() {
		let {currentStage, testPlanRun} = this.state;
		const {classes} = this.props;
		let content = null;

		if (currentStage === manualPlanSteps.PLAN_RUN) {
		  content = [
				<KeyboardArrowRight key={`arrow-${currentStage}`} style={{padding: "0 15px", fontSize: "2rem", color: COLORS.primary}} />,
				<div key={`navLink manualTestRunTitle-${currentStage}`} className='navLink manualTestRunTitle'>
					<Tooltip
						classes={{
							tooltip: classes.tooltip,
							popper: classes.popper,
						}}
						title={testPlanRun ? testPlanRun.name : ''}>
							<span>{testPlanRun && testPlanRun.name}</span>
					</Tooltip>
				</div>
			]
    }

		return content;
  }

    onRawChange() {
        let {showRawTestPlan} = this.state;

        this.setState({
					showRawTestPlan: !showRawTestPlan,
					expandAll: true
        });
    }

		onExpandChange() {
			let {expandAll} = this.state;
			this.setState({expandAll: !expandAll});
		}

  getHelpItems() {
      let { showRawTestPlan } = this.state;
      let items, goalText, actionText;

  	switch (this.state.currentStage) {
			case manualPlanSteps.PLANS_LIST:
				goalText = 'Overview of Manual Tests Plans to test.';
				actionText =  'Edit Plan, Click to run test cases.';
				break;
			case manualPlanSteps.PLAN_RUN:
				if (showRawTestPlan) {
                    goalText = 'Copy the test cases and share them';
                    actionText =  'Select all test cases > Copy > Paste in email/wiki/etc.';
                }
                else {
                    goalText = 'Test Cases To Do';
                    actionText =  'Pass, Fail, Comment each manual test case execution.';
                }
				break;
		}

  	items = [
  	    [
			{
				title: 'PAGE GOAL',
				text: goalText
			},
			{
				title: 'USER ACTION',
				text: actionText
			},
			{
				title: 'DOCUMENTATION',
				text: `Detailed documentation <a target="_blank" href=${WIKI_URL + "docs/DOC-7103"}>HERE</a>`
			},
			{
				title: null,
				text: null,
				videoURL: 'https://youtu.be/gE9afcNFRaU'
			}
		]
    ]

  	return items;
	}

	showLoadingSpinner(show=true){
		$('.loadingTestPlan').toggleClass('menuItemHidden', !show);
	}

    filterList = (filter, state) => {
        this.setState({
            filters: state
        }, () => {
            if (this.state.filters) {
                localStorage.setItem('filterByPendingStatus', this.state.filters.filterByPendingStatus)
            }
            this.applyFilter(this.state.filters.filterByPendingStatus)
        })
    }

    applyFilter(filterByPending) {
        setTimeout(() => {
            let {testPlanList} = this.state
            if (filterByPending) {
                let filteredPlanList = testPlanList.filter(item => item.status === 'PENDING'
                    || item.status === 'PAUSED'
                    || item.status === 'BLOCKED'
                    || item.status === 'ALERT'
                    || item.status === 'UNDEFINED');
                this.setState({
                    filteredPlanList,
                })
            } else {
                this.setState({
                    filteredPlanList: testPlanList,
                })
            }
        }, 100)
    }


render() {
    let { testPlanList, currentStage, testPlanRun, helpEnabled, showRawTestPlan, expandAll, filteredPlanList } = this.state;
    let helpItems = this.getHelpItems();

    return (
      <div className="homeRoot">
				<Nav
					helpEnabled={helpEnabled}
					helpItems={helpItems}
					screen={'testRuns'}
					title={'Test Runs'}
					onHelpClick={this.onHelpClick.bind(this)}
					onTitleClick={this.onTitleClick.bind(this)}
                    extraContent={this.renderExtraContent()}
				/>
        <main style={{ minHeight: 'calc(100vh - 132px)' }}>
          {
            currentStage === manualPlanSteps.PLANS_LIST && (
              <div style={{ padding: '0 30 30 30' }}>
                <div style={{ marginTop: helpEnabled ? 235 : (this.state.filtersExpanded ? 200 : 102) }}>
                  { testPlanList && testPlanList.length === 0 && (
                    <div style={{display: 'flex', justifyContent: 'center', marginTop:"40px", padding: '40px 40px 40px 40px'}} >
                      <h2 className="noRowsSuites">{"No tests found"}</h2>
                    </div>
                  ) }
                    <Grid item xs={12} md={12} className='SearchUIContainer'>
                        <SearchUI isTestRuns={true}
                                  filterSelected={this.filterList}
                                  placeHolder="What suite are you looking for?" />
                    </Grid>
                  { testPlanList && testPlanList.length > 0 && this.renderPlansList() }
                  {
                    !testPlanList && (
                      <div className="circularProgressContainer">
                          <CircularProgress color="primary" />
                      </div>
                    )
                  }
                </div>
              </div>
            )
          }

          {
            currentStage === manualPlanSteps.PLAN_RUN && (
              <div style={{ padding: '0 30 30 30' }}>
                <div style={{ marginTop: helpEnabled ? 245 : (this.state.filtersExpanded ? 200 : 102) }}>
									{<div className="circularProgressContainer loadingTestPlan loadingWrapper menuItemHidden">
										<CircularProgress disableShrink={true} color="primary"/>
									</div>}
									<ManualTestPlanRun
                      path={this.props.match.params}
                      showRawTestPlan={ showRawTestPlan }
											expandAll={expandAll}
											onExpandChange={this.onExpandChange.bind(this)}
											showLoadingSpinner={this.showLoadingSpinner.bind(this)}
                      onRawChange={ this.onRawChange.bind(this) }
                      testPlan={testPlanRun} />
                </div>
              </div>
            )
          }

        </main>
        <CopyrightFooter helpEnabled={helpEnabled} />
      </div>
    )
  }
}

export default withStyles(styles)(TestRuns)
