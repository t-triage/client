import React, { Component } from 'react'
import Api from "./Api"
import axios from 'axios'

import Grid from "@material-ui/core/Grid"
import TextField from "@material-ui/core/TextField"
import InputBase from "@material-ui/core/InputBase"
import MenuItem from "@material-ui/core/MenuItem"
import Button from "@material-ui/core/Button"
import {
  MuiPickersUtilsProvider,
  InlineDatePicker
} from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";

import UserPicker from './UserPicker'
import { COLORS, TEST_PLAN_STATUS, getDayInYear, checkDateBeforeToday } from './Globals'

const EMPTY_PLAN = {
  assignee: null,
  description: '',
  enabled: true,
  environment: '',
  fromDate: new Date().getTime(),
  name: '',
  status: null,
  timestamp: 0,
  toDate: null,
}

export default class ManualTestPlanEdit extends Component {
  state = {
    testPlan: Object.assign({}, EMPTY_PLAN),
    nameError: false,
    descriptionError: false,
    pastFromDateError: false,
    assigneeFocus: false,
  }

  componentDidMount() {
    let {testPlan} = this.props
    if (testPlan) {
      this.setState({
        testPlan,
      })
    }
  }

  select = name => event => {
      let {testPlan} = this.state
      let {value} = event.target
      testPlan[name] = value
      this.setState({
          testPlan,
      }, () => {
        if (name === 'name') {
          this.setState({
            nameError: value === '' ? true : false
          })
        }
        if (name === 'description') {
          this.setState({
            descriptionError: value === '' ? true : false
          })
        }
      })
  }

  onClose(id) {
    this.props.onClose(id)
  }

  onUserChange(item) {
    this.setState({
      testPlan: {...this.state.testPlan, assignee: item}
    })
  }

  formatPickerDate(date) {
    return new Date(date).toISOString()
  }

  onDateChange(name, date) {
    let {testPlan, pastFromDateError, toDateBeforeFromDateError} = this.state
    testPlan[name] = date.getTime()
    if (name === 'fromDate')
      pastFromDateError = checkDateBeforeToday(date)
    if (name === 'toDate')
      toDateBeforeFromDateError = this.checkToDateBeforeFromDate(date)
    this.setState({
      testPlan,
      pastFromDateError,
      toDateBeforeFromDateError,
    })
  }

  checkToDateBeforeFromDate(date) {
    let {fromDate} = this.state.testPlan
    return getDayInYear(date) < getDayInYear(new Date(fromDate))
  }

  validateFields() {
    let {testPlan} = this.state;
    let result = true;
    if (testPlan.name === '' || testPlan.description === '' ) {
      result = false;
    }
    this.setState({
      nameError: testPlan.name === '' ? true : false,
      descriptionError: testPlan.description === '' ? true : false,
    })
    return result;
  }

