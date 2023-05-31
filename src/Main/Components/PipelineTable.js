import React, { Component } from "react";
import { _ } from 'underscore'
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import { withStyles } from '@material-ui/core/styles'

import PipelineItemTable from '../Components/PipelineItemTable'
import { styles, COLORS, renderDeadLine, DEFAULT_PIPELINE_FILTERS, snackbarStyle, MySnackbarContent } from '../Components/Globals'

class PipelineTable extends Component {

  render() {
    let { pipelines, classes, fetchError, isLoading } = this.props
    return (
      <>
        {pipelines &&
        (<Table style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
          <TableHead  >
            <TableRow >
              <TableCell className="headerTable">Pipeline Name</TableCell>
              <TableCell className="headerTable">To Triage|Status</TableCell>
              <TableCell className="headerTable padding0" align="center">Sprint Deadline</TableCell>
              <TableCell className="headerTable" align="center">Assignee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{ overflow: 'scroll' }}>
            {!fetchError && pipelines.length > 0 && (
              pipelines.map((pipeline, index) => (
                <PipelineItemTable key={index} index={index}
                updatedPipeline={this.props.updatedPipeline}
                pipeline={pipeline} pipelines={pipelines}
                  selectPipeline={this.props.selectPipeline} classes={classes} />
              ))
            )}
          </TableBody>
        </Table>)
        }
        {(!isLoading && pipelines && pipelines.length === 0) && (
               <div style={{ position: "absolute", left: "calc(50% - 30px)" }} >
                 <h2 className="noRowsSuites">{"No Pipelines found"}</h2>
               </div>
             )}
      </>
    )
  }
}
export default withStyles(styles)(PipelineTable);
