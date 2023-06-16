import React, { Component } from "react"
import axios from 'axios'

import Api from "./Api"

// UI Components
import Grid from "@mui/material/Grid"
import Select from "@mui/material/Select"

import InputBase from "@mui/material/InputBase"
import withStyles from '@mui/styles/withStyles';
import { styles } from './Globals'


const BootstrapInput = withStyles(theme => ({
    input: {
        border: 'none',
        ArrowDropDownIcon: 'none'
    },

}))(InputBase);

class ExecutorsPicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            executorLoaded: false,
            executors: [],
            selectedExecutor: undefined,
        }
    }

    componentDidMount() {
        if(!this.state.executorLoaded){
            this.fetchExecutorsList()
        }
    }


    selectExecutor = (ev) => {
        this.setState({selectedExecutor: ev.target.value})
        if(ev.target.value !== -2)
            this.props.fetchExecutor(this.state.executors[ev.target.value].id, this.state.executors[ev.target.value].name)
    }

    fetchExecutorsList = () => {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetExecutors)
          .then(res => {
            this.setState({
                executors: res.data,
                executorLoaded: true,
                selectedExecutor: res.data[0]
            }, () => {this.props.fetchExecutor(this.state.selectedExecutor.id, this.state.selectedExecutor.name)})
            })
    }

    getExecutors = (executors) => {
        let toRender = []

        executors.map((executor, index) => {
            toRender.push(
                <option
                    value={index}
                    key={index}
                    className="suiteNavigationListExecutor">
                    {executor.name}
                </option>
            )
        })

        return (
            <Select
                multiple
                native
                className="containerListExecutor"
                IconComponent={props => (<i {...props} className={`material-icons ${props.className}`}></i>)}
                input={<BootstrapInput />}
                value={this.state.selectedExecutor}
                onChange={this.selectExecutor.bind(this)}
                >
                {toRender}
            </Select>
        )
    }

    render() {
        let { executors, executorLoaded } = this.state

        return (
            /* Si se puede, usar clases en vez de inline styles en elementos html */
            executorLoaded ? 
            <div style={{ marginTop: 10 }}>
                <h5 style={{ padding: "10px 10px 0 8px", marginTop: 20 }}>Executors</h5>
                <Grid container>
                    <Grid item xs={12} md={6}>
                        <div className="containerSelect"  style={{ marginLeft: -30 }}>{this.getExecutors(executors)}</div>
                    </Grid>
                </Grid>
            </div>
            :<div></div>

        )
    }
}

export default withStyles(styles)(ExecutorsPicker)
