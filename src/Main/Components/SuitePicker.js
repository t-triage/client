import React, { Component } from 'react';
import { _ } from "underscore"
import axios from 'axios'
import Api from "./Api"
import PropTypes from 'prop-types';
import Typography from "@material-ui/core/Typography"
import Avatar from "@material-ui/core/Avatar"
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search"
import ClearIcon from "@material-ui/icons/Clear"
import { Link } from 'react-router-dom'

import "../../styles/issuesList.scss"
import { styles, COLORS } from './Globals'

const renderInput = (inputProps, this1) => {
  const { InputProps, classes, value, ...other } = inputProps;
  let inputValue = InputProps.value;

  return (
    <div className="searchExecutors">
      <SearchIcon style={{marginRight: "10px"}} color="primary" fontSize="small"/>
      <TextField
          InputProps={{
            ...InputProps,
            endAdornment:
              inputValue ?
                <ClearIcon
                    color="action"
                    onClick={() => this1.setState({ inputValue: '' })}
                    style={{ marginRight: 10, cursor: 'pointer' }} />
              : null
          }}
          classes={{
            root: classes.inputRoot,
          }}
          style={{ width:255, maxWidth:"none", color: COLORS.primary }}
          {...other} />
    </div>
  );
}

const renderSuggestion = ({ classes, suggestion, index, itemProps, highlightedIndex }) => {
  const isHighlighted = highlightedIndex === index;

  return (
    <Link to={`${suggestion}`} style={{textDecoration: "none"}} key={index}><MenuItem
      {...itemProps}
      classes={{
        root: classes.menuItemRoot
      }}
      key={index}
      selected={isHighlighted}
      component="div"
      style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}
    >
      {suggestion}
    </MenuItem></Link>
  );
}

const getSuggestions = (value, items, showDefault) => {
  let valueWithoutSpaces = value.replace(/\s/g, "")
  const inputValue = value ? value.trim().toLowerCase() : ''
  const inputValueWithoutSpaces = valueWithoutSpaces ? valueWithoutSpaces.trim().toLowerCase() : ''

  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? items
    : !showDefault ? items.filter(item => {

        const keep =
          count < 5 && item.toLowerCase().includes(inputValue) || item.toLowerCase().includes(inputValueWithoutSpaces)

        if (keep) {
          count += 1;
        }

        return keep;
      }) : items
}

class SuitePicker extends Component {

  state = {
    inputValue: '',
    selectedItem: {},
    items: [],
    searchItems: [],
    isOpen: false,
    showDefault: true,
  }

  openSuggestions() {
    this.onInputClick()
  }

  closeSuggestions() {
    this.setState({
      isOpen: false,
    })
  }

  componentDidMount() {
    this.setSuggestedExecutors(this.props.executorNames)
  }

  onInputClick() {
    this.setSuggestedExecutors(this.props.executorNames);
  }


  setSuggestedExecutors(executors) {
      this.setState({
          items: executors,
          isOpen: true,
      })
  }

  setSearchExecutors(value) {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchExecutors}?name=${value}` )
        .then(res => {
          this.setState({
            searchItems: res.data.content,
          })
        })

    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchTestCases}?name=${value}` )
        .then(res => {
            this.setState(state => {
              const searchItems = state.searchItems.concat(res.data.content);
              return {
                searchItems
              }
            })
        })
  }

  onChange(item) {
    let {onChange} = this.props;
    this.setState({
      inputValue: item,
      selectedItem: item,
      searchItems: [],
    })
    this.closeSuggestions()
    if (onChange) {
      this.props.onChange(item)
    }

    this.props.executorFilter(item)
  }

  onInputChange(e) {
    let {value} = e.target;
    if (value.length >= 3) {
      this.setSearchExecutors(value)
    } else {
      this.setState({
        searchItems: [],
      })
    }
    this.setState({
      inputValue: value,
      showDefault: value.length > 0 ? false : true,
    })
  }

  render() {
    let {
      inputValue,
      selectedItem,
      items,
      searchItems,
      isOpen,
      showDefault,
    } = this.state;
    const { classes } = this.props;

    return (
      <Downshift
          id="downshift-simple"
          inputValue={inputValue}
          isOpen={isOpen}
          onOuterClick={this.closeSuggestions.bind(this)}
          selectedItem={selectedItem}
          itemToString={selectedItem => (selectedItem ? selectedItem : '')}
          onChange={this.onChange.bind(this)}>
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          highlightedIndex,
          inputValue,
          selectedItem,
        }) => (
          <div className={classes.container}>
            {renderInput({
              InputProps: getInputProps({
                onChange: this.onInputChange.bind(this),
                onClick: this.openSuggestions.bind(this),
            //    onBlur: this.onBlur.bind(this),
                placeholder: 'What suite or test are you looking for?',
                disableUnderline: true,
                style: {
                  fontSize: '.875rem',
                }
              }),
              value: selectedItem ? selectedItem : '',
              classes,
              variant: 'standard',
            }, this)}
            <div {...getMenuProps()}>
              {isOpen ? (
                <Paper style={{width: "100%"}} className={classes.paper}>
                  {getSuggestions(inputValue, searchItems.length > 0 ? searchItems : items, showDefault).map((suggestion, index) =>
                    renderSuggestion({
                      classes,
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion }),
                      highlightedIndex,
                      selectedItem: selectedItem ? selectedItem : '',
                    }),
                  )}
                </Paper>
              ) : null}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}

export default withStyles(styles)(SuitePicker);
