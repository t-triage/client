import React, { Component } from 'react';
import Api from "../Components/Api"
import axios from 'axios'
import { _ } from 'underscore'
import queryString from 'query-string';

import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Checkbox from "@material-ui/core/Checkbox"
import TextField from "@material-ui/core/TextField"
import DialogTitle from "@material-ui/core/DialogTitle"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import MenuItem from "@material-ui/core/MenuItem"
import CircularProgress from "@material-ui/core/CircularProgress"
import Snackbar from '@material-ui/core/Snackbar'
import Grid from '@material-ui/core/Grid'

import ClearIcon from "@material-ui/icons/Clear"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import CloudUploadIcon from "@material-ui/icons/CloudUpload"
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown"
import RemoveIcon from "@material-ui/icons/RemoveCircle"

import TablePagination from '@material-ui/core/TablePagination';
import Nav from "../Components/Nav"
import ManualTestEdit from './TestEditForm'
import ManualTestFilters from '../Components/ManualTestFilters'
import ManualTestNameFilter from '../Components/ManualTestNameFilter'
import ManualTestPlanEdit from '../Components/ManualTestPlanEdit'
import CopyrightFooter from "../Components/CopyrightFooter"
import { withStyles } from '@material-ui/core/styles'
import { scrollToTop } from '../../Admin/AdminUtils'
import {
    styles,
    COLORS,
    DEFAULT_MANUAL_TEST_FILTERS,
    TEST_PLAN_STATUS_ALL,
    snackbarStyle,
    MySnackbarContent,
    WIKI_URL
} from '../Components/Globals'
import {ShareTestButton} from "../Components/ShareTestButton";
import {TestListItem} from "./TestListItem";
import {TestList} from "./TestList";

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

const CancelToken = axios.CancelToken;
let cancel;

export let show = {
    name: true,
    product: true,
    component: true,
    functionality: true,
    priority: true,
    readyAT: true,
    suiteType: true,
    lifecycle: true,
    techniques: true,
    description: true,
    requirements: true,
    steps: true,
    stepsData: true,
    stepsExpected: true,
    stepsHeader: true,
}

class TestRepository extends Component {

