import React, { Component } from 'react';
import Api from "./Api"
import axios from 'axios'
import { priorities, COLORS } from './Globals';

// Components
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import withStyles from '@mui/styles/withStyles';
import InputBase from '@mui/material/InputBase'

// Icons
import PriorityIcon from "@mui/icons-material/TrendingUp"
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardCapslockIcon from "@mui/icons-material/KeyboardCapslock"

const BootstrapInput = withStyles(theme => ({
  input: {
    border: 'none',
    width: '20px'
  },
}))(InputBase);

export default class PriorityPicker extends Component {

  state = {
    selectedPriority: 'P0',
  }

  componentDidMount() {
    this.setState({
      selectedPriority: this.props.selectedPriority,
    })
  }

  handleChange(ev) {
    let priority = ev.target.value;
    let {onClick} = this.props;
    this.setState({
      selectedPriority: priority,
    }, () => {
      axios({
        method: 'POST',
        url: Api.getBaseUrl() + Api.ENDPOINTS.SetPriority,
        data: `buildid=${this.props.buildTriageId}&priority=${priority}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      })
      .then(res => {
        if (onClick) {
          onClick(this.props.buildTriageId, priority)
        }
      })
    })
  }

  renderIcon = priority => {
     switch (true) {
      case priority == "P0":
          return <KeyboardBackspaceIcon color="secondary" style={{transform: "rotate(90deg)"}}  />
      case priority == "P1":
          return <KeyboardCapslockIcon color="secondary" />
      case priority == "P2":
          return <KeyboardArrowUpIcon style={{color: COLORS.orange}} />
      case priority == "P3":
          return <KeyboardArrowDownIcon style={{color: COLORS.green}} />
      case priority == "P4":
          return <KeyboardBackspaceIcon style={{color: COLORS.green, transform: "rotate(-90deg)"}} />
      default:
          return <KeyboardArrowUpIcon style={{color: COLORS.orange}} />
     }
  }

  render() {

    return (
      <div style={{display: "flex", alignItems: "center", justifyContent: 'center'}}>
          { this.renderIcon(this.state.selectedPriority) }
          <Select
            value={this.state.selectedPriority}
            onChange={this.handleChange.bind(this)}
            style={{
              marginLeft: 5,
              fontSize: '.875rem'
            }}
            input={<BootstrapInput />}
            inputProps={{
              name: 'assignee',
              id: 'assignee',
            }}
          >
          {priorities.map(priority => (
            <MenuItem className="globalMenuItem" key={priority.id} value={priority.value}>
              {priority.value}
            </MenuItem>
          ))}
          </Select>
      </div>
    )
  }
}
