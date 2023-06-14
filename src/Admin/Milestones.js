import React, { Component } from "react"
import Api from "../Main/Components/Api"
import axios from 'axios'
import { find } from "underscore"

import { scrollToTop, TextFieldInput, HourList } from './AdminUtils'

// Icons
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import EditIcon from "@material-ui/icons/Edit"
import AppIcon from "@material-ui/icons/AccessTime"
import FileCopyIcon from "@material-ui/icons/FileCopy"

// UI Components
import Divider from "@material-ui/core/Divider"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import IconButton from "@material-ui/core/IconButton"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Button from "@material-ui/core/Button"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import MenuItem from "@material-ui/core/MenuItem"
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import {
  MuiPickersUtilsProvider,
  InlineDatePicker
} from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";

import { getDayInYear } from '../Main/Components/Globals'
import SideMenu from "./SideMenu"

const formLabelHeight = 30;

export default class Milestones extends Component {

    state = {
      milestoneList: [],
      milestoneName: '',
      milestoneNameError: false,
      milestoneDescription: '',
      milestoneDescriptionError: false,
      milestoneDate: '',
      milestoneDateError: false,
      milestoneDatePastError: false,
      enableEdit: false,
      productList: [],
      product: 0,
      milestoneEdit: null,
      milestoneTime: '20:00 Hs',
      searching: true,
    }

    componentDidMount() {
      let date = new Date();
      this.setState({
        milestoneDate: this.formatPickerDate(date),
      })
      this.fetchMilestones()
      this.fetchProducts()
    }

