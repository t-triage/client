import React, { Component } from 'react';
import Api from "./Components/Api"
import axios from 'axios'
import { _ } from 'underscore'
import queryString from 'query-string';

import ImportLogs from './Components/ImportLogs';
import ImportTests from './Components/ImportTests';
import ImportFilesPopover from './Components/ImportFilesPopover';


import IconButton from '@material-ui/core/IconButton'
import Checkbox from "@material-ui/core/Checkbox"
import DialogTitle from "@material-ui/core/DialogTitle"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import CircularProgress from "@material-ui/core/CircularProgress"
import Snackbar from '@material-ui/core/Snackbar'
import RemoveIcon from "@material-ui/icons/RemoveCircle"
import Grid from '@material-ui/core/Grid'
import TablePagination from '@material-ui/core/TablePagination';
import Nav from "./Components/Nav"
import AutomatedTestEdit from './Components/AutomatedTestEdit'
import AutomatedTestFilters from './Components/AutomatedTestFilters'
import AutomatedTestNameFilter from './Components/AutomatedTestNameFilter'
import CopyrightFooter from "./Components/CopyrightFooter"
import { SnackBarAutomatedTestInfo } from './Components/SnackBarAutomatedTestInfo'
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown"
import TextField from "@material-ui/core/TextField"
import MenuItem from "@material-ui/core/MenuItem"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import { withStyles } from '@material-ui/core/styles'
import {
  styles,
  COLORS,
  DEFAULT_AUTOMATED_TEST_FILTERS,
  snackbarStyle,
  MySnackbarContent,
  WIKI_URL
} from './Components/Globals'
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button'
import CloudUploadIcon from "@material-ui/icons/CloudUpload"
import AutomatedTestPipelineEdit from './Components/AutomatedTestPipelineEdit'
import {scrollToTop, TextFieldInput} from '../Admin/AdminUtils'
import SetAutomatedComponentPicker from "./Components/SetAutomatedComponentPicker";
const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

const CancelToken = axios.CancelToken;
let cancel;

class AutomatedTestRepository extends Component {

  constructor(props) {
    super(props);

    let searchParams = queryString.parse(props.location.search);
    let initFilters = searchParams ? _.extend(DEFAULT_AUTOMATED_TEST_FILTERS, searchParams) : DEFAULT_AUTOMATED_TEST_FILTERS;

    this.state = {
      currentUser: null,
      newTestOpen: false,
      jobsSearchMenuElement: null,
      errorMessage: false,
      automatedTestsList: null,
      isLoading: false,
      helpEnabled: false,
      expandedTests: [],
      selectedTests: [],
      expandTest: searchParams && searchParams.expandTest,
      select: true,
      expandedRun: null,
      filters: initFilters,
      defaultItemsComponent1: null,
      defaultItemsComponent2: null,
      defaultItemsComponent3: null,
      defaultItemsComponent4: null,
      defaultItemsComponent5: null,
      defaultItemsComponent6: null,
      loading: false,
      fileReport: null,
      openSnackbar: false,
      snackbarMsg: '',
      snackbarVariant: '',
      rowsPerPage: null,
      totalElements: 0,
      totalPages: 0,
      page: 0,
      importingTests: false,
      pipelineList:null,
      assignPipeline: '',
      assignPipelineId: -2,
      newPipeDialogOpen: false,
      isPopoverOpen: false,
      popoverElement: null,
      isLogsModalOpen: false,
      isTestsModalOpen: false,
      assignComponentList: null,
      assignProductComponent: null,
      assignProductComponentName: '',
      assignProductComponentId: -2,
      isSetComponentOpen: false,
    };
    this.helpItems = [
      [
        {
          title: 'PAGE GOAL',
          text: 'Manage Automated Tests'
        },
        {
          title: 'USER ACTION',
          text: 'Add test cases to a Pipeline'
        },
        {
          title: 'DOCUMENTATION',
          text: `Detailed documentation <a target="_blank" href=${WIKI_URL + "docs/DOC-7103"}>HERE</a>`
        },
        {
          title: null,
          text: null,
          videoURL: 'https://youtu.be/4dpRxGExdaA'
        }
      ]
    ];
  }

