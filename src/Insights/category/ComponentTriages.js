import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import HorizontalBarChart from '../HorizontalBarChart'
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"

import { styles } from '../../Main/Components/Globals'
import { withStyles } from '@material-ui/core/styles';

class ComponentTriages extends Component {

    state = {
        componentTriages: null
    }

    componentWillMount() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetComponentBasedTriage )
            .then(res => {
                let {data} = res
                this.setState({
                    componentTriages: data,
                })
            })
    }

    render() {
        let {componentTriages} = this.state
        return (
            <div style={{ width: '100%' }}>
                <Grid container spacing={24} justify="center">
                    <Grid item xs={10}>
                        <Paper className='chartBigContainer'>
                            <HorizontalBarChart
                                data={componentTriages}
                                type='componentBasedTriages'
                                ComponentsCustomTick
                                 />
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(ComponentTriages)