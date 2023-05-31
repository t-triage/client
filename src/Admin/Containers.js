import React, { Component } from "react"
import Api from "../Main/Components/Api"
import axios from 'axios'

import { find } from "underscore"
import UserPicker from "../Main/Components/UserPicker"
import SuiteActionDialog from "../Main/Components/SuiteActionDialog"
import { MySnackbarContent, snackbarStyle, COLORS } from '../Main/Components/Globals'
import {
  PriorityList,
  WeekList,
  HourList,
  defaultContainerState,
  getCreateContainerBody,
  getSaveContainerBody,
  scrollToTop,
  TextFieldInput,
  extraDataTooltip,
} from './AdminUtils'

import Blue from "@material-ui/core/colors/blue"

// Icons
import FolderIcon from "@material-ui/icons/Folder"
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import EditIcon from "@material-ui/icons/Edit"
import RotateRightIcon from "@material-ui/icons/RotateRight"
import FileCopyIcon from "@material-ui/icons/FileCopy"

// UI Components
import TextField from "@material-ui/core/TextField"
import Grid from "@material-ui/core/Grid"
import Divider from "@material-ui/core/Divider"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import IconButton from "@material-ui/core/IconButton"
import Paper from "@material-ui/core/Paper"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Button from "@material-ui/core/Button"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import MenuItem from "@material-ui/core/MenuItem"
import Checkbox from "@material-ui/core/Checkbox"
import Tooltip from "@material-ui/core/Tooltip"
import Snackbar from "@material-ui/core/Snackbar"
import CircularProgress from "@material-ui/core/CircularProgress"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { withStyles } from '@material-ui/core/styles'

import SideMenu from "./SideMenu"

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

export default class Connector extends Component {

    constructor(props) {
        super(props)
        this.state = defaultContainerState
    }

    componentDidMount() {
      this.fetchContainers()
      this.fetchProducts()
      this.fetchConnectors()
    }

    componentDidUpdate(prevProps, prevState) {
			let {isActive, isPrevious, setPrevious} = this.props;
			let {skipped} = this.state;

      if(isActive && prevProps != this.props) {
				this.fetchProducts()
				this.fetchConnectors()

				if (isPrevious) {
					setPrevious()
					if (!skipped)
						this.wizardUpdate()
				}
      }
    }

