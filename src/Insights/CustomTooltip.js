import React, { Component } from 'react'

export default class CustomTooltip extends Component {

  render() {
    const { active, totalSummary } = this.props;
    if (active) {
      const { payload, label } = this.props;
      let value = payload[0].value;
      return (
        <div className="insightsCustomTooltip">
          <p className="label">{`${label} : ${value} - ${(value * 100)/totalSummary}`}</p>
        </div>
      );
    }

    return null;
  }
}
