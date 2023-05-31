import React, { Component } from 'react'
import { Link } from 'react-router-dom'

//UI Components
import UserPicker from "./UserPicker"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Tooltip from '@material-ui/core/Tooltip'
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"

// Icons
import TuneIcon from "@material-ui/icons/Tune"
import Pin from "../../images/pin.svg"
import PinDisabled from "../../images/pin-disabled.svg"

import {
  BarChart,
  Bar,
  Cell,
  Tooltip as TooltipRechart,
} from 'recharts'

import { withStyles } from '@material-ui/core/styles'
import { styles, COLORS } from './Globals'
import {renderPopover} from './TriageUtils';

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

class AutomationTestItem extends Component {
  state = {
    issue: null,
    comment: '',
    commentUpdated: false,
  }

	openRef = React.createRef();
  passingRef = React.createRef();


  componentDidMount() {
    this.setState({
      issue: this.props.issue,
    })
  }

  changeNote = ev => {
    let description = ev.target.value;
    let {comment} = this.state;
    comment = {...comment, description};
    this.setState({
      comment,
      commentUpdated: true
    })
  }

  updateComment() {
    if (this.state.commentUpdated) {
      let {issue, comment} = this.state
      issue.note = comment
      this.props.updateComment(issue)
      this.setState({
        commentUpdated: false,
      })
    }
  }

  openErrorDetailsDialog(error) {
    this.props.openErrorDetailsDialog(error)
  }

  openStackTraceDialog(stacktrace, packages) {
    this.props.openStackTraceDialog(stacktrace, packages)
  }

