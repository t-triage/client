import React, { Component } from 'react';
import axios from 'axios'
import Api from "./Api"
import { styles, validURL, COLORS } from './Globals'

// MATERIAL COMPONENTS
import Grid from "@material-ui/core/Grid"
import FormControl from "@material-ui/core/FormControl"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormLabel from "@material-ui/core/FormLabel"
import RadioGroup from "@material-ui/core/RadioGroup"
import Radio from "@material-ui/core/Radio"
import Checkbox from "@material-ui/core/Checkbox"
import List from "@material-ui/core/List"
import IconButton from "@material-ui/core/IconButton"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails"
import Tooltip from "@material-ui/core/Tooltip"
import Avatar from "@material-ui/core/Avatar"
import DialogTitle from "@material-ui/core/DialogTitle"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import Popover from "@material-ui/core/Popover"
import CircularProgress from "@material-ui/core/CircularProgress"
import { withStyles } from '@material-ui/core/styles'

// ICONS
import HelpIcon from "@material-ui/icons/Help"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import DoneIcon from "@material-ui/icons/Done"
import LaunchIcon from "@material-ui/icons/Launch"

const formLabelHeight = '30px';

class TestTriageFooter extends Component {

  state = {
      applicationFailType: "",
      testFailType: "",
      note: "",
      isLoading: false,
      selectedPriority: 0,
      userFixPriority: "AUTOMATIC",
      calculatedPriority: 0,
      issueType: null,
      selectedSnooze: 2,
      snoozeEnabled: false,
      filedTicketDialogOpen: false,
      autoGenerateEnabled: false,
      ticktetUrl: "",
      errorEmptyProductBug: false,
      helpDialogOpen: false,
      helpDialogText: '',
      helpDialogTextReady: false,
      productIssueBlocking: false,
  }

