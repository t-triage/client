import React from 'react';
import axios from 'axios';
import Api from "./Api"
import TTriageLogo from "../../images/favicon.png";

class JiraConnect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        }
    }

    componentDidMount() {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (code && state) {
            axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.JiraConnect}?code=${code}&state=${state}`).then(response => {
                debugger 
                this.setState({data: response.data});
                window.opener.postMessage({status: response.data.access_token ? "OK" : "ERROR"}, window.opener.location.href);
                window.close()
            });
        }
    }

    render() {
        const {data} = this.state;
        return (
            <div className="jira-connect">
                <div className="container">
                    <div className="centered">
                        <img src={TTriageLogo} style={{width: 35, display: "flex"}} alt="ttriage-logo"/>
                        {data.access_token && (<h2>Connected successfully</h2>)}
                        {!data.access_token && !data.error && (
                            <>
                                <h2>Connecting to your repository</h2>
                                <div className="spin">
                                    <div className="bounce1"/>
                                    <div className="bounce2"/>
                                    <div className="bounce3"/>
                                </div>
                            </>)}
                        {data.error && (<div style={{display: "flex", flexDirection: "column"}}>
                            <h2>Error:</h2>
                            <p>Please check the credentials</p>
                        </div>)}
                    </div>
                </div>

            </div>
        )
    }
}

export default JiraConnect;
