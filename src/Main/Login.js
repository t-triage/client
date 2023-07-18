import React, { Component } from "react"
import Api from "./Components/Api"
import axios from 'axios'

// Icons
import AccountIcon from "@mui/icons-material/Email"
import LockIcon from "@mui/icons-material/Lock"
import ErrorIcon from "@mui/icons-material/Error"
import CloseIcon from "@mui/icons-material/Close"
import QuoteIcon from "@mui/icons-material/FormatQuote"

// Components
import Paper from "@mui/material/Paper"
import InputBase from "@mui/material/InputBase"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Button from "@mui/material/Button"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Grid from "@mui/material/Grid"
import Snackbar from "@mui/material/Snackbar"
import IconButton from "@mui/material/IconButton"

// Temporal until we have a full logo svg
import TTriageLogo from "../images/favicon.png"
import TTriageLogo1 from "../images/ttriage_greylogo.png"

// Login Wrapper
window.originalFetch = window.fetch
window.fetch = function apifetch(uri, data, retry = 5) {
    return originalFetch(uri,
        (data => {
            let _data = data ? data : {}
            if (!_data.hasOwnProperty("headers"))
                _data.headers = {}
            _data.headers.authorization = localStorage.getItem("tokenType") + " " + localStorage.getItem("auth")
            return _data
        })(data)
    )
    .then(res => {
        if (res.status === 401) {
            localStorage.removeItem("auth")
            window.location.replace("/")
        }
        return res
    })
    .catch(err => {
        if (retry === 1)
            throw err
        return apifetch(uri,data,retry-1)
    })
}

