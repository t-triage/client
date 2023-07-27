import React, { Component } from "react"
import * as _  from "underscore"
import { Link } from 'react-router-dom'
import axios from 'axios'

import Api from "./Components/Api"
import StatusBox from "./Components/StatusBox"
import UserPicker from "./Components/UserPicker"
import PriorityPicker from "./Components/PriorityPicker"
import TodayList from "./Components/TodayList"
import SuiteNavigation from "./Components/SuiteNavigation"
import SuiteActionDialog from "./Components/SuiteActionDialog";
import SuiteOptionListPopover from "./Components/SuiteOptionListPopover";
import {styles, renderDeadLine, COLORS} from './Components/Globals'


// UI Components
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import PriorityIcon from "@mui/icons-material/TrendingUp"
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline"
import DoneIcon from '@mui/icons-material/Done';
import withStyles from '@mui/styles/withStyles';
import Snackbar from '@mui/material/Snackbar'
import SuiteListEdit from "./Components/SuiteListEdit";
import { scrollToTop } from '../Admin/AdminUtils'
import Alert from '@mui/material/Alert';


class SuiteList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isKanban: !!this.props.suiteID ? 1 : 0,
            kanbanID: !!this.props.suiteID ? props.suiteID : 0,
            fetchError: null,
            suiteList: null,
            todayList: null,
            pendingAutomIssues: 0,
            jobListRows: [],
            selectedContainer: props.params.containerID,
            nothingToShow: false,
            openSnackbar: false,
            snackbarMsg: '',
            filters: {
              filterByFailures: localStorage.getItem("filterByFailures") == "true" ? true : false,
              filterByOwnAssigned: localStorage.getItem("filterByOwnAssigned") == "true" ? true : false,
              filterByDisabled: localStorage.getItem("filterByDisabled") == "false" ? false : true,
              sortByJobPriority: localStorage.getItem("sortByJobPriority") == "true" ? true : false,
              sortBySuite: localStorage.getItem("sortBySuite") == "true" ? true : false,
              filterBySuiteName: localStorage.getItem("searchSuite"),
            },
            suiteListOptionsOpen: false,
            showActionDialog: false,
        }
    }

    componentDidMount() {
      this.props.onRef(this)
      document.title = "t-Triage - Triage"
      scrollToTop()
    }

    componentWillUnmount() {
      this.props.onRef(undefined)
    }

    showSnackbar(msg) {
      this.setState({ openSnackbar: true, snackbarMsg: msg });
    };

    hideSnackbar() {
      this.setState({
        openSnackbar: false, snackbarMsg: ''
      })
    };

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
            <Alert variant={"filled"} severity="success" onClose={this.hideSnackbar.bind(this)}>
                message={this.state.snackbarMsg}
            </Alert>
        </Snackbar>
      )
    }

    fetchMyAutomationPendingIssues = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetMyPendingIssues)
        .then(res => {
          this.setState({
            pendingAutomIssues: res.data,
          })
        })
    }

    fetchTodayList = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetMyList)
            .then(res => {

                this.setState({
                    todayList: res.data,
                    searchingTodayList: false,
                })
            })

        .catch(err => {
            console.log("Error fetching My List...")
            this.setState({fetchError: err})
        })
    }

    fetchJobsByContainerID = (containerId) => {
        let showAll = containerId === 'all'
        axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.ViewExecutors}${this.getQuery(this.state.filters)}`)
            .then(res => {
                let suiteList = res.data.content;
                this.setState({
                    suiteList,
                    searching: false,
                })
                this.getJobList(suiteList)
            })
            .catch(err => {
              console.log("Error fetching executors...")
              this.setState({fetchError: err})
            })
    }

    getQuery(state) {
      let query = ""
      let suiteName = ""
      let ownAssigned = state.filterByOwnAssigned
      let failures = state.filterByFailures
      let disabled = state.filterByDisabled
      let container = this.state.selectedContainer
      let sort = ""

      if (state.filterBySuiteName && state.filterBySuiteName.length > 4) {
        let suite = state.filterBySuiteName
        suite = suite.includes("*") || suite.includes("%")  ? suite.replace(/%|\*/g," ") : suite
        suiteName = `${suite}`
      }

      if (container == 'all') {
        container = 0
      }

      if (state.sortByJobPriority) {
        sort = "ShortPriority,desc"
      }else if (state.sortBySuite) {
        sort = "ExecutorName,desc"
        sort = "ExecutorName,desc"
      }

      let filter = {
        assignee: ownAssigned,
        containerId: container,
        failures: failures,
        hideDisabled: disabled,
        search: suiteName
      }

      return `?filter=${JSON.stringify(filter)}&sort=${sort}`
    }

    filterList = (filter, state, isSearch) => {
      let {selectedContainer} = this.state
      let showAll = selectedContainer === 'all'
      let ms = state.filterBySuiteName != "" ? 3000 : 1000
      this.setState({
        searching: true,
      })


      axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.ViewExecutors}${this.getQuery(state)}`).then(x => new Promise(resolve => setTimeout(() => resolve(x), isSearch ? ms : 0)))
          .then(res => {
              let suiteList = res.data.content;
              this.setState({
                  suiteList,
              })
              this.getJobList(suiteList)
          })
          .catch(err => {
            console.log("Error fetching executors...")
            this.setState({fetchError: err})
          })

      localStorage.setItem('filterByFailures', state.filterByFailures)
      localStorage.setItem('filterByOwnAssigned', state.filterByOwnAssigned)
      localStorage.setItem('filterByDisabled', state.filterByDisabled)
      localStorage.setItem('sortByJobPriority', state.sortByJobPriority)
      localStorage.setItem('sortBySuite', state.sortBySuite)
      this.setState({
        filters: {
          filterByFailures: state.filterByFailures,
          filterByOwnAssigned: state.filterByOwnAssigned,
          sortByJobPriority: state.sortByJobPriority,
          sortBySuite: state.sortBySuite,
          filterBySuiteName: state.filterBySuiteName,
          filterByDisabled: state.filterByDisabled,
        }
      })
    }

    handleFilterUpdate =  (containerID) => {
      let current = this.state.selectedContainer;
      let selectedContainer = containerID
      if (current !== containerID) {
        this.setState({
          selectedContainer,
          searching: true,
          searchingTodayList: true
        }, () => {
          if (!current || current !== containerID) {
            this.fetchTodayList()
            this.fetchMyAutomationPendingIssues()
            this.fetchJobsByContainerID(containerID)
          }
        })
      }
    }

    updateSuiteList(suiteList, job, jobIndex) {
      suiteList.splice(jobIndex, 1, job)
      this.setState({
        suiteList
      }, () => {
        this.getJobList(suiteList)
      })
    }

    updateTodayList(todayList, job, jobIndex) {
      todayList.splice(jobIndex, 1, job)
      this.setState({
        todayList
      })
    }

    setPriority(type, buildTriageId, shortPriority) {
      let {state} = this;
      let today = type === 'today'
      let suiteList = today ? state.todayList : state.suiteList;
      let job = _.find(suiteList, { buildTriageId })
      let jobIndex = _.findIndex(suiteList, { buildTriageId })
      job = { ...job, shortPriority }
      if (today) {
        this.updateTodayList(suiteList, job, jobIndex)
      } else {
        this.updateSuiteList(suiteList, job, jobIndex)
      }
    }

    selectSuite = (ev, value) => {
        if (!ev.ctrlKey && ev.button !== 1) {
            let suiteID = this.findSuiteID(ev.target)
            let suiteContainerID = this.findSuiteContainerID(ev.target)
            this.props.selectSuite(suiteID, suiteContainerID)
        }
    }

    findSuiteID = (el) => {
        let e = el.parentElement
        return !!(e.getAttribute("data-jobid")) ? e.getAttribute("data-jobid") : this.findSuiteID(e)
    }

    findSuiteContainerID = (el) => {
        let e = el.parentElement
        return !!(e.getAttribute("data-jobcontainerid")) ? e.getAttribute("data-jobcontainerid") : this.findSuiteContainerID(e)
    }

    enableExecutor = (buildid) => {
        axios({
          method: 'POST',
          url: Api.getBaseUrl() + Api.ENDPOINTS.EnableSuite,
          data: `buildid=${buildid}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        })
        .then(response => {
            this.showSnackbar("Suite enabled successfully", 'success')
            this.fetchJobsByContainerID(this.state.selectedContainer)
        })
        .catch(err => {
            this.showSnackbar("Something went wrong", 'success')
        })


    }

    openSuiteActionDialog(actionDialogType,  build, dialogResponseData=null) {
        this.setState({
            showActionDialog: true,
            actionDialogType,
            dialogResponseData,
            build,
        })

    }

    closeActionDialog() {
        this.setState({
            showActionDialog: false,
        })
    }

    renderActionDialog() {
        let {showActionDialog, actionDialogType, dialogResponseData, build} = this.state;
        let props = {
            isOpen: showActionDialog,
            type: actionDialogType,
            responseData: dialogResponseData,
        }

        if(actionDialogType === 'editSuite'){
            return showActionDialog && (
                <SuiteListEdit {...props}
                               onClose={this.closeActionDialog.bind(this)}
                               executorId={build.executorId}
                />
            )
        } else {
            return showActionDialog && (
                <SuiteActionDialog {...props}
                                   onClose={this.closeActionDialog.bind(this)}
                                   showSnackbar={this.showSnackbar.bind(this)}
                                   buildId={build.buildTriageId}
                                   suite={build}
                                   executorId={build.executorId}
                />
            )
        }
    }

    getJobList = (suiteList) => {
        let {classes} = this.props
        let rows = []
        if (suiteList && suiteList.length > 0) {
            for (let i=0; i < suiteList.length; i++) {
                let build = suiteList[i]
                let totalTestCases = build.passCount + build.failCount

                rows.push(
                    <TableRow key={i} className="jobsTableRow" data-jobid={build.executorId} data-jobcontainerid={build.containerId}>
                        <TableCell className="SuiteList-NameCell" style={{width: "30%"}}>
                            <Link style={{textDecoration: 'none', color: 'inherit'}} onClick={this.selectSuite} to={`/SuiteList/${build.executorId}/Kanban`}>
                            <div style={{paddingTop: 15, paddingBottom: 15}}>
                                {build.executorName[0]==='~' || build.executorName[0]=== '-' ? <div style={{ opacity: .3}}> {build.executorName.slice(1)}</div>:<div>{build.executorName}</div>}
                                        <div style={{
                                    color: "#BEBEBE"
                                }}><b>#{build.buildNumber}</b> { new Date(build.executiondate).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        weekday: "short",
                                        day: "numeric",
                                        hour12: false,
                                        hour: "2-digit",
                                        minute: "numeric",
                                    }
                                    )}</div>
                            </div>
                            </Link>
                        </TableCell>
                        <TableCell className="jobStatusTableCell" style={{width: "35%"}}>
                            <Grid container alignItems='center'>
                              <Grid  xs={2}  >
                                    <Tooltip title={build.totalTestsToTriage === 0 ? "Test Suite Triage Done" : "To Triage"}
                                             classes={{
                                                 tooltip: classes.tooltip,
                                                 popper: classes.popper,
                                             }}>
                                            {build.totalTestsToTriage === 0
                                                ? <DoneIcon style={{color: COLORS.pass}} />
                                                : <div className="tag BuildNumberTag">{build.totalTestsToTriage}</div>
                                            }
                                    </Tooltip>
                                </Grid>
                                <Grid xs={9} md={10} item style={{ paddingLeft: 12 }}>
                                    <StatusBox build={build} />
                                </Grid>
                            </Grid>
                        </TableCell>
                        <TableCell className="padding0" align="left" style={{width: "10%"}}>
                            {renderDeadLine(build, build.deadlineTooltip, this.props.classes)}
                        </TableCell>
                        <TableCell align="center">
                            <PriorityPicker
                                onClick={this.setPriority.bind(this, 'suite')}
                                buildTriageId={build.buildTriageId}
                                selectedPriority={build.shortPriority} />
                        </TableCell>
                        <TableCell align="center">
                            <Grid container>
                              <Grid item md={9}>
                                  <UserPicker
                                      id={'userPicker-' + i}
                                      buildTriage={build.buildTriageId}
                                      updateTodayList={this.fetchTodayList.bind(this)}
                                      updateBacklog={this.fetchJobsByContainerID.bind(this)}
                                      selectedContainer={this.state.selectedContainer}
                                      selectedItem={build.assignee} />
                              </Grid>
                              <Grid item md={3}>
                                  <SuiteOptionListPopover
                                      suite={build}
                                      executorId={build.executorId}
                                      isEnable={build.enabled === true}
                                      onClick={this.openSuiteActionDialog.bind(this)}
                                  />
                              </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                )
            }
        } else {
          rows.push(
            <TableRow key="noSuites" className="jobsTableRow" style={{height: "40px", backgroundColor: "transparent"}} >
                <TableCell align="center" colSpan="5">
                    <h2 className="noRowsSuites">{"There aren't any suites"}</h2>
                </TableCell>
            </TableRow>
          )
        }
        this.setState({
          jobListRows: rows,
          searching: false,
        })
    }

    render() {
        const { classes } = this.props
        const { searching } = this.state

        const JobsList = (props) => (
          <Paper
            style={{margin:"10px 30px", backgroundColor: "#f6f6f6", boxShadow: "none"}}
            classes={{root: classes.noShadow}}
          >

                <Table style={{borderCollapse: "separate", borderSpacing: "0 10px"}}>
                    <TableHead>
                        <TableRow>
                            <TableCell className="headerTable">Suite Name</TableCell>
                            <TableCell className="headerTable">To Triage|Status</TableCell>
                            <TableCell className="headerTable padding0" align="center">Sprint Deadline</TableCell>
                            <TableCell className="headerTable" align="center">Priority</TableCell>
                            <TableCell className="headerTable" align="center">Assignee</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { this.state.jobListRows }
                    </TableBody>
                </Table>
            <Grid container alignItems="center">
                    <Grid item xs={3}>
                    </Grid>
                    <Grid item xs={9} style={{pointerEvents: "none", opacity: "0.5"}}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={this.state.jobListRows.length}
                            rowsPerPage={100}
                            page={1}
                            backIconButtonProps={{
                                'aria-label': 'Previous Page',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Next Page',
                            }}
                            onPageChange={() => {}}
                            disabled={true}
                        />
                    </Grid>
                </Grid>
            </Paper>
        )

        return (
          <div>
            {
              !this.state.nothingToShow && (
                <TodayList
                    setPriority={this.setPriority.bind(this, 'today')}
                    todayList={this.state.todayList}
                    pendingAutomIssues={this.state.pendingAutomIssues}
                    selectSuite={this.selectSuite.bind(this)}
										helpEnabled={this.props.helpEnabled}
                    searchingTodayList={this.state.searchingTodayList} />
              )
            }
            <SuiteNavigation
                triageStage={this.props.triageStage}
                updateFilter={this.handleFilterUpdate.bind(this)}
                nothingToShow={(value) => this.setState({ nothingToShow: value })}
                filterSelected={this.filterList.bind(this)}
                containerID={this.state.selectedContainer} />
            {
              this.state.jobListRows.length > 0 && (
                <Grid container className="jobsListBox"  alignItems="flex-end">
                    <Grid item xs={12}>
                       {
                         !searching && <JobsList />
                       }
                       {
                         searching &&  (
                           <div className="circularProgressContainer">
                               <CircularProgress color="primary" />
                           </div>
                         )
                       }
                    </Grid>
                </Grid>
              )
            }


            {
              this.state.fetchError && (
                <div style={{position: "absolute", left: "calc(50% - 30px)", top: "50%"}} >
                  <h2 className="noRowsSuites">{"Error loading executors"}</h2>
                </div>
              )
            }
              {this.renderActionDialog()}
              {this.renderSnackbar()}
          </div>

        )
    }
}
export default withStyles(styles)(SuiteList)
