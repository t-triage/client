import React, { Component } from 'react'
import axios from 'axios'
import Api from './Api'

import UserPicker from './UserPicker'
import ComponentsPickerSingle from './ComponentsPickerSingle'
import FunctionalityPicker from './FunctionalityPicker'
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';
import FilterIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import {
  styles,
  COLORS,
  SUITE_TYPE_LIST,
  MANUAL_PRIORITY_LIST,
  TECHNIQUE_LIST,
  AUTOMATION_LIST,
  MANUAL_LAST_EXECUTION_LIST,
  NEEDS_UPDATE_LIST,
} from './Globals'

import { withStyles } from '@material-ui/core/styles';
import {_} from 'underscore';

class ManualTestFilters extends Component {

  state = {
      showMore: false,
      owner: null,
      externalId: '',
      lastUpdater: null,
      filtering: false,
      functionalityEntity: null
  }

  componentDidMount() {
      let {filters} = this.props;
      if (filters.owner) {
          this.fetchUser(filters.owner, 'owner')
      }

      if (filters.functionalityEntity) {
          this.fetchFunctionality(filters.functionalityEntity, 'functionalityEntity')
      }

      this.props.fetchDefaultComponents();
      this.setState({
          externalId: filters.externalId ? filters.externalId : '',
          filtering: !!filters.externalId
      })
  }

