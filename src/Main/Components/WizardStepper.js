import React, { Component } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import withStyles from '@mui/styles/withStyles';

import { styles, COLORS } from './Globals'

export default class WizardStepper extends Component {

    render () {
        let {steps} = this.props
        
        return (
            <Stepper activeStep={this.props.currentStep-1} style={{paddingLeft: "25%", paddingRight: "25%"}}>
                {steps.map((label, index) => {
                    return (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    );
                    })}
            </Stepper>
        )

    }

};