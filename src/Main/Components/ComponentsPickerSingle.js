import React, { Component } from 'react';
import Api from "./Api"
import axios from 'axios'
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from "@material-ui/core/Tooltip"
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
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
      key={suggestion + '-' + index}
      selected={isHighlighted}
      component="div"
    >
      {suggestion.name}
    </MenuItem>
  );
}

const getSuggestions = (value, defaultItems, items, exclude=[], fixedList) => {
  const inputValue = value ? value.trim().toLowerCase() : '';
  const inputLength = inputValue.length;

  if ((!items || items.length === 0) || defaultItems && !fixedList && inputLength === 0) {
    return defaultItems.filter(item => {
			const keep = exclude.indexOf(item.id) === -1;

			return keep;
		});
  }

  return items.filter(item => {
      const keep = exclude.indexOf(item.id) === -1 && item.name.toLowerCase().includes(inputValue);

      return keep;
    })
}

class ComponentsPickerSingle extends Component {

  constructor(props){
    super(props);

		this.state = {
			inputValue: '',
			defaultInputValue: true,
			items: props.defaultItems ? props.defaultItems : [],
			fixedList: props.id !== 'component1',
			isOpen: false,
			showDefault: true,
			showBorder: false,
		}
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
    this.setState({
      showBorder: false,
    })
  }

  onFocus() {
    this.setState({
      showBorder: true,
    })
  }

  componentDidUpdate() {
  }

  onInputClick() {
    this.setState({
        isOpen: true,
    })
  }

  searchComponents(value) {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchProductComponents}?name=${value}` )
        .then(res => {
            this.setState({
              items: res.data.content,
            })
        })
  }

  searchAutomatedComponents(value) {
    axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchAutomatedComponents}?name=${value}`)
        .then(res => {
            this.setState({
                items: res.data.content,
            })
        })
  }

  onChange(item) {
    let {onChange} = this.props;
    this.setState({
      inputValue: '',
    })
    this.props.onChange(item)
    this.closeSuggestions()
  }

  onInputChange(e) {
      let {value} = e.target;
      let {fixedList} = this.state;
      let {searchAutomated} = this.props;

      if (!fixedList) {
          if (value.length >= 2) {
              searchAutomated ? this.searchAutomatedComponents(value) : this.searchComponents(value)
          } else {
              this.setState({
                  items: [],
              })
          }
      }

      this.setState({
          inputValue: value,
          showDefault: value.length > 0 ? false : true,
          defaultInputValue: false,
      })
  }

  render() {
    let {
      inputValue,
      items,
      isOpen,
			fixedList,
      showDefault,
      defaultInputValue,
      showBorder,
    } = this.state;
    const { classes, color, border, selectedItem, alignRight, id, className, defaultItems, excludeFromSearch } = this.props;

    return (
      <Downshift
          id={id}
					inputValue={inputValue}
					isOpen={isOpen}
          onOuterClick={this.closeSuggestions.bind(this)}
          selectedItem={selectedItem}
          itemToString={selectedItem => selectedItem ? selectedItem.name : ''}
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
                disabled: !!selectedItem,
                onClick: !selectedItem ? this.openSuggestions.bind(this) : null,
                className: `componentsPicker-container manualFilter-components ${className}`,
                style: {
                  color: COLORS.primary,
                  border,
                  borderRadius: '3px',
                  marginRight: -7,
                  backgroundColor: 'white',
                },
                placeholder: !selectedItem ? 'All' : '',
								startAdornment: selectedItem && (
									<Tooltip
										title={selectedItem.name}
										classes={{
											tooltip: classes.tooltip,
											popper: classes.popper,
										}}>
										<Chip
											key={selectedItem.id}
											tabIndex={-1}
											label={selectedItem.name ? (selectedItem.name.length > 25 ? selectedItem.name.slice(0,25) + '...' : selectedItem.name) : ''}
											onDelete={this.props.onDelete.bind(this, selectedItem)}
											className="chip-outlined"
											classes={{
												root: classes.chip,
											}}
										/>
									</Tooltip>
								),
                disableUnderline: true,
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
              value: selectedItem ? selectedItem.name : '',
              classes,
              variant: 'standard',
            })}
            <div {...getMenuProps()}>
              {isOpen ? (
                <Paper className={classes.paper + ' componentsPickerSinglePaper'}>
                  {getSuggestions(inputValue, defaultItems, items, excludeFromSearch, fixedList).map((suggestion, index) =>
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

export default withStyles(styles)(ComponentsPickerSingle);