    constructor(props) {
        super(props);

        let searchParams = queryString.parse(props.location.search);
        let initFilters = searchParams ? _.extend(DEFAULT_MANUAL_TEST_FILTERS, searchParams) : DEFAULT_MANUAL_TEST_FILTERS;

        this.state = {
            currentUser: null,
            newTestOpen: false,
            errorMessage: false,
            manualTestsList: null,
            isLoading: false,
            helpEnabled: false,
            expandedTests: [],
            selectedTests: [],
            testPlanList: [],
            expandTest: searchParams && searchParams.expandTest,
            select: true,
            assignPlan: '',
            assignPlanId: -2,
            expandedRun: null,
            filters: initFilters,
            defaultItemsComponent1: null,
            defaultItemsComponent2: null,
            defaultItemsComponent3: null,
            loading: false,
            fileReport: null,
            openSnackbar: false,
            snackbarMsg: '',
            snackbarVariant: '',
            importingTests: false,
            totalElements: 0,
            totalPages: 0,
            rowsPerPage: null,
            page: 0,
            };
        this.helpItems= [
            [
                {
                    title: 'PAGE GOAL',
                    text: 'Manage Manual Tests'
                },
                {
                    title: 'USER ACTION',
                    text: 'Create, Edit and Add test cases to a Test Plan'
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
        }, () => this.fetchFilteredManualTests(this.state.filters), scrollToTop())
    this.fetchTestPlanList()
  }

  fetchTestPlanList() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestPlanList)
      .then(res => {
        this.setState({
          testPlanList: [{id: -2, name: 'Select', hide: true}].concat([{id: -1, name: 'Create new', hasIcon: true}]).concat(res.data.content),
        })
      })
  }

    fetchDefaultComponents(type, id) {
        let { filters } = this.state,
      params = 'default=true',
            responseField = 'defaultItemsComponent1',
            endpoint = Api.ENDPOINTS.SearchProductComponents,
            url;

        if (type === 'component1') {
            params= `${type}=${id}`;
            responseField = 'defaultItemsComponent2';
            endpoint = Api.ENDPOINTS.SuggestProductComponents
        }
        else if (type === 'component2') {
            params= `component1=${filters.component1 ? filters.component1.id : null}`;
            params+= `&${type}=${id}`;
            responseField = 'defaultItemsComponent3';
            endpoint = Api.ENDPOINTS.SuggestProductComponents
        }

        url = `${endpoint}?${params}`;

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

  fetchFilteredManualTests(filters) {
    let parsedFilters = JSON.parse(JSON.stringify(filters));
    let newState = {};
    let { page, rowsPerPage } = this.state
    if (parsedFilters.component1) {
            parsedFilters.component1 = parsedFilters.component1.id;
        }
        if (parsedFilters.component2) {
            parsedFilters.component2 = parsedFilters.component2.id;
        }
        if (parsedFilters.component3) {
            parsedFilters.component3 = parsedFilters.component3.id;
        }
        if (parsedFilters.loading) {
            delete parsedFilters.loading;
        }

        cancel && cancel();

    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.GetFilteredManualTests}?filter=${JSON.stringify(parsedFilters)}&size=${rowsPerPage}&page=${page}&sort=name,asc`, {
            cancelToken: new CancelToken(function executor(c) {
                // An executor function receives a cancel function as a parameter
                cancel = c;
            })
        })
      .then(res => {
        filters.loading = false;

                newState.manualTestsList = res.data.content;
                newState.filters = filters;
                newState.isLoading = false;
                newState.errorMessage = false;
                newState.page = res.data.pageable.pageNumber;
                newState.totalPages = res.data.totalPages;
                newState.totalElements = res.data.totalElements;
                if (newState.manualTestsList.length === 1 && newState.manualTestsList[0] && newState.manualTestsList[0].id && this.state.expandTest) {
                    newState.expandedTests = [newState.manualTestsList[0].id];
                    newState.expandTest = false;
                }

                console.log(res)
                this.setState(newState)
      })
      .catch(err => {
                filters.loading = false;
        this.setState({
          manualTestsList: [],
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
    let {currentUser} = this.state
    if (!currentUser || currentUser === {}) {
      this.fetchCurrentUser()
    }
  }

  getTestMainStep(test) {
    let mainStep = _.find(test.steps, {id: test.mainStepId})
    return mainStep ? mainStep.expectedResult : ''
  }



  selectAll() {
    let {manualTestsList} = this.state
    let selectedTests = manualTestsList.map(test => test.id)
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

  handleOnChange(ev) {
    if (ev.target.value === -1) {
      this.openNewPlanDialog(ev)
    } else {
      this.openConfirmationDialog(ev)
    }
  }

  openConfirmationDialog(ev) {
    let {value} = ev.target
    let plan = _.find(this.state.testPlanList, {id: value})
    this.setState({
      confirmationDialogOpen: true,
      assignPlan: plan.name,
      assignPlanId: value,
    })
  }

  onConfirmationDialogClose() {
    this.setState({
      confirmationDialogOpen: false,
      assignPlan: '',
      assignPlanId: -2,
    })
  }

  openNewPlanDialog() {
    this.setState({
      newPlanDialogOpen: true,
    })
  }

  onNewPlanDialogClose() {
    this.setState({
      newPlanDialogOpen: false,
    })
  }

  onNewPlanDialogSave(id) {
    this.setState({
      assignPlanId: id
    }, () => {
      this.onNewPlanDialogClose(),
      this.addTestsToPlan()
    })
  }

  onPageChange = (event, page) => {
    this.setState({
        page: page,
        isLoading: true
    }, () => this.fetchFilteredManualTests(this.state.filters))
  }

  onRowsPerPageChange = event => {
    this.setState({
        rowsPerPage: event.target.value,
        page: 0,
        isLoading: true},
        () => this.fetchFilteredManualTests(this.state.filters));
  }

  addTestsToPlan() {
    let {assignPlanId, selectedTests} = this.state
    axios({
        method: "POST",
        url: Api.getBaseUrl() + Api.ENDPOINTS.AddTestsToPlan + '?manualTestPlanId=' + assignPlanId,
        data: JSON.stringify(selectedTests),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
      this.onConfirmationDialogClose()
      this.unselectAll()
      this.fetchTestPlanList()
      this.showSnackbar('Tests succesfully added to plan', 'success')
    })
    .catch(err => {
      this.showSnackbar('Something went wrong', 'error')
    })
  }

  deleteExecution(manualTestCaseId, manualTestPlanId) {
    axios.delete(Api.getBaseUrl() + Api.ENDPOINTS.deleteExecutionByPlanAndCase + `?manualTestCaseId=${manualTestCaseId}&manualTestPlanId=${manualTestPlanId}`)
      .then(res => {
                this.setState({
                    isLoading: true
                }, () => this.fetchFilteredManualTests(this.state.filters))
        this.showSnackbar('Test removed from plan', 'success')
      })
  }

    onHelpClick = filter => event => {
        let value = this.state[filter]
        this.setState({
            [filter]: !value
        })
    }

  renderNewPlanDialog() {
    let {newPlanDialogOpen} = this.state
    let props = {
      open: newPlanDialogOpen,
      onClose: this.onNewPlanDialogClose.bind(this),
      maxWidth: "md",
      fullWidth: true,
    }

    return newPlanDialogOpen && (
      <Dialog {...props}
          aria-labelledby="newPlan-dialog-title"
          aria-describedby="newPlan-dialog-description">
          <DialogTitle id="newPlan-dialog-title">
              New Plan
          </DialogTitle>
          <DialogContent id="newPlan-dialog-description">
              <ManualTestPlanEdit
                  fullWidth
                  inDialog
                  onSave={this.onNewPlanDialogSave.bind(this)}
                  onClose={this.onNewPlanDialogClose.bind(this)}/>
          </DialogContent>
      </Dialog>
    )
  }

  renderConfirmationDialog() {
    let {confirmationDialogOpen, assignPlan} = this.state
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
              Add to plan
          </DialogTitle>
          <DialogContent id="addToPlan-dialog-description">
              {`Are you sure you want to add tests to ${assignPlan}?`}
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
                  onClick={this.addTestsToPlan.bind(this)}
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



  // RETURN DE LOS TEST
  renderTestsList() {
    let {classes} = this.props;
    let {manualTestsList,
        selectedTests,
        expandedTests,
        filters
    } = this.state

    return (
      <div style={{ marginTop: 10 }}>
        {

          <TestList testList={manualTestsList} selectedTests={selectedTests}
                    expandedTests={expandedTests} filters={filters} classes={classes}
                    that={this}/>
        }
                {manualTestsList &&
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', color: '#A5A6A4' }}>
                        {manualTestsList.length > 0 && <div>{'Total tests: ' + manualTestsList.length}</div>}
                        {manualTestsList.length >= 200 && <div>Improve your filters to find more test cases</div>}
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




  openNewTestDialog() {
    this.setState({
      newTestOpen: true,
    })
  }

  onNewTestDialogClose() {
    this.setState({
      newTestOpen: false,
            isLoading: true
    }, () => {
      this.fetchFilteredManualTests(this.state.filters)
    })
  }

  renderAddTestDialog() {
    let {newTestOpen} = this.state;

    return newTestOpen && (
      <Dialog
        open={newTestOpen}
        onClose={this.onNewTestDialogClose.bind(this)}
        maxWidth="xl"
        aria-labelledby="newManualTest-dialog-title"
        aria-describedby="newManualTest-dialog-description">
        <DialogTitle id="newManualTest-dialog-title">New Test</DialogTitle>
        <DialogContent id="newManualTest-dialog-description">
          <ManualTestEdit
              currentUser={this.state.currentUser}
              onClose={this.onNewTestDialogClose.bind(this)}
              fullWidth />
        </DialogContent>
      </Dialog>
    )
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

  importReport = ev => {
    let reader = new FileReader()
    let this1 = this;

    if (ev.target.files.length > 0) {
        reader.readAsDataURL(ev.target.files[0])
        reader.onloadend = function () {
          this1.setState({
            fileReport: reader.result,
            importingTests: true,
          },() => {
            axios({
                method: "POST",
                url: Api.getBaseUrl() + Api.ENDPOINTS.ImportReport,
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
                                this1.fetchFilteredManualTests(this1.state.filters)
                                this1.fetchDefaultComponents();
                                this1.renderTestsList()
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

  fetchQuery = _.debounce((filters) => {this.fetchFilteredManualTests(filters)}, 500)

  render() {
    let {
      currentUser,
      manualTestsList,
            isLoading,
      filters,
            defaultItemsComponent1,
            defaultItemsComponent2,
            defaultItemsComponent3,
            loading,
      select,
            helpEnabled,
      selectedTests,
      selete,
      assignPlanId,
      testPlanList,
      errorMessage,
      importingTests,
    } = this.state;
    let {classes} = this.props;

    return (
      <div className="homeRoot">
        {this.renderAddTestDialog()}
        {this.renderConfirmationDialog()}
        {this.renderNewPlanDialog()}
        {this.renderSnackbar()}
                <Nav
                    id="manualTestsHeader"
                    helpEnabled={helpEnabled}
                    helpItems={this.helpItems}
                    screen={'testRepository'}
                    title={'Test Repository'}
                    onHelpClick={this.onHelpClick.bind(this)}
                />
        <main style={{ minHeight: 'calc(100vh - 179px)' }}>
          <div style={{ padding: '0 30 30 30' }}>
​
​
            <Grid container style={{ marginTop: helpEnabled ? 225 : 78 }}>
              <Grid item xs={12} md={2} sm={3}>
                <div>
                  <ManualTestFilters
                      filters={filters}
                                            defaultItemsComponent1={defaultItemsComponent1}
                                            defaultItemsComponent2={defaultItemsComponent2}
                                            defaultItemsComponent3={defaultItemsComponent3}
                                            loading={loading}
                      testPlanList={this.state.testPlanList}
                                            filterTests={(filters) => {
                                                this.setState({
                                                    isLoading: true//,
                                                    //filters
                                                }, () => this.fetchQuery(filters))
                                            }}
                                            // filterTests={(filters) => {
                                            // 	this.setState({
                                            // 		isLoading: true
                                            // 	}, () => this.fetchFilteredManualTests(filters))
                                            // }}
                                        fetchDefaultComponents={this.fetchDefaultComponents.bind(this)} />
                </div>
              </Grid>
              <Grid item xs={12} md={10} sm={9}>
                <div>
                  <div className="TestRepositoryToolbar" >
                      <div style={{display: "flex", flexDirection: "row"}}>
                        <div style={{display: "flex"}}>
                          {
                            manualTestsList && manualTestsList.length > 0 && [
                              <div key={`firstElement-${manualTestsList.id}`} className="TestRepositorySelectAll" onClick={select ? this.selectAll.bind(this) : this.unselectAll.bind(this)}>
                                <Checkbox
                                  id="testCheckbox"
                                  checked={!select}
                                  color='default' />
                                <div>
                                  All
                                </div>
                              </div>
                            ]
                          }
                        </div>
                        <ManualTestNameFilter
                          filters={filters}
                          filterTests={(filters) => {
                            //this.fetchQuery(filters)
                            this.setState({
                              isLoading: true//,
                              //filters
                            }, () => this.fetchQuery(filters))
                          }}
                        />
                      </div>
                      <div className="TestRepositoryToolbarActions" >
                        {manualTestsList && manualTestsList.length > 0 && (
                          <Tooltip
                            title="Please, select some test to add to a plan"
                            classes={{
                              tooltip: classes.tooltip,
                              popper: classes.popper,
                            }}
                            placement="top"
                          >
                            <div
                              key={`secondElement-${manualTestsList.id}`}
                              className="manualTestListFiltersContainer TestRepositorySelectAllAddTo"
                              style={{ opacity: selectedTests.length == 0 && '0.5', marginTop: 0 }}
                            >
                              <div style={{ textTransform: 'uppercase' }}><b>Add to plan</b></div>
                              <TextField
                                id="addToTestPlanInput"
                                select
                                value={assignPlanId ? assignPlanId : -2}
                                disabled={selectedTests.length == 0}
                                inputProps={{
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
                                  IconComponent: () => <KeyboardArrowDown />
                                }}
                                onChange={this.handleOnChange.bind(this)}>
                                {testPlanList.map(p => (
                                  <MenuItem className={`globalMenuItem ${p.hide ? 'menuItemHidden' : ''} ${p.hasIcon ? 'menuItemHasIcon' : ''}`} key={p.id} value={p.id}>
                                    {p.hasIcon && <AddCircleIcon className={"itemIcon"} style={{ fill: COLORS.primary }} />}
                                    {p.name}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </div>
                          </Tooltip>
                        )}
                        <input
                          accept=".xlsx, .xls"
                          style={{ display: 'none' }}
                          id="raised-button-file"
                          onChange={this.importReport.bind(this)}
                          type="file"
                          />
                        <label htmlFor="raised-button-file" style={{padding: 0}}>
                            <Tooltip title="Import Tests">
                                <Button
                                  variant="contained"
                                  color={'primary'}
                                  component="span"
                                  style={{marginRight: 10, padding: "7.5px 0px", borderRadius: 3, minWidth: 45}} >
                                  <CloudUploadIcon style={{fontSize: 25}} />
                                </Button>
                            </Tooltip>
                        </label>
                        <Button
                            type="button"
                            variant="contained"
                            className="globalButton"
                            onClick={this.openNewTestDialog.bind(this)}
                            color={'primary'}>
                            New Test
                            <AddCircleIcon style={{ fontSize: 20, marginLeft: 8 }} />
                        </Button>
                      </div>

                  </div>

                                    {
                                        isLoading && (
                                            <div className="circularProgressContainer" style={{ position: 'absolute', zIndex: '1000',left: '50%'}}>
                                                <CircularProgress disableShrink={true} color="primary" />
                                            </div>
                                        )
                                    }
                  { manualTestsList && manualTestsList.length === 0 && (
                    <div style={{display: 'flex', justifyContent: 'center', marginTop:"40px", padding: '40px 40px 40px 40px'}} >
                      <h2 className="noRowsSuites">
                        {
                          !errorMessage ?
                            "No tests found"
                          : "Something went wrong"
                        }
                      </h2>
                    </div>
                  ) }
                  {
                      manualTestsList && manualTestsList.length > 0 && !importingTests && (
                      <div style={isLoading ? {opacity:0.6} : {}}>
                        {this.renderTestsList()}
                      </div>
                    )
                  }
                  {
                    importingTests && (
                      <div>
                          <h2 className="noRowsSuites" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop: 50 }}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {"IMPORT IN PROGRESS. PLEASE WAIT A MINUTE."}
                              </span>
                          </h2>
                          <div style={{ marginTop: 150 }} className="circularProgressContainer">
                              <CircularProgress disableShrink={true} color="primary" />
                          </div>
                      </div>
                    )
                  }
                </div>
              </Grid>
            </Grid>
​
          </div>
        </main>
        <CopyrightFooter helpEnabled={helpEnabled} />
      </div>
    )
  }
}

export default withStyles(styles)(TestRepository)
