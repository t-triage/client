import React, {Component, Fragment} from 'react';

import {withStyles} from '@material-ui/core/styles';
import {
    Popover,
    Button,
    MenuItem,
    Divider,
} from '@material-ui/core';
import {styles} from "./Globals";
import FlipToFrontIcon from "@material-ui/icons/Launch";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Tooltip from "@material-ui/core/Tooltip";

class ImportFilesPopover extends Component{

    state = {
        isPopoverOpen: false,
        popoverElement: null,
        isUploadLogsOpen: false,
        isUploadTestsOpen: false
    }


    render(){

        const {
            handleLogsModalOpen,
            handleTestsModalOpen,
            handlePopoverOpen,
            isPopoverOpen,
            popoverElement,
            handlePopoverClose} = this.props

        return (

            <div>
                <Tooltip title="Import Files" >
                    <Button
                        onClick={(event) => handlePopoverOpen(event.currentTarget)}
                        variant="contained"
                        color={'primary'}
                        component="span"
                        style={{marginTop: 0, marginRight: 0, padding: "7.5px 0px", borderRadius: 3, minWidth: 45}}>
                        <CloudUploadIcon/>
                    </Button>
                </Tooltip>
                <Popover
                    open={isPopoverOpen}
                    anchorEl={popoverElement}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <h6 style={{ fontSize: '13px', padding: '15px', color: 'var(--grey)', marginLeft:'30px'}} >UPLOAD FILES</h6>
                    <Divider />
                    <MenuItem onClick={handleTestsModalOpen} >
                        <div className="suiteListMenu">IMPORT AUTOMATED TESTS</div>
                        <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogsModalOpen}>
                        <div className="suiteListMenu">IMPORT ERROR LOGS</div>
                        <FlipToFrontIcon className="kanbanActionButtonIcon" color="action" />
                    </MenuItem>

                </Popover>
            </div>
        )

    }

}

export default withStyles(styles)(ImportFilesPopover);