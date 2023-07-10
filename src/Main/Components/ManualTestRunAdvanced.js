import React, { Component } from 'react'
import * as _  from 'underscore'

import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import Grid from "@mui/material/Grid"
import { TECHNIQUE_LIST, SUITE_TYPE_LIST } from './Globals'

export default class ManualTestRunAdvanced extends Component {
  state = {
    testRun: null,
    comment: '',
    status: '',
    showButtons: false,
  }

  componentDidMount() {
    let {execution} = this.props
    this.setState({
      testRun: execution.testCase,
      comment: execution.comment ? execution.comment : '',
    })
  }

  renderTags(tags, labels) {
    return tags.map((tag, index) => (
      <div key={`runComponent-${index}`} className="tag tag-grey chip-outlined" style={{ fontSize: '.875rem', marginBottom: 5, marginRight: 5 }}>
      {
        labels ?
          _.find(labels, {value: tag}).label
        : tag
      }
      </div>
    ))
  }

  renderComponents(testRun) {
    let components = []
    if (testRun.component1Id)
      components.push(testRun.component1Name)
    if (testRun.component2Id)
      components.push(testRun.component2Name)
    if (testRun.component3Id)
      components.push(testRun.component3Name)

    return this.renderTags(components)
  }

  onSave() {
    this.setState({ showButtons: false })
    this.props.onSave(this.props.execution, this.state.comment)
  }

  showButtons() {
    let {showButtons} = this.state
    if (!showButtons) {
      this.setState({
        showButtons: true,
      })
    }
  }

  render() {
    let {testRun, comment, status, showButtons} = this.state

    return testRun && (
      <div style={{ width: '80%' }}>

        <Grid container>
          <Grid item className="manualTestRunTagContainer">
            <div className="label">Suite Type</div>
            <div className="value">{_.find(SUITE_TYPE_LIST, {value: testRun.suite}).label}</div>
          </Grid>
          <Grid item className="manualTestRunTagContainer">
            <div className="label">Owner</div>
            <div className="value">{testRun.owner.displayName}</div>
          </Grid>
          {
            testRun.productName && (
              <Grid item className="manualTestRunTagContainer">
                <div className="label">Product</div>
                <div className="value">{testRun.productName}</div>
              </Grid>
            )
          }
          {
            testRun.functionalityEntity && (
                <Grid item className="manualTestRunTagContainer">
                  <div className="label">Functionality/Jira</div>
                  <div className="value">{testRun.functionalityEntity}</div>
                </Grid>
            )
          }
          {
            testRun.techniques.length > 0 && (
              <Grid item className="manualTestRunTagContainer">
                <div className="label">Techniques</div>
                {
                  this.renderTags(testRun.techniques, TECHNIQUE_LIST)
                }
              </Grid>
            )
          }
          {
            (testRun.component1Name || testRun.component2Name || testRun.component3Name) && (
              <Grid item xs={12} className="manualTestRunTagContainer">
                <div className="label">Components</div>
                <div className="value">{this.renderComponents(testRun)}</div>
              </Grid>
            )
          }
        </Grid>

        <TextField
            style={{marginTop: 20}}
            multiline
            fullWidth
            label="Comments"
            variant="outlined"
            InputLabelProps={{
                shrink: true,
            }}
            InputProps={{
              className: "textArea",
            }}
            inputProps={{
              onFocus: this.showButtons.bind(this),
            }}
            value={comment}
            placeholder="No comments yet"
            maxRows={5}
            onChange={(ev) => this.setState({ comment: ev.target.value })}
            spellCheck={false}
        />
        {
          showButtons && (
            <div style={{ marginTop: 20, marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                  className="globalButton"
                  onClick={() => this.setState({ showButtons: false })}
                  variant="contained"
                  color="secondary">
                  Cancel
              </Button>
              <Button
                  className="globalButton"
                  variant="contained"
                  onClick={this.onSave.bind(this)}
                  style={{ marginLeft: 8 }}
                  color="primary">
                  Save
              </Button>
            </div>
          )
        }
        <div className="manualTestRunListItem">
          <div className="manualTestStepListItemText" style={{ width: '99%', padding: '10px 0', fontWeight: 'bold' }}>Step</div>
          <div className="manualTestStepListItemText" style={{ width: '99%', padding: '10px 0', fontWeight: 'bold' }}>Expected Result</div>
          <div className="manualTestStepListItemText" style={{ width: '99%', padding: '10px 0', fontWeight: 'bold' }}>Data</div>
        </div>
        {
          _.sortBy(testRun.steps, 'stepOrder').map((step, index) => {
            return (
              <div key={`runStep-${index}`}
                   className="manualTestStepListItem manualTestRunListItem"
                   style={{ backgroundColor: step.id === testRun.mainStepId ? '#eee' : 'white' }}>
                <div className="manualTestStepListItemText" style={{ width: '99%', padding: '10px 0', }}>{step.step}</div>
                <div className="manualTestStepListItemText" style={{ width: '99%', padding: '10px 0', }}>{step.expectedResult}</div>
                <div className="manualTestStepListItemText" style={{ width: '99%', padding: '10px 0', }}>{step.data}</div>
              </div>
            )
          })
        }
      </div>
    );
  }
}