  componentDidMount() {
    this.setState({
      isLoading: true, page: 0, rowsPerPage: 25,
    }, () => {
      this.fetchFilteredAutomatedTests(this.state.filters, scrollToTop())
    })
    this.fetchPipelinesList()
    this.fetchSuggestedComponentList()

  }

  fetchDefaultComponents(type, id) {
    let {filters} = this.state,
        params = [],
        responseField = '',
        endpoint = Api.ENDPOINTS.SuggestedAutomatedComponents,
        url;

    if (type === 'component1') {
      params.push(id);
      responseField = 'defaultItemsComponent2';
      url = `${endpoint}?automatedComponentsIds=${params}`;
    }
    else if (type === 'component2') {
      params.push(filters.component1.id);
      params.push(id);
      responseField = 'defaultItemsComponent3';
      url = `${endpoint}?automatedComponentsIds=${params}`;
    } else if (type === 'component3') {
      params.push(filters.component1.id);
      params.push(filters.component2.id);
      params.push(id);
      responseField = 'defaultItemsComponent4';
      url = `${endpoint}?automatedComponentsIds=${params}`;
    } else if (type === 'component4') {
      params.push(filters.component1.id);
      params.push(filters.component2.id);
      params.push(filters.component3.id);
      params.push(id);
      responseField = 'defaultItemsComponent5';
      url = `${endpoint}?automatedComponentsIds=${params}`;
    } else if (type === 'component5') {
      params.push(filters.component1.id);
      params.push(filters.component2.id);
      params.push(filters.component3.id);
      params.push(filters.component4.id);
      params.push(id);
      responseField = 'defaultItemsComponent6';
      url = `${endpoint}?automatedComponentsIds=${params}`;
    } else {
      url = Api.ENDPOINTS.SuggestedDefaultAutomatedComponents;
      responseField = 'defaultItemsComponent1';
    }

    this.setState({
      [responseField]: [],
      loading: true
    });

    axios.get(`${Api.getBaseUrl()}${url}`)
        .then(res => {
          this.setState({
            [responseField]: res.data.content,
            loading: false
          })
        })
        .catch(err => {
          let testDefaults = [];

          this.setState({
            [responseField]: testDefaults,
          });
        })
  }

  openConfirmationDialog(ev) {
    let {value} = ev.target
    let pipe = _.find(this.state.pipelineList, {id: value})
    this.setState({
      confirmationDialogOpen: true,
      assignPipeline: pipe.name,
      assignPipelineId: value,
    })
  }
  onConfirmationDialogClose() {
    this.setState({
      confirmationDialogOpen: false,
      assignPipeline: '',
      assignPipelineId: -2,
    })
  }
  openNewPipeDialog() {
    this.setState({
      newPipeDialogOpen: true,
    })
  }

  onNewPipeDialogClose() {
    this.setState({
      newPipeDialogOpen: false,
    })
  }

  onNewPipeDialogSave(id) {
    this.setState({
      assignPipelineId: id
    }, () => {
      this.onNewPipeDialogClose()
      this.addTestsToPipe()
    })
  }

  renderNewPipelineDialog() {
    let {newPipelineDialogOpen} = this.state
    let props = {
      open: newPipelineDialogOpen,
      onClose: this.onNewPipeDialogClose.bind(this),
      maxWidth: "md",
      fullWidth: true,
    }

    return newPipelineDialogOpen && (
      <Dialog {...props}
          aria-labelledby="newPipeline-dialog-title"
          aria-describedby="newPipeline-dialog-description">
          <DialogTitle id="newPipeline-dialog-title">
              New Pipeline
          </DialogTitle>
          <DialogContent id="newPipeline-dialog-description">
              <AutomatedTestPipelineEdit
                  fullWidth
                  inDialog
                  pipeline={null}
                  onSave={this.onNewPipelineDialogSave.bind(this)}
                  onClose={this.onNewPipelineDialogClose.bind(this)}/>
          </DialogContent>
      </Dialog>
    )
  }

  addTestsToPipe() {
    let {assignPipelineId, selectedTests} = this.state
    axios({
        method: "POST",
        url: Api.getBaseUrl() + Api.ENDPOINTS.AddTestsToPipe + '?pipelineId=' + assignPipelineId,
        data: JSON.stringify(selectedTests),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
      this.onConfirmationDialogClose()
      this.unselectAll()
      this.fetchPipelinesList()
      this.showSnackbar('Tests successfully added to pipeline', 'success')
    })
    .catch(err => {
      this.showSnackbar('Something went wrong', 'error')
    })
  }

