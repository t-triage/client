import React from 'react'
import SnackbarContent from "@mui/material/SnackbarContent"
import CloseIcon from "@mui/icons-material/Close"
import ErrorIcon from "@mui/icons-material/Error"
import IconButton from "@mui/material/IconButton"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestoreIcon from '@mui/icons-material/Restore';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import classNames from 'classnames'

import {
  amber as Orange,
  blue as Blue,
  red as Red,
  green as Green,
  yellow as Yellow,
} from '@mui/material/colors';

export const DEFAULT_MANUAL_TEST_FILTERS = {
  owner: null,
  testPlan: null,
  techniques: null,
  needsUpdate: null,
  requirement: null,
  name: null,
  suite: null,
  component1: null,
  component2: null,
  component3: null,
  functionality: null,
  priority: null,
  automationStatus: null,
  lastUpdater: null,
  externalId: null,
}
export const DEFAULT_AUTOMATED_TEST_FILTERS = {

  name: null,
  lastExecution: null,
  executorName: null,
  hideNoSuite: false,
  currentState: 'all',
  automatedAssignee: null,
  flakyTest: null,
  pipeline: null,
  component1: null,
  component2: null,
  component3: null,
  component4: null,
  component5: null,
  component6: null,

}
export const DEFAULT_PIPELINE_FILTERS = {

  name: null,
}

export const GITBOOK_URL = "https://t-triage.gitbook.io/";
export const BOARD_ACTIVITY_TYPE_ICONS = [
	{ id: 0, type: "BUILD_TRIAGE_GENERATED_FOR_EXECUTOR", icon: <RestoreIcon /> },
	{ id: 1, type: "BUILD_TRIAGED", icon: <TrendingUpIcon /> },
	{ id: 2, type: "AUTOMATION_TEST_CHANGED", icon: <InsertEmoticonIcon /> },
	{ id: 3, type: "TIME_NEW_DAY", icon: <ImportantDevicesIcon /> },
	{ id: 4, type: "DEFAULT", icon: <InfoOutlinedIcon /> }
]

export const TEST_PLAN_STATUS = [
  { id: 0, value: "PENDING", label: "Pending" },
  { id: 1, value: "COMPLETED", label: "Completed" },
  { id: 2, value: "DEPRECATED", label: "Deprecated" },
  { id: 3, value: "PAUSED", label: "Paused" },
  { id: 4, value: "BLOCKED", label: "Blocked" },
  { id: 5, value: "NO", label: "No" },
  { id: 6, value: "ALERT", label: "Alert" },
  { id: 7, value: "UNDEFINED", label: "Undefined" },
]

export const TEST_PLAN_STATUS_ALL = [
	{ id: -4, value: 'IN_PROGRESS', label: 'In Progress' },
  { id: -3, value: "PASS", label: "Pass" },
  { id: -2, value: "BLOCKED", label: "Blocked" },
  { id: -1, value: "FAIL", label: "Fail" },
].concat(TEST_PLAN_STATUS)

export const TECHNIQUE_LIST = [
  { id: 0, value: "HAPPY_PATH", label: "Happy Path" },
  { id: 1, value: "EXPLORATORY", label: "Exploratory" },
  { id: 2, value: "BLACK_BOX", label: "Black Box" },
  { id: 3, value: "GREY_BOX", label: "Grey Box" },
  { id: 4, value: "WHITE_BOX", label: "White Box" },
  { id: 5, value: "BOUNDARY", label: "Boundary" },
  { id: 6, value: "CRUD", label: "Crud" },
  { id: 7, value: "POSITIVE", label: "Positive" },
  { id: 8, value: "NEGATIVE", label: "Negative" },
  { id: 9, value: "EXCEPTION", label: "Exception" },
  { id: 10, value: "SYNTAX", label: "Syntax" },
  { id: 11, value: "BUSINESS_RISK", label: "Business Risk" },
  { id: 12, value: "PERFORMANCE", label: "Performance" },
  { id: 13, value: "SECURITY", label: "Security" },
  { id: 14, value: "DATABASE", label: "Database" },
	{ id: 16, value: "USABILITY", label: "Usability" }
]

export const SUITE_TYPE_LIST = [
  { id: -1, value: "SELECT", label: "Select ..." },
  { id: 0, value: "BVT", label: "BVT" },
  { id: 1, value: "SMOKE", label: "Smoke" },
  { id: 2, value: "REGRESSION", label: "Regression" },
  { id: 3, value: "INTEGRATION", label: "Integration" },
  { id: 4, value: "SANITY", label: "Sanity" },
	{ id: 6, value: "FEATURE", label: "Feature" },
	{ id: 7, value: "RELEASE", label: "Release" },
]

