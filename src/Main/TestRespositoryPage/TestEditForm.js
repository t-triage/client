import React, { Component } from 'react'
import Api from "../Components/Api"
import axios from 'axios'
import * as _  from 'underscore'

import RemoveCircleIcon from "@mui/icons-material/RemoveCircle"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import StarsIcon from "@mui/icons-material/Star"

import InputBase from "@mui/material/InputBase"
import TextField from "@mui/material/TextField"
import Select from "@mui/material/Select"
import OutlinedInput from "@mui/material/OutlinedInput"
import InputLabel from "@mui/material/InputLabel"
import Grid from "@mui/material/Grid"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Snackbar from "@mui/material/Snackbar"

import ComponentsPicker from '../Components/ComponentsPicker'
import FunctionalityPicker from '../Components/FunctionalityPicker'

import {
  styles,
  COLORS,
  TECHNIQUE_LIST,
  AUTOMATION_LIST,
  MANUAL_PRIORITY_LIST,
  SUITE_TYPE_LIST,
  MANUAL_LIFECYCLE_LIST
} from '../Components/Globals'

import withStyles from '@mui/styles/withStyles';
import {show} from "./TestRepository";
import {ShareTestButton} from "../Components/ShareTestButton";
import {TestEditFormStep} from "./TestEditFormStep";
import Alert from '@mui/material/Alert';

const EMPTY_FUNCTIONALITY = {
  id: null,
  externalId: '',
  name: '',
  story: '',
  risk: '',
  enabled: false,
  timestamp: null,
  updated: null,
}

const EMPTY_TEST = {
  automationAssignee: null,
  automationStatus: 'SELECT',
  enabled: null,
  functionalityEntity: null,
  id: null,
  lastUpdater: null,
  mainStepId: null,
  name: '',
  note: null,
  needsUpdate: false,
  owner: null,
  priority: 'UNDEFINED',
  productId: null,
  // TODO requerimentId ???,
  steps: [],
  suite: 'SELECT',
  techniques: [],
  lifecycle: '',
};

class TestEditForm extends Component {
  state = {
    testEdit: Object.assign({}, EMPTY_TEST),
    productsList: [{id: 0, name: "Select ..."}],
    newStepName: '',
    newStepNameError: false,
    newStepExpected: '',
    newStepData: '',
    steps: [],
    shortcutEvent: undefined,
    components: [],
    snackbarsList: [],
    newFunctionality: false,
    functionalityEdit: Object.assign({}, EMPTY_FUNCTIONALITY)
  }

  viewOptions () {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetPropertyByName + "HIDE_FIELDS_MANUAL_TEST")
            .then(res => {
              res = res.data.value.split(',').map( a => String(a).trim().toLowerCase())
              show.name = !res.includes("name")
              show.product = !res.includes("product")
              show.component = !res.includes("component")
              show.functionality = !res.includes("functionality")
              show.priority = !res.includes("priority")
              show.readyAT = !res.includes("automation")
              show.suiteType = !res.includes("suitetype")
              show.lifecycle = !res.includes("lifecycle")
              show.techniques = !res.includes("techniques")
              show.description = !res.includes("description")
              show.requirements = !res.includes("requirements")
              show.steps = !res.includes("steps")
              show.stepsData = !res.includes("stepdata")
              show.stepsExpected = !res.includes("stepexpected")
              show.stepsHeader = !res.includes("stepheader")
          })

        .catch(err => {
              console.log("Failed to get visibility properties")
              show.name= true;
              show.product = true;
              show.component = true;
              show.functionality = true;
              show.priority = true;
              show.readyAT = true;
              show.suiteType = true;
              show.lifecycle = true;
              show.techniques = true;
              show.description= true;
              show.requirements = true;
              show.steps = true;
              show.stepsData = true;
              show.stepsExpected = true;
              show.stepsHeader = true;
        })

