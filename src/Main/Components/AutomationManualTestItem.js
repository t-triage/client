import React, { Component } from 'react'
import { Link } from 'react-router-dom'
//UI Components
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"

// Icons
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"

import { capitalize, prettify } from './TriageUtils'
import { COLORS } from './Globals'
import UserPicker from "./UserPicker";
import Api from "./Api";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import * as PropTypes from "prop-types";
import {Icon} from "@iconify/react";

import roundCheckCircle from "@iconify/icons-ic/round-check-circle";
import report from "@iconify/icons-ic/report";
import Tooltip from "@mui/material/Tooltip";



function Alert(props) {
    return null;
}

Alert.propTypes = {
    severity: PropTypes.string,
    children: PropTypes.node
};
export default class AutomationManualTestItem extends Component {

  state = {
    test: null,
    comment: '',
    commentUpdated: false,
    fieldListValueArray: [],
    successful_Notification: undefined,
    success : false,
    error : false
}

  componentDidMount() {
    this.setState({
      test: this.props.test,
    })
  }

  changeNote = ev => {
    let description = ev.target.value;
    let {comment} = this.state;
    comment = {...comment, description};
    this.setState({
      comment,
      commentUpdated: true
    })
  }

  updateComment() {
    if (this.state.commentUpdated) {
      let {test, comment} = this.state
      test.note = comment
      this.props.updateManualTestComment(test)
      this.setState({
        commentUpdated: false,
      })
    }
  }

//to deploy
  showManualTestInputs = (id) => {
    var fields = document.getElementsByClassName(`testFields-${id}`);
    for (var i = 0; i < fields.length; i++) {
      if (  fields[i].style.display == "block") {
        fields[i].style.display = "none";
      } else {
        fields[i].style.display = "block";
      }
    }
  }

  markManualTestAsDone = (id, ev) => {
    // TODO se deberia, aparte de verificar que esten bien los campos,
    // marcar el Automation status del test como DONE
    this.showManualTestInputs(id)     //to deploy
  }


//I call the endpoint
    makeManualToAutomatedRequest(manualTestId, automatedTestId) {
      this.setState({
          success: false,
          error: false
      })
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetLinkManualTestToAutomatedTest, { params: { manualTestId: manualTestId, automatedTestId: automatedTestId } })
            .then(res => {
                console.log("Good Linked");
                this.setState({
                    success: true,
                })
            }).catch(err =>{
                console.error(err.stack);
                console.error('unlinked link!');
                this.setState({
                    error: true,
                })
            })
    }



