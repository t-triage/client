import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import {COLORS} from "../../Main/Components/Globals";
import { CardActions } from '@material-ui/core';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class AlertDialogSlide extends React.Component {
    state = {
        open: false,
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <div style={{justifyContent: "flex-end"}}>
                <CardActions style={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined" style={{ backgroundColor: COLORS.blueLight, color: 'white',borderRadius:'5px'}} onClick={this.handleClickOpen}>
                        Readme
                    </Button>
                </CardActions>
                <Dialog
                    open={this.state.open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">
                        {"did you know the advantages of t-triage with jira?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                        Using jira you gain more visibility, you can have your own Kanvas.
                        T-triage will create a ticket for each new automated failure:
                        If the same test fails, then a comment on the previous ticket will be added.
                        If the test start passing, the ticket will be automatically Resolved.
                        If the test fails again, it'll reopen and you'll see all information.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Understand
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default AlertDialogSlide;