import React, {Component} from 'react';
import * as _  from "underscore"
import ChartOptionsBar from './ChartOptionsBar'
import {BAR_CHART_TEXTS} from './InsightsUtils'
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import {withStyles} from '@material-ui/core/styles';
import HelpIcon from "@material-ui/icons/Help"
import {styles, COLORS} from '../Main/Components/Globals'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Text,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as TooltipRechart,
} from 'recharts'

const LABELS = [
    {title: 'New Fails', name: 'newFails', color: COLORS.redStrong},
    {title: 'Fails', name: 'fails', color: COLORS.red},
    {title: 'Now Passing', name: 'nowPassing', color: COLORS.green}
]

const LABELS_COVERAGE = [
    {title: 'Fails', name: 'fail', color: COLORS.red},
    {title: 'Passing', name: 'pass', color: COLORS.green},
    {title: 'Pending', name: 'pending', color: COLORS.grey},
    {title: 'Goals', name: 'goal', color: COLORS.primary}
]

const LABELS_AUTOMATION = [
    {title: 'Pending', name: 'pending', color: COLORS.red},
    {title: 'Fixed', name: 'passingIssues', color: COLORS.green},
]
const LABELS_TestsCreated = [
    //{title: 'Author', name: 'name', color: COLORS.blue},
    {title: 'Number of tests created ', name: 'count', color: COLORS.blue},

]
const LABELS_TestsAndExecution = [
    {title: ' Component Test Manual ', name: 'count', color: COLORS.blue},
    {title: 'Component Test Execution ', name: 'countManual', color: COLORS.green},

]

const LABELS_COMPONENT_TRIAGES = [
    {title: 'Fails', name: 'fails', color: COLORS.red},
    {title: 'Flaky', name: 'flaky', color: COLORS.yellow},
    {title: 'Pass', name: 'passed', color: COLORS.green}

]
const LABELS_EXECUTED=[
    {title: 'Number of tests executed ', name: 'count', color: COLORS.green},
    
]

const CustomizedTick = ({payload, x, y, data}) => {
    let {value} = payload
    let suite = _.find(data, {name: value})


    return [
        <Text key="suiteName" x={x} y={y - 5} textAnchor="end" verticalAnchor="middle">
            {value}
        </Text>,
        <Text key="suiteAssignee" x={x} y={y + 7} style={{fill: '#BEBEBE', fontSize: '.7rem'}} textAnchor="end"
              verticalAnchor="middle">
            {suite.assignee.realname}
        </Text>
    ]
}

const CustomTooltip = ({active, payload, label, labels}) => {
    if (active) {


        return (
            <div className="insightsCustomTooltip chartToTriageTooltip">
                <div className='chartToTriageTooltipTitle'>{label}</div>
                <div>
                    {
                        payload && payload.map((data, i) => {
                            return (
                                <div key={i} style={{
                                    color: data.fill,
                                }}>
                                    <p style={{
                                        margin: '10px 0',
                                    }}>{`${_.find(labels, {name: data.name}).title}: ${data.value}`}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }

    return null;
}
const getLabels = type => {
    let labels = LABELS;
    switch (type) {
        case 'automationFixedPending':
            labels = LABELS_AUTOMATION;
            break;
        case 'productCoverage':
            labels = LABELS_COVERAGE;
            break;
        case 'componentBasedTriages':
            labels = LABELS_COMPONENT_TRIAGES;
            break;
        case 'testsCreated':
            labels = LABELS_TestsCreated
            break;
        case 'testExecuted':
            labels=LABELS_EXECUTED
            break;
        case 'testCreatedAndExecution':
            labels=LABELS_TestsAndExecution
    }

    return labels;
}


class HorizontalBarChart extends Component {


    render() {

        const {classes, data, totalData, type, customTick, automationLabels, onBarClick} = this.props;
        let texts = _.find(BAR_CHART_TEXTS, {type})
        let labels = getLabels(type);


        let widthYAxis = 0;


        if (data != null) {
            data.map(item => {
                if (item.name.length> widthYAxis) {
                    widthYAxis = item.name.length


                }
            });

        }
        widthYAxis = widthYAxis *10;



        return (
            <div className='chartMainContainer'>
                <div className='helpIconContainer'>
                    <Tooltip
                        classes={{
                            tooltip: classes.tooltip,
                            popper: classes.popper,
                        }}
                        title={
                            <div>
                                <div>
                                    {texts.tooltip.title}
                                </div>
                                <ul style={{paddingLeft: 20, marginTop: 5}}>
                                    {
                                        texts.tooltip.help.map((help, index) => (
                                            <li key={index}>{help}</li>
                                        ))
                                    }
                                </ul>
                            </div>
                        }>
                        <HelpIcon/>
                    </Tooltip>
                </div>
                <h4 className="chartTitle">
                    {totalData ? `${texts.title} ${totalData}` : texts.title}
                </h4>
                <div className='chartToTriageContainer'>
                    <ChartOptionsBar labels={labels} className='chartToTriageOptionBoxSmall'
                                     style={{width: automationLabels ? 200 : 300}}/>
                    {
                        data && data.length > 0 && (
                            <ResponsiveContainer height={data.length < 9 ? 300 : data.length * 40}>
                                <BarChart
                                    maxBarSize={20}
                                    layout='vertical'
                                    margin={{
                                        top: 30,
                                    }}
                                    data={data}

                                >
                                    <TooltipRechart content={<CustomTooltip labels={labels}/>}/>
                                    <CartesianGrid/>
                                    <XAxis allowDecimals={false} type="number" />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        width={widthYAxis}
                                        dataKey="name"
                                        tick={customTick ? <CustomizedTick data={data}/> : true}
                                        type="category"
                                        allowDataOverflow={true}/>

                                    {
                                        labels.map((label, index) => (
                                            <Bar key={index} stackId="a"
                                                 dataKey={label.name} className={onBarClick ? 'barClickable' : ''}
                                                 fill={label.color} onClick={onBarClick ? onBarClick.bind(this) : null}/>
                                        ))
                                    }
                                </BarChart>
                            </ResponsiveContainer>

                        )
                    }
                    {
                        !data && (
                            <div className="circularProgressContainer">
                                <CircularProgress color="primary"/>
                            </div>
                        )
                    }
                    {
                        data && data.length === 0 && (
                            <div className="circularProgressContainer">
                                <div className="noRowsSuites">No data available</div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(HorizontalBarChart)