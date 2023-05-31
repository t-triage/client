import React, { Component } from "react"
import Api from "../Main/Components/Api"
import axios from 'axios'

import { scrollToTop, TextFieldInput } from './AdminUtils'

// Icons
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import EditIcon from "@material-ui/icons/Edit"
import AppIcon from "@material-ui/icons/Build"

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
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"

import SideMenu from "./SideMenu"

const formLabelHeight = 30;

export default class Properties extends Component {

    state = {
      propertyList: [],
      propertyName: '',
      propertyNameError: false,
      propertyDescription: '',
      value: '',
      propertyValueError: false,
      enableEdit: false,
      propertyEdit: null,
    }

    componentDidMount() {
      this.fetchProperties()
    }

    fetchProperties() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProperties + "?sort=name,asc")
      .then(res => {
        this.setState({
          propertyList: res.data.content,
        })
      })
    }

    validateFields() {
      let {propertyName, propertyDescription, value} = this.state;
      let result = true;
      if (propertyName === '' || value === '' ) {
        result = false;
      }
      this.setState({
        propertyNameError: propertyName === '' ? true : false,
        propertyValueError: value === '' ? true : false,
      })
      return result;
    }

    clearProperty() {
      this.setState({
        enableEdit: false,
        propertyDescription: '',
        propertyName: '',
        value: '',
        propertyEdit: null,
      })
    }

    createProperty() {
      let {propertyName, propertyDescription, value} = this.state;
      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateProperty,
          data: JSON.stringify({
            description: propertyDescription,
            enabled: true,
            name: propertyName,
            timestamp: new Date().getTime(),
            updated: new Date().getTime(),
            value,
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        this.setState({
          propertyName: '',
          propertyDescription: '',
          value: '',
        }, () => this.fetchProperties())
      })
    }

    saveProperty() {
      let {propertyName, value, propertyEdit} = this.state;
      this.enableProperty({
        ...propertyEdit,
        description: this.state.propertyDescription,
        name: propertyName,
        updated: new Date().getTime(),
        value,
      })
      this.clearProperty()
    }

    enableEditProperty(index) {
      let {propertyList} = this.state;
      let property = propertyList[index];
      this.setState({
        enableEdit: true,
        propertyDescription: property.description ? property.description : '',
        propertyName: property.name,
        value: property.value,
        propertyEdit: property,
      }, () => scrollToTop())
    }

    enableProperty(property) {
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateProperty,
          data: JSON.stringify({...property, enabled: true}),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        this.fetchProperties()
      })
    }

    disableProperty(id) {
      axios({
          method: "DELETE",
          url: Api.getBaseUrl() + Api.ENDPOINTS.DisableProperty + id,
      })
      .then(res => this.fetchProperties())
    }

    onPropertyNameChange(ev) {
      let {value} = ev.target;
      this.setState({
        propertyName: value,
        propertyNameError: false,
      })
    }

    onPropertyDescriptionChange(ev) {
      let {value} = ev.target;
      this.setState({
        propertyDescription: value,
      })
    }

    onPropertyValueChange(ev) {
      let {value} = ev.target;
      this.setState({
        value,
        propertyValueError: false,
      })
    }

    getListItem(property, index, disabled) {
      return (
        <ListItem key={property.id} style={{ opacity: disabled ? '.5' : '1' }}>
            <ListItemAvatar>
                <Avatar src={property.logo ? property.logo : ''}>
                    { !property.logo && <AppIcon /> }
                </Avatar>
            </ListItemAvatar>
            <Grid container style={{ marginLeft: 16 }}>
                <Grid item xs={6}>
                    <ListItemText
                        primary={property.name}
                        secondary={property.description}
                    />
                </Grid>
                <Grid item xs={5}>
                    <ListItemText
                        primary={'value'}
                        secondary={property.value}
                    />
                </Grid>
            </Grid>
            <ListItemSecondaryAction>
                <Tooltip title="Edit">
                    <IconButton
                        disabled={property.enabled ? false : true}
                        style={{
                          opacity: property.enabled ? '1' : '.5',
                          cursor: property.enabled ? 'pointer' : 'default',
                        }}
                        onClick={
                            property.enabled ?
                                this.enableEditProperty.bind(this, index)
                            :   null
                        }
                        aria-label="Edit">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={property.enabled ? 'Deactivate' : 'Activate'}>
                    <IconButton
                        onClick={
                          property.enabled ?
                            this.disableProperty.bind(this, property.id)
                          : this.enableProperty.bind(this, property)
                        }
                        aria-label="Delete">
                        { property.enabled && <RemoveCircleIcon /> }
                        { !property.enabled && <AddCircleIcon /> }
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
      )
    }

    renderList = () => {
        let {propertyList} = this.state;
        let rows = []
        let rowsDisabled = []

        if (propertyList) {
          propertyList.map((property, index) => {
            if (property.enabled) {
              rows.push(this.getListItem(property, index, false))
            } else {
              rowsDisabled.push(this.getListItem(property, index, true))
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
          this.saveProperty()
        } else {
          this.createProperty()
        }
      }
    }

    render() {
        let {
          propertyName,
          propertyNameError,
          propertyDescription,
          propertyValueError,
          value,
          enableEdit,
          propertyList,
        } = this.state;
        return(
          <div style={{display: 'flex'}}>
            <SideMenu/>
            <div style={{'width': '100%'}} className="CenterList">
                <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                    <div className="Containers-Main">
                        <Card>
                            <CardContent style={{ 'max-width': '80vw'}}>
                                <h4>Properties</h4>
                                <div>Internal Properties that adapt the Triage configuration.</div>
                                <TextFieldInput
                                    id="propertyName"
                                    label="Name"
                                    placeholder="A short name for the property"
                                    error={propertyNameError}
                                    helperText={propertyNameError ? 'Required field' : ''}
                                    onChange={this.onPropertyNameChange.bind(this)}
                                    value={propertyName}
                                />
                                <TextFieldInput
                                    id="propertyValue"
                                    label="Value"
                                    placeholder="Property value"
                                    error={propertyValueError}
                                    helperText={propertyValueError ? 'Required field' : ''}
                                    onChange={this.onPropertyValueChange.bind(this)}
                                    value={value}
                                />
                                <TextFieldInput
                                    id="propertyDescription"
                                    label="Description"
                                    placeholder="Property Description"
                                    onChange={this.onPropertyDescriptionChange.bind(this)}
                                    value={propertyDescription}
                                />
                            </CardContent>
                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.clearProperty.bind(this)}
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
                        <Paper>
                            {
                              propertyList.length > 0 ?
                                this.renderList()
                              : <div className="circularProgressContainer">
                                  <CircularProgress color="primary" />
                                </div>
                            }
                        </Paper>
                    </div>
                </form>
            </div>
            </div>
        )
    }
}
