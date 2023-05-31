import "../../styles/home.scss"

import { Link } from 'react-router-dom'
import Avatar from "@material-ui/core/Avatar"
import Badge from "@material-ui/core/Badge"
import Button from "@material-ui/core/Button"
import Grid from "@material-ui/core/Grid"
import React, { Component } from "react"
import TTriageLogo from '../../images/avatar/ttriage.png'

class UserBox extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        let {data} = this.props
        return data && (
            <Grid container className="userBox" direction="column" justify="center">
                <Grid container justify="center">
                    <Grid item>
                        <Avatar alt={data.displayName} src={
                          this.props.data.avatar ?
                            this.props.data.avatar
                          : TTriageLogo
                        } className="userAvatar" />
                    </Grid>
                </Grid>
                <Grid item className="userFullName">{data.displayName}</Grid>
            </Grid>
        )
    }
}
export default UserBox;
