import React, { Component } from 'react'
import Api from "../Main/Components/Api"
import LicenseStatus from "../Main/Components/LicenseStatus"
import axios from 'axios'

import { COLORS } from "../Main/Components/Globals"

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from "@mui/material/Button"
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import { TextFieldInput } from './AdminUtils'
import Snackbar from "@mui/material/Snackbar"
import withStyles from '@mui/styles/withStyles';
import { MySnackbarContent, snackbarStyle } from '../Main/Components/Globals'

import SideMenu from './SideMenu'

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

export default class License extends Component {

    state = {
        license: null,
        isFree: true,
        licenseCode: '',
        invalidLicenseError: false,
        skipped: false,
        isLoading: true,
        snackbarsList: [],
    }

    componentDidUpdate() {
        let { isActive, isPrevious, setPrevious } = this.props;
        let { skipped } = this.state;

        if (isActive && isPrevious) {
            setPrevious()
            if (!skipped)
                this.wizardUpdate()
        }
    }

    componentDidMount() {
        this.fetchLicense();
    }

    fetchLicense() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetLicense)
            .then(res => {
                let license = res.data
                if (!!license) {
                    this.setState({
                        license: license,
                        isFree: !license.enabled,
                        isLoading: false,
                    })
                }
            })
    }

    onLicenseCodeChange = (ev) => {
        let { value } = ev.target;
        this.setState({
            licenseCode: value,
            invalidLicenseError: false,
        })
    }

    onLicenseTypeChange = (ev) => {
        let { value } = ev.target;

        this.setState({
            isFree: value == 'true' ? true : false,
        })
    }

    validateFields() {
        let { licenseCode, isFree } = this.state;
        let result = true;

        if ((licenseCode === '' || licenseCode.length < 65) && !isFree)
            result = false;

        this.setState({
            invalidLicenseError: !result,
        })
        return result;
    }

    onSubmit = (ev) => {
        ev.preventDefault()

        if (this.validateFields()) {
            this.createLicense();

            if (this.props.wizardMode) {
                if (this.state.license)
                    this.wizardNext();
                else
                    setTimeout(this.wizardNext, 1000)
            }
        }
    }

    createLicense = () => {
        let { isFree, licenseCode } = this.state;
        let date = new Date();

        axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.CreateLicense,
            data: JSON.stringify({
                free: isFree,
                licenseCode: isFree ? null : licenseCode,
                enabled: true,
                timestamp: date.getTime(),
                updated: date.getTime(),
                expiration: date.setDate(date.getDate() + 365)
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                let license = res.data;

                if (this.props.storeData && this.props.wizardMode)
                    this.props.storeData("license", license.id)

                if (this.props.reloadLicense)
                    this.props.reloadLicense();

                this.setState({
                    license: license,
                    isFree: license.enabled ? license.free : true,
                })
            })
            .catch(err => {
                err = "Your license is invalid, please try again."
                this.addSnackbar(err, 'error')
            })

    }

    wizardUpdate = () => {
        let { data } = this.props;
        let id = data.license
        // TODO bring license from database
    }

    wizardNext = () => {
        let { nextStep } = this.props

        if (this.state.license) {
            if (this.state.skipped)
                this.setState({ skipped: false })
            nextStep()
        }
    }

    wizardSkip = () => {
        let { nextStep } = this.props

        this.setState({ skipped: true })
        nextStep()
    }

    addSnackbar(msg, variant) {
        let { snackbarsList } = this.state;

        snackbarsList.push({ openSnackbar: true, snackbarMsg: msg, snackbarVariant: variant });
        this.setState({
            snackbarsList: snackbarsList
        });
    };


    removeSnackbar(snack, id) {
        let { snackbarsList } = this.state;

        snack.openSnackbar = false;
        if (snackbarsList[id]) {
            snackbarsList[id] = snack
        }

        this.setState({
            snackbarsList: snackbarsList
        });
    }

    renderSnackbars() {
        let { snackbarsList } = this.state;

        return (
            <div className={"snackbars-container"}>
                {
                    snackbarsList.map((snack, index) => {
                        return (
                            <Snackbar
                                key={index}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                className={'adminSnackbar'}
                                open={snack.openSnackbar}
                                autoHideDuration={2000}
                                onClose={this.removeSnackbar.bind(this, snack, index)}
                            >
                                <MySnackbarContentWrapper
                                    onClose={this.removeSnackbar.bind(this, snack, index)}
                                    variant={snack.snackbarVariant}
                                    message={snack.snackbarMsg}
                                />
                            </Snackbar>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        let {
            isFree,
            licenseCode,
            license,
            invalidLicenseError,
            isLoading,
        } = this.state;

        let { wizardMode } = this.props;

        return (
            <div>
                {isLoading ?
                    <div className="circularProgressContainer">
                        <CircularProgress color="primary" />
                    </div>
                    :
                    <div style={{ display: 'flex' }}>
                        <SideMenu />
                        <div style={{ 'width': '100%' }} className="CenterList">
                            <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                                {this.renderSnackbars()}
                                <div className="Containers-Main">
                                    <Card>
                                        <CardContent style={{ 'max-width': '80vw'}}>
                                            <h4>License</h4>
                                            <div>Insert your license code to use the full version of t-Triage. For more information, please contact <a href="mailto:info@ttriage.com">info@ttriage.com</a>.</div>

                                            <FormControl component="fieldset" variant="outlined" style={{ marginTop: "20" }}>
                                                <FormLabel component="legend">License type</FormLabel>
                                                <RadioGroup aria-label="type" name="type1" value={String(isFree)} onChange={this.onLicenseTypeChange.bind(this)}>
                                                    <FormControlLabel value="true" control={<Radio />} label="Free" disabled={license ? !license.expired : false} />
                                                    <FormControlLabel value="false" control={<Radio />} label="Commercial" disabled={license ? !license.free : false} />
                                                </RadioGroup>
                                            </FormControl>
                                            <TextFieldInput
                                                id="code"
                                                label="License code"
                                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                                error={invalidLicenseError}
                                                helperText={invalidLicenseError ? 'Enter a valid license code' : ''}
                                                onChange={this.onLicenseCodeChange.bind(this)}
                                                autoFocus={true}
                                                value={licenseCode}
                                                disabled={isFree || (license ? !license.free : false)}
                                                rows={3}
                                                multiline
                                            />
                                            {/* Aplicar estilos usando clases en vez de usar inline style */}
                                            <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {license && license.enabled ?
                                                    <React.Fragment>
                                                        {license.free ? "Free" : "Commercial"} license activated
                                                        <CheckCircleIcon style={{ marginLeft: "8px", color: COLORS.green }} />
                                                    </React.Fragment> :
                                                    <React.Fragment>
                                                        Currently, there's no license activated
                                                        <ErrorIcon color="secondary" style={{ marginLeft: "8px" }} />
                                                    </React.Fragment>
                                                }
                                            </div>
                                        </CardContent>
                                        {wizardMode ?
                                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                                <Button
                                                    type="button"
                                                    className="globalButton"
                                                    variant="contained"
                                                    onClick={this.wizardSkip.bind(this)}
                                                    color="inherit"
                                                    disabled={!license}>
                                                    Skip
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="globalButton"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={!this.validateFields.bind(this)}>
                                                    Next
                                                </Button>
                                            </CardActions>
                                            :
                                            <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                                <Button
                                                    type="submit"
                                                    className="globalButton"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={!this.validateFields.bind(this)}>
                                                    Activate
                                                </Button>
                                            </CardActions>
                                        }
                                    </Card>
                                </div>
                                <div>
                                    {
                                        !wizardMode && license.enabled && (
                                            <LicenseStatus isFree={license.free} />
                                        )
                                    }
                                </div>
                            </ form>
                        </ div>
                    </div>
                }
            </div>
        )
    }

}