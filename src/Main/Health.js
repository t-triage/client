import React, { Component } from 'react'
import Api from "./Components/Api"
import axios from 'axios'

export default class Health extends Component {
    state = {
        health: null,
    }

    componentDidMount() {
        this.fetchHealth()
    }

    fetchHealth = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.HealthInfo)
            .then(res => {
                this.setState({
                    health: res.data,
                })
            })
    }

    render() {
        let {health} = this.state

        return (
            <pre>
                {health && JSON.stringify(health, null, 2)}
            </pre>
        )
    }
}
  