//state of the IdAutomated
    _handleIdAutomatedChange = (id, e) => {
        let arrayCopy = this.state.fieldListValueArray
        arrayCopy[id] = e.target.value;

        e.preventDefault();
        this.setState({
            fieldListValueArray: arrayCopy
        });

    }

    _handleAutomated_Id_TextFieldOnChange = (id) => {
        return (e) => { this._handleIdAutomatedChange(id, e) };
    }



  render() {
    let {manualTestsList} = this.props;
    let {test} = this.state

    return test && (
      <Grid item md={6} lg={4}>
        <Paper style={{padding: 15, borderRadius: 3}}>

          <div className="AutomationListTitle" style={{ marginTop: 0, alignItems: 'flex-start' }}>
            <div>
              <Link style={{textDecoration: 'none'}} target="_blank" to={test.id ? `/TestRepository?externalId=${test.id}&expandTest=true` : "/TestRepository"}>
                <h4 className="title">{test.name}</h4>
              </Link>
              <div className="text">Owned by {test.owner.displayName}{test.lastUpdater ? `, last update by ${test.lastUpdater.displayName}` : ''}</div>
            </div>
            <div>{/* IN CASE OF PIN ICON */}</div>
          </div>

          <div className="AutomationListTitle">
            <Grid container>
                <Grid item xs={8} style={{ overflowWrap: 'break-word' }}>
                    <h6 className="subTitle">SUITE</h6>
                    <h6 className="text">{capitalize(test.suite)}</h6>
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                    <h6 className="subTitle">ASSIGNEE</h6>
                    <h6 className="text">
                        <UserPicker
                            issue={test.id}
                            isManual={true}
                            manualTest={test}
                            selectedItem={test.automationAssignee ? test.automationAssignee : null}
                            buildTriage={0}
                            color={'currentColor'}
                            placeholder={''}
                            alignRight={true}/>
                    </h6>
                </Grid>
            </Grid>
          </div>

          <div className="AutomationListTitle">
            <Grid container>
                <Grid item xs={8} style={{ overflowWrap: 'break-word' }}>
                    <h6 className="subTitle">PRODUCT</h6>
                    <h6 className="text">{test.productName}</h6>
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                    <h6 className="subTitle">AUTOMATION</h6>
                    <h6 className="text">{prettify(capitalize(test.automationStatus))}</h6>
                </Grid>
            </Grid>
          </div>

          <div className="AutomationListTitle">
            <Grid container>
                <Grid item xs={8} style={{ overflowWrap: 'break-word' }}>
                    <h6 className="subTitle">COMPONENTS</h6>
                    <h6 className="text">{test.component1Name + (test.component1Name ? ', ' : ' ') + test.component2Name + (test.component1Name || test.component2Name ? ', ' : ' ') + test.component3Name}</h6>
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                    <h6 className="subTitle">FUNCTIONALITY</h6>
                    <h6 className="text">{!!test.functionalityEntity ? test.functionalityEntity.name : ""}</h6>
                </Grid>
            </Grid>
          </div>

          <div style={{ marginTop: 15 }}>
            <h6 className="subTitle">USER COMMENT</h6>
            <TextField
                style={{width: "100%", marginTop: 10}}
                multiline
                defaultValue={!!test.note ? test.note.description : ""}
                placeholder="No comments yet"
                maxRows={3}
                disabled={false}
                onChange={this.changeNote.bind(this)}
                inputProps={{
                  onBlur: this.props.showButtons.bind(this, test.id),
                  onFocus: this.props.showButtons.bind(this, test.id)
                }}
                spellCheck={false}
                InputProps={{
                  className: "textArea area"+test.id
                }}
            />
          </div>

          <div className="AutomationListTitle">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <strong
                  onClick={this.showManualTestInputs.bind(this, test.id)}
                  className="tag tagClickable"
                  style={{ color: 'white', cursor: 'pointer', backgroundColor: COLORS.blue}}>
                LINK AUTOMATION
              </strong>
            </div>
            <div>
              <Button
                  className={`button${test.id} globalButton`}
                  color="secondary"
                  variant="contained"
                  style={{ visibility: "hidden", marginRight: 10 }}
                  onMouseDown={this.props.clearText.bind(this, "area"+test.id, "issue.note", "issue.testTriage.note")}
                  id="cancel">
                  Cancel
              </Button>
              <Button
                  className={`button${test.id} globalButton`}
                  color="primary"
                  variant="contained"
                  style={{ visibility: "hidden" }}
                  onMouseDown={this.updateComment.bind(this)}
                  id="save">
                  Save
              </Button>
            </div>
          </div>


            <div className={`AutomationListManualFields testFields-${test.id}`} style={{ marginTop: 15, marginBottom: 15 }}>
                <h6 className="subTitle">AUTOMATED TEST ID</h6>
                <TextField
                    id={`idField-${test.id}`}
                    style={{width: "100%", marginTop: 10}}
                    placeholder="Automated Test Id"
                    spellCheck={false}
                    InputProps={{
                            className: "textField"
                        }}
                    value={this.state.fieldListValueArray[test.id]} onChange={this._handleAutomated_Id_TextFieldOnChange(test.id)}
                    />
            </div>



          <div>
            <div className={`AutomationListManualFields testFields-${test.id}`}>
              <Button
                  className={`globalButton`}
                  color="secondary"
                  variant="contained"
                  style={{ marginRight: 10 }}
                  onClick={this.showManualTestInputs.bind(this, test.id)}
                  id="cancel">
                  Cancel
              </Button>
              <Button
                  className={`globalButton`}
                  color="primary"
                  variant="contained"
                  //onMouseDown={this.markManualTestAsDone.bind(this, test.id)}
                  //onClick={this.makeManualToAutomatedRequest.bind(this, test.id, this.state.fieldListValueArray[test.id])}
                  onClick={() => { this.makeManualToAutomatedRequest(test.id, this.state.fieldListValueArray[test.id]) }}
                  id="save">
                  Save
              </Button>
                <div style={{display: "flex", justifyContent: "flex-end"}}>
                {this.state.success === true ? <Icon icon={roundCheckCircle} width={40} height={40} /> : null}
                {this.state.error === true ?
                    <Tooltip title="linked error">
                       <Icon icon={report} width={40} height={40}/>
                    </Tooltip> : null}

                </div>
            </div>
          </div>
        </Paper>
      </Grid>
    );
  }




}
