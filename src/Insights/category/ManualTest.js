import React, {Component} from 'react'
import axios from 'axios'
import Api from "../../Main/Components/Api"
import {Grid, Paper} from "@mui/material"
import {styles} from '../../Main/Components/Globals'
import withStyles from '@mui/styles/withStyles';
import TestExecutedChart from '../TestExecutedChart'
import TestComponent from '../TestComponent'
import moment from 'moment';
import SelectDate from '../../Main/Components/SelectDate'
import TestExecuted from '../TestExecuted'
import ManualTestAndTestExecution from "../ManualTestAndTestExecution";
class ManualTest extends Component {
    constructor(props) {
        super(props)
        this.handleFilter = this.handleFilter.bind(this)
    }
    state = {
        data: [],
        newDataFilter:[],
    }
    handleFilter(dateUser) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetManualTest )
            .then(res => {
                const {data} = res
                data.map(dat => {dat.failExecutionDate = moment.unix(dat.failExecutionDate/1000).format("YYYY/MM/DD")})
                dateUser=moment.unix(dateUser/1000).format("YYYY/MM/DD");
                let datesFiltered = data.filter(d => (moment(d.failExecutionDate)).isAfter(dateUser))
                datesFiltered=this.handleDate(datesFiltered)
                datesFiltered=datesFiltered.sort(function (a, b){return a.failExecutionDate.localeCompare(b.failExecutionDate, 'en', { numeric: true })});
                this.setState({
                    data: data,
                    newDataFilter:datesFiltered,
                })
            })
            .catch(err => {
                console.log("Error Tests...")
                this.setState({fetchError: err})
            })
    }
    handleDate(data){
        const ids = [];
        const newData=[]
        data.map(element => {
            const isDuplicate = ids.includes(element.failExecutionDate);
            if (!isDuplicate) {
                ids.push(element.failExecutionDate);
                newData.push(element)
            }
            else{
                newData.map(idDuplicate=>{
                    if(idDuplicate.failExecutionDate===element.failExecutionDate){
                        idDuplicate.countOfFailExecution+=1
                    }
                })
            }
        });
        return newData
    }
    render() {
     const {newDataFilter}=this.state
        return (
            <div style={{ width: '100%' }}>
                <Grid container spacing={24} justifyContent="center">
                    <Grid item xs={10}>
                        <Paper className='chartBigContainer'>
                            <SelectDate  handleFilter={this.handleFilter} />
                            <TestExecutedChart data={newDataFilter}/>
                        </Paper>
                        <Paper className='chartBigContainer'>
                            <TestComponent/>
                        </Paper>
                        <Paper className='chartBigContainer'>
                            <TestExecuted/>
                        </Paper>
                        <Paper className='chartBigContainer'>
                            <ManualTestAndTestExecution/>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(ManualTest)