import React, { forwardRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import {COLORS} from "../../Main/Components/Globals";
import { CardActions } from '@mui/material';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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