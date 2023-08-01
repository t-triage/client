import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/RemoveCircle";
import ClearIcon from "@mui/icons-material/Clear";
import TestEditForm from "./TestEditForm";
import React from "react";





//minicomponentTest
export const TestListItem = (props) => {


//funcion selection Test
    const handleCheckbox = (id, selectedTests) =>  {
        if (selectedTests.indexOf(id) !== -1) {
            selectedTests.splice(selectedTests.indexOf(id), 1)
        } else {
            selectedTests.push(id)
        }
        props.that.setState({
            selectedTests,
            select: selectedTests.length !== props.testList.length,
        })
    }
    
    const handleExpantion = (id, fetchData=false, expandedTests) => {
        let index = expandedTests.indexOf(id)
        if (index !== -1) {
            expandedTests.splice(index, 1)
            if (fetchData) {
                props.that.setState({
                    isLoading: true
                }, () => this.fetchFilteredManualTests(props.filters))
            }
        }
        else {
            expandedTests.push(id)
        }
        props.that.setState({
            expandedTests,
        })
    }









    return (
        <div key={props.index} className="manualTestListItem">
            <div className="manualTestListSummary">

                <Checkbox
                    id="testCheckbox"
                    checked={props.selectedTests.indexOf(props.test.id) !== -1}
                    onClick={() => handleCheckbox(props.test.id, props.selectedTests)}
                    color='default' />
                <div className="manualTestListText" onClick={() => handleExpantion(props.test.id, false, props.expandedTests)}>
                    <div style={{ alignSelf: 'center', display: "flex", flexDirection: "column", padding: '7px 0', flex: 1 }}>
                        <span style={{ fontWeight: 'bold', fontSize: "1.2em" }}>{props.test.name}</span>
                        <div style={{display: "flex"}}>

                            {
                                props.expandedTests.indexOf(props.test.id) !== -1 && (
                                    <div style={{ color: 'rgba(0, 0, 0, 0.54)' }}>#{props.test.id}</div>
                                )
                            }
                            {
                                props.expandedTests.indexOf(props.test.id) !== -1 && props.test.externalId && (
                                    <div style={{color: 'rgba(0, 0, 0, 0.54)', paddingLeft: 10}}>#{test.externalId}</div>
                                )
                            }

                            <div style={{paddingLeft: 15, maxWidth: 700}}>
                                {
                                    props.expandedTests.indexOf(props.test.id) === -1 && (
                                        <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                {
                                    props.that.getTestMainStep(props.test)
                                }
                              </span>
                                    )
                                }

                            </div>

                            <div style={{flex: "1", display: "flex", paddingRight: 15, justifyContent: "flex-end"}}>
                                {
                                    !props.test.lastExecutionDate ? "Not Executed" :  props.expandedTests.indexOf(props.test.id) === -1  ? "" :
                                        <div style={{paddingLeft: '15px', wordBreak: 'break-word'}}>
                                            Last Run:
                                            {" "} {
                                            props.test.lastExecutionStatus && (
                                                <span>{props.planStatus ? props.planStatus.label : props.test.lastExecutionStatus}</span>
                                            )
                                        }
                                            {" on " + new Date(props.test.lastExecutionDate).toLocaleDateString("en-US", {
                                                month: 'long',
                                                day: 'numeric',
                                            })+" by "}
                                            {props.test.lastExecutionAssignee}
                                            {" for "}<span>{props.test.lastExecutionPlan}</span>

                                        </div>
                                }
                            </div>

                        </div>
                    </div>

                </div>


                <div style={{width: 48}}>
                    {
                        props.filters.testPlan !== null && (
                            <Tooltip
                                classes={{
                                    tooltip: props.classes.tooltip,
                                    popper: props.classes.popper,
                                }} title="Remove from plan"
                                style={{display: "flex"}}>
                                <IconButton
                                    onClick={props.that.deleteExecution.bind(props.that, props.test.id, props.filters.testPlan)}
                                    size="large">
                                    <RemoveIcon style={{color: "red"}} />
                                </IconButton>
                            </Tooltip>
                        )
                    }


                </div>

                <div style={{width: 48}}>
                    <Tooltip
                        classes={{
                            tooltip: props.classes.tooltip,
                            popper: props.classes.popper,
                        }} title="Cancel"
                        style={{display: props.expandedTests.indexOf(props.test.id) === -1 ? 'none' : "flex"}}>
                        <IconButton
                            onClick={() => handleExpantion(props.test.id, false, props.that.state.expandedTests)}
                            size="large">
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            {
                props.expandedTests.indexOf(props.test.id) !== -1 && (
                    <div className="manualTestListCollapse" style={{display: "flex", justifyContent: "center"}}>
                        <TestEditForm
                            test={props.test}
                            currentUser={props.that.state.currentUser}
                            onClose={() => handleExpantion(props.test.id, false, props.that.state.expandedTests)} />
                    </div>
                )
            }
        </div>
    );
}