  componentDidMount() {
    const {testTriage} = this.props;

    if (testTriage.automatedTestIssueId) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAutomationIssue + "/" + testTriage.automatedTestIssueId)
              .then(res => {
                  let {data} = res
                  this.setState({
                    userFixPriority: data.userFixPriority,
                    calculatedPriority: data.calculatedPriority,
                    issueType: data.issueType
                  })
              })
    }

    if (testTriage.issueTicketId) {
      axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetIssueTicket + testTriage.issueTicketId)
            .then(res => {
                let ticktetUrl = res.data.url
                this.setState({
                  ticktetUrl: ticktetUrl ? ticktetUrl : '',
                  applicationFailType: ticktetUrl ? 'FILED_TICKET' : applicationFailType,
                  productIssueBlocking: res.data.issueType == "BLOCKER" ? true : false
                })
            })
    }

    this.setState({
      applicationFailType: testTriage.applicationFailType,
      testFailType: testTriage.testFailType,
      // If the current build doesn't have a note then we show up the last note available
      note: testTriage.note ? testTriage.note : testTriage.lastNote,
    })
  }

  getParsedHtml(text) {
    let parser = new DOMParser()
    let el = parser.parseFromString(text, "text/html")
    return el.documentElement;
  }

  handleUserPriority = ev => {
    this.setState({
      userFixPriority: ev.target.value
    }, () => {
      this.changeTestFailTypeValue({target: {value: 'TEST_ASSIGNED_TO_FIX'}})
    })
  }

  setPriority(e) {
    this.setState({
      selectedPriority: e.target.value,
    })
  }

  setSnooze(e) {
    this.setState({
      selectedSnooze: e.target.value,
    })
  }

  setSnoozeEnabled(e) {
    this.setState({
      snoozeEnabled: e.target.checked,
    })
  }

  changeApplicationFailType = ev => {
      this.setState({
          applicationFailType: ev.target.value,
          ticktetUrl: '',
      })
  }

  changeTestFailTypeValue = ev => {
      this.setState({
          testFailType: ev.target.value
      })
  }

  changeNote(ev) {
    let description = ev.target.value;
    let {note} = this.state;
    note = {...note, description};
    this.setState({
      note,
    })
  }

  getSnooze() {
    // TODO should return timestamp?
    return this.state.selectedSnooze;
  }

  getPriorityAutomationIssue = priority => {
    switch (true) {
      case (priority >= 400):
        return 'Blocker'
      case (priority >= 200):
        return 'P1'
      case (priority >= 100):
        return 'P2'
      case (priority < 100):
        return 'P3'
    }
  }

  updateInputValue = evt => {
    this.setState({
      ticktetUrl: evt.target.value
    });
  }

  triageTest(snooze = false, save = false) {
      const { testTriage } = this.props
      let testToTriage = JSON.parse(JSON.stringify(testTriage))
      delete testToTriage.testExecution.errorDetails;  // fix for #235 spreadsheet
      delete testToTriage.testExecution.errorStackTrace;
      testToTriage.applicationFailType = this.state.applicationFailType
      testToTriage.testFailType = this.state.testFailType
      testToTriage.note = this.state.note
      testToTriage.triaged = save ? !!testToTriage.triaged : true
      testToTriage.processed = true
      if (snooze) {
          testToTriage.snooze += 1
          testToTriage.snoozed = true
      }

      let updateTriage = {
        testTriageDTO: testToTriage,
        issueTicketDTO: null,
        automatedTestIssueDTO: null
      }


      if (this.state.ticktetUrl !== null && this.state.ticktetUrl !== '') {
          updateTriage.issueTicketDTO = {
            id: testToTriage.issueTicketId,
            assignee: null,
            component: "",
            url: this.state.ticktetUrl,
            priority: 1,
            summary: "",
            description: "",
            product: testToTriage.productId,
            issueType: this.state.productIssueBlocking ? "BLOCKER" : "OPEN",
            note: null,
            testCaseId: testToTriage.testCaseId
          }
      }

      if (testToTriage.testFailType == 'TEST_ASSIGNED_TO_FIX' || testToTriage.automatedTestIssueId) {
          updateTriage.automatedTestIssueDTO = {
             id: testToTriage.automatedTestIssueId,
             userFixPriority: this.state.userFixPriority,
             issueType: this.state.issueType ? this.state.issueType : "OPEN",
             triager: testToTriage.triager,
             testCaseId: testToTriage.testCaseId,
             calculatedPriority: this.state.calculatedPriority,
             testTriage: testToTriage
          }
      }

		this.setState({
			isLoading: true
		}, () => {
			axios({
				method: 'POST',
				headers: { 'Content-Type': 'application/json', },
				data: JSON.stringify(updateTriage),
				url: Api.getBaseUrl() + Api.ENDPOINTS.UpdateTestTriage,
			}).then( () => {
				this.props.showSnackbar(
					!testToTriage.triaged ?
						'Test successfully saved'
						: 'Test successfully triaged'
				)
				this.setState({
					isLoading: false
				})
			})
    })

  }

  onHelpDialogClose(ev) {
    ev.stopPropagation()
    this.setState({
      helpDialogOpen: false,
    })
  }

  onHelpDialogOpen(ev) {
    ev.stopPropagation()
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.FindProperty + 'TRIAGE_HELP')
        .then(res => {
          this.setState({
            helpDialogText: this.getParsedHtml(res.data[0].value),
            helpDialogOpen: true,
            helpDialogTextReady: false,
          }, () => {
            setTimeout(() => {
              this.setState({
                helpDialogTextReady: true,
              }, () => {
                document.getElementById("helpDialogText").appendChild(this.state.helpDialogText)
              })
            }, 500)
          })
        })
  }

  renderHelpDialog() {
    let props = {
      open: this.state.helpDialogOpen,
      onClose: this.onHelpDialogClose.bind(this),
      fullWidth: true,
    }

    return <Dialog {...props}
              aria-labelledby="triageFooter-helpDialog-title"
              aria-describedby="triageFooter-helpDialog-description">
              <DialogContent id="triageFooter-helpDialog-description">
                  {
                    !this.state.helpDialogTextReady && (
                      <div className="circularProgressContainer">
                          <CircularProgress color="primary" />
                      </div>
                    )
                  }
                  {
                    this.state.helpDialogTextReady && (
                      <div className="helpDialogText" id="helpDialogText" />
                    )
                  }
              </DialogContent>
           </Dialog>
  }

  render() {
    const { classes, testTriage } = this.props
    let {isLoading, applicationFailType, testFailType, ticktetUrl, errorEmptyProductBug, productIssueBlocking} = this.state
    let productSkipSelected = applicationFailType === 'UNDEFINED'
    let testSkipSelected = testFailType === 'UNDEFINED'

    const priorities = [
      { value: 'AUTOMATIC', text: `Automatic (${this.getPriorityAutomationIssue(this.state.calculatedPriority)})` },
      { value: 'BLOCKER', text: 'Blocker' },
      { value: 'HIGH', text: 'P1' },
      { value: 'MEDIUM', text: 'P2' },
      { value: 'LOW', text: 'P3' },
    ]

    return (
      <ExpansionPanel
          className='TriageFooterExpansionPanel'
          elevation={0}
          expanded={this.props.panelExpanded}
          onChange={this.props.expandPanel}>
          <ExpansionPanelSummary className='TriageFooterExpansionPanelSummary'
              classes={{
                content: classes.expPanelSummary
              }}
              expandIcon={<ExpandLessIcon />}>
              {this.renderHelpDialog()}
              <Tooltip title="Want help?">
                  <HelpIcon
                      onClick={this.onHelpDialogOpen.bind(this)}
                      color="primary"
                      style={{ paddingRight: 15 }} />
              </Tooltip>
              <Typography variant="button"><b>Triage Action</b></Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className='TriageFooterExpansionPanelDetails'>
              <Grid  style={isLoading ? {opacity:0.7} : {}} container spacing={24}>
                  <Grid item xs={6} md={4}>
                      <Grid container>
                          <Grid item xs={12} className='TriageDialogActionSection'>
                              <FormControl component="fieldset">
                                  <div>
                                      {
                                        testTriage && testTriage.currentState === 'NEWPASS' && (
                                          <div>
                                              <h4 className="TriageDialogFormLabelTitle">Product Functionality</h4>
                                              <RadioGroup
                                                  row={true}
                                                  value={applicationFailType}
                                                  onChange={this.changeApplicationFailType}>
                                                  <FormControlLabel
                                                      style={{
                                                        height: formLabelHeight,
                                                      }}
                                                      value="NO_FAIL"
                                                      control={<Radio className='TriageDialogRadio' color='default' />}
                                                      label="App is working"
                                                  />
                                              </RadioGroup>
                                          </div>
                                        )
                                      }
                                      {
                                        testTriage && testTriage.currentState !== 'NEWPASS' && (
                                          <div>
                                              <div className="TriageDialogFormLabelTitleContainer">
                                                  <h4 className="TriageDialogFormLabelTitle">Product Functionality</h4>
                                                  <FormControlLabel
                                                      style={{
                                                        marginTop: 3,
                                                      }}
                                                      value="UNDEFINED"
                                                      control={
                                                          <Checkbox
                                                              onClick={() => this.setState({
                                                                applicationFailType: productSkipSelected ? '' : 'UNDEFINED',
                                                                ticktetUrl: ''
                                                              })}
                                                              checked={productSkipSelected}
                                                              className='TriageDialogRadio'
                                                              color='default' />
                                                      }
                                                      label="Skip"
                                                  />
                                              </div>
                                              <FormLabel focused component="legend" className="TriageFooterLegend-app-working">
                                                  <h6>Works Fine</h6>
                                              </FormLabel>
                                              <RadioGroup
                                                  row={true}
                                                  value={applicationFailType}
                                                  style={{ opacity: productSkipSelected ? '.7' : '1' }}
                                                  onChange={this.changeApplicationFailType}>
                                                  <FormControlLabel
                                                      style={{
                                                        height: formLabelHeight,
                                                      }}
                                                      value="NO_FAIL"
                                                      control={<Radio className='TriageDialogRadio' color='default' />}
                                                      label="Manual Test Succeed"
                                                  />
                                                  <FormControlLabel
                                                      style={{
                                                        height: formLabelHeight,
                                                      }}
                                                      value="EXTERNAL_CAUSE"
                                                      control={<Radio className='TriageDialogRadio' color='default' />}
                                                      label="Test Environment Issue"
                                                  />
                                              </RadioGroup>
                                          </div>
                                        )
                                      }
                                  </div>
                                  <div style={{
                                    marginTop: '15px',
                                  }}>
                                      { testTriage && testTriage.currentState === 'NEWPASS' && (
                                        <div>
                                            <FormLabel focused component="legend" className="TriageFooterLegend-app-notWorking-newPass">
                                                <h6>{"Not Working"}</h6>
                                            </FormLabel>
                                            <RadioGroup
                                                row={true}
                                                value={applicationFailType}
                                                onChange={this.changeApplicationFailType}>
                                                <FormControlLabel
                                                    style={{
                                                      height: formLabelHeight,
                                                    }}
                                                    value="FILED_TICKET"
                                                    control={<Radio className='TriageDialogRadio' color='default' />}
                                                    label="App unstable, still In Dev"
                                                />
                                            </RadioGroup>
                                            <div>
                                                {
                                                  ticktetUrl ?
                                                    <div>
                                                        <span>The Filed Ticket can be resolve now:</span><br />
                                                        {
                                                          validURL(ticktetUrl) ?
                                                              <a style={{ display: 'flex', alignItems: 'center' }} target="_blank" href={this.state.ticktetUrl}>
                                                                  {ticktetUrl.substring(ticktetUrl.lastIndexOf('/') + 1)}
                                                                  <LaunchIcon color='primary' style={{ fontSize: 14, marginTop: 1, marginLeft: 3 }} />
                                                              </a>
                                                          :   ticktetUrl
                                                        }
                                                    </div>
                                                  : "There's no filed ticket for this test"
                                                }
                                            </div>
                                        </div>
                                      )}
                                      { testTriage && testTriage.currentState !== 'NEWPASS' && (
                                        <div>
                                            <FormLabel focused component="legend" className="TriageFooterLegend-app-notWorking">
                                                <h6>{"Not Working"}</h6>
                                            </FormLabel>

                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                              <RadioGroup
                                                  row={false}
                                                  value={applicationFailType}
                                                  style={{ opacity: productSkipSelected ? '.7' : '1' }}
                                                  onChange={this.changeApplicationFailType}>
                                                      <FormControlLabel
                                                          style={{
                                                            height: formLabelHeight,

                                                          }}
                                                          classes={{
                                                            label: classes.productBugLabel,
                                                          }}
                                                          value="FILED_TICKET"
                                                          control={
                                                            <Radio
                                                                className='TriageDialogRadio'
                                                                onClick={() => !this.state.ticktetUrl ? this.setState({ applicationFailType: 'FILED_TICKET', errorEmptyProductBug: true }) : this.setState({ applicationFailType: 'FILED_TICKET'})}
                                                                checked={applicationFailType === 'FILED_TICKET'}
                                                                color='default' />
                                                          }
                                                          label={
                                                            <TextField
                                                              style={{
                                                                padding: '0',
                                                                width: '100%',
                                                              }}
                                                              inputProps={{
                                                                style: {
                                                                  padding: '0',
                                                                  fontSize: '.875rem',
                                                                  marginTop: errorEmptyProductBug && applicationFailType == 'FILED_TICKET' ? 15 : 0,
                                                                }
                                                              }}
                                                              name="url"
                                                              onClick={() => this.setState({ applicationFailType: 'FILED_TICKET'})}
                                                              placeholder="Product Bug URL"
                                                              onChange={evt => this.updateInputValue(evt)}
                                                              value={ticktetUrl}
                                                              error={errorEmptyProductBug && applicationFailType == 'FILED_TICKET'}
                                                              onBlur={() => !this.state.ticktetUrl ? this.setState({errorEmptyProductBug: true}) : this.setState({errorEmptyProductBug: false})}
                                                              helperText={errorEmptyProductBug && applicationFailType == 'FILED_TICKET' ? "Can not be empty" : ""}
                                                            />
                                                          }
                                                      />
                                              </RadioGroup>
                                              <FormControlLabel
                                                  style={{
                                                    marginTop: 3,
                                                  }}
                                                  value="UNDEFINED"
                                                  control={
                                                      <Checkbox
                                                          onClick={() => this.setState({
                                                            productIssueBlocking: !productIssueBlocking,
                                                          })}
                                                          checked={productIssueBlocking}
                                                          className='TriageDialogRadio'
                                                          color='default' />
                                                  }
                                                  label="Blocker"
                                              />
                                            </div>
                                        </div>
                                      )}
                                  </div>
                              </FormControl>
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={6} md={4} className='TriageDialogActionSection'>
                      <FormControl component="fieldset">
                          <div>
                              {
                                testTriage && testTriage.currentState !== 'NEWPASS' && (
                                  <div>
                                      <div className="TriageDialogFormLabelTitleContainer">
                                          <h4 className="TriageDialogFormLabelTitle">Automated Test</h4>
                                          <FormControlLabel
                                              style={{
                                                marginTop: 3,
                                              }}
                                              value="UNDEFINED"
                                              control={
                                                  <Checkbox
                                                      onClick={() => this.setState({
                                                        testFailType: testSkipSelected ? '' : 'UNDEFINED',
                                                      })}
                                                      checked={testSkipSelected}
                                                      className='TriageDialogRadio'
                                                      color='default' />
                                              }
                                              label="Skip"
                                          />
                                      </div>
                                      <FormLabel focused component="legend" className="TriageFooterLegend-test-working">
                                          <h6>Works Fine</h6>
                                      </FormLabel>
                                      <RadioGroup
                                          row={true}
                                          value={testFailType}
                                          style={{ opacity: testSkipSelected ? '.7' : '1' }}
                                          onChange={this.changeTestFailTypeValue}>
                                          <FormControlLabel
                                              style={{
                                                height: formLabelHeight,
                                              }}
                                              value="NO_FAIL"
                                              control={<Radio className='TriageDialogRadio' color='default' />}
                                              label="Re Run and worked"
                                          />
                                          <FormControlLabel
                                              style={{
                                                height: formLabelHeight,
                                              }}
                                              value="EXTERNAL_CAUSE"
                                              control={<Radio className='TriageDialogRadio' color='default' />}
                                              label="Test Environment Issue"
                                          />
                                      </RadioGroup>
                                  </div>
                                )
                              }
                              {
                                testTriage && testTriage.currentState === 'NEWPASS' && (
                                  <div>
                                      <h4 className="TriageDialogFormLabelTitle">Automated Test</h4>
                                      <RadioGroup
                                          row={true}
                                          value={testFailType}
                                          onChange={this.changeTestFailTypeValue}>
                                          <FormControlLabel
                                              style={{
                                                height: formLabelHeight,
                                              }}
                                              value="NO_FAIL"
                                              control={<Radio className='TriageDialogRadio' color='default' />}
                                              label="Test is working"
                                          />
                                      </RadioGroup>
                                  </div>
                                )
                              }
                          </div>
                          <div style={{
                            marginTop: '15px',
                          }}>
                              {
                                testTriage && testTriage.currentState === 'NEWPASS' && (
                                  <div>
                                      <FormLabel focused component="legend" className="TriageFooterLegend-test-notWorking-newPass">
                                          <h6>{"Not Working"}</h6>
                                      </FormLabel>
                                      <RadioGroup
                                          row={true}
                                          value={testFailType}
                                          onChange={this.changeTestFailTypeValue}>
                                          <FormControlLabel
                                              style={{
                                                height: formLabelHeight,
                                              }}
                                              value="TEST_ASSIGNED_TO_FIX"
                                              control={<Radio className='TriageDialogRadio' color='default' />}
                                              label="Test still needs improvement"
                                          />
                                      </RadioGroup>
                                  </div>
                                )
                              }
                              {
                                testTriage && testTriage.currentState !== 'NEWPASS' && (
                                    <div>
                                        <FormLabel focused component="legend" className="TriageFooterLegend-test-notWorking">
                                            <h6>Not Working</h6>
                                        </FormLabel>
                                        <RadioGroup
                                            row={true}
                                            value={testFailType}
                                            style={{ opacity: testSkipSelected ? '.7' : '1' }}
                                            onChange={this.changeTestFailTypeValue}>
                                            <Tooltip
                                              classes={{
                                                tooltip: classes.tooltip,
                                                popper: classes.popper,
                                              }}
                                              title={testTriage.automatedTestIssueId ? "The priority is already set, the application will change the priority according to the future fails or passes" : "" }
                                            >
                                            <FormControlLabel
                                                style={{
                                                  height: '30px',
                                                  marginLeft: '0'
                                                }}
                                                control={
                                                  <Select
                                                      value={this.state.userFixPriority}
                                                      onChange={this.handleUserPriority}
                                                      style={{
                                                        marginLeft: '10px',
                                                        width: '150px',
                                                        fontSize: '.875rem'
                                                      }}
                                                      disabled={testTriage && testTriage.automatedTestIssueId ? true  : false}>
                                                      {
                                                        priorities.map((priority, index) => (
                                                          <MenuItem key={index} value={priority.value}>{priority.text}</MenuItem>
                                                        ))
                                                      }
                                                  </Select>
                                                }
                                                labelPlacement="start"
                                                value="TEST_ASSIGNED_TO_FIX"
                                                label={
                                                  <div>
                                                    <Radio
                                                        className='TriageDialogRadioPriority'
                                                        onClick={() => this.setState({testFailType: 'TEST_ASSIGNED_TO_FIX'})}
                                                        checked={testFailType === 'TEST_ASSIGNED_TO_FIX'}
                                                        color='default' />
                                                    <span>{'File Issue'}</span>
                                                  </div>
                                                } />
                                              </Tooltip>
                                            <FormControlLabel
                                                style={{
                                                  height: formLabelHeight,
                                                  marginLeft: 15,
                                                }}
                                                value="WONT_FILE"
                                                control={<Radio className='TriageDialogRadio' color='default' />}
                                                label="Won't Fix"
                                            />
                                        </RadioGroup>
                                    </div>
                                )
                              }
                          </div>
                      </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4} className='TriageDialogActionSection TriageDialogActionComments'>
                      <div>
                          <h4 className="TriageDialogFormLabelTitle">Comments</h4>
                          <TextField
                              id="note"
                              value={!!this.state.note ? this.state.note.description : ""}
                              onChange={this.changeNote.bind(this)}
                              placeholder="No comments yet"
                              spellCheck={false}
                              variant="outlined"
                              InputLabelProps={{shrink: true}}
                              rows={3}
                              rowsMax={3}
                              InputProps={{ style: { padding: '10px', fontSize: '.875rem' } }}
                              style={{ marginTop: '5px' }}
                              fullWidth
                              multiline
                          />
                      </div>
                      <div className='TriageDialogActionButtons' style={{ marginTop: 16 }}>
                          <Button
                              id="save"
                              variant="contained"
                              className="globalButton"
                              style={{ marginRight: 10 }}
                              color="primary"
                              onClick={this.triageTest.bind(this, null, true)}
                              disabled={
                                  (isLoading || (!this.state.ticktetUrl && applicationFailType === 'FILED_TICKET') ||
                                  (applicationFailType === '' || testFailType === ''))
                              }>
                              Save Progress
                          </Button>
                          <Button
                              id="triage"
                              variant={testTriage && testTriage.triaged ? "outlined" : "contained"}
                              className="globalButton"
                              color="primary"
                              disabled={
                                  (isLoading || (!this.state.ticktetUrl && applicationFailType == 'FILED_TICKET') ||
                                  (applicationFailType === '' || testFailType === ''))
                              }
                              style={ testTriage && testTriage.triaged ? { paddingTop: 6, paddingBottom: 6, cursor: 'default', borderColor: '#ccc' } : {}}
                              onClick={ testTriage && !testTriage.triaged ? this.triageTest.bind(this) : null}>
                              {
                                testTriage && testTriage.triaged && (
                                  <Avatar style={{ width: 24, height: 24, backgroundColor: 'white', marginRight: 8, marginLeft: '-5' }}>
                                      <DoneIcon style={{ fontSize: 20, color: COLORS.primary }} />
                                  </Avatar>
                                )
                              }
                              {
                                testTriage && testTriage.triaged && "Triaged"
                              }
                              {
                                testTriage && !testTriage.triaged && "Triage Done"
                              }

                          </Button>
                      </div>
                  </Grid>
              </Grid>
						{
							isLoading && (
								<div className="circularProgressContainer" style={{ position: 'absolute', zIndex: '1000',left: '50%'}}>
									<CircularProgress disableShrink={true} color="primary" />
								</div>
							)
						}
          </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }
}
export default withStyles(styles)(TestTriageFooter)
