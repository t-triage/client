import React, { Component } from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { withStyles } from '@material-ui/core/styles';

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