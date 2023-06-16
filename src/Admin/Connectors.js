import React, { Component } from "react"
import Api from "../Main/Components/Api"
import axios from 'axios'

import SuiteActionDialog from '../Main/Components/SuiteActionDialog'
import {MySnackbarContent, snackbarStyle, COLORS, WIKI_URL} from '../Main/Components/Globals'
import { scrollToTop, TextFieldInput } from './AdminUtils'
import { copyToClipboard } from '../Main/Components/TriageUtils'

// Icons
import ConnectorIcon from "@mui/icons-material/CompareArrows"
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import EditIcon from "@mui/icons-material/Edit"
import RotateRightIcon from "@mui/icons-material/RotateRight"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import AssignmentIcon from "@mui/icons-material/Assignment"
import FileCopyIcon from "@mui/icons-material/FileCopy"

// UI Components
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import MenuItem from "@mui/material/MenuItem"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import Avatar from "@mui/material/Avatar"
import Tooltip from "@mui/material/Tooltip"
import Snackbar from "@mui/material/Snackbar"
import Grid from "@mui/material/Grid"
import CircularProgress from "@mui/material/CircularProgress"
import withStyles from '@mui/styles/withStyles';

import SideMenu from "./SideMenu"

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

const types = [
  {value: 'BAMBOO', text: 'Bamboo'},
  {value: 'CIRCLECI', text: 'Circle CI'},
  {value: 'GITLAB', text: 'GitLab'},
  {value: 'JENKINS', text: 'Jenkins'},
]

export default class Connector extends Component {

    state = {
      connectorList: [],
      containers: [],
      shortName: '',
      shortNameError: false,
      baseUrl: '',
      baseUrlError: false,
      type: 'JENKINS',
      username: '',
      password: '',
      enableEdit: false,
      openSnackbar: false,
      snackbarMsg: '',
      snackbarVariant: 'success',
      showActionDialog: false,
      showAdvanced: false,
      populateConnectorId: 0,
      connectorEdit: null,
      clientID: '',
      secretID: '',
      searching: true,
      skipped: false,
      validatedConnector: false,
    }

    componentDidMount() {
      this.fetchConnectors()
    }

    componentDidUpdate() {
      let {isActive, isPrevious, setPrevious} = this.props;
      let {skipped} = this.state;

      if(isActive && isPrevious) {
          setPrevious()
          if (!skipped)
            this.wizardUpdate()
      }
  }

