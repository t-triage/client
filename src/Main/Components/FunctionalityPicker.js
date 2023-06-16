import React, { Component } from 'react';
import Api from "./Api"
import axios from 'axios'
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Downshift from 'downshift';
import withStyles from '@mui/styles/withStyles';

import { styles, COLORS } from './Globals'

const renderInput = (inputProps) => {
  const { InputProps, classes, value, ...other } = inputProps;

  return (
    <TextField
        InputProps={{
          ...InputProps,
        }}
        classes={{
          root: classes.inputRootComponents,
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
      {suggestion.name}
    </MenuItem>
  );
}

const getSuggestions = (value, items, showDefault, isFilter) => {
  const inputValue = value ? value.trim().toLowerCase() : '';
  const inputLength = inputValue.length;
  let count = 0;
  let all = [{id: -1, value: "SELECT", label: "Select ...", name: 'All'}]

  let result = inputLength === 0
      ? items
      : items.filter(item => {
        const keep =
            count < 5 && item.name.toLowerCase().includes(inputValue)

        if (keep) {
          count += 1;
        }

        return keep;
      })

  return isFilter ? all.concat(result) : items
}

class FunctionalityPicker extends Component {

  state = {
    functionalityId: null,
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

  onFocus() {
    let {onFocus} = this.props;
    if (onFocus) {
      onFocus()
    }
  }

  componentDidUpdate() {
    let {selectedItem} = this.props;
    let {functionalityId} = this.state

    if (this.props.isFilter) {
      if (functionalityId === null || (selectedItem && functionalityId !== selectedItem.id)) {
        this.setState({
          inputValue: selectedItem ? selectedItem.name : '',
          functionalityId: selectedItem ? selectedItem.id : 0,
          defaultInputValue: true,
          selectedItem,
        })
      }
    }
  }

  onInputClick() {
    this.setState({
        isOpen: true,
    })
  }

  searchFunctionality(value) {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchFunctionalities}?functionality=${value}`)
        .then(res => {
          this.setState({
            items: res.data.content,
            isOpen: true,
          })
        })
  }

  onChange(item) {
    let {onChange} = this.props;
    this.setState({
      inputValue: item.name,
      selectedItem: item,
      defaultInputValue: false,
      items: [],
      searchItems: [],
    })

    this.closeSuggestions()
    if ((!this.props.isFilter && onChange) || this.props.isFilter)
      this.props.onChange(item)
  }

  onInputChange(e) {
    let {value} = e.target;
    if (value.length >= 2) {
      this.searchFunctionality(value)
      if (!this.props.isFilter)
        this.props.onChange({name: value})
    } else {
      if (!this.props.isFilter)
        this.props.onChange({name: value})
      this.setState({
        items: [],
        searchItems: [],
      })
    }

    this.setState({
      inputValue: value,
      showDefault: value.length > 0 ? false : true,
      defaultInputValue: false,
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({inputValue: nextProps.selectedItem ? nextProps.selectedItem.name : ''});
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

    const {
      classes,
      border,
      paddingLeft,
      className,
      marginRight,
      backgroundColor,
      selectedItem,
      id,
      width,
      inContainer,
      isFilter,
    } = this.props;

    return (
        <Downshift
            id={id}
            inputValue={defaultInputValue ? selectedItem ? selectedItem.name : '' : inputValue}
            isOpen={isOpen}
            onOuterClick={this.closeSuggestions.bind(this)}
            selectedItem={selectedItem}
            itemToString={selectedItem => (selectedItem ? selectedItem.name : '')}
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
                id: id ? id : 'functionalityPicker-input',
                onChange: this.onInputChange.bind(this),
                onClick: this.openSuggestions.bind(this),
                className,
                style: {
                  fontSize: '.875rem',
                  color: isFilter ? COLORS.primary : 'inherit',
                  width: width ? width : 'auto',
                  border,
                  borderRadius: 3,
                  paddingLeft,
                  marginRight,
                  backgroundColor,
                },
                placeholder: inContainer ? 'Functionality Name' : isFilter ? 'All' : 'Functionality',
              }),
              InputLabelProps: {
                shrink: true,
                style: {
                  color: COLORS.grey,
                }
              },
              inputProps: {
                style: {
                  fontSize: '.875rem',
                },
              },
              value: selectedItem ? selectedItem.name : '',
              classes,
              label: inContainer ? 'Functionality Name' : isFilter ? '' : 'Functionality',
              variant: isFilter ? 'standard' : 'outlined',
              onClick: isFilter ? null : () => this.props.onAddFunctionality(),
            })}
            <div {...getMenuProps()}>
              {isOpen ? (
                <Paper className={classes.paper}>
                  {getSuggestions(inputValue, searchItems.length > 0 ? searchItems : items, showDefault, this.props.isFilter).map((suggestion, index) =>
                      renderSuggestion({
                        classes,
                        suggestion,
                        index,
                        itemProps: getItemProps({item: suggestion}),
                        highlightedIndex,
                        selectedItem: selectedItem ? selectedItem.name : '',
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

export default withStyles(styles)(FunctionalityPicker);