    fetchContainers() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetContainers + "?sort=name,asc")
      .then(res => {
        let {content} = res.data;
        this.setState({
          containersList: content,
          searching: false,
        })
      })
    }

    fetchProducts() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + '?query=enabled:true&sort=name,asc')
      .then(res => {
        let {content} = res.data;
        this.setState({
          productList: content,
          product: content[0].id,
        })
      })
    }

    fetchConnectors() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetConnectors + '?query=enabled:true&sort=name,asc')
      .then(res => {
        let {content} = res.data;
        this.setState({
          connectorList: content,
          connector: content[0].id,
          connectorName: content[0].type
        })
      })
    }

    clearContainer() {
      let {containersList, connectorList, productList} = this.state
      this.setState({
        ...defaultContainerState,
        containersList,
        connectorList,
        productList,
        connector: connectorList[0].id,
        product: productList[0].id,
        connectorName: connectorList[0].type
      })
    }

    clearContainerAndSlack() {
      this.clearContainer()
      this.setState({
        slackChannel: '',
        slackDailyChannel: '',
        slackToken: '',
        slackEdit: null,
      })
    }

    createContainer(test) {
      let body = getCreateContainerBody(this.state)
        // let handleResolver=this.handlePopulateMode(body.populateMode)
        // body.populateMode=handleResolver
      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateContainer,
          data: JSON.stringify(body),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        if (!!this.props.storeData)
          this.props.storeData("container", res.data.id)

        this.createSlackIntegration(res.data.id, res.data.product, test)
        this.clearContainer()
        if (test) {
          this.validateContainer(res.data);
        } else {
          this.fetchContainers()
        }
      })
    }

    saveContainer(test) {
      
      let body = getSaveContainerBody(this.state)
      this.enableContainer(body, true, test)
      if (this.state.slackEdit) {
        this.saveSlackIntegration(body.id, test)
      } else {
        this.createSlackIntegration(body.id, body.product, test)
      }
      this.clearContainer()
    }

    validateContainer(container) {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.ValidateContainer + container.id)
      .then(res => {
        if (res.data) {
          this.fetchContainers()
          this.addSnackbar('Container test passed.', 'success')
          this.setState({validatedContainer: true})
        } else {
          this.disableContainer(container.id)
          this.enableEditContainer(null, container)
          this.addSnackbar('Container test failed and it is temporarily disabled.<br />Please review your configuration, enable, edit and try again.', 'error')
          this.setState({validatedContainer: false})
        }
      })
    }

    enableEditContainer(index, containerEdit) {
      let {containersList} = this.state
      let container = containerEdit ? containerEdit : containersList[index]
			if (container.triageSpec) {
				
				let {frequencyCron} = container.triageSpec
				this.getFrequencyCronStates(frequencyCron)
			}
      this.getSlackIntegration(container.id)
      this.setState({
        enableEdit: true,
        shortName: container.name,
        url: container.url,
        reportType: container.reportType,
        description: container.description ? container.description : '',
        product: container.product,
        connector: container.connector,
        populateMode: container.populateMode,
        assignee: container.triageSpec.triager,
        priority: container.triageSpec.priority,
        minAmountOfTests: container.triageSpec.expectedMinAmountOfTests,
        triageFrecuencyWeek: container.triageSpec.everyWeeks,
        passRate: container.triageSpec.expectedPassRate,
        container: container.triageSpec.container,
        containerEdit: container,
        extraData: container.hiddenData ? container.hiddenData : '',
      }, () => scrollToTop())
    }

    getFrequencyCronStates(frequencyCron) {
      let frequencyCronValue =frequencyCron.substring(0, 7).replace('*','').trim()
      let triageFrecuencyHour = find(HourList, { value: frequencyCronValue }).value
      let wildcards = frequencyCron.match(/\*/gi).length
      this.setState({
        triageFrecuencyHour,
        triageMonday: wildcards === 3 ? true : frequencyCron.includes("MON"),
        triageTuesday: wildcards === 3 ? true : frequencyCron.includes("TUE"),
        triageWednesday: wildcards === 3 ? true : frequencyCron.includes("WED"),
        triageThursday: wildcards === 3 ? true : frequencyCron.includes("THU"),
        triageFriday: wildcards === 3 ? true : frequencyCron.includes("FRI"),
        triageSaturday: wildcards === 3 ? true : frequencyCron.includes("SAT"),
        triageSunday: wildcards === 3 ? true : frequencyCron.includes("SUN"),
      })
    }

	testSlackIntegration(id) {
		axios.get(Api.getBaseUrl() + Api.ENDPOINTS.TestSlackIntegration + '?containerid=' + id)
			.then(res => {
				let { data } = res;

        if (data === "\"ok\":true") {
					this.addSnackbar('Slack integration test passed successfully', 'success')
				}
        else {
				  this.addSnackbar(`Slack integration test failed.<br />Please review your configuration. <br /> ${JSON.stringify(data)}`, 'error')
        }
			})
			.catch(err => {
				this.addSnackbar(err, 'error')
			})
	}

    getSlackIntegration(id) {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetSlackIntegration + '?containerid=' + id)
      .then(res => {
        let {data} = res
        this.setState({
          slackChannel: data ? data.channel : '',
          slackDailyChannel: data ? data.dailyChannel : '',
          slackToken: data ? data.token : '',
          slackEdit: data ? data : null,
          sendUserNotification: data ? data.sendUserNotification : false,
          sendDailyNotification: data ? data.sendDailyNotification : false,
        })
      })
      .catch(err => null)
    }

    validateFields(skipSetState) {
      let {shortName, url, assignee, slackToken, slackChannel, slackDailyChannel} = this.state;
      let result = true;
      if (shortName === '' || url === '' || assignee === null) {
        result = false;
      }
      if (slackChannel !== '' && slackDailyChannel !== '' && slackToken === '') {
        result = false;
      }
      if (!skipSetState)
        this.setState({
          shortNameError: shortName === '' ? true : false,
          urlError: url === '' ? true : false,
          assigneeError: assignee === null ? true : false,
          slackTokenError: slackChannel !== '' && slackDailyChannel !== '' && slackToken === '' ? true : false,
        })
      return result;
    }

    disableContainer(id) {
      axios({
          method: "DELETE",
          url: Api.getBaseUrl() + Api.ENDPOINTS.DisableContainer + id,
      })
      .then(res => this.fetchContainers())
    }

    enableContainer(container, save = false, test = false) {
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateContainer,
          data: JSON.stringify({...container, enabled: true}),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(res => {
        if (save && test) {
          this.validateContainer(container)
        } else {
          this.fetchContainers()
        }
      })
    }

    openActionDialog(populateContainerId) {
      this.setState({
        showActionDialog: true,
        populateContainerId,
      })
    }

    renderPopulateDialog() {
      let {showActionDialog, populateContainerId} = this.state;
      let props = {
        isOpen: showActionDialog,
        onClose: this.closeActionDialog.bind(this),
        type: 'populateContainer',
        populateContainerId,
        addSnackbar: this.addSnackbar.bind(this)
      }

      return showActionDialog && (
          <SuiteActionDialog {...props} />
      )
    }

    closeActionDialog() {
      this.setState({
        showActionDialog: false,
      })
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
								 <MySnackbarContentWrapper
									 onClose={this.removeSnackbar.bind(this, snack, index)}
									 variant={snack.snackbarVariant}
									 message={snack.snackbarMsg}
								 />
							 </Snackbar>
						 )
					 })
				 }
     </div>
     )
	}

    createSlackIntegration(containerId, productId, test=false) {
      let {slackChannel, slackDailyChannel, slackToken, onCheckboxChange, onCheckboxDailyChange, sendUserNotification, sendDailyNotification} = this.state;
      let timestamp = new Date().getTime()
      axios({
          method: "POST",
          url: Api.getBaseUrl() + Api.ENDPOINTS.CreateSlackIntegration,
          data: JSON.stringify({
            channel: slackChannel,
            dailyChannel: slackDailyChannel,
            containerId,
            enabled: true,
            productId,
            timestamp,
            token: slackToken,
            updated: timestamp,
            sendUserNotification,
            sendDailyNotification,
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(() => {
				if (test && containerId && slackChannel && slackDailyChannel && slackToken) {
					this.testSlackIntegration(containerId);
				}
        this.setState({
          slackChannel: '',
          slackDailyChannel: '',
          slackToken: '',
        })
      })
    }

    saveSlackIntegration(containerId=null, test=false) {
      let {slackChannel, slackDailyChannel, slackToken, slackEdit, sendUserNotification, sendDailyNotification} = this.state;
      axios({
          method: "PUT",
          url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateSlackIntegration,
          data: JSON.stringify({
            ...slackEdit,
            channel: slackChannel,
            dailyChannel: slackDailyChannel,
            token: slackToken,
            sendUserNotification: sendUserNotification,
            sendDailyNotification: sendDailyNotification,
            updated: new Date().getTime(),
          }),
          headers: {
              'Content-Type': 'application/json'
          },
      })
      .then(() => {
				if (test && containerId  && slackChannel && slackDailyChannel && slackToken) {
					this.testSlackIntegration(containerId);
				}
        this.setState({
          slackChannel: '',
          slackDailyChannel: '',
          slackToken: '',
          slackEdit: null,
        })
      })
    }

    onCheckboxChange = event => {
      this.setState({
        sendUserNotification: event.target.checked,
      })
    }

    onCheckboxDailyChange = event => {
      this.setState({
        sendDailyNotification: event.target.checked,
      })
    }

    onFieldChange = field => event => {
      this.setState({
        [field]: event.target.value,
        [`${field}Error`]: false,
      })
    }

    onAssigneeChange(assignee) {
      this.setState({
        assignee,
        assigneeError: false,
      })
    }
    handlePopulateMode(container){
        let value
       switch (container){
           case 'PULL':
               value=0
               break
           case 'PUSH':
               value=1
               break
           case 'UPLOAD':
               value=3
               break
           default:
               break
       }
       return value

    }

    copyContainer(index, containerEdit) {
      let {containersList} = this.state
      let container = containerEdit ? containerEdit : containersList[index]
     
      if (container.triageSpec) {
				let {frequencyCron} = container.triageSpec
				
				this.getFrequencyCronStates(frequencyCron)
			}
			this.getSlackIntegration(container.id)
      this.setState({
        enableEdit: true,
        shortName: "COPY-"+container.name,
        url: container.url,
        reportType: container.reportType,
        description: container.description ? container.description : '',
        product: container.product,
        connector: container.connector,
        populateMode: container.populateMode,
        assignee: container.triageSpec.triager,
        priority: container.triageSpec.priority,
        minAmountOfTests: container.triageSpec.expectedMinAmountOfTests,
        triageFrecuencyWeek: container.triageSpec.everyWeeks,
        passRate: container.triageSpec.expectedPassRate,
        container: container.triageSpec.container,
        containerEdit: container,
        extraData: container.hiddenData ? container.hiddenData : '',
      }, () => {
        let body = getCreateContainerBody(this.state)
          // let handleResolver=this.handlePopulateMode(body.populateMode)
          // body.populateMode=handleResolver
        axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.CreateContainer,
            data: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
          this.createSlackIntegration(res.data.id, res.data.product)
          this.fetchContainers()

          this.setState({
            containerEdit: res.data,
          }, () => scrollToTop())


        })
      })
    }

    getListItem(container, index) {
      return (
            <ListItem key={container.id} style={{ opacity: !container.enabled ? '.5' : '1' }}>
            <ListItemAvatar>
                <Avatar>
                    <FolderIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={container.name}
                secondary={container.description}
            />
            <ListItemSecondaryAction>
                <Tooltip title={'Pull tests from CI'}>
                    <IconButton
                        style={{
                          opacity: container.enabled ? '1' : '.5',
                          cursor: container.enabled ? 'pointer' : 'default',
                        }}
                        onClick={
                          container.enabled ?
                              this.openActionDialog.bind(this, container.id)
                          :   null
                        }
                        aria-label="Populate">
                        <RotateRightIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={'Edit'}>
                    <IconButton
                        style={{
                          opacity: container.enabled ? '1' : '.5',
                          cursor: container.enabled ? 'pointer' : 'default',
                        }}
                        onClick={
                            container.enabled ?//********** UNO *************
                                this.enableEditContainer.bind(this, index, null)
                            :   null
                        }
                        aria-label="Edit">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={container.enabled ? 'Deactivate' : 'Activate'}>
                    <IconButton
                        onClick={
                          container.enabled ?
                            this.disableContainer.bind(this, container.id)
                          : this.enableContainer.bind(this, container)
                        }
                        aria-label="Delete">
                        { container.enabled && <RemoveCircleIcon /> }
                        { !container.enabled && <AddCircleIcon /> }
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Copy"}>
                    <IconButton
                        style={{
                          opacity: container.enabled ? '1' : '.5',
                          cursor: container.enabled ? 'pointer' : 'default',
                        }}
                        onClick={
                            container.enabled ?
                                this.copyContainer.bind(this, index, null)
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
        let {containersList} = this.state;
        let rows = []
        let rowsDisabled = []

        containersList.map((container, index) => {
          if (container.enabled) {
            rows.push(this.getListItem(container, index))
          } else {
            rowsDisabled.push(this.getListItem(container, index))
          }
          return null;
        })
        if (rowsDisabled.length > 0) {
          rows = rows.concat(<Divider key="divider" />)
        }
        rows = rows.concat(rowsDisabled)
        return <List>{rows}</List>
    }

    select = name => event => {
    	
        if (name == "connector") {
          this.setState({
              connectorName: event.currentTarget.attributes[3].value,
          })
        }

        this.setState({
            [name]: event.target.value
        })
    }

    changeReportType(e) {
        this.setState({
            reportType: e.target.value,
        })
    }

    check = name => event => {
    	
        this.setState({
            [name]: event.target.checked
        })
    }

    saveAndTest(ev) {
      this.onSubmit(ev, true)
    }

    onSubmit(ev, test = false) {
      ev.preventDefault()
      if (this.validateFields()) {
        if (this.state.enableEdit) {
          this.saveContainer(test)
        } else {
          this.createContainer(test)
        }
        
        if (this.props.wizardMode) {
          if (test) {
            if (this.state.validatedContainer)
              this.wizardNext();
          } else {
            this.wizardNext();
          }
        }
      }
    }

    wizardUpdate = () => {
        let {data} = this.props;
        let id = data.container
        let index = this.state.containersList.findIndex(x => x.id == id);
        this.enableEditContainer(index)
    }

    wizardNext = () => {
        let {nextStep, finish, currentStep, totalSteps} = this.props

        if (this.state.skipped)
            this.setState({skipped: false})

        if (currentStep == totalSteps)
            finish()
        else
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
          productList,
          connectorList,
          assigneeFocus,
          showAdvanced,
          shortNameError,
          urlError,
          assigneeError,
          description,
          slackFocus,
          slackChannel,
          slackDailyChannel,
          slackToken,
          slackTokenError,
          enableEdit,
          extraData,
          shortName,
          url,
            populateMode,
          containersList,
          sendUserNotification,
          sendDailyNotification,
        } = this.state;


        let {wizardMode} = this.props
        return(
          
          <div style={{display: 'flex'}}>
            <SideMenu/>
            <div style={{'width': '100%'}} className="CenterList">
                <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                    {this.renderPopulateDialog()}
                    {this.renderSnackbars()}
                    <div className="Containers-Main">
                        <Card>
                            <CardContent style={{ 'max-width': '80vw'}}>
                                <h4>CI Containers</h4>
                                <div>Generally a container is a view or folder with a set of jobs that together represents a Test Suite like smoke test, regression or personal view. Basically it makes sense to analize all these test executors together. <br />This will be used in the list view.</div>

                                <Grid container spacing={16}>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="shortName"
                                            label="Short Name"
                                            value={shortName}
                                            onChange={this.onFieldChange("shortName")}
                                            error={shortNameError}
                                            helperText={shortNameError ? 'Required field' : ''}
                                            placeholder="A short name for the container"
                                            autoFocus={true}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="Description"
                                            label="Description"
                                            value={description}
                                            onChange={this.onFieldChange("description")}
                                            placeholder="A description for your container"
                                            ///nomargintop="true"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextFieldInput
                                            id="URL"
                                            label="URL"
                                            value={url}
                                            onChange={this.onFieldChange("url")}
                                            error={urlError}
                                            helperText={urlError ? 'Required field' : ''}
                                            placeholder="view or folder of test suite"
                                        />
                                    </Grid>


                                        <Grid item xs={6}>
                                            <TextFieldInput
                                                id="product"
                                                select
                                                label="Product"
                                                placeholder="Select product"
                                                value={this.state.product}
                                                onChange={this.select("product")}
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
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextFieldInput
                                                id="connector"
                                                select
                                                label="Connector"
                                                placeholder="Select connector"
                                                value={this.state.connector}
                                                onChange={this.select("connector")}
                                                InputProps={{
                                                    style: {
                                                        fontSize: '.875rem'
                                                    }
                                                }}
                                            >
                                                {connectorList && connectorList.map(p => (
                                                    <MenuItem className="globalMenuItem" name={p.type} key={p.id} value={p.id}>{p.name}</MenuItem>
                                                ))}
                                            </TextFieldInput>
                                        </Grid>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="reportType"
                                            select
                                            label="Report Type"
                                            value={!!this.state.reportType ? this.state.reportType : "UNKNOWN"}
                                            onChange={this.changeReportType.bind(this)}
                                        InputProps={{
                                            style: {
                                              fontSize: '.875rem'
                                            }
                                        }}
                                        >
                                            <option value="UNKNOWN">UNKNOWN</option>
                                            <option value="ROBOT">ROBOT</option>
                                            <option value="TESTNG">TESTNG</option>
                                            <option value="JUNIT">JUNIT</option>
                                            <option value="CUCUMBER">CUCUMBER</option>
                                            <option value="ALLURE">ALLURE</option>
                                            <option value="PROTRACTOR">PROTRACTOR</option>
                                            <option value="PROTRACTOR_STEPS">PROTRACTOR_STEPS</option>
                                            <option value="CYPRESS">CYPRESS</option>

                                        </TextFieldInput>

                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="populateMode"
                                            select
                                            label="Populate Mode"
                                            value={this.state.populateMode}
                                            onChange={this.select("populateMode")}
                                            ///nomargintop="true"
                                            InputProps={{
                                                style: {
                                                    fontSize: '.875rem'
                                                }
                                            }}
                                        >
                                            <MenuItem className="globalMenuItem" value="PULL">Pull</MenuItem>
                                            <MenuItem className="globalMenuItem" value="PUSH">Push</MenuItem>
                                            <MenuItem className="globalMenuItem" value="UPLOAD">Upload</MenuItem>
                                        </TextFieldInput>
                                    </Grid>
                                </Grid>



                                <Grid container spacing={16}>
                                    <Grid item xs={6}>
                                        <div style={{marginTop:20}}>Triage Spec</div>
                                        <div className={'Containers-AssigneeContainer'}>
                                            <fieldset className={
                                              assigneeFocus ?
                                                assigneeError ? 'Containers-AssigneeFieldset-active-error' : 'Containers-AssigneeFieldset-active'
                                              : assigneeError ? 'Containers-AssigneeFieldset-error' : 'Containers-AssigneeFieldset'
                                            }>
                                                <legend className={
                                                  assigneeFocus ?
                                                    assigneeError ? 'Containers-AssigneeLabel-active-error' : 'Containers-AssigneeLabel-active'
                                                  : assigneeError ? 'Containers-AssigneeLabel-error' : 'Containers-AssigneeLabel'
                                                }>
                                                    <span style={{ marginLeft: '-3', marginRight: '-3' }}>Assignee</span>
                                                </legend>
                                                <UserPicker
                                                    onChange={this.onAssigneeChange.bind(this)}
                                                    color={'currentColor'}
                                                    onFocus={() => this.setState({ assigneeFocus: true })}
                                                    onBlur={() => this.setState({ assigneeFocus: false })}
                                                    border={'0'}
                                                    buildTriage={0}
                                                    selectedItem={this.state.assignee} />
                                            </fieldset>
                                            { assigneeError && <span style={{color: COLORS.redError, margin: '6 12 0', fontSize: '0.75rem'}}>Required field</span> }
                                        </div>

                                        <TextFieldInput
                                            id="priority"
                                            select
                                            label="Priority"
                                            value={this.state.priority}
                                            onChange={this.select("priority")}
                                            style={{marginTop:20}}
                                            InputProps={{
                                                style: {
                                                  fontSize: '.875rem'
                                                }
                                            }}
                                        >
                                            {PriorityList.map(p => (
                                                <MenuItem className="globalMenuItem" key={p.value} value={p.value}>{p.label}</MenuItem>
                                            ))}
                                        </TextFieldInput>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <div style={{marginTop:20}}>Sprint Deadline Frequency</div>
                                        <div style={{fontSize: '.75rem', marginBottom: 5}}>When automators should have analyzed every single failed test from this container.</div>
                                        <div className="TriageFrecuency">
                                                <div>
                                                    <Tooltip title="Triage Monday" >
                                                        <Checkbox
                                                            checked={this.state.triageMonday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageMonday")}
                                                            value="triageMonday"
                                                            icon={<Avatar>Mo</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>Mo</Avatar>}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Triage Tuesday" >
                                                        <Checkbox
                                                            checked={this.state.triageTuesday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageTuesday")}
                                                            value="triageTuesday"
                                                            icon={<Avatar>Tu</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>Tu</Avatar>}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Triage Wednesday" >
                                                        <Checkbox
                                                            checked={this.state.triageWednesday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageWednesday")}
                                                            value="triageWednesday"
                                                            icon={<Avatar>We</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>We</Avatar>}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Triage Thursday" >
                                                        <Checkbox
                                                            checked={this.state.triageThursday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageThursday")}
                                                            value="triageThursday"
                                                            icon={<Avatar>Th</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>Th</Avatar>}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Triage Friday" >
                                                        <Checkbox
                                                            checked={this.state.triageFriday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageFriday")}
                                                            value="triageFriday"
                                                            icon={<Avatar>Fr</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>Fr</Avatar>}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Triage Saturday" >
                                                        <Checkbox
                                                            checked={this.state.triageSaturday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageSaturday")}
                                                            value="triageSaturday"
                                                            icon={<Avatar>Sa</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>Sa</Avatar>}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Triage Sunday" >
                                                        <Checkbox
                                                            checked={this.state.triageSunday}
                                                            className="TriageFrecuencyCheckbox"
                                                            onChange={this.check("triageSunday")}
                                                            value="triageSunday"
                                                            icon={<Avatar>Su</Avatar>}
                                                            color="primary"
                                                            checkedIcon={<Avatar style={{backgroundColor: Blue["A700"]}}>Su</Avatar>}
                                                        />
                                                    </Tooltip>
                                                </div>
                                        </div>
                                        <Grid container spacing={16}>
                                            <Grid item xs={6}>
                                                <TextFieldInput
                                                    id="triageFrecuencyWeek"
                                                    select
                                                    label="Every"
                                                    value={this.state.triageFrecuencyWeek}
                                                    onChange={this.select("triageFrecuencyWeek")}
                                                    style={{marginTop:15}}
                                                    InputProps={{
                                                        style: {
                                                          fontSize: '.875rem'
                                                        }
                                                    }}
                                                >
                                                    {WeekList.map(p => (
                                                        <MenuItem className="globalMenuItem" key={p.value} value={p.value}>{p.label}</MenuItem>
                                                    ))}
                                                </TextFieldInput>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextFieldInput
                                                    id="triageFrecuencyHour"
                                                    select
                                                    label="Hour"
                                                    value={this.state.triageFrecuencyHour}
                                                    onChange={this.select("triageFrecuencyHour")}
                                                    style={{marginTop:15}}
                                                    InputProps={{
                                                        style: {
                                                          fontSize: '.875rem'
                                                        }
                                                    }}
                                                >
                                                    {HourList.map(p => (
                                                        <MenuItem className="globalMenuItem" key={p.value} value={p.value}>{p.label}</MenuItem>
                                                    ))}
                                                </TextFieldInput>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={16}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={16}>
                                            <Grid item xs={12}
                                                  style={{ paddingBottom: 0, paddingTop: 5, marginBottom: '-10' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => this.setState({ showAdvanced: !showAdvanced })}
                                                        style={{ fontSize: 12, padding: '0 5' }}
                                                        variant="text">
                                                        Advanced options
                                                    </Button>
                                                </div>
                                            </Grid>
                                            <Grid item xs={12}>
                                                { showAdvanced && (
                                                    <Grid container spacing={16}>
                                                        <Grid item xs={6}>
                                                            <TextFieldInput
                                                                id="rate"
                                                                label="Goal: Pass Rate (%)"
                                                                placeholder="Pass rate"
                                                                type="number"
                                                                value={this.state.passRate}
                                                                onChange={this.select("passRate")}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextFieldInput
                                                                id="MinimumAmountTests"
                                                                label="Goal: Increase amount of tests"
                                                                placeholder="Amount of tests"
                                                                type="number"
                                                                value={this.state.minAmountOfTests}
                                                                onChange={this.select("minAmountOfTests")}
                                                            />
                                                        </Grid>
                                                        { this.state.populateMode == "PULL" && this.state.connectorName && (this.state.connectorName.toLowerCase().includes("circle") || this.state.connectorName.toLowerCase().includes("gitlab")) && <Grid item xs={6}>
                                                            <Tooltip
                                                               title={extraDataTooltip}>
                                                               <TextFieldInput
                                                                   id="extraData"
                                                                   label="CI Extra Data"
                                                                   onChange={this.onFieldChange("extraData")}
                                                                   value={extraData}
                                                                   placeholder="Extra Data"
                                                                   nomargintop="true"
                                                               />
                                                           </Tooltip>
                                                        </Grid> }
                                                        {/*<Grid item xs={6}>*/}
                                                        {/*    <TextFieldInput*/}
                                                        {/*        id="populateMode"*/}
                                                        {/*        select*/}
                                                        {/*        label="Populate Mode"*/}
                                                        {/*        value={this.state.populateMode}*/}
                                                        {/*        onChange={this.select("populateMode")}*/}
                                                        {/*        nomargintop="true"*/}
                                                        {/*        InputProps={{*/}
                                                        {/*            style: {*/}
                                                        {/*              fontSize: '.875rem'*/}
                                                        {/*            }*/}
                                                        {/*        }}*/}
                                                        {/*    >*/}
                                                        {/*        <MenuItem className="globalMenuItem" value="PULL">Pull</MenuItem>*/}
                                                        {/*        <MenuItem className="globalMenuItem" value="PUSH">Push</MenuItem>*/}
                                                        {/*    </TextFieldInput>*/}
                                                        {/*</Grid>*/}
                                                        <Grid item xs={12}>
                                                            <div>Slack Integration</div>
                                                            <TextFieldInput
                                                                id="SlackToken"
                                                                label="Token"
                                                                value={slackToken}
                                                                onChange={this.onFieldChange("slackToken")}
                                                                placeholder="Channel token provided by Slack"
                                                                error={slackTokenError}
                                                                helperText={
                                                                    slackTokenError ?
                                                                        'Required field'
                                                                        : 'e.g.: xoxp-546645875214-155201475248-123577488124-132f5c0df5cbe7ba255c4w735c412a3e'}
                                                                InputProps={{
                                                                    onClick: () => this.setState({ slackFocus: true }),
                                                                    onBlur: () => this.setState({ slackFocus: false }),
                                                                }}
                                                            />

                                                            <Grid container spacing={16}>
                                                                <Grid item xs={6}>

                                                                    <TextFieldInput
                                                                        id="SlackChannel"
                                                                        label="Daily Channel"
                                                                        value={slackDailyChannel}
                                                                        onChange={this.onFieldChange("slackDailyChannel")}
                                                                        placeholder="Daily Channel name"
                                                                        InputProps={{
                                                                            onClick: () => this.setState({ slackFocus: true }),
                                                                            onBlur: () => this.setState({ slackFocus: false }),
                                                                        }}
                                                                    />
                                                                </Grid>

                                                                <Grid item xs={6}>

                                                                    <TextFieldInput
                                                                        id="SlackChannel"
                                                                        label="Weekly Channel"
                                                                        value={slackChannel}
                                                                        onChange={this.onFieldChange("slackChannel")}
                                                                        placeholder="Weekly Channel name"
                                                                        InputProps={{
                                                                            onClick: () => this.setState({ slackFocus: true }),
                                                                            onBlur: () => this.setState({ slackFocus: false }),
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                            <FormControlLabel
                                                              control={
                                                                <Checkbox
                                                                  checked={sendUserNotification}
                                                                  onChange={this.onCheckboxChange.bind(this)}
                                                                  value="sendUserNotification"
                                                                  style={{ paddingRight: 5 }}
                                                                  color="primary"
                                                                />
                                                              }
                                                              style={{ marginBottom: -30 }}
                                                              label="Send notifications to assignee"
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                <Checkbox
                                                                  checked={sendDailyNotification}
                                                                  onChange={this.onCheckboxDailyChange.bind(this)}
                                                                  value="sendDailyNotification"
                                                                  style={{ paddingRight: 5 }}
                                                                  color="primary"
                                                                />
                                                                }
                                                                style={{ marginBottom: -30 }}
                                                                label="Send daily summarized notifications"
                                                                />
                                                        </Grid>
                                                    </Grid>
                                                ) }
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            { wizardMode ? 
                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.wizardPrevious.bind(this)}
                                    variant="contained"
                                    color="secondary">
                                    Previous
                                </Button>
                                <Button
                                    type="submit"
                                    className="globalButton"
                                    variant="contained"
                                    color="primary"
                                    disabled={!this.validateFields(true)}>
                                    Finish
                                </Button>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.saveAndTest.bind(this)}
                                    variant="contained"
                                    style={false /* this.validateFields(true) */ ? { backgroundColor: COLORS.green1, color: 'white', marginLeft: 8 } : undefined}
                                    disabled={true /* !this.validateFields(true) */}>
                                    Test & Finish
                                </Button>
                            </CardActions>
                            :
                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.clearContainer.bind(this)}
                                    variant="contained"
                                    color="secondary">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="globalButton"
                                    variant="contained"
                                    style={{ marginLeft: 8 }}
                                    color="primary">
                                    Save
                                </Button>
                                <Button
                                    type="button"
                                    className="globalButton"
                                    onClick={this.saveAndTest.bind(this)}
                                    variant="contained"
                                    style={{ backgroundColor: COLORS.green1, color: 'white', marginLeft: 8 }}>
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
                              containersList.length > 0 ?
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
        )
    }
}
