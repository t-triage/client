import React, {Component, PureComponent} from 'react';
import Tooltip from "@material-ui/core/Tooltip"
import CircularProgress from "@material-ui/core/CircularProgress"
import {withStyles} from '@material-ui/core/styles'
import {Grid, Paper} from "@material-ui/core"
import HelpIcon from "@material-ui/icons/Help"
import { styles, COLORS } from '../Main/Components/Globals'
import SelectDate from '../Main/Components/SelectDate'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as TooltipRechart,

} from 'recharts'
class CustomTooltip extends Component {
    render() {
        const { active } = this.props;
        if (active) {
            const { payload, label } = this.props;
            let{countOfFailExecution} = payload[0].payload;

            return (
                <div className="insightsCustomTooltip chartToTriageTooltip">
                    <div className='chartToTriageTooltipTitle'>{payload[0].payload.data}</div>
                    <div>
                        {
                            `number of tests executed: ${countOfFailExecution}`
                        }

                    </div>
                </div>
            );
        }

        return null;
    }
}
class TestExecutedChart extends Component {
    
     render() {
         let {classes} = this.props;
         let {data, loading} = this.props;
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
                                 the number of tests executed
                             </div>
                         }>
                         <HelpIcon />
                     </Tooltip>
                 </div>
                 <h4 className="chartTitle">
                     {'Tests Executed'}
                 </h4>
                 <div>
                     {
                         loading ?
                             <div className="circularProgressContainer">
                                 <CircularProgress color="primary" />
                             </div>
                             :
                             (data.length > 0 ?
                                 <div className="chartGeneralContainer">
                                     <ResponsiveContainer width="100%" height={300}>
                                         <LineChart data={data}
                                                    margin={{ top: 30, right: 30, left: 30 }}>
                                             <XAxis dataKey="failExecutionDate" interval={'preserveEnd'}/>
                                             <YAxis/>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <TooltipRechart content={<CustomTooltip />} />

                                             <Line type="monotone"   dataKey="countOfFailExecution" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={3} dot={false} activeDot={{ strokeWidth: 3, stroke: COLORS.blue }} />
                                         </LineChart>
                                     </ResponsiveContainer>
                                 </div>
                                 :
                                 <p className="label" style={{color: 'darkgray'}}>
                                     No data available
                                 </p>)
                     }
                 </div>
             </div>
         )
     }
 }

export default withStyles(styles)(TestExecutedChart)