    fetchMilestones() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetMilestones + "?sort=name,asc")
      .then(res => {
        this.setState({
          milestoneList: res.data.content,
          searching: false
        })
      })
    }

    fetchProducts() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + '?query=enabled:true&sort=name,asc')
      .then(res => {
        let {content} = res.data;
        if (content[0]) {
            this.setState({
                productList: content,
                product: content[0].id,
            })
        }
      })
    }

    formatDate(date, time) {
      date = date.toString().includes("T") ? date : this.formatPickerDate(date)
      date = date.toISOString()
      date = date.substring(0, date.indexOf('T'))
      time = time.substring(0, time.indexOf(' '))
      return date+"T"+time
    }

    formatPickerDate(date) {
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 )).toISOString()
    }

    formatSelectTime(date) {
      let isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 )).toISOString()
      return isoDate.substring(isoDate.indexOf('T')+1, isoDate.indexOf('T')+6) + " Hs"
    }

    checkDateBeforeToday(date) {
      let today = getDayInYear(new Date)
      return getDayInYear(date) < today
    }

    validateFields() {
      let {milestoneName, milestoneDescription, milestoneDate} = this.state;
      let beforeToday = this.checkDateBeforeToday(milestoneDate)
      let result = true;
      if (milestoneName === '' || milestoneDescription === '' || milestoneDate === '' || beforeToday ) {
        result = false;
      }
      this.setState({
        milestoneNameError: milestoneName === '' ? true : false,
        milestoneDescriptionError: milestoneDescription === '' ? true : false,
        milestoneDateError: milestoneDate === '' ? true : false,
        milestoneDatePastError: beforeToday ? true : false,
      })
      return result;
    }

    clearMilestone() {
      this.setState({
        enableEdit: false,
        milestoneDate: this.formatPickerDate(new Date()),
        milestoneDescription: '',
        milestoneName: '',
        milestoneEdit: null,
        product: this.state.productList[0].id,
      })
    }

    createMilestone() {
      let {milestoneName, milestoneDescription, milestoneDate, milestoneTime} = this.state;
      let date = new Date();
      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateMilestone,
          data: JSON.stringify({
            deadlineDate: new Date(this.formatDate(milestoneDate, milestoneTime)).getTime(),
            description: milestoneDescription,
            enabled: true,
            name: milestoneName,
            note: null,
            product: this.state.product,
            timestamp: date.getTime(),
            updated: date.getTime(),
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        this.setState({
          milestoneName: '',
          milestoneDescription: '',
          milestoneDate: this.formatPickerDate(date),
          product: this.state.productList[0].id,
        }, () => this.fetchMilestones())
      })
    }

    saveMilestone() {
      let {milestoneName, milestoneDescription, milestoneDate, milestoneEdit, milestoneTime} = this.state;
      let date = new Date();
      this.enableMilestone({
        ...milestoneEdit,
        deadlineDate: new Date(this.formatDate(milestoneDate, milestoneTime)).getTime(),
        description: milestoneDescription,
        name: milestoneName,
        product: this.state.product,
        updated: date.getTime(),
      })
      this.clearMilestone()
    }

    enableEditMilestone(index) {
      let {milestoneList} = this.state;
      let milestone = milestoneList[index];
      let {deadlineDate} = milestone;
      let date = new Date(deadlineDate)
      this.setState({
        enableEdit: true,
        milestoneDate: this.formatPickerDate(date),
        milestoneTime: this.formatSelectTime(date),
        milestoneDescription: milestone.description ? milestone.description : '',
        milestoneName: milestone.name,
        product: milestone.product,
        milestoneEdit: milestone,
      }, () => scrollToTop())
    }

    enableMilestone(milestone) {
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateMilestone,
          data: JSON.stringify({...milestone, enabled: true}),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        this.fetchMilestones()
      })
    }

    disableMilestone(id) {
      axios({
          method: "DELETE",
          url: Api.getBaseUrl() + Api.ENDPOINTS.DisableMilestone + id,
      })
      .then(res => this.fetchMilestones())
    }

    onMilestoneNameChange(ev) {
      let {value} = ev.target;
      this.setState({
        milestoneName: value,
        milestoneNameError: false,
      })
    }

    onMilestoneDescriptionChange(ev) {
      let {value} = ev.target;
      this.setState({
        milestoneDescription: value,
        milestoneDescriptionError: false,
      })
    }

    onMilestoneDateChange(date) {
      this.setState({
        milestoneDate: date,
        milestoneDateError: date !== '' ? false : true,
        milestoneDatePastError: this.checkDateBeforeToday(date) ? true : false,
      })
    }

    onMilestoneProductChange(ev) {
      let {value} = ev.target;
      this.setState({
        product: value,
      })
    }

    copyMilestone(index) {
      let {milestoneList} = this.state
      let milestone = milestoneList[index]
      let {deadlineDate} = milestone
      let date = new Date(deadlineDate)
      let milestoneDate = this.formatPickerDate(date)
      let milestoneTime = this.formatSelectTime(date)
      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateMilestone,
          data: JSON.stringify({
            deadlineDate: new Date(this.formatDate(milestoneDate, milestoneTime)).getTime(),
            description: milestone.description ? milestone.description : '',
            enabled: true,
            name: "COPY-"+milestone.name,
            note: null,
            product: milestone.product,
            timestamp: date.getTime(),
            updated: date.getTime(),
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        this.fetchMilestones()
        this.setState({
          enableEdit: true,
          milestoneDate: this.formatPickerDate(date),
          milestoneTime: this.formatSelectTime(date),
          milestoneDescription: res.data.description ? res.data.description : '',
          milestoneName: res.data.name,
          product: res.data.product,
          milestoneEdit: res.data,
        }, () => scrollToTop())
      })
    }

    getListItem(milestone, index, disabled) {
      let product = find(this.state.productList, { id: milestone.product })
      return (
        <ListItem key={milestone.id} style={{ opacity: disabled ? '.5' : '1' }}>
            <ListItemAvatar>
                <Avatar>
                    <AppIcon />
                </Avatar>
            </ListItemAvatar>
            <Grid container style={{ marginLeft: 16 }}>
                <Grid item xs={6}>
                    <ListItemText
                        primary={milestone.name}
                        secondary={"Deadline date " + new Date(milestone.deadlineDate).toLocaleDateString("en-US", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                    />
                </Grid>
                <Grid item xs={5} style={{ paddingRight: 10 }}>
                    <ListItemText
                        primary={product ? product.name : ''}
                        secondary={null}
                    />
                </Grid>
            </Grid>
            <ListItemSecondaryAction>
                <Tooltip title="Edit">
                    <IconButton
                        style={{
                          opacity: milestone.enabled ? '1' : '.5',
                          cursor: milestone.enabled ? 'pointer' : 'default',
                        }}
                        onClick={
                            milestone.enabled ?
                                this.enableEditMilestone.bind(this, index)
                            :   null
                        }
                        aria-label="Edit">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={milestone.enabled ? 'Deactivate' : 'Activate'}>
                    <IconButton
                        onClick={
                          milestone.enabled ?
                            this.disableMilestone.bind(this, milestone.id)
                          : this.enableMilestone.bind(this, milestone)
                        }
                        aria-label="Delete">
                        { milestone.enabled && <RemoveCircleIcon /> }
                        { !milestone.enabled && <AddCircleIcon /> }
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Copy"}>
                    <IconButton
                        style={{
                          opacity: milestone.enabled ? '1' : '.5',
                          cursor: milestone.enabled ? 'pointer' : 'default',
                        }}
                        onClick={
                            milestone.enabled ?
                                this.copyMilestone.bind(this, index)
                            :   null
                        }
                        aria-label="Copy">
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
      )
    }

    renderList = () => {
        let {milestoneList} = this.state;
        let rows = []
        let rowsDisabled = []
        if (milestoneList) {
          milestoneList.map((milestone, index) => {
            if (milestone.enabled) {
              rows.push(this.getListItem(milestone, index, false))
            } else {
              rowsDisabled.push(this.getListItem(milestone, index, true))
            }
            return null;
          })
        }
        if (rowsDisabled.length > 0) {
          rows = rows.concat(<Divider key="divider" />)
        }
        rows = rows.concat(rowsDisabled)
        return <List>{rows}</List>
    }

    onSubmit(ev) {
      ev.preventDefault()
      if (this.validateFields()) {
        if (this.state.enableEdit) {
          this.saveMilestone()
        } else {
          this.createMilestone()
        }
      }
    }

    handleTimeChange = (event) => {
      this.setState({
        milestoneTime: event.target.value
      })
    }


    render() {
        let {
          milestoneName,
          milestoneNameError,
          milestoneDescription,
          milestoneDescriptionError,
          milestoneDate,
          milestoneDateError,
          milestoneDatePastError,
          enableEdit,
          productList,
          milestoneList,
          milestoneTime
        } = this.state;
        return(
          <div style={{display: 'flex'}}>
            <SideMenu/>
            <div style={{'width': '100%'}} className="CenterList">
                <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                    <div className="Containers-Main">
                        <Card>
                            <CardContent style={{ 'maxWidth': '80vw'}}>
                                <h4>Milestones</h4>
                                <div>
                                    You can set deadlines because of new version released.
                                </div>
                                <div>
                                    The product will set the goal to have every job triaged before the specified date.
                                </div>
                                <TextFieldInput
                                    id="milestoneName"
                                    label="Short Name"
                                    placeholder="A short name for the milestone"
                                    error={milestoneNameError}
                                    helperText={milestoneNameError ? 'Required field' : ''}
                                    onChange={this.onMilestoneNameChange.bind(this)}
                                    autoFocus={true}
                                    value={milestoneName}
                                />
                                <TextFieldInput
                                    id="milestoneDescription"
                                    label="Description"
                                    placeholder="Milestone Description"
                                    error={milestoneDescriptionError}
                                    helperText={milestoneDescriptionError ? 'Required field' : ''}
                                    onChange={this.onMilestoneDescriptionChange.bind(this)}
                                    variant="outlined"
                                    value={milestoneDescription}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                          <InlineDatePicker
                                              margin="normal"
                                              id="milestoneDate"
                                              label="Deadline Date"
                                              variant="outlined"
                                              error={milestoneDateError || milestoneDatePastError}
                                              helperText={milestoneDateError ? 'Required field' : milestoneDatePastError ? 'Date should be after today' : ''}
                                              value={milestoneDate}
                                              onChange={this.onMilestoneDateChange.bind(this)}
                                              style={{marginRight: 10, marginTop: 18, width: '100%'}}
                                              InputProps={{
                                                  style: {
                                                    fontSize: '.875rem',
                                                  }
                                              }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </Grid>

                                    <Grid item xs={3}>
                                        <TextFieldInput
                                            id="triageFrecuencyHour"
                                            select
                                            label="Time Deadline"
                                            value={this.state.milestoneTime}
                                            onChange={this.handleTimeChange.bind(this)}
                                            InputProps={{
                                                style: {
                                                  fontSize: '.875rem',
                                                  marginTop: -3
                                                }
                                            }}
                                        >
                                            {HourList.map(p => (
                                                <MenuItem className="globalMenuItem" key={p.value} value={p.label}>{p.label}</MenuItem>
                                            ))}
                                        </TextFieldInput>
                                    </Grid>
                                </Grid>

                                <TextFieldInput
                                    id="product"
                                    select
                                    label="Product"
                                    placeholder="Select product"
                                    value={this.state.product}
                                    onChange={this.onMilestoneProductChange.bind(this)}
                                    InputProps={{
                                        style: {
                                          fontSize: '.875rem'
                                        }
                                    }}
                                >
                                    {productList && productList.map(p => (
                                        <MenuItem className="globalMenuItem" key={p.id} value={p.id}>{p.name}</MenuItem>
                                    ))}
                                </TextFieldInput>
                            </CardContent>
                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.clearMilestone.bind(this)}
                                    variant="contained"
                                    color="secondary">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="globalButton"
                                    variant="contained"
                                    color="primary">
                                    Save
                                </Button>
                            </CardActions>
                        </Card>
                        <div />
                    </div>
                    <div className="Containers-Main">
                            {
                              milestoneList.length > 0 ?
                              <Paper>{this.renderList()}</Paper>
                              : this.state.searching ?
                                <Paper>
                                    <div className="circularProgressContainer">
                                      <CircularProgress color="primary" />
                                    </div>
                                </Paper> : ''
                            }
                    </div>
                </form>
            </div>
            </div>
        )
    }
}
