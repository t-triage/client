import React, { Component } from "react"
import * as _  from "underscore"

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

class SortByAutomatedTests extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchQuery: this.props.isKanban && localStorage.getItem("searchKanban") ? localStorage.getItem("searchKanban") : localStorage.getItem("searchSuite") && !this.props.isKanban ? localStorage.getItem("searchSuite") : "",
            jobsSearchMenuElement: null,
            clearInput: false,
            sortByTestName: false,
            sortByTestExecution: false,
            sortByTestFails: false
        }
    }


    checkFilterKanban = filter => event => {
      
        if (filter == "sortByTestName" || filter == "sortByTestFails" || filter == "sortByTestExecution") {
            this.setState({
                [filter]: event.target.checked
            }, () => {
                this.props.sortAutomatedList([filter]) 
            })
        }
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

    doSearch = _.debounce(() => {
        let { searchQuery, clearInput } = this.state
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
        clearInput && this.setState({ clearInput: false })
    }, 500)

    render() {
        const { jobsSearchMenuElement } = this.state
        let { inputStyle,sortAutomatedList} = this.props
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "small",
                        padding: "0 4px",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        width: "auto"
                    }}>



                    <FormControl className="filtersPopover">
                        <h6 style={{ textTransform: 'none' }}>Show only</h6>
                        <FormGroup>
                            <FormControlLabel
                                className="searchUIItem"
                                control={
                                    <Switch
                                        checked={this.state.sortByTestName}
                                        onChange={this.checkFilterKanban("sortByTestName")}
                                        value="sortByTestName"
                                        color="primary"
                                    />
                                }

                                labelPlacement="start"
                                label="Test with suites" />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={this.state.sortByTestFails}
                                        onChange={this.checkFilterKanban("sortByTestFails")}
                                        value="sortByTestFails"
                                        color="primary"
                                    />
                                }
                                labelPlacement="start"
                                label="Suite Fails"
                                className="sortByTestCategory searchUIItem" />
                        </FormGroup>
                    </FormControl>
                </div>
            </div>
        )
    }
}
export default withStyles(styles)(SortByAutomatedTests)
