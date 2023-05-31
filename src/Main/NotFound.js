import React, { Component } from 'react'
import "../styles/app.scss"
import Button from "@material-ui/core/Button"
import history from "./Components/History"
import { COLORS } from './Components/Globals'

export default class NotFound extends Component {

  render() {
    return (
      <main className="circularProgressContainer" style={{ flexDirection: 'column' }}>
        <h1 className="notFoundError" style={{ fontSize: '8rem' }}>{"404"}</h1>
        <h5 className="notFoundError">{"We couldn't find the page you are looking for."}</h5>
        <Button
            onClick={() => history.push('/SuiteList')}
            className="globalButton"
            style={{ color: COLORS.primary, borderColor: COLORS.primary, marginTop: 20 }}
            variant="outlined">{"Go back to homepage"}</Button>
      </main>
    )
  }
}
