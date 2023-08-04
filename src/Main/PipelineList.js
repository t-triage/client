import React, { Component } from 'react';
import ContentPicker from "./Components/ContentPicker"
import Api from "./Components/Api"
import PipelineTable from './Components/PipelineTable'
import axios from 'axios'
import * as _  from 'underscore'
import CircularProgress from "@mui/material/CircularProgress"
import Snackbar from '@mui/material/Snackbar'
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import withStyles from '@mui/styles/withStyles';
import {
  styles,
  COLORS,
  renderDeadLine,
  DEFAULT_PIPELINE_FILTERS,
  GITBOOK_URL
} from './Components/Globals'
import { scrollToTop } from '../Admin/AdminUtils'
import Alert from '@mui/material/Alert';


const CancelToken = axios.CancelToken;
let cancel;

class PipelineList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      newTestOpen: false,
      errorMessage: false,
      pipelines: [],
      isLoading: false,
      helpEnabled: false,
      expandedTests: [],
      selectedTests: [],
      select: true,
      expandedRun: null,
      defaultItemsComponent1: null,
      defaultItemsComponent2: null,
      defaultItemsComponent3: null,
      loading: false,
      fileReport: null,
      openSnackbar: false,
      snackbarMsg: '',
      snackbarVariant: '',
      rowsPerPage: null,
      page: null,
      selectedPipeline: -2,
      selectedContainer: props.params.containerID,
    };
    this.helpItems = [
      [
        {
          title: 'PAGE GOAL',
          text: 'Manage Automated Tests'
        },
        {
          title: 'USER ACTION',
          text: 'Add test cases to a Pipeline'
        },
        {
          title: 'DOCUMENTATION',
          text: `Detailed documentation <a target="_blank" href=${GITBOOK_URL + "docs/user-guide/manual-test-cases"}>HERE</a>`
        },
        {
          title: null,
          text: null,
          videoURL: 'https://youtu.be/4dpRxGExdaA'
        }
      ]
    ];
  }

  componentDidMount() {
    this.setState({
      isLoading: true, page: 0, rowsPerPage: 5,
    }, () => this.fetchPipelinesList(), scrollToTop())
    document.title = "Pipeline"
  }

  fetchPipelinesList = () => {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetPipelineList)
      .then(res => {
        this.setState({
          pipelines: res.data,
          isLoading: false,
        })
      })
      .catch(err => {
        console.log("Error fetching Pipelines...")
        this.setState({ fetchError: err })
      })
  }
  
  fetchPipelinePerContainer = (id) => {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetPipelinePerContainer + '?containerId=' + id)
      .then(res => {
        this.setState({
          pipelines: res.data,
          isLoading: false,
        })
      })
      .catch(err => {
        console.log("Error fetching Tests...")
        this.setState({ fetchError: err })
      })
  }

  fetchCurrentUser() {
    this.setState({
      currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
    })
  }
  componentDidUpdate() {
    let { currentUser } = this.state
    if (!currentUser || currentUser === {}) {
      this.fetchCurrentUser()
    }
  }



  onHelpClick = filter => event => {
    let value = this.state[filter]
    this.setState({
      [filter]: !value
    })
  }



  showSnackbar(msg, variant) {
    this.setState({ openSnackbar: true, snackbarMsg: msg, snackbarVariant: variant });
  };

  hideSnackbar() {
    this.setState({
      openSnackbar: false,
      snackbarMsg: '',
    })
  }
  setPriority(type, buildTriageId, shortPriority) {
    let { state } = this;
    let today = type === 'today'
    let suiteList = today;


  }



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
        <Alert variant={"filled"} severity={this.state.snackbarVariant ? this.state.snackbarVariant : "info"} onClose={this.hideSnackbar.bind(this)}>
          {this.state.snackbarMsg}
        </Alert>

      </Snackbar>

    )
  }

  selectPipeline = (ev) => {

    if (!ev.ctrlKey && ev.button !== 1) {
      let pipelineID = ev
      this.props.selectPipeline(pipelineID)
    }

  }
  updatedPipeline = (newPipelines) => {
    let newState = { pipelines: newPipelines };
    this.setState(newState)
    this.fetchPipelinesList()
  };

  render() {
    let {

      currentUser,
      pipelines,
      isLoading,
      fetchError,
    } = this.state;
    let { classes } = this.props;

    return (
      <div className="homeRoot" style={{ marginTop: "100px" }}>
        {this.renderSnackbar()}
        {
          pipelines && (
            <div style={isLoading ? { opacity: 0.6 } : {}}>
              <Paper
                style={{ margin: "10px 30px", backgroundColor: "#f6f6f6", boxShadow: "none" }}
                classes={{ root: classes.noShadow }}
              >
                <ContentPicker
                  pipelines={this.state.pipelines}
                  selectedPipeline={this.state.selectedPipeline}
                  fetchPipelinesList={this.fetchPipelinesList}
                  fetchPipelinePerContainer={this.fetchPipelinePerContainer} />
                <PipelineTable pipelines={pipelines} selectPipeline={this.selectPipeline} classes={classes} fetchError={fetchError} isLoading={isLoading} updatedPipeline={this.updatedPipeline} />
              </Paper>
            </div>
          )
        }
        {
          fetchError && (
            <div style={{ position: "absolute", left: "calc(50% - 30px)", top: "90%" }} >
              <h2 className="noRowsSuites">{"Error loading pipelines"}</h2>
            </div>
          )
        }
        { isLoading &&
                       <CircularProgress style={{position: "absolute", top:"100%", left:"50%"}} color="primary" />
        }
      </div>
    )
  }
}

export default withStyles(styles)(PipelineList)
