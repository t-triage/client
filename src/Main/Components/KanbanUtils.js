import React from 'react'
import DoneIcon from "@mui/icons-material/Done"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { COLORS } from './Globals'

export const getKanbanTagColor = (hasNewData, previousPass, status) => {
  switch (status) {
    case 'NO_FAIL':
    case 'EXTERNAL_CAUSE':
      return hasNewData ? COLORS.green : !previousPass ? COLORS.greenLight1 : '#F5F5F5'
    case 'UNDEFINED':
    case null:
      return '#F5F5F5'
    default:
      return hasNewData ? COLORS.red : !previousPass ? COLORS.redLight : '#F5F5F5'
  }
}

export const getCheckIcon = (hasNewData, applicationFailType, testFailType) => {
  let marginLeft = 8;
  let color = '#ccc'
  if (hasNewData) {
    if (applicationFailType !== 'UNDEFINED' && testFailType !== 'UNDEFINED') {
      return <DoneAllIcon color="action" style={{ marginLeft, color }} />
    }
    if (applicationFailType !== 'UNDEFINED' || testFailType !== 'UNDEFINED') {
      return <DoneIcon color="action" style={{ marginLeft, color }} />
    }
    if (applicationFailType === 'UNDEFINED' && testFailType === 'UNDEFINED') {
      return <DoneIcon color="action" style={{ marginLeft, color }} />
    }
  } else {
    return null
  }
}

export const getCheckIconTooltip = (applicationFailType, testFailType, triaged) => {
  if (triaged) {
    return <div><b>Done</b></div>
  }
  if ((applicationFailType !== 'UNDEFINED' && testFailType !== 'UNDEFINED')) {
    return <div><b>Done: </b>All options set</div>
  }
  if (applicationFailType !== 'UNDEFINED' || testFailType !== 'UNDEFINED') {
    return <div><b>In Progress: </b>Test under analysis</div>
  }
  if (applicationFailType === 'UNDEFINED' && testFailType === 'UNDEFINED') {
    return <div><b>In Progress: </b>Test under analysis</div>
  }
}
