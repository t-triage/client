import react from "react"
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import {show} from "./TestRepository";
import InputBase from "@material-ui/core/InputBase";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import StarsIcon from "@material-ui/icons/Star";
import {COLORS} from "../Components/Globals";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import ListItem from "@material-ui/core/ListItem";
import React from "react";


export const TestEditFormStep = (props) => {
        let step = props.step;
        let index = props.step;
        return (
            <ListItem
                key={index}
                onMouseLeave={props.this.onListBlur.bind(props.this, step.id, index)}
                onMouseOver={props.this.onListOver.bind(props.this, step.id, index)}
                style={{ padding: '5px 0' }}
                className="manualTestStepListItem">

                <ListItemText
                    style={{ padding: 0 }}
                    primary={
                        <Grid className="manualTestStepListItemText" container spacing={16}>
                            {show.stepsHeader && (
                                <Grid item xs={4}>
                                    <InputBase
                                        id={`stepName-${index}`}
                                        placeholder="Step description"
                                        style={{ fontSize: '.875rem' }}
                                        value={step.step}
                                        onChange={props.this.updateStep('step', index)}
                                        inputProps={{
                                            className: "textArea"
                                        }}
                                        inputProps={{
                                            style: {
                                                minHeight: '18px'
                                            }
                                        }}
                                        margin="dense"
                                        fullWidth
                                        multiline
                                    />
                                </Grid>
                            )}
                            {show.stepsData && (
                                <Grid item xs={3}>
                                    <InputBase
                                        id={`steData-${index}`}
                                        placeholder="Data"
                                        style={{ fontSize: '.875rem' }}
                                        value={step.data}
                                        onChange={props.this.updateStep('data', index)}
                                        inputProps={{
                                            className: "textArea"
                                        }}
                                        inputProps={{
                                            style: {
                                                minHeight: '18px'
                                            }
                                        }}
                                        rowsMax={15}
                                        fullWidth
                                        multiline
                                    />
                                </Grid>
                            )}
                            <Grid item xs={5} style={{ display: 'flex', alignItems: 'center' }}>
                                {show.stepsExpected && (
                                    <InputBase
                                        id={`stepExpected-${index}`}
                                        placeholder="Expected behavior"
                                        style={{ fontSize: '.875rem' }}
                                        value={step.expectedResult}
                                        onChange={props.this.updateStep('expectedResult', index)}
                                        inputProps={{
                                            className: "textArea"
                                        }}
                                        inputProps={{
                                            onFocus: null,
                                            style: {
                                                minHeight: '18px'
                                            }
                                        }}
                                        rowsMax={15}
                                        fullWidth
                                        multiline
                                    />
                                )}
                                <div
                                    id={`mainStep-${step.id}-${index}`}
                                    style={{
                                        visibility: step.main ? 'visible' : 'hidden'
                                    }}>
                                    <Tooltip title={'Main Step'}>
                                        <IconButton
                                            style={{ padding: '0px 6px' }}
                                            onClick={props.this.markMainStep.bind(props.this, index)}
                                            aria-label="Move down">
                                            <StarsIcon style={{ color: COLORS.yellow }} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip title={'Move up'}>
                                        <IconButton
                                            style={{ padding: '0px 6px' }}
                                            onClick={props.this.moveStepUp.bind(props.this, index)}
                                            aria-label="Move up">
                                            <ExpandLessIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={'Move down'}>
                                        <IconButton
                                            style={{ padding: '0px 6px' }}
                                            onClick={props.this.moveStepDown.bind(props.this, index)}
                                            aria-label="Move down">
                                            <ExpandMoreIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                                <Tooltip title={'Remove Step'}>
                                    <IconButton
                                        onClick={props.this.removeStep.bind(props.this, index)}
                                        style={{ padding: '0px 6px' }}
                                        aria-label="Remove Step">
                                        <RemoveCircleIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    } />
            </ListItem>
        )
}