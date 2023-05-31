import React, { Component } from 'react'

import SearchIcon from "@material-ui/icons/Search"
import InputBase from '@material-ui/core/InputBase';
import CircularProgress from "@material-ui/core/CircularProgress"

import { styles } from './Globals'
import { withStyles } from '@material-ui/core/styles';

class ManualTestNameFilter extends Component {

  state = {
    name: '',
		isFetchingData:false
  };

  componentDidMount() {
    let {filters} = this.props;

    this.setState({
      name: filters.name ? filters.name : '',
			isFetchingData: filters.loading
    })
  }

  componentDidUpdate(prevState) {
  	if (this.state.isFetchingData && !this.props.filters.isLoading) {
			this.setState({
				isFetchingData: false
			})
		}
	}

  onNameChange(ev) {
    let {value} = ev.target;
    value = value ? value : '';
    this.setState({
      name: value,
			isFetchingData: value.length > 2 || value.length === 0
    }, () => {
      let {filters} = this.props;
      if (value.length > 2) {
        filters.name = value;
        filters.loading= true
        this.props.filterTests(filters)
      }
      if (value.length === 0) {
        filters.name = null;
				filters.loading= true
        this.props.filterTests(filters)
      }
    })
  }

  render() {
    let { name, isFetchingData } = this.state;
    const { filters } = this.props

    return (
			<div className="TestRepositorySearch">
				<div className="TestRepositorySearchBox">
					<SearchIcon />
					<InputBase
						id="nameFilterInput"
						placeholder="Search Test name"
						className="manualTestFilterStyle"
						value={name}
						onChange={this.onNameChange.bind(this)}
					/>
				</div>
			</div>
    )
  }
}

export default withStyles(styles)(ManualTestNameFilter)
