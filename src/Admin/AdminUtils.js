import React from 'react'
import TextField from "@mui/material/TextField"

export const defaultContainerState = {
    product: 0,
    connector: 0,
    priority: 0,
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
    assigneeFocus: false,
    shortName: '',
    shortNameError: false,
    url: '',
    reportType: '',
    urlError: false,
    description: '',
    descriptionError: false,
    assignee: null,
    assigneeError: false,
    showAdvanced: false,
    sendUserNotification: false,
    productList: [],
    connectorList: [],
    containersList: [],
    snackbarsList: [],
    minAmountOfTests: 0,
    passRate: 50,
    showActionDialog: false,
    populateConnectorId: 0,
    enableEdit: false,
    slackFocus: false,
    slackChannel: '',
    slackDailyChannel: '',
    slackToken: '',
    slackTokenError: false,
    slackEdit: null,
    containerEdit: null,
    extraData: '',
    populateMode: '',
    searching: true,
    skipped: false,
    validatedContainer: false,
}

export const getCreateContainerBody = state => {
  let timestamp = new Date().getTime()
  return {

    connector: state.connector,
    description: state.description,
    enabled: true,
    executors: [],
    loggerOwner: true,
    name: state.shortName,
    pendingBuildTriages: 0,
    product: state.product,
    timestamp,
    type: null,
    updated: timestamp,
    url: state.url,
    reportType: state.reportType,
    hiddenData: state.extraData,
    populateMode: state.populateMode,
    triageSpec: {
      enabled: true,
      executor: 0,
      expectedMinAmountOfTests: state.minAmountOfTests,
      expectedPassRate: state.passRate,
      frequencyCron: getTriageFrequencyCron(state),
      everyWeeks: state.triageFrecuencyWeek,
      priority: state.priority,
      timestamp,
      updated: timestamp,
      triager: state.assignee,
    }
  }
}


export const getSaveExecutorBody = state => {
	  let timestamp = new Date().getTime()

	  return {
	    ...state.executorEdit,
	    product:state.product,
	    triageSpec: {
	      ...state.executorEdit.triageSpec,
	      frequencyCron: getTriageFrequencyCron(state),
	      everyWeeks: state.triageFrecuencyWeek,
	      priority: state.executorEdit.triageSpec.priority,
	      timestamp,
	      updated: timestamp,
	      enabled: true,
	      triager: state.executorEdit.triageSpec.triager,
	    }
	  }
	}


export const getSaveContainerBody = state => {
  let timestamp = new Date().getTime()

  return {
    ...state.containerEdit,
    name: state.shortName,
    url: state.url,
    reportType: state.reportType,
    description: state.description,
    product: state.product,
    connector: state.connector,
    hiddenData: state.extraData,
    populateMode: state.populateMode,
    triageSpec: {
      ...state.containerEdit.triageSpec,
      expectedMinAmountOfTests: state.minAmountOfTests,
      expectedPassRate: state.passRate,
      frequencyCron: getTriageFrequencyCron(state),
      everyWeeks: state.triageFrecuencyWeek,
      priority: state.priority,
      timestamp,
      updated: timestamp,
      enabled: true,
      triager: state.assignee,
    }
  }
}

