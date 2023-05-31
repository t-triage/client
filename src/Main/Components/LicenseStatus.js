import React, { Component } from 'react'
import Api from "./Api"
import axios from 'axios'
import COLORS from "./Globals"

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CardActions from '@material-ui/core/CardActions'
import Button from "@material-ui/core/Button"
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { CardHeader } from '@material-ui/core'

export default class LicenseStatus extends Component {
    
    state = {
        usersLeft: 0,
        manualTestsLeft: 0,
        triagedTestsLeft: 0,
        isLoaded: false,
    }

    componentDidMount() {
        this.fetchLicenseStatus()
    }

    fetchLicenseStatus = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetLicenseStatus)
            .then(res => {
                this.setState({
                    usersLeft: res.data.usersLeft,
                    manualTestsLeft: res.data.manualTestsLeft,
                    triagedTestsLeft: res.data.triagedTestsLeft,
                    isLoaded: true,
                })
            })
    }

    render() {
        let {
            usersLeft,
            manualTestsLeft,
            triagedTestsLeft,
            isLoaded,
        } = this.state

        let { isFree } = this.props

        return (
                <div className="Containers-Main">
                    <Card>
                        { isFree ? (
                            <CardContent>
                                <h4>License status</h4>
                                {/* Si se puede, usar clases en vez de inline styles en elementos html */}
                                <div style={{padding: "24px 16px"}}>
                                    <div><b>Users left: </b> {usersLeft}</div>
                                    <div><b>Manual tests left: </b> {manualTestsLeft}</div>
                                    <div><b>Triaged tests left: </b> {triagedTestsLeft}</div>
                                </div>
                            </CardContent>
                        ) :
                        (
                            <CardContent>
                                {/* Si se puede, usar clases en vez de inline styles en elementos html */}
                                <div style={{verticalAlign: "middle", textAlign: "center", padding: 16}}>
                                    Your license has no limitations.
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
        )
    }

}