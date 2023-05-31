import React, { Component } from 'react';
import Tooltip from '@material-ui/core/Tooltip'
import FiberManualRecordRoundedIcon from '@material-ui/icons/FiberManualRecordRounded'
import FlakyTestIcon from "../../images/FlakyTestIcon.svg"
import {
  getStatusTagColor,
  getStatusTagName,

} from '../Components/TriageUtils'
export class SnackBarAutomatedTestInfo extends Component {


  render() {
    let { testTriageList, classes } = this.props;

    if (testTriageList[0] === undefined) {
        return (<div>No suites found</div>)
    } else {
      let rows = [];
      let lastExecution = null
      let showFlaskyTest = false
      let flaskyTestCounter = 0
      let isSameAssignee = true
      let isSkipped = false
      let isFailState = false
      let isPassState = false
      let sameAssignee = testTriageList[0].triager
      testTriageList.map((suite, index) => {
        
          lastExecution = suite.executionDate > lastExecution ? suite.executionDate : lastExecution
          isSameAssignee = suite.triager.id !== sameAssignee.id ? false : true
          showFlaskyTest = suite.flaky ? true : showFlaskyTest
          flaskyTestCounter += suite.flaky ? 1 : 0
          isFailState = suite.currentState === 'FAIL' || suite.currentState === 'NEWFAIL' || suite.currentState === 'PERMANENT' && true
           isPassState = suite.currentState === 'PASS' || suite.currentState === 'NEWPASS' && true
           isSkipped = suite.currentState === 'SKIP' && true
        
      })

      {
        isSameAssignee && rows.push(
          <Tooltip key={'automatedTestInfoAssignee'}
            classes={{
              tooltip: this.props.classes.tooltip,
              popper: this.props.classes.popper,
            }}
            title="Same Assignee">
            <span style={{ fontWeight: 'bold' }}>{sameAssignee.displayName}</span>
          </Tooltip>
        )
      }
     {
      showFlaskyTest && rows.push(
          <Tooltip key={'automatedTestInfoFlaky'}
            classes={{
              tooltip: this.props.classes.tooltip,
              popper: this.props.classes.popper,
            }}
            title={flaskyTestCounter + " Flaky Tests"}>
            <img height={20} width={20} src={FlakyTestIcon} style={{ marginLeft: 8 }} />
          </Tooltip>
        )
      }
  
        {
          isFailState && rows.push(
          <Tooltip key={'automatedTestInfoSuiteFail'}
            classes={{
              tooltip: this.props.classes.tooltip,
              popper: this.props.classes.popper,
            }}
            title="A suite has failed">
            <FiberManualRecordRoundedIcon fontSize="small" color="secondary" />
          </Tooltip>
        )
      }
        {
          (isPassState && !isFailState) && rows.push(
          <Tooltip key={'automatedTestInfoSuitePass'}
            classes={{
              tooltip: this.props.classes.tooltip,
              popper: this.props.classes.popper,
            }}
            title="All tests passed!">
            <FiberManualRecordRoundedIcon fontSize="small"  style={{ color: 'green' }}/>
          </Tooltip>
        )
      }
     {
       isSkipped && rows.push(
          <Tooltip key={'automatedTestInfoSuitePass'}
            classes={{
              tooltip: this.props.classes.tooltip,
              popper: this.props.classes.popper,
            }}
            title="A test skipped">
            <FiberManualRecordRoundedIcon fontSize="small"  style={{ color: 'grey' }}/>
          </Tooltip>
        )
      }
     
      return (
        <div style={{ flex: "1", display: "flex", justifyContent: "space-between" }}>

          <span
            id="suiteExecution"
            placeholder="Execution"
            style={{ fontSize: ".875rem" }}
          >Last Execution: {lastExecution !== null && new Date(lastExecution).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
          </span>
          <div style={{ flex: "1", display: "flex", justifyContent: "flex-end" }}>
            {rows}
          </div>

        </div>

      );
    }      
  
  }


}
