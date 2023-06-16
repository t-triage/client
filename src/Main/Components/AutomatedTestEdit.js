import React, { Component } from "react";
import Api from "./Api";
import axios from "axios";
import * as _  from "underscore";
import FormLabel from '@mui/material/FormLabel';
import InputBase from "@mui/material/InputBase";
import TextField from "@mui/material/TextField";
import UserPicker from "./UserPicker";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import FlipToFrontIcon from "@mui/icons-material/Launch"
import {
  getStatusTagColor,
  getStatusTagName,

} from '../Components/TriageUtils'
import ComponentsPicker from "./ComponentsPicker";

import {
  styles,
  COLORS,
} from "./Globals";

import withStyles from '@mui/styles/withStyles';

const EMPTY_TEST = {
  id: null,
  name: "",
  updated: null,
  testTriageDTOList: [],
  automatedComponentDTOList: [],

  lastUpdater: null,

 
};

class AutomatedTestEdit extends Component {
 
  state = {
    testEdit: Object.assign({}, EMPTY_TEST),
    testTriageDTOList: Object.assign({}),
    

  };

  componentDidMount() {
    let { test, updateSnackBarAutomatedTestInfo, originalTestIndex } = this.props;
    
    
    if (test) {
      let name = test.name;

      this.setState({
        testEdit: Object.assign([], test),
        testTriageDTOList: Object.assign([{}], test.testTriageDTOList),

      })

    }
  }

