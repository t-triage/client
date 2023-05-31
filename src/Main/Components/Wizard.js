import React, { Component } from "react";
import Button from "@material-ui/core/Button"
import StepWizard from 'react-step-wizard';
import WizardStepper from "./WizardStepper"
import { data } from "jquery";

export default class Wizard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isPrevious: false,
            data: {}
        }

        this.onFinish = this.onFinish.bind(this)
        this.storeData = this.storeData.bind(this)
        this.setPrevious = this.setPrevious.bind(this)
    }

    storeData = (key, value) => {
        const newData = { ...this.state.data, [key] : value };

        this.setState({ data : newData });
    }

    setPrevious = () => {
        if (this.state.isPrevious)
            this.setState({isPrevious: false})
        else
            this.setState({isPrevious: true})
    }

    onFinish = () => {
        this.props.onFinish();
    }

    render() {
        let {steps} = this.props
        
        return (
            <StepWizard nav={<WizardStepper steps={steps}/>} >
                {React.Children.map(this.props.children, (child, i)=>{
                    return React.cloneElement(child, {
                        wizardMode: true,
                        data: this.state.data,
                        isPrevious: this.state.isPrevious,
                        setPrevious: this.setPrevious,
                        finish: this.onFinish,
                        storeData: this.storeData,
                    })
                })}
            </StepWizard>
        )
    }

}