        .finally( a =>{
            if (show.steps == true) {
              document.addEventListener('keydown', this.state.shortcutEvent)  /// Event for shortcut
            }
    })
  }

  componentDidMount() {

    this.viewOptions()
    this.fetchProducts()

    let {test} = this.props
    if (test) {
      let components = []
      let lifecycle = ''
      if (test.component1Id)
        components.push({ id: test.component1Id, name: test.component1Name })
      if (test.component2Id)
        components.push({ id: test.component2Id, name: test.component2Name })
      if (test.component3Id)
        components.push({ id: test.component3Id, name: test.component3Name })

      if (test.enabled === false) {
        lifecycle = 'DISABLE'
      }
      if (test.enabled === true && test.needsUpdate === false) {
        lifecycle = 'VALID'
      }
      if (test.enabled === true && test.needsUpdate === true) {
        lifecycle = 'NEEDS_IMPROVEMENT'
      }

      if (!test.functionalityEntity) {
        test.functionalityEntity = EMPTY_FUNCTIONALITY
      }

      this.setState({
        testEdit: Object.assign([], test, {lifecycle: lifecycle}),
        steps: Object.assign([], test.steps),
        components,
      })
    }
  }

  componentWillMount() {
    this.setState({
      shortcutEvent: this.shortCut.bind(this),
    })
  }

  componentWillUnmount() {
    if (show.steps == true){
      document.removeEventListener("keydown", this.state.shortcutEvent) /// Event for shortcut
    }
  }

  fetchProducts() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + "?sort=name,asc")
        .then(res => {
          this.setState({
            productsList: [{ id: 0, name: "Select ..." }].concat(res.data.content),
          })
        })
  }

  onClose(id, fetchData=false) {
    this.setState({
      testEdit: null,
      steps: [],
    })
    this.props.onClose(id, fetchData)
  }

  onTechniqueChange(ev) {
    let {testEdit} = this.state;
    let {value} = ev.target
    testEdit.techniques = value
    this.setState({
      testEdit,
    })
  }

  onLifecycleChange(ev) {
    let {testEdit} = this.state;
    let {value} = ev.target;
    if (value === 'VALID') {
      testEdit.enabled = true;
      testEdit.needsUpdate = false;
      testEdit.lifecycle = 'VALID'
    } else if (value === 'DISABLE') {
      testEdit.enabled = false;
      testEdit.lifecycle = 'DISABLE'
    } else if (value === 'NEEDS_IMPROVEMENT'){
      testEdit.enabled = true;
      testEdit.needsUpdate = true;
      testEdit.lifecycle = 'NEEDS_IMPROVEMENT'
    }
    this.setState({
      testEdit,
    })
  }

  onProductChange(event) {
    let {testEdit, productsList} = this.state
    let {value} = event.target
    testEdit.productId = value
    testEdit.productName = _.find(productsList, {id: value}).name
    this.setState({
      testEdit,
    })
  }

  setStepFields = name => event => {
    let {newStepNameError} = this.state
    let {value} = event.target
    this.setState({
      [name]: value,
      newStepNameError: name === 'newStepName' && value === '',
    })
  }

  select = name => event => {
    let {testEdit} = this.state,
        {value} = event.target;

    if (!testEdit.functionalityEntity) {
      testEdit.functionalityEntity = EMPTY_FUNCTIONALITY
    }

    if (name === 'note') {
      let note = testEdit[name];
      testEdit[name] = {...note, description: value};
    } else if (name === 'story' || name === 'risk') {
      testEdit.functionalityEntity[name] = value
    } else {
      testEdit[name] = value;
    }

    this.setState({
      testEdit,
    }, () => {
      if (name === 'name') {
        if (value === '') {
          document.getElementById(`testName-${testEdit.id ? testEdit.id : 'new'}-error`).style.display = 'block'
        } else {
          document.getElementById(`testName-${testEdit.id ? testEdit.id : 'new'}-error`).style.display = 'none'
        }
      }
    })
  }

  onFunctionalityExternalIdChange = () => event => {
    let {testEdit} = this.state,
        {value} = event.target;

    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.FindFunctionalityByExternalId}?functionalityExternalId=${value}`)
        .then(res => {
          if (res.data) {
            testEdit.functionalityEntity = res.data
          } else {
            testEdit.functionalityEntity = {...testEdit.functionalityEntity, externalId: value}
          }

          this.setState({
            ...testEdit
          })
        })
  }

  onFunctionalityChange(item) {
    let {testEdit} = this.state

    testEdit.functionalityEntity = !item.name ? EMPTY_FUNCTIONALITY : {...testEdit.functionalityEntity, ...item}

    this.setState({
      ...testEdit
    })
  }

  onAddFunctionality() {
    this.setState({
      newFunctionality: true,
    })
  }

  onComponentsChange(item) {
    let {components, testEdit} = this.state;
    let itemIndex = _.findIndex(components, {id: item.id})
    if (itemIndex === -1) {
      if (components.length < 3) {
        components.push(item)
      } else {
        document.getElementById(`testComponents-${testEdit.id ? testEdit.id : 'new'}-error`).style.display = 'block'
      }
    } else {
      components.splice(itemIndex, 1)
      document.getElementById(`testComponents-${testEdit.id ? testEdit.id : 'new'}-error`).style.display = 'none'
    }
    this.setState({
      components,
    })
  }

  updateStep = (field, index) => event => {
    let {steps} = this.state
    let {value} = event.target
    let step = steps[index]
    let elem;
    step[field] = value
    if (value === '') {
      elem = document.getElementById(`${field}-${index}`)
      if (elem)
        elem.style.display = 'block'
    } else {
      elem = document.getElementById(`${field}-${index}`)
      if (elem)
        elem.style.display = 'none'
    }
    this.setState({
      steps,
    })
  }

  onListBlur(id, index) {
    let {testEdit, steps} = this.state
    let star = document.getElementById(`mainStep-${id}-${index}`)
    let step = steps[index]
    if (step.id && testEdit.mainStepId !== step.id) {
      star.style.visibility = "hidden"
    } else {
      if (!step.id && !step.main) {
        star.style.visibility = "hidden"
      }
    }
  }

  onListOver(id, index) {
    let {testEdit, steps} = this.state
    let star = document.getElementById(`mainStep-${id}-${index}`)
    let step = steps[index]
    if (step.id && testEdit.mainStepId !== step.id) {
      star.style.visibility = "visible"
    } else {
      if (!step.id && !step.main) {
        star.style.visibility = "visible"
      }
    }
  }

  shortCut (e) {
    if (e.keyCode === 65 && e.altKey === true) {     /// ALT + a
      this.addStep()
      this.textFieldFocus()
      e.preventDefault()}

  }

  textFieldFocus(){

    let {steps}= this.state
    const lastStepPosition = steps.length -1
    const targetFocus = document.getElementById(`stepName-${lastStepPosition}`)
    targetFocus.focus();   //blur is not necessary
  }

  markMainStep(index) {
    let {testEdit, steps} = this.state;
    let step = steps[index]
    let prevMainStep = _.find(steps, {main: true})

    if (step) {
      step.main = true
      if (prevMainStep && prevMainStep != step)
        prevMainStep.main = false
      this.setState({
        testEdit: {...testEdit, mainStepId: step.id},
        steps,
      })
    }
  }

  removeStep(index) {
    let {steps} = this.state
    steps.splice(index, 1)
    steps = steps.map((step, i) => {
      step.stepOrder = i
      return step
    })
    this.setState({
      steps,
    })
  }

  addStep() {
    let {steps, testEdit, newStepName, newStepExpected, newStepData} = this.state

    //if (this.validateStep(newStepName, newStepExpected)) {
    steps.push({
      data: newStepData,
      enabled: true,
      expectedResult: newStepExpected,
      step: newStepName,
      stepOrder: steps.length,
      testCaseId: testEdit.id ? testEdit.id : null,
      main: false,
      timestamp: new Date().getTime(),
      updated: new Date().getTime(),
    })
    this.setState({
      steps,
    }, () => {
      this.clearNewStepFields()
    })
    //}
  }

  validateStep(newStepName) {
    this.setState({
      newStepNameError: newStepName === '',
    })
    return newStepName !== ''
  }

  validateTestFields() {
    let {testEdit} = this.state
    let {name} = testEdit
    let emptyName = name === ''
    if (emptyName) {
      document.getElementById(`testName-${testEdit.id ? testEdit.id : 'new'}-error`).style.display = 'block'
    }
    return !emptyName
  }

  saveTest(ev) {
    ev.preventDefault()
    let {testEdit, components, steps} = this.state

    if (this.validateTestFields()) {
      let componentsAvailable = components.length > 0

      let functionalityBody = {
        ...testEdit.functionalityEntity,
        enabled: true,
        updated: new Date().getTime(),
        timestamp: new Date().getTime(),
      }

      let body = {
        ...testEdit,
        automationStatus: testEdit.automationStatus !== 'SELECT' ? testEdit.automationStatus : 'UNDEFINED',
        component1Id: componentsAvailable && components[0] ? components[0].id : null,
        component1Name: componentsAvailable && components[0] ? components[0].name : null,
        component2Id: componentsAvailable && components[1] ? components[1].id : null,
        component2Name: componentsAvailable && components[1] ? components[1].name : null,
        component3Id: componentsAvailable && components[2] ? components[2].id : null,
        component3Name: componentsAvailable && components[2] ? components[2].name : null,
        lastUpdater: this.props.currentUser,
        priority: testEdit.priority !== 'SELECT' ? testEdit.priority : null,
        owner: testEdit.owner ? testEdit.owner : this.props.currentUser,
        steps,
        suite: testEdit.suite !== 'SELECT' ? testEdit.suite : null,
        timestamp: testEdit.timestamp ? testEdit.timestamp : new Date().getTime(),
        updated: new Date().getTime(),
      }

      if (testEdit.functionalityEntity.name) {
        axios({
          method: testEdit.functionalityEntity.id ? "PUT" : "POST",
          url: `${Api.getBaseUrl()}${testEdit.functionalityEntity.id ? Api.ENDPOINTS.UpdateFunctionality : Api.ENDPOINTS.SaveFunctionality}`,
          data: JSON.stringify(functionalityBody),
          headers: {
            'Content-Type': 'application/json'
          },
        })
            .then(res => {
              body.functionalityEntity = res.data

              this.save(body)
            })
      } else {
        this.save(body)
      }
    }
  }

  save(body) {
    let {testEdit} = this.state

    axios({
      method: testEdit.id ? "PUT" : "POST",
      url: `${Api.getBaseUrl()}${testEdit.id ? Api.ENDPOINTS.UpdateManualTest : Api.ENDPOINTS.SaveManualTest}`,
      data: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
    })
        .then(res => {
          this.onClose(testEdit.id, true)
        })
        .catch(err => {
          if (err.response.data.code == 406)
            err = "Unable to create Test, you have reached the limit of 50 test cases"
          this.addSnackbar(err, 'error')
        })
  }

  addSnackbar(msg, variant) {
    let {snackbarsList} = this.state;

    snackbarsList.push({openSnackbar: true, snackbarMsg: msg, snackbarVariant: variant});
    this.setState({
      snackbarsList: snackbarsList
    });
  }

  removeSnackbar(snack, id) {
    let {snackbarsList} = this.state;

    snack.openSnackbar = false;
    if (snackbarsList[id]) {
      snackbarsList[id] = snack
    }

    this.setState({
      snackbarsList: snackbarsList
    });
  }

  renderSnackbars() {
    let { snackbarsList } = this.state;

    return (
        <div className={"snackbars-container"}>
          {
            snackbarsList.map((snack, index) => {
              return (
                  <Snackbar
                      key={index}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      className={'adminSnackbar'}
                      open={snack.openSnackbar}
                      autoHideDuration={2000}
                      onClose={this.removeSnackbar.bind(this, snack, index)}
                  >


                    <Alert variant={"filled"} severity={snack.snackbarVariant} onClose={this.removeSnackbar.bind(this, snack, index)}>
                      {snack.snackbarMsg}
                    </Alert>
                  </Snackbar>
              )
            })
          }

        </div>
    )
  }

  clearNewStepFields() {
    this.setState({
      newStepName: '',
      newStepExpected: '',
      newStepData: '',
    })
  }

  moveStepDown(stepOrder) {
    let {steps} = this.state
    if (stepOrder < steps.length - 1) {
      let step = _.find(steps, {stepOrder});
      let nextStep = _.find(steps, {stepOrder: stepOrder + 1})
      step.stepOrder += 1;
      nextStep.stepOrder -= 1;
      this.setState({
        steps: []
      }, () => {
        this.setState({
          steps: _.sortBy(steps, 'stepOrder'),
        })
      })
    }
  }

  moveStepUp(stepOrder) {
    let {steps} = this.state
    if (stepOrder > 0) {
      let step = _.find(steps, {stepOrder});
      let prevStep = _.find(steps, {stepOrder: stepOrder - 1})
      step.stepOrder -= 1;
      prevStep.stepOrder += 1;
      this.setState({
        steps: []
      }, () => {
        this.setState({
          steps: _.sortBy(steps, 'stepOrder'),
        })
      })
    }
  }


  renderSteps() {
    let {steps, testEdit} = this.state
    return _.sortBy(steps, 'stepOrder').map((step, index) => {
      return (
          <TestEditFormStep step={step} index={index} this={this}/>
      )
    })
  }

  render() {
    let {fullWidth, classes} = this.props
    let {
      testEdit,
      productsList,
      steps,
      components,
      newStepData,
      newStepName,
      newStepNameError,
      newStepExpected,
      newFunctionality,
    } = this.state
    return testEdit && (

        <form onSubmit={this.saveTest.bind(this)}
              className="manualTestEditForm"
              style={{ width: fullWidth ? '100%' : '80%' }}>
          {this.renderSnackbars()}
          <Grid container spacing={2} style={{ marginTop: 0 }}>
            {show.name && (
                <Grid item xs={12} sm={12}>
                  <div style={{ display: "flex", justifyContent: "flex-end"}} >
                    <ShareTestButton textId={this.props.test.id}/>
                  </div>
                  <TextField
                      id={`testName-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Name"
                      placeholder="Test Name"
                      variant="outlined"
                      onChange={this.select("name")}
                      value={testEdit.name ? testEdit.name : ''}
                      fullWidth
                      multiline
                      inputProps={{
                        style: {
                          fontSize: '1rem',
                          minHeight: '22px'
                        },
                      }}
                      className="manualTestEditTestName"
                      spellCheck={false}
                  />
                  <small id={`testName-${testEdit.id ? testEdit.id : 'new'}-error`}
                         style={{color: COLORS.red, display: 'none'}}>Field cannot be empty</small>
                </Grid>
            )}
            {show.product && (
                <Grid item xs={12} sm={show.component? 3 : 12}>

                  <TextField
                      id={`testProduct-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Product"
                      value={testEdit.productId ? testEdit.productId : 0}
                      fullWidth
                      select
                      variant="outlined"
                      onChange={this.onProductChange.bind(this)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '.875rem',
                        }
                      }}>
                    {productsList.map(p => (
                        <MenuItem className="globalMenuItem" key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>)}

            {show.component && (
                <Grid item xs={12} sm={show.product? 9 : 12}>
                  <ComponentsPicker
                      id={`testComponents-${testEdit.id ? testEdit.id : 'new'}`}
                      automatedComponents={false}
                      onChange={this.onComponentsChange.bind(this)}
                      selectedItems={components}/>
                  <small id={`testComponents-${testEdit.id ? testEdit.id : 'new'}-error`}
                         style={{color: COLORS.red, display: 'none'}}>Max. of 3 components reached</small>
                </Grid>
            )}
            {show.functionality && (
                <>
                  {!newFunctionality && (
                      <Grid item xs={12} sm={12}>
                        <FunctionalityPicker
                            id={`testFunctionality-${testEdit.id ? testEdit.id : 'new'}`}
                            selectedItem={testEdit.functionalityEntity ? testEdit.functionalityEntity : null}
                            border='none'
                            isFilter={false}
                            inContainer={false}
                            onChange={this.onFunctionalityChange.bind(this)}
                            onAddFunctionality={this.onAddFunctionality.bind(this)}
                        />
                      </Grid>
                  )}
                  {newFunctionality && (
                      <Grid item xs={12} sm={12}>
                        <div className={'Container-FunctionalityContainer'}>
                          <fieldset
                              className={'Container-FunctionalityFieldSet'}>
                            <legend
                                className={'Container-FunctionalityLabel'}>
                              <span>Functionality</span>
                            </legend>

                            <Grid container spacing={2} style={{padding: 5}}>
                              <Grid item xs={3} sm={6}>
                                <TextField
                                    id={`externalId-${testEdit.id ? testEdit.id : 'new'}`}
                                    label="External Id"
                                    placeholder="Jira, story or functional Id"
                                    variant="outlined"
                                    value={!!testEdit.functionalityEntity ? testEdit.functionalityEntity.externalId : ""}
                                    onChange={this.onFunctionalityExternalIdChange()}
                                    fullWidth
                                    autoComplete="off"
                                    InputLabelProps={{
                                      shrink: true,
                                      style: {
                                        color: COLORS.grey,
                                      }
                                    }}
                                    inputProps={{
                                      style: {
                                        fontSize: '.875rem',
                                      },
                                    }}
                                    className="manualTestEditDescription"
                                    spellCheck={false}
                                />
                              </Grid>
                              <Grid item xs={3} sm={6}>
                                <TextField
                                    id={`risk-${testEdit.id ? testEdit.id : 'new'}`}
                                    label="Risk"
                                    placeholder="Potential risks"
                                    variant="outlined"
                                    onChange={this.select("risk")}
                                    value={!!testEdit.functionalityEntity ? testEdit.functionalityEntity.risk : ""}
                                    fullWidth
                                    autoComplete="off"
                                    InputLabelProps={{
                                      shrink: true,
                                      style: {
                                        color: COLORS.grey,
                                      }
                                    }
                                    }
                                    inputProps={{
                                      style: {
                                        fontSize: '.875rem',
                                      },
                                    }}
                                    className="manualTestEditDescription"
                                    spellCheck={false}
                                />
                              </Grid>
                              <Grid item xs={6} sm={12}>
                                <TextField
                                    id={`story-${testEdit.id ? testEdit.id : 'new'}`}
                                    label="Story"
                                    placeholder="Story name"
                                    variant="outlined"
                                    onChange={this.select("story")}
                                    value={!!testEdit.functionalityEntity ? testEdit.functionalityEntity.story : ""}
                                    fullWidth
                                    autoComplete="off"
                                    InputLabelProps={{
                                      shrink: true,
                                      style: {
                                        color: COLORS.grey,
                                      }
                                    }}
                                    inputProps={{
                                      style: {
                                        fontSize: '.875rem',
                                      },
                                    }}
                                    spellCheck={false}
                                />
                              </Grid>
                              <Grid item xs={6} sm={12}>
                                <FunctionalityPicker
                                    id={`testFunctionality-${testEdit.id ? testEdit.id : 'new'}`}
                                    inContainer={true}
                                    isFilter={false}
                                    selectedItem={testEdit.functionalityEntity ? testEdit.functionalityEntity : null}
                                    border='none'
                                    onChange={this.onFunctionalityChange.bind(this)}
                                    onAddFunctionality={this.onAddFunctionality.bind(this)}
                                />
                                {
                                    testEdit.functionalityEntity &&
                                    (testEdit.functionalityEntity.risk || testEdit.functionalityEntity.externalId || testEdit.functionalityEntity.story) &&
                                    !testEdit.functionalityEntity.name &&
                                    <small style={{color: COLORS.red}}>Field cannot be empty</small>
                                }
                              </Grid>
                            </Grid>
                          </fieldset>
                        </div>
                      </Grid>
                  )}
                </>)}
            {show.priority && (
                <Grid item xs={12} sm={show.readyAT && show.suiteType? 3: show.readyAT || show.suiteType? 6 : 12}>
                  <TextField
                      id={`testPriority-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Priority"
                      value={testEdit.priority ? testEdit.priority : 'UNDEFINED'}
                      fullWidth
                      select
                      variant="outlined"
                      onChange={this.select("priority")}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '.875rem',
                        }
                      }}>
                    {MANUAL_PRIORITY_LIST.map(p => (
                        <MenuItem className="globalMenuItem" key={p.id} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
            )}
            {show.readyAT && (
                <Grid item xs={12} sm={show.priority && show.suiteType? 3: show.priority || show.suiteType? 6 : 12}>
                  <TextField
                      id={`testReadyAutom-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Ready for Automation"
                      value={testEdit.automationStatus ? testEdit.automationStatus : "SELECT"}
                      fullWidth
                      select
                      variant="outlined"
                      onChange={this.select("automationStatus")}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '.875rem',
                        }
                      }}>
                    {AUTOMATION_LIST.map(p => (
                        <MenuItem className="globalMenuItem" key={p.id} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
            )}
            {show.suiteType && (
                <Grid item xs={12} sm={!show.priority && !show.readyAT? 12: 6}>
                  <TextField
                      id={`testSuiteType-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Suite Type"
                      value={testEdit.suite ? testEdit.suite : 'SELECT'}
                      fullWidth
                      select
                      variant="outlined"
                      onChange={this.select("suite")}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '.875rem',
                        }
                      }}>
                    {SUITE_TYPE_LIST.map(p => (
                        <MenuItem className="globalMenuItem" key={p.id} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
            )}
            {show.lifecycle && (
                <Grid item xs={12} sm={show.techniques? 6 : 12}>
                  <TextField
                      id={`testLifecycle-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Lifecycle"
                      value={testEdit.lifecycle ? testEdit.lifecycle : 'SELECT'}
                      fullWidth
                      select
                      variant="outlined"
                      onChange={this.onLifecycleChange.bind(this)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '.875rem',
                        }
                      }}>
                    {MANUAL_LIFECYCLE_LIST.map(p => (
                        <MenuItem className="globalMenuItem" key={p.id} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
            )}
            {show.techniques && (
                <Grid item xs={12} sm={show.lifecycle? 6 : 12}>
                  <FormControl style={{ width: '100%' }}>
                    <InputLabel style={{ top: -16, left: -2, backgroundColor: 'white', padding: '0 5px' }} variant="filled" shrink htmlFor="testTechniques">
                      Techniques
                    </InputLabel>
                    <Select
                        classes={{
                          select: classes.select,
                        }}
                        displayEmpty={true}
                        value={testEdit.techniques ? testEdit.techniques : []}
                        onChange={this.onTechniqueChange.bind(this)}
                        renderValue={selected => {
                          if (selected.length > 0) {
                            return selected.map(elem => {
                              let item = _.find(TECHNIQUE_LIST, {value: elem})
                              return <Chip
                                  key={item.id}
                                  className="chip-outlined"
                                  tabIndex={-1}
                                  label={item.label}
                                  classes={{
                                    root: classes.chip,
                                  }}
                              />
                            })
                          } else {
                            return <Chip
                                className="chip-outlined"
                                tabIndex={-1}
                                style={{ visibility: 'hidden' }}
                                label={"asd"}
                                classes={{
                                  root: classes.chip,
                                }}
                            />
                          }
                        }}
                        multiple
                        inputProps={{
                          padding: 0
                        }}
                        input={
                          <OutlinedInput
                              fullWidth={true}
                              id={`testTechniques`}
                              style={{
                                padding: 0
                              }}
                              multiline
                              inputProps={{
                                style: { fontSize: '.875rem' },
                              }}  />
                        }>
                      {TECHNIQUE_LIST.map(p => (
                          <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                            <Checkbox checked={testEdit.techniques.indexOf(p.value) > -1} />
                            {p.label}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
            )}
            {show.description && (
                <Grid item xs={12} sm={12}>
                  <TextField
                      id={`description-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Description"
                      placeholder="Enter a Description"
                      variant="outlined"
                      onChange={this.select("note")}
                      value={!!testEdit.note ? testEdit.note.description : ""}
                      fullWidth
                      multiline
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '1rem',
                          minHeight: '22px'
                        },
                      }}
                      className="manualTestEditDescription"
                      spellCheck={false}
                  />
                </Grid>
            )}
            {show.requirements && (
                <Grid item xs={12} sm={12}>
                  <TextField
                      id={`requirements-${testEdit.id ? testEdit.id : 'new'}`}
                      label="Requirements"
                      placeholder="Enter requirements"
                      variant="outlined"
                      onChange={this.select("requirement")}
                      value={testEdit.requirement ? testEdit.requirement : ''}
                      fullWidth
                      multiline
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        style: {
                          fontSize: '1rem',
                          minHeight: '22px'
                        },
                      }}
                      className="manualTestEditDescription"
                      spellCheck={false}
                  />
                </Grid>
            )}
            {show.steps && (
                <Grid item xs={12} style={{ marginTop: 20, color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.75rem' }}>
                  <Grid container spacing={2}>
                    {show.stepsHeader && (
                    <Grid item xs={4}><b>STEP</b></Grid>)}
                    {show.stepsData && (
                    <Grid item xs={3}><b>DATA</b></Grid>)}
                    {show.stepsExpected && (
                        <Grid item xs={5}><b>EXPECTED</b></Grid>
                    )}
                  </Grid>
                  <List>
                    {this.renderSteps()}
                    {/* Si se puede, usar clases en vez de inline styles en elementos html */}
                    <div style={{width: "100%", display: "inline-block", textAlign: "start"}}>
                      <Tooltip title={'Add Step'}>
                        <IconButton onClick={this.addStep.bind(this)} aria-label="Add Step" size="large">
                          <AddCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </List>
                </Grid>
            )}
          </Grid>
          <div style={{ marginTop: 16, marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                type="button"
                className="globalButton"
                onClick={this.onClose.bind(this, testEdit.id, false)}
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
    );
  }
}

export default withStyles(styles)(TestEditForm);
