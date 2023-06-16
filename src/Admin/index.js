import React, { Component } from "react"
import * as _  from "underscore"
import Api from "../Main/Components/Api"
import axios from 'axios'

import "../styles/admin.scss"

import Product from "./Product"
import Milestone from "./Milestones"
import Connectors from "./Connectors"
import Containers from "./Containers"
import Properties from "./Properties"
import Users from "./Users"
import License from "./License"
import Setup from "./Setup"
import CopyrightFooter from "../Main/Components/CopyrightFooter"

// UI Components
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Paper from "@mui/material/Paper"
import Switch from "@mui/material/Switch"
import Tooltip from "@mui/material/Tooltip"
import HelpIcon from "@mui/icons-material/Help"
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import {renderTableWithItems} from '../Main/Components/TriageUtils';
import {WIKI_URL} from "../Main/Components/Globals";

var NavValues = ["back", "products", "milestones", "ci connectors", "ci containers", "properties", "users", "license", "wizard"]


export default class Admin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            navValue: 1,
            showVideo: false,
            helpEnabled: false,
            showSetup: false,
            expiredLicense: false,
            loading: true,
        }
        
        this.helpRef = React.createRef();
	}

    componentDidMount() {
      document.title = "t-Triage - Admin Panel"
    }

    componentWillMount() {
        let urlNavValue = this.props.match.params.navValue;
        let showSetup = !!this.props.location.state ? this.props.location.state.showSetup : false;
        let wizardIndex = NavValues.findIndex(x => x == "wizard")
        
        if (!!showSetup) {
            this.setState({
                showSetup: true,
                navValue: wizardIndex,
            })
        } else {
            if (!!urlNavValue ) {
                let found = false
                for (let i = 1; i< NavValues.length; i++) {
                    if (urlNavValue == NavValues[i]) {
                        if (urlNavValue == "wizard")
                            this.setState({navValue: i, showSetup: true})
                        else
                            this.setState({navValue: i, showSetup: false})
                        history.pushState({url: NavValues[i]}, NavValues[i], "/admin/"+NavValues[i])
                        found = true
                        break
                    }
                }
                if (!found)
                    history.pushState({url: NavValues[0]}, NavValues[0], "/admin/"+NavValues[0])
            }

            this.enableSetup();
        }

        this.fetchLicense();
    }

    fetchLicense() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.CheckLicenseExpiry)
            .then(res => {
                this.setState({
                    expiredLicense: res.data,
                    loading: false,
                })
            })
    }

    enableSetup() {
        let { showSetup } = this.state;
        let wizardIndex = NavValues.findIndex(x => x == "wizard")

        if (!showSetup)
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProductsAmount)
                .then(res => {
                    if (res.data == 0)
                        this.setState({
                            showSetup: true,
                            navValue: wizardIndex,
                        })
                })
    }

	onHelpClick = filter => {
		let value = this.state[filter]
		this.setState({
			[filter]: !value
		})
	}

    changeTab = (ev, value) => {
        if (value !== undefined) {
            if (value === 0) {
                window.location = '/SuiteList'
            } else {
                if (value !== NavValues.length) {
                    this.setState({navValue: value})
                    history.pushState({url: NavValues[value]}, NavValues[value], "/admin/" + NavValues[value])
                }
            }
        }
    }

    renderCurrentTab = () => {
        switch (this.state.navValue) {
            case 1:
                return <Product />
            case 2:
                return <Milestone />
            case 3:
                return <Connectors />
            case 4:
                return <Containers />
            case 5:
                return <Properties />
            case 6:
                return <Users />
            case 7:
                return <License reloadLicense={this.fetchLicense.bind(this)}/>
            case 8:
                return <Setup />
        }
    }

    getAdminHelpPage(ev) {
      let url = ''
      switch (this.state.navValue) {
        case 1:
          url = WIKI_URL + 'docs/DOC-6975#jive_content_id_Products'
          break;
        case 2:
          url = WIKI_URL + 'docs/DOC-6975#jive_content_id_Milestones'
          break;
        case 3:
          url = WIKI_URL + 'docs/DOC-6975#jive_content_id_CI_Connectors'
          break;
        case 4:
          url = WIKI_URL + 'docs/DOC-6975#jive_content_id_CI_Containers'
          break;
        case 5:
          url = WIKI_URL + 'docs/DOC-6975#jive_content_id_Properties'
          break;
        case 6:
          url = WIKI_URL + 'docs/DOC-6975#jive_content_id_Users'
          break;
      }

      return url;
    }

    renderLicenseNotification = () => {
        let message = "The license is expired, please contact support\xa0";
        let email = (
            <a href="mailto:info@ttriage.com">
                info@ttriage.com
            </a>
        )

        return (
            <div className="CenterList">
                <div className="Containers-Form">
                    <Paper>
                        {/* Aplicar estilos usando clases en vez de usar inline style */}
                        <div style={{marginTop: "20px", padding: "16px", display: "flex", alignItems: "center", color: "#f00000"}}>
                            <ErrorIcon color="secondary" style={{marginRight:"16px"}}/>
                            {message} {email}
                        </div>
                    </Paper>
                </div>
            </div>
        )
    }

    renderNavTabs = () => {
        let { helpEnabled, showSetup } = this.state;
        let tabs = []
        let helpEl = null;
        
        for (let i = 0; i< NavValues.length; i++) {
            tabs.push(<Tab label={NavValues[i]} key={i} disabled={NavValues[i] == "wizard" && !showSetup} />)
        }

		helpEl = (
            <Tooltip key={helpEl} title={!helpEnabled ? "Enable help" : "Disable help"}>
            <div ref={this.helpRef}>
                <Switch
                checked={helpEnabled}
                icon={<HelpIcon className={"helpUncheckedIcon"} />}
                checkedIcon={<HelpIcon className={"helpCheckedIcon"} />}
                onChange={() => this.onHelpClick("helpEnabled")}
                value="helpEnabled"
                color="primary"
                />
            </div>
            </Tooltip>
        )

		tabs.push(helpEl);

        return tabs
    }

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

    getHelpItems() {
        let items, goalText, actionText, videoUrl;

        goalText = 'Configure admin settings';
        videoUrl = 'https://youtu.be/-QOtcgSzraU';

        items = [
            [
                {
                    title: 'PAGE GOAL',
                    text: goalText
                },
                {
                    title: 'DOCUMENTATION',
                    text: `Detailed documentation <a target="_blank" href=${this.getAdminHelpPage()}>HERE</a>`
                },
                {
                    title: null,
                    text: null,
                    videoURL: videoUrl
                }
            ]
        ]

        return items;
    }

    render() {
        let { helpEnabled, showVideo, navValue, expiredLicense, loading } = this.state;
        
        let helpItems = this.getHelpItems();

        return(
            <div className="homeRoot">
                <main style={{ minHeight: 'calc(100% - 30px)' }}>
                    <Paper>
                        <nav className={`nav adminNav ${helpEnabled ? 'helpEnabled' : ''}`}>
                            <Tabs
                                value={this.state.navValue}
                                onChange={this.changeTab}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="fullWidth"
                            >
                                {this.renderNavTabs()}
                            </Tabs>
                            {renderTableWithItems(this.helpRef, helpEnabled, helpItems, true, null, null, 'left-end', showVideo,  this.onShowVideo.bind(this),  this.onCloseVideo.bind(this))}
                        </nav>
                    </Paper>
                    {loading ? 
                        <div className="circularProgressContainer">
                            <CircularProgress color="primary" />
                        </div>
                    :
                        (NavValues[navValue] != "wizard" && expiredLicense && this.renderLicenseNotification())
                    }
                    {this.renderCurrentTab()}
                </main>
                <CopyrightFooter helpEnabled={ helpEnabled } />
            </div>
        )
    }
}
