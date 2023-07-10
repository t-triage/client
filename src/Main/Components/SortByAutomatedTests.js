import React, { Component } from "react"
import * as _  from "underscore"

// UI Components

import Grid from "@mui/material/Grid"
import FilterIcon from "@mui/icons-material/FilterList"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import IconButton from "@mui/material/IconButton"
import ListSubheader from "@mui/material/ListSubheader"
import SearchIcon from "@mui/icons-material/Search"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Popover from "@mui/material/Popover"
import Paper from "@mui/material/Paper"
import InputBase from "@mui/material/InputBase"
import ClearIcon from "@mui/icons-material/Clear"
import Globals from "./Globals"
import Tooltip from "@mui/material/Tooltip"
import withStyles from '@mui/styles/withStyles';
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
