import React, {Component} from 'react'
import axios from 'axios'
import Api from "../Main/Components/Api"
import PickerCalendar from '../Main/Components/PickerCalendar'
import {Grid, Paper} from "@mui/material"
import {styles} from '../Main/Components/Globals'
import withStyles from '@mui/styles/withStyles';
import HorizontalBarChart from './HorizontalBarChart'

class ManualTestAndTestExecution extends Component {
    constructor(props) {
        super(props)
        this.timeHandler = this.timeHandler.bind(this)
    }
    state = {
        dataManual: [],
        date:null,
        dataExecution:[],
        data:[],

    }
    timeHandler(date) {////load timestamp on the property date
        date=date.getTime()
        this.setState({
            date: date,
        })
        this.apiManualTestAndTextExecution(date)///function api

    }
    apiManualTestAndTextExecution(date) {////apis
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetManualTestSince + '?timestamp=' + date)
            .then(res => {
                axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetMANUALTESTEXECUTION_SINCE + '?timestamp=' + date)
                    .then(res => {
                        const {data} = res
                        let newArrayTestExecution=[]
                        let newData=[]
                        data.map(dat => {newArrayTestExecution.push(dat.testCase)})
                        newArrayTestExecution=this.handleFilter(newArrayTestExecution)
                        newArrayTestExecution=this.conversionToArrayObject(newArrayTestExecution)
                        newArrayTestExecution=this.FilterArrayObject(newArrayTestExecution)
                        newData=this.handleResolverFilter(newArrayTestExecution)/// load of manualTest and test executed
                        this.setState({dataExecution: newArrayTestExecution, data:newData,})
                    })
                    // .catch(err => {
                    //     console.log("Error Tests...")
                    //     this.setState({fetchError: err})
                    // })
                const {data} = res
                let newArray=[]
                data.map(dat => {newArray.push(dat)})
                newArray=this.handleFilter(newArray)
                newArray=this.conversionToArrayObject(newArray)
                newArray=this.FilterArrayObject(newArray)
                this.setState({
                    dataManual:newArray,
                })
            })
            .catch(err => {
                console.log("Error Tests...")
                this.setState({fetchError: err})
            })

    }

    handleResolverFilter(data) {///groups manual test and test executed in data
        let {dataManual} = this.state
        if (dataManual.length > 0) {
            dataManual.map(dataManualMap => {
                data.map(dataFields => {
                    if (dataManualMap.name.includes(dataFields.name)) {
                        dataManualMap['countManual'] = dataFields.count
                    }
                })
            })
            return dataManual
        }
    }

    FilterArrayObject(data) {////filter duplicate
        const ids = [];
        const newArrayOject=[]
        data.map(element => {
            const isDuplicate = ids.includes(element.name);
            if (!isDuplicate) {
                ids.push(element.name);
                newArrayOject.push(element)
            }
            else{
                newArrayOject.map(elementRepeat=>{
                    if(elementRepeat.name===elementRepeat.name){
                        elementRepeat.count+=1
                    }
                })
            }
        });
        return newArrayOject
    }
    handleFilter(data) {//search for properties that contain component and Name
        const dataKeyValues=[]
        const newArray=[]
        data.forEach(element => {dataKeyValues.push(Object.entries(element))}) //// I extract the keys
        dataKeyValues.map((keyAndValue)=>{
            keyAndValue.map(dataSearch=>{
                if(dataSearch.toString().includes("component") && dataSearch.toString().includes("Name") && dataSearch[1]!=null ){
                    newArray.push(dataSearch[1])

                }
            })
        })
        return newArray
    }
    conversionToArrayObject(newArray){//// conversion to ArrayObject
        const newArrayFull = newArray.map(dat => {
            const propertiesObject = {
                "name": dat,
                'count':1,
            };
            return propertiesObject;
        });
        return newArrayFull
    }
    render() {
        let {data}=this.state
        return (
            <div style={{ width: '100%' }}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={8}>
                        <PickerCalendar  timeHandler={this.timeHandler} />
                    </Grid>
                </Grid>
                    <Grid item xs={12}>
                        <Paper className='chartBigContainer'>
                            <HorizontalBarChart data={data} type='testCreatedAndExecution'/>
                        </Paper>

                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(ManualTestAndTestExecution)