import React, { Component } from "react"
import Api from "./Components/Api"
import axios from 'axios'
import * as _  from "underscore"

import "../styles/issuesList.scss"

import SearchUI from "./Components/SearchUI"
import SuitePicker from "./Components/SuitePicker"
import AutomationTestItem from "./Components/AutomationTestItem"
import AutomationManualTestItem from "./Components/AutomationManualTestItem"
import CopyrightFooter from "./Components/CopyrightFooter"
import { renderStackTraceDialog, renderErrorDetailsDialog } from './Components/TriageUtils'

// Icons
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"
import KeyboardCapslockIcon from "@material-ui/icons/KeyboardCapslock"
import ReportIcon from "@material-ui/icons/Report"

//UI Components
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import DialogContent from "@material-ui/core/DialogContent"
import Dialog from "@material-ui/core/Dialog"
import Snackbar from '@material-ui/core/Snackbar'
import { withStyles } from '@material-ui/core/styles'
import Nav from "../Main/Components/Nav"
import {styles, MySnackbarContent, snackbarStyle, COLORS, WIKI_URL} from './Components/Globals'

import DialogTitle from "@material-ui/core/DialogTitle";


const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

class CustomTooltip extends Component {
  render() {
    const { active } = this.props;
    if (active) {
      return (
        <div className="insightsCustomTooltip chartToTriageTooltip">
            <div>
              {this.props.text}
            </div>
        </div>
      );
    }

    return null;
  }
}

class AutomationIssueList extends Component {
  constructor(props) {
      super(props)
      this.userboxData = {
          userfullname: "Default User",
          myAssignedTestsNumber: 4,
      }
      this.state = {
          isListLoaded: false,
          issues: null,
          listRows: [],
          helpEnabled: false,
          stackTraceDialog: false,
          errorDetailsDialog: false,
          error: null,
          openSnackbar: false,
          openSnackbarError: false,
          executorNames: [],
          executorSelected: null,
          currentUser: null,
          newComment: null,
          productPackages: "",
          stackTrace: "",
          manualTestsList: [],
          filters: {
            filterByAssignedToMe: localStorage.getItem("filterByAssignedToMe") == "false" ? false : true,
            filterByPinned: localStorage.getItem("filterByPinned") == "true" ? true : false,
            filterByPassing: localStorage.getItem("filterByPassing") == "false" ? false : true,
            filterByOld: localStorage.getItem("filterByOld") == "false" ? false : true,
            sortBySuiteAutomation: localStorage.getItem("sortBySuiteAutomation") == "true" ? true : false,
            sortByOlderFirst: localStorage.getItem("sortByOlderFirst") == "true" ? true : false,
            sortByNewerFirst: localStorage.getItem("sortByNewerFirst") == "true" ? true : false,
            sortByPriorityDesc: localStorage.getItem("sortByPriorityDesc") == "false" ? false : true,
          }
      }
  }

  componentDidUpdate() {
    let {currentUser, issues, manualTestsList} = this.state
    if (!currentUser || currentUser === {}) {
      this.fetchCurrentUser()
    }
    this.fetchTests()
  }

  fetchTests() {
    if (this.props.match.path.includes("AutomationIssues") && !this.state.issues) {
      this.fetchIssuesList()
    }
    if (this.props.match.path.includes("AutomationCreation") && this.state.manualTestsList.length === 0) {
      this.fetchToAutomate()
    }
  }

  componentWillMount() {
    this.fetchTests()
    this.fetchCurrentUser()
    document.title = "t-Triage - Automation Issues"
  }

  fetchCurrentUser() {
    this.setState({
      currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
    })
  }

