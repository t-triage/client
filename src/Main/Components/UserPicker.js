import React, { Component } from 'react';
import Api from "./Api"
import axios from 'axios'
import Avatar from "@material-ui/core/Avatar"
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';

import { styles, COLORS } from './Globals'

const renderInput = (inputProps) => {
  const { InputProps, classes, value, ...other } = inputProps;

  return (
    <TextField
        InputProps={{
          ...InputProps,
        }}
        classes={{
          root: classes.inputRoot,
        }}
        {...other} />
  );
}

const renderSuggestion = ({ classes, suggestion, index, itemProps, highlightedIndex }) => {
  const isHighlighted = highlightedIndex === index;

  return (
    <MenuItem
      {...itemProps}
      classes={{
        root: classes.menuItemRoot
      }}
      key={suggestion.id}
      selected={isHighlighted}
      component="div"
    >
      {
        suggestion.id !== -1 && <Avatar
            alt={`${suggestion.displayName} profile picture`}
            src={suggestion.avatar}
            className={classes.avatar} />
      }
      {suggestion.displayName}
    </MenuItem>
  );
}

const getSuggestions = (value, items, showDefault, showAll) => {
  const inputValue = value ? value.trim().toLowerCase() : '';
  const inputLength = inputValue.length;
  let count = 0;
  let all = [{ id: -1, value: "SELECT", label: "Select ...", displayName: 'All' }]

  let result = inputLength === 0
    ? items
    : !showDefault ? items.filter(item => {
        const keep =
          count < 5 && item.displayName.toLowerCase().includes(inputValue);

        if (keep) {
          count += 1;
        }

        return keep;
      }) : items
  return showAll ? all.concat(result) : result
}

class UserPicker extends Component {

  state = {
    userId: null,
    inputValue: '',
    defaultInputValue: true,
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

  onBlur(ev) {
    let {value} = ev.target;
    let {selectedItem} = this.state;
    let {onBlur} = this.props;
    this.setState({
      inputValue: selectedItem ? selectedItem.displayName : '',
      isOpen: false,
    })
    if (onBlur) {
      onBlur()
    }
  }

  onFocus() {
    let {onFocus} = this.props;
    if (onFocus) {
      onFocus()
    }
  }

  componentDidUpdate() {
    let {selectedItem, buildTriage} = this.props;
    let {userId} = this.state

    if (userId === null || (selectedItem && userId !== selectedItem.id)) {
      this.setState({
        inputValue: selectedItem ? selectedItem.displayName : '',
        userId: selectedItem ? selectedItem.id : 0,
        defaultInputValue: true,
        selectedItem,
      })
    }
  }

  onInputClick() {
    this.setSuggestedUsers(this.props.buildTriage);
  }

  setBuildAssignee(selectedItem) {
    let {buildTriage, updateTodayList, updateBacklog, selectedContainer} = this.props;
    axios({
      method: 'POST',
      url: Api.getBaseUrl() + Api.ENDPOINTS.AssignSuite,
      data: `userid=${selectedItem.id}&buildid=${buildTriage}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    }).then(res => {
      if (updateTodayList) {
        updateTodayList()
        updateBacklog(selectedContainer)
      }
    })
  }

  setIssueAssignee(selectedItem) {
    let {issue} = this.props;
    axios({
      method: 'POST',
      url: Api.getBaseUrl() + Api.ENDPOINTS.AssignAutomationIssue,
      data: `userid=${selectedItem.id}&issueid=${issue}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    })
  }

  setSuggestedUsers(buildTriage) {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.GetSuggestedUsers}?buildid=${buildTriage}`)
        .then(res => {
            this.setState({
                items: res.data,
                isOpen: true,
            })
        })
  }

  setSearchUsers(value) {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchUsers}?name=${value}` )
        .then(res => {
            this.setState({
              searchItems: res.data.content,
              isOpen: true,
            })
        })
  }

  setManualTestAssignee(user) {
    let {manualTest} = this.props;
    manualTest = {...manualTest, automationAssignee: user};
    axios({
      method: "PUT",
      url: `${Api.getBaseUrl()}${Api.ENDPOINTS.UpdateManualTest}`,
      data: JSON.stringify(manualTest),
      headers: {
        'Content-Type': 'application/json'
      },
    })
  }


  onChange(item) {
    let {onChange, issue, updateTodayList, isManual} = this.props;
    this.setState({
      inputValue: item.displayName,
      defaultInputValue: false,
      selectedItem: item,
      searchItems: [],
    })
    this.closeSuggestions()
    if (onChange) {
      this.props.onChange(item)
    } else {
      if (issue) {
        if (isManual) {
          this.setManualTestAssignee(item)
        } else {
          this.setIssueAssignee(item)
        }
      } else {
        this.setBuildAssignee(item)
      }
    }
  }

  onInputChange(e) {
    let {value} = e.target;
    if (value.length >= 2) {
      this.setSearchUsers(value)
    } else {
      this.setState({
        searchItems: [],
      })
    }
    this.setState({
      inputValue: value,
      defaultInputValue: false,
      showDefault: value.length > 0 ? false : true,
    })
  }

  render() {
    let {
      inputValue,
      items,
      searchItems,
      isOpen,
      showDefault,
      defaultInputValue,
    } = this.state;
    const { classes, fontWeight, color, border, selectedItem, className, alignRight, marginRight, width, backgroundColor, placeholder, id, fixedMenu, disabled } = this.props;

    return (
      <Downshift
          id="downshift-simple"
          inputValue={defaultInputValue ? selectedItem ? selectedItem.displayName : '' : inputValue}
          isOpen={isOpen}
          onOuterClick={this.closeSuggestions.bind(this)}
          selectedItem={selectedItem}
          itemToString={selectedItem => (selectedItem ? selectedItem.displayName : '')}
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
                id: id ? id : 'userPicker-input',
                onChange: this.onInputChange.bind(this),
                onClick: !disabled ? this.openSuggestions.bind(this) : null,
                onBlur: !disabled ? this.onBlur.bind(this) : null,
                onFocus: !disabled ? this.onFocus.bind(this) : null,
                className: `userPicker-container ${className} ${disabled ? 'disabledInput' : ''}`,
								disabled: !!disabled,
                style: {
                  color: color ? color : COLORS.primary,
                  fontWeight: fontWeight ? fontWeight : 'normal',
                  border: border ? border : 'auto',
                  fontSize: '.875rem',
                  width: width ? width : 'auto',
                  marginRight,
                  backgroundColor,
                },
                placeholder: placeholder ? placeholder : 'Select assignee',
                disableUnderline: true,
              }),
              inputProps: {
                  style: {
                      textAlign: alignRight ? 'right' : 'left'
                  }
              },
              value: selectedItem ? selectedItem.displayName : '',
              classes,
              variant: 'standard',
            })}
            <div {...getMenuProps()}>
              {isOpen ? (
                <Paper
                    className={classes.paper}
                    style={{
                      position: fixedMenu ? 'fixed' : 'absolute',
                      left: fixedMenu ? document.getElementById(id ? id : "userPicker-input").getBoundingClientRect().left : null
                    }}>
                  {!disabled && getSuggestions(inputValue, searchItems.length > 0 ? searchItems : items, showDefault, this.props.showAll).map((suggestion, index) =>
                    renderSuggestion({
                      classes,
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion }),
                      highlightedIndex,
                      selectedItem: selectedItem ? selectedItem.displayName : '',
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

export default withStyles(styles)(UserPicker);
