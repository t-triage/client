import * as _  from "underscore"
import React, {Component} from "react"
import "../styles/kanban.scss"
import axios from 'axios'
import {Link} from 'react-router-dom'
import Api from "./Components/Api"
import SuiteActionDialog from "./Components/SuiteActionDialog"
import UserPicker from "./Components/UserPicker"
import StatusBar from "./Components/StatusBar"
import SuiteHistoryChart from './Components/SuiteHistoryChart'
import {styles, MySnackbarContent, snackbarStyle, getDeadlineIconColor, COLORS} from './Components/Globals'
import {getKanbanTagColor, getCheckIcon, getCheckIconTooltip} from './Components/KanbanUtils'
import {getTestFailTagName, getApplicationFailTagName, renderPopover} from './Components/TriageUtils'
import SearchUI from "./Components/SearchUI"
import DialogTitle from "@material-ui/core/DialogTitle"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import {scrollToTop} from '../Admin/AdminUtils'
// Colors
import Amber from "@material-ui/core/colors/amber"
import Red from "@material-ui/core/colors/red"
import Green from "@material-ui/core/colors/green"
import Blue from "@material-ui/core/colors/blue"

// Icons
import CommentIcon from "@material-ui/icons/Notes"
import AccessTimeIcon from "@material-ui/icons/AccessTime"
import PinIcon from "../images/pin-grey.svg"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import TuneIcon from "@material-ui/icons/Tune"
import LaunchIcon from "@material-ui/icons/Launch"
import SpellcheckIcon from "@material-ui/icons/Spellcheck"
import FlipToFrontIcon from "@material-ui/icons/Launch"
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace"
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"
import KeyboardCapslockIcon from "@material-ui/icons/KeyboardCapslock"
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight"
import FlakyTestIcon from "../images/FlakyTestIcon.svg"
import PersonIcon from "@material-ui/icons/Person"

// UI Components
import Drawer from "@material-ui/core/Drawer"
import CircularProgress from "@material-ui/core/CircularProgress"
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import Snackbar from '@material-ui/core/Snackbar'
import {withStyles} from '@material-ui/core/styles'
import Avatar from "@material-ui/core/Avatar"

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

const emptyTestTriages = {
    FAIL: [],
    NEWFAIL: [],
    NOWPASSING: [],
    TRIAGEDONE: [],
}


const testTags = {
    NEWFAIL: {
        data: [],
        length: 0,
        name: "New Fail",
        color: Red[500],
        helpMessage: 'Test has been always passing, now it\'s failing.'
    },
    FAIL: {
        data: [],
        length: 0,
        name: "Fail",
        color: Red["A700"],
        helpMessage: 'Intermitent failures, prioritized list.'
    },
    NOWPASSING: {
        data: [],
        length: 0,
        name: "New Pass",
        color: Green[500],
        helpMessage: 'Test executed long time ago and it was cleaned up'
    },
    TRIAGEDONE: {
        data: [],
        length: 0,
        name: "Triage Done",
        color: Blue[500],
        helpMessage: 'Auto triaged and manually triaged test.'
    }
}

const TagLabel = (props) => (
    <Tooltip
        classes={{
            tooltip: props.classes.tooltip,
            popper: props.classes.popper,
        }}
        title={props.tooltip}>
        <div style={{
            ...props.style,
            backgroundColor: props.color,
            color: (!!props.textColor) ? props.textColor : "white",
            height: 6,
            width: 20,
            borderRadius: 5,
            marginRight: 8,
            marginTop: 1,
            padding: '2 5',
            pointerEvents: 'initial',
        }}>
          <span style={{color: 'white', fontSize: 10}}>
              {props.children}
          </span>
        </div>
    </Tooltip>
)

