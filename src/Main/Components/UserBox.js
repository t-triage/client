import "../../styles/home.scss"

import { Link } from 'react-router-dom'
import Avatar from "@mui/material/Avatar"
import Badge from "@mui/material/Badge"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import React, { Component } from "react"
import TTriageLogo from '../../images/avatar/ttriage.png'

class UserBox extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        let {data} = this.props
        return data && (
            <Grid container className="userBox" direction="column" justifyContent="center">
                <Grid container justifyContent="center">
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
        );
    }
}
export default UserBox;
