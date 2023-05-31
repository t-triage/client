import React, { Component } from "react"
import { _ } from "underscore"

// UI Components

import Grid from "@material-ui/core/Grid"
import FilterIcon from "@material-ui/icons/FilterList"
import FormControl from "@material-ui/core/FormControl"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormGroup from "@material-ui/core/FormGroup"
import IconButton from "@material-ui/core/IconButton"
import ListSubheader from "@material-ui/core/ListSubheader"
import SearchIcon from "@material-ui/icons/Search"
import Switch from "@material-ui/core/Switch"
import TextField from "@material-ui/core/TextField"
import Popover from "@material-ui/core/Popover"
import Paper from "@material-ui/core/Paper"
import InputBase from "@material-ui/core/InputBase"
import ClearIcon from "@material-ui/icons/Clear"
import Globals from "./Globals"
import Tooltip from "@material-ui/core/Tooltip"
import { withStyles } from '@material-ui/core/styles'
import { styles } from './Globals'

class SearchUI extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchQuery: this.props.isKanban && localStorage.getItem("searchKanban") ? localStorage.getItem("searchKanban") : localStorage.getItem("searchSuite") && !this.props.isKanban ?  localStorage.getItem("searchSuite") : "",
            jobsSearchMenuElement: null,
            filterByFailures: localStorage.getItem("filterByFailures") == "true" ? true : false,
            filterBySuiteName: localStorage.getItem("searchSuite"),
            filterByOwnAssigned: localStorage.getItem("filterByOwnAssigned") == "true" ? true : false,
            filterByAssignedToMe: localStorage.getItem("filterByAssignedToMe") == "false" ? false : true,
            filterByDisabled: localStorage.getItem("filterByDisabled") == "false" ? false : true,
            filterByPinned: localStorage.getItem("filterByPinned") == "true" ? true : false,
            sortBySuiteAutomation: localStorage.getItem("sortBySuiteAutomation") == "true" ? true : false,
            sortBySuite: localStorage.getItem("sortBySuite") == "true" ? true : false,
            sortByOlderFirst: localStorage.getItem("sortByOlderFirst") == "true" ? true : false,
            sortByNewerFirst: localStorage.getItem("sortByNewerFirst") == "true" ? true : false,
            sortByPriorityDesc: localStorage.getItem("sortByPriorityDesc") == "false" ? false : true,
            sortByJobPriority: localStorage.getItem("sortByJobPriority") == "true" ? true : false,
            filterByPassing: localStorage.getItem("filterByPassing") == "false" ? false : true,
            filterByOld: localStorage.getItem("filterByOld") == "false" ? false : true,
            sortByTestName: localStorage.getItem("sortByTestName") == "true" ? true : false,
					  sortByTestCategory: localStorage.getItem("sortByTestCategory") == "true" ? true : false,
            sortByTestRank: localStorage.getItem("sortByTestRank") == "true" ? true : false,
            filterByAutomatedTriaged: localStorage.getItem("filterByAutomatedTriaged") == "true" ? true : false,
            filterByTestInProgress: localStorage.getItem("filterByTestInProgress") == "true" ? true : false,
            filterByBugsOnly: localStorage.getItem("filterByBugsOnly") == "true" ? true : false,
					  filterByTestAssignedToMe: localStorage.getItem("filterByTestAssignedToMe") == "true" ? true : false,
            searchKanban: localStorage.getItem("searchKanban") ? localStorage.getItem("searchKanban") : "",
            filterByPendingStatus: localStorage.getItem("filterByPendingStatus") == "false" ? false : true,
            filterByPassStatus: localStorage.getItem("filterByPassStatus") == "false" ? false : true,
            filterByInProgressStatus: localStorage.getItem("filterByInProgressStatus") == "false" ? false : true,
            filterByBlockedStatus: localStorage.getItem("filterByBlockedStatus") == "false" ? false : true,
            filterByFailStatus: localStorage.getItem("filterByFailStatus") == "false" ? false : true,
            filterByNoStatus: localStorage.getItem("filterByNoStatus") == "false" ? false : true,
            clearInput: false,
        }
    }

    onSearchQueryChange(ev) {
      this.setState({
        searchQuery: ev.target.value,
      }, () => this.doSearch())
    }

    openJobsSearchMenu = event => {
        this.setState({
            jobsSearchMenuElement: event.currentTarget
        })
    }

    closeJobsSearchMenu = event => {
        this.setState({
            jobsSearchMenuElement: null
        })
    }

    checkFilter = filter => event => {
        if (filter == "sortByJobPriority" || filter == "sortBySuite") {
          this.setState({
            sortBySuite: false,
            sortByJobPriority: false
          })
        }

          this.setState({
              [filter]: event.target.checked
          }, () => {
              this.props.filterSelected(filter, this.state)
          })

    }



    checkFilterAutomationList = filter => event => {
        if (filter != "filterByAssignedToMe" && filter != "filterByPinned" && filter != "filterByPassing" && filter != "filterByOld") {
          this.setState({
            sortBySuiteAutomation: false,
            sortByOlderFirst: false,
            sortByNewerFirst: false,
            sortByPriorityDesc: false
          })
        }

        this.setState({
            [filter]: event.target.checked
        }, () => {
            this.props.filterSelected(filter, this.state)
        })
    }

    checkFilterKanban = filter => event => {
        if (filter == "sortByTestName" || filter == "sortByTestRank" || filter == "sortByTestCategory") {
          this.setState({
            sortByTestName: false,
            sortByTestRank: false,
			sortByTestCategory: false
          })
        }

        this.setState({
            [filter]: event.target.checked
        }, () => {
            this.props.filterSelected(filter, this.state)
        })
    }

    getFilters = () => (
        <FormGroup>
            <FormControlLabel
                className="searchUIItem"
                control={
                    <Switch
                        checked={this.state.filterByFailures}
                        onChange={this.checkFilter("filterByFailures")}
                        value="filterByFailures"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label="Only to Triage" />
            <FormControlLabel
                className="searchUIItem"
                control={
                    <Switch
                        checked={this.state.filterByOwnAssigned}
                        onChange={this.checkFilter("filterByOwnAssigned")}
                        value="filterByOwnAssigned"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label="Assigned to me" />
            <FormControlLabel
                className="searchUIItem"
                control={
                    <Switch
                        checked={this.state.filterByDisabled}
                        onChange={this.checkFilter("filterByDisabled")}
                        value="filterByDisabled"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label="Hide Disabled Suites" />
        </FormGroup>
    )

    getFiltersAutomationList = () => (
        <FormGroup>
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByPinned}
                        onChange={this.checkFilterAutomationList("filterByPinned")}
                        value="filterByPinned"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Pinned"
                className="pinned searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByAssignedToMe}
                        onChange={this.checkFilterAutomationList("filterByAssignedToMe")}
                        value="filterByAssignedToMe"
                        color="secondary"
                    />
                    }
                labelPlacement="start"
                label="Assigned to me"
                className="assignedToMe searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByPassing}
                        onChange={this.checkFilterAutomationList("filterByPassing")}
                        value="filterByPassing"
                        color="secondary"
                    />
                    }
                labelPlacement="start"
                label="Hide passing"
                className="filterByPassing searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByOld}
                        onChange={this.checkFilterAutomationList("filterByOld")}
                        value="filterByOld"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Hide Old"
                className="filterByOld searchUIItem" />
        </FormGroup>
    )

    getFiltersKanban = () => (
        <FormGroup>
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByAutomatedTriaged}
                        onChange={this.checkFilterKanban("filterByAutomatedTriaged")}
                        value="filterByAutomatedTriaged"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label="Hide Automated Triages"
                className="filterByAutomatedTriaged searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByBugsOnly}
                        onChange={this.checkFilterKanban("filterByBugsOnly")}
                        value="filterByBugsOnly"
                        color="primary"
                    />
                }
                labelPlacement="start"
                label="Show with bugs filed"
                className="filterByBugsOnly searchUIItem" />
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.filterByTestAssignedToMe}
                  onChange={this.checkFilterKanban("filterByTestAssignedToMe")}
                  value="filterByTestAssignedToMe"
                  color="primary"
                />
              }
              labelPlacement="start"
              label="Assigned to me"
              className="filterByTestAssignedToMe searchUIItem" />

            <FormControlLabel
             control={
               <Switch
                 checked={this.state.filterByTestInProgress}
                 onChange={this.checkFilterKanban("filterByTestInProgress")}
                 value="filterByTestInProgress"
                 color="primary"
               />
             }
             labelPlacement="start"
             label="In Progress"
             className="filterByTestInProgress searchUIItem" />
            </FormGroup>
    )

    getFiltersTestRuns = () => (
        <FormGroup>
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByPendingStatus}
                        onChange={this.checkFiltersTestRuns("filterByPendingStatus")}
                        value="filterByPendingStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Ongoing Plans"
                className="pending searchUIItem" />
        </FormGroup>
    )

    checkFiltersTestRuns = filter => event => {
        this.setState({
            [filter]: event.target.checked
        }, () => {
            this.props.filterSelected(filter, this.state)
        })
    }

    getFiltersManualTest = () => (
        <FormGroup>
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByPassStatus}
                        onChange={this.checkFiltersManualTest("filterByPassStatus")}
                        value="filterByPassStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Pass Status"
                className="pending searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByInProgressStatus}
                        onChange={this.checkFiltersManualTest("filterByInProgressStatus")}
                        value="filterByInProgressStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="In Progress Status"
                className="pending searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByBlockedStatus}
                        onChange={this.checkFiltersManualTest("filterByBlockedStatus")}
                        value="filterByBlockedStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Blocked Status"
                className="pending searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByFailStatus}
                        onChange={this.checkFiltersManualTest("filterByFailStatus")}
                        value="filterByFailStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Fail Status"
                className="pending searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByPendingStatus}
                        onChange={this.checkFiltersManualTest("filterByPendingStatus")}
                        value="filterByPendingStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="Pending Status"
                className="pending searchUIItem" />
            <FormControlLabel
                control={
                    <Switch
                        checked={this.state.filterByNoStatus}
                        onChange={this.checkFiltersManualTest("filterByNoStatus")}
                        value="filterByNoStatus"
                        color="secondary"
                    />
                }
                labelPlacement="start"
                label="No Status"
                className="pending searchUIItem" />
        </FormGroup>
    )

    checkFiltersManualTest = filter => event => {
        this.setState({
            [filter]: event.target.checked
        }, () => {
            this.props.filterSelected(filter, this.state)
        })
    }

    getSortItemsAutomationList = () => (
      <FormGroup>
          <FormControlLabel
              className="searchUIItem"
              control={
                  <Switch
                      checked={this.state.sortByPriorityDesc}
                      onChange={this.checkFilterAutomationList("sortByPriorityDesc")}
                      value="sortByPriorityDesc"
                      color="primary"
                  />
              }
              labelPlacement="start"
              label="Priority" />
          <FormControlLabel
              control={
                  <Switch
                      checked={this.state.sortByOlderFirst}
                      onChange={this.checkFilterAutomationList("sortByOlderFirst")}
                      value="sortByOlderFirst"
                      color="primary"
                  />
              }
              labelPlacement="start"
              label="Older first"
              className="olderFirst searchUIItem" />
          <FormControlLabel
              control={
                  <Switch
                      checked={this.state.sortByNewerFirst}
                      onChange={this.checkFilterAutomationList("sortByNewerFirst")}
                      value="sortByNewerFirst"
                      color="primary"
                  />
              }
              labelPlacement="start"
              label="Newer first"
              className="newerFirst searchUIItem" />
          <FormControlLabel
              control={
                  <Switch
                      checked={this.state.sortBySuiteAutomation}
                      onChange={this.checkFilterAutomationList("sortBySuiteAutomation")}
                      value="sortBySuiteAutomation"
                      color="primary"
                  />
              }
              labelPlacement="start"
              label="Suite name"
              className="sortBySuite searchUIItem" />
      </FormGroup>
    )

    getSortItemsList = () => (
      <FormGroup>
          <FormControlLabel
              className="searchUIItem"
              control={
                  <Switch
                      checked={this.state.sortByJobPriority}
                      onChange={this.checkFilter("sortByJobPriority")}
                      value="sortByJobPriority"
                      color="secondary"
                  />
                  }
                  labelPlacement="start"
                  label="Priority" />
          <FormControlLabel
              className="searchUIItem"
              control={
                  <Switch
                      checked={this.state.sortBySuite}
                      onChange={this.checkFilter("sortBySuite")}
                      value="sortBySuite"
                      color="secondary"
                  />
              }
              labelPlacement="start"
              label="Suite name" />
      </FormGroup>
    )

    getSortItemsKanbanList = () => (
      <FormGroup>
          <FormControlLabel
              control={
                  <Switch
                      checked={this.state.sortByTestName}
                      onChange={this.checkFilterKanban("sortByTestName")}
                      value="sortByTestName"
                      color="secondary"
                  />
                  }
                  labelPlacement="start"
                  label="Test Name"
                  className="sortByTestName searchUIItem" />
          <FormControlLabel
              className="searchUIItem"
              control={
                  <Switch
                      checked={this.state.sortByTestRank}
                      onChange={this.checkFilterKanban("sortByTestRank")}
                      value="sortByTestRank"
                      color="secondary"
                  />
              }
              labelPlacement="start"
              label="Test Rank" />
          <FormControlLabel
            control={
              <Switch
                checked={this.state.sortByTestCategory}
                onChange={this.checkFilterKanban("sortByTestCategory")}
                value="sortByTestCategory"
                color="secondary"
              />
            }
            labelPlacement="start"
            label="Test Category"
            className="sortByTestCategory searchUIItem" />
      </FormGroup>
    )



    doSearch = _.debounce(() => {
        let {searchQuery, clearInput} = this.state
        if (this.props.isKanban) {
          localStorage.setItem('searchKanban', searchQuery)
          this.setState({
              searchKanban: searchQuery
          }, () => {
              this.props.filterSelected("searchKanban", this.state, true)
          })
        } else {
          localStorage.setItem('searchSuite', searchQuery)
          this.setState({
              filterBySuiteName: searchQuery.length > 4 ? searchQuery : ''
          }, () => {
              (searchQuery.length > 4 || clearInput) && this.props.filterSelected("filterBySuiteName", this.state)
              searchQuery.length == 0 && this.props.filterSelected("filterBySuiteName", this.state)
          })
        }
        clearInput && this.setState({clearInput: false})
    }, 500)

    render() {
        const { classes, automationList, placeHolder, isKanban, isTestRuns, sort, isManual } = this.props
        const { jobsSearchMenuElement, searchQuery } = this.state

        return(
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "small",
                            padding: "0 4px",
                            cursor: "pointer",
                            backgroundColor: "transparent",
                            width: automationList ? "40px" : "auto"
                        }}
                    >
                      <Tooltip
                        title={"Filter and Sort"}
                        classes={{
                          tooltip: classes.tooltip,
                          popper: classes.popper,
                        }} >
                        <div>
                            <IconButton
                                onClick={this.openJobsSearchMenu}
                                color="primary"
                                style={{zIndex: 999, margin: automationList ? "auto" : "none"}}
                            >
                                <FilterIcon fontSize="small"/>
                            </IconButton>
                        </div>
                      </Tooltip>
                    </div>
                    <Popover
                        id="jobsSearchMenu"
                        anchorEl={jobsSearchMenuElement}
                        open={Boolean(jobsSearchMenuElement)}
                        onClose={this.closeJobsSearchMenu}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        style={{marginTop: 20, zIndex: 9999}}
                    >
                        <FormControl className="filtersPopover">
                            <h6 style={{ textTransform: 'none' }}>Filter by</h6>
                                {this.props.triageStage == Globals.TriageStage.SUITELIST ? <this.getFilters /> : "" }
                                {isManual ? <this.getFiltersManualTest /> : isTestRuns ? <this.getFiltersTestRuns /> : automationList ? <this.getFiltersAutomationList /> : isKanban ? <this.getFiltersKanban /> : <></> }
                                {
                                    sort && (
                                    <h6 style={{ textTransform: 'none' }}>Sort by</h6>
                                )}
                                {this.props.triageStage == Globals.TriageStage.SUITELIST ? <this.getSortItemsList /> : "" }
                                {automationList ? <this.getSortItemsAutomationList /> : isKanban ? <this.getSortItemsKanbanList /> : <></> }
                        </FormControl>
                    </Popover>
                </div>
                {
                    !isManual && !isTestRuns && (
                        <div style={{paddingRight: 0,marginLeft: 9}}>
                            <div style={{ display: automationList ? "none" : "block" }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <SearchIcon color="primary" fontSize="small"/>
                                    <InputBase
                                        id="jobsSearchField"
                                        placeholder={placeHolder}
                                        onChange={this.onSearchQueryChange.bind(this)}
                                        endAdornment={
                                            searchQuery ?
                                                <ClearIcon
                                                    color="action"
                                                    onClick={() => {
                                                        this.setState({ searchQuery: '', clearInput: true }, () => this.doSearch())
                                                        isKanban ? localStorage.removeItem("searchKanban") : localStorage.removeItem("searchSuite")
                                                    }}
                                                    style={{ marginRight: 10, cursor: 'pointer' }} />
                                                : null
                                        }
                                        fullWidth
                                        style={{width: "290", fontSize: '.875rem', marginLeft: 5}}
                                        value={searchQuery}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}
export default withStyles(styles)(SearchUI)