  onSubmit(ev) {
    ev.preventDefault()
    if (this.validateFields()) {
      let {testPlan} = this.state
      let body = {
        ...testPlan,
        assignee: testPlan.assignee,
        description: testPlan.description,
        enabled: true,
        environment: testPlan.environment,
        fromDate: testPlan.fromDate,
        name: testPlan.name,
        status: testPlan.status,
        timestamp: new Date().getTime(),
        toDate: testPlan.toDate,
      }
      axios({
        method: testPlan.id ? "PUT" : "POST",
        url: `${Api.getBaseUrl()}${testPlan.id ? Api.ENDPOINTS.UpdateTestPlan : Api.ENDPOINTS.SaveTestPlan}`,
        data: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        },
      })
      .then(res => {
        this.props.onSave(res.data.id)
      })
    }
  }

  render() {
    let {fullWidth, inDialog} = this.props
    let {testPlan, nameError, descriptionError, pastFromDateError, toDateBeforeFromDateError, assigneeFocus} = this.state

    return testPlan && (
      <form onSubmit={this.onSubmit.bind(this)}
          style={{ width: fullWidth ? '100%' : '80%' }}
          className="manualTestPlanEditForm">
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <TextField
                  id={`testPlan-name-${testPlan.id ? testPlan.id : 'new'}`}
                  label="Name"
                  placeholder="Test Plan Name"
                  onChange={this.select("name")}
                  value={testPlan.name ? testPlan.name : ''}
                  error={nameError}
                  helperText={nameError ? 'Required field' : ''}
                  fullWidth
                  autoFocus
                  multiline
									InputLabelProps={{
										shrink: true,
									}}
                  inputProps={{
                      style: {
                        fontSize: '1rem',
                        minHeight: '20px'
                      }
                  }}
                  spellCheck={false}
                  className="manualTestEditTestName"
              />
          </Grid>
          <Grid item xs={4}>
            <div className={'TestPlan-AssigneeContainer'}>
                <fieldset className={
                  assigneeFocus ?
                    'TestPlan-AssigneeFieldset-active'
                  : 'TestPlan-AssigneeFieldset'
                }>
                    <legend className={
                      assigneeFocus ?
                        'TestPlan-AssigneeLabel-active'
                      : 'TestPlan-AssigneeLabel'
                    }>
                        <span style={{ marginLeft: '-3', marginRight: '-3' }}>Assignee</span>
                    </legend>
                    <div style={{ position: 'relative', zIndex: '9999' }}>
                      <UserPicker
                          onChange={this.onUserChange.bind(this)}
                          id='manualPlanEdit-userPicker'
                          color={'currentColor'}
                          onFocus={() => this.setState({ assigneeFocus: true })}
                          onBlur={() => this.setState({ assigneeFocus: false })}
                          border={'0'}
                          buildTriage={0}
                          fixedMenu={inDialog ? true : false}
                          selectedItem={testPlan ? testPlan.assignee : null} />
                    </div>
                </fieldset>
            </div>
          </Grid>
          <Grid item xs={8}>
            <TextField
                  id={`testPlan-description-${testPlan.id ? testPlan.id : 'new'}`}
                  label="Notes"
                  placeholder="Test Plan Notes"
                  onChange={this.select("description")}
                  value={testPlan.description ? testPlan.description : ''}
                  error={descriptionError}
                  helperText={descriptionError ? 'Required field' : ''}
                  fullWidth
                  InputLabelProps={{
                      shrink: true,
                  }}
                  inputProps={{
                      style: {
                        fontSize: '.875rem',
                      }
                  }}
              />
          </Grid>
          <Grid item xs={4}>
            <TextField
                  id={`testPlan-status-${testPlan.id ? testPlan.id : 'new'}`}
                  label="Status"
                  onChange={this.select("status")}
                  value={testPlan.status ? testPlan.status : 'SELECT'}
                  select
                  fullWidth
                  InputLabelProps={{
                      shrink: true,
                  }}
                  InputProps={{
                      style: {
                        fontSize: '.875rem',
                      }
                  }}>
                  {TEST_PLAN_STATUS.map(p => (
                      <MenuItem className="globalMenuItem" key={p.id} value={p.value}>{p.label}</MenuItem>
                  ))}
              </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
                  id={`testPlan-environment-${testPlan.id ? testPlan.id : 'new'}`}
                  label="Environment"
                  placeholder="Test Plan Environment"
                  onChange={this.select("environment")}
                  value={testPlan.environment ? testPlan.environment : ''}
                  fullWidth
                  InputLabelProps={{
                      shrink: true,
                  }}
                  inputProps={{
                      style: {
                        fontSize: '.875rem',
                      }
                  }}
              />
          </Grid>
          <Grid item xs={4}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <InlineDatePicker
                id={`testPlan-fromDate-${testPlan.id ? testPlan.id : 'new'}`}
                label="From"
                value={testPlan.fromDate ? this.formatPickerDate(testPlan.fromDate) : new Date().getTime()}
                onChange={this.onDateChange.bind(this, 'fromDate')}
                fullWidth
                style={{margin: 0}}
                InputProps={{
                    style: {
                      fontSize: '.875rem',
                    }
                }}
              />
          </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={4}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <InlineDatePicker
                  id={`testPlan-toDate-${testPlan.id ? testPlan.id : 'new'}`}
                  label="To"
                  value={testPlan.toDate ? this.formatPickerDate(testPlan.toDate) : null}
                  onChange={this.onDateChange.bind(this, 'toDate')}
                  fullWidth
                  style={{margin: 0}}
                  InputProps={{
                      style: {
                        fontSize: '.875rem',
                      }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
            </MuiPickersUtilsProvider>
          </Grid>
        </Grid>
        <div style={{ marginTop: 25, marginBottom: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <Button
              type="button"
              className="globalButton"
              onClick={this.onClose.bind(this, testPlan.id)}
              variant="contained"
              color="secondary">
              Cancel
          </Button>
          <Button
              type="submit"
              className="globalButton"
              variant="contained"
              style={{ marginLeft: 8 }}
              color="primary">
              Save
          </Button>
        </div>
      </form>
    )
  }

}