export const AUTOMATION_LIST = [
  { id: -1, value: "SELECT", label: "Select ..." },
  { id: 0, value: "PENDING_LOW", label: "Pending Low" },
  { id: 1, value: "PENDING_MEDIUM", label: "Pending Medium" },
  { id: 2, value: "PENDING_HIGH", label: "Pending High" },
  { id: 3, value: "PENDING_MUST", label: "Pending Must" },
  { id: 5, value: "NO", label: "No" },
  { id: 6, value: "DONE", label: "Done" },
  { id: 8, value: "UNDEFINED", label: "Undefined" },
]

export const MANUAL_PRIORITY_LIST = [
  { id: -1, value: 'SELECT', label: 'Select ...' },
  { id: 0, value: 'AUTOMATIC', label: 'Automatic' },
  { id: 1, value: 'HIGH', label: 'High' },
  { id: 2, value: 'MEDIUM', label: 'Medium' },
  { id: 3, value: 'LOW', label: 'Low' },
  { id: 4, value: 'UNDEFINED', label: 'Undefined' },
]

export const TEST_RUN_STATUS = [
  { id: 0, value: 'PENDING', label: 'Pending' },
  { id: 2, value: 'NO', label: 'No' },
]

export const MANUAL_LAST_EXECUTION_LIST = [
  { id: -1, value: 'SELECT', label: 'Select ...' },
  { id: 0, value: 'yesterday', label: 'Yesteday' },
  { id: 1, value: 'last-3-days', label: 'Last 3 days' },
  { id: 2, value: 'last-week', label: 'Last week' },
  { id: 3, value: 'last-2-weeks', label: 'Last 2 weeks' },
  { id: 4, value: 'last-month', label: 'Last month' },
]

export const AUTOMATED_SUITE_STATUS_LIST = [
  { id: -1, value: 'all', label: 'All' },
  { id: 0, value: 'fail', label: 'Fail' },
  { id: 1, value: 'pass', label: 'Pass' },
  { id: 2, value: 'skipped', label: 'Skipped' },
]
export const AUTOMATED_SUITE_FLAKY_STATUS_LIST = [
  { id: -1, value: 'all', label: 'All' },
  { id: 0, value: 'flaky', label: 'Flaky' },
  { id: 1, value: 'solid', label: 'Solid' },
]

export const AUTOMATED_SUITE_HIDE_LIST = [
  { id: -1, value: false, label: 'All' },
  { id: 0, value: true, label: 'Active' },
]

export const NEEDS_UPDATE_LIST = [
  { id: -1, value: 'SELECT', label: 'Select ...' },
  { id: 0, value: true, label: 'Yes' },
  { id: 1, value: false, label: 'No' },
]

export const MANUAL_LIFECYCLE_LIST = [
  { id: -1, value: 'SELECT', label: 'Select ...' },
  { id: 0, value: 'VALID', label: 'Valid' },
  { id: 1, value: 'DISABLE', label: 'Disable' },
  { id: 2, value: 'NEEDS_IMPROVEMENT', label: 'Needs improvement' },
]

var Globals = {}
Globals.TriageStage = {
    SUITELIST: 0,
    KANBAN: 1,
    TRIAGE: 2
}

Globals.PipeStage = {
  PIPELINELIST: 0,
  PIPELINEKANBAN: 1,
  TRIAGE: 2
}
const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
};

