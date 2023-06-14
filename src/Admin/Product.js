import React, { Component } from "react"
import Api from "../Main/Components/Api"
import axios from 'axios'

import { scrollToTop, TextFieldInput } from './AdminUtils'

// Icons
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import EditIcon from "@material-ui/icons/Edit"
import AppIcon from "@material-ui/icons/BusinessCenter"
import FileCopyIcon from "@material-ui/icons/FileCopy"

// UI Components
import Divider from "@material-ui/core/Divider"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import IconButton from "@material-ui/core/IconButton"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Checkbox from "@material-ui/core/Checkbox"
import Button from "@material-ui/core/Button"
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import CircularProgress from "@material-ui/core/CircularProgress"
import Avatar from "@material-ui/core/Avatar"
import Tooltip from "@material-ui/core/Tooltip"
import InputBase from "@material-ui/core/InputBase";
import { COLORS } from "../Main/Components/Globals";
import * as _  from "underscore";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import TextField from "@material-ui/core/TextField";
import { MenuItem } from "@material-ui/core";
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { MySnackbarContent, snackbarStyle } from '../Main/Components/Globals'
import { withStyles } from "@material-ui/core/styles";
import AlertDialogSlide from '../Main/Components/AlertDialogJira';
import SideMenu from "./SideMenu"
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const MySnackbarContentWrapper = withStyles(snackbarStyle)(MySnackbarContent);

const jiraVersions = [
    { value: "cloud", text: "Cloud" },
    { value: "server", text: "Server" },
]

const triageTests = [
    { value: "true", text: "True" },
    { value: "false", text: "False" },
]