    fetchConnectors() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetConnectors + "?sort=name,asc")
      .then(res => {
        this.setState({
          connectorList: res.data.content,
          searching: false,
        })
      })
    }

    getAuthTokens(id) {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAuthToken + id)
      .then(res => {
        if (res.data) {
          this.setState({
            clientID: res.data.clientID,
            secretID: '****************************',
          })
        }
      })
    }

    createAuthTokens(id) {
      if (id) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.CreateAuthToken + id)
        .then(res => {
          this.setState({
            clientID: res.data.clientID,
            secretID: res.data.secretID,
          })
        })
      } else {
        if (this.validateFields()) {
          this.createConnector(false, true)
        }
      }
    }

    clearConnector() {
      this.setState({
        enableEdit: false,
        shortName: '',
        baseUrl: '',
        username: '',
        password: '',
        type: 'JENKINS',
        connectorEdit: null,
        clientID: '',
        secretID: '',
      })
    }

    createConnector(test, createTokens = false) {

      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateConnector,
          data: JSON.stringify({
            containers: [],
            enabled: true,
            name: this.state.shortName,
            timestamp: new Date().getTime(),
            updated: new Date().getTime(),
            url: this.state.baseUrl,
            userName: this.state.username,
            userToken: this.state.password,
            type: this.state.type, // TODO
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        if (!!this.props.storeData)
          this.props.storeData("connector", res.data.id)
        
        this.setState({
          shortName: '',
          baseUrl: '',
          username: '',
          password: '',
          type: 'JENKINS',
        }, () => {
          if (test) {
            this.validateConnector(res.data)
          } else {
            this.fetchConnectors()
          }
          if (createTokens) {
            this.enableEditConnector(null, res.data)
            this.createAuthTokens(res.data.id)
          }
        })
      })
    }

    saveConnector(test) {
      let {shortName, baseUrl, username, password, type, connectorEdit} = this.state
      this.enableConnector({
        ...connectorEdit,
        name: shortName,
        url: baseUrl,
        type,
        userName: username,
        userToken: password,
        updated: new Date().getTime(),
      }, true, test)
      this.clearConnector()
    }

    disableConnector(id) {
      axios({
          method: "DELETE",
          url: Api.getBaseUrl() + Api.ENDPOINTS.DisableConnector + id,
      })
      .then(res => this.fetchConnectors())
    }

    enableConnector(connector, save = false, test = false) {
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateConnector,
          data: JSON.stringify({...connector, enabled: true}),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        if (save && test) {
          this.validateConnector(connector)
        } else {
          this.fetchConnectors()
        }
      })
    }

    enableEditConnector(index, connectorEdit) {
      let {connectorList} = this.state;
      let connector = connectorEdit ? connectorEdit : connectorList[index];
      this.setState({
        enableEdit: true,
        shortName: connector.name,
        baseUrl: connector.url,
        username: connector.userName,
        type: connector.type,
        password: connector.userToken ? connector.userToken : '',
        connectorEdit: connector,
      }, () => {
        scrollToTop()
        this.getAuthTokens(connector.id)
      })
    }

    validateConnector(connector) {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.ValidateConnector + connector.id)
      .then(res => {
        if (res.data) {
          this.fetchConnectors()
          this.showSnackbar('Connector test passed.', 'success')
          this.setState({validatedConnector: true})
        } else {
          this.disableConnector(connector.id)
          this.enableEditConnector(null, connector)
          this.showSnackbar('Connector test failed and it is temporarily disabled.<br />Please review your configuration, enable, edit and try again.', 'error')
          this.setState({validatedConnector: false})
        }
      })
    }

    openActionDialog(populateConnectorId) {
      this.setState({
        showActionDialog: true,
        populateConnectorId,
      })
    }

    closeActionDialog() {
      this.setState({
        showActionDialog: false,
      })
    }

    renderPopulateDialog() {
      let {showActionDialog, populateConnectorId} = this.state;
      let props = {
        isOpen: showActionDialog,
        onClose: this.closeActionDialog.bind(this),
        type: 'populateConnector',
        populateConnectorId,
        showSnackbar: this.showSnackbar.bind(this)
      }

      return showActionDialog && (
          <SuiteActionDialog {...props} />
      )
    }

    showSnackbar(msg, variant) {
      this.setState({ openSnackbar: true, snackbarMsg: msg, snackbarVariant: variant });
    };

    hideSnackbar() {
      this.setState({
        openSnackbar: false,
      })
    };

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

    onFieldChange = field => event => {
      this.setState({
        [field]: event.target.value,
        [`${field}Error`]: false,
      })
    }

    onTypeChange(ev) {
      let {value} = ev.target;
      this.setState({
        type: value,
      })
    }

    validateFields(skipSetState) {
      let {shortName, baseUrl} = this.state;
      let result = true;
      if (shortName === '' || baseUrl === '') {
        result = false;
      }
      if (!skipSetState)
        this.setState({
          shortNameError: shortName === '' ? true : false,
          baseUrlError: baseUrl === '' ? true : false,
        })
      return result;
    }

    copyConnector(index, connectorEdit) {
      let {connectorList} = this.state
      let connector = connectorEdit ? connectorEdit : connectorList[index]

      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateConnector,
          data: JSON.stringify({
            containers: [],
            enabled: true,
            name: "COPY-"+connector.name,
            timestamp: new Date().getTime(),
            updated: new Date().getTime(),
            url: connector.url,
            userName: connector.userName,
            userToken: connector.userToken,
            type: connector.type, // TODO
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
          this.fetchConnectors()
          this.setState({
            enableEdit: true,
            shortName: res.data.name,
            baseUrl: res.data.url,
            username: res.data.userName,
            type: res.data.type,
            password: res.data.userToken ? res.data.userToken : '',
            connectorEdit: res.data,
          }, () => {
            scrollToTop()
            this.getAuthTokens(connector.id)
          })
      })
    }

    getListItem(connector, index) {
      return (
        <ListItem key={connector.id} style={{ opacity: !connector.enabled ? '.5' : '1' }}>
            <ListItemAvatar>
                <Avatar>
                    <ConnectorIcon />
                </Avatar>
            </ListItemAvatar>
            <Grid container style={{ marginLeft: 16 }}>
                <Grid item xs={6}>
                    <ListItemText
                        primary={connector.name}
                        secondary={"Modified on " + new Date(connector.updated).toLocaleDateString("en-US", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                        })}
                    />
                </Grid>
                <Grid item xs={5} style={{ paddingRight: 10 }}>
                    <ListItemText
                        primary={'URL'}
                        secondary={connector.url}
                    />
                </Grid>
            </Grid>
            <ListItemSecondaryAction>
                <Tooltip title={'Pull tests from CI'}>
                    <IconButton
                      style={{
                        opacity: connector.enabled ? '1' : '.5',
                        cursor: connector.enabled ? 'pointer' : 'default',
                      }}
                      onClick={
                          connector.enabled ?
                              this.openActionDialog.bind(this, connector.id)
                          :   null
                      }
                      aria-label="Populate"
                      size="large">
                        <RotateRightIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={'Edit'}>
                    <IconButton
                      style={{
                        opacity: connector.enabled ? '1' : '.5',
                        cursor: connector.enabled ? 'pointer' : 'default',
                      }}
                      onClick={
                          connector.enabled ?
                              this.enableEditConnector.bind(this, index, null)
                          :   null
                      }
                      aria-label="Edit"
                      size="large">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={connector.enabled ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      onClick={
                        connector.enabled ?
                          this.disableConnector.bind(this, connector.id)
                        : this.enableConnector.bind(this, connector)
                      }
                      aria-label="Delete"
                      size="large">
                        { connector.enabled && <RemoveCircleIcon /> }
                        { !connector.enabled && <AddCircleIcon /> }
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Copy"}>
                    <IconButton
                      style={{
                        opacity: connector.enabled ? '1' : '.5',
                        cursor: connector.enabled ? 'pointer' : 'default',
                      }}
                      onClick={
                          connector.enabled ?
                              this.copyConnector.bind(this, index, null)
                          :   null
                      }
                      aria-label="Copy"
                      size="large">
                        <FileCopyIcon />
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
      );
    }

    renderList = () => {
        let {connectorList} = this.state;
        let rows = []
        let rowsDisabled = []

        if (connectorList) {
          connectorList.map((connector, index) => {
            if (connector.enabled) {
              rows.push(this.getListItem(connector, index))
            } else {
              rowsDisabled.push(this.getListItem(connector))
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

    saveAndTest(ev) {
      this.onSubmit(ev, true)
    }

    onSubmit(ev, test = false) {
      ev.preventDefault()
      if (this.validateFields()) {
        if (this.state.enableEdit) {
          this.saveConnector(test)
        } else {
          this.createConnector(test)
        }

        if (this.props.wizardMode) {
          if (test) {
            if (this.state.validatedConnector)
              this.wizardNext();
          } else {
            this.wizardNext();
          }
        }
      }
    }

    wizardUpdate = () => {
        let {data} = this.props;
        let id = data.connector
        let index = this.state.connectorList.findIndex(x => x.id == id);
        this.enableEditConnector(index)
    }

    wizardNext = () => {
        let {nextStep} = this.props

        if (this.state.skipped)
            this.setState({skipped: false})
        nextStep()
    }

    wizardPrevious = () => {
        let {setPrevious, previousStep} = this.props;

        setPrevious();
        previousStep();
    }

    wizardSkip = () => {
        let {nextStep} = this.props

        this.setState({skipped: true})
        nextStep()
    }

    render() {
        let {
          shortName,
          shortNameError,
          baseUrlError,
          baseUrl,
          usernameError,
          username,
          passwordError,
          password,
          enableEdit,
          connectorList,
          showAdvanced,
          connectorEdit,
          clientID,
          secretID,
        } = this.state;

        let {wizardMode} = this.props

        return (
          <div style={{ display: 'flex' }}>
                <SideMenu />
                <div style={{ 'width': '100%' }} className="CenterList">
                <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                    {this.renderPopulateDialog()}
                    {this.renderSnackbar()}
                    <div className="Containers-Main">
                        <div />
                        <Card>
                            <CardContent style={{ 'max-width': '80vw' }}>
                                <h4>CI Connectors</h4>
                                <div>Generally this is the way to connect to your integration tool like jenkins, bamboo, etc.</div>
                                <TextFieldInput
                                    id="shortName"
                                    label="Short Name"
                                    onChange={this.onFieldChange("shortName")}
                                    error={shortNameError}
                                    helperText={shortNameError ? 'Required field' : ''}
                                    value={shortName}
                                    placeholder="A short name for the connector"
                                    autoFocus={true}
                                />
                                <TextFieldInput
                                    id="baseUrl"
                                    label="Base URL"
                                    onChange={this.onFieldChange("baseUrl")}
                                    error={baseUrlError}
                                    helperText={baseUrlError ? 'Required field' : ''}
                                    value={baseUrl}
                                    placeholder="URL of the connector"
                                />
                                <TextFieldInput
                                    id="type"
                                    select
                                    label="Type"
                                    placeholder="Select Type"
                                    value={this.state.type}
                                    onChange={this.onTypeChange.bind(this)}
                                    InputProps={{
                                        style: {
                                          fontSize: '.875rem'
                                        }
                                    }}
                                >
                                    {
                                      types.map((type, index) => (
                                        <MenuItem className="globalMenuItem" key={index} value={type.value}>{type.text}</MenuItem>
                                      ))
                                    }
                                </TextFieldInput>
                                <Grid container justifyContent="flex-end">
                                    <Grid item style={{ marginTop: 5 }}>
                                          <Button
                                              color="primary"
                                              onClick={() => this.setState({ showAdvanced: !showAdvanced })}
                                              style={{ fontSize: '.75rem', padding: '0 5' }}
                                              variant="text">
                                              Advanced options
                                          </Button>
                                    </Grid>
                                </Grid>
                                {
                                  showAdvanced && (
                                    <div>
                                        <div>Pull Configuration</div>
                                        <span style={{ fontSize: '.75rem' }}>
                                          This setting will be used by those Containers with Pull configuration enabled. t-Triage will check frequently new test executions from your CI Tool.
                                        </span>
                                        <TextFieldInput
                                            id="username"
                                            label="Username"
                                            onChange={this.onFieldChange("username")}
                                            value={username}
                                            placeholder="Username"
                                        />
                                        <TextFieldInput
                                            id="password"
                                            label="User Token"
                                            onChange={this.onFieldChange("password")}
                                            value={password}
                                            placeholder="User Token"
                                        />
                                        <div style={{marginTop:20}}>Push Configuration</div>
                                        <span style={{ fontSize: '.75rem' }}>
                                          This setting will be used by those Containers with Push configuration enabled. Your CI Tool needs to be configured in order to send new test executions to t-Triage. <a href={WIKI_URL + "docs/DOC-6975?ru=2349&sr=stream"} target="_blank">More</a>
                                        </span>
                                        <TextFieldInput
                                            id="clientID"
                                            label="Client ID"
                                            value={clientID}
                                            className="readOnlyInput"
                                            InputProps={{
                                              readOnly: true,
                                              endAdornment:
                                              <div style={{ display: 'flex' }}>
                                                  <Tooltip title={'Generate'}>
                                                    <IconButton
                                                      style={{ padding: 5 }}
                                                      onClick={this.createAuthTokens.bind(this, connectorEdit ? connectorEdit.id : null)}
                                                      aria-label="Edit"
                                                      size="large">
                                                        <AutorenewIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Copy to clipboard">
                                                      <IconButton
                                                        style={{ padding: 5 }}
                                                        onClick={copyToClipboard.bind(this, clientID)}
                                                        size="large">
                                                        <AssignmentIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                              </div>
                                            }}
                                            placeholder="Generated Client ID"
                                        />
                                        <TextFieldInput
                                            id="secretID"
                                            label="Secret ID"
                                            value={secretID}
                                            className="readOnlyInput"
                                            InputProps={{
                                              readOnly: true,
                                              endAdornment:
                                                <Tooltip title="Copy to clipboard">
                                                    <IconButton
                                                      style={{ padding: 5 }}
                                                      onClick={copyToClipboard.bind(this, secretID)}
                                                      size="large">
                                                      <AssignmentIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }}
                                            placeholder="Generated Secret ID"
                                        />
                                    </div>
                                  )
                                }
                            </CardContent>
                            { wizardMode ? 
                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.wizardPrevious}
                                    variant="contained"
                                    color="secondary">
                                    Previous
                                </Button>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.wizardSkip}
                                    variant="contained"
                                    color="primary"
                                    disabled={this.state.connectorList.length == 0}>
                                    Skip
                                </Button>
                                <Button
                                    type="submit"
                                    className="globalButton"
                                    variant="contained"
                                    color="primary"
                                    disabled={!this.validateFields(true)}>
                                    Next
                                </Button>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.saveAndTest.bind(this)}
                                    variant="contained"
                                    style={this.validateFields(true) ? { backgroundColor: COLORS.green1, color: 'white' } : undefined}
                                    disabled={!this.validateFields(true)}>
                                    Test & Continue
                                </Button>
                            </CardActions>
                            :
                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.clearConnector.bind(this)}
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
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.saveAndTest.bind(this)}
                                    variant="contained"
                                    style={{ backgroundColor: COLORS.green1, color: 'white' }}>
                                    Save & Test
                                </Button>
                            </CardActions>
                            }
                            
                        </Card>
                        <div />
                    </div>
                    {!wizardMode &&
                    <div className="Containers-Main">
                            {
                              connectorList.length > 0 ?
                                <Paper>{this.renderList()}</Paper>
                              : this.state.searching ?
                                <Paper>
                                  <div className="circularProgressContainer">
                                    <CircularProgress color="primary" />
                                  </div>
                                </Paper> : ''
                            }
                    </div>}
                </form>
            </div>
            </div>
        );
    }
}
