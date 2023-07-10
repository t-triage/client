import React, {Component} from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import withStyles from '@mui/styles/withStyles';
import {Grid, Paper} from "@mui/material"
import { styles } from '../Main/Components/Globals'
import HorizontalBarChart from './HorizontalBarChart'
import PickerCalendar from '../Main/Components/PickerCalendar'
class TestComponent extends Component {
    constructor(props) {
        super(props)
        this.timeHandler = this.timeHandler.bind(this)
    }
    state = {
        data: [],
        date:null,
        dataOwner:[],
    }
    timeHandler(date) {
        date=date.getTime()
        this.setState({
            date: date,
        })
        this.renderActual(date)

    }
    timeFilter(dataOwner) {
        const ids = [];
        const newOwner=[]
        dataOwner.map(element => {
            const isDuplicate = ids.includes(element.id);
            if (!isDuplicate) {
                ids.push(element.id);
                newOwner.push(element)
            }
            else{
                newOwner.map(dat2=>{
                    if(dat2.id===element.id){
                        dat2.count+=1
                    }
                })
            }
        });
        return newOwner
    }
    renderActual(date) {
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetManualTestSince + '?timestamp=' + date)
                .then(response => {
                    let arrayOwenrs = []
                    let {data} = response
                    data.map(dat => {////rename property and insert to new owner
                        let nameTemporal = dat.owner.realname;
                        delete dat.owner.realname;
                        dat.owner.name = nameTemporal;
                        dat.owner['count'] = 1;
                        arrayOwenrs.push(dat.owner)

                    })
                    arrayOwenrs=this.timeFilter(arrayOwenrs)
                    this.setState({
                        data: data,
                        dataOwner: arrayOwenrs,
                    })

                })
                .catch(err => {
                    console.log("Error Tests...")
                    this.setState({fetchError: err})
                })
    }

    render() {
        let {dataOwner}=this.state
        return (
            <div style={{ width: '100%' }}>
                <Grid container spacing={24} justifyContent="center">
                    <Grid item xs={8}>
                        <PickerCalendar  timeHandler={this.timeHandler} />
                    </Grid>
                </Grid>
                    <Grid item xs={12}>
                        <Paper className='chartBigContainer'>
                            <HorizontalBarChart data={dataOwner} type='testsCreated' />
                        </Paper>

                </Grid>
            </div>
        );
    }
}



export default withStyles(styles)(TestComponent)