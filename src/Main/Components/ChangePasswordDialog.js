import React, { Component } from "react"
import Api from "./Api"
import axios from 'axios'

// UI Components
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import Snackbar from '@mui/material/Snackbar'
import withStyles from '@mui/styles/withStyles';
import IconButton from '@mui/material/IconButton'
import {renderChangePasswordDialog, TextFieldInput} from './TriageUtils'
import InputAdornment from "@mui/material/InputAdornment"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';


class ChangePasswordDialog extends Component {

  constructor(props) {
      super(props)

      this.state = {
				currentUser: null,
        isDialogOpen: false,
        openSnackbar: false,
        openSnackbarError: false,
				isSaving: false,
				newPassword: '',
				newPasswordError: false,
				showNewPassword: false,
				newPasswordRepeat: '',
				newPasswordRepeatEmptyError: false,
				newPasswordRepeatMatchError: false,
				showNewPasswordRepeat: false,
      }
  }

	componentDidUpdate() {
		let {currentUser} = this.state
		if (!currentUser || currentUser === {}) {
			this.fetchCurrentUser()
		}
	}

	componentWillMount() {
		this.fetchCurrentUser()
	}

	fetchCurrentUser() {
		this.setState({
			currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
		})
	}

  componentWillUnmount() {
        this.setState({
					newPassword: '',
					newPasswordRepeat: ''
				})
  }

  onCloseDialog() {
		this.setState({
			isSaving: false,
			newPassword: '',
			newPasswordError: false,
			showNewPassword: false,
			newPasswordRepeat: '',
			newPasswordRepeatEmptyError: false,
			newPasswordRepeatMatchError: false,
			showNewPasswordRepeat: false,
		})
		this.props.onClose();
	}

	onFieldChange = field => event => {
		let error = {
			[`${field}Error`]: false
		}
		if (field === 'newPasswordRepeat') {
			error = {
				[`${field}EmptyError`]: false,
				[`${field}MatchError`]: false
			}
		}
		this.setState({
			[field]: event.target.value,
			...error
		})
	}

	handleClickShowPassword = name => ev => {
		let value = this.state[name]
		this.setState({
			[name]: !value,
		})
	}

	validateFields() {
		let {newPassword, newPasswordRepeat} = this.state;
		let result = newPassword && newPasswordRepeat && newPassword === newPasswordRepeat;

		this.setState({
			newPasswordError: !newPassword,
			newPasswordRepeatEmptyError: !newPasswordRepeat,
			newPasswordRepeatMatchError: newPassword && newPassword.length > 0 && newPassword !== newPasswordRepeat
		})
		return result;
	}

	updatePassword() {
		let {newPassword, currentUser} = this.state;
		axios({
			method: "PUT",
			url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateUser,
			data: JSON.stringify({
				...currentUser,
				password: newPassword
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then(res => {
				this.showSuccessSnackbar()
				this.onCloseDialog()
			})
      .catch(err => {
				this.showErrorSnackbar()
				this.setState({
					isSaving: false,
				})
      })
	}

	onSaveNewPassword(ev) {
		ev.preventDefault()
		if (this.validateFields()) {
			this.setState({
				isSaving: true,
			}, () => this.updatePassword())
		}
	}

	renderShowPasswordActionButtons() {
		return [
			<Button
				key="cancelBtn"
				onClick={this.onCloseDialog.bind(this)}
				className="globalButton"
				type="submit"
				variant="contained"
				color={'secondary'}>
				{'Cancel'}
			</Button> ,
			<Button
				key="submitBtn"
				type="submit"
				disabled={this.state.isSaving}
				onClick={this.onSaveNewPassword.bind(this)}
				className="globalButton"
				variant="contained"
				style={{ marginLeft: 8 }}
				color="primary">
				Change
			</Button>
		]
	}

	renderShowPasswordDialogContent() {
		let {newPassword , newPasswordError, showNewPassword, newPasswordRepeat, newPasswordRepeatEmptyError, newPasswordRepeatMatchError, showNewPasswordRepeat} = this.state;

		return [
			<Grid key={this.state.currentUser.id} container spacing={2} style={{ marginTop: 0 }}>
				<Grid item xs={12} sm={12}>
					<TextFieldInput
						id="newPassword"
						label="New Password"
						placeholder="Enter new Password"
						error={newPasswordError}
						helperText={newPasswordError ? 'Required field' : ''}
						onChange={this.onFieldChange("newPassword")}
						value={newPassword}
						type={showNewPassword ? 'text' : 'password'}
						InputProps={{
							style: {
								paddingRight: 0,
							},
							endAdornment:
								<InputAdornment position="end">
									<IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={this.handleClickShowPassword("showNewPassword")}
                                        size="large">
										{showNewPassword ? <Visibility /> : <VisibilityOff />}
									</IconButton>
								</InputAdornment>

						}}
						style={{marginTop:20}}
					/>
				</Grid>
				<Grid item xs={12} sm={12}>
					<TextFieldInput
						id="newPasswordRepeat"
						label="Repeat New Password"
						placeholder="Repeat your new password"
						error={newPasswordRepeatEmptyError || newPasswordRepeatMatchError}
						helperText={newPasswordRepeatEmptyError ? 'Required field' : (newPasswordRepeatMatchError ? 'Passwords don\'t match' : '')}
						onChange={this.onFieldChange("newPasswordRepeat")}
						value={newPasswordRepeat}
						type={showNewPasswordRepeat ? 'text' : 'password'}
						InputProps={{
							style: {
								paddingRight: 0,
							},
							endAdornment:
								<InputAdornment position="end">
									<IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={this.handleClickShowPassword("showNewPasswordRepeat")}
                                        size="large">
										{showNewPasswordRepeat ? <Visibility /> : <VisibilityOff />}
									</IconButton>
								</InputAdornment>

						}}
						style={{marginTop:20}}
					/>
				</Grid>
			</Grid>
		];
	}


  showSuccessSnackbar = () => {
    this.setState({ openSnackbar: true });
  };

  showErrorSnackbar = () => {
    this.setState({ openSnackbarError: true });
  };

  hideSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
     this.setState({ openSnackbar: false });
  };

 hideSnackbarError = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  	this.setState({ openSnackbarError: false });
 };

  render() {
      return [
        renderChangePasswordDialog(this.props.isOpen, this.onCloseDialog.bind(this), this.renderShowPasswordDialogContent(), 'Change password', this.renderShowPasswordActionButtons()),
				<Snackbar
					key="successSnackbar"
          anchorOrigin={{
            vertical: 'bottom',
              horizontal: 'center',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={2000}
          onClose={this.hideSnackbar}
        >
				<Alert variant={"filled"} severity="success" onClose={this.hideSnackbar}>
					Password updated successfully
				</Alert>
      </Snackbar>,
      <Snackbar
				key="errorSnackbar"
				anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={this.state.openSnackbarError}
        autoHideDuration={2000}
        onClose={this.hideSnackbarError}
      >
		  <Alert variant={"filled"} severity="error" onClose={this.hideSnackbarError}>
			  Sorry! Something went wrong!
		  </Alert>
      </Snackbar>
      ]
  }
}

export default ChangePasswordDialog;