export const getTriageFrequencyCron = state => {
    let {
      triageMonday,
      triageTuesday,
      triageWednesday,
      triageThursday,
      triageFriday,
      triageSaturday,
      triageSunday,
      triageFrecuencyHour,
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

    return `${triageFrecuencyHour} * * ${selectedDays}`
}

export const PriorityList = [
    {value: 0, label: "P0"},
    {value: 1, label: "P1"},
    {value: 2, label: "P2"},
    {value: 3, label: "P3"},
    {value: 4, label: "P4"},
]


export const WeekList = [
    {value: 1, label: "Every week"},
    {value: 2, label: "Every 2 week"},
    {value: 3, label: "Every 3 week"},
    {value: 4, label: "Every 4 week"},
    // {value: 5, label: "Before Product Deadline"},
]

export const HourList = [
    {value: '0 0 0', label: '00:00 Hs'},
    {value: '0 30 0', label: '00:30 Hs'},
    {value: '0 0 1', label: '01:00 Hs'},
    {value: '0 30 1', label: '01:30 Hs'},
    {value: '0 0 2', label: '02:00 Hs'},
    {value: '0 30 2', label: '02:30 Hs'},
    {value: '0 0 3', label: '03:00 Hs'},
    {value: '0 30 3', label: '03:30 Hs'},
    {value: '0 0 4', label: '04:00 Hs'},
    {value: '0 30 4', label: '04:30 Hs'},
    {value: '0 0 5', label: '05:00 Hs'},
    {value: '0 30 5', label: '05:30 Hs'},
    {value: '0 0 6', label: '06:00 Hs'},
    {value: '0 30 6', label: '06:30 Hs'},
    {value: '0 0 7', label: '07:00 Hs'},
    {value: '0 30 7', label: '07:30 Hs'},
    {value: '0 0 8', label: '08:00 Hs'},
    {value: '0 30 8', label: '08:30 Hs'},
    {value: '0 0 9', label: '09:00 Hs'},
    {value: '0 30 9', label: '09:30 Hs'},
    {value: '0 0 10', label: '10:00 Hs'},
    {value: '0 30 10', label: '10:30 Hs'},
    {value: '0 0 11', label: '11:00 Hs'},
    {value: '0 30 11', label: '11:30 Hs'},
    {value: '0 0 12', label: '12:00 Hs'},
    {value: '0 30 12', label: '12:30 Hs'},
    {value: '0 0 13', label: '13:00 Hs'},
    {value: '0 30 13', label: '13:30 Hs'},
    {value: '0 0 14', label: '14:00 Hs'},
    {value: '0 30 14', label: '14:30 Hs'},
    {value: '0 0 15', label: '15:00 Hs'},
    {value: '0 30 15', label: '15:30 Hs'},
    {value: '0 0 16', label: '16:00 Hs'},
    {value: '0 30 16', label: '16:30 Hs'},
    {value: '0 0 17', label: '17:00 Hs'},
    {value: '0 30 17', label: '17:30 Hs'},
    {value: '0 0 18', label: '18:00 Hs'},
    {value: '0 30 18', label: '18:30 Hs'},
    {value: '0 0 19', label: '19:00 Hs'},
    {value: '0 30 19', label: '19:30 Hs'},
    {value: '0 0 20', label: '20:00 Hs'},
    {value: '0 30 20', label: '20:30 Hs'},
    {value: '0 0 21', label: '21:00 Hs'},
    {value: '0 30 21', label: '21:30 Hs'},
    {value: '0 0 22', label: '22:00 Hs'},
    {value: '0 30 22', label: '22:30 Hs'},
    {value: '0 0 23', label: '23:00 Hs'},
    {value: '0 30 23', label: '23:30 Hs'},
]

export const scrollToTop = () => {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

export const TextFieldInput = (props) => {
  return <TextField
              {...props}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                  shrink: true,
              }}
              style={{marginTop: props.nomargintop ? 0 : 20}}
              inputProps={{
                  style: {
                    fontSize: '.875rem',
                  }
              }}
          />
}

export const extraDataTooltip = (
  <div className="extraDataTooltip">
    <h6>CircleCI</h6>
    <div>Format:: /:vcs_type/:vcs_userName/:projectName</div>
    <ol>
      <li>From https://circleci.com/api/v1.1/projects to get an array of all projects currently followed</li>
      <li>Find the object element were 'reponame' value matchs with the desired project</li>
      <li>Inspect 'vcs_url' field to get parameters</li>
    </ol>
    <ul>
      <li>If url contains bitbucket, then vcs_type=bb</li>
      <li>If url contains github, then vcs_type=gh</li>
      <li>projectName --> value next to user name</li>
    </ul>
    <div><b>Example</b></div>
    <ul style={{ paddingLeft: 20 }}>
      <li>For vcs_url=https://bitbucket.org/custom/best_project will be bb/custom/best_project</li>
      <li>For vcs_url=https://github.org/custom/best_project will be gh/custom/best_project</li>
    </ul>
    <br />
    <h6>GitLab</h6>
    <div>Format:: /:project_name_space/:project_path/:project_id</div>
    <ol>
      <li>From [GITLAB_URL]/api/v4/projects to get an array of all projects</li>
      <li>Find the object element were 'name' value matchs with the desired project</li>
      <li>Inspect 'path_with_namespace' field to get 'project_name_space' and 'project_path' parameters</li>
      <li>Inspect 'id' field to get 'project_id' parameter</li>
    </ol>
    <div><b>Example</b></div>
    <div>
      <div>For:</div>
      <div>{'{ id: 5684 , name: custom_project , path_with_namespace: custom_space/custom_project }'}</div>
      <div>Will be custom_space/custom_project/5864</div>
    </div>
  </div>
)
