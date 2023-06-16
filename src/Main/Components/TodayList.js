import React, { Component } from "react"
import { Link } from 'react-router-dom'

import StatusBox from "./StatusBox"
import PriorityPicker from "./PriorityPicker"

import PriorityIcon from "@mui/icons-material/TrendingUp"
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"

// UI Components
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import { renderPopover } from './TriageUtils'
import withStyles from '@mui/styles/withStyles';
import { styles, renderDeadLine } from './Globals'


class TodayList extends Component {

	constructor(props) {
	  super(props)

		this.deadlineRef = React.createRef();
	    this.statusRef = React.createRef();
	}

    componentDidMount() {
    }

    selectSuite = (ev, value) => {
        this.props.selectSuite(ev)
    }

    getMyList = () => {
        let {todayList, pendingAutomIssues, classes} = this.props;
        let rows = []
        if (todayList.length > 0) {
            todayList && todayList.map( (suite, index) => {
                rows.push(
                    <TableRow key={index} className="jobsTableRow" data-jobid={suite.executorId} data-jobcontainerid={suite.containerId}>
                        <TableCell className="SuiteList-NameCell" style={{width: "40%"}} onClick={this.selectSuite}>
                            <Link style={{textDecoration: 'none', color: 'inherit'}} onClick={this.selectSuite} to={`/SuiteList/${suite.executorId}/Kanban`}>
                                <div style={{paddingTop: 15, paddingBottom: 15}}>
                                    {suite.executorName[0]==='~' || suite.executorName[0]==='-'  ? <div style={{ opacity: .3}}> {suite.executorName.slice(1)}</div>:<div>{suite.executorName}</div>}
                                    <div style={{
                                        color: "#BEBEBE"
                                    }}><b>#{suite.buildNumber}</b> {suite.containerName}</div>
                                </div>
                            </Link>
                        </TableCell>

                        <TableCell ref={index === 0 ? this.statusRef : null} className="jobStatusTableCell" align="left">
                            <Grid container alignItems='center'>
                                <Grid item xs={2} >
                                    <Tooltip
                                        title="To Triage"
                                        classes={{
                                          tooltip: classes.tooltip,
                                          popper: classes.popper,
                                        }}>
                                        <div className="tag BuildNumberTag">
                                            {suite.totalTestsToTriage}
                                        </div>
                                    </Tooltip>
                                </Grid>
                                <Grid  xs={9} md={10} item style={{ paddingLeft: 20 }}>
                                    <StatusBox build={suite} />
                                </Grid>
                            </Grid>
                            {index === 0 && renderPopover(this.statusRef, this.props.helpEnabled, "STATUS", "Sumarizes Kanban status.", null, true, null, null, 'bottom-end')}
                        </TableCell>
                        <TableCell ref={index === 0 ? this.deadlineRef : null} className="padding0" align="left" style={{width: "10%"}}>
                            {renderDeadLine(suite, suite.deadlineTooltip, this.props.classes)}
													{index === 0 && renderPopover(this.deadlineRef, this.props.helpEnabled, "SPRINT DEADLINE", "In the Admin Panel > Container you can specify how frequent your tests should be analyzed.", null, true, null, null, 'bottom-start')}

                        </TableCell>
                        <TableCell align="center">
                            <PriorityPicker
                                onClick={this.props.setPriority}
                                buildTriageId={suite.buildTriageId}
                                selectedPriority={suite.shortPriority} />
                        </TableCell>
                    </TableRow>
                )
            })
        } else {
          rows.push(
            <TableRow key="noTodaySuites" className="jobsTableRow" style={{height: "40px", backgroundColor: "transparent", cursor: "default"}} >
                <TableCell align="center" colSpan="5">
                    <h2 className="noRowsSuites" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {"YOU HAVE NO PENDING SUITES TO TRIAGE FOR TODAY! WELL DONE"}
                            <InsertEmoticonIcon style={{ color: 'rgba(0, 0, 0, 0.54)', marginLeft: 5 }} />
                        </span>
                        <span>{"FOR OTHER SUITES TO TRIAGE PLEASE CHECK THE BACKLOG BELOW."}</span>
                        {
                          pendingAutomIssues > 0 && (
                            <Link style={{textDecoration: 'none', color: 'inherit', fontWeight: 'bold', marginTop: 20}} to={`/AutomationIssues`}>
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {`IMPROVE COVERAGE BY FIXING YOUR OPEN AUTOMATED ISSUES: ${pendingAutomIssues}`}
                                </span>
                            </Link>
                          )
                        }
                    </h2>
                </TableCell>
            </TableRow>
          )
        }
        return rows
    }

    render() {
        const { classes, searchingTodayList } = this.props
        const JobsList = (props) => (
            <Paper style={{margin:"10px 30px", backgroundColor: "transparent"}} classes={{root: classes.noShadow}}>
                <h5 style={{padding: "10px 0 0 8px"}}>{'My Today\'s List'}</h5>
                <Table style={{borderCollapse: "separate", borderSpacing: "0 10px"}}>
                    <TableHead>
                        <TableRow>
                            <TableCell className="headerTable">Suite Name</TableCell>
                            <TableCell className="headerTable">To Triage|Status</TableCell>
                            <TableCell className="headerTable padding0" align="center" id={'triageDeadlineColumn'}>Sprint Deadline</TableCell>
                            <TableCell className="headerTable" align="center">Priority</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                          this.props.todayList ?
                            this.getMyList()
                          : !searchingTodayList ? null : <TableRow>
                              <TableCell align="center" colSpan="5">
                                <div className="circularProgressContainer" style={{ margin:"30px" }}>
                                    <CircularProgress color="primary" />
                                </div>
                              </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </Paper>
        )

        return(
            <Grid container className="jobsListBox"  alignItems="flex-end">
                <Grid item xs={12}>
                    <JobsList />
                </Grid>
            </Grid>
        )
    }
}

export default withStyles(styles)(TodayList)