  fetchToAutomate() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetManualTestsToAutomate)
      .then(res => {
        this.setState({
          manualTestsList: res.data.content,
        })
      })
  }

	onHelpClick = filter => event => {
		let value = this.state[filter]
		this.setState({
			[filter]: !value
		}, () => {
			this.getList();
    })
	}

  fetchIssuesList = () => {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAutomationIssues + this.getQuery(this.state.filters) )
        .then(res => {
            let {data} = res
            this.setState({
              issues: data.content,
              isListLoaded: true,
            })
            this.getList()
            let executorNames = []

            data.content.forEach(issue => {
                executorNames.push(issue.testTriage.executorName)
            })
            executorNames = _.uniq(executorNames, false).sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0))
            executorNames.unshift("All suites")

            this.setState({
              executorNames
            })
        })
  }

  getPriorityString = priority => {
    switch (true) {
      case (priority >= 400):
        return 'Blocker'
      case (priority >= 200):
        return 'P1'
      case (priority >= 100):
        return 'P2'
      case (priority < 100):
        return 'P3'
    }
  }

  closeStackTraceDialog = () => {
      this.setState({
          stackTraceDialog: false,
      })
  }

  openStackTraceDialog = (stack, productPackages) => {
      this.setState({
          stackTraceDialog: true,
      })
      this.setState({ stackTrace: stack, productPackages })
  }

  renderIcon = priority => {
     switch (true) {
      case priority == "Blocker":
          return <ReportIcon color="secondary" style={{color: COLORS.red, width: 20}} />
      case priority == "P1":
          return <KeyboardCapslockIcon color="secondary" />
      case priority == "P2":
          return <KeyboardArrowUpIcon style={{color: COLORS.orange}} />
      case priority == "P3":
          return <KeyboardArrowDownIcon style={{color: COLORS.green}} />
     }
  }

  closeErrorDetailsDialog = () => {
      this.setState({
          errorDetailsDialog: false,
      })
  }

  openErrorDetailsDialog = error => {
      this.setState({
          errorDetailsDialog: true,
      })
      this.setState({ errorDetails: error })
  }

  updateComment = (issue, ev) => {
    let updateTriage = {
      testTriageDTO: issue.testTriage,
      issueTicketDTO: null,
      automatedTestIssueDTO: issue
    }
    axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateAutomationIssues,
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify(issue)
        }).then(
           response => response.status === 200 ? this.showSuccessSnackbar() : this.showErrorSnackbar()
        ).catch(
          error => this.showErrorSnackbar()
        )
    this.setState({newComment: issue.note })
  }

  updateManualTestComment = (test, ev) => {
    axios({
        method: "PUT",
        url: `${Api.getBaseUrl()}${Api.ENDPOINTS.UpdateManualTest}`,
        data: JSON.stringify(test),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(
       response => response.status === 200 ? this.showSuccessSnackbar() : this.showErrorSnackbar()
    ).catch(
      error => this.showErrorSnackbar()
    )
  }

  clearText = (area, noteIssue, noteTriage, ev) => {
      if (noteIssue) {
        if (this.state.newComment) {
          document.querySelector("div."+area+" div textArea:last-child").value = this.state.newComment.description
          return;
        }
        document.querySelector("div."+area+" div textArea:last-child").value = noteIssue.description
      } else if (noteTriage) {
        document.querySelector("div."+area+" div textArea:last-child").value = noteTriage.description
      } else {
        document.querySelector("div."+area+" div textArea:last-child").value = ''
      }

  }

  showSuccessSnackbar = () => {
    this.setState({ openSnackbar: true });
  };

  showErrorSnackbar = () => {
    this.setState({ openSnackbarError: true });
  };

  hideSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
     this.setState({ openSnackbar: false });
  };

  hideSnackbarError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ openSnackbarError: false });
  };

  copyToClipboard(details) {
    navigator.clipboard.writeText(details)
  }

  pinTest = testId => {
    axios({
      method: 'POST',
      url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateTestTriagePin,
      data: `testid=${testId}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    }).then(res => {
        this.filterList(null, this.state.filters)
      })
  }



    openNewTestDialog() {
        this.setState({
            newTestOpen: true,
        })
    }

    onNewTestDialogClose() {
        this.setState({
            newTestOpen: false,
            isLoading: true
        }, () => {

        })
    }
    renderAddTestDialog() {
        let {newTestOpen} = this.state;

        return newTestOpen && (
            <Dialog
                open={newTestOpen}
                onClose={this.onNewTestDialogClose.bind(this)}
                maxWidth="xl"
                aria-labelledby="newManualTest-dialog-title"
                aria-describedby="newManualTest-dialog-description">
                <DialogTitle id="newManualTest-dialog-title">New Test</DialogTitle>
                <DialogContent id="newManualTest-dialog-description">
                    To register a new test that needs to be automated, please go to <b>Manual Test > Repository > New Test</b> and specify: Ready For Automation Pending Medium
                    <br/>
                    <br/>
                    Alternatively you can directly program the automated test in your IDE, run in CI and it'll be automatically imported by t-Triage
                </DialogContent>
            </Dialog>
        )
    }

  getQuery(state) {
    let query = ""
    let ownAssigned = false
    let pinned = false
    let executorName = null
    let passingOnes = false
    let hideOld = false
    let sort = ""

    if (this.state.filters) {
        if (this.state.filters.filterByAssignedToMe) {
          ownAssigned = true
        }
        if (this.state.filters.filterByPinned) {
          pinned = true
        }
        if (!this.state.filters.filterByPassing) {
          passingOnes = true
        }
        if (!this.state.filters.filterByOld) {
            hideOld = true
        }
    }

    if (this.state.executorSelected && this.state.executorSelected  != "All suites") {
      executorName = this.state.executorSelected
    }

    if (this.state.filters.sortByPriorityDesc) {
      sort = "calculatedPriority,desc"
    } else if (this.state.filters.sortBySuiteAutomation) {
      sort = "testTriage.executorName,asc"
    } else if (this.state.filters.sortByOlderFirst) {
      sort = "testTriage.executionDate,asc"
    } else if (this.state.filters.sortByNewerFirst) {
      sort = "testTriage.executionDate,desc"
    }


    let filter = {
      assignee: ownAssigned,
      pin: pinned,
      executorName: executorName,
      passingIssues: passingOnes,
      hideOld: hideOld
    }

    return `/filters?filter=${JSON.stringify(filter)}&sort=${sort}`
  }

  filterList = (filter, state) => {
        this.setState({
          filters: state
        }, () => {

          if (this.state.filters || this.state.executorSelected) {

              localStorage.setItem("filterByAssignedToMe", state.filterByAssignedToMe)
              localStorage.setItem("filterByPinned", state.filterByPinned)
              localStorage.setItem("filterByPassing", state.filterByPassing)
              localStorage.setItem("filterByOld", state.filterByOld)
              localStorage.setItem("sortByPriorityDesc", state.sortByPriorityDesc)
              localStorage.setItem("sortBySuiteAutomation", state.sortBySuiteAutomation)
              localStorage.setItem("sortByOlderFirst", state.sortByOlderFirst)
              localStorage.setItem("sortByNewerFirst", state.sortByNewerFirst)


              axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAutomationIssues + this.getQuery(state))
                .then(res => {
                    this.setState({
                      issues: res.data.content,
                      isListLoaded: true,
                    })
                    this.getList()
                })
            } else {
              this.fetchIssuesList()
              this.getList()
            }
        })
  }

  filterByExecutor = (executor) => {
    this.setState({executorSelected: executor})
    this.filterList(null, this.state.filters)
  }

  showButtons = (id, ev) => {
    var buttons = document.getElementsByClassName("button"+id);
    for (var i = 0; i < buttons.length; i++) {
      if (  buttons[i].style.visibility == "visible") {
        buttons[i].style.visibility = "hidden";
      } else {
        buttons[i].style.visibility = "visible";
      }
    }
  }

  getToAutomateList() {
    let {manualTestsList} = this.state;
    return (
      <Grid container spacing={24} style={{ padding: 30 }}>
        {
          manualTestsList.map((test, index) => {
            return (
              <AutomationManualTestItem
                  key={`manualTest-${test.id}`}
                  test={test}
                  showButtons={this.showButtons.bind(this)}
                  clearText={this.clearText.bind(this)}
                  updateManualTestComment={this.updateManualTestComment.bind(this)} />
            )
          })
        }
      </Grid>
    )
  }

  getList = (list) => {
      const { classes } = this.props

      let issueList = null;
      list ? issueList = list : issueList = this.state.issues

      if (issueList && issueList.length > 0) {
        if (this.state.isListLoaded) {
          this.setState({
            listRows: (
              <Grid container spacing={24} style={{ padding: 30 }}>
                {
                  issueList.map((issue, index) => {
                    let openCount = 0,
											passingCount = 0;

										if (issue.issueType === 'OPEN') {
											openCount++;
                    }
                    else if (issue.issueType === 'PASSING') {
											passingCount++;
										}

                    return <AutomationTestItem
                        key={`automIssue-${issue.id}`}
												helpEnabled={this.state.helpEnabled}
                        issue={issue}
                        index={index}
                        openCount={openCount}
                        passingCount={passingCount}
                        pinTest={this.pinTest.bind(this)}
                        renderIcon={this.renderIcon.bind(this)}
                        getPriorityString={this.getPriorityString.bind(this)}
                        openErrorDetailsDialog={this.openErrorDetailsDialog.bind(this)}
                        openStackTraceDialog={this.openStackTraceDialog.bind(this)}
                        showButtons={this.showButtons.bind(this)}
                        clearText={this.clearText.bind(this)}
                        updateComment={this.updateComment.bind(this)} />
                  })
                }
              </Grid>
            )
          })

        }
      } else {
        this.setState({
            listRows: (
              <Paper key="noRows" style={{margin:"40px 30px", padding: '40px 40px 40px 40px'}}>
                  <h2 style={{ textAlign: "center" }} className="noRowsSuites">There are not any automation issues matching the assigned filter</h2>
              </Paper>
            )
        })
      }
  }

	getHelpItems(isAutomation=false, isCreation=false) {
		let items, goalText, actionText;

		if (isAutomation) {
			goalText = 'Organized test failures to fix.';
			actionText =  'Pin a test, fix in your IDE.';
    }
    else if (isCreation) {
			goalText = 'Manual tests with "Ready For Automation" Pending';
			actionText =  'Click on AUTOMATION DONE and specify how to locate the test.';
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
                    text: `Detailed documentation <a target="_blank" href=${WIKI_URL + "docs/DOC-6974#jive_content_id_Automation_Issues"}>HERE</a>`
                },
                {
                    title: null,
                    text: null,
                    videoURL: 'https://youtu.be/bZ051re3J8U'
                }
            ]
        ];

		return items;
	}

  render() {
    const { classes } = this.props
    let {manualTestsList, helpEnabled} = this.state
    let isAutomation = this.props.match.path.includes("AutomationIssues")
    let isCreation = this.props.match.path.includes("AutomationCreation")
		let helpItems = this.getHelpItems(isAutomation, isCreation);

    return (
        <div className="homeRoot">
            {this.renderAddTestDialog()}
					<Nav
						helpEnabled={helpEnabled}
						helpItems={helpItems}
						screen={'automationIssueList'}
						title={isAutomation ? "Automation Issues" : (isCreation ? "Automation Creation" : '')}
						onHelpClick={this.onHelpClick.bind(this)}
					/>
          <main id="automationListDiv" style={{ marginTop: helpEnabled ? 245 : 100 }}>

                {renderStackTraceDialog(
                  this.state.stackTraceDialog,
                  this.closeStackTraceDialog.bind(this),
                  this.state.stackTrace,
                  this.state.productPackages,
                )}
                {renderErrorDetailsDialog(
                  this.state.errorDetailsDialog,
                  this.closeErrorDetailsDialog.bind(this),
                  this.state.errorDetails,
                )}



                <div style={{padding: '0', backgroundColor: "transparent"}} classes={{root: classes.noShadow}}>
                  <Grid container justify="flex-end" style={{ marginBottom: -30 }}>
                      <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                          <SearchUI
                              automationList={true}
                              sort={true}
                              filterSelected={this.filterList}
                              isKanban={false}
                              placeHolder="What issue are you looking for?"/>
                          <SuitePicker
                              executorNames={this.state.executorNames}
                              executorFilter={this.filterByExecutor.bind(this)}/>
                      </Grid>
                  </Grid>
                </div>


                { isAutomation && this.state.listRows }
                { isCreation && manualTestsList.length > 0 && this.getToAutomateList() }




            </main>
            <CopyrightFooter helpEnabled={helpEnabled}/>
            <Snackbar
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                open={this.state.openSnackbar}
                autoHideDuration={2000}
                onClose={this.hideSnackbar}
              >
                <MySnackbarContentWrapper
                  onClose={this.hideSnackbar}
                  variant="success"
                  message="Comment updated"
                />
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                open={this.state.openSnackbarError}
                autoHideDuration={2000}
                onClose={this.hideSnackbarError}
              >
                <MySnackbarContentWrapper
                  onClose={this.hideSnackbarError}
                  variant="error"
                  message="Something went wrong"
                />
            </Snackbar>
        </div>
    )
  }

}

export default withStyles(styles)(AutomationIssueList);