export const snackbarStyle = theme => ({
  success: {
    backgroundColor: Green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
});

export const MySnackbarContent = (props) => {
  const { classes, className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          <div dangerouslySetInnerHTML={{__html: message}} />
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
          size="large">
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

export const priorities = [
  {id: 0, value: 'P0'},
  {id: 1, value: 'P1'},
  {id: 2, value: 'P2'},
  {id: 3, value: 'P3'},
  {id: 4, value: 'P4'},
]

export const styles = theme => ({
  tooltip: {
      backgroundColor: 'white',
      color: COLORS.greyDark,
      border: '1px solid #dadde9',
      fontSize: '.75rem',
      padding: '10',
      maxWidth: '100%',
      boxShadow: 'inset 0 0 3px #ccc',
      margin: 0,
  },
  popper: {
      opacity: '1',
      zIndex: 9999,
  },
  root: {
    flexGrow: 0,
    height: 32,
  },
  menuItemRoot: {
    padding: 10,
    fontSize: 14,
  },
  container: {
    flexGrow: 0,
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    width: '200px',
    marginLeft: '-5px',
    zIndex: 9999,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  inputRoot: {
    maxHeight: '32px',
    width: '100%',
  },
  inputRootComponents: {
    width: '100%',
  },
  kanbanDrawerPaper: {
    marginTop: 156
  },
  inputInput: {
    flexGrow: 0,
  },
  divider: {
    height: theme.spacing(2),
  },
  avatar: {
    marginRight: 10,
    width: 25,
    height: 25,
  },
  manualExpandSummary: {
    margin: "0 !important",
    cursor: 'default',
  },
  manualFiltersExpandSummary: {
    margin: "0 !important",
    cursor: 'default',
    display: 'flex',
    justifyContent: 'space-between',
  },
  manualExpandRoot: {
    boxShadow: "none !important",
  },
  noShadow: {
    boxShadow: "none !important"
  },
  expPanelSummary: {
    margin: '0 !important',
  },
  triageButtonDisabled: {
    borderColor: `${COLORS.grey} !important`,
  },
  productBugLabel: {
    width: '100%'
  },
  button: {
    margin: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  chip: {
    marginRight: 5,
  },
  selectIcon: {
    color: COLORS.primary,
  },
  select: {
    padding: '11px 10px 10px 14px',
  },
})

export const getDeadlineIconColor = (deadlinePriority) => {
  switch (deadlinePriority) {
    case 1:
      return Red["500"]
    case 2:
      return Orange["700"]
    case 3:
      return Yellow["700"]
    case 4:
      return Blue["A700"]
    case 5:
      return Green["500"]
    default:
      return Yellow["700"]
  }
}

const getTooltipContent = (deadline, deadlineTooltip) => {
    return (
      <>
        <div>{new Date(deadline).toUTCString()}</div>
        <div>{deadlineTooltip}</div>
      </>
    )
}

export const renderDeadLine = (build, deadlineTooltip, classes) => {
    let {daysToDeadline, deadlinePriority, deadline} = build;

    let Time = props => (
        <Tooltip
          classes={{
            tooltip: classes.tooltip,
            popper: classes.popper,
          }}
          title={getTooltipContent(deadline, deadlineTooltip)}
        >
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
                        margin: "0 10px"
                    }}
                /><Typography >{props.children}</Typography>
            </div>
        </Tooltip>
    )

    if (deadlinePriority === 5)
        return <Time background={getDeadlineIconColor(deadlinePriority)}>Triaged</Time>
    else {
      if ( daysToDeadline < 0 )
          return <Time background={getDeadlineIconColor(deadlinePriority)}>Overdue</Time>
      if ( daysToDeadline === 0 )
          return <Time background={getDeadlineIconColor(deadlinePriority)}>Today</Time>
      if ( daysToDeadline === 1 )
          return <Time background={getDeadlineIconColor(deadlinePriority)}>Tomorrow</Time>
      if ( daysToDeadline > 1 )
          return <Time background={getDeadlineIconColor(deadlinePriority)}>This week</Time>
      else
          return <Time background={getDeadlineIconColor(deadlinePriority)}>{new Date(deadline).toDateString()}</Time>
    }
}

export const logout = () => {
    localStorage.removeItem("auth")
    sessionStorage.removeItem("currentUser")
    localStorage.removeItem("kanbanData")
    sessionStorage.removeItem("buildInfo")
    window.location.replace("/")
}

export const validURL = (str) => {
  let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

export const COLORS = {
  primary: '#2196f3',
  green: '#00C875',
  green1: '#4DAB56',
  greenStrong: '#00C820',
  greenLight: '#3CC88E',
  greenLight1: '#64C89F',
  blue: '#4285F4',
  blueLight: '#6299F4',
  red: '#E2445C',
  redStrong: '#E20022',
  redLight: '#E27182',
  redAlert: '#D40000',
  yellow: '#F4B400',
  yellowLight: '#F4C849',
  purple: '#7237CC',
  purple1: '#A374EB',
  orange: '#CC7D29',
  orange1: '#DB9E5D',
  grey: '#999',
  greyDark: '#555753',
  newFail: '#F44336',
  redError: '#F44336',
  fail: '#D50000',
  newPass: '#4CAF50',
  triageDone: '#106BA3',
  manualTriaged: '#106BA3',
  autoTriaged: 'white',
  failManualTest: '#F44336',
  blocked: '#F4B400',
  no: '#999',
  inProgress: '#2196f3',
  pass: '#00C110',
  pending: 'white'
}

export const getDayInYear = (now) => {
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day
}

export const checkDateBeforeToday = (date) => {
  let today = getDayInYear(new Date)
  return getDayInYear(date) < today
}

export default Globals