export default class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loginErrorSnackbar: false,
            providers: [],
            showInternalLogin: false,
            welcomeMessage: null
        }

        this.quotes = [
            "Application Health in Real Time (X-Ray)",
            "Intelligence in your Automation (IA)",
            "Automation under control",
            "Beyond Pass Fail",
            "False positives under your thumb",
            "Real-time insights on software automation",
            "Verify your software at any scale",
            "QA empowered with Big Data",
            "Optimize Automation for Continuous Delivery",
            "Monitor & Troubleshoot your Test Automation Suite",
            "Maintain continuous delivery healthy",
            "Set your automation priorities and goals",
            "3 Steps to order your Automation Testing process",
            "The more we break it, the better we can make it",
        ]
    }

    componentWillMount() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.InternalUsersEnabled)
        .then(res => {
          this.setState({
            showInternalLogin: res.data,
          }, () => {
            this.getProviders()
          })
        })

        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.WelcomeMessage)
        .then(res => {
          this.setState({
            welcomeMessage: res.data,
          })
        })
    }

    getProviders = () => {
        let providers = []
        if (!!window.config && !!window.config.login) {
            // The order of this array matters on how it's rendered
            if (window.config.login.google)
                providers.push("google")
            if (window.config.login.onelogin)
                providers.push("onelogin")
            if (window.config.login.internal && this.state.showInternalLogin)
                providers.push("internal")
        } else {
            providers.push("internal")
        }
        this.setState({providers: providers})
    }

    internalSignIn = ev => {
        ev.preventDefault()
        let user = {}
        user.email = document.getElementById("email").value.toLowerCase().trim()
        user.password = document.getElementById("password").value
        Api.login(user)
            .then(res => {
                this.props.setIsLogged(true)
                this.fetchCurrentUser()
            })
            .catch(err => {
                console.log(err)
                this.openLoginErrorSnackbar()
            })
    }

    openLoginErrorSnackbar = () => {
        this.setState({ loginErrorSnackbar: true });
    }

    closeLoginErrorSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        let email = document.getElementById("email").value.toLowerCase().trim()
        let password = document.getElementById("password").value
        this.setState({ loginErrorSnackbar: false }, () => {
            document.getElementById("email").value = email
            document.getElementById("password").value = password
        });
      };

    externalSignIn = provider => () => {
        window.location.replace(Api.getBaseUrl()+"/oauth2/authorize/"+provider+"?redirect_uri="+window.location.href)
    }

    fetchCurrentUser() {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetCurrentUser)
      .then(res => {
        sessionStorage.setItem("currentUser", JSON.stringify(res.data))
        this.props.setAgreedTermsConditions(res.data.agreedTermsConditions)
      })
    }

    renderLoginButtons = () => {
        var buttons = []
        this.state.providers.map(provider => {
            if (buttons.length > 0)
                buttons.push(<ListItem style={{ padding: 0 }} key={provider+Math.floor(Math.random()*1000)}><Grid container justifyContent="center" style={{color: "gray", fontSize:"0.8em"}}>OR</Grid></ListItem>)
            if (provider == "internal" && this.state.showInternalLogin) {
                buttons = buttons.concat([<ListItem key={provider+Math.floor(Math.random()*1000)}>
                    <ListItemIcon>
                        <AccountIcon color="primary" fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <InputBase
                            id="email"
                            placeholder="Enter Email"
                            inputProps={{
                              style: { paddingLeft: 10 },
                              onFocus: this.onInputFocus.bind(this),
                            }}
                            fullWidth
                            autoFocus
                        />
                    </ListItemText>
                </ListItem>,
                <ListItem key={provider+Math.floor(Math.random()*1000)}>
                    <ListItemIcon>
                        <LockIcon color="primary" fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <InputBase
                            id="password"
                            type="password"
                            placeholder="Enter Password"
                            inputProps={{
                              style: { paddingLeft: 10 },
                              onFocus: this.onInputFocus.bind(this),
                            }}
                            fullWidth
                        />
                    </ListItemText>
                </ListItem>,
                <ListItem key={provider+Math.floor(Math.random()*1000)}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        id="internalLoginSubmit"
                    >Login</Button>
                </ListItem>])
            }
            else if (provider == "google"){
                buttons.push(<ListItem key={provider}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={this.externalSignIn("google")}
                        style={{
                            textTransform: "none",
                            fontWeight: "bold",
                            fontSize: "1em",
                            color: "white",
                            backgroundColor: "#4285f4",
                            padding: 0,
                        }}
                        id="googleButton"
                    >
                        <div style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                        }}>
                            <div style={{
                                border: "1px solid transparent",
                                backgroundColor: "white",
                                padding: 15
                            }}><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg></div>
                            <div style={{ width: '100%', textAlign: 'center' }}>Sign in with Google</div>
                        </div>
                    </Button>
                </ListItem>)
            }
            else if (provider == "onelogin") {
                buttons.push(<ListItem key={provider}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={this.externalSignIn("onelogin")}
                        id="oneloginButton"
                        style={{
                            textTransform: "none",
                            fontWeight: "bold",
                            fontSize: "1em",
                            color: "white",
                            backgroundColor: "black",
                            padding: 15,
                        }}
                    >Sign in with onelogin</Button>
                </ListItem>)
            }

        })

        return buttons
    }

    onInputFocus(ev) {
      ev.target.select()
    }

    render() {

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Paper className='LoginContainer' style={{
                  padding: "10px 30px",
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginBottom: 20,
                        marginTop: 20,
                    }}>
                        <img src={TTriageLogo} style={{
                            width: 50
                        }}></img>
                        <img src={TTriageLogo1} style={{
                            width: 250
                        }}></img>
                        <div
                            style={{
                                color: "rgba(0, 0, 0, 0.26)",
                                marginTop: 10,
                                display: "flex"
                            }}
                        >
                            <QuoteIcon />
                            <div
                                id="message"
                                style={{
                                    color: "darkgray",
                                    padding: "0.15em 5px"
                                }}
                            >{this.quotes[Math.floor(Math.random() * this.quotes.length)] }</div>
                            <QuoteIcon />

                        </div>
                        <div
                            style={{
                                color: "rgba(0, 0, 0, 0.26)",
                                marginTop: 10,
                                display: "flex"
                            }}
                        >
                            <div
                                id="message"
                                style={{
                                    color: "darkgray",
                                    padding: "0.15em 5px"
                                }}
                            >{<div dangerouslySetInnerHTML={{__html: this.state.welcomeMessage}} />}</div>
                        </div>
                    </div>
                    <form id="loginForm" onSubmit={this.internalSignIn}>
                    <List
                        style={{
                            width: '100%',
                        }}
                    >
                        {this.renderLoginButtons()}
                    </List></form>
                </Paper>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open={this.state.loginErrorSnackbar}
                    autoHideDuration={5000}
                    onClose={this.closeLoginErrorSnackbar}
                    ContentProps={{
                        'aria-describedby': 'login-error'
                    }}
                    message={   <span id="login-error">
                                    <ErrorIcon />
                                    {"Unsuccessful login"}
                                </span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={this.closeLoginErrorSnackbar}
                            size="large">
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </div>
        );
    }
}
