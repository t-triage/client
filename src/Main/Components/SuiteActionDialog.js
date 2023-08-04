import React, {Component} from 'react';
import Api from "./Api"
import * as _  from 'underscore'
import axios from 'axios'
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import List from "@mui/material/List";
import CheckIcon from '@mui/icons-material/Check';
import {COLORS} from './Globals';
import thumbsUp from "../../images/goalIcons/thumbsUp.png"
import thumbsDown from "../../images/goalIcons/thumbsDown.png"
import clap from "../../images/goalIcons/clap.png"



export default class SuiteActionDialog extends Component {

    state = {
        reportType: "UNKNOWN",
        comment: '',
        openSnackbar: false,
        expectedGrowth: null,
        requiredGrowth: null,
        expectedPassing: null,
        requiredPassing: null,
        expectedStability: null,
        requiredStability: null,
        expectedTriageDone: null,
        requiredTriageDone: null,
        expectedCommits: null,
        requiredCommits: null,
        executorid: null,
        trendGoalId: ''
    }

    actions = [
        {
            type: 'setGoals',
            title: 'Set Evolution Goals',
            description: this.getDescriptionText('setGoals'),
            action: this.setGoals.bind(this, 'Suite successfully triaged'),
            btnText: 'Save',
        },
        {
            type: 'triageSuite',
            title: 'Triage Suite',
            description: this.getDescriptionText('triageSuite'),
            action: this.triageSuite.bind(this, 'Suite successfully triaged'),
            btnText: 'Triage Suite',
        },
        {
            type: 'pushSuite',
            title: 'Import Suite',
            description: this.getDescriptionText('pushSuite'),
            action: this.pushSuite.bind(this, 'Suite successfully imported'),
            btnText: 'Import',
        },
        {
            type: 'invalidateSuite',
            title: 'Skip Run',
            description: this.getDescriptionText('invalidateSuite'),
            action: this.invalidateSuite.bind(this, 'Suite successfully skipped'),
            btnText: 'Skip',
        },
        {
            type: 'disableSuite',
            title: 'Disable Suite',
            description: this.getDescriptionText('disableSuite'),
            action: this.disableSuite.bind(this, 'Suite successfully disabled'),
            btnText: 'Disable',
        },
        {
            type: 'enableSuite',
            title: 'Enable Suite',
            description: this.getDescriptionText('enableSuite'),
            action: this.enableSuite.bind(this, 'Suite successfully enabled'),
            btnText: 'Enable',
        },
        {
            type: 'pullSuite',
            title: 'Pull Suite',
            description: this.getDescriptionText('pullSuite'),
            action: this.pullSuite.bind(this, 'Suite pull has been started. Please back in a few min'),
            btnText: 'Confirm',
        },
        {
            type: 'populateConnector',
            title: 'Pull Suites',
            description: this.getDescriptionText('populateConnector'),
            action: this.populateConnector.bind(this, 'Suite pull has been started. Please back in a few min'),
            btnText: 'Confirm',
        },
        {
            type: 'populateContainer',
            title: 'Pull Suites',
            description: this.getDescriptionText('populateContainer'),
            action: this.populateContainer.bind(this, 'Suite pull has been started. Please back in a few min'),
            btnText: 'Confirm',
        },
        {
            type: 'textReport',
            title: 'Text Report',
            description: this.getDescriptionText('textReport'),
            action: this.props.onClose.bind(this),
            btnText: 'Close',
        },
        {
            type: 'testPassed',
            title: 'Test Passed',
            description: this.getDescriptionText('testPassed'),
            action: this.props.onClose.bind(this),
            btnText: 'Close',
        },
    ]


    postAction(endpoint, buildid, note) {
        axios({
            method: 'POST',
            url: Api.getBaseUrl() + endpoint,
            data: `buildid=${buildid}&note=${note}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        })
        this.props.onClose();
    }

    postPullAction(endpoint, buildid) {
        axios({
            method: 'POST',
            url: Api.getBaseUrl() + endpoint,
            data: `executorid=${buildid}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        })
        this.props.onClose();
    }

    postPushAction(endpoint, note, executorid, reportType) {
        let notes;
        reportType != "CUCUMBER" && reportType != "ALLURE" ? notes = {note} : notes = note;

        axios({
            method: 'POST',
            url: Api.getBaseUrl() + endpoint + '?executorid=' + executorid + '&reportType=' + reportType,
            data: notes,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },


        }),

