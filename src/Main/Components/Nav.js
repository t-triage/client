import React, { Component } from "react"
import Api from './Api'
import axios from 'axios'
import Globals, { styles, BOARD_ACTIVITY_TYPE_ICONS } from "./Globals"
import SideMenu from "./SideMenu"
import TTriageLogo from "../../images/ttriage_greylogo.png"
import { getTimeAgo, renderPopoverWithItems, renderTableWithItems } from './TriageUtils'
import { Link } from "react-router-dom";

// Colors
import Blue from "@material-ui/core/colors/blue"

// Icons
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"
import HelpIcon from "@material-ui/icons/Help"
import ExploreOutlinedIcon from '@material-ui/icons/ExploreOutlined';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';

// Components
import Tooltip from "@material-ui/core/Tooltip"
import Popover from "@material-ui/core/Popover"
import Switch from "@material-ui/core/Switch"
import IconButton from "@material-ui/core/IconButton"
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import { _ } from 'underscore';
import { COLORS } from './Globals'

class Nav extends Component {

	constructor(props) {
		super(props)
		this.userboxData = {
			userfullname: "Default User",
			myAssignedTestsNumber: 4
		}
		this.state = {
			activityListElement: null,
			arrowRef: null,
			showVideo: false,
			recentActivities: [],
			notifications: 0,
		};
		this.arrowRef = React.createRef();
		this.titleRef = React.createRef();
		this.helpRef = React.createRef();
	}

