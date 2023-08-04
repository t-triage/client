import React, { Component } from 'react'
import { formatDate, parseDate } from 'react-day-picker/moment';
import Helmet from 'react-helmet';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import moment from 'moment';


export default class TrendGoalDayPicker extends Component {

    constructor(props) {
        super(props);
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.state = {
            from: undefined,
            to: undefined,
        };
    }

    showFromMonth() {
        const { from, to } = this.state;
        if (!from) {
            return;
        }
        if (moment(to).diff(moment(from), 'months') < 2) {
            this.to.getDayPicker().showMonth(from);
        }
    }

    handleFromChange(from) {
        // Change the from date and focus the "to" input field
        let {to} = this.state
        if (to != undefined)
            to = to.getTime()

        this.setState({ from }, this.props.timeHandler(from.getTime(), to));
        
    }

    handleToChange(to) {
        let {from} = this.state
        if (from != undefined)
            from = from.getTime()

        this.setState({ to }, () => {
            this.showFromMonth
            this.props.timeHandler(from, to.getTime())
        });
    }
    
    render() {
        let {from, to} = this.state;

        let {executorName} = this.props;

        const modifiers = { start: from, end: to };

        return (
            <div>
            <h1><p>{executorName}</p></h1>
                    <div className="InputFromTo">
                        <DayPickerInput
                            value={from}
                            placeholder="From"
                            format="LL"
                            formatDate={formatDate}
                            parseDate={parseDate}
                            dayPickerProps={{
                                selectedDays: [from, { from, to }],
                                disabledDays: { after: to },
                                toMonth: to,
                                modifiers,
                                numberOfMonths: 2,
                                onDayClick: () => this.to.getInput().focus(),
                            }}
                            onDayChange={this.handleFromChange}
                        />
                        <span className="dayPickerSeparator">—</span>
                        <span className="InputFromTo-to">
                                <DayPickerInput
                                    ref={el => (this.to = el)}
                                    value={to}
                                    placeholder="To"
                                    format="LL"
                                    formatDate={formatDate}
                                    parseDate={parseDate}
                                    dayPickerProps={{
                                        selectedDays: [from, { from, to }],
                                        disabledDays: { before: from },
                                        modifiers,
                                        month: from,
                                        fromMonth: from,
                                        numberOfMonths: 2,
                                    }}
                                    onDayChange={this.handleToChange}
                                />
                        </span>
                        <Helmet>
                            <style>{`
                                    .InputFromTo {
                                     padding-bottom: 26px;
                                    }
                                    .InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
                                    background-color: #f0f8ff !important;
                                    color: #4a90e2;
                                    }
                                    .InputFromTo .DayPicker-Day {
                                    border-radius: 0 !important;
                                    }
                                    .InputFromTo .DayPicker-Day--start {
                                    border-top-left-radius: 50% !important;
                                    border-bottom-left-radius: 50% !important;
                                    }
                                    .InputFromTo .DayPicker-Day--end {
                                    border-top-right-radius: 50% !important;
                                    border-bottom-right-radius: 50% !important;
                                    }
                                    .InputFromTo .DayPickerInput-Overlay {
                                    width: 550px;
                                    }
                                    .InputFromTo-to .DayPickerInput-Overlay {
                                    margin-left: -198px;
                                    }
                                `}
                            </style>
                        </Helmet>
                    </div>
            </div>
        )
    }
}