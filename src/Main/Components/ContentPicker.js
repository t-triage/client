import React, { Component } from "react"
import axios from 'axios'
import { Link } from 'react-router-dom'

import SearchUI from "./SearchUI"
import Api from "./Api"

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FolderIcon from "@mui/icons-material/Folder"
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown"
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied"

// UI Components
import Grid from "@mui/material/Grid"
import Select from "@mui/material/Select"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import Avatar from "@mui/material/Avatar"
import List from "@mui/material/List"
import MenuItem from "@mui/material/MenuItem"
import ListItemText from "@mui/material/ListItemText"
import LinearProgress from "@mui/material/LinearProgress"
import Globals from "./Globals"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import InputBase from "@mui/material/InputBase"
import withStyles from '@mui/styles/withStyles';
import { styles } from './Globals'
import TextField from "@mui/material/TextField"

const BootstrapInput = withStyles(theme => ({
    input: {
        border: 'none',
    },
}))(InputBase);

class ContentPicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            containerLoaded:false,
            containers: [],
            selectedPipeline: this.props.selectedPipeline,
        }
    }

    componentDidMount() {
        if(!this.state.containerLoaded){
            this.fetchContainersList()
        }
    }
    selectPipeline = (ev) => {
        this.setState({selectedPipeline: ev.target.value})
        if(ev.target.value !== -2){
            this.props.fetchPipelinePerContainer(this.state.containers[ev.target.value].id)
        }else{
            this.props.fetchPipelinesList()
        }
    }
    fetchContainersList = () => {
       
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetPipelineContainers)
          .then(res => {
            this.setState({
                containers:res.data,
                    containerLoaded:true,
            })
          })
         
      }
    getContainers = (containers) => {
        let {selectedPipeline} = this.state
        const { classes } = this.props
        let toRender = []
        toRender.push(
            <MenuItem
                value={-2}
                key={-2}
                className="suiteNavigationContainerOption">
                <ListItemAvatar style={{ position: 'absolute' }}>
                    <Avatar>
                        <FolderIcon />
                    </Avatar>
                </ListItemAvatar>
                <div style={{ paddingLeft: 55 }}>
                    <div className="suiteNavigationListOption">All</div>
                </div>
            </MenuItem>
        )
        containers.map((container, index) => {
            let name = container.name
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
                    <div style={{ paddingLeft: 55 }}>
                        <div className="suiteNavigationListOption">{name}</div>
                    </div>
                </MenuItem>
            )
        })
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
                        name = container.name
                    }
                    return (
                        <div id="containerName" className="containerName">
                            <FolderIcon color="primary" style={{ marginRight: 10 }} />
                            {name}
                        </div>
                    )
                }}
                value={this.state.selectedPipeline}
                onChange={this.selectPipeline.bind(this)}
                >
                {toRender}
            </Select>
        )
    }
    render() {
        let { containers, selectedPipeline, containerLoaded } = this.state
        const { classes } = this.props
        return (
            containerLoaded ? <div style={{ marginTop: 10 }}>
                <h5 style={{ padding: "10px 10px 0 8px", marginTop: 20 }}>Containers</h5>

                <Grid container>
                    <Grid item xs={12} md={6}>
                        <div className="containerSelect"  style={{ marginLeft: -30 }}>{this.getContainers(containers)}</div>
                    </Grid>
                </Grid>

            </div>
            :<div></div>

        )
    }
}
export default withStyles(styles)(ContentPicker)
