import React, { Component } from "react"
import axios from 'axios'
import Api from './Components/Api'
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"

export default class TermsAndConditions extends Component {
  state = {
    termsAndConditionsReady: false,
  }

  componentDidMount() {
    this.fetchUserTerms()
  }

  fetchUserTerms() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUsertTerms)
    .then(res => {
      this.setState({
        termsAndConditionsReady: true,
      })
      let parser = new DOMParser()
      let el = parser.parseFromString(res.data, "text/html");
      el.body.style.backgroundColor = 'white'
      document.getElementById("termsAndConditions").appendChild(el.documentElement)
    })
  }

  accept() {
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
    let timestamp = new Date().getTime()
    currentUser = {...currentUser, agreedTermsConditions: true, timestampTermsConditions: timestamp }
    axios({
        method: "PUT",
        url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateUser,
        data: JSON.stringify(currentUser),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
      this.props.fetchCurrentUser()
    })
  }

  decline() {
      localStorage.removeItem("auth")
      localStorage.removeItem("currentUser")
      localStorage.removeItem("kanbanData")
      window.location.replace("/")
  }

  render() {
    const flex = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }

    return (
      <div className="homeRoot" style={{
        ...flex,
      }}>
        {
          !this.state.termsAndConditionsReady && (
            <div className="circularProgressContainer">
                <CircularProgress color="primary" />
            </div>
          )
        }
        {
          this.state.termsAndConditionsReady && (
            <Paper style={{
              padding: '20',
              margin: '20',
              fontSize: 14,
            }}>
                <div id="termsAndConditions"></div>
                <div style={{...flex, marginTop: 20}}>
                  <Button
                      variant="contained"
                      className="globalButton"
                      color="primary"
                      onClick={this.accept.bind(this)}
                      style={{ marginRight: 10 }}>Accept</Button>
                  <Button
                      variant="contained"
                      className="globalButton"
                      color="secondary"
                      onClick={this.decline.bind(this)}>Decline</Button>
                </div>
            </Paper>
          )
        }
      </div>
    )
  }
}
