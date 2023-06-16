import React, { Component } from 'react'
import Api from "./Api"
import axios from 'axios'
import COLORS from "./Globals"

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import Button from "@mui/material/Button"
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CardHeader } from '@mui/material'

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