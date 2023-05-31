import React, {Component} from "react";

import {styles, WIKI_URL} from "./Globals";
import {withStyles} from "@material-ui/core/styles";

// UI Components
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import Popover from "@material-ui/core/Popover";
import {Divider, MenuItem} from "@material-ui/core";
import FlipToFrontIcon from "@material-ui/icons/Launch"
import AutomatedTestPipelineEdit from "./AutomatedTestPipelineEdit";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions"

import Button from "@material-ui/core/Button"
import axios from "axios";
import Api from "./Api";


class PipelineOptionListPopover extends Component{

    state = {
        pipeline: null,
        pipelineListOptionsOpen: false,
        showActionDialog: false,
        confirmationDialogOpen:false,
        openDialog: false,
        deletedPipeline:null,
        openSnackbar: false,
        snackbarMsg: '',
        variant: 'success',
    }

    componentDidMount() {
        this.setState({
            pipeline: this.props.pipeline,
            }
        )
    }

    onMenuItemClick(actionDialogType, pipeline) {
        if (actionDialogType == "editPipeline") {
            this.openPipelineActionDialog(pipeline);
        }
        if (actionDialogType == "deletePipeline") {
            this.openConfirmationDialog(pipeline)
        }
        if (actionDialogType == "integratePipeline") {
            this.openDialog(pipeline);
        }

        
    }
    showSnackbar(msg, variant = "success", goBack = true) {
        this.setState({openSnackbar: true, snackbarMsg: msg, variant, goBack});
    };

    hideSnackbar() {
        this.setState({
            openSnackbar: false, snackbarMsg: ''
        })
       
    };

