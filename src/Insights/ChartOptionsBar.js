import React, { Component } from 'react';

export default class ChartOptionsBar extends Component {

  render() {
    let {labels, className, style} = this.props;

    return (
      <div className='chartToTriageOptionsContainer' style={style}>
        {
          labels && labels.map((label, i) => {
            return (
              <div key={i} className='chartToTriageOptionsOption'>
                <div className={className} style={{ backgroundColor: label.color }}></div>
                <div>{label.title}</div>
              </div>
            )
          })
        }
      </div>
    )
  }
}
