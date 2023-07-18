import React, { Component } from 'react';
import "../styles/triage.scss"
import axios from 'axios'
import classNames from 'classnames'

// CUSTOM COMPONENTS
import UserPicker from './Components/UserPicker'
import TestTriageFooter from "./Components/TestTriageFooter"
import TriagePreviousBuilds from "./Components/TriagePreviousBuilds"
import Api from "./Components/Api"
import TriageInfoBox from "./Components/TriageInfoBox"
import TestHistoryGraph from "./Components/TestHistoryGraph"
import {
    getSummaryDetails,
    getStatusTagColor,
    getStatusTagName,
    copyToClipboard,
    renderStackTraceDialog,
    renderErrorDetailsDialog,
    renderStepDetailsDialog,
    renderScreenshotDialog,
    renderDiffDetailsDialog,
    formatException, isEmptyOrNull,
} from './Components/TriageUtils'
import { scrollToTop } from '../Admin/AdminUtils'
import { styles, MySnackbarContent, snackbarStyle, COLORS } from './Components/Globals'

// MATERIAL COMPONENTS
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import Snackbar from "@mui/material/Snackbar"
import SnackbarContent from "@mui/material/SnackbarContent"
import ListItem from "@mui/material/ListItem"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import Tooltip from "@mui/material/Tooltip"

// ICONS
import PinIcon from "../images/pin.svg"
import PinDisabledIcon from "../images/pin-disabled.svg"
import LaunchIcon from "@mui/icons-material/Launch"
import TimelineIcon from '@mui/icons-material/Timeline'
import CancelIcon from '@mui/icons-material/Cancel'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'
import ViewListIcon from '@mui/icons-material/ViewList'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import HistoryIcon from '@mui/icons-material/History'
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AssignmentIcon from "@mui/icons-material/Assignment"
import InfoIcon from "@mui/icons-material/Info"
import WhatshotIcon from "@mui/icons-material/Whatshot"
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot"
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet"
import withStyles from '@mui/styles/withStyles';


const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

