import React, { Component } from 'react';
import * as _  from 'underscore'
import Api from "./Api"
import axios from 'axios'
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Downshift from 'downshift';
import withStyles from '@mui/styles/withStyles';

import { styles, COLORS } from './Globals'

const COMPONENTS = [
  { id: 0, name: "Internationalization" },
  { id: 1, name: "Documents" },
  { id: 2, name: "People" },
  { id: 3, name: "Places" },
  { id: 4, name: "Search" },
  { id: 5, name: "Performance" },
  { id: 6, name: "Clients" },
  { id: 7, name: "Core Product" },
]

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

const renderSuggestion = ({ classes, suggestion, index, itemProps, highlightedIndex, addComponent }) => {
  const isHighlighted = highlightedIndex === index;
  let {name} = suggestion
  return (
    <MenuItem
      {...itemProps}
      classes={{
        root: classes.menuItemRoot
      }}
      onClick={
        suggestion.name.includes('Add:') ?
          addComponent.bind(this, name)
        : itemProps.onClick
      }
      key={suggestion.id}
      selected={isHighlighted}
      component="div"
    >
      {name}
    </MenuItem>
  );
}

const getSuggestions = (value, items, selectedItems) => {
  const inputValue = value ? value.trim().toLowerCase() : '';
  const inputLength = inputValue.length;
  let count = 0;
  let itemList = items.filter(item => {
      const keep =
        count < 5 && item.name.toLowerCase().includes(inputValue) && _.findIndex(selectedItems, {id: item.id}) === -1;

      if (keep) {
        count += 1;
      }

      return keep;
    })
  if (itemList.length === 0 && value.length > 2) {
    itemList.push({ id: -1, name:`Add: ${value}` })
  }
  return itemList
}

class ComponentsPicker extends Component {

  state = {
    inputValue: '',
    items: [],
    isOpen: false,
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
    let {onBlur} = this.props;
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
  }

  onInputClick() {
    this.setState({
        isOpen: true,
    })
  }

  searchComponents(value) {
    let {automatedComponents} = this.props;

    if (automatedComponents) {
      axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchAutomatedComponents}?name=${value}`)
          .then(res => {
            this.setState({
              items: res.data.content,
            })
          })
    } else {
      axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchProductComponents}?name=${value}`)
          .then(res => {
            this.setState({
              items: res.data.content,
            })
          })
    }
  }

  onChange(item) {
    let {onChange} = this.props;
    this.setState({
      inputValue: '',
    })
    this.closeSuggestions()
    if (item.id !== -1) {
      this.props.onChange(item)
    } else {
      this.addComponent(item.name)
    }
  }

  onInputChange(e) {
    let {value} = e.target;
    if (value.length >= 2) {
      this.searchComponents(value)
    } else {
      this.setState({
        items: [],
      })
    }
    this.setState({
      inputValue: value,
      isOpen: true,
    })
  }

  handleKeyDown(event) {
    let {selectedItems} = this.props
    let {inputValue, items} = this.state
    if (selectedItems.length && !inputValue.length && event.key === 'Backspace') {
      this.props.onChange(selectedItems[selectedItems.length - 1])
    }
  }

  addComponent(name) {
    let body = {
      description: "",
      enabled: true,
      name: name.substring(name.indexOf(':') + 2, name.length),
      timestamp: new Date().getTime(),
      updated: new Date().getTime(),
    }
    let {automatedComponents} = this.props;

    if (automatedComponents) {
      axios({
        method: "POST",
        url: `${Api.getBaseUrl()}${Api.ENDPOINTS.AddAutomatedComponent}`,
        data: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        },
      })
          .then(res => {
            this.onChange(res.data)
          })
    } else {
      axios({
        method: "POST",
        url: `${Api.getBaseUrl()}${Api.ENDPOINTS.AddProductComponent}`,
        data: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        },
      })
          .then(res => {
            this.onChange(res.data)
          })
    }
  }

  render() {
    let {
      inputValue,
      items,
      isOpen,
    } = this.state;
    const { classes, color, border, selectedItems, alignRight, id } = this.props;

    return (
      <Downshift
          id={id}
          inputValue={inputValue}
          isOpen={isOpen}
          onOuterClick={this.closeSuggestions.bind(this)}
          selectedItem={selectedItems}
          itemToString={selectedItems => selectedItems.name}
          onChange={this.onChange.bind(this)}>
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          highlightedIndex,
          inputValue,
          selectedItems,
        }) => (
          <div className={classes.container}>
            {renderInput({
              InputProps: getInputProps({
                onKeyDown: this.handleKeyDown.bind(this),
                onChange: this.onInputChange.bind(this),
                onClick: this.openSuggestions.bind(this),
                onBlur: this.onBlur.bind(this),
                onFocus: this.onFocus.bind(this),
                className: 'componentsPicker-container',
                style: {
                  fontSize: '.875rem',
                },
                placeholder: 'Choose components',
                startAdornment: this.props.selectedItems.map(item => (
                  <Chip
                    key={item.id}
                    tabIndex={-1}
                    label={item.name}
                    onDelete={this.props.onChange.bind(this, item)}
                    className="chip-outlined"
                    classes={{
                      root: classes.chip,
                    }}
                  />
                )),
              }),
              inputProps: {
                  style: {
                      fontSize: '.875rem',
                      overflowX: 'hidden',
                  }
              },
              InputLabelProps: {
                  shrink: true,
              },
              value: selectedItems ? selectedItems.name : '',
              classes,
              variant: 'outlined',
              label: 'Components'
            })}
            <div {...getMenuProps()}>
              {isOpen ? (
                <Paper className={classes.paper}>
                  {getSuggestions(inputValue, items, this.props.selectedItems).map((suggestion, index) =>
                    renderSuggestion({
                      classes,
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion }),
                      highlightedIndex,
                      addComponent: this.addComponent.bind(this),
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

export default withStyles(styles)(ComponentsPicker);
