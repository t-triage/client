import React, { Component } from "react";
import axios from "axios";
import Api from "./Api";

import UserPicker from "../Components/UserPicker"
import ComponentsPickerSingle from "./ComponentsPickerSingle";
import InputBase from "@mui/material/InputBase";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

import {
  styles,
  COLORS,
  MANUAL_LAST_EXECUTION_LIST,AUTOMATED_SUITE_HIDE_LIST,
  AUTOMATED_SUITE_STATUS_LIST,
  AUTOMATED_SUITE_FLAKY_STATUS_LIST
} from "./Globals";

import withStyles from '@mui/styles/withStyles';
import * as _  from "underscore";

class AutomatedTestFilters extends Component {
  state = {
    filtering: false,
    automatedAssignee: null,
  };

  componentDidMount() {
    let {filters, pipelineList} = this.props;

    this.props.fetchDefaultComponents();
  }

  fetchUser(id, field) {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUser + id).then((res) => {
      this.setState({
        [field]: res.data,
      });
    });
  }
      

  


  updateTestList = (name) => (event) => {
    let { filters } = this.props;
    let { value } = event.target;
    {name =='hideNoSuite' ? filters[name] =  value :( 
    filters[name] = value && value !== 'SELECT' && value !== -1 && value !== -2 || value === 0 ? value : null)} 
   
    if (value.length || !value || !isNaN(value) ) {
      this.setState({
        filtering: true,
      });
      this.props.filterTests({ ...filters });
    }
  };

  showInputBorder(id) {
    let element = document.getElementById(id);
    element.parentElement.style.border = "1px solid #ccc";
  }

  hideInputBorder(id) {
    let element = document.getElementById(id);
    element.parentElement.style.border = "1px solid #f6f6f6";
  }

  onUserChange(name, assignee) {
    let {filters} = this.props
    filters[name] = assignee.id !== -1 ? assignee.id : null
    this.setState({
      [name]: assignee,
      filtering: true,
    })
    this.props.filterTests(filters)
  }

  onComponentChange(type, item) {
    let {filters} = this.props
    filters[type] = item
    let id = item.id !== -1 ? item.id : null
    this.setState({
      filters,
      filtering: true,
    })
    this.props.filterTests({...filters})

    if (type !== 'component6') {
      this.props.fetchDefaultComponents(type, id);
    }
  }

  onComponentDelete(types, item) {
    let {filters} = this.props

    types.forEach(type => {
      filters[type] = null
    })
    this.setState({
      filters,
      filtering: true,
    })
    this.props.filterTests({...filters})
  }

  resetFilters() {
    let filters = JSON.parse(JSON.stringify(this.props.filters)),
        defaultFilters = {
          lastExecution: null,
          executorName: null,
          hideNoSuite: false,
          currentState: 'all',
          automatedAssignee: null,
          flakyTest: null,
          pipeline: null,
          //maybe in next version fromDate: null,
          //maybe in next version toDate: null,
          component1: null,
          component2: null,
          component3: null,
          component4: null,
          component5: null,
          component6: null,
        };

    this.setState({
      filtering: false,
      automatedAssignee: null,
    });
    this.props.filterTests(_.extend(filters, defaultFilters));
  }

  render() {
    let {filtering, automatedAssignee } = this.state;
    let {
      filters,
      classes,
      loading,
      pipelineList,
      defaultItemsComponent1,
      defaultItemsComponent2,
      defaultItemsComponent3,
      defaultItemsComponent4,
      defaultItemsComponent5,
      defaultItemsComponent6,
    } = this.props;
    let inputStyle = {
      fontSize: ".875rem",
      width: "100%",
      border: "1px solid #ccc",
      paddingLeft: 5,
      color: COLORS.primary,
      borderRadius: 3,
    };
    let FILTERS = [
      { id: 6, name: 'Pipeline', 
      component: <TextField
      id="testPlanFilterInput"
      select
      value={filters.pipeline ? filters.pipeline : -2}
      style={{
        width: '100%'
      }}
      InputProps={{
        disableUnderline: true,
        className: 'manualTestFilterStyle',
      }}
      SelectProps={{
        classes: {
          icon: classes.selectIcon
        },
        IconComponent: () => <KeyboardArrowDown />
      }}
      onChange={this.updateTestList("pipeline")}
      variant="standard">
      {(pipelineList && pipelineList.length) &&
      pipelineList.map(p => (
        p.id !== -1 &&
        <MenuItem className="globalMenuItem" key={p.id} value={p.id}>
          {p.name === 'Select ...' ? 'All' : p.name}
        </MenuItem>
      ))}
    </TextField> },
      {
        id: 1,
        name: "Suite Name",
        component: (
          <InputBase
          id="suiteNameFilterInput"
          placeholder="All"
          className="manualTestFilterStyle"
          style={{
            width: "100%",
          }}
          value={filters.executorName ? filters.executorName : ""}
          onChange={this.updateTestList("executorName")}
        />
        ),
      },
      {
        id: 2, name: 'Assignee', component: <UserPicker
            onChange={this.onUserChange.bind(this, "automatedAssignee")}
            selectedItem={automatedAssignee}
            showAll={true}
            buildTriage={0}
            backgroundColor="white"
            className="manualFilter-user"
            marginRight={-7}
            placeholder='All'/>
      },
      {
        id: 10,
        name: 'Component 1',
        component: <ComponentsPickerSingle
            id='component1'
            className='componentsFilterInput'
            searchAutomated={true}
            defaultItems={defaultItemsComponent1}
            onChange={this.onComponentChange.bind(this, 'component1')}
            onDelete={this.onComponentDelete.bind(this, ['component1', 'component2', 'component3', 'component4', 'component5', 'component6'])}
            selectedItem={filters.component1}/>
      },
      {
        id: 11,
        name: 'Component 2',
        hide: !!loading || !filters.component1 || !defaultItemsComponent2,
        component: <ComponentsPickerSingle
            id='component2'
            className='componentsFilterInput'
            searchAutomated={true}
            defaultItems={defaultItemsComponent2}
            excludeFromSearch={[filters.component1]}
            onChange={this.onComponentChange.bind(this, 'component2')}
            onDelete={this.onComponentDelete.bind(this, ['component2', 'component3', 'component4', 'component5', 'component6'])}
            selectedItem={filters.component2}/>
      },
      {
        id: 12,
        name: 'Component 3',
        hide: !!loading || !filters.component2 || !defaultItemsComponent3,
        component: <ComponentsPickerSingle
            id='component3'
            className='componentsFilterInput'
            searchAutomated={true}
            defaultItems={defaultItemsComponent3}
            onChange={this.onComponentChange.bind(this, 'component3')}
            onDelete={this.onComponentDelete.bind(this, ['component3', 'component4', 'component5', 'component6'])}
            selectedItem={filters.component3}/>
      },
      {
        id: 13,
        name: 'Component 4',
        hide: !!loading || !filters.component3 || !defaultItemsComponent4,
        component: <ComponentsPickerSingle
            id='component4'
            className='componentsFilterInput'
            searchAutomated={true}
            defaultItems={defaultItemsComponent4}
            onChange={this.onComponentChange.bind(this, 'component4')}
            onDelete={this.onComponentDelete.bind(this, ['component4', 'component5', 'component6'])}
            selectedItem={filters.component4}/>
      },
      {
        id: 14,
        name: 'Component 5',
        hide: !!loading || !filters.component4 || !defaultItemsComponent5,
        component: <ComponentsPickerSingle
            id='component5'
            className='componentsFilterInput'
            searchAutomated={true}
            defaultItems={defaultItemsComponent5}
            onChange={this.onComponentChange.bind(this, 'component5')}
            onDelete={this.onComponentDelete.bind(this, ['component5', 'component6'])}
            selectedItem={filters.component5}/>
      },
      {
        id: 15,
        name: 'Component 6',
        hide: !!loading || !filters.component5 || !defaultItemsComponent6,
        component: <ComponentsPickerSingle
            id='component6'
            className='componentsFilterInput'
            searchAutomated={true}
            defaultItems={defaultItemsComponent6}
            onChange={this.onComponentChange.bind(this, 'component6')}
            onDelete={this.onComponentDelete.bind(this, ['component6'])}
            selectedItem={filters.component6}/>
      },
      {
        id: 3,
        name: "Last Execution",
        component: (

            <TextField
                id="lastExecutionFilterInput"
                select
                value={filters.lastExecution ? filters.lastExecution : "SELECT"}
                style={{
                  width: "100%",
                }}
                InputProps={{
                  disableUnderline: true,
                  className: "manualTestFilterStyle",
                }}
                SelectProps={{
                  classes: {
                    icon: classes.selectIcon,
                  },
                  IconComponent: () => <KeyboardArrowDown />,
                }}
                onChange={this.updateTestList("lastExecution")}
                variant="standard"
            >
              {MANUAL_LAST_EXECUTION_LIST.map((p) => (
                  <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                    {p.value === "SELECT" ? "All" : p.label}
                  </MenuItem>
              ))}
            </TextField>


        ),
      },
      {
        id: 4,
        name: "Current State",
        component: (

          <TextField
            id="suiteShowFilterInput"
            select
            value={filters.currentState ? filters.currentState : "ALL"}
            style={{
              width: "100%",
            }}
            InputProps={{
              disableUnderline: true,
              className: "manualTestFilterStyle",
            }}
            SelectProps={{
              classes: {
                icon: classes.selectIcon,
              },
              IconComponent: () => <KeyboardArrowDown />,
            }}
            onChange={this.updateTestList("currentState")}
            variant="standard"
          >
            {AUTOMATED_SUITE_STATUS_LIST.map((p) => (
              <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                {p.value === "ALL" ? "All" : p.label}
              </MenuItem>
            ))}
          </TextField>
        ),
      }, {
        id: 5,
        name: "Flaky / Solid",
        component: (

            <TextField
                id="suiteShowFilterInput"
                select
                value={filters.flakyTest ? filters.flakyTest : 'all'}
                style={{
                  width: "100%",
                }}
                InputProps={{
              disableUnderline: true,
              className: "manualTestFilterStyle",
            }}
            SelectProps={{
              classes: {
                icon: classes.selectIcon,
              },
              IconComponent: () => <KeyboardArrowDown />,
            }}
            onChange={this.updateTestList("flakyTest")}
            variant="standard"
          >
            {AUTOMATED_SUITE_FLAKY_STATUS_LIST.map((p) => (
              <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                {p.value === 'all' ? "All" : p.label}
              </MenuItem>
            ))}
          </TextField>
        ),
      }, 
      {
        id: 7,
        name: "Active Tests",
        component: (

          <TextField
            id="suiteShowFilterInput"
            select
            value={filters.hideNoSuite && filters.hideNoSuite}
            style={{
              width: "100%",
            }}
            InputProps={{
              disableUnderline: true,
              className: "manualTestFilterStyle",
            }}
            SelectProps={{
              classes: {
                icon: classes.selectIcon,
              },
              IconComponent: () => <KeyboardArrowDown />,
            }}
            onChange={this.updateTestList("hideNoSuite")}
            variant="standard"
          >
            {AUTOMATED_SUITE_HIDE_LIST.map((p) => (
              <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                {p.value === true ? "Hide" : p.label}
              </MenuItem>
            ))}
          </TextField>
        ),
      },

    ];

    return (
      <div>
        <div>
          <div
            className="manualTestListFiltersContainer"
            style={{ marginTop: 15, marginRight: 20 }}
          >
            <div className="manualTestListFilters">
              
              <div
                style={{
                  fontSize: ".875rem",
                  color: COLORS.grey,
                  marginTop: 10,
                  marginRight: 10,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    cursor: filtering ? "pointer" : "default",
                    color: filtering ? COLORS.primary : "#ddd",
                    marginLeft: 20,
                  }}
                  onClick={filtering ? this.resetFilters.bind(this) : null}
                >
                  Clear filters
                </span>
              </div>
              {FILTERS.map((filter, index) => {
                return (
                  !filter.hide && (
                    <div
                      key={index}
                      style={{
                        marginBottom: 10,
                        padding: "0 15px 5px 15px",
                        borderBottom: "1px solid #f1f1f1",
                      }}
                    >
                      <div style={{ fontSize: ".75rem" }}>{filter.name}</div>
                      <div>{filter.component}</div>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AutomatedTestFilters);