  setComponentToTests() {
    let {assignProductComponentId, selectedTests, filters} = this.state
    axios({
      method: "POST",
      url: Api.getBaseUrl() + Api.ENDPOINTS.SetAutomatedComponentToTests + '?productComponentId=' + assignProductComponentId,
      data: JSON.stringify(selectedTests),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => {
      this.onSetComponentConfirmationDialogClose()
      this.unselectAll()
      this.fetchSuggestedComponentList()
      this.showSnackbar('Component successfully added to selected tests', 'success')
      this.fetchFilteredAutomatedTests(filters)
    })
    .catch(err => {
      this.showSnackbar('Something went wrong', 'error')
    })
  }

  renderConfirmationDialog() {
    let {confirmationDialogOpen, assignPipeline} = this.state
    let props = {
      open: confirmationDialogOpen,
      onClose: this.onConfirmationDialogClose.bind(this),
      maxWidth: "md",
    }

    return confirmationDialogOpen && (
      <Dialog {...props}
          aria-labelledby="addToPlan-dialog-title"
          aria-describedby="addToPlan-dialog-description">
          <DialogTitle id="addToPlan-dialog-title">
              Add to pipe
          </DialogTitle>
          <DialogContent id="addToPlan-dialog-description">
              {`Are you sure you want to add tests to ${assignPipeline}?`}
          </DialogContent>
          <DialogActions style={{ padding: '16' }}>
              <Button
                  onClick={this.onConfirmationDialogClose.bind(this)}
                  className="globalButton"
                  type="submit"
                  variant="contained"
                  color='secondary'>
                  {'No'}
              </Button>
              <Button
                  onClick={this.addTestsToPipe.bind(this)}
                  className="globalButton"
                  type="submit"
                  variant="contained"
                  color='primary'>
                  {'Yes'}
              </Button>
          </DialogActions>
      </Dialog>
    )
  }

  renderSetComponentConfirmationDialog() {
    let {setComponentConfirmationDialogOpen, assignProductComponentName} = this.state
    let props = {
      open: setComponentConfirmationDialogOpen,
      onClose: this.onSetComponentConfirmationDialogClose.bind(this),
      maxWidth: "md",
    }

    return setComponentConfirmationDialogOpen && (
        <Dialog {...props}
                aria-labelledby="addToPlan-dialog-title"
                aria-describedby="addToPlan-dialog-description">
          <DialogTitle id="addToPlan-dialog-title">
            Set component to
          </DialogTitle>
          <DialogContent id="addToPlan-dialog-description">
            {`Are you sure you want to set component ${assignProductComponentName} to selected tests?`}
          </DialogContent>
          <DialogActions style={{ padding: '16' }}>
            <Button
                onClick={this.onSetComponentConfirmationDialogClose.bind(this)}
                className="globalButton"
                type="submit"
                variant="contained"
                color='secondary'>
              {'No'}
            </Button>
            <Button
                onClick={this.setComponentToTests.bind(this)}
                className="globalButton"
                type="submit"
                variant="contained"
                color='primary'>
              {'Yes'}
            </Button>
          </DialogActions>
        </Dialog>
    )
  }
  
  fetchFilteredAutomatedTests(filters) {
    let rowsPerPage = JSON.parse(JSON.stringify(this.state.rowsPerPage));
    let page = JSON.parse(JSON.stringify(this.state.page));
    let parsedFilters = JSON.parse(JSON.stringify(filters));
    let newState = {};

    if (parsedFilters.component1) {
      parsedFilters.component1 = parsedFilters.component1.id;
    }
    if (parsedFilters.component2) {
      parsedFilters.component2 = parsedFilters.component2.id;
    }
    if (parsedFilters.component3) {
      parsedFilters.component3 = parsedFilters.component3.id;
    }
    if (parsedFilters.component4) {
      parsedFilters.component4 = parsedFilters.component4.id;
    }
    if (parsedFilters.component5) {
      parsedFilters.component5 = parsedFilters.component5.id;
    }
    if (parsedFilters.component6) {
      parsedFilters.component6 = parsedFilters.component6.id;
    }

    if (parsedFilters.loading) {
      delete parsedFilters.loading;
    }

    cancel && cancel();

    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.GetFilteredAutomatedTests}?filter=${JSON.stringify(parsedFilters)}&size=${rowsPerPage}&page=${page}&sort=name,DESC`, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c;
      })
    })
      .then(res => {
        filters.loading = false;
        newState.automatedTestsList = res.data.content;
        newState.filters = filters;
        newState.isLoading = false;
        newState.errorMessage = false;
        newState.page = res.data.pageable.pageNumber;
        newState.totalPages =  res.data.totalPages
        newState.totalElements =  res.data.totalElements
        if (newState.automatedTestsList.length === 1 && newState.automatedTestsList[0] && newState.automatedTestsList[0].id && this.state.expandTest) {
          newState.expandedTests = [newState.automatedTestsList[0].id];
          newState.expandTest = false;
        }
        this.setState(newState)
      })
      .catch(err => {
        filters.loading = false;
        this.setState({
          automatedTestsList: [],
          filters,
          isLoading: false,
          errorMessage: true,
        })
      })
  }

  fetchCurrentUser() {
    this.setState({
      currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
    })
  }

  componentDidUpdate() {
    let { currentUser } = this.state
    if (!currentUser || currentUser === {}) {
      this.fetchCurrentUser()
    }
  }



  handleCheckbox(id) {
    let { selectedTests } = this.state
    if (selectedTests.indexOf(id) !== -1) {
      selectedTests.splice(selectedTests.indexOf(id), 1)
    } else {
      selectedTests.push(id)
    }
    this.setState({
      selectedTests,
      select: selectedTests.length !== this.state.automatedTestsList.length ? true : false,
    })
  }

  selectAll() {
    let { automatedTestsList } = this.state
    let selectedTests = automatedTestsList.map(test => test.id)
    this.setState({
      selectedTests,
      select: false,
    })
  }

  unselectAll() {
    this.setState({
      selectedTests: [],
      select: true,
    })
  }
  openNewPipelineDialog() {
    this.setState({
      newPipelineDialogOpen: true,
    })
  }

  onNewPipelineDialogClose() {
    this.setState({
      newPipelineDialogOpen: false,
    })
  }
  onNewPipelineDialogSave(id) {
    this.setState({
      assignPipelineId: id
    }, () => {
      this.onNewPipelineDialogClose()
      this.addTestsToPipe()
    })
  }
  handleOnChange(ev) {
        if (ev.target.value === -1) {
      this.openNewPipelineDialog(ev)
    } else {
      this.openConfirmationDialog(ev)
    }
  }

  onSetComponentConfirmationDialogClose() {
    this.setState({
      setComponentConfirmationDialogOpen: false,
      assignProductComponentName: '',
      assignProductComponentId: -2,
      assignProductComponent: null,
      isSetComponentOpen: false,
    })
  }

  onSetComponentsChange(item) {
    let {assignComponentList} = this.state;
    let productComponent = _.find(this.state.assignComponentList, {id: item.id})

    if (!productComponent) {
      assignComponentList.push(item)
    }

    this.setState({
      setComponentConfirmationDialogOpen: true,
      assignProductComponentName: item.name,
      assignProductComponentId: item.id,
      assignProductComponent: item,
      isSetComponentOpen: false,
      assignComponentList,
    });
  }

  onSetComponentOpen() {
    this.setState({
      isSetComponentOpen: true,
    })
  }

  onHelpClick = filter => event => {
    let value = this.state[filter]
    this.setState({
      [filter]: !value
    })
  }
  updateSnackBarAutomatedTestInfo = (originalTestIndex, testEdit) => {
    let newState = { automatedTestsList: [] };
    newState.automatedTestsList = this.state.automatedTestsList
    newState.automatedTestsList[originalTestIndex] = testEdit;
    this.setState(newState)
  };

  deleteByPipelineAndCase(automatedTestCaseId, pipelineId) {
    axios.delete(Api.getBaseUrl() + Api.ENDPOINTS.DeleteTestCaseFromPipeline + `?pipelineId=${pipelineId}&testCaseId=${automatedTestCaseId}`)
      .then(res => {
				this.setState({
					isLoading: true
				}, () => this.fetchFilteredAutomatedTests(this.state.filters))
        this.showSnackbar('Test removed from pipeline', 'success')
      })
  }

  renderTestsList() {
    let { classes } = this.props;
    let {
      expandedTests,
      automatedTestsList,
      selectedTests,
      select,
      expandedRun,
      filters,
      page,
      rowsPerPage,
    } = this.state

    return (
      <div style={{ marginTop: 10}}>
        {

          automatedTestsList && automatedTestsList.map((test, index) => {

              return (

                <div key={index} className="manualTestListItem" >
                  <div className="manualTestListSummary">
                    <Checkbox
                      id="testCheckbox"
                      checked={selectedTests.indexOf(test.id) !== -1}
                      onClick={this.handleCheckbox.bind(this, test.id)}
                      color='default' />

                    <div className="manualTestListText" onClick={this.handleExpantion.bind(this, test.id, false)}>
                      <div style={{ alignSelf: 'center', flexDirection: "column", padding: '7px 0', flex: 1 }}>
                        <span style={{ fontWeight: 'bold', fontSize: "1.2em" }}>{test.name}</span>

                        <SnackBarAutomatedTestInfo key={'testInfo' + index} testTriageList={test.testTriageDTOList} classes={classes} />
                      </div>

                    </div>
                    <div style={{width: 48}}>
                  {
                    filters.pipeline !== null && (
                        <Tooltip
                          classes={{
                            tooltip: classes.tooltip,
                            popper: classes.popper,
                          }} title="Remove from pipeline"
                          style={{display: "flex"}}>
                          <IconButton onClick={this.deleteByPipelineAndCase.bind(this, test.id, filters.pipeline)}>
                              <RemoveIcon style={{color: "red"}} />
                          </IconButton>
                        </Tooltip>
                    )
                  }
                  </div>
                  </div>

                  {
                    expandedTests.indexOf(test.id) !== -1 && (
                      <div className="manuaTestListCollapse">
                        <AutomatedTestEdit
                          test={test} updateSnackBarAutomatedTestInfo={this.updateSnackBarAutomatedTestInfo}
                          originalTestIndex={index}
                          currentUser={this.state.currentUser}
                          onClose={this.handleExpantion.bind(this)} />
                      </div>
                    )
                  }

                </div>
              )
            })
        }
        {automatedTestsList &&
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', color: '#A5A6A4' }}>
            {automatedTestsList.length > 0 && <div>{'Total tests: ' + automatedTestsList.length}</div>}
            
            {automatedTestsList.length >= 200 && <div>Improve your filters to find more test cases</div>}
            <TablePagination
            component="div"
            count={this.state.totalElements}
            page={this.state.page}
            onChangePage={this.onPageChange}
            rowsPerPage={this.state.rowsPerPage}
            rowsPerPageOptions={[25, 50, 75, 200]}
            onChangeRowsPerPage={this.onRowsPerPageChange}
          />
          </div>
        }

      </div>
                                  
    )
  }


  handleExpantion(id, fetchData = false) {
    let { expandedTests } = this.state
    let index = expandedTests.indexOf(id)
    if (index !== -1) {
      expandedTests.splice(index, 1)
      if (fetchData) {
        this.setState({
          isLoading: true
        }, () => this.fetchFilteredAutomatedTests(this.state.filters))
      }
    }
    else {
      expandedTests.push(id)
    }
    this.setState({
      expandedTests,
    })
  }

  showSnackbar(msg, variant) {
    this.setState({ openSnackbar: true, snackbarMsg: msg, snackbarVariant: variant });
  };

  hideSnackbar() {
    this.setState({
      openSnackbar: false,
      snackbarMsg: '',
    })
  }

  onPageChange = (event, page) => {
    this.setState({
      page:page,
      isLoading: true
    }, () => this.fetchFilteredAutomatedTests(this.state.filters))
  }

  onRowsPerPageChange = event => {
    this.setState({ 
      rowsPerPage: event.target.value,
      page: 0,
      isLoading: true
    }, () => this.fetchFilteredAutomatedTests(this.state.filters));
  }
  fetchPipelinesList() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetPipelineList)
      .then(res => {
        this.setState({
          pipelineList: [{id: -2, name: 'Select', hide: true}].concat([{id: -1, name: 'Create Pipeline', hasIcon: true}]).concat(res.data),
        })
      })
  }

  fetchSuggestedComponentList() {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SuggestedDefaultAutomatedComponents}`)
        .then(res => {
          this.setState({
            assignComponentList: [{id: -2, name: 'Select', hide: true}].concat(res.data.content),
          })
        })
  }

 handlePopoverOpen(element) {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen,
      popoverElement: element
    })
 }

  handleLogsModalOpen(){
    this.setState({
      isLogsModalOpen: !this.state.isLogsModalOpen,
      isPopoverOpen: false
    })
  }

  handleTestsModalOpen(){
    this.setState({
      isTestsModalOpen: !this.state.isTestsModalOpen,
      isPopoverOpen: false
    })
  }

 handlePopoverClose(){
    this.setState({
      isPopoverOpen: false,
      isLoading: false
    })
 }

  importLogs = (ev, productId) => {
    let reader = new FileReader()
    let this1 = this;
    if (ev.target.files.length > 0) {
      reader.readAsDataURL(ev.target.files[0])
      reader.onloadend = function () {
        this1.setState({
          fileReport: reader.result,
          importingTests: true,
        }, () => {
          axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.EventExecutionImportLogs+"?productId="+productId,
            data: this1.state.fileReport,
            headers: {
              'Content-Type': 'application/json'
            },
          })
              .then(res => {
                this1.setState({
                  importingTests: false,
                  isLoading: true
                }, () => {
                  this1.handlePopoverClose(undefined)
                  this1.handleLogsModalOpen()
                  this1.showSnackbar("Log file successfully uploaded.", 'success')
                })

              })
              .catch(error => {
                this1.setState({
                  importingTests: false,
                })
                this1.showSnackbar('An error has occurred. Try again later.', 'error')
              })
        })
      }
    }
    ev.target.value = ''
  }

  importReport = ev => {
    let reader = new FileReader()
    let this1 = this;
    if (ev.target.files.length > 0) {
      reader.readAsDataURL(ev.target.files[0])
      reader.onloadend = function () {
        this1.setState({
          fileReport: reader.result,
          importingTests: true,
        }, () => {
          axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.AutomationImportReport,
            data: this1.state.fileReport,
            headers: {
              'Content-Type': 'application/json'
            },
          })
            .then(res => {
              this1.setState({
                importingTests: false,
                isLoading: true
              }, () => {
                this1.fetchFilteredAutomatedTests(this1.state.filters)
                this1.renderTestsList()
                this1.handlePopoverClose(undefined)
                this1.showSnackbar('Test message, file uploaded', 'success')
              })

            })
            .catch(error => {
              this1.setState({
                importingTests: false,
              })
              this1.showSnackbar('An error has occurred. Try again later.', 'error')
            })
        })
      }
    }
    ev.target.value = ''
  }

  renderSnackbar() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={this.state.openSnackbar}
        autoHideDuration={2000}
        onClose={this.hideSnackbar.bind(this)}
      >
        <MySnackbarContentWrapper
          onClose={this.hideSnackbar.bind(this)}
          variant={this.state.snackbarVariant}
          message={this.state.snackbarMsg}
        />

      </Snackbar>

    )
  }

  fetchQuery = _.debounce((filters) => { this.fetchFilteredAutomatedTests(filters) }, 2000)


  render() {
    let {
      currentUser,
      automatedTestsList,
      isLoading,
      filters,
      loading,
      select,
      helpEnabled,
      selectedTests,
      selete,
      page,
      rowsPerPage,
      assignPipelineId,
      pipelineList,
      errorMessage,
      isLogsModalOpen,
      isTestsModalOpen,
      defaultItemsComponent1,
      defaultItemsComponent2,
      defaultItemsComponent3,
      defaultItemsComponent4,
      defaultItemsComponent5,
      defaultItemsComponent6,
      assignProductComponent,
      assignProductComponentId,
      assignComponentList,
      isSetComponentOpen
    } = this.state;
    let { classes } = this.props;
  
    return (
      <div className="homeRoot" >
        {this.renderConfirmationDialog()}
        {this.renderNewPipelineDialog()}
        {this.renderSetComponentConfirmationDialog()}
        {this.renderSnackbar()}
        <Nav
          id="automatedTestsHeader"
          helpEnabled={helpEnabled}
          helpItems={this.helpItems}
          screen={'testRepository'}
          title={'Test Repository'}
          onHelpClick={this.onHelpClick.bind(this)}
        />

        <main style={{ minHeight: 'calc(100vh - 179px)' }}>
          <div style={{ padding: '0 30 30 30' }}>
            <Grid container style={{marginTop: helpEnabled ? 247 : 100}}>
              <Grid item xs={12} md={2} sm={3}>

                <AutomatedTestFilters
                    filters={filters}
                    defaultItemsComponent1={defaultItemsComponent1}
                    defaultItemsComponent2={defaultItemsComponent2}
                    defaultItemsComponent3={defaultItemsComponent3}
                    defaultItemsComponent4={defaultItemsComponent4}
                    defaultItemsComponent5={defaultItemsComponent5}
                    defaultItemsComponent6={defaultItemsComponent6}
                    loading={loading}
                    pipelineList={this.state.pipelineList}
                    assignComponentList={this.state.assignComponentList}
                    filterTests={(filters) => {
                      this.setState({
                        isLoading: true,
                        page: 0
                      }, () => this.fetchQuery(filters))
                    }}
                    fetchDefaultComponents={this.fetchDefaultComponents.bind(this)}/>

              </Grid>
              <Grid item xs={12} md={10} sm={9}>
                <div className="AutomatedTestRepositoryToolbar">
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    {
                      automatedTestsList && automatedTestsList.length > 0 && [
                        <div key={`firstElement-${automatedTestsList.id}`}
                             className="TestRepositorySelectAll"
                             onClick={select ? this.selectAll.bind(this) : this.unselectAll.bind(this)}>
                          <Checkbox
                              id="testCheckbox"
                              checked={!select}
                              color='default'/>
                          <div>
                            All
                          </div>
                        </div>
                      ]
                    }
                    <AutomatedTestNameFilter
                        automatedTestsList={automatedTestsList}
                        filters={filters}
                        filterTests={(filters) => {
                          this.setState({
                            isLoading: true,
                            page: 0
                          }, () => this.fetchQuery(filters))
                        }}
                    />
                  </div>
                  <div className="AutomatedTestRepositoryToolbarActions">
                    {
                      automatedTestsList && automatedTestsList.length > 0 && [
                        <Tooltip
                            title="Please, select some test to add to a pipeline"
                            classes={{
                              tooltip: classes.tooltip,
                              popper: classes.popper,
                            }}
                            placement="top"
                        >
                          <div key={`secondElement-${automatedTestsList.id}`}
                               className="manualTestListFiltersContainer TestRepositorySelectAllAddTo"
                               style={{opacity: selectedTests.length === 0 && '0.5', marginTop: 0}}>
                            <div style={{textTransform: 'uppercase'}}><b>Add to</b></div>
                            <TextField
                                id="addTo"
                                select
                                value={assignPipelineId ? assignPipelineId : -2}
                                disabled={selectedTests.length === 0}
                                InputProps={{
                                  disableUnderline: true,
                                  style: {
                                    fontSize: '.875rem',
                                    color: COLORS.primary,
                                    paddingLeft: 20,
                                    paddingTop: 2,
                                    borderRadius: 3,
                                    border: 'none',
                                    fontWeight: "bold"
                                  }
                                }}
                                SelectProps={{
                                  classes: {
                                    icon: classes.selectIcon
                                  },
                                  IconComponent: () => <KeyboardArrowDown/>
                                }}
                                onChange={this.handleOnChange.bind(this)}>
                              {(pipelineList && pipelineList.length) && pipelineList.map(p => (
                                  <MenuItem
                                      className={`globalMenuItem ${p.hide ? 'menuItemHidden' : ''} ${p.hasIcon ? 'menuItemHasIcon' : ''}`}
                                      key={p.id} value={p.id}>
                                    {p.hasIcon &&
                                    <AddCircleIcon className={"itemIcon"} style={{fill: COLORS.primary}}/>}
                                    {p.name}
                                  </MenuItem>
                              ))}
                            </TextField>
                          </div>
                        </Tooltip>,

                        <div key={`thirdElement-${automatedTestsList.id}`}
                             className="manualTestListFiltersContainer TestRepositorySelectAllAddTo"
                             style={{opacity: selectedTests.length === 0 && '0.5', marginTop: 0}}>
                          <Tooltip
                              title='Please, select some test cases to add them a component'
                              classes={{
                                tooltip: classes.tooltip,
                                popper: classes.popper,
                              }}
                              placement='top'>
                            <div style={{textTransform: 'uppercase'}}><b>Set component</b></div>
                          </Tooltip>

                          {!isSetComponentOpen &&
                          <TextField
                              id="setComponentTo"
                              select
                              value={assignProductComponentId ? assignProductComponentId : -2}
                              disabled={selectedTests.length === 0}
                              InputProps={{
                                disableUnderline: true,
                                style: {
                                  fontSize: '.875rem',
                                  color: COLORS.primary,
                                  paddingLeft: 20,
                                  paddingTop: 2,
                                  borderRadius: 3,
                                  border: 'none',
                                  fontWeight: "bold",
                                  width: 'fit-content',
                                }
                              }}
                              SelectProps={{
                                classes: {
                                  icon: classes.selectIcon
                                },
                                IconComponent: () => <KeyboardArrowDown/>
                              }}
                              onClick={() => {
                                if (selectedTests.length !== 0) {
                                  this.onSetComponentOpen.bind(this)()
                                }
                              }}
                          >
                            {(assignComponentList && assignComponentList.length) && assignComponentList.map(c => (
                                <MenuItem
                                    className={`globalMenuItem ${c.hide ? 'menuItemHidden' : ''}`}
                                    key={c.id} value={c.id}>
                                  {c.name}
                                </MenuItem>
                            ))}
                          </TextField>
                          }

                          {isSetComponentOpen &&
                          <SetAutomatedComponentPicker
                              id='setAutomatedComponent'
                              selectedItem={assignProductComponent}
                              border='none'
                              onChange={this.onSetComponentsChange.bind(this)}
                              onBlur={() => this.setState({isSetComponentOpen: false})}
                              disabled={selectedTests.length === 0}
                              className="setComponentsPicker-container"
                          />
                          }

                        </div>
                      ]
                    }

                    <ImportFilesPopover importReport={this.importReport}
                                        importLogs={this.importLogs}
                                        isPopoverOpen={this.state.isPopoverOpen}
                                        popoverElement={this.state.popoverElement}
                                        handlePopoverClose={this.handlePopoverClose.bind(this)}
                                        handlePopoverOpen={this.handlePopoverOpen.bind(this)}
                                        handleLogsModalOpen={this.handleLogsModalOpen.bind(this)}
                                        handleTestsModalOpen={this.handleTestsModalOpen.bind(this)}/>

                  </div>
                </div>

                {
                  isLoading && (
                    <div className="circularProgressContainer" style={{ position: 'absolute', zIndex: '1000', left: '50%' }}>
                      <CircularProgress disableShrink={true} color="primary" />
                    </div>
                  )
                }
                {automatedTestsList && automatedTestsList.length === 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: "40px", padding: '40px 40px 40px 40px' }} >
                    <h2 className="noRowsSuites">
                      {
                        !errorMessage ?
                          "No tests found"
                          : "Something went wrong"
                      }
                    </h2>
                  </div>
                )}
                {
                  automatedTestsList && automatedTestsList.length > 0 && (

                    <div style={isLoading ? { opacity: 0.6 } : {}}>
                      {this.renderTestsList()}
                    </div>
                  )
                }
                {
                  isLogsModalOpen && (
                      <ImportLogs open={isLogsModalOpen} handleLogsModalOpen={this.handleLogsModalOpen.bind(this)} importLogs={this.importLogs}/>
                  )
                }
                {
                  isTestsModalOpen && (
                      <ImportTests open={isTestsModalOpen} handleTestsModalOpen={this.handleTestsModalOpen.bind(this)} importReport={this.importReport}/>
                  )
                }


              </Grid>
            </Grid>

          </div>
        </main>
        <CopyrightFooter helpEnabled={helpEnabled} />
      </div>
    )
  }
}

export default withStyles(styles)(AutomatedTestRepository)
