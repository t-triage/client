import React, {Component} from 'react'
import Api from "./Api"
import axios from 'axios'

import Grid from "@material-ui/core/Grid"
import TextField from "@material-ui/core/TextField"
import MenuItem from "@material-ui/core/MenuItem"
import Button from "@material-ui/core/Button"
import {COLORS, TEST_PLAN_STATUS, getDayInYear, checkDateBeforeToday} from './Globals'
import Tooltip from "@material-ui/core/Tooltip";
import Checkbox from "@material-ui/core/Checkbox";
import Avatar from "@material-ui/core/Avatar";
import Blue from "@material-ui/core/colors/blue";
import {getTriageFrequencyCron, HourList, PriorityList, TextFieldInput, WeekList} from "../../Admin/AdminUtils";
import Select from "@material-ui/core/Select";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import UserPicker from "./UserPicker";

const EMPTY_PIPELINE = {
    id: '',
    name: '',
    description: '',
    container: '',
    assignee: '',
    priority: '',
    product: '',
    passRate: '',
    enabled: true,
    minAmountOfTests: '',
    triageFrequencyWeek: 1,
    triageFrequencyCron: '',
    triageFrequencyHour: '0 0 17',
    containerList: [],
}

export default class AutomatedTestPipelineEdit extends Component {
    state = {
        name: '',
        description: '',
        container: '',
        assignee: '',
        priority: '',
        enabled: true,
        minAmountOfTests: '',
        triageFrequencyWeek: 1,
        triageFrequencyCron: '',
        triageFrequencyHour: '0 0 17',
        containerList: [],
        triageMonday: false,
        triageTuesday: false,
        triageWednesday: false,
        triageThursday: false,
        triageFriday: false,
        triageSaturday: false,
        triageSunday: false,
        testPlan: Object.assign({}, EMPTY_PIPELINE),
        triageSpec: null,
        nameError: false,
        descriptionError: false,
        containerError: false,
        assigneeFocus: false,
    }

    componentDidMount() {
        this.fetchContainers();
    }

