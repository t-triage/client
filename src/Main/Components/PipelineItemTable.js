import React, { Component } from "react";
import TableCell from "@mui/material/TableCell"
import TableRow from "@mui/material/TableRow"
import PipelineOptionListPopover from "../Components/PipelineOptionListPopover"
import Api from "./Api"
import axios from 'axios'
import DoneIcon from '@mui/icons-material/Done'
import Tooltip from "@mui/material/Tooltip"
import Grid from '@mui/material/Grid'
import { Link } from 'react-router-dom'
import UserPicker from "../Components/UserPicker";
import PipelineStatusBox from "../Components/PipelineStatusBox"
import { styles, COLORS, renderDeadLine, DEFAULT_PIPELINE_FILTERS } from '../Components/Globals'

class PipelineItemTable extends Component {



  render() {
    let { pipeline,classes} = this.props
    let build={
      daysToDeadline:pipeline.daysToDeadline, 
      deadlinePriority:pipeline.deadlinePriority,
       deadline:pipeline.deadline,totalTestsToTriage:pipeline.totalTestsToTriage,
        totalFails:pipeline.totalFails,
        enabled:pipeline.enabled,
        autoTriaged: pipeline.autoTriaged, 
        passCount: pipeline.passCount,
        manualTriaged:pipeline.manualTriaged,
        executedDate: pipeline.executedDate,
        toTriage:pipeline.toTriage,
        totalTriageDone:pipeline.totalTriageDone,
        totalTests:pipeline.totalTests,
        totalNewFails:pipeline.totalNewFails,
        totalNowPassing:pipeline.totalNowPassing,
        totalNotExecuted:pipeline.totalNotExecuted,
        barNewFails:pipeline.barNewFails, 
                    barFails:pipeline.barFails,
                    barNowPassing:pipeline.barNowPassing, 
                    barManualTriaged:pipeline.barManualTriaged,
                    barAutoTriaged:pipeline.barAutoTriaged,
                    barNotExecuted:pipeline.barNotExecuted
                  }
    return (
      <TableRow className="jobsTableRow" className="jobsTableRow" style={{ height: "10px", backgroundColor: "white" }} >
                          <TableCell className="SuiteList-NameCell" style={{ width: "30%" }}>
                            <Link style={{ textDecoration: 'none', color: 'inherit' }} onClick={this.props.selectPipeline.bind(this,pipeline.id)} to={`/PipelineList/${pipeline.id}/Kanban`}>
                              <div style={{ paddingTop: 15, paddingBottom: 15 }}>
                                <div>{pipeline.name}</div>
                                <div style={{
                                  color: "#BEBEBE"
                                }}><b>{pipeline.description}</b></div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="jobStatusTableCell" style={{ width: "35%" }}>
                            <Grid container alignItems='center'>
                              <Grid item xs={2} md={1}>
                                <Tooltip title={"Test Suite Triage Done"}
                                  classes={{
                                    tooltip: classes.tooltip,
                                    popper: classes.popper,
                                  }}>
                                  {pipeline.totalTestsToTriage === 0
                                                ? <DoneIcon style={{color: COLORS.pass}} />
                                                : <div className="tag BuildNumberTag">{pipeline.totalTestsToTriage}</div>
                                  }
                                </Tooltip>
                              </Grid>
                              <Grid xs={9} md={10} item style={{ paddingLeft: 10 }}>
                              <PipelineStatusBox build={build} />
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell className="padding0" align="center" style={{ width: "15%"}}>
                            {renderDeadLine(build, pipeline.deadlineTooltip, this.props.classes)}
                          </TableCell>
                          <TableCell  align="center" style={{ width: "30%"}}>
                            <Grid container>
                              <Grid item md={9}  style={{marginLeft:50}}>
                              <UserPicker id={'pipelineUser-'+pipeline.id}
                              onChange={this.onChange}
                              buildTriage={0}
                              selectedItem={pipeline ? pipeline.assignee : null}
                            />
                              </Grid>
       
                            </Grid>
                          </TableCell>
                          <TableCell   >
                          <Grid item md={3}>
                                <PipelineOptionListPopover pipelines={this.props.pipelines} 
                                updatedPipeline={this.props.updatedPipeline}
                                index={this.props.index}
                                  pipeline={pipeline}
                                  isEnable={pipeline.enabled === true}
                                />
                              </Grid>
                          </TableCell>
                         
                        </TableRow>
    )
  }
  onChange= user => {
    let {pipeline} = this.props;
    pipeline = {...pipeline, assignee: user};
    axios({
      method: "PUT",
      url: `${Api.getBaseUrl()}${Api.ENDPOINTS.UpdatePipeline}`,
      data: JSON.stringify(pipeline),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(
        this.props.updatedPipeline
    )
  }

}
export default PipelineItemTable;
