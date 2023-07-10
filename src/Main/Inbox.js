import React, { Component } from 'react';
import withStyles from '@mui/styles/withStyles';
import COLORS from './Components/Globals'
import Api from "./Components/Api"
import Nav from "../Main/Components/Nav"
import axios from 'axios'

import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const classes = theme => ({
    fontSize: {
        fontSize: "12pt",
    },

    unseen: {
        backgroundColor: "#F4F9FF !important",
        "&:hover": {
            backgroundColor: "#F6F9FC !important"
        }
    },

    seen: {
        "&:hover": {
            backgroundColor: "#F9F9F9 !important"
        }
    }
});

class Inbox extends Component {

    state = {
        notifications: [],
        notificationSelected: null,
        notificationsUpdated: false,
        loading: true,
        helpEnabled: false,
    }

    componentDidMount() {
        document.title = "Notifications"
        this.fetchNotifications();
    }

    fetchNotifications = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetNotifications)
            .then(res => {
                let notifications = res.data

                this.setState({
                    loading: false,
                })

                if (!!notifications) {
                    let unseenNotifications = notifications.filter(x => !x.seen).length
                    localStorage.setItem("unseenNotifications", unseenNotifications)

                    if (unseenNotifications > 0 && !this.state.notificationsUpdated)
                        this.updateAllNotifications();
                    else
                        this.setState({notificationsUpdated: true})

                    this.setState({
                        notifications: notifications,
                    })
                }
            })
    }

    updateAllNotifications() {
        axios.put(Api.getBaseUrl() + Api.ENDPOINTS.NotificationsMarkAsSeen)
            .then(res => {
                this.setState({notificationsUpdated: true})
                setTimeout(() => {
                    this.fetchNotifications();
                }, 2000)
            }) 
    }

    updateNotification = (notification) => {
        axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateNotification,
            data: JSON.stringify({...notification, enabled: true}),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            this.fetchNotifications()
        })
    }

    deleteNotification = (index) => {
        let notification = this.state.notifications[index]
        axios.delete(Api.getBaseUrl() + Api.ENDPOINTS.DeleteNotification + notification.id)
            .then(res => {
                this.fetchNotifications()
            })
        this.setState({notificationSelected: null})
    }

    changeNotificationVisibility = (index) => {
        let notification = this.state.notifications[index]
        notification.seen = !notification.seen
        this.updateNotification(notification)
        this.setState({notificationSelected: null})
    }

    onHelpClick = filter => () => {
        let value = this.state[filter]
        this.setState({
            [filter]: !value
        })
    }

    formatDescription = (description) => {
        let support = "contact support"

        if (description.includes(support)) {
            let splitted = description.split(support)
            return splitted.map((part, index) => {
                if (index != splitted.length-1)
                    return <React.Fragment key={index}>{part}<a href="mailto:info@ttriage.com">{support}</a></React.Fragment>
                return <React.Fragment key={index}>{part}</React.Fragment>
            })
        }
        
        return description
    }

    render() {
        let {
            notifications,
            helpEnabled,
            notificationSelected,
            loading,
        } = this.state;

        const {unseen, seen, fontSize} = this.props.classes;

        return (
            <div className="homeRoot" >
                <Nav
                    helpEnabled={helpEnabled}
                    screen={'notifications'}
                    title={"Notifications"}
                    onHelpClick={this.onHelpClick.bind(this)}
                />
                <main style={{ marginTop: helpEnabled ? 245 : 100}}>
                    {loading ? 
                            <div className="circularProgressContainer">
                                <CircularProgress color="primary" />
                            </div>
                        : 
                        <Grid container justifyContent="center">
                            {notifications.length > 0 ? (
                                <Paper style={{width: "75%"}} >
                                    <Table >
                                         <colgroup>
                                            <col />
                                            <col width="10%" />
                                            <col width="7.5%" />
                                        </colgroup>
                                        <TableHead >
                                            <TableRow >
                                                <TableCell className="headerTable"><span style={{paddingLeft: "30px"}}>Notification</span></TableCell>
                                                <TableCell className="headerTable"><span style={{paddingLeft: "5px"}}>Date</span></TableCell>
                                                <TableCell className="headerTable"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {notifications.map((notification, index) => (
                                                    <TableRow key={notification.id} hover className={notification.seen ? seen : unseen} >
                                                        <TableCell>
                                                            <div style={{display: "flex", flexDirection: "row", padding: "12px"}}>
                                                                <div style={{width: "1em"}}>
                                                                    {notification.seen ? <span></span> : <span>&#9679;</span>}
                                                                </div>
                                                                <div>
                                                                    <b>{notification.subject.toUpperCase()}</b>
                                                                    <div>{this.formatDescription(notification.description)}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell><div style={{whiteSpace: "nowrap"}}>{notification.timeAgo}</div></TableCell>
                                                        <TableCell>
                                                            <Tooltip title="More options"
                                                                classes={{
                                                                tooltip: classes.tooltip,
                                                                popper: classes.popper,
                                                            }}>
                                                                <div>
                                                                    <IconButton
                                                                        id={"notificationOptions-" + index}
                                                                        onClick={() => this.setState({notificationSelected: index})}
                                                                        size="large">
                                                                        <MoreHorizIcon color='action'/>
                                                                    </IconButton>
                                                                </div>
                                                            </Tooltip>
                                                            <Popover
                                                                open={notificationSelected === index}
                                                                anchorEl={document.getElementById("notificationOptions-" + index)}
                                                                onClose={() => this.setState({ notificationSelected: null })}
                                                                anchorOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'left',
                                                                }}
                                                                transformOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'right',
                                                                }}>
                                                                    <div>
                                                                        <h6 style={{ fontSize: '13px', padding: '15px', color: 'var(--grey)'}} >Notification options</h6>
                                                                    </div>
                                                                    <MenuItem onClick={this.changeNotificationVisibility.bind(this, index)}>
                                                                        <div className="suiteListMenu">{notification.seen ? "Mark as unread" : "Mark as read"}</div>
                                                                        <CheckIcon className="kanbanActionButtonIcon" color="action"/>
                                                                    </MenuItem>
                                                                    <Divider />
                                                                    <MenuItem onClick={this.deleteNotification.bind(this, index)}>
                                                                        <div className="suiteListMenu">Delete notification</div>
                                                                        <ClearIcon className="kanbanActionButtonIcon" color="action" />
                                                                    </MenuItem>
                                                            </Popover>
                                                        </TableCell>
                                                    </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            )
                            :
                            (
                                <Paper style={{width: "75%"}}>
                                    <div style={{textAlign: "center", verticalAlign: "middle", padding: "16px"}}>
                                        You don't have anything in your Inbox.
                                    </div>
                                </Paper>
                            )}
                        </Grid>
                    }
                </main>
            </div>
        );
    }
    
}

export default withStyles(classes)(Inbox);