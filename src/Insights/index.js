import React, { Component } from "react"
import axios from 'axios'
import "../styles/insights.scss"

import InsightsBox from './InsightsBox'
import {COLORS, GITBOOK_URL} from '../Main/Components/Globals'

import SideMenu from "../Main/Components/SideMenu"
import CopyrightFooter from "../Main/Components/CopyrightFooter"
import Api from "../Main/Components/Api"
import Grid from "@mui/material/Grid"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import AppBar from "@mui/material/AppBar"
import HelpIcon from "@mui/icons-material/Help"

import Nav from "../Main/Components/Nav"
import ProductHealth from './category/ProductHealth'
import Commits from './category/Commits'
import Teamwork from './category/Teamwork'
import AutomationEngine from './category/AutomationEngine'
import PersonalInsights from './category/PersonalInsights'
import TrendGoals from "./category/TrendGoals";
import ComponentTriages from "./category/ComponentTriages";
import ManualTest from "./category/ManualTest";

var NavValues = ["personal insights", "product health", "component triages", "teamwork", "automation engine", "commits", "trend goals"," Manual Test"]

export default class Insights extends Component {

  constructor(props) {
    super(props)
    this.userboxData = {
        userfullname: "Default User",
        myAssignedTestsNumber: 4,
        myAssignedIssuesNumber: 4
    }
    this.state = {
      uniqueTests: 0,
      triagedFails: 0,
      savedTime: 0,
      achievedDeadlines: 0,
			helpEnabled: false,
			currentUser: null,
      navValue: 0,
    }
		this.helpItems= [
		    [
                {
                    title: 'PAGE GOAL',
                    text: 'Analytics, insights'
                },
                {
                    title: 'USER ACTION',
                    text: 'Take a minute to think and improve processes.'
                },
                {
                    title: 'DOCUMENTATION',
                    text: `Detailed documentation <a target="_blank" href=${GITBOOK_URL + "docs/user-guide/insights"}>HERE</a>`
                },
                {
                    title: null,
                    text: null,
                    videoURL: 'https://youtu.be/9_E2M91eq1k'
                }
            ]
        ];
  }

	onHelpClick = filter => event => {
		let value = this.state[filter]
		this.setState({
			[filter]: !value
		})
	}

  componentDidUpdate() {
    let {currentUser} = this.state
    if (!currentUser || currentUser === {}) {
      this.getCurrentUser()
    }
  }

  getCurrentUser() {
    this.setState({
      currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
    })
  }


  componentWillMount() {
    document.title = "t-Triage - Insights"
    let urlNavValue = this.props.match.params.navValue

    if (!!urlNavValue) {
        let found = false
        for (let i = 1; i< NavValues.length; i++) {
            if (urlNavValue == NavValues[i]) {
                this.setState({navValue: i})
                history.pushState({url: NavValues[i]}, NavValues[i], "/insights/"+NavValues[i].replace(" ", "-"))
                found = true
                break
            }
        }
        if (!found)
            history.pushState({url: NavValues[0]}, NavValues[0], "/insights/"+NavValues[0].replace(" ","-"))
    }

    // Individual boxes
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetUniqueTests )
        .then(res => {
            this.setState({ uniqueTests: res.data })
        })
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTotalAutomationFixed )
        .then(res => {
            this.setState({ triagedFails: res.data })
        })
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetTotalSavedTime )
        .then(res => {
            this.setState({ savedTime: res.data })
        })
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetDeadlinesCompleted )
        .then(res => {
            this.setState({ achievedDeadlines: res.data })
        })
    this.getCurrentUser()
  }

  changeTab = (ev, value) => {
      this.setState({ navValue: value})
      history.pushState({url: NavValues[value]}, NavValues[value], "/insights/"+NavValues[value].replace(" ", "-"))
  }

  validateNav = (navValue) => {
    if (navValue == 'trend-goals')
      return false
    else
      return true
  }

  renderNavTabs = () => {
      let tabs = []
      for (let i = 0; i< NavValues.length; i++)
          tabs.push(<Tab label={NavValues[i]} key={i} disabled={!this.validateNav(NavValues[i])}/>)
      return tabs
  }

  renderCurrentTab = () => {
      switch (this.state.navValue) {
          case 0:
              return <PersonalInsights />
          case 1:
              return <ProductHealth />
          case 2:
              return <ComponentTriages />
          case 3:
              return <Teamwork />
          case 4:
              return <AutomationEngine />
          case 5:
              return <Commits />
          case 6:
              return <TrendGoals />

          case 7:
              return <ManualTest />

      }
  }

  render() {
    let {
      testSummary,
      totalSummary,
      failExceptions,
      totalFailExceptions,
      uniqueTests,
      triagedFails,
      savedTime,
      achievedDeadlines,
			helpEnabled,
      currentUser,
      navValue,
    } = this.state;

    return (
      <div className="homeRoot">
				<Nav
					helpEnabled={helpEnabled}
					helpItems={this.helpItems}
					screen={'insights'}
          title={'Insights'}
					onHelpClick={this.onHelpClick.bind(this)}
				/>
        <main className='chartMainSection' style={{ marginTop: helpEnabled ? 250 : 111 }}>
          <Grid
              container
              spacing={24}>
              <Grid item xs={12} sm={6} md>
                <InsightsBox
                    title='Unique Tests'
                    color={COLORS.yellow}
                    color1={COLORS.yellowLight}
                    value={uniqueTests}
                    help={'Unique Test Cases in the System. Uniqueness is identified by test name and suite name.'}
                    icon='assignment' />
              </Grid>
              <Grid item xs={12} sm={6} md>
                <InsightsBox
                    title='Automation Fixed'
                    color={COLORS.red}
                    color1={COLORS.redLight}
                    value={triagedFails}
                    help={'Automation Fixed is the historic value of all the automation issues that has been fixed.'}
                    icon='bugreport' />
              </Grid>
              <Grid item xs={12} sm={6} md>
                <InsightsBox
                    title='Saved Time'
                    color={COLORS.blue}
                    color1={COLORS.blueLight}
                    value={savedTime}
                    help={'The hours saved to the Automator by avoiding unnecessary triages, i.e. calculated upon the number of performed automatic triages.'}
                    icon='timer' />
              </Grid>
              <Grid item xs={12} sm={6} md>
                <InsightsBox
                    title='Achieved Deadlines'
                    color={COLORS.green}
                    color1={COLORS.greenLight}
                    value={achievedDeadlines}
                    help={'The amount of Test Suites analyzed before the deadline in a week.'}
                    icon='check-circle' />
              </Grid>
          </Grid>
          <div className="insightsTabsBar">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Tabs
                      value={navValue}
                      className="insightsTabs"
                      onChange={this.changeTab}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="scrollable"

                  >
                      {this.renderNavTabs()}
                  </Tabs>
              </div>
          </div>
          {this.renderCurrentTab()}
        </main>
        <CopyrightFooter helpEnabled={helpEnabled} />
      </div>
    )
  }
}
