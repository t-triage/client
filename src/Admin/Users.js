import React, { Component } from "react"
import Api from "../Main/Components/Api"
import axios from 'axios'
import { find } from "underscore"
import { COLORS } from '../Main/Components/Globals'


import { scrollToTop, TextFieldInput } from './AdminUtils'

// Icons
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle"
import AddCircleIcon from "@mui/icons-material/AddCircle"
import EditIcon from "@mui/icons-material/Edit"
import AppIcon from "@mui/icons-material/Person"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// UI Components
import Divider from "@mui/material/Divider"
import MenuItem from "@mui/material/MenuItem"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import Avatar from "@mui/material/Avatar"
import Tooltip from "@mui/material/Tooltip"
import CircularProgress from "@mui/material/CircularProgress"
import Snackbar from "@mui/material/Snackbar"
import withStyles from '@mui/styles/withStyles';

import SideMenu from "./SideMenu"
import Alert from '@mui/material/Alert';

const RoleList = [
  // { value: 1, label: 'View' },
  { key: 2, value: 'ROLE_USER', label: 'User' },
  { key: 3, value: 'ROLE_ADMIN', label: 'Admin' },
]

const INTERNAL_LOGIN_ENABLED = "INTERNAL_LOGIN_ENABLED"

export default class Users extends Component {

    state = {
      userList: [],
      userName: '',
      userNameError: false,
      userRealName: '',
      password: '',
      passwordError: false,
      showPassword: false,
      passwordRepeat: '',
      passwordRepeatError: false,
      showPasswordRepeat: false,
      roleType: 'ROLE_USER',
      userRealNameError: false,
      userRealNameShortError: false,
      showAdvanced: false,
      enableEdit: false,
      userEdit: null,
      internal: true,
      skipped: false,
      snackbarsList: [],
    }

