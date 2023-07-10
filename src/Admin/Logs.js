import React, { Component } from 'react'
import Api from "../Main/Components/Api"
import axios from 'axios'

//Components
import CircularProgress from '@mui/material/CircularProgress';
import SideMenu from './SideMenu';
import { Typography } from '@mui/material';
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from "@mui/material/Snackbar";

//Icons
import CheckIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from "@mui/icons-material/Error"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from '@mui/icons-material/Save';

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
                            size="large">
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
                            size="large">
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </div>
        );
    }

}