class Kanban extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedSuite: props.selectedSuite,
            testTriages: [],
            testPassedList: [],
            isTestCaseLoaded: false,
            selectedTestCaseId: null,
            showActionDialog: false,
            testPassedDialogOpen: false,
            openSnackbar: false,
            snackbarMsg: '',
            variant: 'success',
            goBack: true,
            isSummaryOpen: false,
            actionsElement: null,
            drawerOpened: false,
            confirmationDialogOpen: false,
            currentUser: null,
            replaceAssignee: null,
            helpEnabled: props.helpEnabled,
            totalTriages: 0,
            filters: {
                filterByAutomatedTriaged: localStorage.getItem("filterByAutomatedTriaged") == "true" ? true : false,
                filterByBugsOnly: localStorage.getItem("filterByBugsOnly") == "true" ? true : false,
                filterByTestAssignedToMe: localStorage.getItem("filterByTestAssignedToMe") == "true" ? true : false,
                filterByTestInProgress: localStorage.getItem("filterByTestInProgress") == "true" ? true : false,
                sortByTestName: localStorage.getItem("sortByTestName") == "true" ? true : false,
                sortByTestRank: localStorage.getItem("sortByTestRank") == "true" ? true : false,
                sortByTestCategory: localStorage.getItem("sortByTestCategory") == "true" ? true : false,
                searchKanban: localStorage.getItem("searchKanban") ? localStorage.getItem("searchKanban") : ""
            }
        }
        this.openRef = React.createRef();
        this.fetchedExecutor = null
    }


    showSnackbar(msg, variant = "success", goBack = true) {
        this.setState({openSnackbar: true, snackbarMsg: msg, variant, goBack});
    };

    hideSnackbar() {
        this.setState({
            openSnackbar: false, snackbarMsg: ''
        })
        if (this.state.goBack) {
            this.props.goBack(this.fetchedExecutor.containerId)
        }
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
                    variant={this.state.variant}
                    message={this.state.snackbarMsg}
                />
            </Snackbar>
        )
    }

    componentDidMount() {
        let {currentUser} = this.state
        if (!currentUser || currentUser === {}) {
            this.getCurrentUser()
        }

        this.setState({
            isTestCaseLoaded: false
        }, () => {
            if (this.props.loadKanbanData) {
                this.fetchTests()
                axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetViewExecutorHistory + this.props.selectedSuite)
                    .then(res => {
                        localStorage.setItem('suiteHistory', JSON.stringify(res.data))
                    })
            } else {
                this.loadLocalStorageData()
            }
        })
        scrollToTop()
        document.title = "t-Triage - Kanban"
    }

    getCurrentUser() {
        this.setState({
            currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
        })
    }

    renderCheckIcon(hasNewData, applicationFailType, testFailType, triaged) {
        if (hasNewData) {
            return (
                <Tooltip
                    classes={{
                        tooltip: this.props.classes.tooltip,
                        popper: this.props.classes.popper,
                    }}
                    title={getCheckIconTooltip(applicationFailType, testFailType, triaged)}>
                    {getCheckIcon(hasNewData, applicationFailType, testFailType)}
                </Tooltip>
            )
        } else {
            return null
        }
    }

    openActionDialog(actionDialogType, dialogResponseData = null) {
        this.setState({
            showActionDialog: true,
            actionDialogType,
            dialogResponseData
        })
    }

    closeActionDialog() {
        this.setState({
            showActionDialog: false,
        })
    }

    renderDialogTestPassed() {
        this.fetchTestPass();
    }

    renderActionDialog() {
        let {showActionDialog, actionDialogType, dialogResponseData} = this.state;
        let props = {
            isOpen: showActionDialog,
            onClose: this.closeActionDialog.bind(this),
            type: actionDialogType,
            responseData: dialogResponseData,
            buildId: this.fetchedExecutor.buildTriageId,
            showSnackbar: this.showSnackbar.bind(this)
        }

        return showActionDialog && (
            <SuiteActionDialog {...props} />
        )
    }

    loadLocalStorageData() {

        let res = JSON.parse(localStorage.getItem("kanbanDataFiltered")) ? JSON.parse(localStorage.getItem("kanbanDataFiltered")) : JSON.parse(localStorage.getItem("kanbanData"))
        this.fetchedExecutor = JSON.parse(localStorage.getItem("kanbanData"))
        this.props.setSelectedContainerID(res.containerId)
        this.setState({
            selectedSuiteName: res.executorName,
            selectedSuiteBuildNumber: res.buildNumber
        })
        this.RenderKanban(res.testTriages, this.props.classes)

    }

    renderPriorityIcon = test => {
        switch (true) {
            case test.rank >= 7:
                return (
                    <Tooltip
                        classes={{
                            tooltip: this.props.classes.tooltip,
                            popper: this.props.classes.popper,
                        }}
                        title={
                            <div>
                                <div>Critical Failure: Weight {test.rank}</div>
                                <div>{test.deducedReason}</div>
                            </div>
                        }>
                        <KeyboardCapslockIcon style={{color: "rgb(210, 210, 210)", width: 22}}/>
                    </Tooltip>
                )
            case test.rank >= 5:
                return (
                    <Tooltip
                        classes={{
                            tooltip: this.props.classes.tooltip,
                            popper: this.props.classes.popper,
                        }}
                        title={
                            <div>
                                <div>Medium Priority Failure: Weight {test.rank}</div>
                                <div>{test.deducedReason}</div>
                            </div>
                        }>
                        <KeyboardArrowUpIcon style={{color: "rgb(210, 210, 210)", width: 22}}/>
                    </Tooltip>
                )
            case test.rank == 4:
                return (
                    <Tooltip
                        classes={{
                            tooltip: this.props.classes.tooltip,
                            popper: this.props.classes.popper,
                        }}
                        title={
                            <div>
                                <div>Low priority Failure: Weight {test.rank}</div>
                                <div>{test.deducedReason}</div>
                            </div>
                        }>
                        <KeyboardArrowDownIcon style={{color: "rgb(210, 210, 210)", width: 22}}/>
                    </Tooltip>
                )
            case test.rank >= 1:
                return (
                    <Tooltip
                        classes={{
                            tooltip: this.props.classes.tooltip,
                            popper: this.props.classes.popper,
                        }}
                        title={
                            <div>
                                <div>Auto Triaged: Weight {test.rank}</div>
                                <div>{test.deducedReason}</div>
                            </div>
                        }>
                        <KeyboardArrowRightIcon style={{color: "rgb(210, 210, 210)", width: 22}}/>
                    </Tooltip>
                )
        }
    }

    fetchTestPass = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetExecutorPass + this.state.selectedSuite)
            .then(res => {
                this.setState({
                    testPassedList: res.data
                })
                this.openActionDialog("testPassed", this.state.testPassedList);
            })
    }

    fetchTests = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetExecutor + this.state.selectedSuite)
            .then(res => {
                let {data} = res
                localStorage.setItem('kanbanData', JSON.stringify(data))
                localStorage.setItem('kanbanDataFiltered', JSON.stringify(data))
                this.fetchedExecutor = data
                this.props.setSelectedContainerID(data.containerId)
                this.setState({
                    selectedSuiteName: data.executorName,
                    selectedSuiteBuildNumber: data.buildNumber,
                    totalTriages: res.data.testTriages.FAIL.length + res.data.testTriages.NEWFAIL.length + res.data.testTriages.NOWPASSING.length + res.data.testTriages.TRIAGEDONE.length
                })
                this.filterList(null, this.state.filters)
            })
            .catch(err => {
                console.log("Error fetching tests...")
            })
    }

    openTestCaseDialog = (ev) => {
        let id = ev.currentTarget.getAttribute("data-testcase-triage-id")
        this.setState({
            selectedTestCaseId: id
        })
    }

    addTestsToAssignee() {
        if (this.state.replaceAssignee) {
            axios({
                method: 'POST',
                url: Api.getBaseUrl() + Api.ENDPOINTS.AssignSuite,
                data: `userid=${this.state.replaceAssignee.id}&buildid=${this.fetchedExecutor.buildTriageId}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
            }).then(res => {
                this.onConfirmationDialogClose()
                this.showSnackbar('Assignees succesfully replaced', 'success')
            })
        }

    }

    openConfirmationDialog = (ev) => {
        this.setState({
            replaceAssignee: ev !== null && ev,
            confirmationDialogOpen: true,

        })
    }

    onConfirmationDialogClose() {
        this.setState({
            confirmationDialogOpen: false,
        })
    }

    renderConfirmationDialog() {
        let {confirmationDialogOpen} = this.state
        let props = {
            open: confirmationDialogOpen,
            onClose: this.onConfirmationDialogClose.bind(this),
            maxWidth: "md",
        }

        return confirmationDialogOpen && (
            <Dialog {...props}
                    aria-labelledby="addToPlan-dialog-title"
                    aria-describedby="addToPlan-dialog-description">
                <DialogTitle id="addToPlan-dialog-title">
                    Change Assignee
                </DialogTitle>
                <DialogContent id="addToPlan-dialog-description">
                    {`Are you sure you want to replace all?`}
                </DialogContent>
                <DialogActions style={{padding: '16'}}>
                    <Button
                        onClick={this.onConfirmationDialogClose.bind(this)}
                        className="globalButton"
                        type="submit"
                        variant="contained"
                        color='secondary'>
                        {'No'}
                    </Button>
                    <Button
                        onClick={this.addTestsToAssignee.bind(this)}
                        className="globalButton"
                        type="submit"
                        variant="contained"
                        color='primary'>
                        {'Yes'}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    getReportDetails(buildTriageId) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetReportDetails + `/${buildTriageId}`)
            .then(res => {
                let {data} = res
                this.openActionDialog('textReport', data)
            })
            .catch(err => {
                console.log("Error getting Report details.")
                this.showSnackbar("Error getting Report details.", "error", false);
            })
    }

    goTriage(id, ev) {
        if (!ev.ctrlKey && ev.button !== 1) {
            this.props.goTriage(id)
        }
    }

    getQuery(state) {
        let sort = ""
        let automatedTriages = false
        let bugsOnly = false
        let search = ""
        let filterByTestInProgress = false

        if (this.state.filters) {

            if (this.state.filters.filterByAutomatedTriaged) {
                automatedTriages = true
            }

            if (this.state.filters.filterByBugsOnly) {
                bugsOnly = true
            }

            if (this.state.filters.filterByTestAssignedToMe) {
                //asignee = true
            }

            if (this.state.filters.filterByTestInProgress) {
                filterByTestInProgress = true
            }

            if (this.state.filters.searchKanban != "") {
                search = `&search=${this.state.filters.searchKanban}`
            }

            if (this.state.filters.sortByTestName) {
                sort = "sortBy=displayName"
            } else if (this.state.filters.sortByTestRank) {
                sort = "sortBy=rank,desc"
            } else if (this.state.filters.sortByTestCategory) {
                sort = "sortBy=groupName"
            }
        }

        return `?automatedTriaged=${automatedTriages}&bugsOnly=${bugsOnly}${search}&${sort}`
    }

    searchFields = (item) => {
        return item.testExecution.displayName.toLowerCase().includes(this.state.filters.searchKanban.toLowerCase())
            || item.testExecution.name.toLowerCase().includes(this.state.filters.searchKanban.toLowerCase()) ||
            item.testExecution.groupName.toLowerCase().includes(this.state.filters.searchKanban.toLowerCase())
            || (item.testExecution.errorDetails != null && item.testExecution.errorDetails.toLowerCase().includes(this.state.filters.searchKanban.toLowerCase()))
    }

    searchKanban = (items) => {

        if (items.FAIL) {
            items.FAIL = items.FAIL.filter((item) =>
                this.searchFields(item)
            )
        }

        if (items.NEWFAIL) {
            items.NEWFAIL = items.NEWFAIL.filter((item) =>
                this.searchFields(item)
            )
        }

        if (items.NOWPASSING) {
            items.NOWPASSING = items.NOWPASSING.filter((item) =>
                this.searchFields(item)
            )
        }

        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = items.TRIAGEDONE.filter((item) =>
                this.searchFields(item)
            )
        }
    }


    filterBugsOnly = (items) => {
        if (items.FAIL) {
            items.FAIL = items.FAIL.filter((item) =>
                item.automatedTestIssueId || item.issueTicketId
            )
        }

        if (items.NEWFAIL) {
            items.NEWFAIL = items.NEWFAIL.filter((item) =>
                item.automatedTestIssueId || item.issueTicketId
            )
        }

        if (items.NOWPASSING) {
            items.NOWPASSING = items.NOWPASSING.filter((item) =>
                item.automatedTestIssueId || item.issueTicketId
            )
        }

        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = items.TRIAGEDONE.filter((item) =>
                item.automatedTestIssueId || item.issueTicketId
            )
        }
    }

    filterAutomatedTriaged = (items) => {
        if (items.FAIL) {
            items.FAIL = items.FAIL.filter((item) =>
                item.autoTriaged == false
            )
        }

        if (items.NEWFAIL) {
            items.NEWFAIL = items.NEWFAIL.filter((item) =>
                item.autoTriaged == false
            )
        }

        if (items.NOWPASSING) {
            items.NOWPASSING = items.NOWPASSING.filter((item) =>
                item.autoTriaged == false
            )
        }

        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = items.TRIAGEDONE.filter((item) =>
                item.autoTriaged == false
            )
        }
    }

    filterByTestInProgress = (items) => {
        if (items.FAIL) {
            items.FAIL = items.FAIL.filter((item) =>
                item.newInfo === true
            )
        }

        if (items.NEWFAIL) {
            items.NEWFAIL = items.NEWFAIL.filter((item) =>
                item.newInfo === true
            )
        }

        if (items.NOWPASSING) {
            items.NOWPASSING = items.NOWPASSING.filter((item) =>
                item.newInfo === true
            )
        }

        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = items.TRIAGEDONE.filter((item) =>
                item.newInfo === true
            )
        }
    }

    filterTestsAssignedToMe = (items) => {
        let {currentUser} = this.state;

        if (currentUser) {
            if (items.FAIL) {
                items.FAIL = items.FAIL.filter((item) =>
                    item.triager.id === currentUser.id
                )
            }

            if (items.NEWFAIL) {
                items.NEWFAIL = items.NEWFAIL.filter((item) =>
                    item.triager.id === currentUser.id
                )
            }

            if (items.NOWPASSING) {
                items.NOWPASSING = items.NOWPASSING.filter((item) =>
                    item.triager.id === currentUser.id
                )
            }

            if (items.TRIAGEDONE) {
                items.TRIAGEDONE = items.TRIAGEDONE.filter((item) =>
                    item.triager.id === currentUser.id
                )
            }
        }
    }

    sortTestName = (items) => {
        if (items.FAIL) {
            items.FAIL = _.sortBy(items.FAIL, (item) =>
                item.testExecution.displayName.toLowerCase()
            )
        }

        if (items.NEWFAIL) {
            items.NEWFAIL = _.sortBy(items.NEWFAIL, (item) =>
                item.testExecution.displayName.toLowerCase()
            )
        }

        if (items.NOWPASSING) {
            items.NOWPASSING = _.sortBy(items.NOWPASSING, (item) =>
                item.testExecution.displayName.toLowerCase()
            )
        }

        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = _.sortBy(items.TRIAGEDONE, (item) =>
                item.testExecution.displayName.toLowerCase()
            )
        }
    }


    sortRanking = (items) => {
        if (items.FAIL) {
            items.FAIL = items.FAIL.sort(function (item1, item2) {
                if (item1.rank > item2.rank) return -1;
                if (item1.rank < item2.rank) return 1;

                if (item1.testExecution.displayName.toLowerCase() > item2.testExecution.displayName.toLowerCase()) return 1;
                if (item1.testExecution.displayName.toLowerCase() < item2.testExecution.displayName.toLowerCase()) return -1;
            });
        }


        if (items.NEWFAIL) {
            items.NEWFAIL = items.NEWFAIL.sort(function (item1, item2) {
                if (item1.rank > item2.rank) return -1;
                if (item1.rank < item2.rank) return 1;

                if (item1.testExecution.displayName.toLowerCase() > item2.testExecution.displayName.toLowerCase()) return 1;
                if (item1.testExecution.displayName.toLowerCase() < item2.testExecution.displayName.toLowerCase()) return -1;
            });
        }


        if (items.NOWPASSING) {
            items.NOWPASSING = items.NOWPASSING.sort(function (item1, item2) {
                if (item1.rank > item2.rank) return -1;
                if (item1.rank < item2.rank) return 1;

                if (item1.testExecution.displayName.toLowerCase() > item2.testExecution.displayName.toLowerCase()) return 1;
                if (item1.testExecution.displayName.toLowerCase() < item2.testExecution.displayName.toLowerCase()) return -1;
            });
        }


        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = items.TRIAGEDONE.sort(function (item1, item2) {
                if (item1.rank > item2.rank) return -1;
                if (item1.rank < item2.rank) return 1;

                if (item1.testExecution.displayName.toLowerCase() > item2.testExecution.displayName.toLowerCase()) return 1;
                if (item1.testExecution.displayName.toLowerCase() < item2.testExecution.displayName.toLowerCase()) return -1;
            });
        }

    }

    sortTestCategory = (items) => {
        if (items.FAIL) {
            items.FAIL = _.sortBy(items.FAIL, (item) =>
                item.testExecution.groupName.toLowerCase()
            )
        }

        if (items.NEWFAIL) {
            items.NEWFAIL = _.sortBy(items.NEWFAIL, (item) =>
                item.testExecution.groupName.toLowerCase()
            )
        }

        if (items.NOWPASSING) {
            items.NOWPASSING = _.sortBy(items.NOWPASSING, (item) =>
                item.testExecution.groupName.toLowerCase()
            )
        }

        if (items.TRIAGEDONE) {
            items.TRIAGEDONE = _.sortBy(items.TRIAGEDONE, (item) =>
                item.testExecution.groupName.toLowerCase()
            )
        }
    }

    filterList = (filter, state) => {
        this.setState({
            filters: state
        }, () => {
            if (this.state.filters && (this.state.filters.searchKanban.length !== 1)) {
                this.RenderKanban(emptyTestTriages, this.props.classes)
                localStorage.setItem('filterByAutomatedTriaged', this.state.filters.filterByAutomatedTriaged)
                localStorage.setItem('filterByBugsOnly', this.state.filters.filterByBugsOnly)
                localStorage.setItem('filterByTestAssignedToMe', this.state.filters.filterByTestAssignedToMe)
                localStorage.setItem('filterByTestInProgress', this.state.filters.filterByTestInProgress)
                //  localStorage.setItem('searchKanban', this.state.filters.searchKanban)
                localStorage.setItem('sortByTestName', this.state.filters.sortByTestName)
                localStorage.setItem('sortByTestRank', this.state.filters.sortByTestRank)
                localStorage.setItem('sortByTestCategory', this.state.filters.sortByTestCategory)
                this.loadLocalStorageData()

                const items = this.fetchedExecutor.testTriages

                this.state.filters.searchKanban != "" && this.searchKanban(items)

                if (this.state.filters.filterByBugsOnly) {
                    this.filterBugsOnly(items)
                }

                if (this.state.filters.filterByAutomatedTriaged) {
                    this.filterAutomatedTriaged(items)
                }

                if (this.state.filters.filterByTestAssignedToMe) {
                    this.filterTestsAssignedToMe(items)
                }

                if (this.state.filters.filterByTestInProgress) {
                    this.filterByTestInProgress(items)
                }

                if (this.state.filters.sortByTestName) {
                    this.sortTestName(items)
                }

                if (this.state.filters.sortByTestRank) {
                    this.sortRanking(items)
                }

                if (this.state.filters.sortByTestCategory) {
                    this.sortTestCategory(items)
                }

                this.RenderKanban(items, this.props.classes)
                localStorage.setItem('kanbanDataFiltered', JSON.stringify(this.fetchedExecutor))

            }
        })
    }

    trimText = (text, len) => (text.length > len) ? text.substring(0, len) + "..." : text

    allowDrop(ev) {
        ev.preventDefault();
        let column = document.getElementById("TRIAGEDONE")
        column.style.boxShadow = '0 0 3px 3px rgba(33, 150, 243, .6)'
    }

    onDragEnd(ev) {
        ev.preventDefault();
        let id = ev.currentTarget.id
        let element = document.getElementById(id)
        if (element) {
            element.classList.remove('hideDraggable');
            let dragElement = document.getElementById("dragElement")
            if (dragElement)
                dragElement.parentNode.removeChild(dragElement)
        }
        let column = document.getElementById("TRIAGEDONE")
        column.style.boxShadow = 'none'
    }

    dragColumn(ev) {
        ev.stopPropagation()
        let id = ev.currentTarget.id
        ev.dataTransfer.setData("columnId", id);
        this.handleDragImg(ev, id)
    }

    drag(category, ev) {
        ev.stopPropagation()
        let id = ev.currentTarget.id
        ev.dataTransfer.setData("testId", id);
        ev.dataTransfer.setData("testCategory", category);
        this.handleDragImg(ev, id)
    }

    handleDragImg(ev, id) {
        let element = document.getElementById(id)
        if (!element)
            element = document.getElementById(ev.target.parentElement.id)
        element.classList.add('hideDraggable');
    }

    drop(ev) {
        ev.preventDefault();
        let currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
        let columnId = ev.dataTransfer.getData("columnId")
        if (columnId) {
            this.triageTests(columnId, currentUser.id)
        } else {
            this.triageTest(ev.dataTransfer.getData("testCategory"), ev.dataTransfer.getData("testId"), currentUser.id)
        }
    }

    triageTests(columnId, userId) {
        let tests = JSON.parse(localStorage.getItem("kanbanData")).testTriages[columnId]
        tests = tests.map(test => {
            return {
                testTriageDTO: test,
                issueTicketDTO: null,
                automatedTestIssueDTO: null
            }
        })
        axios({
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            data: JSON.stringify(tests),
            url: Api.getBaseUrl() + Api.ENDPOINTS.TriageTestAll,
        }).then(() => this.fetchTests())
    }

    triageTest(category, testId, userId) {
        let tests = JSON.parse(localStorage.getItem("kanbanData")).testTriages[category]
        let testTriageDTO = _.find(JSON.parse(localStorage.getItem("kanbanData")).testTriages[category], test => test.id == testId)

        let updateTriage = {
            testTriageDTO: testTriageDTO,
            issueTicketDTO: null,
            automatedTestIssueDTO: null,
        }
        // fix for update automation issue in drag and drop
        if (testTriageDTO.automatedTestIssueId) {
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAutomationIssue + "/" + testTriageDTO.automatedTestIssueId)
                .then(res => {
                    let {data} = res

                    let automationIssue = {
                        id: testTriageDTO.automatedTestIssueId,
                        testCaseId: testTriageDTO.testCaseId,
                        issueType: data.issueType,
                        userFixPriority: data.userFixPriority,
                    }

                    updateTriage.automatedTestIssueDTO = automationIssue

                    axios({
                        method: 'POST',
                        headers: {'Content-Type': 'application/json',},
                        data: JSON.stringify(updateTriage),
                        url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateTestTriage + `?triage=true`
                    }).then(() => this.fetchTests())
                })
        } else {
            axios({
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                data: JSON.stringify(updateTriage),
                url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateTestTriage + `?triage=true`
            }).then(() => this.fetchTests())
        }


    }


    RenderKanban = (testTriages, classes) => {
        let renderTests = []
        let totalTriages = this.state.totalTriages
        let testTags = {
            NEWFAIL: {
                data: [],
                length: 0,
                name: "New Fail",
                color: Red[500],
                helpMessage: 'Test has been always passing, now it\'s failing.'
            },
            FAIL: {
                data: [],
                length: 0,
                name: "Fail",
                color: Red["A700"],
                helpMessage: 'Intermitent failures, prioritized list.'
            },
            NOWPASSING: {
                data: [],
                length: 0,
                name: "New Pass",
                color: Green[500],
                helpMessage: 'Test executed long time ago and it was cleaned up'
            },
            TRIAGEDONE: {
                data: [],
                length: 0,
                name: "Triage Done",
                color: Blue[500],
                helpMessage: 'Auto triaged and manually triaged test.'
            }
        }


        const TestListItem = (props) => {
            let {data, totalTriages} = props;
            let hasNewData = data.newInfo;
            return (
                <div id={props.data.id}
                     draggable={props.category !== "TRIAGEDONE" ? true : false}
                     onDragStart={this.drag.bind(this, props.category)}
                     onDragEnd={this.onDragEnd.bind(this)}

                >

                    <ListItem style={{padding: 0, paddingBottom: 10}}>
                        <Paper
                            className="kanbanColumnElementContainer"
                            data-testcase-triage-category={props.category}
                            data-testcase-triage-id={data.id}>
                            <Link style={{textDecoration: 'none', color: 'inherit'}}
                                  onClick={this.goTriage.bind(this, data.id)}
                                  to={"/Test/" + data.id + "/Triage"}>
                                <div
                                    id={"test-" + props.data.id}
                                    style={{display: "grid", gridTemplateColumns: "2px auto"}}>
                                    <div style={{backgroundColor: props.catcolor}}></div>
                                    <div>
                                        <List className="wordBreak" style={{width: "100%"}}>
                                            <ListItem className="kanbanColumnElementTitle">
                                                <div
                                                    style={data.triaged && data.autoTriaged ? {color: COLORS.grey} : {}}>
                                                    {data.testExecution.displayName}
                                                </div>
                                                {
                                                    data.testExecution.pin && (
                                                        <Tooltip
                                                            classes={{
                                                                tooltip: classes.tooltip,
                                                                popper: classes.popper,
                                                            }}
                                                            title={
                                                                <div>
                                                                    <div>
                                                                        <b>{data.testExecution.pinAuthor.displayName}</b>
                                                                    </div>
                                                                    <div>
                                                                        {new Date(data.testExecution.pinDate).toLocaleDateString("en-US", {
                                                                            weekday: 'long',
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            }>
                                                            <img
                                                                height={30}
                                                                width={30}
                                                                style={{
                                                                    transform: 'rotate(45deg)',
                                                                    marginTop: -10,
                                                                    marginRight: -5,
                                                                }}
                                                                src={PinIcon}/>
                                                        </Tooltip>
                                                    )
                                                }
                                            </ListItem>
                                            <ListItem className="kanbanColumnElementGroupName">
                                                {data.testExecution.groupName}
                                            </ListItem>
                                            {
                                                data.testExecution.parameters.length > 0 && (
                                                    <ListItem className="kanbanColumnElementParams">
                                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                                            <TuneIcon
                                                                style={{fontSize: 12, marginRight: 5, marginTop: 3.4}}/>
                                                            {data.testExecution.parameters.join(', ')}
                                                        </div>
                                                    </ListItem>
                                                )
                                            }
                                            <ListItem className="kanbanColumnElementAssignee">
                                                <div key={props.data.id}>
                                                    <PersonIcon style={{
                                                        fontSize: 18,
                                                        marginRight: 6,
                                                        marginLeft: -3,
                                                        verticalAlign: 'bottom',
                                                        color: "rgb(204, 204, 204, 0.56)"
                                                    }}/>
                                                    {data.triager.displayName}
                                                </div>
                                            </ListItem>
                                            <ListItem style={{padding: 0}}>
                                                <Grid container justify="space-between" alignItems="center">
                                                    <Grid item style={{
                                                        marginRight: 8,
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        {
                                                            data.triaged && data.autoTriaged && (
                                                                <Tooltip
                                                                    classes={{
                                                                        tooltip: classes.tooltip,
                                                                        popper: classes.popper,
                                                                    }}
                                                                    title={
                                                                        <div>
                                                                            <div><b>Auto Triaged</b></div>
                                                                            <div>
                                                                                {data.deducedReason}
                                                                            </div>
                                                                        </div>
                                                                    }>
                                                                    <SpellcheckIcon
                                                                        style={{color: '#ccc', marginLeft: 8}}/>
                                                                </Tooltip>
                                                            )
                                                        }

                                                        {
                                                            this.renderCheckIcon(hasNewData, data.applicationFailType, data.testFailType, data.triaged)
                                                        }
                                                        {
                                                            data.flaky && (totalTriages>15) &&(
                                                                <Tooltip
                                                                    classes={{
                                                                        tooltip: this.props.classes.tooltip,
                                                                        popper: this.props.classes.popper,
                                                                    }}
                                                                    title="Flaky Test">
                                                                    <img height={20} width={20} src={FlakyTestIcon}
                                                                         style={{marginLeft: 8}}/>
                                                                </Tooltip>
                                                            )
                                                        }
                                                        {
                                                            data.flaky && (totalTriages<15) &&(
                                                                <div style={{ width: 80, marginLeft: 15}}>
                                                                    <StatusBar triageId={data.id}/>
                                                                </div>
                                                            )
                                                        }
                                                    </Grid>
                                                    <Grid item style={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                        marginRight: 8
                                                    }}>
                                                        <div>{this.renderPriorityIcon(data)}</div>
                                                        <TagLabel
                                                            classes={classes}
                                                            style={{marginLeft: 8}}
                                                            color={getKanbanTagColor(hasNewData, data.pastState === "PASS",
                                                                hasNewData ?
                                                                    data.applicationFailType
                                                                    : data.pastApplicationFailType
                                                            )}
                                                            tooltip={
                                                                <div>
                                                                    <div><b>{
                                                                        hasNewData ?
                                                                            'In Progress Triage'
                                                                            : 'Previous Triage'
                                                                    }</b></div>
                                                                    <div>
                                                                        {'Product: '}
                                                                        {
                                                                            hasNewData ?
                                                                                getApplicationFailTagName(data.applicationFailType)
                                                                                : getApplicationFailTagName(data.pastApplicationFailType)
                                                                        }
                                                                    </div>
                                                                </div>
                                                            }
                                                        />
                                                        <TagLabel
                                                            classes={classes}
                                                            color={getKanbanTagColor(hasNewData, data.pastState === "PASS",
                                                                hasNewData ?
                                                                    data.testFailType
                                                                    : data.pastTestFailType
                                                            )}
                                                            tooltip={
                                                                <div>
                                                                    <div><b>{
                                                                        hasNewData ?
                                                                            'In Progress Triage'
                                                                            : 'Previous Triage'
                                                                    }</b></div>
                                                                    <div>
                                                                        {'Automated Test: '}
                                                                        {
                                                                            hasNewData ?
                                                                                getTestFailTagName(data.testFailType)
                                                                                : getTestFailTagName(data.pastTestFailType)
                                                                        }
                                                                    </div>
                                                                </div>
                                                            }
                                                        />
                                                        <Tooltip
                                                            classes={{
                                                                tooltip: classes.tooltip,
                                                                popper: classes.popper,
                                                            }}
                                                            title={
                                                                <div style={{maxWidth: 500}}>
                                                                    <div><b>Comment</b></div>
                                                                    {hasNewData ?
                                                                        data.note ?
                                                                            data.note.description
                                                                            : ''
                                                                        : data.pastNote ?
                                                                            data.pastNote.description
                                                                            : ''}
                                                                </div>
                                                            }>
                                                            <CommentIcon
                                                                color="action"
                                                                style={{
                                                                    color: (hasNewData && data.note && data.note.description ||
                                                                        !hasNewData && data.pastNote && data.pastNote.description) ? COLORS.grey : '#F5F5F5',
                                                                    pointerEvents: 'initial',
                                                                }}/>
                                                        </Tooltip>
                                                    </Grid>
                                                </Grid>
                                            </ListItem>
                                        </List>
                                    </div>
                                </div>
                            </Link>
                        </Paper>
                    </ListItem>
                </div>
            )
        }
        for (var cat in testTags) {
            if (testTriages.hasOwnProperty(cat)) {
                for (let i = 0; i < testTriages[cat].length; i++) {
                    testTags[cat].length += 1
                    testTags[cat].data.push(
                        <TestListItem key={i} category={cat} catcolor={testTags[cat].color} data={testTriages[cat][i]} totalTriages={totalTriages}/>
                    )
                }
            }
        }

        for (let k in testTags) {
            if (testTags.hasOwnProperty(k))
                renderTests.push(
                    <div key={k}
                         style={{
                             borderRadius: 5,
                             cursor: k === 'TRIAGEDONE' ? 'default' : 'move',
                             height: k === 'TRIAGEDONE' ? 'auto' : 'fit-content',
                         }}
                         draggable={k !== "TRIAGEDONE" ? true : false}
                         onDragStart={this.dragColumn.bind(this)}
                         onDragEnd={this.onDragEnd.bind(this)}
                         id={k}
                         onDrop={
                             k === 'TRIAGEDONE' ?
                                 this.drop.bind(this)
                                 : null
                         }
                         onDragLeave={
                             k === 'TRIAGEDONE' ?
                                 this.onDragEnd.bind(this)
                                 : null
                         }
                         onDragOver={
                             k === 'TRIAGEDONE' ?
                                 this.allowDrop.bind(this)
                                 : null
                         }>
                        <Paper
                            className="kanbanColumnHeader"
                            style={{backgroundColor: testTags[k].color}}
                            square={false}>
                            <h5 style={{color: "white"}}>{testTags[k].name.toUpperCase()}</h5>

                            <Avatar className="kanbanColumnHeaderAvatar"
                                    style={{color: testTags[k].color}}>
                                {"TRIAGEDONE" === k ? this.fetchedExecutor.totalTriageDone : this.fetchedExecutor.testTriages[k].length}
                            </Avatar>
                        </Paper>
                        <List>
                            {testTags[k].data}
                        </List>
                    </div>
                )
        }

        this.setState({
            testTriages: renderTests,
            isTestCaseLoaded: true
        }, () => {
            if (this.props.selectedTestCaseId) {
                var kanbanItem = document.getElementById("test-" + this.props.selectedTestCaseId)
                if (kanbanItem) {
                    kanbanItem.scrollIntoView()
                    kanbanItem.classList.add("kanbanItemSelected")
                }
            }
        })
    }

    renderDeadLine = (build, classes) => {
        let {daysToDeadline, deadlinePriority, deadline} = build;

        let Time = props => (
            <Tooltip
                classes={{
                    tooltip: classes.tooltip,
                    popper: classes.popper,
                }}
                title={new Date(deadline).toUTCString()}>
                <div
                    style={{
                        display: "inline-flex"
                    }}
                >
                    <AccessTimeIcon
                        style={{
                            backgroundColor: "white",
                            color: props.background,
                            borderRadius: 15,
                            marginRight: 10,
                        }}
                    /><Typography>{props.children}</Typography>
                </div>
            </Tooltip>
        )

        if (deadlinePriority === 5)
            return <Time background={getDeadlineIconColor(deadlinePriority)}>Triaged</Time>
        else {
            if (daysToDeadline < 0)
                return <Time background={getDeadlineIconColor(deadlinePriority)}>Overdue</Time>
            if (daysToDeadline === 0)
                return <Time background={getDeadlineIconColor(deadlinePriority)}>Today</Time>
            if (daysToDeadline === 1)
                return <Time background={getDeadlineIconColor(deadlinePriority)}>Tomorrow</Time>
            if (daysToDeadline > 1)
                return <Time background={getDeadlineIconColor(deadlinePriority)}>This week</Time>
            else
                return <Time
                    background={getDeadlineIconColor(deadlinePriority)}>{new Date(deadline).toDateString()}</Time>
        }
    }

    summaryDrawer = () => {
        let suiteHistory = JSON.parse(localStorage.getItem('suiteHistory'))
        return (
            <div className="kanbanSummaryDrawer">
                <div style={{width: '2.5rem'}}>
                    <div className="kanbanSummaryDrawerVerticalTitle"
                         onClick={() => this.setState({drawerOpened: false})}>
                        <span>SUMMARY</span>
                        <ExpandLessIcon style={{marginTop: '-1', marginLeft: 10}}/>
                    </div>
                </div>
                <List style={{width: '18.75em'}}>
                    <ListItem style={{paddingTop: 0, paddingBottom: 0}}>
                        <div style={{width: '100%'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <h6 style={{color: COLORS.grey}}>
                                    {'ASSIGNEE'}
                                </h6>
                                <a href={this.fetchedExecutor.externalBuildURL} target='_blank'>
                                    <Tooltip
                                        classes={{
                                            tooltip: this.props.classes.tooltip,
                                            popper: this.props.classes.popper,
                                        }}
                                        title={`CI Run: ${this.fetchedExecutor.buildNumber}`}>
                                        <LaunchIcon style={{color: COLORS.grey, fontSize: 18}}/>
                                    </Tooltip>
                                </a>
                            </div>
                            <UserPicker
                                onChange={this.openConfirmationDialog}
                                buildTriage={this.fetchedExecutor.buildTriageId}
                                selectedItem={this.fetchedExecutor.assignee}/>
                        </div>
                    </ListItem>
                    {this.fetchedExecutor.productVersion ?
                        <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                            <div>
                                <h6 style={{color: COLORS.grey}}>
                                    {'PRODUCT VERSION'}
                                </h6>
                                <span>
                                {this.fetchedExecutor.productVersion}
                            </span>
                            </div>
                        </ListItem> : ""
                    }
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'TOTAL TESTS'}
                            </h6>
                            <span>
                                {this.fetchedExecutor.totalTests}
                            </span>
                        </div>
                    </ListItem>
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'PASSING TESTS'}
                            </h6>
                            <span>
                                {this.fetchedExecutor.passCount} ({this.fetchedExecutor.totalTests == 0 ? 0 : parseFloat((this.fetchedExecutor.passCount * 100) / this.fetchedExecutor.totalTests).toFixed(2)}%)
                            </span>
                            <a style={{display: "flex"}}
                               onClick={this.renderDialogTestPassed.bind(this)} className={"textReportLink"}>
                                {'View Passing Tests'}
                            </a>
                        </div>
                    </ListItem>
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'TESTS SKIPPED'}
                            </h6>
                            <span>
                                {this.fetchedExecutor.skipCount}
                            </span>
                        </div>
                    </ListItem>
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'SPRINT DEADLINE'}
                            </h6>
                            {this.renderDeadLine(this.fetchedExecutor, this.props.classes)}
                        </div>
                    </ListItem>
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'STABILITY INDEX'}
                            </h6>
                            <span>
                                {this.fetchedExecutor.stabilityIndex}%
                            </span>
                        </div>
                    </ListItem>
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'EXECUTION DATE'}
                            </h6>
                            <span>
                                {new Date(this.fetchedExecutor.executiondate).toLocaleDateString("en-US", {
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: false,
                                })}
                            </span>
                        </div>
                    </ListItem>
                    <ListItem style={{paddingTop: 0, paddingBottom: 5}}>
                        <div>
                            <h6 style={{color: COLORS.grey}}>
                                {'REPORT DETAILS'}
                            </h6>
                            <a onClick={this.getReportDetails.bind(this, this.fetchedExecutor.buildTriageId)}
                               className={"textReportLink"}>
                                {'Open Text Report'}
                            </a>
                        </div>
                    </ListItem>
                    {
                        suiteHistory.length > 0 && (
                            <ListItem>
                                <div style={{position: 'relative', zIndex: 999, width: '100%'}}>
                                    <h6 style={{color: COLORS.grey}}>
                                        {'HISTORY'}
                                    </h6>
                                    <SuiteHistoryChart data={suiteHistory}/>
                                </div>
                            </ListItem>
                        )
                    }
                    <ListItem>
                        <Button
                            variant="outlined"
                            className="globalButton kanbanActionButton"
                            fullWidth
                            color="primary"
                            onClick={this.openActionDialog.bind(this, 'triageSuite')}>
                            <div className="kanbanActionButtonLabel">Triage Suite</div>
                            <FlipToFrontIcon className="kanbanActionButtonIcon" color="primary"/>
                        </Button>
                    </ListItem>
                    <ListItem>
                        <Button
                            variant="outlined"
                            className="globalButton"
                            fullWidth
                            onClick={this.openActionDialog.bind(this, 'pullSuite')}
                            color="primary">
                            <div className="kanbanActionButtonLabel">Pull</div>
                            <FlipToFrontIcon className="kanbanActionButtonIcon" color="primary"/>
                        </Button>
                    </ListItem>
                    <ListItem>
                        <Button
                            variant="outlined"
                            className="globalButton"
                            fullWidth
                            color="secondary"
                            onClick={this.openActionDialog.bind(this, 'invalidateSuite')}>
                            <div className="kanbanActionButtonLabel">Skip Run</div>
                            <FlipToFrontIcon className="kanbanActionButtonIcon" color="secondary"/>
                        </Button>
                    </ListItem>
                    <ListItem className="lastKanbanItem">
                        <Button
                            variant="outlined"
                            className="globalButton"
                            fullWidth
                            color={this.fetchedExecutor.enabled ? "secondary" : "primary"}
                            onClick={this.openActionDialog.bind(this, this.fetchedExecutor.enabled ? 'disableSuite' : 'enableSuite')}>
                            <div className="kanbanActionButtonLabel">
                                {
                                    this.fetchedExecutor.enabled ?
                                        'Disable Suite'
                                        : 'Enable Suite'
                                }
                            </div>
                            <FlipToFrontIcon className="kanbanActionButtonIcon"
                                             color={this.fetchedExecutor.enabled ? "secondary" : "primary"}/>
                        </Button>
                    </ListItem>
                </List>
            </div>
        )
    }

    openActions = event => {
        this.setState({
            actionsElement: event.currentTarget
        })
    }

    closeActions = event => {
        this.setState({
            actionsElement: null
        })
    }
    Actions = props => (
        <Drawer
            classes={{
                paper: `${this.props.classes.kanbanDrawerPaper} kanbanDrawerContainer`
            }}
            onClose={() => this.setState({drawerOpened: false})}
            open={this.state.drawerOpened}>
            <div style={{overflow: 'hidden'}} onBlur={() => this.setState({drawerOpened: false})}>
                <this.summaryDrawer/>
            </div>
        </Drawer>
    )

    render() {
        return (
            <>
                {(() => {
                    if (this.state.isTestCaseLoaded) {
                        return (
                            <>
                                <div className="kanbanSuiteNameAndSearchContainer">
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <h5 className="kanbanSuiteTestName">
                                            {`${this.state.selectedSuiteName}`}
                                            <Tooltip
                                                classes={{
                                                    tooltip: this.props.classes.tooltip,
                                                    popper: this.props.classes.popper,
                                                }}
                                                title={
                                                    <div>
                                                        <span>CI Run: {this.fetchedExecutor.buildNumber}</span><br/>
                                                        <span>Execution Date: {new Date(this.fetchedExecutor.executiondate).toLocaleDateString("en-US", {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            hour12: false,
                                                        })}</span>
                                                    </div>}>
                                                <div
                                                    className="tag BuildNumberTag">{`#${this.state.selectedSuiteBuildNumber}`}</div>
                                            </Tooltip>
                                        </h5>
                                        {
                                            !this.fetchedExecutor.enabled &&
                                            <small style={{color: COLORS.grey}}>(disabled)</small>
                                        }
                                    </div>
                                    <div>
                                        <this.Actions/>
                                        <div className="containerSelect"></div>
                                        <SearchUI
                                            filterSelected={this.filterList}
                                            isKanban={true}
                                            sort={true}
                                            placeHolder="What test or error are you looking for?"/>
                                    </div>
                                </div>
                                <div
                                    className="kanban"
                                    style={{
                                        display: "grid",
                                        width: "100%",
                                        gridTemplateColumns: "70px auto 30px"
                                    }}
                                >
                                    <Paper
                                        onClick={() => this.setState({drawerOpened: true})}
                                        className="kanbanSummaryPaper">
                                        <div className="kanbanSummaryPaperTitle">
                                            <span>SUMMARY</span>
                                            <ExpandMoreIcon style={{marginTop: '-1', marginLeft: 10}}/>
                                        </div>
                                    </Paper>


                                    <div className="kanbanContainer" style={{
                                        display: "grid",
                                        gridTemplateColumns: "26% 26% 26% auto",
                                        gridColumnGap: 20
                                    }}>


                                        <div style={{
                                            position: "absolute",
                                            justifyContent: 'center', marginTop: 40, minWidth: 500
                                        }}>
                                            {renderPopover(this.openRef, this.props.helpEnabled, testTags['NEWFAIL'].name, testTags['NEWFAIL'].helpMessage, null, true, null, null, 'bottom-start')}
                                        </div>
                                        <div style={{
                                            position: "absolute",
                                            justifyContent: 'center', paddingLeft: "25.5%", marginTop: 40, minWidth: 500
                                        }}>
                                            {renderPopover(this.openRef, this.props.helpEnabled, testTags['FAIL'].name, testTags['FAIL'].helpMessage, null, true, null, null, 'bottom-start')}
                                        </div>
                                        <div style={{
                                            position: "absolute",
                                            justifyContent: 'center', paddingLeft: "51.5%", marginTop: 40, minWidth: 500
                                        }}>
                                            {renderPopover(this.openRef, this.props.helpEnabled, testTags['NOWPASSING'].name, testTags['NOWPASSING'].helpMessage, null, true, null, null, 'bottom-start')}
                                        </div>
                                        <div style={{
                                            position: "absolute",
                                            justifyContent: 'center', paddingLeft: "77%", marginTop: 40, minWidth: 500
                                        }}>
                                            {renderPopover(this.openRef, this.props.helpEnabled, testTags['TRIAGEDONE'].name, testTags['TRIAGEDONE'].helpMessage, null, true, null, null, 'bottom-start')}
                                        </div>
                                        {this.state.testTriages}

                                        {this.fetchedExecutor.totalTests == 0 ?
                                            <div style={{
                                                position: "absolute",
                                                textAlign: 'left',
                                                left: 0,
                                                right: 0,
                                                top: 300,
                                                width: 750,
                                                margin: "auto",
                                                padding: "10px 30px",
                                                backgroundColor: "transparent"
                                            }}>
                                                <p className="errorKanban" style={{textAlign: 'center'}}>There are
                                                    not
                                                    any tests in this suite to triage.</p>
                                                <p className="errorKanban" style={{textAlign: 'center'}}>You can
                                                    perform
                                                    one of these actions:</p>
                                                <ol style={{marginTop: 0}}>
                                                    <li>
                                                        Check the &nbsp;
                                                        <div style={{display: "inline"}}>
                                                            <a style={{
                                                                color: "rgba(0, 0, 0, 0.54)",
                                                                cursor: "pointer"
                                                            }}
                                                               target="_blank"
                                                               href={this.fetchedExecutor.externalBuildURL}>
                                                                CI {this.fetchedExecutor.connectorName}<LaunchIcon
                                                                style={{verticalAlign: "bottom", fontSize: 18}}/>
                                                            </a> &nbsp;
                                                            to see if there is an error generating the test report.
                                                        </div>
                                                        <div>Then Pull data again from the <span
                                                            className="errorKanban">Kanban Summary {'>'} Pull</span>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <p>Go to <span
                                                            className="errorKanban">Kanban Summary {'>'} Skip Run</span> in
                                                            order to keep triaging the previous build.</p>
                                                    </li>
                                                    <li>
                                                        <p>If everything is correct, you can triage the suite: <span
                                                            className="errorKanban">Kanban Summary {'>'} Triage Suite</span>
                                                        </p>
                                                    </li>
                                                </ol>
                                            </div> : ''
                                        }
                                        {this.fetchedExecutor.toTriage == 0 && this.fetchedExecutor.totalTests != 0 ?
                                            <div style={{
                                                position: "absolute",
                                                textAlign: 'center',
                                                left: 0,
                                                right: 0,
                                                top: 300,
                                                width: 750,
                                                margin: "auto",
                                                padding: "10px 30px",
                                                backgroundColor: "transparent"
                                            }}>
                                                <p className="errorKanban">Congrats! All tests are triaged for this
                                                    Suite.</p>
                                                <p className="errorKanban">{`There are ${this.fetchedExecutor.passCount} Tests passing and ${this.fetchedExecutor.totalTriageDone} Tests triaged.`}</p>
                                                <p className="errorKanban"
                                                   style={{display: this.fetchedExecutor.triaged ? 'none' : 'block'}}>In
                                                    order to complete it, go to Kanban Summary {'>'} Triage
                                                    Suite.</p>
                                            </div> : ''
                                        }
                                        {this.state.searching &&
                                        <CircularProgress style={{position: "absolute", top: "50%", left: "50%"}}
                                                          color="primary"/>
                                        }
                                    </div>
                                </div>
                                {this.renderConfirmationDialog()}
                                {this.renderActionDialog()}
                                {this.renderSnackbar()}
                            </>
                        )
                    } else
                        return <CircularProgress style={{position: "absolute", top: "50%", left: "50%"}}
                                                 color="primary"/>
                })()}
            </>
        )

    }
}

export default withStyles(styles)(Kanban)
