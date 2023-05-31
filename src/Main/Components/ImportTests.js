import React, { Component } from 'react'

import {styles} from "./Globals";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    withStyles
} from "@material-ui/core";

class ImportTests extends Component {

    render() {
        const {open, importReport, handleTestsModalOpen } = this.props;
        const props = {
            open: open,
            onClose: handleTestsModalOpen
        }

        return(
            <Dialog {...props} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Import Tests</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Use this space to upload automated tests in xlsx or xls format with the proper Fields.
                        <ul>
                            <li>Product.</li>
                            <li>Container Name.</li>
                            <li>Suite Name.</li>
                            <li>Test Name.</li>
                            <li>Test Path.</li>
                            <li>Triage Notes.</li>
                            <li>Suit Detail.</li>
                            <li>Status.</li>
                            <li>Executed Time.</li>
                            <li>Severity.</li>
                            <li>Error Description.</li>
                            <li>Stack Trace.</li>
                            <li>Standard Output.</li>
                            <li>User.</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <input
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        onChange={importReport}
                        type="file"
                    />
                    <label htmlFor="raised-button-file" >
                        <Button variant="contained" color="primary" component="span" style={{ marginRight: 15, marginBottom: 15 }} >
                            Upload Tests
                        </Button>
                    </label>
                </DialogActions>
            </Dialog>

        )

    }

}


export default withStyles(styles)(ImportTests);