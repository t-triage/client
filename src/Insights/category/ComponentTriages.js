import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import HorizontalBarChart from '../HorizontalBarChart'
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"

import { styles } from '../../Main/Components/Globals'
import withStyles from '@mui/styles/withStyles';

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
                <Grid container spacing={24} justifyContent="center">
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
        );
    }
}

export default withStyles(styles)(ComponentTriages)