    fetchContainers() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetContainers + "?sort=name,asc")
            .then(res => {
                this.setState({
                    containerList: res.data.content,
                })

                let pipeline = this.props.pipeline;
                if (pipeline != null) {
                    let {triageSpec, testPlan} = this.state;

                    testPlan.name = pipeline.name;
                    testPlan.description = pipeline.description;
                    testPlan.id = pipeline.id;

                    triageSpec = pipeline.triageSpec;
                    this.fetchTriageSpec(triageSpec.container, triageSpec);
                    this.setState({
                        testPlan,
                        triageSpec,
                    })
                }
            })
    }

    select = name => event => {
        let {testPlan} = this.state
        let {value} = event.target
        testPlan[name] = value
        this.setState({
            testPlan,
        }, () => {
            if (name === 'name') {
                this.setState({
                    nameError: value === '' ? true : false
                })
            }
            if (name === 'description') {
                this.setState({
                    descriptionError: value === '' ? true : false
                })
            }
            if (name === "priority") {
                this.setState({
                    priority: event.target.value,
                })
            }
            if (name === "triageFrequencyWeek") {
                this.setState({
                    triageFrequencyWeek: event.target.value,
                })
            }
            if (name === "triageFrequencyHour") {
                this.setState({
                    triageFrequencyHour: event.target.value,
                })
            }
            else {
                this.setState({
                    [name]: event.target
                })
            }
        })
    }

    check = name => event => {
        this.setState({
            [name]: event.target.checked,
        })
    }

    getTriageFrequencyCron = state => {
        let {
            triageMonday,
            triageTuesday,
            triageWednesday,
            triageThursday,
            triageFriday,
            triageSaturday,
            triageSunday,
            testPlan,
        } = state;
        let days = [];
        if (triageMonday)
            days.push('MON')
        if (triageTuesday)
            days.push('TUE')
        if (triageWednesday)
            days.push('WED')
        if (triageThursday)
            days.push('THU')
        if (triageFriday)
            days.push('FRI')
        if (triageSaturday)
            days.push('SAT')
        if (triageSunday)
            days.push('SUN')

        let selectedDays = days.length === 7 ? '*' : days.join(',')

        return `${testPlan.triageFrequencyHour} * * ${selectedDays}`
    }

    setTriageFrequencyCron = frequencyCron => {
        let triageFrequencyHour = frequencyCron.split(" * * ")[0];
        let selectedDays = frequencyCron.split(" * * ")[1];

        let{testPlan} = this.state;
        testPlan.triageFrequencyHour = triageFrequencyHour,

        this.setState({
            triageFrequencyHour: triageFrequencyHour,
            testPlan,
        })
        if(selectedDays == "*") {
            this.setState({
                triageMonday: true,
                triageTuesday: true,
                triageWednesday: true,
                triageThursday: true,
                triageFriday: true,
                triageSaturday: true,
                triageSunday: true,
            })
        }
        else {
            let days = selectedDays.split(",");
            days.map((day) => {
                if(day == 'MON'){
                    this.setState({
                        triageMonday: true,
                    })
                }
                if(day == 'TUE'){
                    this.setState({
                        triageTuesday: true,
                    })
                }
                if(day == 'WED'){
                    this.setState({
                        triageWednesday: true,
                    })
                }
                if(day == 'THU'){
                    this.setState({
                        triageThursday: true,
                    })
                }
                if(day == 'FRI'){
                    this.setState({
                        triageFriday: true,
                    })
                }
                if(day == 'SAT'){
                    this.setState({
                        triageSaturday: true,
                    })
                }
                if(day == 'SUN'){
                    this.setState({
                        triageSunday: true,
                    })
                }
            })
        }
    }

    fetchTriageSpec(containerID, triageSpec) {
        let {testPlan} = this.state;
        this.setState({
            assignee: triageSpec.triager,
            priority: triageSpec.priority,
            minAmountOfTests: triageSpec.expectedMinAmountOfTests,
            passRate: triageSpec.expectedPassRate,
            triageFrequencyWeek: triageSpec.everyWeeks,
        })

        let containerObj = null;

        testPlan.priority = triageSpec.priority;
        testPlan.assignee = triageSpec.triager;
        testPlan.minAmountOfTests = triageSpec.expectedMinAmountOfTests;
        testPlan.passRate = triageSpec.expectedPassRate;
        testPlan.triageFrequencyWeek = triageSpec.everyWeeks;

        let {containerList} = this.state;
        try {
            containerList.map(con => {
                if (containerID === con.id) {
                    containerObj = con;
                }
            })
        } catch (e) {
            console.log(e);
        }

        testPlan.container = containerObj;
        testPlan.product = containerObj != null ? containerObj.product : null;

        if (this.props.pipeline != null) {
            this.setState({
                container: containerObj,
            })
        }

        this.setState({
            testPlan,
        })
        this.setTriageFrequencyCron(triageSpec.frequencyCron);

    }

    handleChange = (event) => {
        const name = event.target.name;
        this.setState({
            [name]: event.target.value,
        });
        if (name == "container") {
            let container = event.target.value;
            let {testPlan} = this.state;

            this.fetchTriageSpec(container.id, container.triageSpec);

            this.setState({
                containerError: false,
            })
        }
    }

    onAssigneeChange(assignee) {
        let {testPlan} = this.state;
        testPlan.assignee = assignee;
        this.setState({
            assignee,
            testPlan,
            assigneeError: false,
        })
    }

    onClose(id) {
        this.props.onClose(id)
    }

    onUserChange(item) {
        this.setState({
            testPlan: {...this.state.testPlan, assignee: item}
        })
    }

    onDateChange(name, date) {
        let {testPlan, pastFromDateError, toDateBeforeFromDateError} = this.state
        testPlan[name] = date.getTime()
        if (name === 'fromDate')
            pastFromDateError = checkDateBeforeToday(date)
        if (name === 'toDate')
            toDateBeforeFromDateError = this.checkToDateBeforeFromDate(date)
        this.setState({
            testPlan,
            pastFromDateError,
            toDateBeforeFromDateError,
        })
    }

    checkToDateBeforeFromDate(date) {
        let {fromDate} = this.state.testPlan
        return getDayInYear(date) < getDayInYear(new Date(fromDate))
    }

    validateFields() {
        let {testPlan} = this.state;
        let result = true;
        if (testPlan.name === '' || testPlan.description === '' || testPlan.container === '') {
            result = false;
        }
        this.setState({
            assigneeError: testPlan.container.triager === '' ? true : false,
            nameError: testPlan.name === '' ? true : false,
            descriptionError: testPlan.description === '' ? true : false,
            containerError: testPlan.container === '' ? true : false,
        })
        return result;
    }

    onSubmit(ev) {
        ev.preventDefault()
        if(this.validateFields()){
            let {testPlan} = this.state
            let body = {
                name: testPlan.name,
                description: testPlan.description,
                product: testPlan.product,
                enabled: true,
                timestamp: new Date().getTime(),
            }
            if (testPlan.id != '') { body.id = testPlan.id }
            axios({
                method: testPlan.id != '' ? "PUT" : "POST",
                url: `${Api.getBaseUrl()}${testPlan.id != '' ? Api.ENDPOINTS.UpdatePipeline : Api.ENDPOINTS.SavePipeline}`,
                data: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
            }). then(res =>{
                let idPipeline = testPlan.id != '' ? testPlan.id : res.data.id;
        
                //CREAR TRIAGE SPEC ASOCIADO AL PIPELINE
                let triageSpec = {
                    container: this.state.triageSpec == null ? this.state.container.id : this.state.triageSpec.container,
                    pipeline: idPipeline,
                    expectedMinAmountOfTests: testPlan.minAmountOfTests,
                    expectedPassRate: testPlan.passRate,
                    frequencyCron: this.getTriageFrequencyCron(this.state),
                    everyWeeks: testPlan.triageFrequencyWeek,
                    priority: testPlan.priority,
                    timestamp: new Date().getTime(),
                    updated: new Date().getTime(),
                    enabled: true,
                    triager: testPlan.assignee,
                }

                axios({
                    method: (this.state.triageSpec != null) ? "PUT" : "POST",
                    url: `${Api.getBaseUrl()}${(this.state.triageSpec != null) ? Api.ENDPOINTS.UpdateTriageSpec : Api.ENDPOINTS.SaveTriageSpec}`,
                    data: JSON.stringify(triageSpec),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(ress =>{
                    if (ress.status != 201 && this.props.pipeline == null) {
                        //ERROR EN LA CREACION DEL PIPELINE
                        axios({
                            method: "DELETE",
                            url: Api.getBaseUrl() + Api.ENDPOINTS.DeletePipeline + res.data.id,
                        }).then(
                            this.props.onSave()
                        )
                    }
                    else {
                        //SUCCEFUL
                        this.props.onSave(res.data.id, testPlan)
                    }
                })
            })
        }
    }

    renderContainerList() {
        let {containerList} = this.state;
        let boolean = false;
        try {
            return containerList.map((container, index) => {
                if (this.props.pipeline != null) {
                    boolean = (this.state.container != '') ? (this.state.container.id = container.id ? true : false) : false;
                }
                return (
                    <MenuItem key={index} value={container} selected={boolean}> {container.name} </MenuItem>
                )
            })
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        let {fullWidth, inDialog} = this.props
        let {testPlan,
            nameError, assigneeError, descriptionError, containerError, assigneeFocus} = this.state

        return testPlan && (
            <form onSubmit={this.onSubmit.bind(this)}
                  style={{width: fullWidth ? '100%' : '80%'}}
                  className="manualTestPlanEditForm">
                <Grid container spacing={16}>
                    <Grid item xs={12}>
                        <TextField
                            id={`testPlan-name-${testPlan.id ? testPlan.id : 'new'}`}
                            label="Name"
                            placeholder="Pipeline Name"
                            onChange={this.select('name')}
                            value={testPlan.name ? testPlan.name : ''}
                            error={nameError}
                            helperText={nameError ? 'Required field' : ''}
                            fullWidth
                            autoFocus
                            multiline
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                style: {
                                    fontSize: '1rem',
                                    minHeight: '20px'
                                }
                            }}
                            spellCheck={false}
                            className="manualTestEditTestName"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id={`testPlan-description-${testPlan.id ? testPlan.id : 'new'}`}
                            label="Description"
                            placeholder="Pipeline Description"
                            onChange={this.select('description')}
                            value={testPlan.description ? testPlan.description : ''}
                            error={descriptionError}
                            helperText={descriptionError ? 'Required field' : ''}
                            fullWidth
                            multiline
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                style: {
                                    fontSize: '1rem',
                                    minHeight: '20px'
                                }
                            }}
                            spellCheck={false}
                            className="manualTestEditTestName"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            value={this.state.container}
                            onChange={this.handleChange}
                            label="Container"
                            error={containerError}
                            helperText={containerError ? 'Required field' : ''}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                name: 'container',
                                id: 'outlined-containers-native-simple',
                            }}
                        >
                            {this.renderContainerList()}
                        </TextField>
                    </Grid>
                    <Grid container spacing={16}>
                        <Grid item xs={6}>
                            <div style={{marginTop: 20, marginBottom: 15}}>Triage Spec</div>
                            <div className={'TestPlan-AssigneeContainer'}>
                                <fieldset className={
                                    assigneeFocus ?
                                        assigneeError ? 'TestPlan-AssigneeFieldset-active-error' : 'TestPlan-AssigneeFieldset-active'
                                        : assigneeError ? 'TestPlan-AssigneeFieldset-error' : 'TestPlan-AssigneeFieldset'
                                }>
                                    <legend className={
                                        assigneeFocus ?
                                            assigneeError ? 'TestPlan-AssigneeLabel-active-error' : 'TestPlan-AssigneeLabel-active'
                                            : assigneeError ? 'TestPlan-AssigneeLabel-error' : 'TestPlan-AssigneeLabel'
                                    }>
                                        <span style={{marginLeft: '-3', marginRight: '-3'}}>Assignee</span>
                                    </legend>
                                    <UserPicker
                                        onChange={this.onAssigneeChange.bind(this)}
                                        color={'currentColor'}
                                        onFocus={() => this.setState({assigneeFocus: true})}
                                        onBlur={() => this.setState({assigneeFocus: false})}
                                        border={'0'}
                                        buildTriage={0}
                                        selectedItem={this.state.assignee}/>
                                </fieldset>
                                {assigneeError &&
                                <span style={{color: COLORS.redError, margin: '6 12 0', fontSize: '0.75rem'}}>Required field</span>}
                            </div>

                            <TextField
                                id="priority"
                                select
                                label="Priority"
                                value={testPlan.priority}
                                onChange={this.select("priority")}
                                style={{marginTop: 20}}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: '.875rem'
                                    }
                                }}
                            >
                                {PriorityList.map(p => (
                                    <MenuItem className="globalMenuItem" key={p.value}
                                              value={p.value}>{p.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{marginTop: 20}}>Sprint Deadline Frequency</div>
                            <div style={{fontSize: '.75rem', marginBottom: 5}}>When automators should have analyzed
                                every
                                single failed test from this container.
                            </div>
                            <div className="TriageFrecuency">
                                <div>
                                    <Tooltip title="Triage Monday">
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
                                    <Tooltip title="Triage Tuesday">
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
                                    <Tooltip title="Triage Wednesday">
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
                                    <Tooltip title="Triage Thursday">
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
                                    <Tooltip title="Triage Friday">
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
                                    <Tooltip title="Triage Saturday">
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
                                    <Tooltip title="Triage Sunday">
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
                                    <TextField
                                        id="triageFrecuencyWeek"
                                        select
                                        label="Every"
                                        value={testPlan.triageFrequencyWeek}
                                        onChange={this.select("triageFrequencyWeek")}
                                        style={{marginTop: 15}}
                                        fullWidth
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        InputProps={{
                                            style: {
                                                fontSize: '.875rem'
                                            }
                                        }}
                                    >
                                        {WeekList.map(p => (
                                            <MenuItem className="globalMenuItem" key={p.value}
                                                      value={p.value}>{p.label}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        id="triageFrequencyHour"
                                        select
                                        label="Hour"
                                        value={testPlan.triageFrequencyHour}
                                        onChange={this.select("triageFrequencyHour")}
                                        style={{marginTop: 15}}
                                        fullWidth
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        InputProps={{
                                            style: {
                                                fontSize: '.875rem'
                                            }
                                        }}
                                    >
                                        {HourList.map(p => (
                                            <MenuItem className="globalMenuItem" key={p.value}
                                                      value={p.value}>{p.label}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                        <div style={{
                            marginTop: 25,
                            marginBottom: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-start'
                        }}>
                            <Button
                                type="button"
                                className="globalButton"
                                onClick={this.onClose.bind(this, testPlan.id)}
                                variant="contained"
                                color="secondary">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="globalButton"
                                variant="contained"
                                style={{marginLeft: 8}}
                                color="primary">
                                Save
                            </Button>
                        </div>
                    </Grid>
            </form>
        )
    }

}