const validJiraServer = (/^https:\/\/[a-zA-Z0-9@:%._+~#=/!$^&*()|`{}\[\]";'<>?,\\\-]+\.atlassian.net$/g);
const validClientId = /[a-zA-Z0-9]{10}/
const validClientSecret = /[a-zA-Z0-9]{10}/
const APP_CLIENT_ID = "C7BtxJfyQxkMFP0jXANVA5kJKnjP6Aac";

export default class Product extends Component {

    constructor(props) {
        super(props)

        this.state = {
            productList: [],
            productName: '',
            productNameError: false,
            productDescription: '',
            packageNames: '',
            productImage: '',
            hasMultipleEnvironment: false,
            showAdvanced: false,
            showGoals: false,
            showJira: false,
            imageFocus: false,
            enableEdit: false,
            productEdit: null,
            searching: true,
            productId: null,
            productRepositories: [],
            deletedRepositories: [],
            newRepositoryUrl: '',
            newRepositoryUser: '',
            newRepositoryPassword: '',
            newRepositoryUrlError: false,
            newRepositoryUserError: false,
            newRepositoryNameError: false,
            showNewPassword: false,
            searchingRepository: true,
            repositories: [],
            url: '',
            user: '',
            password: '',
            requiredTestCase: null,
            expectedTestCase: null,
            requiredPassRate: null,
            expectedPassRate: null,
            skipped: false,
            jiraVersion: 'cloud',
            triageTest: 'true',
            jiraServer: '',
            jiraServerError: false,
            projectId: '',
            projectSecret: '',
            projectKey: '',
            reporterEmail: '',
            reporterEmailError: false,
            clientId: '',
            clientIdError: false,
            clientSecret: '',
            clientSecretError: false,
            javaConfiguration: [],
            projectStates: [],
            initialStateId: '',
            resolvedStateId: '',
            closedStateId: '',
            reopenStateId: '',
            validateTest: false,
            ableProjectStates: false,
            showSnackbar: false,
            showGrantAccess: false,
            permissionGranted: false,
            jiraProjects: [],
            issueTypes: [],
            issueType: '',
            jiraIdselect: [],
            projectIdSelect: [],
            iddBd: null,
            defaultValuesFields: '',
            isFetchedToken: false,
            isValidToken: false,
            isErrorToken: false,
            infoModalOpen: false
        }
    }

    componentDidMount() {
        this.fetchProducts();
        this.fetchJavaConfiguration();
    }

    componentDidUpdate() {
        let { isActive, isPrevious, setPrevious } = this.props;
        let { skipped } = this.state;
        if (isActive && isPrevious) {
            setPrevious()
            if (!skipped)
                this.wizardUpdate()
        }
    }

    fetchCvsRepositories(productId) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetCVSRepositories + "?sort=url")
            .then(res => {
                this.setState({
                    productRepositories: res.data.content.filter(repository => repository.product == productId && repository.enabled),
                    searchingRepository: false
                })
            })
            .catch(err => {
                console.log("Error fetchCvsRepositories...")
                this.setState({ fetchError: err })
            })


    }

    fetchProducts() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetProducts + "?sort=name,asc")
            .then(res => {
                this.setState({
                    productList: res.data.content,
                    searching: false
                })
            })
            .catch(err => {
                console.log("Error fetchProducts...")
                this.setState({ fetchError: err })
            })
    }

    onJiraProjects() {
        let { productId, isFetchedToken, isValidToken, clientId } = this.state
        if (!isFetchedToken || !isValidToken) {
            let oAuthWindow;

            let popupCenter = ({ url, title, w, h }) => {
                let dualScreenLeft, dualScreenTop, width, height, systemZoom, left, top;

                dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
                dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

                width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
                systemZoom = width / window.screen.availWidth;
                left = (width - w) / 2 / systemZoom + dualScreenLeft
                top = (height - h) / 2 / systemZoom + dualScreenTop
                oAuthWindow = window.open(url, title,
                    `scrollbars=yes, width=${w}, height=${h}, top=${top}, left=${left}`)
                if (window.focus) oAuthWindow.focus();
            }
            popupCenter({ url: `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=offline_access%20read%3Ajira-work%20write%3Ajira-work%20manage%3Ajira-configuration&&redirect_uri=${window.location.origin}/auth/jira&state=${productId}&response_type=code&prompt=consent`, title: 'OAuthAtlassian', w: 702, h: 907 }); window.addEventListener("message", (event) => {
                if (event.data.status == "OK") {
                    this.fetchJiraProjects()
                    this.setState({ validateTest: true, isFetchedToken: true, isErrorToken: false, isValidToken: true })
                }
                else {
                    this.setState({ validateTest: true, isFetchedToken: true, isErrorToken: true, isValidToken: false })
                }
            });
        }
        else {
            this.enableJiraConfig()
            this.fetchJiraProjects()
        }
    }

    fetchJiraProjects() {
        let { productId } = this.state
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.JiraProjects, { params: { productId } })
            .then(res => {
                const jiraProjects = [];
                res.data.values.map(value => {
                    jiraProjects.push({ name: value.key, id: value.id })
                });
                this.setState({ jiraProjects: jiraProjects })
                if (this.state.issueType) {
                    this.fetchisuetype();
                }
                this.fetchProjectStatus()
            })
            .catch(err => {
                console.log("Error onJiraProjects...")
                this.setState({ fetchError: err })
            })
    }

    fetchProjectStatus() {
        let { productId, projectKey } = this.state
        if (projectKey) {
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.JiraProjectStatus, { params: { productId, projectKey } })
                .then(res => {
                    const projectId = [];
                    const ids = [];
                    res.data.map(value => {
                        let { statuses } = value
                        statuses.map(dat => {
                            const isDuplicate = ids.includes(dat.id);
                            if (!isDuplicate) {
                                ids.push(dat.id);
                                projectId.push({ name: dat.name, id: dat.id })
                            }
                        })
                    });
                    this.setState({ projectIdSelect: projectId });
                })
                .catch(err => {
                    console.log("Error fetchProjectStatus...")
                    this.setState({ fetchError: err })
                })
        }
    }

    fetchJiraConfig(productId) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetJiraConfig, { params: { productId } })
            .then(res => {
                this.setState({
                    jiraServer: res.data.jiraUrl ? res.data.jiraUrl : '',
                    projectKey: res.data.projectKey ? res.data.projectKey : '',
                    issueType: res.data.issueType,
                    initialStateId: res.data.initialStateId,
                    resolvedStateId: res.data.resolvedStateId,
                    closedStateId: res.data.closedStateId,
                    reopenStateId: res.data.reopenStateId,
                    reporterEmail: res.data.reporterEmail ? res.data.reporterEmail : '',
                    clientId: res.data.clientID ? res.data.clientID : '',
                    clientSecret: res.data.clientSecret ? res.data.clientSecret : '',
                    jiraVersion: res.data.jiraVersion ? res.data.jiraVersion : 'cloud',
                    defaultValuesFields: res.data.defaultFieldsValues ? res.data.defaultFieldsValues : '',
                    searching: false,
                    isFetchedToken: res.data.isFetchedToken,
                    isValidToken: res.data.isValidToken,
                    jiraProjects: [],
                    issueTypes: [],
                    projectIdSelect: []
                });
                if (this.state.isFetchedToken) {
                    this.fetchJiraProjects();
                }
            })
            .catch(err => {
                console.log("Error fetchJiraConfig...")
                this.setState({ fetchError: err })
            })
    }

    fetchJavaConfiguration() {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetJavaConfiguration + "?sort=name,asc")
            .then(res => {
                this.setState({
                    javaConfiguration: res.data,
                    initialStateId: res.data[0].state,
                    resolvedStateId: res.data[0].state,
                    closedStateId: res.data[0].state,
                    reopenStateId: res.data[0].state,
                    searching: false,
                })
            })
            .catch(err => {
                console.log("Error fetch JavaConfiguration...")
                this.setState({ fetchError: err })
            })
    }

    fetchProjectStates(productId) {
        let { projectKey } = this.state
        if (projectKey) {
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.JiraProjectStates, { params: { productId, projectKey } })

                .then(res => {
                    this.state.projectStates = (res.data).map(p => ({ key: p }, { value: p.valueOf(), text: p.valueOf() }))
                    this.setState({ ableProjectStates: true })
                })
                .catch(err => {
                    console.log("Error fetch ProjectStates...")
                    this.setState({ fetchError: err })
                })
        }
    }

    validateFields(test, skipSetState) {
        let { productName, jiraServer } = this.state;
        let result = false;
        if (this.filledFields()) {
            result = true;
        }
        if (!skipSetState)
            this.setState({
                productNameError: productName === '',
            })
        return result;
    }

    filledFields() {
        let productName = this.state;
        return (productName !== '')
    }

    unfilledFields() {
        let { productName, jiraServer } = this.state;
        return (productName !== '' && jiraServer === '');
    }

    addRepository() {
        let { repositories, productRepositories, newRepositoryUrl, newRepositoryUser, newRepositoryPassword } = this.state;

        if (this.validateRepository(newRepositoryUrl, newRepositoryUser)) {
            repositories.push({
                url: newRepositoryUrl,
                user: newRepositoryUser,
                password: newRepositoryPassword,
                product: null,
                timestamp: new Date().getTime(),
                updated: new Date().getTime(),
                enabled: true,
            })
            productRepositories.push({
                url: newRepositoryUrl,
                user: newRepositoryUser,
                password: newRepositoryPassword,
                product: null,
            })
            this.setState({
                repositories,
                productRepositories,
            }, () => {
                this.clearNewRepositoryFields()
            })
        }
    }


    createRepository(productId) {
        let { repositories } = this.state;

        repositories.map((repository) => {
            axios({
                method: "POST",
                url: Api.getBaseUrl() + Api.ENDPOINTS.CreateCVSRepository,
                data: JSON.stringify({
                    url: repository.url,
                    user: repository.user,
                    password: repository.password,
                    product: productId,
                    timestamp: new Date().getTime(),
                    updated: new Date().getTime(),
                    enabled: true,
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            })
        })
    }

    deleteRepositories() {
        let { deletedRepositories } = this.state;

        deletedRepositories.map((repository) => {
            axios({
                method: "DELETE",
                url: Api.getBaseUrl() + Api.ENDPOINTS.DisableCVSRepository + repository.id,
            })
        })
    }

    clearProduct() {
        this.setState({
            enableEdit: false,
            productDescription: '',
            productName: '',
            packageNames: '',
            productImage: '',
            hasMultipleEnvironment: false,
            productEdit: null,
            showAdvanced: false,
            showGoals: false,
            showJira: false,
            productRepositories: [],
            repositories: [],
            newRepositoryUrl: '',
            newRepositoryUser: '',
            newRepositoryPassword: '',
            requiredTestCase: null,
            expectedTestCase: null,
            requiredPassRate: null,
            expectedPassRate: null,
            jiraVersion: 'cloud',
            triageTest: null,
            jiraServer: '',
            jiraServerError: false,
            projectKey: '',
            reporterEmail: '',
            reporterEmailError: false,
            clientId: '',
            clientIdError: false,
            clientSecret: '',
            clientSecretError: false,
            initialStateId: '',
            resolvedStateId: '',
            closedStateId: '',
            reopenStateId: '',
            issueTypes: [],
            issueType: '',
            jiraIdselect: [],
            defaultValuesFields: '',
            showNewPassword: false,
            jiraProjects: [],
            projectIdSelect: [],
            projectSecret: '',
            projectId: '',
            isFetchedToken: false,
            isValidToken: false,
            isErrorToken: false,
            infoModalOpen: false
        })
    }

    createProduct(test) {
        let {
            productRepositories,
            productName,
            packageNames,
            productImage,
            productDescription,
            requiredTestCase,
            expectedTestCase,
            requiredPassRate,
            expectedPassRate,
            hasMultipleEnvironment
        } = this.state;

        let newRepositories = productRepositories.map((repository) => {
            repository: repository.id
        });

        axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.CreateProduct,
            data: JSON.stringify({
                containers: [],
                deadlines: [],
                description: productDescription,
                enabled: true,
                name: productName,
                note: null,
                timestamp: new Date().getTime(),
                updated: new Date().getTime(),
                packageNames: packageNames,
                logo: productImage,
                repositories: newRepositories,
                hasMultipleEnvironment: hasMultipleEnvironment
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                let idProduct = res.data.id;

                if (!!this.props.storeData)
                    this.props.storeData("product", idProduct)

                productRepositories.map((repository) => {
                    this.saveRepositories(idProduct)
                });

                //Acá hago el post del productGoal asociado
                axios({
                    method: "POST",
                    url: Api.getBaseUrl() + Api.ENDPOINTS.CreateProductGoal,
                    params: {
                        productid: idProduct,
                    },
                    data: JSON.stringify({
                        enabled: true,
                        timestamp: new Date().getTime(),
                        updated: new Date().getTime(),
                        requiredTestCase: requiredTestCase,
                        expectedTestCase: expectedTestCase,
                        requiredPassRate: requiredPassRate,
                        expectedPassRate: expectedPassRate
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                if (this.state.productId != null) {
                    this.enableJiraConfig(test)
                } else {
                    this.setState({ productId: res.data.id });
                    this.enableJiraConfig(test)
                }
                if (test === false) {
                    this.setState({
                        productName: '',
                        productDescription: '',
                        packageNames: '',
                        productImage: '',
                        hasMultipleEnvironment: false,
                        productRepositories: [],
                        showAdvanced: false,
                        showGoals: false,
                        showJira: false,
                        jiraVersion: 'cloud',
                        triageTest: 'true',
                        jiraServer: '',
                        projectKey: '',
                        reporterEmail: '',
                        clientId: '',
                        clientSecret: '',
                        javaConfiguration: [],
                        initialStateId: '',
                        resolvedStateId: '',
                        closedStateId: '',
                        reopenStateId: '',
                    })
                }
                this.fetchProducts();
                this.fetchJavaConfiguration()
            })
    }

    enableJiraConfig(test) {
        let { jiraVersion, jiraServer, reporterEmail, cloudId, projectKey, issueType,
            clientId, defaultValuesFields, clientSecret, productId, initialStateId,
            resolvedStateId, closedStateId, reopenStateId } = this.state;
        let body = {
            jiraVersion: jiraVersion,
            jiraUrl: jiraServer,
            reporterEmail: reporterEmail,
            clientID: clientId,
            initialStateId: initialStateId,
            resolvedStateId: resolvedStateId,
            closedStateId: closedStateId,
            reopenStateId: reopenStateId,
            clientSecret: clientSecret,
            product: productId,
            projectKey: projectKey,
            issueType: issueType,
            defaultFieldsValues: defaultValuesFields,
        }
        this.saveJiraConfig(body, productId, test)
    }

    saveJiraConfig(body, productId, test) {
        axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.SaveJiraConfig + "?productId=" + productId,
            data: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (test === true) {
                    this.setState({ iddBd: res.data.id });
                }
            })
    }

    saveRepositories(productId) {
        let { productRepositories } = this.state;

        productRepositories.map((repository) => {
            if (repository.product != null) {
                this.enableRepository({
                    ...repository,
                    url: repository.url,
                    user: repository.user,
                    password: repository.password,
                    product: productId,
                    updated: new Date().getTime(),
                    timestamp: new Date().getTime(),
                })
            }
        })
    }

    saveProduct(test) {
        let { productName, productDescription, packageNames, productImage, productEdit, productRepositories } = this.state;
        this.enableProduct({
            ...productEdit,
            description: productDescription,
            name: productName,
            updated: new Date().getTime(),
            packageNames: packageNames,
            logo: productImage,
            repositories: productRepositories.map((repository) => {
                repository: repository.id
            }),
        });
        this.enableJiraConfig(test)
        if (test === false) {
            this.clearProduct()
        }
    }

    enableEditProduct(index) {
        let { productList } = this.state;
        let product = productList[index];
        this.fetchCvsRepositories(product.id)
        this.fetchJiraConfig(product.id)
        this.setState({
            enableEdit: true,
            productDescription: product.description ? product.description : '',
            productImage: product.logo,
            productName: product.name,
            packageNames: product.packageNames ? product.packageNames : '',
            productEdit: product,
            productId: product.id,
        }, () => scrollToTop())
    }

    enableProduct(product) {
        axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateProduct,
            data: JSON.stringify({ ...product, enabled: true }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                this.fetchProducts()
            })
    }

    enableRepository(repository) {
        axios({
            method: "PUT",
            url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateCVSRepository,
            data: JSON.stringify({
                ...repository,
                enabled: true
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    handleClickShowPassword = () => {
        this.setState({ ...this.state, showNewPassword: !this.state.showNewPassword });
    }

    handleCloseInfoModal = () => {
        this.setState({ infoModalOpen: false })
    }
    handleOpenInfoModal = () => {
        this.setState({ infoModalOpen: true })
    }

    disableProduct(id) {
        axios({
            method: "DELETE",
            url: Api.getBaseUrl() + Api.ENDPOINTS.DisableProduct + id,
        })
            .then(res => this.fetchProducts())
    }

    onProductNameChange(ev) {
        let { value } = ev.target;
        this.setState({
            productName: value,
            productNameError: false,
        })
    }

    onProductDescriptionChange(ev) {
        let { value } = ev.target;
        this.setState({
            productDescription: value,
        })
    }

    onPackageNameChange(ev) {
        let { value } = ev.target;
        this.setState({
            packageNames: value,
        })
    }

    onImageChange(ev) {
        let reader = new FileReader()
        let this1 = this;
        reader.onloadend = function () {
            this1.setState({
                productImage: reader.result,
            })
        }
        if (ev.target.files.length > 0) {
            reader.readAsDataURL(ev.target.files[0])
        }
    }

    onHasMultipleEnvironmentChange(ev) {
        let { checked } = ev.target;
        this.setState({
            hasMultipleEnvironment: checked,
        })
    }
    copyProduct(index) {
        let { productList } = this.state
        let product = productList[index]

        axios({
            method: "POST",
            url: Api.getBaseUrl() + Api.ENDPOINTS.CreateProduct,
            data: JSON.stringify({
                containers: [],
                deadlines: [],
                description: product.description ? product.description : '',
                enabled: true,
                name: "COPY-" + product.name,
                note: null,
                timestamp: new Date().getTime(),
                updated: new Date().getTime(),
                packageNames: product.packageNames ? product.packageNames : '',
                logo: product.logo,
                repositories: product.repositories,
                hasMultipleEnvironment: product.hasMultipleEnvironment
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                this.fetchJiraConfig(product.id)
                let newProductId = res.data.id;
                this.fetchProducts(),
                    this.state.productId = newProductId;
                console.log(this.state.productId)
                this.enableJiraConfig()

                this.setState({
                    enableEdit: true,
                    productDescription: res.data.description ? res.data.description : '',
                    productImage: res.data.logo,
                    productName: res.data.name,
                    packageNames: res.data.packageNames ? res.data.packageNames : '',
                    productEdit: res.data,
                    productRepositories: res.data.repositories,
                    productId: res.data.id,
                }, () => scrollToTop())
            })
    }

    getListItem(product, index, disabled) {
        return (
            <ListItem key={product.id} style={{ opacity: disabled ? '.5' : '1' }}>
                <ListItemAvatar>
                    <Avatar src={product.logo ? product.logo : ''}>
                        {!product.logo && <AppIcon />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={product.name}
                    secondary={"Modified on " + new Date(product.updated).toLocaleDateString("en-US", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                    })}
                />
                <ListItemSecondaryAction>
                    <Tooltip title={"Edit"}>
                        <IconButton
                            style={{
                                opacity: product.enabled ? '1' : '.5',
                                cursor: product.enabled ? 'pointer' : 'default',
                            }}
                            onClick={
                                product.enabled ?
                                    this.enableEditProduct.bind(this, index)
                                    : null
                            }
                            aria-label="Edit">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={product.enabled ? 'Deactivate' : 'Activate'}>
                        <IconButton
                            onClick={
                                product.enabled ?
                                    this.disableProduct.bind(this, product.id)
                                    : this.enableProduct.bind(this, product)
                            }
                            aria-label="Delete">
                            {product.enabled && <RemoveCircleIcon />}
                            {!product.enabled && <AddCircleIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Copy"}>
                        <IconButton
                            style={{
                                opacity: product.enabled ? '1' : '.5',
                                cursor: product.enabled ? 'pointer' : 'default',
                            }}
                            onClick={
                                product.enabled ?
                                    this.copyProduct.bind(this, index)
                                    : null
                            }
                            aria-label="Copy">
                            <FileCopyIcon />
                        </IconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    renderList = () => {
        let { productList } = this.state;
        let rows = []
        let rowsDisabled = []

        if (productList) {
            productList.map((product, index) => {
                if (product.enabled) {
                    rows.push(this.getListItem(product, index, false))
                } else {
                    rowsDisabled.push(this.getListItem(product, index, true))
                }
                return null;
            })
        }
        if (rowsDisabled.length > 0) {
            rows = rows.concat(<Divider key="divider" />)
        }
        rows = rows.concat(rowsDisabled)
        return <List>{rows}</List>
    }

    setRepositoryFields = name => event => {
        let { newRepositoryNameError } = this.state
        let { value } = event.target
        this.setState({
            [name]: value,
            newRepositoryNameError: name === 'newRepositoryName' && value === '',
        })
    }


    updateRepository = (field, repositoryId) => event => {
        let { productRepositories } = this.state
        let { value } = event.target
        let repository = productRepositories[repositoryId]
        let elem;
        repository[field] = value
        if (value === '') {
            elem = document.getElementById(`${field}-${repositoryId}`)
            if (elem)
                elem.style.display = 'block'
        } else {
            elem = document.getElementById(`${field}-${repositoryId}`)
            if (elem)
                elem.style.display = 'none'
        }
        this.setState({
            productRepositories,
        })
    }

    removeRepository(index) {
        let { repositories, productRepositories, deletedRepositories } = this.state;

        let repository = productRepositories[index];
        if (repository.product == null) {
            //find in new repositories (repositories)
            repositories = _.reject(repositories, function (newRepository) { return newRepository != repository });
        }
        else {
            deletedRepositories.push(repository);
        }

        productRepositories.splice(index, 1)

        this.setState({
            productRepositories,
            deletedRepositories,
            repositories
        })
    }

    validateRepository(newRepositoryUrl, newRepositoryUser) {
        this.setState({
            newRepositoryUrlError: newRepositoryUrl === '',
            newRepositoryUserError: newRepositoryUser === '',
        })
        return (newRepositoryUrl !== '') && (newRepositoryUser !== '')
    }

    clearNewRepositoryFields() {
        this.setState({
            newRepositoryUrl: '',
            newRepositoryUser: '',
            newRepositoryPassword: '',
        })
    }

    resetJiraConfigError() {
        this.setState({
            jiraServerError: false,
            reporterEmailError: false,
            clientIdError: false,
            clientSecretError: false,
        })
    }

    renderRepositories() {
        let { productRepositories, repositories } = this.state;
        return productRepositories.map((repository, index) => {

            return (
                <ListItem
                    key={index}
                    style={{ padding: '5px 0' }}
                >
                    <ListItemText
                        style={{ padding: 0 }}
                        primary={
                            <Grid className="manualTestStepListItemText" container spacing={2}>
                                <Grid item xs={4}>
                                    <InputBase
                                        id={"repositoryUrl_" + index}
                                        placeholder="Url repository"
                                        style={{ fontSize: '.875rem' }}
                                        value={repository.url}
                                        onChange={this.updateRepository('url', repository)}
                                        inputProps={{
                                            style: {
                                                minHeight: '18px'
                                            }
                                        }}
                                        fullWidth
                                        multiline
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <InputBase
                                        id={"repositoryUser_" + index}
                                        placeholder="User"
                                        style={{ fontSize: '.875rem' }}
                                        value={repository.user}
                                        onChange={this.updateRepository('user', repository)}
                                        inputProps={{
                                            style: {
                                                minHeight: '18px'
                                            }
                                        }}
                                        maxRows={15}
                                        fullWidth
                                        multiline
                                    />
                                </Grid>
                                <Grid item xs={5} style={{ display: 'flex', alignItems: 'center' }}>
                                    <InputBase
                                        id={"repositoryPassword_" + index}
                                        placeholder="Password"
                                        style={{ fontSize: '.875rem' }}
                                        value={repository.password}
                                        type={"password"}
                                        onChange={this.updateRepository('password', repository)}

                                        inputProps={{
                                            onFocus: null,
                                            style: {
                                                minHeight: '18px'
                                            }
                                        }}
                                        maxRows={15}
                                        fullWidth
                                    //multiline
                                    />
                                    <Tooltip title={'Remove Repository'}>
                                        <IconButton
                                            onClick={this.removeRepository.bind(this, index)}
                                            style={{ padding: '0px 6px' }}
                                            aria-label="Remove Repository">
                                            <RemoveCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        } />
                </ListItem>
            )
        })
    }

    tryTest(ev) {
        this.enableJiraConfig(true);
        this.onJiraProjects();
        this.setState({
            projectKey: '',
            issueType: '',
            initialStateId: '',
            reopenStateId: '',
            resolvedStateId: '',
            closedStateId: '',
            jiraProjects: [],
            issueTypes: [],
            projectIdSelect: []
        });
    }

    onSubmit(ev, test = false) {
        ev.preventDefault()

        if (this.validateFields(test)) {
            if (this.state.enableEdit) {
                this.saveRepositories(this.state.productEdit.id)
                this.createRepository(this.state.productEdit.id)
                this.deleteRepositories()
                this.fetchCvsRepositories(this.state.productEdit)
                this.saveProduct(test)
            } else {
                this.createRepository(null)
                this.createProduct(test)
            }

            this.resetJiraConfigError()
            this.openSnackbar()
            if (this.props.wizardMode)
                this.wizardNext();
        }
    }

    onRequiredTestCases = () => event => {
        let { requiredTestCase } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if (regex.test(value)) {
            requiredTestCase = value;
            this.setState({
                requiredTestCase
            })
        } else {
            console.log("No es número")
        }
    }

    onExpectedTestCases = () => event => {
        let { expectedTestCase } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if (regex.test(value)) {
            expectedTestCase = value;
            this.setState({
                expectedTestCase
            })
        } else {
            console.log("No es número")
        }
    }

    onRequiredPassRate = () => event => {
        let { requiredPassRate } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if (regex.test(value)) {
            requiredPassRate = value;
            this.setState({
                requiredPassRate
            })
        } else {
            console.log("No es número")
        }
    }

    onExpectedPassRate = () => event => {
        let { expectedPassRate } = this.state,
            { value } = event.target;

        let regex = new RegExp("^$|^[0-9]+$");
        if (regex.test(value)) {
            expectedPassRate = value;
            this.setState({
                expectedPassRate
            })
        } else {
            console.log("No es número")
        }
    }

    validateTest() {
        this.setState({ validateTest: true })
    }

    onJiraVersionChange(e) {
        this.setState({
            jiraVersion: e.target.value,
        })
    }

    handlechangeJiraProjects(event) {
        let { value } = event.target
        this.setState({
            projectKey: value,
        })
        this.fetchisuetype()
        this.fetchProjectStatus()
    }
    handlerChangeType(event) {
        let { value } = event.target
        this.setState({
            issueType: value,
        })

    }
    onTriageTestChange(e) {
        this.setState({
            triageTest: e.target.value,
        })
    }

    fetchisuetype() {
        let { productId, projectKey } = this.state
        if (projectKey) {
            axios.get(Api.getBaseUrl() + Api.ENDPOINTS.JiraIssuetype, { params: { productId, projectId: projectKey } })
                .then(resp => {

                    let { data } = resp
                    const issueTypes = data.map(({ name, id }) => ({ name, id }));
                    this.setState({ issueTypes: issueTypes })
                })
                .catch(err => {

                    console.log("Error fetchisuetype...")
                    this.setState({ fetchError: err })
                })
        }
    }

    onJiraServerChange = () => ev => {
        let { value } = ev.target;
        this.setState({
            jiraServer: value,
            isFetchedToken: false,
            isValidToken: false
        })
    }

    throwFetchProjectStates() {
        this.fetchProjectStates(this.state.productId)
    }

    onProjectIdChange(e) {
        this.setState({
            clientId: e.target.value,
            isFetchedToken: false,
            isValidToken: false
        })
        this.throwFetchProjectStates()
    }
    onProjectSecretChange(e) {
        this.setState({
            clientSecret: e.target.value,
            isFetchedToken: false,
            isValidToken: false
        })
    }

    select = name => event => {

        if (name == "connector") {
            this.setState({
                connectorName: event.currentTarget.attributes[3].value,
            })
        }

        this.setState({
            [name]: event.target.value
        })
    }

    onReporterEmailChange = () => ev => {
        let { value } = ev.target;
        this.setState({
            reporterEmail: value,
        })
    }

    onClientIdChange = () => ev => {
        let { value } = ev.target;
        this.setState({
            clientId: value,
        })
    }

    onClientSecretChange = () => ev => {
        let { value } = ev.target;
        this.setState({
            clientSecret: value,
        })
    }

    validateClientSecret() {
        this.setState({ clientSecretError: (!this.state.clientSecret.match(validClientSecret)) })
    }

    onInitialStateIdChange(e) {
        this.setState({
            initialStateId: e.target.value,

        })
    }

    onResolvedStateIdChange(e) {
        this.setState({
            resolvedStateId: e.target.value,
        })
    }

    onClosedStateIdChange(e) {
        this.setState({
            closedStateId: e.target.value,
        })
    }

    onReopenStateIdChange(e) {
        this.setState({
            reopenStateId: e.target.value,
        })
    }

    onDefaultValuesFieldsChange(e) {
        this.setState({
            defaultValuesFields: e.target.value,
        })
    }

    onClickShowGoals = () => event => {
        let { showAdvanced, showGoals, showJira } = this.state;
        if (!showAdvanced && !showGoals && !showJira) {
            showGoals = true;
            this.setState({
                showGoals
            })
        } else if (showAdvanced && !showGoals && !showJira) {
            showAdvanced = false;
            showGoals = true;
            this.setState({
                showGoals,
                showAdvanced
            })
        } else if (!showAdvanced && !showGoals && showJira) {
            showGoals = true;
            showJira = false;
            this.setState({
                showGoals,
                showJira
            })
        } else {
            showGoals = false;
            this.setState({
                showGoals
            })
        }
    }

    onClickShowAdvanced = () => event => {
        let { showAdvanced, showGoals, showJira } = this.state;
        if (!showAdvanced && !showGoals && !showJira) {
            showAdvanced = true;
            this.setState({
                showAdvanced
            })
        } else if (!showAdvanced && showGoals && !showJira) {
            showAdvanced = true;
            showGoals = false;
            this.setState({
                showGoals,
                showAdvanced
            })
        } else if (!showAdvanced && !showGoals && showJira) {
            showAdvanced = true;
            showJira = false;
            this.setState({
                showAdvanced,
                showJira
            })
        } else {
            showAdvanced = false;
            this.setState({
                showAdvanced
            })
        }
    }

    onClickShowJira = () => event => {
        let { showAdvanced, showGoals, showJira } = this.state;
        if (!showAdvanced && !showGoals && !showJira) {
            showJira = true;
            this.setState({
                showJira
            })
        } else if (showAdvanced && !showGoals && !showJira) {
            showAdvanced = false;
            showJira = true;
            this.setState({
                showAdvanced,
                showJira
            })
        } else if (!showAdvanced && showGoals && !showJira) {
            showGoals = false;
            showJira = true;
            this.setState({
                showGoals,
                showJira
            })
        } else {
            showJira = false;
            this.setState({
                showJira
            })
            this.resetJiraConfigError()
        }
    }

    openSnackbar() {
        this.setState({ showSnackbar: true })
    }

    closeSnackbar() {
        this.setState({ showSnackbar: false })
    }

    wizardUpdate = () => {
        let { data } = this.props;
        let id = data.product
        let index = this.state.productList.findIndex(x => x.id == id);
        this.enableEditProduct(index);
    }

    wizardNext = () => {
        let { nextStep } = this.props

        if (this.state.skipped)
            this.setState({ skipped: false })
        nextStep()
    }

    wizardPrevious = () => {
        let { setPrevious, previousStep } = this.props;

        setPrevious();
        previousStep();
    }

    wizardSkip = () => {
        let { nextStep } = this.props

        this.setState({ skipped: true })
        nextStep()
    }

    render() {
        let {
            productName,
            productDescription,
            productList,
            packageNames,
            imageFocus,
            productNameError,
            newRepositoryUrl,
            newRepositoryUser,
            newRepositoryPassword,
            newRepositoryUrlError,
            newRepositoryUserError,
            showNewPassword,
            jiraServer,
            jiraServerError,
            clientId,
            clientSecret,
            jiraProjects,
            issueTypes,
            projectIdSelect,
            isFetchedToken,
            isValidToken,
            isErrorToken
        } = this.state

        let { wizardMode } = this.props
        return (
            <div style={{ display: 'flex' }}>
                <SideMenu />
                <div style={{ 'width': '100%' }} className="CenterList">
                    <form onSubmit={this.onSubmit.bind(this)} className="Containers-Form">
                        <div className="Containers-Main">
                            <Card>
                                <CardContent style={{ 'maxWidth': '80vw' }}>
                                    <h4>Products</h4>
                                    <div>Generally this is the product under testing.</div>
                                    <TextFieldInput
                                        id="productName"
                                        label="Short Name"
                                        placeholder="A short name for the product"
                                        error={productNameError}
                                        helperText={productNameError ? 'Required field' : ''}
                                        onChange={this.onProductNameChange.bind(this)}
                                        autoFocus={true}
                                        value={productName}
                                    />
                                    <TextFieldInput
                                        id="productDescription"
                                        label="Description"
                                        placeholder="A description for the product"
                                        onChange={this.onProductDescriptionChange.bind(this)}
                                        value={productDescription}
                                    />

                                    <Accordion
                                        style={{ marginTop: 20, border: '1px solid rgba(0, 0, 0, .125)', marginBottom: -1 }}
                                        expanded={this.state.showGoals}
                                        onChange={this.onClickShowGoals()}>
                                        <AccordionSummary
                                            style={{ minHeight: "42px", maxHeight: "42px", backgroundColor: "#F7F7F7" }}
                                            expandIcon={<ExpandMoreIcon />}>
                                            {/*<Grid container justify="flex-end">*/}
                                            <b><span
                                                // color="primary"
                                                style={{ fontSize: '.75rem' }}>
                                                GOALS OPTIONS</span></b>
                                            {/*</Grid>*/}
                                        </AccordionSummary>
                                        <AccordionDetails style={{ display: "inherit" }}>
                                            <div>
                                                <Grid item xs={12}>


                                                    <Grid container item xs={12} spacing={0}>
                                                        <Grid container item xs={6} spacing={0}>
                                                            <Grid container item xs={12} spacing={0} >
                                                                <b>
                                                                    <span style={{ fontSize: '.85rem' }}>TEST CASES</span>
                                                                </b>
                                                            </Grid>
                                                            <small>Number of test cases expected.</small>
                                                        </Grid>

                                                        <Grid container item xs={6} >
                                                            <Grid container item xs={12} >
                                                                <b>
                                                                    <span style={{ fontSize: '.85rem' }}>PASS RATE</span>
                                                                </b>
                                                            </Grid>
                                                            <small>More Pass Tests! Percentage improvement of the amount of passing tests</small>
                                                            <small>i.e. 5% means next month your suite will have 5% more test passing</small>
                                                        </Grid>

                                                        <Grid container item xs={2}>
                                                            <TextField
                                                                id="testCaseRequired"
                                                                label="Required"
                                                                value={!!this.state.requiredTestCase ? this.state.requiredTestCase : ''}
                                                                onChange={this.onRequiredTestCases()}
                                                                placeholder="10"
                                                                spellCheck={false}
                                                                variant="outlined"
                                                                InputLabelProps={{ shrink: true }}
                                                                style={{
                                                                    marginTop: 10,
                                                                    marginLeft: 15,
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid container item xs={2}>
                                                            <TextField
                                                                id="testCaseExpected"
                                                                label="Expected"
                                                                value={!!this.state.expectedTestCase ? this.state.expectedTestCase : ''}
                                                                onChange={this.onExpectedTestCases()}
                                                                placeholder="20"
                                                                spellCheck={false}
                                                                variant="outlined"
                                                                InputLabelProps={{ shrink: true }}
                                                                style={{
                                                                    marginTop: 10,
                                                                    marginLeft: 15,
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid container item xs={2}>
                                                        </Grid>
                                                        <Grid container item xs={2} >
                                                            <TextField
                                                                id="passRateRequired"
                                                                label="Required"
                                                                value={!!this.state.requiredPassRate ? this.state.requiredPassRate : ''}
                                                                onChange={this.onRequiredPassRate()}
                                                                placeholder="10"
                                                                spellCheck={false}
                                                                variant="outlined"
                                                                InputLabelProps={{ shrink: true }}
                                                                style={{
                                                                    marginTop: 10,
                                                                    marginLeft: 15,
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid container item xs={2} >
                                                            <TextField
                                                                id="passRateExpected"
                                                                label="Expected"
                                                                value={!!this.state.expectedPassRate ? this.state.expectedPassRate : ''}
                                                                onChange={this.onExpectedPassRate()}
                                                                placeholder="16"
                                                                spellCheck={false}
                                                                variant="outlined"
                                                                InputLabelProps={{ shrink: true }}
                                                                style={{
                                                                    marginTop: 10,
                                                                    marginLeft: 15,
                                                                }}
                                                            />
                                                        </Grid>

                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Accordion
                                        style={{ marginBottom: -1, marginTop: -1, border: '1px solid rgba(0, 0, 0, .125)' }}
                                        expanded={this.state.showJira}
                                        onChange={this.onClickShowJira()}>
                                        <AccordionSummary
                                            style={{ minHeight: "42px", maxHeight: "42px", backgroundColor: "#F7F7F7" }}
                                            expandIcon={<ExpandMoreIcon />}>
                                            <b><span
                                                // color="primary"
                                                style={{ fontSize: '.75rem' }}>
                                                JIRA OPTIONS</span></b>
                                        </AccordionSummary>
                                        <AccordionDetails style={{ display: "inherit" }}>
                                            <div>
                                                <div>
                                                    <Grid container spacing={2} style={{ justifyContent: "flex-end" }}>
                                                        <Grid item xs={11} style={{ 'display': 'flex', 'justifyContent': 'left', 'alignItems': 'center' }}>
                                                            <div>Jira integration allows to file tickets automatically. If there is an automation failure, it'll create a jira ticket! read more</div>
                                                        </Grid>
                                                        <Grid item xs={1} style={{ justifyContent: 'flex-end' }}>
                                                            <AlertDialogSlide></AlertDialogSlide>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextFieldInput
                                                                style={{ opacity: 5 }}
                                                                id="jiraServer"
                                                                label="Jira Server"
                                                                value={jiraServer}
                                                                onChange={this.onJiraServerChange()}
                                                                error={jiraServerError}
                                                                helperText={jiraServerError ? 'Must be a valid URL' : ''}
                                                                placeholder="https://your-domain.atlassian.net"
                                                            >

                                                            </TextFieldInput>

                                                            <TextFieldInput
                                                                id="projectKey"
                                                                label="Client ID"
                                                                // variant="filled"
                                                                value={clientId}
                                                                onChange={this.onProjectIdChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                            >
                                                            </TextFieldInput>
                                                            <TextFieldInput
                                                                id="projectSecret"
                                                                label="Client Secret"
                                                                type='password'
                                                                // variant="filled"
                                                                value={clientSecret}
                                                                onChange={this.onProjectSecretChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                            >
                                                            </TextFieldInput>

                                                        </Grid>
                                                        <Grid item xs={10}>
                                                            <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                {isFetchedToken ?
                                                                    (isValidToken ?
                                                                        <React.Fragment>
                                                                            Jira is connected
                                                                            <CheckCircleIcon style={{ marginLeft: "8px", color: COLORS.green }} />
                                                                        </React.Fragment> :
                                                                        isErrorToken ?
                                                                            <React.Fragment>
                                                                                Error connecting to JIra, check the credentials
                                                                                <ErrorIcon color="secondary" style={{ marginLeft: "8px" }} />
                                                                            </React.Fragment>
                                                                            :
                                                                            <React.Fragment>
                                                                                Access token is expired, please reconnect
                                                                                <ErrorIcon color="secondary" style={{ marginLeft: "8px" }} />
                                                                            </React.Fragment>)
                                                                    :
                                                                    <React.Fragment>
                                                                        Fill the fields above and click on connect to establish a connection
                                                                        <ErrorIcon style={{ marginLeft: "8px" }} />
                                                                    </React.Fragment>
                                                                }
                                                            </div>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <CardActions style={{ justifyContent: 'flex-end' }}>
                                                                <Button
                                                                    onClick={this.tryTest.bind(this)}
                                                                    type="button"
                                                                    className="globalButton"
                                                                    variant="contained"
                                                                    style={{ backgroundColor: COLORS.green1, color: 'white' }}
                                                                    disabled={!clientId || !jiraServer || !clientSecret}>
                                                                    Connect
                                                                </Button>
                                                            </CardActions>
                                                        </Grid>
                                                        <Grid item xs={1} ></Grid>
                                                        <Grid item xs={4} >
                                                            <TextFieldInput
                                                                id="projectKeys"
                                                                select
                                                                value={this.state.projectKey}
                                                                label="Select Project"
                                                                onChange={this.handlechangeJiraProjects.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                disabled={!jiraProjects.length}
                                                            >
                                                                {jiraProjects.map((jiraProject, index) => (
                                                                    <MenuItem className="globalMenuItem" key={index} value={jiraProject.id}>{jiraProject.name}</MenuItem>
                                                                ))}
                                                            </TextFieldInput>
                                                        </Grid>
                                                        <Grid item xs={3} ></Grid>
                                                        <Grid item xs={2} >
                                                            <TextFieldInput
                                                                id="issueType"
                                                                select
                                                                label="Select Issue Type"
                                                                value={this.state.issueType}
                                                                onChange={this.handlerChangeType.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                disabled={!issueTypes.length}
                                                            >
                                                                {issueTypes.map((type, index) => (
                                                                    <MenuItem className="globalMenuItem" key={index} value={type.id}>{type.name}</MenuItem>
                                                                ))}
                                                            </TextFieldInput></Grid>
                                                        <Grid item xs={2} ></Grid>
                                                        <Grid item xs={3} >
                                                            <TextFieldInput
                                                                id="initialStateId"
                                                                select
                                                                label="Initial State ID"
                                                                value={this.state.initialStateId}
                                                                onChange={this.onInitialStateIdChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                disabled={!projectIdSelect.length}
                                                            >
                                                                {projectIdSelect.map((type, index) => (
                                                                    <MenuItem className="globalMenuItem" key={index} value={type.id}>{type.name}</MenuItem>
                                                                ))}
                                                            </TextFieldInput>
                                                        </Grid>
                                                        <Grid item xs={3} >
                                                            <TextFieldInput
                                                                id="reopenStateId"
                                                                select
                                                                label="Reopen State ID"
                                                                value={this.state.reopenStateId}
                                                                onChange={this.onReopenStateIdChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                disabled={!projectIdSelect.length}
                                                            >
                                                                {projectIdSelect.map((type, index) => (
                                                                    <MenuItem className="globalMenuItem" key={index} value={type.id}>{type.name}</MenuItem>
                                                                ))}
                                                            </TextFieldInput>
                                                        </Grid>
                                                        <Grid item xs={3} >
                                                            <TextFieldInput
                                                                id="resolvedStateId"
                                                                select
                                                                label="Resolved State ID"
                                                                value={this.state.resolvedStateId}
                                                                onChange={this.onResolvedStateIdChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                disabled={!projectIdSelect.length}
                                                            >
                                                                {projectIdSelect.map((type, index) => (
                                                                    <MenuItem className="globalMenuItem" key={index} value={type.id}>{type.name}</MenuItem>
                                                                ))}
                                                            </TextFieldInput>
                                                        </Grid>
                                                        <Grid item xs={3} >
                                                            <TextFieldInput
                                                                id="closedStateId"
                                                                select
                                                                label="Closed State ID"
                                                                value={this.state.closedStateId}
                                                                onChange={this.onClosedStateIdChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                disabled={!projectIdSelect.length}
                                                            >
                                                                {projectIdSelect.map((type, index) => (
                                                                    <MenuItem className="globalMenuItem" key={index} value={type.id}>{type.name}</MenuItem>
                                                                ))}
                                                            </TextFieldInput>
                                                        </Grid>
                                                        <Grid item xs={8}>
                                                            <div style={{ textAlign: "center" }}>
                                                                {"Default values of required fields for tickets. All the fields must be enclosed in square brackets."}
                                                            </div>
                                                            <div style={{ textAlign: "center" }}>
                                                                {"For example: [{\"exampleTextField\": \"exampleText\"}, {\"exampleSelectField\": {\"value\": \"exampleSelectOption\"}}]"}
                                                            </div>
                                                        </Grid>
                                                        <Grid item xs={2} style={{ justifyContent: 'flex-end' }}>
                                                            <div style={{ justifyContent: "flex-end" }}>
                                                                <CardActions style={{ justifyContent: 'flex-end' }}>
                                                                    <Button variant="outlined" style={{ backgroundColor: COLORS.blueLight, color: 'white', borderRadius: '5px' }} onClick={this.handleOpenInfoModal}>
                                                                        FORMAT
                                                                    </Button>
                                                                </CardActions>
                                                                <Dialog
                                                                    open={this.state.infoModalOpen}
                                                                    onClose={this.handleCloseInfoModal}
                                                                    aria-labelledby="alert-dialog-slide-title"
                                                                    aria-describedby="alert-dialog-slide-description"
                                                                >
                                                                    <DialogTitle id="alert-dialog-slide-title">
                                                                        {"Jira Fields Format"}
                                                                    </DialogTitle>
                                                                    <DialogContent>
                                                                        <DialogContentText id="alert-dialog-slide-description">
                                                                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                                                <TableBody>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Text</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": \"Body Text\"}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Number</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": 123}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Checkbox</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": [{\"value\" : \"option1\"}, {\"value\" : \"option2\"}]}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            or
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": [{\"id\" : 10112}, {\"id\" : 10115}]}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Date Picker</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": \"YYYY-MM-DD\"}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Date Time Picker</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": \"YYYY-MM-DDThh:mm:ss.sTZD\"}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Labels Picker</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": [\"label1\", \"label2\"]}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Radio Button</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"value\" : \"option\"}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            or
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"id\" : 10112}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Cascading</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"value\": \"parent_option\", \"child\": {\"value\": \"child_option\"}}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            or
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"id\": 10112, \"child\": {\"id\": 10115}}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Single-select</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"value\" : \"option\"}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            or
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"id\" : 10112}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Multi-select</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": [{\"value\" : \"option1\"}, {\"value\" : \"option2\"}]}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            or
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row"></TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": [{\"id\" : 10112}, {\"id\" : 10115}]}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Single-user Picker</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": {\"name\" : \"username\"}}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell component="th" scope="row">Multi-user Picker</TableCell>
                                                                                        <TableCell align="center">
                                                                                            {"{\"Name Field\": [{\"name\" : \"username1\"}, {\"name\" : \"username2\"}]}"}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                </TableBody>
                                                                            </Table>
                                                                        </DialogContentText>
                                                                    </DialogContent>
                                                                    <DialogActions>
                                                                        <Button onClick={this.handleCloseInfoModal} color="primary">
                                                                            Understand
                                                                        </Button>
                                                                    </DialogActions>
                                                                </Dialog>
                                                            </div>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextFieldInput
                                                                id="defaultValuesFields"
                                                                label="Default values"
                                                                value={this.state.defaultValuesFields}
                                                                onChange={this.onDefaultValuesFieldsChange.bind(this)}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '.875rem',
                                                                    },
                                                                }}
                                                                multiline
                                                                disabled={!projectIdSelect.length}
                                                            >
                                                            </TextFieldInput>
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>

                                    <Accordion
                                        style={{ marginBottom: -1, marginTop: -1, border: '1px solid rgba(0, 0, 0, .125)' }}
                                        expanded={this.state.showAdvanced}
                                        onChange={this.onClickShowAdvanced()}>
                                        <AccordionSummary
                                            style={{ minHeight: "42px", maxHeight: "42px", backgroundColor: "#F7F7F7" }}
                                            expandIcon={<ExpandMoreIcon />}>
                                            <b><span
                                                // color="primary"

                                                style={{ fontSize: '.75rem' }}>
                                                ADVANCED OPTIONS</span></b>
                                        </AccordionSummary>
                                        <AccordionDetails style={{ display: "inherit" }}>
                                            <div>
                                                <Grid container justifyContent="space-between">
                                                    <Grid item>
                                                        <div className={'Containers-AssigneeContainer'}>
                                                            <fieldset
                                                                className={imageFocus ? 'Containers-AssigneeFieldset-active' : 'Containers-AssigneeFieldset'}>
                                                                <legend
                                                                    className={imageFocus ? 'Containers-AssigneeLabel-active' : 'Containers-AssigneeLabel'}>
                                                                    <span style={{ marginLeft: '-3', marginRight: '-3' }}>Product image</span>
                                                                </legend>
                                                                <div style={{ display: 'flex' }}>
                                                                    <Button
                                                                        onFocus={() => this.setState({ imageFocus: true })}
                                                                        onBlur={() => this.setState({ imageFocus: false })}
                                                                        onChange={this.onImageChange.bind(this)}
                                                                        variant="contained">
                                                                        <input type="file" />
                                                                    </Button>
                                                                    <Avatar style={{ marginLeft: 10 }}
                                                                        src={this.state.productImage}>
                                                                        {!this.state.productImage && <AppIcon />}
                                                                    </Avatar>
                                                                </div>
                                                            </fieldset>
                                                        </div>
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <TextFieldInput
                                                            id="productPackages"
                                                            label="Packages"
                                                            helperText="Please enter the package names where your product is implemented. Typical names are: org.productName or com.productName"
                                                            placeholder="A comma separated list of package names"
                                                            onChange={this.onPackageNameChange.bind(this)}
                                                            value={packageNames}
                                                        />
                                                    </Grid>
                                                    <div className={'Containers-AssigneeContainer'}>
                                                        <fieldset
                                                            className={imageFocus ? 'Containers-AssigneeFieldset-active' : 'Containers-AssigneeFieldset'}>
                                                            <legend
                                                                className={imageFocus ? 'Containers-AssigneeLabel-active' : 'Containers-AssigneeLabel'}>
                                                                <span style={{ marginLeft: '-3', marginRight: '-3' }}>Product Repository</span>
                                                            </legend>

                                                            <Grid item xs={12} style={{
                                                                marginTop: 20,
                                                                color: 'rgba(0, 0, 0, 0.54)',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={4}><b>URL</b></Grid>
                                                                    <Grid item xs={3}><b>USER</b></Grid>
                                                                    <Grid item xs={5}><b>PASSWORD</b></Grid>
                                                                </Grid>

                                                                <List>

                                                                    {this.renderRepositories()}

                                                                    <ListItem
                                                                        className="manualTestStepListItem"
                                                                        style={{ padding: '5px 0' }}>
                                                                        <ListItemText
                                                                            style={{ padding: 0 }}
                                                                            primary={
                                                                                <Grid container spacing={2}>
                                                                                    <Grid item xs={4}>
                                                                                        <InputBase
                                                                                            id="newRepositoryUrl"
                                                                                            placeholder="Url repository"
                                                                                            style={{ fontSize: '.875rem' }}
                                                                                            value={newRepositoryUrl}
                                                                                            onChange={this.setRepositoryFields("newRepositoryUrl")}
                                                                                            maxRows={5}

                                                                                            inputProps={{
                                                                                                style: {
                                                                                                    minHeight: '18px'
                                                                                                }
                                                                                            }}
                                                                                            //fullWidth
                                                                                            multiline
                                                                                        />
                                                                                        {
                                                                                            newRepositoryUrlError && <small
                                                                                                style={{ color: COLORS.red }}>Field
                                                                                                cannot be empty</small>
                                                                                        }
                                                                                    </Grid>
                                                                                    <Grid item xs={3}>
                                                                                        <InputBase
                                                                                            id="newRepositoryUser"
                                                                                            placeholder="Username repository"
                                                                                            style={{ fontSize: '.875rem' }}
                                                                                            value={newRepositoryUser}
                                                                                            onChange={this.setRepositoryFields("newRepositoryUser")}
                                                                                            inputProps={{
                                                                                                style: {
                                                                                                    minHeight: '18px'
                                                                                                }
                                                                                            }}
                                                                                            maxRows={15}
                                                                                            fullWidth
                                                                                            multiline
                                                                                        />
                                                                                        {
                                                                                            newRepositoryUserError && <small
                                                                                                style={{ color: COLORS.red }}>Field
                                                                                                cannot be empty</small>
                                                                                        }
                                                                                    </Grid>
                                                                                    <Grid item xs={5}
                                                                                        style={{ display: 'flex' }}>
                                                                                        <InputBase
                                                                                            id="newRepositoryPassword"
                                                                                            placeholder="Password repository"
                                                                                            style={{ fontSize: '.875rem' }}
                                                                                            value={newRepositoryPassword}
                                                                                            type={showNewPassword ? 'text' : 'password'}
                                                                                            onChange={this.setRepositoryFields('newRepositoryPassword')}
                                                                                            endAdornment={<InputAdornment
                                                                                                position="end">
                                                                                                <IconButton
                                                                                                    aria-label="Toggle password visibility"
                                                                                                    onClick={() => this.setState({ showNewPassword: !showNewPassword })}
                                                                                                >
                                                                                                    {showNewPassword ?
                                                                                                        <Visibility /> :
                                                                                                        <VisibilityOff />}
                                                                                                </IconButton>
                                                                                            </InputAdornment>
                                                                                            }

                                                                                            inputProps={{
                                                                                                onFocus: null,
                                                                                                style: {
                                                                                                    minHeight: '18px'
                                                                                                }
                                                                                            }}
                                                                                            maxRows={15}
                                                                                            fullWidth
                                                                                        />

                                                                                        <Tooltip title={'Add Repository'}>
                                                                                            <IconButton
                                                                                                onClick={this.addRepository.bind(this)}
                                                                                                style={{ padding: '0px 6px' }}
                                                                                                aria-label="Add Repository">
                                                                                                <AddCircleIcon />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            } />
                                                                    </ListItem>
                                                                </List>
                                                            </Grid>
                                                        </fieldset>

                                                    </div>
                                                    <legend>
                                                        <span style={{ fontSize: '.783rem' }}>
                                                            Optionally you can enter your test repository access in order to map commits with your t-Triage tests to improve assignments.
                                                        </span>
                                                    </legend>
                                                    <Grid item>
                                                        Has multiple environment?
                                                        <Checkbox onChange={this.onHasMultipleEnvironmentChange.bind(this)} />
                                                    </Grid>

                                                </Grid>

                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                    <div className={"snackbars-container"}>
                                        <Snackbar
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'center',
                                            }}
                                            className={'adminSnackbar'}
                                            open={this.state.showSnackbar}
                                            autoHideDuration={2200}
                                            onClose={this.closeSnackbar.bind(this)}
                                        >
                                            <MySnackbarContentWrapper
                                                onClose={this.closeSnackbar.bind(this)}
                                                variant={'success'}
                                                message={"Product saved"}
                                            />
                                        </Snackbar>
                                    </div>

                                </CardContent>
                                {wizardMode ?
                                    <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                        <Button
                                            type="button"
                                            className="globalButton"
                                            onClick={this.wizardPrevious}
                                            variant="contained"
                                            color="secondary">
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            className="globalButton"
                                            onClick={this.wizardSkip}
                                            variant="contained"
                                            color="primary"
                                            disabled={!this.state.productList.length}>
                                            Skip
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="globalButton"
                                            variant="contained"
                                            color="primary"
                                            disabled={!this.validateFields(true)}>
                                            Next
                                        </Button>
                                    </CardActions>
                                    :
                                    <CardActions style={{ justifyContent: 'flex-end', marginRight: 8 }}>
                                        <Button
                                            type="button"
                                            className="globalButton"
                                            onClick={this.clearProduct.bind(this)}
                                            variant="contained"
                                            color="secondary">
                                            Clear
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="globalButton"
                                            variant="contained"
                                            color="primary">
                                            Save
                                        </Button>
                                    </CardActions>
                                }
                            </Card>
                            <div />
                        </div>
                        {!wizardMode &&
                            <div className="Containers-Main">
                                {
                                    productList.length > 0 ?
                                        <Paper>{this.renderList()}</Paper>
                                        : this.state.searching ?
                                            <Paper>
                                                <div className="circularProgressContainer">
                                                    <CircularProgress color="primary" />
                                                </div>
                                            </Paper> : ''
                                }
                            </div>}
                    </form>
                </div>
            </div>
        )
    }
}
