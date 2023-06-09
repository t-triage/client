import React, { Component } from "react"
import axios from 'axios'
import { logout } from './Main/Components/Globals'
import ReactDOM from "react-dom"
import Api from './Main/Components/Api'
import { Switch, Route, Router, Redirect } from "react-router-dom"
import history from "./Main/Components/History"
import JiraConnect from "./Main/Components/JiraConnect"

import Main from "./Main"
import Insights from "./Insights"
import Admin from "./Admin"
import Inbox from "./Main/Inbox"
import "./styles/app.scss"
import IssueList from "./Main/IssueList"
import AutomationIssueList from "./Main/AutomationIssueList"
import TestRepository from "./Main/TestRespositoryPage/TestRepository"
import AutomatedTestRepository from "./Main/AutomatedTestRepository"
import TestRuns from "./Main/TestRuns"
import Triage from "./Main/Triage"
import Pipeline from "./Main/Pipeline"
import PipelineKanban from "./Main/PipelineKanban"
import Login from "./Main/Login"
import NotFound from "./Main/NotFound"
import TermsAndConditions from "./Main/TermsAndConditions"
import Health from "./Main/Health"
import Product from "./Admin/Product"
import Milestones from "./Admin/Milestones"
import Connector from "./Admin/Connectors"
import Container from "./Admin/Containers"
import Properties from "./Admin/Properties"
import Users from "./Admin/Users"
import License from "./Admin/License"

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"

import blue from "@material-ui/core/colors/blue"
import red from "@material-ui/core/colors/red"
import Success from "./Main/Components/Success";
import Logs from "./Admin/Logs"


const theme = createMuiTheme({
    palette: {
        primary: blue,
        secondary: red,
    },
    typography: {
        fontFamily: [
            'Open Sans',
            "Roboto",
            "sans-serif"
        ]
    },
    props: {
        MuiPaper: {
            square: true
        }
    },
    overrides: {
        MuiPaper: {
            rounded: {
                borderRadius: 5
            },
            root: {
                boxShadow: "2px 3px 5px -1px rgba(0,0,0,0.12) !important"
            }
        },
        MuiTableCell: {
            root: {
                borderBottom: "1px solid rgba(224, 224, 224, 0.5)"
            }
        },
        MuiButton: {
            root: {
                borderRadius: 0
            },
            contained: {
                boxShadow: "2px 3px 5px -1px rgba(0,0,0,0.12) !important"
            }
        }
    }
})

class App extends Component {
    constructor(props) {
        super(props)
        let tokenReg = /&?token=([A-Za-z0-9\._-]*)/
        let token = this.props.location.search.match(tokenReg)
        if (token && !!token[1]) {
            localStorage.setItem("auth", token[1])
            localStorage.setItem("tokenType", "Bearer")
            // history.push(window.location.href.replace(tokenReg,''))
        }
        this.state = {
            isLogged: Boolean(localStorage.getItem("auth")),
            isConfigLoaded: false,
            showCookieBanner: false, // TODO hide until we define whether or not to use cookies
            agreedTermsConditions: false,
            productsAmountLoaded: false,
            isInitialized: true,
        }
    }
    setIsLogged = isLogged => this.setState({isLogged: isLogged})
    setAgreedTermsConditions = agreedTermsConditions => this.setState({agreedTermsConditions})

    componentWillMount() {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem("auth")}`
        if (!!process.env.CONFIG) {
            window.config = process.env.CONFIG;
            this.setState({isConfigLoaded: true})
					  this.fetchGoogleUAProp()
				} else {
            axios.get("/config").then(res => {
                window.config = res.data;
                this.setState({isConfigLoaded: true})
							  this.fetchGoogleUAProp()
						})
				}
    }

    fetchGoogleUAProp() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetGoogleUA)
        .then(res => {
					localStorage.setItem("googleUA", res.data)

          var script= document.createElement('script')
          script.src = `https://www.googletagmanager.com/gtag/js?id=${res.data}`
          script.setAttribute('async', '')
          document.head.prepend(script)

					var script2= document.createElement('script')
					var inlineScript = document.createTextNode(`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());	gtag('config', '${localStorage.getItem('googleUA')}');`);
					//var inlineScript = document.createTextNode(`window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date; ga('create', '${localStorage.getItem('googleUA')}', 'auto'); ga('send', 'pageview');`);

