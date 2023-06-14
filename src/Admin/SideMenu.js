import React, { Component } from "react"
import "../styles/home.scss"

import { Link } from 'react-router-dom'
// Icons
import TTriageLogo from "../images/ttriage_isologo.png"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import CategoryIcon from '@material-ui/icons/Category';
import ListAltIcon from '@material-ui/icons/ListAlt';
import GroupIcon from '@material-ui/icons/Group';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PaymentIcon from '@material-ui/icons/Payment';
import TocIcon from '@material-ui/icons/Toc';
import SettingsIcon from '@material-ui/icons/Settings';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';

// UI Components
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import List from "@material-ui/core/List"
import Paper from "@material-ui/core/Paper"
import Divider from "@material-ui/core/Divider"

class SideMenu extends Component {

    render() {
        return (
            <Paper style={{'position': 'sticky', 'height': '100vh', 'top': '0', 'width': '300px'}}>
                <List className="sideMenuList">
                    <div className={"sideMenuCategories"}>
                        <div className={"sideMenuCategory"}>
                            <span className={"categoryTitle"} style={{ 'fontSize': '1.5em', 'fontWeight': 'bold' }}>Admin Panel</span>
                            <div className={"categoryItems"}>
                                <Link style={{ textDecoration: 'none' }} to={"/Admin/Products"}>
                                    <ListItem className={"itemContent"} button key="productsList">
                                        <ListItemIcon className={"itemIcon"}><CategoryIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="Products" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to={"/Admin/Milestones"}>
                                    <ListItem className={"itemContent"} button key="milestoneList">
                                        <ListItemIcon className={"itemIcon"}><ListAltIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="Milestones" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to="/Admin/Connectors">
                                    <ListItem className={"itemContent"} button key="conenctorsList">
                                        <ListItemIcon className={"itemIcon"}><TocIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="CI Connectors" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to="/Admin/Containers">
                                    <ListItem className={"itemContent"} button key="containersList">
                                        <ListItemIcon className={"itemIcon"}><ListAltIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="CI Containers" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to="/Admin/Properties">
                                    <ListItem className={"itemContent"} button key="propertiesList">
                                        <ListItemIcon className={"itemIcon"}><SettingsIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="Properties" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to="/Admin/Users">
                                    <ListItem className={"itemContent"} button key="usersList">
                                        <ListItemIcon className={"itemIcon"}><GroupIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="Users" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to="/Admin/License">
                                    <ListItem className={"itemContent"} button key="licenseList">
                                        <ListItemIcon className={"itemIcon"}><PaymentIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="License" />
                                    </ListItem>
                                </Link>
                                <Link style={{ textDecoration: 'none' }} to="/Admin/Logs">
                                    <ListItem className={"itemContent"} button key="logsList">
                                        <ListItemIcon className={"itemIcon"}><ImportContactsIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="Logs" />
                                    </ListItem>
                                </Link>
                                <ListItem className={"itemContent"} button key="wizardList">
                                    <ListItemIcon className={"itemIcon"}><LabelImportantIcon /></ListItemIcon>
                                    <ListItemText className={"itemText"} primary="Wizard" />
                                </ListItem>
                            </div>
                            <Divider />
                            <div className={"categoryItems"}>
                                <Link style={{ textDecoration: 'none' }} to={"/SuiteList"}>
                                    <ListItem className={"itemContent"} button key="workspace">
                                        <ListItemIcon className={"itemIcon"}><ArrowBackIcon /></ListItemIcon>
                                        <ListItemText className={"itemText"} primary="Back" />
                                    </ListItem>
                                </Link>
                            </div>
                            <Divider />
                        </div>
                    </div>
                    <div className={"sideMenuBottomIcon"}>
                        <a
                            target="_blank"
                            href="https://www.ttriage.com">
                            <img
                                src={TTriageLogo}
                                style={{
                                    width: 100
                                }}
                            />
                        </a>
                    </div>
                </List>
            </Paper>
        )
    }
}
export default SideMenu;