	componentDidMount() {
		axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUsersActivities)
			.then(res => {
				this.setState({
					recentActivities: res.data
				})
			})
		this.fetchNotifications();
	}

	componentDidUpdate(prevProps, prevState) {
		let notifications = localStorage.getItem("unseenNotifications")
		if (prevState.notifications != notifications)
			this.setState({
				notifications: notifications
			})
	}

	fetchNotifications = () => {
		axios.get(Api.getBaseUrl() + Api.ENDPOINTS.NotificationsCount)
			.then(res => {
				localStorage.setItem("unseenNotifications", res.data)
				this.setState({
					notifications: res.data
				})
			})
	}

	getTitle() {
		const { screen, title } = this.props;
		let content = title;

		switch (screen) {
			case 'main':
				content = <img src={TTriageLogo} style={{
					width: 100,
					height: 36,
					marginTop: 6,
				}} />
				break;
			default:
				break;
		}

		return content;
	}

	trimText = (text, len) => (text.length > len) ? text.substring(0, len) + "..." : text


	openActivityList = event => {
		this.setState({
			activityListElement: event.currentTarget
		})
	}

	closeActivityList = event => {
		this.setState({
			activityListElement: null
		})
	}

	handleArrowRef = node => {
		this.setState({
			arrowRef: node,
		});
	};

	onShowVideo() {
		this.setState({
			showVideo: true,
		})
	}

	onCloseVideo() {
		this.setState({
			showVideo: false,
		})
	}

	render() {
		let { activityListElement, recentActivities, showVideo, notifications } = this.state;
		const { classes, helpEnabled, helpItems, screen } = this.props;
		let isMainScreen = screen === 'main';
		let isPipeScreen = screen === 'pipeline';
		const ArrowItem = props => {
			let color = ((this.props.triageStage || this.props.pipeStage) === props.applyToStage) ? Blue[500] : "#BEBEBE"
			let kanbanData = isPipeScreen ? localStorage.getItem("pipelinekanbanData") :localStorage.getItem("kanbanData")
			return (
				<div style={{
					display: "flex",
					alignItems: "center",
					marginTop: "0.1rem",
					fontSize: "1.7rem"
				}}>
					<KeyboardArrowRight style={{ padding: "0 15px", fontSize: "2rem", color: color }} />
					{props.applyToStage == Globals.TriageStage.KANBAN ?
						<div className="navLink" style={{ color: color }}
							onClick={
								this.props.goToKanban.bind(this, this.props.selectedSuite, kanbanData ? false : true)
							}>{props.children}</div>
						: props.applyToStage == Globals.PipeStage.PIPELINEKANBAN ?
							<div className="navLink" style={{ color: color }}
								onClick={
									this.props.goToKanban.bind(this, this.props.selectedPipeline, kanbanData ? false : true)
								}>{props.children}</div>
							: <div style={{ color: color }}>{props.children}</div>}
				</div>
			)
		}
		return (
			<header style={{ position: 'fixed', top: 0, zIndex: 1000, width: '100%', backgroundColor: '#F6F6F6' }}>
				<nav className="navBar">
					<div className={'navOptionsContainer'}>
						<div ref={this.titleRef} style={{ display: "flex", alignItems: "center" }}>
							<SideMenu selectedContainerID={isMainScreen ? this.props.selectedContainerID : null} />
							<div style={{ display: "flex", alignItems: 'center' }}>
								<div className="WorkSpaceText WorkSpaceTextContainer"
									onClick={(isMainScreen || isPipeScreen) ? this.props.goBackToList.bind(this, this.props.selectedContainerID)
										: isPipeScreen ? this.props.goBackToList.bind(this, this.props.selectedContainerID)
											: this.props.onTitleClick}>
									{this.getTitle()}
								</div>

								{this.props.extraContent}

								{(isMainScreen && this.props.triageStage && this.props.triageStage !== Globals.TriageStage.SUITELIST) ?
									<ArrowItem applyToStage={Globals.TriageStage.KANBAN}>Kanban</ArrowItem> : ""}
								{(isMainScreen && this.props.triageStage && this.props.triageStage === Globals.TriageStage.TRIAGE) ?
									<ArrowItem applyToStage={Globals.TriageStage.TRIAGE}>Test</ArrowItem> : ""}
								{(isPipeScreen && this.props.pipeStage && this.props.pipeStage !== Globals.PipeStage.PIPELINELIST) ?
									<ArrowItem applyToStage={Globals.PipeStage.PIPELINEKANBAN}>Kanban</ArrowItem> : ""}
									{(isPipeScreen && this.props.pipeStage && this.props.pipeStage === Globals.PipeStage.TRIAGE) ?
									<ArrowItem applyToStage={Globals.PipeStage.TRIAGE}>Test</ArrowItem> : ""}
							</div>
						</div>
						{/* Si se puede, usar clases en vez de inline styles en elementos html */}
						<div ref={this.helpRef} style={{ display: 'flex', textAlign: "right" }}>
							<div style={{marginTop: 12, marginRight: 32}}>
								<Link to="/notifications">
									<Badge badgeContent={notifications} color="secondary">
										{this.props.screen === "notifications" ?
											<NotificationsIcon />
											:
											<NotificationsNoneIcon />
										}
									</Badge>
								</Link>
							</div>
							<div>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										fontSize: "small",
										padding: "0 4px",
										cursor: "pointer",
										backgroundColor: "transparent",
										width: "auto"
									}}
								>
									<Tooltip
										title={"RECENT ACTIVITY"}
										classes={{
											tooltip: classes.tooltip,
											popper: classes.popper,
										}} >
										<div>
											<IconButton
												onClick={this.openActivityList}
												color="primary">
												<ExploreOutlinedIcon />
											</IconButton>
										</div>
									</Tooltip>
									<label style={{ color: COLORS.greyDark, marginRight: '15px' }} >
										RECENT ACTIVITY
														</label>
								</div>
								<Popover
									id="activityList"
									anchorEl={activityListElement}
									open={Boolean(activityListElement)}
									onClose={this.closeActivityList}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'center',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'center',
									}}
									style={{ marginTop: 10, maxHeight: '70%', minWidth: 100, zIndex: 9999 }}
								>
									<div className="boardActivities">
										<h6 className={"activitiesTitle"}>Recent Activity</h6>
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											{recentActivities.map((activity, index) => {

												let timeAgo = getTimeAgo(activity.eventTime);
												let boardActivity = _.find(BOARD_ACTIVITY_TYPE_ICONS, { type: activity.type });
												if (!boardActivity) {
													boardActivity = _.find(BOARD_ACTIVITY_TYPE_ICONS, { type: 'DEFAULT' });
												}

												return (
													<div key={index} className={`activityContainer ${!timeAgo.isToday ? 'opacity' : ''}`}>
														<div className={"activityText"}>
															{boardActivity && boardActivity.icon}
															<span>{activity.text}</span>
														</div>
														{timeAgo &&
															<div className={"activityTimeAgo"}><span>{timeAgo.label}</span></div>
														}
													</div>
												)
											})}
										</div>
									</div>
								</Popover>
							</div>
							<Tooltip title={!helpEnabled ? "Enable help" : "Disable help"}>
								<div>
									<Switch
										checked={helpEnabled}
										icon={<HelpIcon className={"helpUncheckedIcon"} />}
										checkedIcon={<HelpIcon className={"helpCheckedIcon"} />}
										onChange={this.props.onHelpClick("helpEnabled")}
										value="helpEnabled"
										color="primary"
									/>
								</div>

							</Tooltip>

						</div>
					</div>
					{renderTableWithItems(this.helpRef, helpEnabled, helpItems, true, this.handleArrowRef.bind(this), this.arrowRef, 'left-end', showVideo, this.onShowVideo.bind(this), this.onCloseVideo.bind(this))}

				</nav>
			</header>
		)
	}
}

export default withStyles(styles)(Nav);