					script2.appendChild(inlineScript);
					script2.setAttribute('async', '')
					document.head.append(script2)
        })
    }

    fetchBuildData() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.BuildInfo)
      .then(res => {
        sessionStorage.setItem("buildInfo", JSON.stringify(res.data))
      })
    }

    fetchCurrentUser() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetCurrentUser)
      .then(res => {
        sessionStorage.setItem("currentUser", JSON.stringify(res.data))
				this.setAgreedTermsConditions(true)
      })
    }

    hideCookieBanner() {
      this.setState({
        showCookieBanner: false,
      })
		}
		
		fetchProductAmount() {
      if (!this.state.productsAmountLoaded)
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProductsAmount)
          .then(res => {
            if (res.data == 0)
              this.setState({
                isInitialized: false,
                productsAmountLoaded: true,
              })
            else
              this.setState({
                productsAmountLoaded: true,
              })
          })
		}

    render() {
        let currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
        // Set axios interpectors
        axios.interceptors.response.use(function (response) {
          // Do something with response data
          return response;
        }, function (error) {
          // Do something with response error
          if (error.response.status === 401) {
            logout()
          } else {
            return Promise.reject(error);
          }
        });
        return(
            <MuiThemeProvider theme={theme}>
                {(()=>{
                    if (this.state.isConfigLoaded) {
                        if (this.state.isLogged) {
                          this.fetchBuildData()
                          this.fetchProductAmount()
                          if (currentUser) {
                            if (currentUser.agreedTermsConditions) {
                              if (this.state.productsAmountLoaded)
                                return(
                                    <Switch>
                                        <Route exact path="/" render={this.state.isInitialized ? 
                                          () => <Redirect to="/SuiteList" /> :
                                          () => <Redirect to={{pathname: "/Admin", state: {showSetup: true}}} />} />
                                        <Route exact path="/v1/info/health" component={Health} />
                                        <Route exact path="/AutomationIssues/:suiteName/" component={AutomationIssueList} />
                                        <Route exact path="/AutomationIssues" component={AutomationIssueList} />
                                        <Route exact path="/AutomationCreation" component={AutomationIssueList} />
                                        <Route exact path="/Issues" component={IssueList} />
                                        <Route path="/Test/:testId/Triage" component={Main} />
                                        <Route path="/SuiteList/Container/:containerID/" component={Main} />
                                        <Route path="/SuiteList/:suiteID/Kanban" component={Main} />
                                        <Route path="/SuiteList" component={Main} />
                                        <Route exact path="/AutomatedTestRepository" component={AutomatedTestRepository} />
                                        <Route path="/PipelineList/:pipelineID/Kanban" component={Pipeline} />
                                        <Route exact path="/PipelineList/Container/:containerID/" component={Pipeline}  />
                                        <Route path="/Test/:testId/Pipeline" component={Pipeline} />
                                        <Route path="/PipelineList" component={Pipeline} />
                                        <Route path="/TestRepository" component={TestRepository} />
                                        <Route path="/TestRuns/Run/:planId" component={TestRuns} />
                                        <Route path="/TestRuns" component={TestRuns} />
                                        <Route path="/Admin/Products" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                            () => <Product/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/Milestones" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Milestones/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/Connectors" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Connector/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/Containers" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Container/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/Properties" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Properties/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/Users" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Users/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/License" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <License/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin/Logs" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Logs/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/Admin" render={
                                          currentUser && currentUser.roleType === "ROLE_ADMIN" ?
                                          () => <Product/> : () => <Redirect to="/SuiteList" />
                                        }/>
                                        <Route path="/insights/:navValue?" component={Insights} />
                                        <Route path="/notifications" component={Inbox} />
                                        <Route path="/v1/jiraCode/success" component={Success} />
                                        <Route path="/auth/jira" component={JiraConnect}/>
                                        <Route component={NotFound} />
                                    </Switch>
                                )
                            } else {
                              return <TermsAndConditions fetchCurrentUser={this.fetchCurrentUser.bind(this)} />
                            }
                          } else {
                            this.fetchCurrentUser()
                            return <div>Loading..</div>
                          }
                        } else {
                            // TODO: Change
														// history.pushState({url: "login"}, "login", "/login")
                            if (window.location.pathname == "/v1/info/health") {
                              return <Health />
                            } else {
                              return <Login
                                          setIsLogged={this.setIsLogged}
                                          setAgreedTermsConditions={this.setAgreedTermsConditions}/>
                            }
                        }
                    } else return <div>Loading..</div>
                })()}
                {
                  this.state.showCookieBanner && (
                    <div className="Cookie-Banner-Container">
                        <div className="Cookie-Banner">
                            <div>
                                We use cookies to ensure that we give you the best experience on our website.
                            </div>
                            <Button
                                variant="outlined"
                                className="globalButton"
                                color="primary"
                                onClick={this.hideCookieBanner.bind(this)}
                                style={{
                                  backgroundColor: 'white',
                                  marginLeft: 20,
                                }}>OK</Button>
                        </div>
                    </div>
                  )
                }
            </MuiThemeProvider>
        )
    }
}

ReactDOM.render(
    <Router history={history}>
        <Switch>
            <Route component={App} />
        </Switch>
    </Router>, document.getElementById('app')
)
