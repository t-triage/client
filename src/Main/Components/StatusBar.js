import React, { Component } from "react"
import Grid from "@mui/material/Grid"


import Tooltip from "@mui/material/Tooltip"
import withStyles from '@mui/styles/withStyles';

import { styles, COLORS } from './Globals'
import axios from "axios";
import Api from "./Api";

const height = 10;

class StatusBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            testHistory: null,
            testHistoryAll: null,
            finalData: {
                totalPass: 0,
                totalNewPass: 0,
                totalFail: 0,
                totalNewFail: 0,
                totalPermanent: 0,
                totalTests: 0
            }
        }
    }

    fetchTestHistory(triageId) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTestHistory + triageId)
            .then(res => {

                let length = res.data.length;
                let totalTests = 0;
                let totalPass = 0;
                let totalFail = 0;
                let totalNewFail = 0;
                let totalNewPass = 0;
                let totalPermanent = 0;
                let shortHistory = length > 20 ? res.data.slice(length - 20, length) : res.data
                for (let tt in shortHistory){
                    if (shortHistory[tt].currentState === 'PASS') {
                        totalTests += 1
                        totalPass += 1
                    }
                    if (shortHistory[tt].currentState === 'NEWPASS') {
                        totalTests += 1
                        totalNewPass += 1
                    }
                    if (shortHistory[tt].currentState === 'FAIL') {
                        totalTests += 1
                        totalFail += 1
                    }
                    if (shortHistory[tt].currentState === 'NEWFAIL') {
                        totalTests += 1
                        totalNewFail += 1
                    }
                    if (shortHistory[tt].currentState === 'PERMANENT') {
                        totalTests += 1
                        totalPermanent += 1
                    }
                }
                this.setState({
                    testHistory: shortHistory,
                    testHistoryAll: res.data,
                    finalData: {
                        totalPass: totalPass,
                        totalNewPass: totalNewPass,
                        totalFail: totalFail,
                        totalNewFail: totalNewFail,
                        totalPermanent: totalPermanent,
                        totalTests: totalTests
                    }
                })
            })
    }

    componentDidMount() {
        this.fetchTestHistory(this.props.triageId)
    }

    getPercentage(testHistory, type) {
        let {
            totalTests,
            totalPass,
            totalNewPass,
            totalFail,
            totalNewFail,
            totalPermanent,
        } = testHistory;


        totalPass = totalPass*100/totalTests
        totalNewPass = totalNewPass*100/totalTests
        totalFail = totalFail*100/totalTests
        totalNewFail = totalNewFail*100/totalTests
        totalPermanent = totalPermanent*100/totalTests

        switch (type) {
            case 'newFail':
                return `${totalNewFail}%`;
            case 'fail':
                return `${totalFail}%`;
            case 'newPass':
                return `${totalNewPass}%`;
            case 'pass':
                return `${totalPass}%`;
            case 'permanent':
                return `${totalPermanent}%`;
            default:
                return '100%';
        }
    }

    getTooltipContent() {
        let {finalData} = this.state;


        return (
            <div>
                <div style = {{ marginBottom: 10}}>Flaky Test</div>
                <div style={{ color: COLORS.blue, marginBottom: 5, marginLeft: 15, marginRight: 15 }}>
                    <span>{`Permanents: ${finalData.totalPermanent}`}</span>
                </div>
                <div style={{ color: COLORS.newPass, marginBottom: 5, marginLeft: 15, marginRight: 15 }}>
                    <span>{`New Pass: ${finalData.totalNewPass}`}</span>
                </div>
                <div style={{ color: COLORS.pass, marginBottom: 5, marginLeft: 15, marginRight: 15 }}>
                    <span>{`Pass: ${finalData.totalPass}`}</span>
                </div>
                <div style={{ color: COLORS.newFail, marginBottom: 5, marginLeft: 15, marginRight: 15 }}>
                    <span>{`New Fails: ${finalData.totalNewFail}`}</span>
                </div>
                <div style={{ color: COLORS.fail, marginBottom: 5, marginLeft: 15, marginRight: 15 }}>
                    <span>{`Fails: ${finalData.totalFail}`}</span>
                </div>
            </div>
        )
    }

    render() {
        let {classes} = this.props;
        let {finalData} = this.state;

        return (
            <Tooltip
                classes={{
                    tooltip: classes.tooltip,
                    popper: classes.popper,
                }}
                TransitionProps={{ timeout: 600 }}
                title={this.getTooltipContent()}>
                <Grid container style={{boxShadow: '0 1px 10px #ccc'}}>
                    <Grid item style={{
                        backgroundColor: COLORS.newPass,
                        width: this.getPercentage(finalData, 'newPass'),
                        height
                    }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.pass,
                        width: this.getPercentage(finalData, 'pass'),
                        height
                    }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.newFail,
                        width: this.getPercentage(finalData, 'newFail'),
                        height
                    }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.fail,
                        width: this.getPercentage(finalData, 'fail'),
                        height
                    }}></Grid>
                    <Grid item style={{
                        backgroundColor: COLORS.autoTriaged,
                        width: this.getPercentage(finalData, 'permanent'),
                        height
                    }}></Grid>
                </Grid>
            </Tooltip>
        )
    }
}

export default withStyles(styles)(StatusBar)