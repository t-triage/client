import React, { Component } from "react"
import "../styles/home.scss"

import { Link } from 'react-router-dom'
// Icons
import TTriageLogo from "../images/ttriage_isologo.png"
import ListItemIcon from "@mui/material/ListItemIcon"
import CategoryIcon from '@mui/icons-material/Category';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import TocIcon from '@mui/icons-material/Toc';
import SettingsIcon from '@mui/icons-material/Settings';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';

// UI Components
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import List from "@mui/material/List"
import Paper from "@mui/material/Paper"
import Divider from "@mui/material/Divider"

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
                            href="https://www.clarolab.com/ttriage/">
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
