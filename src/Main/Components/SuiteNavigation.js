import React, { Component } from "react"
import axios from 'axios'
import { Link } from 'react-router-dom'

import SearchUI from "./SearchUI"
import Api from "./Api"

// Icons
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import FolderIcon from "@material-ui/icons/Folder"
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown"
import SentimentDissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied"

// UI Components
import Grid from "@material-ui/core/Grid"
import Select from "@material-ui/core/Select"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import List from "@material-ui/core/List"
import MenuItem from "@material-ui/core/MenuItem"
import ListItemText from "@material-ui/core/ListItemText"
import LinearProgress from "@material-ui/core/LinearProgress"
import Globals from "./Globals"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import InputBase from "@material-ui/core/InputBase"
import { withStyles } from '@material-ui/core/styles'
import { styles } from './Globals'

const BootstrapInput = withStyles(theme => ({
  input: {
    border: 'none',
  },
}))(InputBase);

class SuiteNavigation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentContainer: 0,
            containers: [],
            selectedContainerID: this.props.containerID,
            isContainersExpanded: false,
            isContainerLoaded: false,
            fetchError: null
        }
    }

    componentDidMount() {
        this.fetchContainers()
    }

    fetchContainers = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetContainerList)
            .then(res => {
                let {data} = res
                var index = data.content.findIndex(cont => cont.id === parseInt(this.state.selectedContainerID))
                let content = index != -1 ? data.content[index] : data.content[0]
                this.setState({
                    containers: data.content,
                    currentContainer: index !== -1 ? index : 0,
                    isContainerLoaded: true
                })
                this.props.updateFilter(content.id)
            })
            .catch(err => {
                this.props.nothingToShow(true)
                this.setState({fetchError: err})
            })
    }

    selectContainer = (ev, target) => {
        let {value} = ev.target
        let container = this.state.containers[value]
        this.setState({currentContainer: value})
        this.props.updateFilter(value !== 'all' ? container.id : 'all')
    }

    toggleContainer = () => {
        this.setState({isContainersExpanded: !this.state.isContainersExpanded})
    }

    getContainers = () => {
        const { classes } = this.props

        let toRender = []
        toRender.push(
          <MenuItem
              value={'all'}
              key={'all'}
              className="suiteNavigationContainerOption">
              <ListItemAvatar style={{ position: 'absolute' }}>
                  <Avatar>
                      <FolderIcon />
                  </Avatar>
              </ListItemAvatar>
              <div style={{paddingLeft: 55}}>
                <div className="suiteNavigationListOption">All</div>
              </div>
          </MenuItem>
        )
        this.state.containers.map((container, index) => {
            let name = container.productName ? `${container.productName}: ${container.name}` : container.name
            toRender.push(
              <MenuItem
                  value={index}
                  key={index}
                  className="suiteNavigationListContainer">
                  <ListItemAvatar style={{ position: 'absolute' }}>
                      <Avatar>
                          <FolderIcon />
                      </Avatar>
                  </ListItemAvatar>
                  <div style={{paddingLeft: 55}}>
                    <div className="suiteNavigationListOption">{name}</div>
                    { container.loggedOwner ?
                      <Tooltip title="Own by you" classes={{tooltip: classes.tooltip, popper: classes.popper}}>
                        <strong style={{color: "rgb(144, 144, 144)", margin: 0, fontSize: 13}}>Pending: {container.pendingBuildTriages} Suites</strong>
                      </Tooltip>
                      :
                      <p style={{color: "rgb(144, 144, 144)", margin: 0, fontSize: 13}}>Pending: {container.pendingBuildTriages} Suites</p>
                    }
                  </div>
              </MenuItem>
            )
        })

        if (this.state.isContainerLoaded) {
            return (
                <Select
                    className="containerListContainer"
                    autoWidth={true}
                    input={<BootstrapInput />}
                    IconComponent={KeyboardArrowDown}
                    renderValue={(value) => {
                      let container = this.state.containers[value]
                      let name = 'All'
                      if (container) {
                        name = container.productName ? `${container.productName}: ${container.name}` : container.name
                      }
                      return (
                        <div id="containerName" className="containerName">
                            <FolderIcon color="primary" style={{ marginRight: 10 }} />
                            {name}
                        </div>
                      )
                    }}
                    value={this.state.currentContainer}
                    onChange={this.selectContainer.bind(this)}>
                    { toRender }
                </Select>
            )
        }
    }

    render() {
        let {containers} = this.state
        if (this.state.isContainerLoaded) {
          if (containers && containers.length > 0) {
            if (this.props.triageStage == Globals.TriageStage.SUITELIST)
              return (
                <>
                  <h5 style={{padding: "10px 10px 0 38px", marginTop: 20}}>Backlog</h5>

                  <Grid container>
                      <Grid item xs={12} md={6}>
                          <div className="containerSelect">{this.getContainers()}</div>
                      </Grid>
                      <Grid item xs={12} md={6} className='SearchUIContainer'>
                          <SearchUI
                              filterSelected={this.props.filterSelected.bind(this)}
                              sort={true}
                              triageStage={this.props.triageStage}
                              containerID={this.props.containerID}
                              placeHolder="What suite are you looking for?" />
                      </Grid>
                  </Grid>
                </>
              )
          }
        } else {
          return ""
        }

        if (this.state.fetchError)
            return (
              <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: 'calc(100% - 206px)' }} >
                <h2 className="noRowsSuites" style={{ display: 'flex', alignItems: 'center',marginTop: 0 }}>
                  {"There is nothing to show."}
                  <SentimentDissatisfiedIcon style={{ color: 'rgba(0, 0, 0, 0.54)', marginLeft: 5 }} />
                </h2>
                <h2 className="noRowsSuites">
                    <Link style={{textDecoration: 'none', color: 'inherit', fontWeight: 'bold'}} to={`/admin`}>
                      {`Please review your configuration on the admin panel`}
                  </Link>
                </h2>
              </div>
            )

        return <LinearProgress />
    }
}
export default withStyles(styles)(SuiteNavigation)
