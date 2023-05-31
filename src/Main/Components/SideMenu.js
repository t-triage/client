import React, {Component} from "react"
import "../../styles/home.scss"
import Api from "./Api"
import axios from 'axios'

import UserBox from "./UserBox"
import {Link} from 'react-router-dom'
import {logout} from './Globals'
// Icons
import TTriageLogo from "../../images/ttriage_isologo.png"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"
import AssignmentIcon from "@material-ui/icons/LocalLibrary"
import BuildIcon from "@material-ui/icons/Build"
import TrendingUpIcon from "@material-ui/icons/TrendingUp"
import BarChartIcon from '@material-ui/icons/BarChart';
import BugReportIcon from "@material-ui/icons/BugReport"
import DashboardIcon from "@material-ui/icons/Dashboard"
import PlayArrowIconIcon from "@material-ui/icons/PlayArrow"
import NoteAddIcon from "@material-ui/icons/NoteAdd"
import LockIcon from '@material-ui/icons/Lock';
import AdbIcon from '@material-ui/icons/Adb';
import ExitIcon from "@material-ui/icons/ExitToApp"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import { Icon, InlineIcon } from '@iconify/react';
import roundMediation from '@iconify/icons-ic/round-mediation';
// UI Components
import Drawer from "@material-ui/core/Drawer"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import List from "@material-ui/core/List"
import Grid from "@material-ui/core/Grid"
import ChangePasswordDialog from "./ChangePasswordDialog"

class SideMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isMenuOpen: false,
            currentUser: null,
						showChangePasswordDialog: false
        }
    }

    componentDidUpdate() {
      let {currentUser} = this.state
      if (!currentUser || currentUser === {}) {
        this.fetchCurrentUser()
      }
    }

    componentWillMount() {
      this.fetchCurrentUser()
    }

    fetchCurrentUser() {
      this.setState({
        currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
      })
    }

    toggleMenu = () => {
        this.setState({isMenuOpen: !this.state.isMenuOpen})
    }

	openShowPasswordDialog() {
		this.setState({
			showChangePasswordDialog: true
		})
	}

    onCloseShowPasswordDialog() {
			this.setState({
				showChangePasswordDialog: false
			})
		}

    render() {
        let {currentUser, showChangePasswordDialog} = this.state
        let {selectedContainerID} = this.props
        return (
            <div>
            <IconButton aria-label="Menu" onClick={this.toggleMenu}>
                <MenuIcon style={{ position: "relative" }} fontSize="large"/>
                <Drawer open={this.state.isMenuOpen} onClose={this.toggleMenu}>
                    <List className="sideMenuList">
                        <ListItem className={"userItem"}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <UserBox data={currentUser} />
                                </Grid>
                            </Grid>
                        </ListItem>
											<div className={"sideMenuCategories"}>
                        <div className={"sideMenuCategory"}>
                          <span className={"categoryTitle"}>Automation</span>
                          <div className={"categoryItems"}>
                            <Link style={{textDecoration: 'none'}} to={selectedContainerID ? `/SuiteList/Container/${selectedContainerID}/` : "/SuiteList/"}>
                              <ListItem className={"itemContent"} button key="workspace">
                                  <ListItemIcon className={"itemIcon"}><DashboardIcon /></ListItemIcon>
                                  <ListItemText className={"itemText"} primary="Triage" />
                              </ListItem>
                            </Link>
                            <Link style={{textDecoration: 'none'}} to={selectedContainerID ? `/PipelineList/Container/${selectedContainerID}/` : "/PipelineList/"}>
															<ListItem className={"itemContent"} button key="pipelineList">
                                <ListItemIcon className={"itemIcon"}><Icon icon={roundMediation} width={25} /></ListItemIcon>
																<ListItemText className={"itemText"} primary="Pipelines" />
															</ListItem>
														</Link>
                            <Link style={{textDecoration: 'none'}} to="/AutomationCreation/">
                              <ListItem className={"itemContent"} button key="automationCreation">
                                  <ListItemIcon className={"itemIcon"}><NoteAddIcon /></ListItemIcon>
                                  <ListItemText className={"itemText"} primary="Create" />
                              </ListItem>
                            </Link>
														<Link style={{textDecoration: 'none'}} to="/AutomationIssues/">
															<ListItem className={"itemContent"} button key="automationIssues">
																<ListItemIcon className={"itemIcon"}><BugReportIcon /></ListItemIcon>
																<ListItemText className={"itemText"} primary="Fix" />
															</ListItem>
														</Link>
                            <Link style={{textDecoration: 'none'}} to="/AutomatedTestRepository">
															<ListItem className={"itemContent"} button key="automatedTests">
																<ListItemIcon className={"itemIcon"}><AssignmentIcon /></ListItemIcon>
																<ListItemText className={"itemText"} primary="Repository" />
															</ListItem>
														</Link>
													</div>
                        </div>
												<div className={"sideMenuCategory"}>
													<span className={"categoryTitle"}>Manual Test</span>
													<div className={"categoryItems"}>
                                                        <Link style={{textDecoration: 'none'}} to="/TestRuns">
                                                            <ListItem className={"itemContent"} button key="manualTestsPlans">
                                                                <ListItemIcon className={"itemIcon"}><PlayArrowIconIcon /></ListItemIcon>
                                                                <ListItemText className={"itemText"} primary="Runs" />
                                                            </ListItem>
                                                        </Link>
														<Link style={{textDecoration: 'none'}} to="/TestRepository">
															<ListItem className={"itemContent"} button key="manualTests">
																<ListItemIcon className={"itemIcon"}><AssignmentIcon /></ListItemIcon>
																<ListItemText className={"itemText"} primary="Repository" />
															</ListItem>
														</Link>
													</div>
												</div>
											<div className={"sideMenuCategory"}>
												<span className={"categoryTitle"}>Insights</span>
												<div className={"categoryItems"}>
                          <Link style={{textDecoration: 'none'}} to="/insights">
                            <ListItem className={"itemContent"} button key="insights">
                                <ListItemIcon className={"itemIcon"}><TrendingUpIcon /></ListItemIcon>
                                <ListItemText className={"itemText"} primary="Insights Panel" />
                            </ListItem>
                          </Link>
                        </div>
                      </div>
											<div className={"sideMenuCategory"}>
												<span className={"categoryTitle"}>Account</span>
												<div className={"categoryItems"}>
                          {
                            currentUser && currentUser.roleType === 'ROLE_ADMIN' && (
                              <Link style={{textDecoration: 'none'}} to="/Admin">
                                <ListItem className={"itemContent"} button key="admin">
                                    <ListItemIcon className={"itemIcon"}><BuildIcon /></ListItemIcon>
                                    <ListItemText className={"itemText"} primary="Admin Panel" />
                                </ListItem>
                              </Link>
                            )
                          }
													{currentUser && currentUser.internal && (
														<ListItem className={"itemContent"} button key="changePassword" onClick={this.openShowPasswordDialog.bind(this)}>
															<ListItemIcon className={"itemIcon"}><LockIcon /></ListItemIcon>
															<ListItemText className={"itemText"} primary="Change Password" />
														</ListItem>
													)}
                          <ListItem className={"itemContent"} button key="logout" onClick={logout}>
                              <ListItemIcon className={"itemIcon"}><ExitIcon /></ListItemIcon>
                              <ListItemText className={"itemText"} primary="Logout" />
                          </ListItem>
                        </div>
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
                </Drawer>
            </IconButton>
							{<ChangePasswordDialog isOpen={showChangePasswordDialog} onClose={this.onCloseShowPasswordDialog.bind(this)} />}
            </div>
        )
    }
}
export default SideMenu;
