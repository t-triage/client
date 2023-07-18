import React, { Component } from "react"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"

export default class InfoBox extends Component {
    render() {
        return(
        <Grid container direction="row" className={"infoBox-"+this.props.size}>
            <Grid item xs={this.props.xs[0]}>
                <Paper className="infoBoxItem" style={{
                        backgroundColor: this.props.color[500],
                        color: this.props.color["contrastText"]
                }}>{this.props.value[0]}</Paper>
            </Grid>
            <Grid item xs={this.props.xs[1]}>
                <Paper className="infoBoxItem" style={{
                    backgroundColor: this.props.color["A700"],
                    color: this.props.color["contrastText"]
                }}>{this.props.value[1]}</Paper>
            </Grid>
        </Grid>
        )
    }
}