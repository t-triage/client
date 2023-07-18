import React, {Component} from "react";
import Api from "./Api"
import axios from 'axios';

import {styles} from "./Globals";
import withStyles from '@mui/styles/withStyles';

// UI Components
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Popover from "@mui/material/Popover";
import {Divider, MenuItem} from "@mui/material";
import FlipToFrontIcon from "@mui/icons-material/Launch"


class SuiteOptionListPopover extends Component{

    state = {
        suite: null,
        executorID: null,
        userRole: null,
        suiteListOptionsOpen: false,
    }

    componentDidMount() {
        this.setState({
            suite: this.props.suite,
            executorID: this.props.executorId
            }
        )
    }

    componentWillMount() {
        this.fetchUserRole()
    }
  
    fetchUserRole() {
        this.setState({
          userRole: JSON.parse(sessionStorage.getItem("currentUser")).roleType,
        })
    }

    onMenuItemClick(actionDialogType, suite, dialogResponseData=null) {
        this.props.onClick(actionDialogType, suite, dialogResponseData)
    }
    
    userIsAdmin() {
        return this.state.userRole && this.state.userRole === 'ROLE_ADMIN';
    }

    render(){
        const { suite, executorId, classes } = this.props;

        
        return (
            <div>
                <Tooltip title="More options"
                         classes={{
                             tooltip: classes.tooltip,
                             popper: classes.popper,
                         }}>
                    <div>
                        <IconButton
                            id={"suiteListMenu-" + executorId}
                            onClick={() => this.setState({ suiteListOptionsOpen: executorId})}
                            size="large">
                            <MoreHorizIcon color='action'/>
                        </IconButton>
                    </div>
                </Tooltip>
                <Popover
                    open={this.state.suiteListOptionsOpen === executorId}
                    anchorEl={document.getElementById("suiteListMenu-" + executorId)}
                    onClose={() => this.setState({ suiteListOptionsOpen: false })}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {/************************************ CONTENIDO DEL POPOVER **+++********************************/}
                     <div>
                     {/* Aplicar estilos usando clases en vez de usar inline style */}
                     <h6 style={{ fontSize: '13px', padding: '15px', color: 'var(--grey)'}} >Suite list options</h6>
                     </div>
                     <Divider />
                     {/* Se esta preguntando 2 veces por this.userIsAdmin(), no se pueden fucionar las 2 en uno solo? */}
                    {
                        this.userIsAdmin() && (
                            <React.Fragment>
                                <MenuItem onClick={this.onMenuItemClick.bind(this, 'editSuite', suite)}>
                                    <div className="suiteListMenu">EDIT</div>
                                    <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                                </MenuItem>
                                <Divider />
                            </React.Fragment>
                        )
                    }
                    {
                        this.userIsAdmin() && (
                            <React.Fragment>
                                <MenuItem onClick={this.onMenuItemClick.bind(this, 'setGoals', suite)}>
                                    <div className="suiteListMenu">SET GOALS</div>
                                    <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                                </MenuItem>
                                <Divider />
                            </React.Fragment>
                        )
                    }
                     <MenuItem onClick={this.onMenuItemClick.bind(this, 'triageSuite', suite)}>
                         <div className="suiteListMenu">TRIAGE SUITE</div>
                         <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                     </MenuItem>
                     <Divider />
                     <MenuItem onClick={this.onMenuItemClick.bind(this, 'pullSuite', suite)}>
                         <div className="suiteListMenu">PULL</div>
                         <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                     </MenuItem>
                     <Divider />
                     <MenuItem onClick={this.onMenuItemClick.bind(this, 'invalidateSuite', suite)}>
                         <div className="suiteListMenu">SKIP RUN</div>
                         <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                     </MenuItem>
                     <Divider />

                    {
                        this.userIsAdmin() && (
                            <React.Fragment>
                                <MenuItem onClick={this.onMenuItemClick.bind(this, suite.enabled ? 'disableSuite' : 'enableSuite', suite)}>
                                    <div className="suiteListMenu">
                                    {
                                        suite.enabled ?
                                            'DISABLE SUITE'
                                            : 'ENABLE SUITE'
                                    }
                                    </div>
                                    <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                                </MenuItem>
                                <Divider />
                            </React.Fragment>
                        )
                    }

                     <MenuItem onClick={this.onMenuItemClick.bind(this, 'pushSuite', suite)}>
                         <div className="suiteListMenu">IMPORT</div>
                         <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                     </MenuItem>
                     <Divider />
                     {/********************************* FIN CONTENIDO DEL POPOVER ***********************************/}
                </Popover>
            </div>
        );
    }

}

export default withStyles(styles)(SuiteOptionListPopover);