    componentDidMount() {
      this.fetchUsers()
      this.fetchInternalLoginProperty()
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

    fetchUsers() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUsers+ "?sort=realname,asc")
      .then(res => {
        this.setState({
          userList: res.data.content,
        })
      })
    }

    validateFields(skipSetState) {
      let {userName, userRealName, password, passwordRepeat, enableEdit, internal} = this.state;
      let result = true;
      if (userName === '' || userRealName === '' || (userRealName.length < 5 && userRealName.length >= 1)) {
        result = false;
      }
      if (internal) {
        if (!enableEdit && password === '') {
          result = false
        }
        if (password.length > 0 && password !== passwordRepeat) {
          result = false;
        }
      }

      if(!skipSetState)
        this.setState({
          userNameError: userName === '' || !userName.includes("@") ? true : false,
          userRealNameError: userRealName === '' ? true : false,
          userRealNameShortError: userRealName.length < 5 && userRealName.length >= 1 ? true : false,
          passwordError: !enableEdit && password === '' ? true : false,
          passwordRepeatError: password.length > 0 && password !== passwordRepeat ? true : false,
        })

      return result;
    }

    clearUser() {
      this.setState({
        enableEdit: false,
        userName: '',
        userRealName: '',
        roleType: 'ROLE_USER',
        userEdit: null,
        password: '',
        passwordRepeat: '',
        internal: true,
      })
    }

    createUser() {
      let {userName, userRealName, roleType, password} = this.state;
      let timestamp = new Date().getTime()

      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateUser,
          data: JSON.stringify({
            enabled: true,
            realname: userRealName,
            roleType: roleType,
            timestamp: timestamp,
            updated: timestamp,
            username: userName,
            password: password,
            provider: "internal",
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        if (!!this.props.storeData)
          this.props.storeData("user", res.data.id)
        if (this.props.wizardMode)
          this.wizardNext();

        this.clearUser()
        this.fetchUsers()
      })
      .catch(err => {
        if (err.response.data.code == 406)
          err = "Unable to create user, you have reached the limit of 5 users"
        this.addSnackbar(err, 'error')
      })
      
    }

    saveUser() {
      let {userName, password, userRealName, roleType, userEdit} = this.state;
      this.enableUser({
        ...userEdit,
        roleType: roleType,
        realname: userRealName,
        updated: new Date().getTime(),
        username: userName,
        password: password,
      });
      if (this.props.wizardMode)
          this.wizardNext();
      this.clearUser()
    }

    disableInternalLogin() {
      let {internalLoginEnabled} = this.state
      if (internalLoginEnabled) {
        this.updateProperty({
          description: internalLoginEnabled.description,
          enabled: true,
          name: internalLoginEnabled.name,
          id: internalLoginEnabled.id,
          timestamp: internalLoginEnabled.timestamp,
          updated: new Date().getTime(),
          value: 'false',
        })
      } else {
        let timestamp = new Date().getTime()
        internalLoginEnabled = {
          description: 'Internal Login Enabled',
          enabled: true,
          name: INTERNAL_LOGIN_ENABLED,
          timestamp: timestamp,
          updated: timestamp,
          value: 'false',
        }
        this.createProperty(internalLoginEnabled)
      }
    }

    enableInternalLogin() {
      let {internalLoginEnabled} = this.state
      internalLoginEnabled = { ...internalLoginEnabled, value: 'true' }
      this.updateProperty(internalLoginEnabled)
    }

    updateProperty(internalLoginEnabled) {
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateProperty,
          data: JSON.stringify(internalLoginEnabled),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(() => this.fetchInternalLoginProperty())
    }

    createProperty(internalLoginEnabled) {
      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateProperty,
          data: JSON.stringify(internalLoginEnabled),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(() => this.fetchInternalLoginProperty())
    }

    fetchInternalLoginProperty() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.FindProperty + INTERNAL_LOGIN_ENABLED)
      .then(res => {
        let internalLoginEnabled = res.data[0]
        this.setState({
          internalLoginEnabled: internalLoginEnabled ? internalLoginEnabled : null,
          showInternalUsersButton: true,
        })
      })
    }

    enableEditUser(index) {
      let {userList} = this.state;
      let user = userList[index];

      this.setState({
        enableEdit: true,
        userName: user.username,
        userRealName: user.realname,
        roleType: user.roleType,
        userEdit: user,
        internal: user.internal,
      }, () => scrollToTop())
    }

    enableUser(user) {
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateUser,
          data: JSON.stringify({...user, enabled: true}),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        this.fetchUsers()
      })
    }

    disableUser(id) {
      axios({
          method: "DELETE",
          url: Api.getBaseUrl() + Api.ENDPOINTS.DisableUser + id,
      })
      .then(res => this.fetchUsers())
    }

    onFieldChange = field => event => {
      this.setState({
        [field]: event.target.value,
        [`${field}Error`]: false,
      })
    }

    getListItem(user, index, disabled) {
      return (
        <ListItem key={user.id} style={{ opacity: disabled ? '.5' : '1' }}>
            <ListItemAvatar>
                <Avatar src={user.avatar ? user.avatar : ''}>
                    {
                      !user.avatar && <AppIcon />
                    }
                </Avatar>
            </ListItemAvatar>
            <Grid container style={{ marginLeft: 16 }}>
                <Grid item xs={6}>
                    <ListItemText
                        primary={user.displayName}
                        secondary={user.username}
                    />
                </Grid>
                <Grid item xs={5} style={{ paddingRight: 10 }}>
                    <ListItemText
                        primary={'Role'}
                        secondary={find(RoleList, { value: user.roleType }).label}
                    />
                </Grid>
            </Grid>
            <ListItemSecondaryAction>
                <Tooltip title="Edit">
                    <IconButton
                      style={{
                        opacity: user.enabled ? '1' : '.5',
                        cursor: user.enabled ? 'pointer' : 'default',
                      }}
                      onClick={
                          user.enabled ?
                              this.enableEditUser.bind(this, index)
                          :   null
                      }
                      aria-label="Edit"
                      size="large">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={user.enabled ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      onClick={
                        user.enabled ?
                          this.disableUser.bind(this, user.id)
                        : this.enableUser.bind(this, user)
                      }
                      aria-label="Delete"
                      size="large">
                        { user.enabled && <RemoveCircleIcon /> }
                        { !user.enabled && <AddCircleIcon /> }
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
      );
    }

    renderList = () => {
        let {userList} = this.state;
        let rows = []
        let rowsDisabled = []

        if (userList) {
          userList.map((user, index) => {
            if (user.enabled) {
              rows.push(this.getListItem(user, index, false))
            } else {
              rowsDisabled.push(this.getListItem(user, index, true))
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
          this.saveUser()
        } else {
          this.createUser()
        }
        
      }
    }

    addSnackbar(msg, variant) {
      let {snackbarsList} = this.state;
  
      snackbarsList.push({ openSnackbar: true, snackbarMsg: msg, snackbarVariant: variant });
      this.setState({
        snackbarsList: snackbarsList
      });
    };
  
  
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

    wizardUpdate = () => {
        let {data} = this.props;
        let id = data.user
        let index = this.state.userList.findIndex(x => x.id == id);
        this.enableEditUser(index)
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

    handleClickShowPassword = name => ev => {
      let value = this.state[name]
      this.setState({
        [name]: !value,
      })
    }

    render() {
        let {
          userName,
          userNameError,
          userRealName,
          userRealNameError,
          userRealNameShortError,
          enableEdit,
          internalLoginEnabled,
          showInternalUsersButton,
          password,
          showPassword,
          passwordError,
          passwordRepeat,
          showPasswordRepeat,
          passwordRepeatError,
          userList,
          internal,
        } = this.state;

        let {wizardMode} = this.props

        return (
          <div style={{display: 'flex'}}>
            <SideMenu/>
            <div style={{'width': '100%'}} className="CenterList">
                <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                  {this.renderSnackbars()}
                    <div className="Containers-Main">
                        <Card>
                            <CardContent style={{ 'max-width': '80vw'}}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4>Users</h4>
                                        <div>
                                            We recommend to disable internal user functionality and use any other external authentication method. Please contact <a href="mailto:support@ttriage.com">t-Triage Support</a> to get it properly configured.
                                        </div>
                                    </div>
                                    {
                                        showInternalUsersButton && (
                                          <Button
                                              type="button"
                                              variant="outlined"
                                              className="globalButton"
                                              style={{
                                                width: 215,
                                                minWidth: 200,
                                              }}
                                              onClick={
                                                internalLoginEnabled ?
                                                  internalLoginEnabled.value === 'false' ?
                                                    this.enableInternalLogin.bind(this)
                                                  : this.disableInternalLogin.bind(this)
                                                : this.disableInternalLogin.bind(this)
                                              }
                                              color={
                                                internalLoginEnabled ?
                                                  internalLoginEnabled.value === 'false' ?
                                                    "primary"
                                                  : "secondary"
                                                : "secondary"
                                              }>
                                                  {
                                                    internalLoginEnabled ?
                                                      internalLoginEnabled.value === 'false' ?
                                                        "Enable Internal Users"
                                                      : "Disable Internal Users"
                                                    : "Disable Internal Users"
                                                  }
                                            </Button>
                                        )
                                    }
                                </div>
                                <TextFieldInput
                                    id="userName"
                                    label="User Email"
                                    placeholder="User's email address"
                                    error={userNameError}
                                    helperText={userNameError ? 'Invalid email' : ''}
                                    onChange={this.onFieldChange("userName")}
                                    InputProps={{
                                      readOnly: internal ? false : true,
                                    }}
                                    autoFocus={true}
                                    value={userName}
                                />
                                <TextFieldInput
                                    id="realName"
                                    label="Real Name"
                                    placeholder="User's real name"
                                    error={(userRealNameError, userRealNameShortError)}
                                    helperText={userRealNameError ? 'Required field' : userRealNameShortError ? 'Name must have at least 5 characters': ''}
                                    onChange={this.onFieldChange("userRealName")}
                                    InputProps={{
                                      readOnly: internal ? false : true,
                                    }}
                                    value={userRealName}
                                />
                                {
                                  internal && (
                                    <div>
                                      <TextFieldInput
                                          id="password"
                                          label="Password"
                                          placeholder="Password"
                                          error={passwordError}
                                          helperText={passwordError ? 'Required field' : ''}
                                          onChange={this.onFieldChange("password")}
                                          InputProps={{
                                            readOnly: internal ? false : true,
                                          }}
                                          value={password}
                                          type={showPassword ? 'text' : 'password'}
                                          InputProps={{
                                            style: {
                                              paddingRight: 0,
                                            },
                                            endAdornment:
                                              <InputAdornment position="end">
                                                <IconButton
                                                  aria-label="Toggle password visibility"
                                                  onClick={this.handleClickShowPassword("showPassword")}
                                                  size="large">
                                                  {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                              </InputAdornment>

                                          }}
                                          style={{marginTop:20}}
                                      />
                                      <TextFieldInput
                                          id="passwordRepeat"
                                          label="Repeat Password"
                                          placeholder="Repeat your password"
                                          error={passwordRepeatError}
                                          helperText={passwordRepeatError ? 'Passwords don\'t match' : ''}
                                          onChange={this.onFieldChange("passwordRepeat")}
                                          InputProps={{
                                            readOnly: internal ? false : true,
                                          }}
                                          value={passwordRepeat}
                                          type={showPasswordRepeat ? 'text' : 'password'}
                                          InputProps={{
                                            style: {
                                              paddingRight: 0,
                                            },
                                            endAdornment:
                                              <InputAdornment position="end">
                                                <IconButton
                                                  aria-label="Toggle password visibility"
                                                  onClick={this.handleClickShowPassword("showPasswordRepeat")}
                                                  size="large">
                                                  {showPasswordRepeat ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                              </InputAdornment>

                                          }}
                                          style={{marginTop:20}}
                                      />
                                    </div>
                                  )
                                }
                                <TextFieldInput
                                    id="role"
                                    select
                                    label="Role"
                                    InputProps={{
                                        style: {
                                          fontSize: '.875rem',
                                        },
                                    }}
                                    value={this.state.roleType}
                                    onChange={this.onFieldChange("roleType")}
                                >
                                    {RoleList.map(p => (
                                        <MenuItem className="globalMenuItem" key={p.key} value={p.value}>{p.label}</MenuItem>
                                    ))}
                                </TextFieldInput>
                            </CardContent>
                            {
                              internalLoginEnabled && (internalLoginEnabled.value === 'true' || (internalLoginEnabled.value === 'false' && enableEdit)) &&
                                ( wizardMode ? 
                                  <CardActions style={{justifyContent: 'flex-end', marginRight: 8}}>
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
                                        disabled={this.state.userList.length == 0}>
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
                                </CardActions>
                                :
                                <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                    <Button
                                        type="button"
                                        className="globalButton"
                                        onClick={this.clearUser.bind(this)}
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
                                </CardActions>)
                            }
                        </Card>
                        <div />
                    </div>
                    {!wizardMode &&
                    <div className="Containers-Main">
                        <Paper>
                            {
                              userList.length > 0 ?
                                this.renderList()
                              : <div className="circularProgressContainer">
                                  <CircularProgress color="primary" />
                                </div>
                            }
                        </Paper>
                    </div>}
                </form>
            </div>
            </div>
        );
    }
}
