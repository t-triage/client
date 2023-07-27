import React, { Component } from "react"
import Api from "./Api"
import axios from 'axios'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// UI Components
import Grid from "@mui/material/Grid"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"
import Snackbar from '@mui/material/Snackbar'
import SnackbarContent from '@mui/material/SnackbarContent'
import withStyles from '@mui/styles/withStyles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { green } from '@mui/material/colors';
import Alert from '@mui/material/Alert';


class FileTicketDialog extends Component {

  constructor(props) {
      super(props)

      this.issueTicket = {
        assignee: null,
        component: "",
        url: "",
        priority: 1,
        summary: "",
        description: "",
        product: null, //TO DO ver desde donde obtener el producto
        issueType: "OPEN",
        note: null,
        testCaseId: null
      }

      this.state = {
          isDialogOpen: false,
          users: [],
          autoGenerateEnabled: true,
          priority: 1,
          assignee: '',
          saveButtonDisabled: true,
          openSnackbar: false,
          openSnackbarError: false,
          summary: '',
      }

      this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount() {

      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUsers )
          .then(res => {
              this.setState({
                users: res.data.content
              })
          })
  }

  componentWillUnmount() {
        this.setState({isDialogOpen: false})
  }

  enableFields = ev => {
    this.setState({
        autoGenerateEnabled: ev.target.checked
    })
  }

  onSummaryChanges(ev) {
    let {value} = ev.target;
    this.setState({
      summary: value,
      saveButtonDisabled: value.length > 0 ? false : true,
    })
  }

  closeFileTicketDialog = () => {
    this.setState({isDialogOpen: false})
  }

  handleChangePriority = ev => {
      this.setState({
          priority: ev.target.value,
      })
  }

  handleChangeAssignee = ev => {
      this.setState({
          assignee: ev.target.value,
      })
  }


  handleSubmit = ev => {
    ev.preventDefault();
    const data = new FormData(ev.target);
    this.issueTicket.url = data.get('url');
    this.issueTicket.priority = data.get('priority');
    this.issueTicket.summary = !data.get('summary') ? null : data.get('summary');
    this.issueTicket.component = !data.get('component') ? null : data.get('component');
    this.issueTicket.description = !data.get('description') ? null : data.get('description');
    this.issueTicket.assignee = !this.state.assignee ? null : this.state.assignee;
    this.issueTicket.testCaseId = this.props.testTriage.testCaseId;

    axios({
      method: 'POST',
      url: Api.getBaseUrl() + Api.ENDPOINTS.PostIssueTicket,
      data: JSON.stringify(this.issueTicket),
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(
        response => response.ok ? this.showSuccessSnackbar() : this.showErrorSnackbar()
      )
  }

  showSuccessSnackbar = () => {
    this.setState({ openSnackbar: true });
    this.props.closeFiledTicketDialog()
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

  FiledTicketDialog = (props) => {
    return (
      <div>
        <Dialog
          open={this.props.isOpen}
          maxWidth="sm"
          onClose={this.props.closeFiledTicketDialog}
          aria-labelledby="filedTicket-dialog-title"
          aria-describedby="filedTicket-dialog-description"
      >
          <form onSubmit={this.handleSubmit}>
          <DialogTitle id="filedTicket-dialog-title">File Ticket</DialogTitle>
          <DialogContent id="filedTicket-dialog-description">

            <Grid container >
                <Grid item xs={12}>
                    <Grid container alignItems="flex-end" direction="row" justifyContent="space-between" spacing={24}>
                          <Grid item xs={12}>
                              <FormControl style={ !this.state.autoGenerateEnabled ? { "display" : "none" } : {width: '97%'} }>
                                  <TextField
                                    name="url"
                                    label="Ticket ID"
                                  />
                              </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                              <FormControl style={ !this.state.autoGenerateEnabled ? { "display" : "none" } : {width: '97%'} }>
                                  <TextField
                                    name="summary"
                                    label="Summary"
                                    value={this.state.summary}
                                    onChange={this.onSummaryChanges.bind(this)}
                                  />
                              </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                              <FormControl style={ !this.state.autoGenerateEnabled ? { "display" : "none" } : {width: '98%'} }>
                                  <InputLabel style={{ width: '95%' }} htmlFor="priority">Priority</InputLabel>
                                  <Select
                                    value={this.state.priority}
                                    onChange={this.handleChangePriority}
                                    inputProps={{
                                      name: 'priority',
                                      id: 'priority',
                                    }}
                                  >
                                    <MenuItem value={1}>High</MenuItem>
                                    <MenuItem value={3}>Medium</MenuItem>
                                    <MenuItem value={5}>Low</MenuItem>
                                  </Select>
                              </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                              <FormControl style={ !this.state.autoGenerateEnabled ? { "display" : "none" } : {width: '95%'} }>
                                  <TextField
                                    name="component"
                                    label="Component"
                                  />
                              </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                              <FormControl style={ !this.state.autoGenerateEnabled ? { "display" : "none" } : {width: '99%'} }>
                                  <InputLabel htmlFor="assignee">Assignee</InputLabel>
                                  <Select
                                    value={this.state.assignee}
                                    onChange={this.handleChangeAssignee}
                                    inputProps={{
                                      name: 'assignee',
                                      id: 'assignee',
                                    }}
                                  >
                                  {this.state.users.map(user => (
                                    <MenuItem key={user.realname} value={user}>
                                      {user.realname}
                                    </MenuItem>
                                  ))}
                                  </Select>
                              </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                              <FormControl style={ !this.state.autoGenerateEnabled ? { "display" : "none" } : {width: '98%'} }>
                                  <TextField
                                    multiline
                                    name="description"
                                    label="Description"
                                  />
                              </FormControl>
                          </Grid>
                    </Grid>
                </Grid>
            </Grid>

          </DialogContent>

          <DialogActions>
              <Button
                  variant="contained"
                  className="globalButton"
                  type="submit"
                  color="primary"
                  disabled={this.state.saveButtonDisabled}>
                  Save Ticket
              </Button>
              <Button
                  variant="contained"
                  className="globalButton"
                  onClick={this.props.closeFiledTicketDialog}
                  color="secondary">
                  Close
              </Button>
          </DialogActions>
          </form>
      </Dialog>
      <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={2000}
          onClose={this.hideSnackbar}
        >
          <Alert variant={"filled"} severity="success" onClose={this.hideSnackbar}>
              Issue created successfully
          </Alert>
      </Snackbar>
      <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.openSnackbarError}
          autoHideDuration={2000}
          onClose={this.hideSnackbarError}
        >
          <Alert variant={"filled"} severity="error" onClose={this.hideSnackbarError}>
              Sorry! Something was wrong!
          </Alert>
      </Snackbar>
    </div>
    );
  }

  render() {
      return(
          <this.FiledTicketDialog />
      )
  }
}

export default FileTicketDialog;