    fetchUser(id, field) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUser + id)
            .then(res => {
                this.setState({
                    [field]: res.data,
                })
            })
    }

    fetchFunctionality(id, field) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetFunctionality + id)
            .then(res => {
                this.setState({
                    [field]: res.data,
                })
            })
    }

    onIdChange(ev) {
        let {value} = ev.target
        value = value ? value.replace(/#/g, "") : ''
        this.setState({
            externalId: value,
        }, () => {
            let {filters} = this.props
            if (value.length >= 1) {
                filters.externalId = value
                this.props.filterTests(filters)
                this.setState({
                    filtering: true,
                })
            }
            if (value.length === 0) {
                filters.externalId = ''
                this.props.filterTests(filters)
            }
		})
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
    if (type !== 'component3') {
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

    onFunctionalityChange(name, functionalityEntity) {
        let {filters} = this.props
        filters[name] = functionalityEntity.id !== -1 ? functionalityEntity.id : null

        this.setState({
            [name]: functionalityEntity,
            filtering: true,
        })
        this.props.filterTests(filters)
    }

  onNeedsUpdateChange(event) {
    let {filters} = this.props
    let {value} = event.target
    filters['needsUpdate'] = value === 'SELECT' ? null : value
    this.setState({
      filters,
      filtering: true,
    })
    this.props.filterTests(filters)
  }

  updateTestList = name => event => {
    let {filters} = this.props
    let {value} = event.target
    filters[name] = value && value !== 'SELECT' && value !== -1 && value !== -2 || value === 0 ? value : null
    if (value.length || !value || !isNaN(value)) {
      this.setState({
        filtering: true
      })
      this.props.filterTests({...filters})
    }
  }

  showInputBorder(id) {
    let element = document.getElementById(id)
    element.parentElement.style.border = '1px solid #ccc'
  }

  hideInputBorder(id) {
    let element = document.getElementById(id)
    element.parentElement.style.border = '1px solid #f6f6f6'
  }

  resetFilters() {
  	let filters = JSON.parse(JSON.stringify(this.props.filters)),
			defaultFilters = {
                owner: null,
                testPlan: null,
                excludeTestPlan: null,
                techniques: null,
                needsUpdate: null,
                requirement: null,
                suite: null,
                component1: null,
                component2: null,
                component3: null,
                functionalityEntity: null,
                priority: null,
                automationStatus: null,
                lastUpdater: null,
                externalId: '',
            };

    this.setState({
        owner: null,
        lastUpdater: null,
        filtering: false,
        externalId: '',
        functionalityEntity: null,
    })
    this.props.filterTests(_.extend(filters, defaultFilters))
  }

  render() {
      let {showMore, owner, lastUpdater, externalId, filtering, functionalityEntity} = this.state
      let {
          filters,
          classes,
          testPlanList,
          loading,
          defaultItemsComponent1,
          defaultItemsComponent2,
          defaultItemsComponent3
      } = this.props
      let inputStyle = {
          fontSize: '.875rem',
          width: '100%',
          border: '1px solid #ccc',
          paddingLeft: 5,
          color: COLORS.primary,
          borderRadius: 3,
      }

      let FILTERS = [
			{ id: 13, name: 'Id', component: <InputBase
				id="idFilterInput"
				placeholder="Id"
				className="manualTestFilterStyle"
				value={externalId}
				onChange={this.onIdChange.bind(this)}
			/> },
			{ id: 1, name: 'Test Plan', component: <TextField
					id="testPlanFilterInput"
					select
					value={filters.testPlan ? filters.testPlan : -2}
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
					onChange={this.updateTestList("testPlan")}>
					{testPlanList.map(p => (
						p.id !== -1 &&
						<MenuItem className="globalMenuItem" key={p.id} value={p.id}>
							{p.name === 'Select ...' ? 'All' : p.name}
						</MenuItem>
					))}
				</TextField> },
			{ id: 111, name: 'Exclude tests in', component: <TextField
					id="testPlanFilterInput"
					select
					value={filters.excludeTestPlan ? filters.excludeTestPlan : -2}
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
					onChange={this.updateTestList("excludeTestPlan")}>
					{testPlanList.map(p => (
						p.id !== -1 &&
						<MenuItem className="globalMenuItem" key={p.id} value={p.id}>
							{p.name === 'Select ...' ? 'All' : p.name}
						</MenuItem>
                    ))}
                </TextField>
            },
          {
              id: 51, name: 'Component 1', component: <ComponentsPickerSingle
                  id='component1'
                  className='componentsFilterInput'
                  defaultItems={defaultItemsComponent1}
                  searchAutomated={false}
                  onChange={this.onComponentChange.bind(this, 'component1')}
                  onDelete={this.onComponentDelete.bind(this, ['component1', 'component2', 'component3'])}
                  selectedItem={filters.component1}/>
          },
          {
              id: 52,
              name: 'Component 2',
              hide: !!loading || !filters.component1 || !defaultItemsComponent2,
              component: <ComponentsPickerSingle
                  id='component2'
                  className='componentsFilterInput'
                  searchAutomated={false}
                  defaultItems={defaultItemsComponent2}
                  excludeFromSearch={[filters.component1]}
                  onChange={this.onComponentChange.bind(this, 'component2')}
                  onDelete={this.onComponentDelete.bind(this, ['component2', 'component3'])}
                  selectedItem={filters.component2}/>
          },
          {
              id: 53,
              name: 'Component 3',
              hide: !!loading || !filters.component2 || !defaultItemsComponent3,
              component: <ComponentsPickerSingle
                  id='component3'
                  className='componentsFilterInput'
                  searchAutomated={false}
                  defaultItems={defaultItemsComponent3}
                  onChange={this.onComponentChange.bind(this, 'component3')}
                  onDelete={this.onComponentDelete.bind(this, ['component3'])}
                  selectedItem={filters.component3}/>
          },
          {
              id: 7, name: 'Functionality', component: <FunctionalityPicker
                  id="functionalityFilterInput"
                  className="manualFilter-functionality"
                  backgroundColor="white"
                  marginRight={-7}
                  selectedItem={functionalityEntity}
                  placeholder='All'
                  isFilter={true}
                  inContainer={false}
                  onChange={this.onFunctionalityChange.bind(this, "functionalityEntity")}/>
          },
          {
              id: 4, name: 'Owner / Updater', component: <UserPicker
                  onChange={this.onUserChange.bind(this, "lastUpdater")}
                  selectedItem={lastUpdater}
                  showAll={true}
                  buildTriage={0}
                  backgroundColor="white"
                  className="manualFilter-user"
                  marginRight={-7}
                  placeholder='All'/>
          },
          {
              id: 3, name: 'Priority', component: <TextField
                  id="priorityFilterInput"
                  select
                  value={filters.priority || filters.priority === 0 ? filters.priority : -1}
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
					onChange={this.updateTestList("priority")}>
					{MANUAL_PRIORITY_LIST.map(p => (
						<MenuItem className="globalMenuItem" key={p.id} value={p.id}>
							{p.value === 'SELECT' ? 'All' : p.label}
						</MenuItem>
					))}
				</TextField> },
          { id: 2, name: 'Last Execution', component: <TextField
                                            id="lastExecutionFilterInput"
                                            select
                                            value={filters.lastExecution ? filters.lastExecution : 'SELECT'}
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
                                            onChange={this.updateTestList("lastExecution")}>
                                            {MANUAL_LAST_EXECUTION_LIST.map(p => (
                                                <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                                                  {p.value === 'SELECT' ? 'All' : p.label}
                                                </MenuItem>
                                            ))}
                                            </TextField> },
        { id: 8, name: 'Suite Type', component: <TextField
                                                    id="testPlanFilterInput"
                                                    select
                                                    value={filters.suite ? filters.suite : 'SELECT'}
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
                                                    onChange={this.updateTestList("suite")}>
                                                    {SUITE_TYPE_LIST.map(p => (
                                                        <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                                                          {p.value === 'SELECT' ? 'All' : p.label}
                                                        </MenuItem>
                                                    ))}
                                                    </TextField> },
      { id: 9, name: 'Techniques', component: <TextField
                                                  id="techniquesFilterInput"
                                                  select
                                                  value={filters.techniques ? filters.techniques : -1}
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
                                                  onChange={this.updateTestList("techniques")}>
                                                  {[{ id: -1, value: "SELECT", label: "Select ..." }].concat(TECHNIQUE_LIST).map(p => (
                                                      <MenuItem className="globalMenuItem" key={p.id} value={p.id}>
                                                        {p.value === 'SELECT' ? 'All' : p.label}
                                                      </MenuItem>
                                                  ))}
                                                  </TextField> },
      { id: 10, name: 'Autom. Status', component: <TextField
                                                      id="automationStatusFilterInput"
                                                      select
                                                      value={filters.automationStatus || filters.automationStatus === 0 ? filters.automationStatus : -1}
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
                                                      onChange={this.updateTestList("automationStatus")}>
                                                      {AUTOMATION_LIST.map(p => (
                                                          <MenuItem className="globalMenuItem" key={p.id} value={p.id}>
                                                            {p.value === 'SELECT' ? 'All' : p.label}
                                                          </MenuItem>
                                                      ))}
                                                      </TextField> },
          { id: 11, name: 'Need Updates', component: <TextField
                                                          id="needsUpdateFilterInput"
                                                          select
                                                          value={filters.needsUpdate === null ? 'SELECT' : filters.needsUpdate}
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
                                                          onChange={this.onNeedsUpdateChange.bind(this)}>
                                                          {NEEDS_UPDATE_LIST.map(p => (
                                                              <MenuItem className="globalMenuItem" key={p.id} value={p.value}>
                                                                {p.value === 'SELECT' ? 'All' : p.label}
                                                              </MenuItem>
                                                          ))}
                                                          </TextField> },
    ]

    return (
      <div>
        <div>
          <div className="manualTestListFiltersContainer" style={{ marginTop: 15, marginRight: 20 }}>
            <div className="manualTestListFilters">
            <div
              style={{ fontSize: '.875rem', color: COLORS.grey, marginTop: 10, marginRight: 10, display: "flex", justifyContent: "flex-end" }}>
                <span style={{
                  cursor: filtering ? 'pointer' : 'default',
                  color: filtering ? COLORS.primary : '#ddd',
                  marginLeft: 20 }}
                  onClick={filtering ? this.resetFilters.bind(this) : null}>Clear filters</span>
              </div>
              {
                FILTERS.map((filter, index) => {
                  return !filter.hide && (
                    <div key={index} style={{ marginBottom: 10, padding: "0 15px 5px 15px", borderBottom: "1px solid #f1f1f1" }}>
                      <div style={{ fontSize: '.75rem' }}>{filter.name}</div>
                      <div>{filter.component}</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ManualTestFilters)
