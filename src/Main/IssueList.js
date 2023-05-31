import React, { Component } from "react"
import Api from "./Components/Api"
import axios from 'axios'

//UI Components
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableBody from "@material-ui/core/TableBody"
import TablePagination from "@material-ui/core/TablePagination"
import CircularProgress from "@material-ui/core/CircularProgress"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import HelpIcon from "@material-ui/icons/Help"

import Nav from "./Components/Nav"

var priorityMap = new Map();
priorityMap.set(1, "HIGH");
priorityMap.set(3, 'MEDIUM');
priorityMap.set(5, 'LOW');

class IssueList extends Component {
  constructor(props) {
      super(props)
      this.userboxData = {
          userfullname: "Default User",
          myAssignedTestsNumber: 4,
          myAssignedIssuesNumber: 4
      }
      this.state = {
          isListLoaded: false,
				  helpEnabled: false,
          issues: null,
          listRows: [],
          currentUser: null,
      }
		this.helpItems= [
                [
                {
                    title: 'DOCUMENTATION',
                    text: `Detailed documentation <a target="_blank" href=${"http://www.ttriage.com/thelp-productbugs.html"}>HERE</a>`
                },
                {
                    title: null,
                    text: null,
                    videoURL: 'https://youtu.be/BHvEROfmT30'
                }
            ]
        ];

  }

  componentDidMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetIssuesTicket )
        .then(res => {
            this.setState({
              issues: res.data.content,
              isListLoaded: true,
            })
            this.getList()
        })
    this.setState({
      currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
    })
  }

  getList = () => {
      let rows = [];
      if (this.state.isListLoaded) {
        this.state.issues.map(issue => {
          rows.push(
            <TableRow key={issue.id} className="jobsTableRow">
                <TableCell>{priorityMap.get(issue.priority)}</TableCell>
                <TableCell>{issue.component ? issue.component.concat(" : ", issue.summary) : <a target="_blank" href={issue.url}><Typography color="primary">{issue.url}</Typography></a>}</TableCell>
                <TableCell><Typography color="primary">{issue.assignee ? issue.assignee.realname : null}</Typography></TableCell>
                <TableCell>{issue.description}</TableCell>
            </TableRow>
          )
        })
      }
      this.setState({
          listRows: rows
      })
  }

	onHelpClick = filter => event => {
		let value = this.state[filter]
		this.setState({
			[filter]: !value
		})
	}

  render() {
    let { helpEnabled } = this.state;
    const LoadingRow = () => (
        <TableRow>
            <TableCell colSpan={5} align="center">
                <CircularProgress color="primary" />
            </TableCell>
        </TableRow>
    )

    return (
        <div className="homeRoot">
            <Nav
              helpEnabled={helpEnabled}
							helpItems={this.helpItems}
							screen={'issuesList'}
              title={'Issues list'}
              onHelpClick={this.onHelpClick.bind(this)}
            />
            <main style={{ marginTop: helpEnabled ? 235 :111 }}>
                <Paper style={{margin:"10px 30px"}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Priority</TableCell>
                                <TableCell>Summary</TableCell>
                                <TableCell>Assignee</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                              { this.state.listRows.length > 0 ? this.state.listRows : <LoadingRow/> }
                        </TableBody>
                    </Table>
                    <Grid container alignItems="center">

                        <Grid item xs={12}>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={128}
                                rowsPerPage={10}
                                page={1}
                                backIconButtonProps={{
                                    'aria-label': 'Previous Page',
                                }}
                                nextIconButtonProps={{
                                    'aria-label': 'Next Page',
                                }}
                                onChangePage={() => {}}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </main>
        </div>
    )
  }

}

export default IssueList;
