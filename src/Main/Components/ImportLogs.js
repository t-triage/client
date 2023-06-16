import React, { Component } from 'react'
import Api from "./Api"
import axios from 'axios'

import {styles} from "./Globals";

//Material-ui Core imports:
import {
    Button,
    DialogActions,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Chip,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { TextFieldInput } from "../../Admin/AdminUtils";
import Downshift from 'downshift';
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";


const renderInput = (inputProps) => {
    const { InputProps, classes, value, ...other } = inputProps;

    return (
        <TextField
            id="testingInput"
            InputProps={{
                ...InputProps,
            }}
            classes={{
                root: classes.inputRootComponents,
            }}
            {...other} />
    );
}



class ImportLogs extends Component {

    state = {
        packageNames: '',
        productList: [],
        product: 0,
        productName:'',
        packageNamesList: [],
        logPattern:'',
        inputValue:''
    }

    componentDidMount() {
        this.fetchProducts()
    }

    handleDelete(string) {
        let packageArray = this.state.packageNamesList.filter((p) => p !== string)
        this.setState({
            packageNamesList: packageArray
        }, () => {
            this.updatePackages()
        })
    }

    handleKeyDown(e) {
        if (e.keyCode === 13){
            let temporaryArray = this.state.packageNamesList
            temporaryArray.push(e.target.value)
            this.setState({
                    packageNameList: temporaryArray,
                    inputValue: ''
                }, () => {
                    this.updatePackages()}
            )
        }
    }

    onInputChange(e){
        let {value} = e.target;
        this.setState({
            inputValue: value
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

    updatePackages() {
        axios({
            method: "PUT",
            url: `${Api.getBaseUrl()}${Api.ENDPOINTS.UpdateFields}`+"?id="+this.state.product+"&packageNames="+this.state.packageNamesList+"&logPattern="+this.state.logPattern,
        })
    }

    fetchProducts() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + '?query=enabled:true&sort=name,asc')
            .then(res => {
                let {content} = res.data
                let packageArray = content[0].packageNames ? content[0].packageNames.trim().split(",") : []
                this.setState({
                    productList: content,
                    product: content[0].id,
                    packageNames: content[0].packageNames,
                    packageNamesList: packageArray,
                    logPattern: content[0].logPattern
                })
            })
    }

    select = (name) => event => {
        let result = this.state.productList.filter((p) => p.id === event.target.value)
        let packageArray = result[0].packageNames ? result[0].packageNames.trim().split(",") : []
        this.setState({
            packageNames: result[0].packageNames,
            productName: result[0].name,
            product: event.target.value,
            packageNamesList: packageArray,
            logPattern: result[0].logPattern
        })

    }



    render() {
        let {productList, inputValue} = this.state

        const {classes, open, importLogs, handleLogsModalOpen } = this.props;

        const props = {
            open: open,
            onClose: handleLogsModalOpen
        }

        const {buttonDisabled, packageNamesList} = this.state

        return (
            <Dialog {...props} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Import Error Logs</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Use this space to upload Error Logs files in any text format.
                    </DialogContentText>
                    <Grid container spacing={16} style={{ marginTop: 0 }}>
                        <Grid item xs={12} sm={12}>
                            <TextFieldInput
                                id="product"
                                select
                                label="Product"
                                placeholder="Select product"
                                value={this.state.product}
                                onChange={this.select("product")}

                            >
                                {productList && productList.map(p => (
                                    <MenuItem className="globalMenuItem" key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </TextFieldInput>
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <Downshift
                                style={{marginTop: '15px'}}
                                inputValue={inputValue}
                            >
                                {({
                                      getInputProps
                                  }) => (
                                    <div className={classes.container}>
                                        {renderInput({
                                            InputProps: getInputProps({
                                                onKeyDown: this.handleKeyDown.bind(this),
                                                onBlur: this.onBlur.bind(this),
                                                onFocus: this.onFocus.bind(this),
                                                onChange: this.onInputChange.bind(this),
                                                className: 'componentsPicker-container',
                                                style: {
                                                    fontSize: '.875rem',
                                                },
                                                placeholder: 'Enter Package name',
                                                startAdornment: packageNamesList && packageNamesList.map(element => (
                                                    <Chip
                                                        key={`key-${element}`}
                                                        label={element}
                                                        variant="outlined"
                                                        className="chip-outlined"
                                                        onDelete={this.handleDelete.bind(this, element)}
                                                        classes={{
                                                            root: classes.chip
                                                        }}/>
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
                                            classes,
                                            variant: 'outlined',
                                            label: 'Package'
                                        })}
                                    </div>
                                )}
                            </Downshift>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <input
                        accept=".txt, .doc, .dic, .log"
                        style={{ display: 'none' }}
                        id="raised-button-file-logs"
                        onChange={(event) => importLogs(event, this.state.product)}
                        type="file"
                    />
                    <label htmlFor="raised-button-file-logs" >
                        <Button variant="contained" color="primary" component="span" style={{ marginRight: 15, marginBottom: 15 }} >
                            Upload Logs
                        </Button>
                    </label>
                </DialogActions>
            </Dialog>
        )
    }

}

export default withStyles(styles)(ImportLogs);