class Triage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            testTriageId: '',
            mainTestTriageId: '',
            testTriage: null,
            pinnedTest: false,
            isTestTriageLoaded: false,
            prevTriageIndex: 0,
            prevTriage: null,
            prevTriageDetails: null,
            footerExpanded: true,
            previousDataLoading: true,
            stackTraceDialogOpen: false,
            openSnackbar: false,
            snackbarMsg: '',
            stackTrace: '',
            errorDetailsDialogOpen: false,
            errorDetails: '',
            screenshotDialogOpen: false,
            selectedTestName: '',
            testSteps: [],
            diffDetails: '',
            prevDetail: '',
            newDetails: '',
            diffDetailsDialogOpen: false,
            testTriageIssueTicket: '',
        }
        this.userboxData = {
            userfullname: "Default User",
            myAssignedTestsNumber: 4,
            myAssignedIssuesNumber: 4
        }
    }

    escFunction(ev) {
        let {target, keyCode} = ev
        let kanbanData = localStorage.getItem("kanbanData")
        if (keyCode === 27 && (target.tagName === 'BODY' || target.tagName === 'BUTTON')) {
            this.props.goToKanban(this.state.testTriage.executorId, kanbanData ? false : true)
        }
    }

    componentDidMount() {
        document.title = "t-Triage - Test"
        document.addEventListener("keydown", this.escFunction.bind(this), false);
        let {testId} = this.props;
        this.setState({
            testTriageId: testId,
            mainTestTriageId: testId,
        }, () => {
            this.fetchTriage();
            this.fetchDetails();
        })
        scrollToTop()
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction.bind(this), false);
    }

    showSnackbar(msg) {
        this.setState({
            openSnackbar: true,
            snackbarMsg: msg,
        });
    };

    hideSnackbar() {
        this.setState({
            openSnackbar: false, snackbarMsg: ''
        }, () => {
            this.props.goToKanban(this.state.testTriage.executorId, true)
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
                <MySnackbarContentWrapper
                    onClose={this.hideSnackbar.bind(this)}
                    variant="success"
                    message={this.state.snackbarMsg}
                />
            </Snackbar>
        )
    }

    onDiffDetailsDialogClose() {
        this.setState({
            diffDetailsDialogOpen: false,
        })
    }

    openDiffDetailsDialog(prevDetail, newDetail) {
        this.setState({
            diffDetailsDialogOpen: true,
            prevDetail,
            newDetail,
        })
    }

    onStackTraceDialogClose() {
        this.setState({
            stackTraceDialogOpen: false,
        })
    }

    openStackTraceDialog(stackTrace) {
        this.setState({
            stackTraceDialogOpen: true,
            stackTrace,
        })
    }

    onScreenshotDialogClose() {
        this.setState({
            screenshotDialogOpen: false,
        })
    }

    openScreenshotDialog() {
        this.setState({
            screenshotDialogOpen: true,
        })
    }

    onErrorDetailsDialogClose() {
        this.setState({
            errorDetailsDialogOpen: false,
        })
    }

    openStepDetailsDialog(step) {
        this.setState({
            stepDetailsDialogOpen: true,
            stepDetails: step.output,
            stepDetailsName: step.name
        })
    }

    onStepDetailsDialogClose() {
        this.setState({
            stepDetailsDialogOpen: false,
            stepDetails: '',
            stepDetailsName: '',
        })
    }

    openErrorDetailsDialog(errorDetails) {
        this.setState({
            errorDetailsDialogOpen: true,
            errorDetails,
        })
    }

    getDejaVuErrors = (data, type) => {
        return data && (
            <List>
                {
                    data.map((sameError, i) => {
                        return (
                            <ListItem key={i} className='TriageDialogListItem'>
                                <Grid container>
                                    <Grid item xs={9} className='TriageDialogList'>
                                        <div className='TriageDialogListItemDescription'>
                                            {
                                                type === 'sameError' ? sameError.displayName : sameError.suiteName
                                            }
                                        </div>
                                        <div style={{
                                            color: COLORS.grey,
                                            fontSize: '.75rem',
                                            marginLeft: '5px',
                                        }}>
                                    <span onClick={
                                        this.fetchDejaVuTriage.bind(
                                            this,
                                            type === 'sameError' ?
                                                sameError.testID
                                                : sameError.testTriage.id
                                        )
                                    }
                                          style={{cursor: 'pointer'}}>
                                        {'+ Click to details'}
                                    </span>
                                        </div>
                                    </Grid>
                                    <Grid item xs={3} className='statusTag' style={{
                                        backgroundColor: getStatusTagColor(sameError.testTriage.currentState),
                                    }}>
                                        {getStatusTagName(sameError.testTriage.currentState)}
                                    </Grid>
                                </Grid>
                            </ListItem>
                        )
                    })
                }
            </List>
        )
    }

    getStatsDetails(testId) {
        return <TestHistoryGraph testId={testId}/>
    }

    pinTest() {
        this.setState({
            pinnedTest: !this.state.pinnedTest,
        }, () => {
            axios.post(Api.getBaseUrl() + Api.ENDPOINTS.UpdateTestTriagePin +
                `?testid=${this.props.testId}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
            }).then(() => {
                this.fetchTriage()
                localStorage.removeItem("kanbanData")
            })
        })
    }

    getPreviousTriageDetails = () => {
        let {previousDataLoading} = this.state;

        return !previousDataLoading && (
            <TriagePreviousBuilds
                {...this.state}
                copyToClipboard={copyToClipboard.bind(this)}
                openStackTraceDialog={this.openStackTraceDialog.bind(this)}
                openErrorDetailsDialog={this.openErrorDetailsDialog.bind(this)}
                getPreviousBuildData={this.getPreviousBuildData.bind(this)}
                getNextBuildData={this.getNextBuildData.bind(this)}
                openDiffDetailsDialog={this.openDiffDetailsDialog.bind(this)}/>
        )
    }

    getPreviousBuildData() {
        let {prevTriageIndex} = this.state;
        if (prevTriageIndex !== 0) {
            this.setState({
                prevTriageIndex: prevTriageIndex - 1,
                previousDataLoading: true,
            }, () => {
                this.fetchPreviousTriage()
            })
        }
    }

    getNextBuildData() {
        let {prevTriageIndex, testTriage} = this.state;
        if (prevTriageIndex !== testTriage.previousTriage.length - 1) {
            this.setState({
                prevTriageIndex: prevTriageIndex + 1,
                previousDataLoading: true,
            }, () => {
                this.fetchPreviousTriage()
            })
        }
    }

    expandPanel() {
        let {footerExpanded} = this.state;
        this.setState({
            footerExpanded: !footerExpanded,
        })
    }

    fetchIssueTicket = (issueTicketId) => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetIssueTicket + issueTicketId)
            .then(res => {
                this.setState({
                    testTriageIssueTicket: res.data,
                })
            })
    }

    fetchDetails = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestTriageDetails + this.props.testId)
            .then(res => {
                this.setState({
                    testTriageDetails: res.data,
                })
            })
            .catch(err => {
                console.log("Error fetching triage details info... Retrying...")
            })
    }

  fetchPreviousTriage = () => {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestTriage + this.state.testTriage.previousTriage[this.state.prevTriageIndex])
          .then(res => {
              this.setState({
                prevTriage: !res.data.error ? res.data : null,
                previousDataLoading: false,
              })
          })
      .catch(err => {
          console.log("Error fetching previous triage info...")
      })
    }

  fetchTriage = () => {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestTriage + this.state.testTriageId)
          .then(res => {
              let {data} = res
              let isPath = data.testExecution.groupName && data.testExecution.groupName.indexOf("/")
              let groupName = isPath && isPath != -1 ? data.testExecution.groupName.substring(data.testExecution.groupName.lastIndexOf("/")+1) : data.testExecution.groupName
              this.setState({
                  testTriage: data,
                  isTestTriageLoaded: true,
                  pinnedTest: data.testExecution.pin,
                  applicationFailType: data.applicationFailType,
                  prevTriageIndex: data.previousTriage.length - 1,
                  selectedTestName: <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: data.testExecution.groupName ? 'block' : 'none' }}>
                          {`${groupName}`}
                      </div>
                      <ChevronRightIcon style={{ fontSize: 20, display: data.testExecution.groupName ? 'block' : 'none' }} />
                      <div>
                          {`${data.testExecution.shortName}`}
                      </div>
                  </div>,
              }, () => {
                this.props.setSelectedSuite(data.executorId)
                if (data.hasSteps) {
                  this.fetchSteps(data.testExecution.id)
                }
                if (data.previousTriage.length > 0) {
                  this.fetchPreviousTriage()
                } else {
                  this.setState({
                    previousDataLoading: false,
                  })
                }
              })
          })
      .catch(err => {
          console.log(err);
          console.log("Error fetching triage info...")
      })
    }

  fetchSteps(id) {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestSteps + id)
        .then(res => {
          let {data} = res;
          this.setState({
            testSteps: res.data,
          })
        })
  }

  fetchDejaVuTriage(testId) {
    window.open(`${window.location.origin}/Test/${testId}/Triage`)
  }

  onAssigneeChange(user) {
      axios.post(Api.getBaseUrl() + Api.ENDPOINTS.AssignTest +
            `?userid=${user.id}&testid=${this.state.testTriage.id}`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
      }).then(() => this.fetchTriage())
  }

  copyTriage() {
    let {testTriage} = this.state;
    let separator = "\n \n";
    let details = "";

    if (!isEmptyOrNull(testTriage.currentState) &&
        !isEmptyOrNull(testTriage.testExecution.groupName) &&
        !isEmptyOrNull(testTriage.testExecution.displayName)) {
        details += "Automation " + testTriage.currentState + " " + testTriage.testExecution.groupName + ": " + testTriage.testExecution.displayName;
        details += separator;

        details += "*" + testTriage.testExecution.groupName + ": " + testTriage.testExecution.displayName + "*";
        details += "\n" + "Test status: " + testTriage.currentState;
    }
    if (!isEmptyOrNull(testTriage.deducedReason)){
        details += "\n" + "_Status Description:_" + testTriage.deducedReason;
    }
    if (!isEmptyOrNull(testTriage.executionDate)) {
        details += "\n" + "_Executed:_ " + new Date(testTriage.executionDate).toLocaleString();
    }
    if (!isEmptyOrNull(testTriage.containerId)) {
        //TODO change url text
        details += "\n" + "_at:_ " + "[Content Regression Tests|" +"/SuiteList/Container/"+ testTriage.containerId + "]";
    }
    if (!isEmptyOrNull(testTriage.executorName) && !isEmptyOrNull(testTriage.externalBuildURL)) {
        details += "\n" + "_in:_ [" + testTriage.executorName + "|" + testTriage.externalBuildURL + "]";
    }
    if (!isEmptyOrNull(testTriage.buildNumber)) {
        details += "\n" + "_build:_ " + testTriage.buildNumber;
    }
    details += separator +
        "h5. t-Triage";
    details += "\n" + "* " + window.location.href;
    if (!isEmptyOrNull(testTriage.triager.displayName)){
        details += "\n" + "* Owner: " + testTriage.triager.displayName;
    }
    if (!isEmptyOrNull(testTriage.issueTicketId)){
        this.fetchIssueTicket(testTriage.issueTicketId)
        details += "\n" + "* Product Issue: " + this.state.testTriageIssueTicket.url;
    }
    if (!isEmptyOrNull(testTriage.testFailType) && testTriage.testFailType != "UNDEFINED"){
        details += "\n" + "* Automation Issue: " + testTriage.testFailType;
    }
    if (testTriage.note != null) {
        if (!isEmptyOrNull(testTriage.note.description)) {
            details += "\n" + "* Note: " + testTriage.note.description;
        }
    }
    details += separator;
    if (!isEmptyOrNull(testTriage.pastTriageTimestamp)){
        details += "\n" + "_Previous Execution:_ " +
            new Date(testTriage.pastTriageTimestamp).toLocaleString();
    }
    if (!isEmptyOrNull(testTriage.pastState)) {
        details += "\n" + "_Previous Status:_ " + testTriage.pastState;
    }
    if (!isEmptyOrNull(testTriage.pastTestFailType) && testTriage.pastTestFailType != "UNDEFINED") {
        details += "\n" + "_Previous Automation Bug:_ " + testTriage.pastTestFailType;
    }
    if (testTriage.pastNote != null){
        if (!isEmptyOrNull(testTriage.pastNote.description)){
            details += "\n" + "_Previous Triage Note:_ " + testTriage.pastNote.description;
        }
    }
    details += separator +
        "h5. Logs";
    if (!isEmptyOrNull(testTriage.testExecution.screenshotURLs)) {
        details += "\n" + "!" + testTriage.testExecution.screenshotURLs + "|thumbnail!";
    }
    details += separator;
    if (!isEmptyOrNull(testTriage.testExecution.errorDetails)) {
        details += "Detail: \n" +
            "{code} \n" +
            testTriage.testExecution.errorDetails + "\n" +
            "{code}" +
            separator;
    }
    if (!isEmptyOrNull(testTriage.testExecution.errorStackTrace)) {
        details += "Stack Trace: \n" +
            "{code} \n" +
            testTriage.testExecution.errorStackTrace + "\n" +
            "{code}" +
            separator;
      }

      copyToClipboard(details);

  }

  render() {
    let {isTestTriageLoaded, testTriage, testTriageDetails, footerExpanded, pinnedTest, prevTriage, testSteps} = this.state;
    let {classes} = this.props;

    if (isTestTriageLoaded) {
      return (
        <div style={{ marginBottom: footerExpanded ? 200 : 60 }}>
            {this.renderSnackbar()}
            {renderStackTraceDialog(
              this.state.stackTraceDialogOpen,
              this.onStackTraceDialogClose.bind(this),
              this.state.stackTrace,
              testTriage.productPackages,
            )}
            {renderDiffDetailsDialog(
                this.state.diffDetailsDialogOpen,
                this.onDiffDetailsDialogClose.bind(this),
                this.state.prevDetail,
                this.state.newDetail,
            )}
            {renderErrorDetailsDialog(
              this.state.errorDetailsDialogOpen,
              this.onErrorDetailsDialogClose.bind(this),
              this.state.errorDetails,
            )}
            {renderStepDetailsDialog(
              this.state.stepDetailsDialogOpen,
              this.onStepDetailsDialogClose.bind(this),
              this.state.stepDetails,
              this.state.stepDetailsName,
            )}
            {renderScreenshotDialog(
              this.state.screenshotDialogOpen,
              this.onScreenshotDialogClose.bind(this),
              testTriage.testExecution.screenshotURLs[0],
            )}
            <div style={{display: 'flex',justifyContent: 'space-between', alignItems: 'center', flex: 1, flexWrap: 'wrap'}}>
                <div style={{display: "flex", alignItems:"center"}}>
                <h5 className="TriageSuiteTestName">
                    {this.state.selectedTestName}
                </h5>
                <a href={testTriage.externalBuildURL} target="_blank">
                    <Tooltip
                        classes={{
                          tooltip: classes.tooltip,
                          popper: classes.popper,
                        }}
                        title={  <div>
                              <span>CI Run: {testTriage.buildNumber}</span><br/>
                              <span>Execution Date: {new Date(testTriage.executionDate).toLocaleDateString("en-US", {
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: false,
                              })}</span>
                          </div>}>
                        <div className="tag BuildNumberTag">{`#${testTriage.buildNumber}`}</div>
                    </Tooltip>
                </a>
                </div>
                <div style={{alignItems:"center", marginRight:"50px"}}>
                <Tooltip title="Copy Jira Report to clipboard"
                         classes={{
                             tooltip: classes.tooltip,
                             popper: classes.popper,
                         }}>
                    <FileCopyIcon
                        color="primary"
                        onClick={this.copyTriage.bind(this)}
                        style={{display:'flex', cursor: 'pointer', marginLeft: 10}} />
                </Tooltip>
                </div>
            </div>
            <Grid spacing={24} container style={{padding: '0 30 30 30'}}>
                <Grid item md={4} sm={6} xs={12}>
                    <TriageInfoBox
                        marginTop={0}
                        title={'Summary'}
                        showExtra={true}
                        extra={
                          <Tooltip
                              classes={{
                                tooltip: classes.tooltip,
                                popper: classes.popper,
                              }}
                              title={
                                pinnedTest && testTriage.testExecution.pinAuthor && testTriage.testExecution.pinDate > 0 ?
                                  <div>
                                    <div><b>{testTriage.testExecution.pinAuthor.displayName}</b></div>
                                    <div>
                                        {new Date(testTriage.testExecution.pinDate).toLocaleDateString("en-US", {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                    </div>
                                  </div>
                                : 'Pin test'
                              }>
                              <img
                                  height={pinnedTest ? 35 : 30}
                                  width={pinnedTest ? 35 : 30}
                                  onClick={this.pinTest.bind(this)}
                                  style={{
                                    transform: 'rotate(45deg)',
                                    marginTop: -10,
                                    marginRight: -5,
                                    cursor: 'pointer',
                                  }}
                                  src={pinnedTest ? PinIcon : PinDisabledIcon} />
                          </Tooltip>
                        }
                        details={getSummaryDetails(testTriage, this.onAssigneeChange.bind(this))}
                        plainDetails={false}
                        icon={<ViewListIcon className='triageBoxIcon' style={{color: COLORS.blue}} />}
                        color={COLORS.blue} />
                    <TriageInfoBox
                        marginTop={24}
                        title={'Error Details'}
                        showExtra={testTriage.testExecution.screenshotURLs.length > 0 || testTriage.testExecution.errorDetails ? true : false}
                        extra={
                          <div style={{ display: 'flex' }}>
                              {
                                testTriage.testExecution.screenshotURLs.length > 0 && (
                                  <Button
                                      color="primary"
                                      variant="outlined"
                                      onClick={this.openScreenshotDialog.bind(this)}
                                      style={{ fontSize: 12, padding: '0 5', borderRadius: '3px' }}>
                                      Screenshots
                                  </Button>
                                )
                              }
                              {
                                testTriage.testExecution.errorDetails && (
                                  <div>
                                    <Tooltip title="Copy to clipboard"
                                        classes={{
                                          tooltip: classes.tooltip,
                                          popper: classes.popper,
                                        }}>
                                        <AssignmentIcon
                                            color="primary"
                                            onClick={copyToClipboard.bind(this, testTriage.testExecution.errorDetails)}
                                            style={{ cursor: 'pointer', marginLeft: 10, width: 20 }} />
                                    </Tooltip>
                                    <Tooltip title="Maximize"
                                        classes={{
                                          tooltip: classes.tooltip,
                                          popper: classes.popper,
                                        }}>
                                        <SettingsEthernetIcon
                                            color="primary"
                                            onClick={this.openErrorDetailsDialog.bind(this, testTriage.testExecution.errorDetails)}
                                            style={{ cursor: 'pointer', marginLeft: 10, transform: 'rotate(-45deg)', width: 20 }} />
                                    </Tooltip>
                                  </div>
                                )
                              }
                          </div>
                        }
                        height={200}
                        openErrorDetailsDialog={this.openErrorDetailsDialog.bind(this)}
                        description={
                          !testTriage.testExecution.errorDetails ?
                              <span>{'No error details'}</span>
                          :   ''
                        }
                        plainDetails={true}
                        shortBox={true}
                        details={
                          testTriage.testExecution.errorDetails ?
                              testTriage.testExecution.errorDetails
                          :   ''
                        }
                        icon={<CancelIcon className='triageBoxIcon' style={{color: COLORS.red}} />}
                        color={COLORS.red} />
                    <TriageInfoBox
                        marginTop={24}
                        title={'StackTrace'}
                        showExtra={testTriage.testExecution.errorStackTrace ? true : false}
                        extra={
                          testTriage.testExecution.errorStackTrace && (
                            <div>
                              <Tooltip title="Copy to clipboard"
                                  classes={{
                                    tooltip: classes.tooltip,
                                    popper: classes.popper,
                                  }}>
                                  <AssignmentIcon
                                      color="primary"
                                      onClick={copyToClipboard.bind(this, testTriage.testExecution.errorStackTrace)}
                                      style={{ cursor: 'pointer', marginLeft: 10, width: 20 }} />
                              </Tooltip>
                              <Tooltip title="Maximize"
                                  classes={{
                                    tooltip: classes.tooltip,
                                    popper: classes.popper,
                                  }}>
                                  <SettingsEthernetIcon
                                      color="primary"
                                      onClick={this.openStackTraceDialog.bind(this, testTriage.testExecution.errorStackTrace)}
                                      style={{ cursor: 'pointer', marginLeft: 10, transform: 'rotate(-45deg)', width: 20 }} />
                              </Tooltip>
                            </div>
                          )
                        }
                        height={200}
                        openStackTraceDialog={this.openStackTraceDialog.bind(this)}
                        description={
                          !testTriage.testExecution.errorStackTrace ?
                              <span>{'No StackTrace'}</span>
                          :   ''
                        }
                        plainDetails={true}
                        shortBox={true}
                        details={
                          !!testTriage.testExecution.errorStackTrace ?
                              testTriage.testExecution.errorStackTrace
                          :   ''
                        }
                        icon={<ViewHeadlineIcon className='triageBoxIcon' style={{color: COLORS.purple}} />}
                        color={COLORS.purple}/>
                    {
                      testSteps.length > 0 && (
                        <TriageInfoBox
                          marginTop={24}
                          title={'Steps'}
                          details={
                            <div className="triageBoxDetailsSteps">
                              {testSteps.map((step, index) => {
                                return (
                                  <div
                                    key={`automStep-${step.id}`}
                                    onClick={this.openStepDetailsDialog.bind(this, step)}
                                    style={{ marginBottom: 5, display: 'flex', cursor: 'pointer' }}>
                                    <h6>{index + 1}</h6>
                                    <span style={{ marginLeft: 5 }}>{step.name}</span>
                                  </div>
                                )
                              })}
                            </div>
                          }
                          icon={<TimelineIcon className='triageBoxIcon' style={{color: COLORS.yellow}} />}
                          color={COLORS.yellow} />
                      )
                    }
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                    <TriageInfoBox
                        marginTop={0}
                        icon={<TrendingUpIcon className='triageBoxIcon' style={{color: COLORS.blue}} />}
                        plainDetails={false}
                        details={this.getStatsDetails(testTriage.id)}
                        showExtra={true}
                        padding="10 20 5 20"
                        extra={
                          <Tooltip title={
                            testTriageDetails ? (
                              <Grid container direction='column'>
                                  <Grid item>
                                      <h6>Consecutive Fails</h6>
                                  </Grid>
                                  <Grid item>
                                      <div>
                                          {
                                            testTriageDetails.consecutiveFails > 0 && testTriageDetails.failsSince !== 0 &&
                                            (`There are some consecutive fails since ${
                                              new Date(testTriageDetails.failsSince).toLocaleDateString("en-US", {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                              })
                                            }`)
                                          }
                                          {
                                            testTriageDetails.consecutiveFails === 0 && (
                                              'No recent fails'
                                            )
                                          }
                                          {
                                            testTriageDetails.consecutiveFails !== 0 && testTriageDetails.failsSince === 0 && (
                                              'This test has always failed'
                                            )
                                          }
                                      </div>
                                      <div>
                                          {`${testTriageDetails.historicFails} historic fails`}
                                      </div>
                                  </Grid>
                                  <Grid item style={{ marginTop: 10 }}>
                                      <h6>Historic Passes</h6>
                                  </Grid>
                                  <Grid item>
                                      <span>
                                          {testTriageDetails.historicPasses}
                                      </span>
                                  </Grid>
                              </Grid>
                            ) : ''
                          } classes={{
                            tooltip: classes.tooltip,
                            popper: classes.popper,
                          }}>
                              <InfoIcon
                                  style={{ fontSize: '1.3rem', color: COLORS.grey }} />
                          </Tooltip>
                        }
                        title={'Stats'} />
                    <TriageInfoBox
                        marginTop={24}
                        title={'Déjà vu Error'}
                        description={<small>Same error found in other tests</small>}
                        plainDetails={false}
                        dejaVu={true}
                        details={
                          testTriageDetails ?
                              testTriageDetails.sameErrorsAt.length > 0 ?
                                  this.getDejaVuErrors(testTriageDetails ? testTriageDetails.sameErrorsAt : null, 'sameError')
                              :   <div style={{fontSize: '.875rem', marginTop: 10}}>{'Error not found in other tests'}</div>
                          :   (
                            <div className="circularProgressContainer">
                                <CircularProgress color="primary" />
                            </div>
                          )
                        }
                        icon={<WhatshotIcon className='triageBoxIcon' style={{color: COLORS.blue, width: 38}} />}
                        color={COLORS.blue} />
                    <TriageInfoBox
                        marginTop={24}
                        title={'Déjà vu Test'}
                        description={<small>Same test found in other suites</small>}
                        plainDetails={false}
                        dejaVu={true}
                        details={
                          testTriageDetails ?
                              testTriageDetails.sameTestAt.length > 0 ?
                                  this.getDejaVuErrors(testTriageDetails ? testTriageDetails.sameTestAt : null, 'sameTest')
                              :   <div style={{fontSize: '.875rem', marginTop: 10}}>{'Test not found in other suites'}</div>
                          :   (
                            <div className="circularProgressContainer">
                                <CircularProgress color="primary" />
                            </div>
                          )
                        }
                        icon={<ScatterPlotIcon className='triageBoxIcon' style={{color: COLORS.blue}} />}
                        color={COLORS.blue} />
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                    <TriageInfoBox
                        title={'Previous Runs'}
                        showExtra={ testTriage.previousTriage.length > 0 ? true : false}
                        extra={
                          <Tooltip
                              classes={{
                                tooltip: classes.tooltip,
                                popper: classes.popper,
                              }}
                              title={
                                <div>
                                    {`CI Run: ${prevTriage && prevTriage.buildNumber}.`}
                                    <br />
                                    {`Analyzing run ${this.state.prevTriageIndex + 1} from last ${testTriage.previousTriage.length} runs.`}
                                </div>
                              }>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                  { prevTriage && <div className="tag BuildNumberTag" style={{ fontWeight: 'normal' }}>{`#${prevTriage.buildNumber}`}</div>}
                                  <Typography style={{color: COLORS.primary, fontWeight: 'bold' }}>
                                      {`${this.state.prevTriageIndex + 1}/${testTriage.previousTriage.length}`}
                                  </Typography>
                                  <LaunchIcon color='primary' style={{ fontSize: 14, marginTop: 1, marginLeft: 3 }} />
                              </div>
                          </Tooltip>
                        }
                        buildLink={prevTriage && prevTriage.externalBuildURL}
                        plainDetails={false}
                        details={this.getPreviousTriageDetails(testTriageDetails)}
                        icon={<HistoryIcon className='triageBoxIcon' style={{color: COLORS.blue}} />} />
                </Grid>
                <Grid item className='TestCaseDialogActions'>
                    <TestTriageFooter
                        expandPanel={this.expandPanel.bind(this)}
                        panelExpanded={footerExpanded}
                        showSnackbar={this.showSnackbar.bind(this)}
                        testTriage={testTriage} />
                </Grid>
            </Grid>
        </div>
      )
    } else {
      return (
        <div className="circularProgressContainer" style={{ height: '80%' }}>
            <CircularProgress color="primary" />
        </div>
      )
    }
  }
}

export default withStyles(styles)(Triage)
