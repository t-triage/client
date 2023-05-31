import React, { Component } from 'react';
import Api from "./Api"
import axios from 'axios'
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
                root: classes.inputRootComponents,
            }}
            {...other}
        />
    );
}

const renderSuggestion = ({classes, suggestion, index, itemProps, highlightedIndex, addComponent}) => {
    const isHighlighted = highlightedIndex === index;

    return (
        <MenuItem
            {...itemProps}
            classes={{
                root: classes.menuItemRoot
            }}
            onClick={
                suggestion.name.includes('Add:') ?
                    addComponent.bind(this, suggestion.name)
                    : itemProps.onClick
            }
            key={suggestion.id}
            selected={isHighlighted}
            component="div"
        >
            {suggestion.name}
        </MenuItem>
    );
}

const getSuggestions = (value, items) => {
    const inputValue = value ? value.trim().toLowerCase() : '';
    let count = 0;

    let itemList = items.filter(item => {
        const keep =
            count < 5 && item.name.toLowerCase().includes(inputValue)

        if (keep) {
            count += 1;
        }

        return keep;
    })

    if (itemList.length === 0 && value.length > 2) {
        itemList.push({id: -1, name: `Add: ${value}`})
    }

    return itemList
}



class SetAutomatedComponentPicker extends Component {

    state = {
        componentId: null,
        inputValue: '',
        selectedItem: {},
        items: [],
        searchItems: [],
        isOpen: true,
        componentList: null,

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

    onInputClick() {
        this.setState({
            isOpen: true,
        })
    }

    searchComponent(value) {
        axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SearchAutomatedComponents}?name=${value}`)
            .then(res => {
                this.setState({
                    items: res.data.content,
                    isOpen: true,
                })
            })
    }

    addComponent(name) {
        let body = {
            description: "",
            enabled: true,
            name: name.substring(name.indexOf(':') + 2, name.length),
            timestamp: new Date().getTime(),
            updated: new Date().getTime(),
        }
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
    }

    fetchDefaultComponents() {
        axios.get(`${Api.getBaseUrl()}${Api.ENDPOINTS.SuggestedDefaultAutomatedComponents}`)
            .then(res => {
                this.setState({
                    items: res.data.content,
                    isOpen: true,
                })
            })
    }

    componentDidMount() {
        this.fetchDefaultComponents()
    }

    onChange(item) {
        this.setState({
            inputValue: item.name,
            selectedItem: item,
            items: [],
            searchItems: [],
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
            this.searchComponent(value)
        } else {
            this.fetchDefaultComponents()
        }

        this.setState({
            inputValue: value,
        })
    }

    render() {
        let {
            inputValue,
            items,
            searchItems,
            isOpen,
        } = this.state;

        const {
            classes,
            border,
            className,
            marginRight,
            backgroundColor,
            selectedItem,
            id,
            disabled,
        } = this.props;

        return (
            <Downshift
                id={id}
                inputValue={inputValue}
                isOpen={isOpen}
                onOuterClick={() => {
                    this.closeSuggestions.bind(this)()
                    this.props.onBlur && this.props.onBlur()
                } }
                selectedItem={selectedItem}
                itemToString={selectedItem => (selectedItem ? selectedItem.name : '')}
                onChange={this.onChange.bind(this)}
                >
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
                                id: id ? id : 'setComponentPicker-input',
                                onChange: this.onInputChange.bind(this),
                                onClick: !disabled && this.openSuggestions.bind(this),
                                className,
                                disabled,
                                placeholder: 'Select',
                                style: {
                                    fontSize: '.875rem',
                                    border,
                                    borderRadius: 3,
                                    marginRight,
                                    backgroundColor,
                                },
                                disableUnderline: true,
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
                            label: '',
                            variant: 'standard',
                        })}
                        <div {...getMenuProps()}>
                            {isOpen ? (
                                <Paper className={classes.paper}>
                                    {getSuggestions(inputValue, searchItems.length > 0 ? searchItems : items).map((suggestion, index) =>
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

export default withStyles(styles)(SetAutomatedComponentPicker);