  render() {
    let { classes, index, helpEnabled, openCount, passingCount } = this.props
    let { issue, comment } = this.state
    let {testExecution, productPackages} = issue !== null && issue.testTriage
    let date = issue && new Date(issue.testTriage.executionDate).toUTCString()
    let successTrendAllFails = true
    let successTrend = issue && issue.successTrend.map((value, index) => {
      if (value)
        successTrendAllFails = false
      return {name: index, value: value ? 2 : 1}
    })

    return issue && (
      <Grid item md={6} lg={4}>
        <Paper style={{padding: 15, borderRadius: 3}} >
          <div className="AutomationListTitle" style={{ marginTop: 0, alignItems: 'flex-start' }}>
            <div>
              <Link style={{textDecoration: 'none'}} to={"/Test/" + issue.lastTestTriage + "/Triage"}>
                <h4 className="title">{testExecution.displayName}</h4>
              </Link>
              <div className="text">{testExecution.groupName}</div>
              {
                testExecution.parameters.length > 0 && (
                  <div className="text" style={{ display: 'flex', alignItems: 'center' }}>
                      <TuneIcon style={{ fontSize: 12, marginRight: 5, marginTop: 3.4 }} />
                      {testExecution.parameters.join(', ')}
                  </div>
                )
              }
            </div>
            <Tooltip
                classes={{
                  tooltip: classes.tooltip,
                  popper: classes.popper,
                }}
                title={
                  testExecution.pin && testExecution.pinAuthor && testExecution.pinDate > 0 ?
                    <div>
                        <div><b>{testExecution.pinAuthor ? testExecution.pinAuthor.displayName : ""}</b></div>
                        <div>
                            {new Date(testExecution.pinDate).toLocaleDateString("en-US", {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                        </div>
                    </div>
                  : 'Pin this test'
                }>
                  <img
                    className="iconStyle"
                    src={testExecution.pin ? Pin : PinDisabled}
                    alt="pin"
                    height={testExecution.pin ? 40 : 30}
                    width={testExecution.pin ? 40 : 30}
                    style={{ top: testExecution.pin ? -5 : -2 }}
                    onClick={() => this.props.pinTest(issue.testTriage.id)}
                  />
              </Tooltip>
          </div>

          <div className="AutomationListTitle">
            <Grid container>
                <Grid item xs={8} style={{ overflowWrap: 'break-word' }}>
                    <h6 className="subTitle">INVOLVED SUITE</h6>
                    <h6 className="text suiteName">{issue.testTriage.executorName}</h6>
                </Grid>
                <Grid item xs={4}>
                    <h6 className="subTitle" style={{ textAlign: 'right' }}>ASSIGNEE</h6>
                    <UserPicker
                        issue={issue.id}
                        alignRight={true}
                        buildTriage={issue.buildTriageId}
                        selectedItem={issue.triager}
                        fontWeight={'bold'}/>
                </Grid>
            </Grid>
          </div>

          <div className="AutomationListTitle">
            <div>
              <h6 className="subTitle">
                FAILS SINCE
              </h6>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: -2 }}>
                <span className="failedSince text">{date.split(' ').slice(0, 3).join(' ')}</span>
                <span style={{marginLeft: 5}}>{ this.props.renderIcon(this.props.getPriorityString(issue.calculatedPriority)) } </span>
                <strong style={{verticalAlign: "top"}} className="text calculatedPriority">{this.props.getPriorityString(issue.calculatedPriority)}</strong>
              </div>
            </div>
            {
              !successTrendAllFails && (
                <BarChart width={150} height={40} data={successTrend}>
                   <TooltipRechart content={<CustomTooltip text={issue.trendExplanation} />} />
                   <Bar dataKey='value' fill='#8884d8'>
                     {
                       successTrend.map((entry, index) => {
                           const color = entry.value === 1 ? COLORS.fail : COLORS.newPass;
                           return <Cell key={index} fill={color} />;
                       })
                     }
                   </Bar>
                </BarChart>
              )
            }
            {
              successTrendAllFails && (
                <Tooltip
                    classes={{
                      tooltip: classes.tooltip,
                      popper: classes.popper,
                    }}
                    title={issue.trendExplanation}>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                      <strong className="text">Constant failures</strong>
                      <div style={{ backgroundColor: COLORS.red, width: 11, height: 15, marginLeft: 5 }} />
                    </div>
                </Tooltip>
              )
            }
          </div>

          <Grid container style={{ marginTop: 15 }}>
                <Grid item xs={6}>
                  <Tooltip
                      classes={{
                        tooltip: classes.tooltip,
                        popper: classes.popper,
                      }}
                      title={testExecution.errorDetails ? "Click to show more" : "No errors"}
                      placement="bottom-start">
                    <div>
                        <Button
                            className="errorDetailButton"
                            style={{opacity: testExecution.errorDetails ? 1 : 0.5, fontWeight: testExecution.errorDetails ? 'bold' : 'regular'}}
                            onClick={this.openErrorDetailsDialog.bind(this, testExecution.errorDetails)}
                            disabled={!testExecution.errorDetails}
                        >
                            ERROR DETAILS
                        </Button>
                    </div>
                  </Tooltip>
                </Grid>

                <Grid item xs={6}>
                    <Tooltip
                      classes={{
                        tooltip: classes.tooltip,
                        popper: classes.popper,
                      }}
                      title={testExecution.errorStackTrace ? "Click to show more" : "No errors"}
                      placement="bottom-start">
                      <div>
                          <Button
                              className="errorStyles"
                              style={{
                                  borderColor: testExecution.errorStackTrace ? "#ffaa1b" : "rgb(255, 213, 151)",
                                  color: testExecution.errorStackTrace ? "#ffaa1b" : "rgb(255, 213, 151)",
                                  fontWeight: testExecution.errorStackTrace ? 'bold' : 'regular'
                              }}
                              onClick={this.openStackTraceDialog.bind(this, testExecution.errorStackTrace, productPackages)}
                              disabled={!testExecution.errorStackTrace}
                          >
                              STACKTRACE
                          </Button>
                      </div>
                    </Tooltip>
                </Grid>
          </Grid>

          <div style={{ marginTop: 0 }}>
            <h6 className="subTitle">USER COMMENT</h6>
            <TextField
                style={{width: "100%", marginTop: 10}}
                multiline
                defaultValue={!!issue.note ? issue.note.description : !!issue.testTriage.note ? issue.testTriage.note.description : ""}
                placeholder="No comments yet"
                rowsMax={3}
                disabled={false}
                onChange={this.changeNote.bind(this)}
                inputProps={{
                  onBlur: this.props.showButtons.bind(this, issue.id),
                  onFocus: this.props.showButtons.bind(this, issue.id)
                }}
                spellCheck={false}
                InputProps={{
                  className: "textArea area"+issue.id
                }}
            />
          </div>

          <div className="AutomationListTitle">
            <div style={{ display: 'flex' }}>
                {issue.reopenTimes > 5 ? <strong className="tag">FLAKY TEST</strong> : ''}
                {issue.failTimes > 10 ? <strong style={{backgroundColor: "rgb(255, 170, 27)" }} className="tag">{issue.failTimes} FAILS</strong> : ''}
                <div>
                  <strong ref={issue.issueType === 'OPEN' ? this.openRef : (issue.issueType === 'PASSING' ? this.passingRef : null)} style={{ marginLeft: 0 }} className="tag BuildNumberTag">{issue.issueType}</strong>
									{issue.issueType === 'OPEN' && openCount === 1 && renderPopover(this.openRef, helpEnabled, null, "When passing, the test will auto transition to Passing", null, true, null, null, 'bottom-start')}
									{issue.issueType === 'PASSING' && passingCount === 1 && renderPopover(this.passingRef, helpEnabled, null, "Test's started passing, in 2 rounds it'll auto transition to Fix.", null, true, null, null, 'bottom-start')}
                </div>
            </div>
            <div>
              <Button
                  className={`button${issue.id} globalButton`}
                  color="secondary"
                  variant="contained"
                  style={{ visibility: "hidden", marginRight: 10 }}
                  onMouseDown={this.props.clearText.bind(this, "area"+issue.id, issue.note, issue.testTriage.note)}
                  id="cancel">
                  Cancel
              </Button>
              <Button
                  className={`button${issue.id} globalButton`}
                  color="primary"
                  variant="contained"
                  style={{ visibility: "hidden" }}
                  onMouseDown={this.updateComment.bind(this, issue, comment)}
                  id="save">
                  Save
              </Button>
            </div>
          </div>

        </Paper>
      </Grid>
    )
  }
}

export default withStyles(styles)(AutomationTestItem)
