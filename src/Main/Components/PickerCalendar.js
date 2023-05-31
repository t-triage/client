import 'date-fns';
import React, {Component} from 'react'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import {styles} from '../../Main/Components/Globals'
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
class PickerCalendar extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        selectedDate: new Date(),
    };

    handleDateChange = date => {
        this.setState({ selectedDate: date });
        this.props.timeHandler(date)

    };
    render() {
        const { classes } = this.props;
        const { selectedDate } = this.state;

        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container spacing={24} justify="flex-end">
                    <Grid item xs={'auto'}>
                    <DatePicker
                        margin="dense"
                        label="Date picker"
                        value={selectedDate}
                        onChange={this.handleDateChange}
                        variant={'outlined'}
                    />
                </Grid>
                </Grid>
            </MuiPickersUtilsProvider>
        );
    }
}
export default withStyles(styles)(PickerCalendar);