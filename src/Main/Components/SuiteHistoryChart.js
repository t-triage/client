import React from 'react'
import * as _  from 'underscore'
import { COLORS } from './Globals'

import CircularProgress from "@mui/material/CircularProgress"

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip as TooltipRechart,
} from 'recharts'

const LABELS_SUITE_HISTORY = [
  { title: 'Total', name: 'totalTest', color: COLORS.primary },
  { title: 'Pass', name: 'passCount', color: COLORS.green },
  { title: 'Fail', name: 'failCount', color: COLORS.red },
]

const CustomTooltip = ({active, payload, label}) => {
  if (active) {
    let total = LABELS_SUITE_HISTORY[0]
    return (
      <div className="insightsCustomTooltip chartToTriageTooltip">
          <div className='chartToTriageTooltipTitle'>
            <p style={{
              margin: '10px 0',
            }}>
              {new Date(payload[0].payload.executiondate).toLocaleDateString("en-US", {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
              })}
            </p>
          </div>
          <div style={{ color: COLORS.greyDark }}>
            <b>Build #:</b>{` ${payload[0].payload.buildNumber}`}
          </div>
        {payload[0].payload.productVersion != null && (
            <div style={{ color: COLORS.greyDark, marginTop:"10px"}}>
              <b>Product Version:</b>{` ${payload[0].payload.productVersion}`}
            </div>
        )}
          <div>
            <div style={{
              color: total.color,
            }}>
              <p style={{
                margin: '10px 0',
              }}>{`${total.title}: ${payload[0].value + payload[1].value}`}</p>
            </div>
            {
              payload && payload.map((data, i) => {
                return (
                  <div key={i} style={{
                    color: data.fill,
                  }}>
                    <p style={{
                      margin: '10px 0',
                    }}>{`${_.find(LABELS_SUITE_HISTORY, {name: data.name}).title}: ${data.value}`}</p>
                  </div>
                )
              })
            }
          </div>
      </div>
    )
  }
  return null
}

const SuiteHistoryChart = ({data}) => {
  if (data && data.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={50}>
        <BarChart
          data={data}>
          <TooltipRechart content={<CustomTooltip />} />
          {
            LABELS_SUITE_HISTORY.map((label, index) => (
              index > 0 && <Bar key={index} stackId="b" dataKey={label.name} fill={label.color} />
            ))
          }
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (!data) {
    return (
      <div className="circularProgressContainer">
          <CircularProgress color="primary" />
      </div>
    )
  }
  if (data && data.length === 0) {
    return (
      <div className="circularProgressContainer">
          <div className="noRowsSuites">No data available</div>
      </div>
    )
  }

  return null

}

export default SuiteHistoryChart
