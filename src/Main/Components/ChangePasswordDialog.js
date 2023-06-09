import React, { Component } from "react"
import Api from "./Api"
import axios from 'axios'
import { MySnackbarContent, snackbarStyle } from './Globals'

// UI Components
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import Snackbar from '@material-ui/core/Snackbar'
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import {renderChangePasswordDialog, TextFieldInput} from './TriageUtils'
import InputAdornment from "@material-ui/core/InputAdornment"
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

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
			<Grid key={this.state.currentUser.id} container spacing={16} style={{ marginTop: 0 }}>
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
									>
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
									>
										{showNewPasswordRepeat ? <Visibility /> : <VisibilityOff />}
									</IconButton>
								</InputAdornment>

						}}
						style={{marginTop:20}}
					/>
				</Grid>
			</Grid>
		]
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
        <MySnackbarContentWrapper
          onClose={this.hideSnackbar}
          variant="success"
          message="Password updated successfully"
        />
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
        <MySnackbarContentWrapper
          onClose={this.hideSnackbarError}
          variant="error"
          message="Sorry! Something went wrong!"
        />
      </Snackbar>
      ]
  }
}

export default ChangePasswordDialog;