    renderSnackbar() {
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={this.state.openSnackbar}
                autoHideDuration={2000}
                onClose={this.hideSnackbar.bind(this)}
            >
                <MySnackbarContentWrapper
                    onClose={this.hideSnackbar.bind(this)}
                    variant={this.state.variant}
                    message={this.state.snackbarMsg}
                />
            </Snackbar>
        )
    }

    openConfirmationDialog = (ev) => {
        this.setState({
            deletedPipeline: ev!==null && ev,
            confirmationDialogOpen: true,
          
        })
      }
      onConfirmationDialogClose() {
        this.setState({
          confirmationDialogOpen: false,
        })
      }

      deletePipeline() {
        let{deletedPipeline} = this.state
        if(deletedPipeline){
            axios({
                method: "PUT",
                url: Api.getBaseUrl() + Api.ENDPOINTS.UpdatePipeline,
                data: JSON.stringify({
                    ...deletedPipeline,
                    enabled: false,
                    updated: new Date().getTime(),

                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(res => {
                this.onConfirmationDialogClose()
                this.showSnackbar('Pipeline succesfully deleted', 'success')
                this.props.updatedPipeline(deletedPipeline)
            })
        }

      }
    renderConfirmationDialog() {
        let {confirmationDialogOpen} = this.state
        let props = {
          open: confirmationDialogOpen,
          onClose: this.onConfirmationDialogClose.bind(this),
          maxWidth: "md",
        }
    
        return confirmationDialogOpen && (
          <Dialog {...props}
              aria-labelledby="deletePipeline-dialog-title"
              aria-describedby="deletePipeline-dialog-description">
              <DialogTitle id="deletePipeline-dialog-title">
                  WARNING
              </DialogTitle>
              <DialogContent id="deletePipeline-dialog-description">
                  {`Are you sure you want to delete ${this.state.deletedPipeline.name} ?`}
              </DialogContent>
              <DialogActions style={{ padding: '16' }}>
                  <Button
                      onClick={this.onConfirmationDialogClose.bind(this)}
                      className="globalButton"
                      type="submit"
                      variant="contained"
                      color='secondary'>
                      {'No'}
                  </Button>
                  <Button
                      onClick={this.deletePipeline.bind(this)}
                      className="globalButton"
                      type="submit"
                      variant="contained"
                      color='primary'>
                      {'Yes'}
                  </Button>
              </DialogActions>
          </Dialog>
        )
      }

    openPipelineActionDialog(pipeline) {
        let {showActionDialog} = this.state;
        showActionDialog = true;
        this.setState({
            showActionDialog,
            pipeline: pipeline,
        })
    }

    closeActionDialog() {
        this.setState({
            showActionDialog: false,
        })
    }

    editPipelineDialogSave(id,pipeline) {
        this.setState({
            assignPipelineId: id
        }, () => {
            let pipelines = this.props.pipelines
            pipelines[this.props.index]=pipeline
            this.props.updatedPipeline(pipelines)
            this.closeActionDialog()
        })
    }

    renderActionDialog() {
        let {showActionDialog} = this.state
        let props = {
            open: showActionDialog,
            onClose: this.closeActionDialog.bind(this),
            maxWidth: "md",
            fullWidth: true,
        }
        return showActionDialog && (
            <Dialog {...props}
                    aria-labelledby="EditPipeline-dialog-title"
                    aria-describedby="EditPipeline-dialog-description">
                <DialogTitle id="EditPipeline-dialog-title">
                    Edit Pipeline
                </DialogTitle>
                <DialogContent id="EditPipeline-dialog-description">
                    <AutomatedTestPipelineEdit
                        pipeline={this.state.pipeline}
                        fullWidth
                        inDialog
                        onSave={this.editPipelineDialogSave.bind(this)}
                        onClose={this.closeActionDialog.bind(this)}/>
                </DialogContent>
            </Dialog>
        )
    }

    openDialog(pipeline) {
        let {openDialog} = this.state;
        openDialog = true;
        this.setState({
            openDialog,
            pipeline: pipeline,
        })
    }

    closeDialog() {
        this.setState({
            openDialog: false,
        })
    }

    renderDialog() {
        let {openDialog, pipeline} = this.state
        let props = {
            open: openDialog,
            onClose: this.closeDialog.bind(this),
            maxWidth: "md",
            fullWidth: true,
        }
        let urlAPI = Api.getBaseUrl() + "/v1/status/pipeline/";
        if (pipeline != null) {
            urlAPI += pipeline.id;
        }

        return openDialog && (
            <Dialog {...props}
                    aria-labelledby="EditPipeline-dialog-title"
                    aria-describedby="EditPipeline-dialog-description">
                <DialogContent id="EditPipeline-dialog-description">
                    <div style={{display:"grid", justifyItems:"center"}}>
                        <strong style={{marginBottom: 10}}>To integrate external tools with t-Triage pipeline checkpoints:</strong>

                        <div style={{marginBottom: 10}}>
                            <label>curl -X GET -H 'Authorization: ....'</label>
                            <a href={urlAPI} target="_blank"> {urlAPI} </a>
                        </div>

                        <div style={{marginBottom: 10}}>
                            <label>See more at: wiki link (
                                <a href={WIKI_URL + "docs/DOC-7272"} target="_blank"> {WIKI_URL + "docs/DOC-7272"} </a>
                                )</label>

                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }


    render(){
        const { pipeline, classes } = this.props;
        return(
            <div>
                {this.renderActionDialog()}
                {this.renderDialog()}
                <Tooltip title="More options"
                         classes={{
                             tooltip: classes.tooltip,
                             popper: classes.popper,
                         }}>
                    <div>
                        <IconButton
                            id={"pipelineListMenu-"+pipeline.id}
                            onClick={() => this.setState({ pipelineListOptionsOpen: true})}>
                            <MoreHorizIcon color='action'/>
                        </IconButton>
                    </div>
                </Tooltip>
                <Popover
                    open={this.state.pipelineListOptionsOpen}
                    anchorEl={document.getElementById("pipelineListMenu-"+pipeline.id)}
                    onClose={() => this.setState({ pipelineListOptionsOpen: false })}
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
                     <h6 style={{ fontSize: '13px', padding: '15px', color: 'var(--grey)'}} >Pipeline options</h6>
                     </div>
                     <Divider />
                     <MenuItem onClick={this.onMenuItemClick.bind(this, 'editPipeline', pipeline)}>
                         <div className="suiteListMenu">EDIT</div>
                     </MenuItem>
                     <Divider />
                    <MenuItem onClick={this.onMenuItemClick.bind(this, 'deletePipeline', pipeline)}>
                        <div className="suiteListMenu">DELETE</div>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={this.onMenuItemClick.bind(this, 'integratePipeline', pipeline)}>
                        <div className="suiteListMenu">INTEGRATE</div>
                    </MenuItem>
                     <Divider />
                     {/********************************* FIN CONTENIDO DEL POPOVER ***********************************/}
                </Popover>
                {this.renderConfirmationDialog()} 
            </div>
        )
    }

}

export default withStyles(styles)(PipelineOptionListPopover);