  onChange= (suite,index,user) => {
   suite = {...suite, triager: user};
    axios({
      method: "PUT",
      url: `${Api.getBaseUrl()}${Api.ENDPOINTS.UpdateTest}`,
      data: JSON.stringify(suite),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    this.setState({
      testEdit: {...(this.state.testTriageDTOList[index].triager = user)}
    })
    this.props.updateSnackBarAutomatedTestInfo(this.props.originalTestIndex,this.state.testEdit)
  }

  onClose(id, fetchData = false) {
    this.setState({
      testEdit: null,
    });
    this.props.onClose(id, fetchData);
  }

  select = (name) => (event) => {
    let { testEdit } = this.state,
      { value } = event.target;
      testEdit[name] = value;

    this.setState(
      {
        testEdit,
      },
      () => {
        if (name === "name") {
          if (value === "") {
            document.getElementById(
              `testName-${testEdit.id ? testEdit.id : "new"}-error`
            ).style.display = "block";
          } else {
            document.getElementById(
              `testName-${testEdit.id ? testEdit.id : "new"}-error`
            ).style.display = "none";
          }
        }
      }
    );
  };

    onComponentsChange(item) {
        let {testEdit} = this.state;
        let itemIndex = _.findIndex(testEdit.automatedComponentDTOList, {id: item.id});

        if (itemIndex === -1) {
            if (testEdit.automatedComponentDTOList.length < 6) {
                testEdit.automatedComponentDTOList.push(item);
                this.addAutomatedComponentTestRelation(item.id, testEdit.id);
            } else {
                document.getElementById(
                    `testComponents-${testEdit.id ? testEdit.id : "new"}-error`
                ).style.display = "block";
            }
        } else {
            testEdit.automatedComponentDTOList.splice(itemIndex, 1);
            this.deleteAutomatedComponentTestRelation(item.id, testEdit.id);
            document.getElementById(
                `testComponents-${testEdit.id ? testEdit.id : "new"}-error`
            ).style.display = "none";
        }
        this.setState({
            ...testEdit,
        });
    }

    addAutomatedComponentTestRelation(automatedComponentId, testCaseId) {
        let list = [];
        list.push(testCaseId)

        axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.SetAutomatedComponentToTests + '?productComponentId=' + automatedComponentId,
            data: JSON.stringify(list),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    deleteAutomatedComponentTestRelation(automatedComponentId, testCaseId) {

        axios.delete(Api.getBaseUrl() + Api.ENDPOINTS.DeleteAutomatedComponentFromTest + `?automatedComponentId=${automatedComponentId}&testCaseId=${testCaseId}`)
            .catch(res => {
                console.log(res)
            })
    }

  validateTestFields() {

    let { testEdit } = this.state;
    let {name} = testEdit;
    let emptyName = name === "";
    if (emptyName) {
      document.getElementById(
          `testName-${testEdit.id ? testEdit.id : "new"}-error`
      ).style.display = "block";
    }
    return !emptyName;
  }

  renderSuites() {
    let {testTriageDTOList} = this.state;
    if (testTriageDTOList[0].id === undefined) {
      return (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <h2 className="noRowsSuites">

              No suites found
            </h2>
          </div>)
    } else {
    return _.sortBy(testTriageDTOList, "id").map((suite, index) => {
      return (
        <ListItem
          component="div" 
          key={index}
          style={{ padding: "5px 0" }}
          className="manualTestStepListItem"
        >
          <ListItemText
            style={{ padding: 0 }}
            primary={
              <Grid
                className="manualTestStepListItemText"
                container  
                justifyContent="center"
                alignItems="center"
                spacing={16}
              >
                <Grid item xs={4}>
                  <InputBase
                    id="executorName"
                    placeholder="Suite Name"
                    style={{ fontSize: ".875rem" }}
                    value={suite.executorName}
                    fullWidth
                    
                  />
                </Grid>

                <Grid item xs={3}>
                    <UserPicker
                              onChange={this.onChange.bind(this,suite,index)}
                              buildTriage={0}
                              selectedItem={suite ? suite.triager : null}
                            />
                </Grid>

                <Grid item xs={3}>
                  <InputBase
                    id="suiteExecution"
                    placeholder="Execution"
                    style={{ fontSize: ".875rem" }}
                    value={new Date(suite.executionDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    disabled
                    fullWidth
                    
                  />
                </Grid>
                
                <Grid item xs={2} className='statusTag' style={{
                                        backgroundColor: getStatusTagColor(suite.currentState),
                                    }}>{getStatusTagName(suite.currentState)}
                                      
                                        
                </Grid>

                <Grid item xs={10}>
                <FormLabel component="label" >{suite.deducedReason}</FormLabel>
                </Grid>
                <Grid item xs={2}>
                <MenuItem onClick={()=> window.open("/Test/"+suite.id+"/Triage", "_blank")}>
                         <div className="suiteListMenu">View Test</div>
                         <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                     </MenuItem>
                </Grid>
                
              </Grid>
            }
          />
        </ListItem>
      );
    });}
  }

  render() {
    let { fullWidth, classes, test } = this.props;
    let { testEdit, testTriageDTOList } = this.state;

    return testEdit && (
        <form className="manualTestEditForm"
              style={{width: fullWidth ? "100%" : "80%"}}
        >
              <div style={{color: COLORS.grey}}> #{testEdit.id} </div>
          <Grid container spacing={16} style={{marginTop: 0}}>
            {testEdit.locationPath && (
                <Grid item xs={12} sm={12}>
                  <TextField
                      id={`testName-${testEdit.id ? testEdit.id : "new"}`}
                      label="Location Path"
                      placeholder=""
                      variant="standard"
                      value={testEdit.locationPath ? testEdit.locationPath : ""}
                      fullWidth
                      className="manualTestEditTestName"
                      spellCheck={false}
                  />
                  <small
                      id={`testName-${testEdit.id ? testEdit.id : "new"}-error`}
                      style={{color: COLORS.red, display: "none"}}
                  >
                    Field cannot be empty
                  </small>
                </Grid>
            )
            }
            <Grid item xs={12} sm={12}>
              <ComponentsPicker
                  id={`testComponents-${testEdit.id ? testEdit.id : 'new'}`}
                  automatedComponents={true}
                  onChange={this.onComponentsChange.bind(this)}
                  selectedItems={testEdit.automatedComponentDTOList}/>
              <small id={`testComponents-${testEdit.id ? testEdit.id : 'new'}-error`}
                     style={{color: COLORS.red, display: 'none'}}>Max. of 6 components reached</small>
            </Grid>

            <Grid
                item
                xs={12}
                style={{
                  marginTop: 20,
                  color: "rgba(0, 0, 0, 0.54)",
                  fontSize: "0.75rem",
                }}
          >
            <Grid container spacing={16}   
                    justifyContent="space-evenly"
                    alignItems="center">
                    <Grid item xs={4}>
                      <b>SUITE NAME</b>
                    </Grid>
            
                    <Grid item xs={3}>
                      <b>ASSIGNEE</b>
                    </Grid>
    
                    <Grid item xs={3}>
                      <b>LAST EXECUTION</b>
                    </Grid>
                    <Grid item xs={2}>
                      <b>STATUS</b>
                    </Grid>
                  </Grid>
    
                  {
                    testTriageDTOList && testTriageDTOList.length > 0 && testTriageDTOList[0] !== undefined && (
                    <List>
                      {this.renderSuites()}
                      </List>
                  )
                }
                
               
          </Grid>
        </Grid>

      </form>
    );
  }
}

export default withStyles(styles)(AutomatedTestEdit);
