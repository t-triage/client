import React, { Component } from 'react'
import Api from "./Api"
import axios from 'axios'
import { find } from "underscore"

import { styles } from "./Globals";
import UserPicker from "./UserPicker";
import { HourList, PriorityList, TextFieldInput, WeekList, getSaveExecutorBody } from "../../Admin/AdminUtils";

import withStyles from '@mui/styles/withStyles';
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel"
import Avatar from "@mui/material/Avatar";
import { blue as Blue } from '@mui/material/colors';


class SuiteListEdit extends Component {

    state = {
        executorEdit: null,
        assigneeFocus: false,
        assigneeError: false,
        triageFrecuencyWeek: 1,
        triageFrequencyCron: '',
        triageFrecuencyHour: '0 0 17',
        triageMonday: true,
        triageTuesday: false,
        triageWednesday: true,
        triageThursday: false,
        triageFriday: true,
        triageSaturday: false,
        triageSunday: false,
        sendUserNotification: false,
        slackChannel: '',
        slackDailyChannel: '',
        slackToken: '',
        slackFocus: false,
        slackEdit: null,
        sendDailyNotification: false,
        onCheckboxChange: false,
        onCheckboxDailyChange: false,


    }

    componentDidMount() {
        this.fetchSuite()
    }

    fetchSuite() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetExecutorByID + this.props.executorId)
            .then(async res => {
                await new Promise(resolve => this.setState({ executorEdit: Object.assign({}, res.data)}, resolve))
                if (this.state.executorEdit.triageSpec) {
                    let { frequencyCron } = this.state.executorEdit.triageSpec;
                    this.getFrequencyCronStates(frequencyCron)
                }
                this.getSlackIntegration(this.state.executorEdit.id)
                this.setState({
                    triageFrecuencyWeek: this.state.executorEdit.triageSpec.everyWeeks
                })
            })
    }


    onAssigneeChange(assignee) {
        let { executorEdit } = this.state

        executorEdit.triageSpec.triager = assignee
        this.setState({
            executorEdit
        })
    }

    saveSuite(ev) {
        let body = getSaveExecutorBody(this.state)
        ev.preventDefault()

        axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateExecutor,
            data: JSON.stringify({ ...body }),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(
            this.props.onClose()
        )
        if (this.state.slackEdit) {
            this.saveSlackIntegration(body.id)
        } else {
            this.createSlackIntegration(body.container, body.product)
        }

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


    /*******************/


    createSlackIntegration(containerId, productId) {
        let { slackChannel, slackDailyChannel, slackToken, onCheckboxChange, onCheckboxDailyChange, sendUserNotification, sendDailyNotification } = this.state;


        let timestamp = new Date().getTime()
        axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.CreateSlackIntegration,
            data: JSON.stringify({
                channel: slackChannel,
                dailyChannel: slackDailyChannel,
                containerId,
                enabled: true,
                timestamp,
                productId,
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
                
                this.setState({
                    slackChannel: slackChannel,
                    slackDailyChannel: slackDailyChannel,
                    slackToken: slackToken,
                    slackEdit: null
                })
            })
    }
    
    //*** SEIS SLACK
    getSlackIntegration(id) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetExecutorSlackIntegration + '?executorid=' + id)
            .then(res => {
                let { data } = res;

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

    saveSlackIntegration(executorId) {
        let { slackChannel, slackDailyChannel, slackToken, slackEdit, sendUserNotification, sendDailyNotification } = this.state;
        axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateSlackIntegration,
            data: JSON.stringify({
                ...slackEdit,
                executorId: executorId,
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

                this.setState({
                    slackChannel: slackChannel,
                    slackDailyChannel: slackDailyChannel,
                    slackToken: slackToken,
                    slackEdit: null,
                })
            })
    }


    /*****************************/

    check = name => event => {

        this.setState({
            [name]: event.target.checked
        })

    }

    select = name => event => {

        this.setState({
            [name]: event.target.value
        })

    }

    onPriorityChange = () => event => {
        let { executorEdit } = this.state,
            { value } = event.target;

        executorEdit.triageSpec.priority = value;
        this.setState({
            executorEdit
        })
    }

    onFieldChange = field => event => {
        this.setState({
            [field]: event.target.value,

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

    render() {
        let { executorEdit,
            assigneeFocus,
            assigneeError,
            slackFocus,
            slackChannel,
            slackDailyChannel,
            slackToken,
            sendUserNotification,
            sendDailyNotification } = this.state

        return executorEdit && (
            <Dialog
                open={this.props.isOpen}
                maxWidth="md"
                fullWidth
                onClose={this.props.onClose}
                aria-labelledby="suiteAction-dialog-title"
                aria-describedby="suiteAction-dialog-description">
                <form onSubmit={this.saveSuite.bind(this)} >
                    <DialogTitle id="suiteAction-dialog-title">EDIT SUITE</DialogTitle>
                    <DialogContent id="suiteAction-dialog-description" style={{overflow:'hidden'}}>

                        <Grid container >
                            <Grid className={"action-dialog-description"} item xs={12}>

                                <Grid container spacing={2} style={{ marginTop: 0 }}>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="shortName"
                                            label="Short Name"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            defaultValue={executorEdit.name}
                                            autoFocus={true}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="URL"
                                            label="URL"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            defaultValue={executorEdit.url}
                                            autoFocus={true}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} style={{ marginTop: 0 }}>
                                    <Grid item xs={6} sm={6}>
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
                                                    color={'primary'}
                                                    border={'0'}
                                                    buildTriage={0}
                                                    onFocus={() => this.setState({ assigneeFocus: true })}
                                                    onBlur={() => this.setState({ assigneeFocus: false })}
                                                    selectedItem={executorEdit.triageSpec.triager} />
                                            </fieldset>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} sm={6}>
                                        <TextFieldInput
                                            id="priority"
                                            select
                                            label="Priority"
                                            value={executorEdit.triageSpec.priority}
                                            onChange={this.onPriorityChange()}
                                            style={{ marginTop: 20 }}
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

                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <div style={{ marginTop: 20 }}>Sprint Deadline Frequency</div>
                                <div style={{ fontSize: '.75rem', marginBottom: 5 }}>When automators should have analyzed every single failed test from this container.</div>
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>Mo</Avatar>}
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>Tu</Avatar>}
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>We</Avatar>}
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>Th</Avatar>}
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>Fr</Avatar>}
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>Sa</Avatar>}
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
                                                checkedIcon={<Avatar style={{ backgroundColor: Blue["A700"] }}>Su</Avatar>}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextFieldInput
                                            id="triageFrecuencyWeek"
                                            select
                                            label="Every"
                                            value={this.state.triageFrecuencyWeek}
                                            onChange={this.select("triageFrecuencyWeek")}
                                            style={{ marginTop: 15 }}
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
                                            style={{ marginTop: 15 }}
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

                            <Grid item xs={12}>
                                {/* Aplicar estilos usando clases en vez de usar inline style */}
                                <div style={{ marginTop: 15 }}>Slack Integration</div>

                                <TextFieldInput
                                    id="SlackToken"
                                    label="Token"
                                    value={slackToken}
                                    onChange={this.onFieldChange("slackToken")}
                                    placeholder="Channel token provided by Slack"
                                    helperText={
                                        'e.g.: xoxp-546645875214-155201475248-123577488124-132f5c0df5cbe7ba255c4w735c412a3e'}
                                    InputProps={{
                                        onClick: () => this.setState({ slackFocus: true }),
                                        onBlur: () => this.setState({ slackFocus: false }),
                                    }}
                                />

                                <Grid container spacing={2}>
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
                    </DialogContent>
                    <DialogActions style={{ paddingRight: 16 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            className="globalButton"
                            color={'primary'}>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        )

    }
}

export default withStyles(styles)(SuiteListEdit);
