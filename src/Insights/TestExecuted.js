import React, {Component} from 'react';
import axios from 'axios'
import Api from "../Main/Components/Api"
import withStyles from '@mui/styles/withStyles';
import {Grid, Paper} from "@mui/material"
import { styles } from '../Main/Components/Globals'
import HorizontalBarChart from './HorizontalBarChart'
import PickerCalendar from '../Main/Components/PickerCalendar'
class TestExecuted extends Component {
    constructor(props) {
        super(props)
        this.timeHandler = this.timeHandler.bind(this)
    }
    state = {
        data: [],
        date:null,
        dataAssignee:[],
    }
    timeHandler(date) {
        date=date.getTime()
        this.setState({
            date: date,
        })
        this.renderTestExecuted(date)

    }
    timeFilter(dataAssignee) {
        const ids = [];
        const newAssignee=[]
        dataAssignee.map(element => {
            const isDuplicate = ids.includes(element.id);
            if (!isDuplicate) {
                ids.push(element.id);
                newAssignee.push(element)
            }
            else{
                newAssignee.map(searchIdRepeat=>{
                    if(searchIdRepeat.id===element.id){
                        searchIdRepeat.count+=1
                    }
                })
            }
        });
        return newAssignee
    }
    renderTestExecuted(date) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetMANUALTESTEXECUTION_SINCE + '?timestamp=' + date)
            .then(response => {
                let arraydataAssignee = []
                const {data} = response
                data.map(dataManualExecution => {////rename property and insert to new owner
                    if(dataManualExecution.assignee !==null) {
                        let nameTemporal = dataManualExecution.assignee.realname;
                        delete dataManualExecution.assignee.realname;
                        dataManualExecution.assignee.name = nameTemporal;
                        dataManualExecution.assignee['count'] = 1;
                        arraydataAssignee.push(dataManualExecution.assignee)
                    }
                })
                arraydataAssignee=this.timeFilter(arraydataAssignee)
                this.setState({
                    data: data,
                    dataAssignee: arraydataAssignee,
                })
            })
            .catch(err => {
                console.log("Error Tests...")
                this.setState({fetchError: err})
            })
    }
    render(){
        let {dataAssignee}=this.state
        return (
            <div style={{ width: '100%' }}>
                <Grid container spacing={24} justifyContent="center">
                    <Grid item xs={8}>
                        <PickerCalendar  timeHandler={this.timeHandler} />
                    </Grid>
                </Grid>
                    <Grid item xs={12}>
                        <Paper className='chartBigContainer'>
                            <HorizontalBarChart data={dataAssignee} type='testExecuted' />
                        </Paper>
                </Grid>
            </div>
        );
    }
}
export default withStyles(styles)(TestExecuted)