            this.props.onClose();
    }

    populateConnector(msg) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.PopulateConnector + this.props.populateConnectorId)
        this.props.onClose();
        this.props.showSnackbar(msg, 'success');
    }

    populateContainer(msg) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.PopulateContainer + this.props.populateContainerId)
        this.props.onClose();
        this.props.showSnackbar(msg, 'success');
    }


    triageSuite(msg) {
        this.postAction(Api.ENDPOINTS.TriageSuite, this.props.buildId, this.state.comment)
        this.props.showSnackbar(msg);
    }

    setGoals(msg) {

        let {
            expectedGrowth, 
            requiredGrowth, 
            expectedPassing, 
            requiredPassing, 
            expectedStability, 
            requiredStability, 
            expectedTriageDone, 
            requiredTriageDone, 
            expectedCommits, 
            requiredCommits, 
            trendGoalId
        } = this.state;

        let timestamp = new Date().getTime();
        if(trendGoalId != ''){
            axios({
                method: "PUT",
                url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateTrendGoal,

                data: JSON.stringify({
                    id:trendGoalId,
                    expectedGrowth: expectedGrowth,
                    requiredGrowth: requiredGrowth,
                    expectedPassing: expectedPassing,
                    requiredPassing: requiredPassing,
                    expectedStability: expectedStability,
                    requiredStability: requiredStability,
                    expectedTriageDone: expectedTriageDone,
                    requiredTriageDone: requiredTriageDone,
                    expectedCommits: expectedCommits,
                    requiredCommits: requiredCommits,
                    enabled: true,
                    updated: timestamp,
                    timestamp: timestamp,
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then((res) => {
                    this.setState({
                        expectedGrowth: '',
                        requiredGrowth: '',
                        expectedPassing: '',
                        requiredPassing: '',
                        expectedStability: '',
                        requiredStability: '',
                        expectedTriageDone: '',
                        requiredTriageDone: '',
                        expectedCommits: '',
                        requiredCommits: '',
                        trendGoalId: '',
                    })
                    this.props.onClose();
                })

        }else{
            axios({
                method: "POST",
                url: Api.getBaseUrl() + Api.ENDPOINTS.CreateTrendGoal,
                params:{
                    executorid: this.props.executorId,
                },
                data: JSON.stringify({
                    expectedGrowth: expectedGrowth,
                    requiredGrowth: requiredGrowth,
                    expectedPassing: expectedPassing,
                    requiredPassing: requiredPassing,
                    expectedStability: expectedStability,
                    requiredStability: requiredStability,
                    expectedTriageDone: expectedTriageDone,
                    requiredTriageDone: requiredTriageDone,
                    expectedCommits: expectedCommits,
                    requiredCommits: requiredCommits,
                    enabled: true,
                    updated: timestamp,
                    timestamp: timestamp,
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then((res) => {

                    this.setState({
                        expectedGrowth: '',
                        requiredGrowth: '',
                        expectedPassing: '',
                        requiredPassing: '',
                        expectedStability: '',
                        requiredStability: '',
                        expectedTriageDone: '',
                        requiredTriageDone: '',
                        expectedCommits: '',
                        requiredCommits: '',
                    })
                    this.props.onClose();
                })
        }



    }

    invalidateSuite(msg) {
        this.postAction(Api.ENDPOINTS.InvalidateSuite, this.props.buildId, this.state.comment)
        this.props.showSnackbar(msg);
    }

    disableSuite(msg) {
        this.postAction(Api.ENDPOINTS.DisableSuite, this.props.buildId, this.state.comment)
        this.props.showSnackbar(msg);
    }

    enableSuite(msg) {
        this.postAction(Api.ENDPOINTS.EnableSuite, this.props.buildId, this.state.comment)
        this.props.showSnackbar(msg);
    }

    pullSuite(msg) {
        this.postPullAction(Api.ENDPOINTS.PullSuite, this.props.buildId)
        this.props.showSnackbar(msg);
    }

    pushSuite(msg) {
        this.postPushAction(Api.ENDPOINTS.PushSuite, this.state.comment, this.props.executorId, this.state.reportType)
        this.props.showSnackbar(msg, 'success');
    }

    autoTriageSuite() {
        // TODO API URL
        this.props.onClose();
    }


    getDescriptionText(type) {
        switch (type) {
            case 'triageSuite':
                return (<div>
                    Congrats! After analyzing each test you can complete this suite triage. Pending tests (if any) will
                    be triaged assuming default/saved values. You can leave a helpful comment for you following triages.
                </div>)
            case 'invalidateSuite':
                return (<div>
                    This action is recommended when the entire suite has failed almost completelly and it doesn{'\''}t
                    need to be analized. Typical reasons are because of setup issues or external causes.
                </div>)
            case 'disableSuite':
                return (<div>
                    This action <b>is only recommended</b> when the job does not contain any test. This suite won{'\''}t
                    be analyzed anymore.
                </div>)
            case 'enableSuite':
                return (<div>
                    Need text description here
                </div>)
            case 'pullSuite':
                return (<div>
                    You are about to pull data from your CI tool that will merge these tests with the latest execution
                    results from CI. This operation may take 15 min.
                </div>)
            case 'pushSuite':
                return (<div>
                    Paste in the following field the test report taken from your CI tool (like the junit.xml or selenium report). Click <a href={"http://wiki.clarolab.com/docs/DOC-7263"}>here</a> for more info.
                </div>)
            case 'populateConnector':
                return (<div>
                    You are about to pull data from your CI tool that will merge these tests with the latest execution
                    results from CI.<br/> This will pull and update every Connector from CI. This operation may take 15
                    min.
                </div>)
            case 'populateContainer':
                return (<div>
                    You are about to pull data from your CI tool that will merge these tests with the latest execution
                    results from CI. This operation may take 15 min.
                </div>)
            case 'autoApprove':
                return ''
            case 'textReport':
                return (<div> {this.props.responseData} </div>)
            case 'testPassed':
                return (
                    <div>
                        <List>
                            {this.renderTestPassed(this.props.responseData)}
                        </List>
                    </div>
                )
            case 'setGoals':
                return (<div>
                    Set up trends, expectations, how the test suite should evolve by month. Every week there will be a Slack report specifying
                    if the goal is not meet (<img src={thumbsDown} style={{width: 20,}}></img>), fulfill requirements (<img src={thumbsUp} style={{width: 24,}}></img>) or exceed expectations (<img src={clap} style={{width: 18,}}></img>).
                </div>)
            default:
                return ''
        }
    }

    handleSubmit(action, e) {
        e.preventDefault();
        e.stopPropagation();
        action.action();
    }

    changeComment(e) {
        this.setState({
            comment: e.target.value,
        })
    }

    changeReportType(e) {
        this.setState({
            reportType: e.target.value,
        })
    }

    renderTestPassed(data) {
        try {
            return data.map((test, index) => {
                return (
                    <div key={index} className="manualTestListItem"
                         onClick={() => window.open("/Test/" + test.id + "/Triage", "_blank")}>
                        <div className="manualTestListSummary">
                            <div className="manualTestListText">
                                <div style={{
                                    alignSelf: 'center',
                                    flexDirection: "column",
                                    padding: '7px 0',
                                    flex: 1
                                }}><span style={{
                                    fontWeight: 'bold',
                                    display: "flex",
                                    fontSize: "1.2em"
                                }}>
                              {test.displayName}
                          </span>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flex: 1,
                                        flexWrap: 'wrap'
                                    }}>
                                        <span>{test.groupName}</span>
                                        <span>{test.triagerDisplayName}</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                )
            })

        }
        catch (e) {
            console.log(e.toString())
        }
    }

    componentDidMount() {
        this.fetchSuite()
    }

    fetchSuite() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetExecutorByID + this.props.executorId)
            .then(res => {
                this.setState({
                    executor: res.data
                })
                axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTrendGoalByID +"/"+res.data.trendGoal)
                    .then(res2 => {
                        this.setState({
                            trendGoalId: res2.data.id,
                            expectedGrowth: res2.data.expectedGrowth,
                            requiredGrowth: res2.data.requiredGrowth,
                            expectedPassing: res2.data.expectedPassing,
                            requiredPassing: res2.data.requiredPassing,
                            expectedStability: res2.data.expectedStability,
                            requiredStability: res2.data.requiredStability,
                            expectedTriageDone: res2.data.expectedTriageDone,
                            requiredTriageDone: res2.data.requiredTriageDone,
                            expectedCommits: res2.data.expectedCommits,
                            requiredCommits: res2.data.requiredCommits,
                        })

                    })
            })

    }



    onRequiredGrowthChange = () => event => {
        let { requiredGrowth } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if(regex.test(value)){
            requiredGrowth = value;
            this.setState({
                requiredGrowth
            })
        }else{
            console.log("No es número")
        }
    }

    onExpectedGrowthChange = () => event => {
        let { expectedGrowth } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if(regex.test(value)){
            expectedGrowth = value;
            this.setState({
                expectedGrowth
            })
        }else{
            console.log("No es número "+ value)
        }
    }

    onRequiredPassingChange = () => event => {
        let { requiredPassing } = this.state,
            { value } = event.target;
        let regex = new RegExp("^$|^([0-9]|[1-9][0-9]|100)$");
        if(regex.test(value)){
            requiredPassing = value;
            this.setState({
                requiredPassing
            })
        }else{
            console.log("No es número")
        }
    }

    onExpectedPassingChange = () => event => {
        let { expectedPassing } = this.state,
            { value } = event.target;
        let regex = new RegExp("^$|^([0-9]|[1-9][0-9]|100)$");
        if(regex.test(value)){
            expectedPassing = value;
            this.setState({
                expectedPassing
            })
        }else{
            console.log("No es número")
        }
    }

    onRequiredStabilityChange = () => event => {
        let { requiredStability } = this.state,
            { value } = event.target;
        let regex = new RegExp("^$|^([0-9]|[1-9][0-9]|100)$");
        if(regex.test(value)){
            requiredStability = value;
            this.setState({
                requiredStability
            })
        }else{
            console.log("No es número")
        }
    }

    onExpectedStabilityChange = () => event => {
        let { expectedStability } = this.state,
            { value } = event.target;
        let regex = new RegExp("^$|^([0-9]|[1-9][0-9]|100)$");
        if(regex.test(value)){
            expectedStability = value;
            this.setState({
                expectedStability
            })
        }else{
            console.log("No es número")
        }
    }

    onRequiredTriageDoneChange = () => event => {
        let { requiredTriageDone } = this.state,
            { value } = event.target;
        let regex = new RegExp("^$|^([0-9]|[1-9][0-9]|100)$");
        if(regex.test(value)){
            requiredTriageDone = value;
            this.setState({
                requiredTriageDone
            })
        }else{
            console.log("No es número")
        }
    }

    onExpectedTriageDoneChange = () => event => {
        let { expectedTriageDone } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^([0-9]|[1-9][0-9]|100)$");
        if(regex.test(value)){
            expectedTriageDone = value;
            this.setState({
                expectedTriageDone
            })
        }else{
            console.log("No es número")
        }
    }


    onRequiredCommitsChange = () => event => {
        let { requiredCommits } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if(regex.test(value)){
            requiredCommits = value;
            this.setState({
                requiredCommits
            })
        }else{
            console.log("No es número")
        }
    }

    onExpectedCommitsChange = () => event => {
        let { expectedCommits } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if(regex.test(value)){
            expectedCommits = value;
            this.setState({
                expectedCommits
            })
        }else{
            console.log("No es número "+ value)
        }
    }
    render() {
        let {type} = this.props;
        let action = _.find(this.actions, {type})

        return (
            <Dialog
                open={this.props.isOpen}
                maxWidth="md"
                fullWidth
                onClose={this.props.onClose}
                aria-labelledby="suiteAction-dialog-title"
                aria-describedby="suiteAction-dialog-description">
                <form onSubmit={this.handleSubmit.bind(this, action)}>
                    <DialogTitle id="suiteAction-dialog-title">
                        {type !== 'testPassed' && action.title}
                        {type === 'testPassed' && (
                            <div className="TriageDialogTitle" style={{borderColor: COLORS.green}}>
                                <h5 style={{color: COLORS.green}}>{action.title}</h5>
                                <CheckIcon
                                    style={{
                                        color: COLORS.green,
                                        marginLeft: 15,
                                        cursor: 'pointer',
                                    }} />
                            </div>
                        )}

                    </DialogTitle>
                    <DialogContent id="suiteAction-dialog-description">
                        <Grid container>
                            <Grid className={"action-dialog-description"} item xs={12}>
                                {action.description}
                            </Grid>

                            {
                                type !== 'enableSuite' && type !== 'disableSuite' && type !== 'invalidateSuite' && type !== 'triageSuite' && type !== 'pullSuite' && type !== 'populateConnector' && type !== 'populateContainer' && type !== 'textReport' && type !== 'testPassed' && type !== 'setGoals' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            id="reportType"
                                            select
                                            label="Report Type"
                                            value={!!this.state.reportType ? this.state.reportType : "UNKNOWN"}
                                            onChange={this.changeReportType.bind(this)}
                                            style={{
                                                marginTop: 30
                                            }}
                                            fullWidth
                                        >
                                            <option value="UNKNOWN">UNKNOWN</option>
                                            <option value="ROBOT">ROBOT</option>
                                            <option value="TESTNG">TESTNG</option>
                                            <option value="JUNIT">JUNIT</option>
                                            <option value="CUCUMBER">CUCUMBER</option>
                                            <option value="ALLURE">ALLURE</option>
                                            <option value="PROTRACTOR">PROTRACTOR</option>
                                            <option value="PROTRACTOR_STEPS">PROTRACTOR_STEPS</option>


                                        </TextField>

                                    </Grid>

                                )
                            }

                            {
                                type !== 'pullSuite' && type !== 'populateConnector' && type !== 'populateContainer' && type !== 'textReport' && type !== 'testPassed' && type !== 'triageSuite' && type !== 'setGoals' && type !== 'invalidateSuite' && type !== 'disableSuite' &&  (
                                    <Grid item xs={12}>
                                        <TextField
                                            id="comment"
                                            label="Test Report (xml or json)"
                                            value={!!this.state.comment ? this.state.comment : null}
                                            onChange={this.changeComment.bind(this)}
                                            multiline
                                            rows={4}
                                            placeholder="No comment yet"
                                            variant="outlined"
                                            InputLabelProps={{shrink: true}}
                                            style={{
                                                marginTop: 30
                                            }}
                                            fullWidth
                                        />
                                    </Grid>
                                )
                            }
                            {
                                type !== 'pullSuite' && type !== 'pushSuite' && type !== 'populateConnector' && type !== 'populateContainer' && type !== 'textReport' && type !== 'testPassed' && type !== 'pushSuite' && type !== 'setGoals' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            id="comment"
                                            label="User Comment"
                                            value={!!this.state.comment ? this.state.comment : null}
                                            onChange={this.changeComment.bind(this)}
                                            placeholder="No comment yet"
                                            spellCheck={false}
                                            variant="outlined"
                                            InputLabelProps={{shrink: true}}
                                            style={{
                                                marginTop: 30
                                            }}
                                            fullWidth
                                            multiline
                                        />

                                    </Grid>
                                )
                            }

                            {
                                type !== 'pullSuite' && type !== 'populateConnector' && type !== 'populateContainer' && type !== 'textReport' && type !== 'testPassed' && type !== 'triageSuite' && type !== 'pushSuite'  && type !== 'invalidateSuite' && type !== 'disableSuite' && (

                                    <Grid item xs={12}>
                                        {/* Si se puede, usar css para agregar espacio (padding o margin) en vez de usar el salto de linea */}
                                        <br/>
                                        <Grid container item xs={12} spacing={0}>
                                            <Grid container item xs={6} spacing={0}>
                                                <Grid container item xs={6} spacing={0} >
                                                {/* Si se puede, usar clases en vez de inline styles en elementos html */}
                                                    <b style={{fontSize: '0.85rem'}}>Growth</b>
                                                </Grid>
                                                <div style={{fontSize: '.75rem'}}>More Tests! How many new tests should be created per month.</div>
                                            </Grid>

                                            <Grid container item xs={6} spacing={1}>
                                                <Grid container item xs={6} spacing={1}>
                                                    <b style={{fontSize: '0.85rem'}}>Triage Done </b>
                                                </Grid>
                                                <div style={{fontSize: '.75rem', marginBottom: 5}}>Verify your failing tests! How many tests can be left without validation? (0 I hope)</div>
                                            </Grid>

                                            <Grid container item xs={2}>
                                                <TextField
                                                    id="growthRequired"
                                                    label="Required"
                                                    value={!! this.state.requiredGrowth ? this.state.requiredGrowth : ''}
                                                    onChange={this.onRequiredGrowthChange()}
                                                    placeholder="10"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={2}>
                                                <TextField
                                                    id="growthExpected"
                                                    label="Expected"
                                                    value={!!this.state.expectedGrowth ? this.state.expectedGrowth : ''}
                                                    onChange={this.onExpectedGrowthChange()}
                                                    placeholder="20"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={2}>
                                            </Grid>
                                            <Grid container item xs={2} spacing={1}>
                                                <TextField
                                                    id="triageDoneRequired"
                                                    label="Required"
                                                    value={!!this.state.requiredTriageDone ? this.state.requiredTriageDone : ''}
                                                    onChange={this.onRequiredTriageDoneChange()}
                                                    placeholder="10"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={2} spacing={1}>
                                                <TextField
                                                    id="triageDoneExpected"
                                                    label="Expected"
                                                    value={!!this.state.expectedTriageDone ? this.state.expectedTriageDone : ''}
                                                    onChange={this.onExpectedTriageDoneChange()}
                                                    placeholder="5"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <br/>

                                        <Grid container item xs={12} spacing={1}>
                                            <Grid container item xs={5} spacing={1}>
                                                <Grid container item xs={6} spacing={1}>
                                                    <b style={{fontSize: '0.85rem'}}>Pass Rate</b>
                                                </Grid>
                                                <div style={{fontSize: '.75rem', marginBottom: 5}}>More Pass Tests! Percentage improvement of the amount of passing tests, i.e. 5% means next month your suite will have 5% more test passing)</div>
                                            </Grid>
                                            <Grid container item xs={1}>
                                            </Grid>
                                            <Grid container item xs={5} spacing={0}>
                                                <Grid container item xs={6} spacing={0}>
                                                    <b style={{fontSize: '0.85rem'}}>Stability </b>
                                                </Grid>
                                                <div style={{fontSize: '.75rem', marginBottom: 5}}>Less Flaky tests! Reduce the fluctuation amount of flaky tests (fail/pass/fail). 5% means next month you'll see %5 less flacky tests)</div>
                                            </Grid>

                                            <Grid container item xs={2} spacing={1}>
                                                <TextField
                                                    id="passingRequired"
                                                    label="Required"
                                                    value={!!this.state.requiredPassing ? this.state.requiredPassing : ''}
                                                    onChange={this.onRequiredPassingChange()}
                                                    placeholder="8%"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={2} spacing={1}>
                                                <TextField
                                                    id="passingExpected"
                                                    label="Expected"
                                                    value={!!this.state.expectedPassing ? this.state.expectedPassing : ''}
                                                    onChange={this.onExpectedPassingChange()}
                                                    placeholder="16%"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={2}>
                                            </Grid>
                                            <Grid container item xs={2} spacing={1}>
                                                <TextField
                                                    id="stabilityRequired"
                                                    label="Required"
                                                    value={!!this.state.requiredStability ? this.state.requiredStability : ''}
                                                    onChange={this.onRequiredStabilityChange()}
                                                    placeholder="15%"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={2} spacing={1}>
                                                <TextField
                                                    id="stabilityExpected"
                                                    label="Expected"
                                                    value={!!this.state.expectedStability ? this.state.expectedStability : ''}
                                                    onChange={this.onExpectedStabilityChange()}
                                                    placeholder="20%"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <br/>
                                        <Grid container item xs={12} spacing={0}>
                                            <Grid container item xs={2}>
                                            </Grid>
                                            <Grid container item xs={9} spacing={0}>
                                                <Grid container item xs={12} spacing={0}>
                                                    <b style={{fontSize: '0.85rem'}}>Commits </b>
                                                </Grid>
                                                <div style={{fontSize: '.75rem', marginBottom: 5}}>Identify the number of commits, the truth is not that what other information to add here.</div>
                                            </Grid>
                                            <Grid container item xs={2} spacing={1}>
                                            </Grid>
                                            <Grid container item xs={3} spacing={1}>
                                                <TextField
                                                    id="commitsRequired"
                                                    label="Required"
                                                    value={!!this.state.requiredCommits ? this.state.requiredCommits : ''}
                                                    onChange={this.onRequiredCommitsChange()}
                                                    placeholder="300"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid container item xs={3} spacing={1}>
                                                <TextField
                                                    id="commitsExpected"
                                                    label="Expected"
                                                    value={!!this.state.expectedCommits ? this.state.expectedCommits : ''}
                                                    onChange={this.onExpectedCommitsChange()}
                                                    placeholder="400"
                                                    spellCheck={false}
                                                    variant="outlined"
                                                    InputLabelProps={{shrink: true}}
                                                    style={{
                                                        marginTop: 10,
                                                        marginLeft: 15,
                                                    }}
                                                />
                                            </Grid>

                                        </Grid>
                                    </Grid>
                                )
                            }
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{paddingRight: 16}}>
                        <Button
                            type="submit"
                            variant="contained"
                            className="globalButton"
                            color={type === 'disableSuite' || type === 'invalidateSuite' ? 'secondary' : 'primary'}>
                            {action.btnText}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}

