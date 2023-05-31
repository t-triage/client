import React, { Component } from 'react'
import Api from "../Main/Components/Api"
import axios from 'axios'

//Components
import CircularProgress from '@material-ui/core/CircularProgress';
import SideMenu from './SideMenu';
import { Typography } from '@material-ui/core';
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import CardContent from "@material-ui/core/CardContent";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from "@material-ui/core/Snackbar";

//Icons
import CheckIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from "@material-ui/icons/Error"
import CloseIcon from "@material-ui/icons/Close"
import SaveIcon from '@material-ui/icons/Save';

export default class Logs extends Component {

    state = {
        logs: '',
        cantLines: 100,
        isLoading: true,
        isDownloading: false,
        successDownload: false,
        errorDownload: false
    }

    componentDidMount() {
        this.fetchLogs(this.state.cantLines);
    }

    fetchLogs(cantLines) {
        this.setState({ isLoading: true })
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetLogs + "?cantLines=" + cantLines)
            .then(res => {
                this.setState({ isLoading: false, logs: res.data });
            })
            .catch(error => {
                this.setState({ isLoading: false, logs: error });
            })
    }
    fetchDownloadLogs = () => {
        this.setState({ isDownloading: true })
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.getLogsFile, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `LOGS-${new Date().toLocaleTimeString()}.txt`
                );
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                this.setState({ isDownloading: false, successDownload: true });
            })
            .catch(error => {
                this.setState({ isDownloading: false, errorDownload: true });
            })
    }

    handleChangeCantLines = (ev) => {
        this.setState({ cantLines: ev.target.value });
        this.fetchLogs(ev.target.value);
    }

    closeSuccessDownload = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ successDownload: false });
    }
    closeErrorDownload = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ errorDownload: false });
    }

    render() {
        let { isLoading, logs, cantLines, isDownloading, errorDownload, successDownload } = this.state;

        return (
            <div style={{ display: 'flex' }}>
                <SideMenu />
                <div style={{ 'width': '100%' }} className="CenterList">
                    <div className="Containers-Main">
                        <Card>
                            <CardContent style={{ 'max-width': '80vw' }}>
                                <h4>Logs</h4>
                                <div>This window shows the log file of the console.</div>
                                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px' }}>
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">Show</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={cantLines}
                                            label="Cant"
                                            onChange={this.handleChangeCantLines}
                                        >
                                            <MenuItem value={100}>100</MenuItem>
                                            <MenuItem value={500}>500</MenuItem>
                                            <MenuItem value={1000}>1000</MenuItem>
                                            <MenuItem value={-1}>All</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <div>
                                        {!isDownloading ?
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={this.fetchDownloadLogs}
                                            >
                                                <SaveIcon style={{marginRight: '10px'}} size={20}/> Download
                                            </Button>
                                        :
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={true}
                                            >
                                                <CircularProgress style={{marginRight: '10px'}} size={20} color="secondary" />
                                                Downloading
                                            </Button>
                                        }
                                    </div>
                                </div>
                                {isLoading ?
                                    <div style={{ 'width': '100%' }} className="circularProgressContainer">
                                        <CircularProgress color="primary" />
                                    </div>
                                    :
                                    <Paper style={{maxHeight: '80vh', overflow: 'auto'}}>
                                        <Typography style={{ whiteSpace: "pre" }} >
                                            {logs}
                                        </Typography>
                                    </Paper>
                                }
                            </CardContent>
                        </Card>
                    </div>
                </ div>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open={successDownload}
                    autoHideDuration={5000}
                    onClose={this.closeSuccessDownload}
                    ContentProps={{
                        'aria-describedby': 'success-download'
                    }}
                    message={<span id="success-download">
                        <CheckIcon />
                        {"File downloaded successfully"}
                    </span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={this.closeSuccessDownload}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open={errorDownload}
                    autoHideDuration={5000}
                    onClose={this.closeErrorDownload}
                    ContentProps={{
                        'aria-describedby': 'error-download'
                    }}
                    message={<span id="error-download">
                        <ErrorIcon />
                        {"Failed to download the file"}
                    </span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={this.closeErrorDownload}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </div>
        )
    }

}