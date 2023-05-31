import React, { Component } from "react";
import Wizard from "../Main/Components/Wizard";

import License from "./License";
import Product from "./Product";
import Connectors from "./Connectors";
import Containers from "./Containers";
import Users from "./Users";

export default class Setup extends Component {
    constructor(props) {
        super(props)

        this.onFinish = this.onFinish.bind(this)
    }

    onFinish = () => {
        window.location = '/SuiteList'
    }

    render() {
        var WizardNavValues = ["License", "Product", "CI Connector", "User", "CI Container"]

        return (
            <Wizard steps={WizardNavValues} onFinish={this.onFinish}>
                <License />
                <Product />
                <Connectors />
                <Users />
                <Containers />
            </Wizard>
        )
    }
}