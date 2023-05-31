import React, { Component } from 'react';
import Api from './Api'
import axios from 'axios'
import { styles, validURL, COLORS } from './Globals'
import * as JsDiff from 'diff';

import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import CircularProgress from "@material-ui/core/CircularProgress"
import Tooltip from "@material-ui/core/Tooltip"

import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import ViewListIcon from '@material-ui/icons/ViewList'
import CancelIcon from '@material-ui/icons/Cancel'
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline'
import CommentIcon from '@material-ui/icons/Comment'
import AssignmentIcon from "@material-ui/icons/Assignment"
import LaunchIcon from "@material-ui/icons/Launch"
import SettingsEthernetIcon from "@material-ui/icons/SettingsEthernet"
import { withStyles } from '@material-ui/core/styles';
import CompareIcon from '@material-ui/icons/Compare';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';

import {
  getStatusTagColor,
  getStatusTagName,
  getTestFailTagName,
  getApplicationFailTagName,
  getPrevButtonStyle,
  getNextButtonStyle,
  formatException,
} from './TriageUtils'

class TriagePreviousBuilds extends Component {

  state = {
    ticktetUrl: '',
  }

  componentDidMount() {
    let {prevTriage, testTriage, diffDetails} = this.props
    if (prevTriage) {
      if (prevTriage.issueTicketId) {
        axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetIssueTicket + prevTriage.issueTicketId)
              .then(res => {
                  let ticktetUrl = res.data.url
                  this.setState({
                    ticktetUrl: ticktetUrl ? ticktetUrl : '',
                  })
              })
      }
    }
  }

    convertAllChanges(c){
        return c.map( (item) => {
            if (item.added){
                return (
                    <span style={{backgroundColor: '#e5f5eb'}}>
                      {item.value}
                     </span>
                )
            }
            if(item.removed){
                return (
                    <span style={{backgroundColor: '#fce9e7'}}>
                      {item.value}
                    </span>
                )
            }
            if(!item.added && !item.removed){
                return (
                    <span>
                      {item.value}
                    </span>
                )
            }
        })
    }

    convertPrevChanges(c){
        return c.map( (item) => {
            if(item.removed){
                return (
                    <span style={{backgroundColor: '#fce9e7'}}>
                      {item.value}
                    </span>
                )
            }
            if(!item.added && !item.removed){
                return (
                    <span>
                      {item.value}
                    </span>
                )
            }
        })
    }

    convertAddedChanges(c){
        return c.map( (item) => {
            if (item.added){
                return (
                    <span style={{backgroundColor: '#e5f5eb'}}>
                      {item.value}
                     </span>
                )
            }
            if(!item.added && !item.removed){
                return (
                    <span>
                      {item.value}
                    </span>
                )
            }
        })
    }


  render() {
    let { prevTriage, testTriage, prevTriageIndex, previousDataLoading, classes } = this.props;
    let {previousTriage} = testTriage;
    let previousBuildsLength = previousTriage.length;
    let {ticktetUrl} = this.state;
    let prevDetail = '';
    let newDetail = '';
    let diff = [];

      if (prevTriage && prevTriage.currentState !== 'PASS' && prevTriage.currentState !== 'NEWPASS'){
          let prevTxt = (prevTriage.testExecution.errorDetails + '\n' + prevTriage.testExecution.errorStackTrace);
          let newTxt = (testTriage.testExecution.errorDetails + '\n' + testTriage.testExecution.errorStackTrace);
          diff = JsDiff.diffWords(prevTxt.slice(0, 1600), newTxt.slice(0, 1600));

          if (diff.length === 1){
              this.diffDetails = '';
          } else if (diff.length >= 1 && diff.length <= 300) {
              this.diffDetails = this.convertAllChanges(diff);
              prevDetail = this.convertPrevChanges(diff);
              newDetail = this.convertAddedChanges(diff);
          } else {
              this.diffDetails = ''
          }
      }

      if (!previousDataLoading) {
      if (previousTriage.length > 0 && prevTriage) {
         return (
           <List className='triageBoxDetailsList' style={{ marginTop: '-8' }}>
               <ListItem className='TriageSumaryListItem'>
                   <Grid container>
                       <Grid item xs={12}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                               <div onClick={prevTriageIndex !== 0 ? this.props.getPreviousBuildData.bind(this) : () => null}>
                                   <Typography
                                       style={getPrevButtonStyle(prevTriageIndex)}>
                                       <KeyboardArrowLeftIcon style={{ marginTop: 2 }} />
                                       Previous
                                   </Typography>
                               </div>
                               <div style={{ display: 'flex' }}>
                                   <Typography style={{ marginTop: 2, marginRight: 10 }}>
                                       {new Date(prevTriage.executionDate).toLocaleDateString("en-US", {
                                         weekday: 'short',
                                         month: 'numeric',
                                         day: 'numeric',
                                         hour: 'numeric',
                                         minute: 'numeric',
                                         second: 'numeric',
                                         hour12: false,
                                       })}
                                   </Typography>
                               </div>
                               <div onClick={prevTriageIndex !== previousTriage.length - 1 ? this.props.getNextBuildData.bind(this) : () => null}>
                                   <Typography
                                       style={getNextButtonStyle(previousTriage, prevTriageIndex)}>
                                       Next
                                       <KeyboardArrowRightIcon style={{ marginTop: 2 }} />
                                   </Typography>
                               </div>
                           </div>
                       </Grid>
                       <Grid item xs={12} style={{marginTop: 10}}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                              <h5 className='TriageSumaryListItemTitle TriagePreviousBuildsTitle'>
                                  <ViewListIcon style={{color: COLORS.blue, marginRight: 10, fontSize: 16}} />
                                  Summary
                              </h5>
                              <Tooltip title={prevTriage.deducedReason}
                                  classes={{
                                    tooltip: classes.tooltip,
                                    popper: classes.popper,
                                  }}>
                                  <div className='statusTag' style={{
                                    borderColor: getStatusTagColor(prevTriage.currentState),
                                    border: '1px solid',
                                    color: getStatusTagColor(prevTriage.currentState),
                                    padding: '0 20',
                                    marginLeft: 20,
                                  }}>
                                      {getStatusTagName(prevTriage.currentState)}
                                  </div>
                              </Tooltip>
                          </div>
                       </Grid>
                       <Grid item xs={12}>
                           {
                             prevTriage.triaged && !prevTriage.expired && !prevTriage.autoTriaged && (
                               <div>
                                   <h6>Triaged by</h6>
                                   <Typography>{prevTriage.triager.displayName}</Typography>
                               </div>
                             )
                           }
                           {
                             prevTriage.triaged && !prevTriage.expired && prevTriage.autoTriaged && (
                               <h6>Auto Triaged</h6>
                             )
                           }
                           {
                             !prevTriage.triaged && (
                               <h6>Not Triaged</h6>
                             )
                           }
                       </Grid>
                       <Grid item xs={12} style={{ marginTop: 10 }}>
                           <h6>Product</h6>
                           <div style={{ display: 'flex', alignItems: 'center' }}>
                               {getApplicationFailTagName(prevTriage.applicationFailType)}&nbsp;
                               {
                                 validURL(ticktetUrl) ?
                                   <a target='_blank' style={{ display: 'flex', alignItems: 'center' }} href={ticktetUrl}>
                                       {ticktetUrl.substring(ticktetUrl.lastIndexOf('/') + 1)}
                                       <LaunchIcon color='primary' style={{ fontSize: 14, marginTop: 1, marginLeft: 3 }} />
                                   </a>
                                 : ticktetUrl
                               }
                           </div>
                       </Grid>
                       <Grid item xs={12} style={{ marginTop: 10 }}>
                           <h6>Automation Test</h6>
                           {getTestFailTagName(prevTriage.testFailType)}
                       </Grid>
                       {
                         prevTriage.note && (
                           <Grid item xs={12}>
                               <hr style={{ margin: '15px 0' }} />
                               <div>
                                   <div>
                                       <h5 className='TriageSumaryListItemTitle TriagePreviousBuildsTitle'>
                                           <CommentIcon style={{color: COLORS.greyDark, marginRight: 10, fontSize: 16}} />
                                           Comments
                                       </h5>
                                   </div>
                                   <div>
                                       {prevTriage.note.description}
                                   </div>
                               </div>
                           </Grid>
                         )
                       }
                       {
                           prevTriage.currentState !== 'PASS' && prevTriage.currentState !== 'NEWPASS' && (
                               <Grid item xs={12}>
                                   <hr style={{ margin: '15px 0' }} />
                                   <div className="TriageSumaryTitleWithIcon">
                                       <h5 className='TriageSumaryListItemTitle TriagePreviousBuildsTitle'>
                                           <VerticalSplitIcon style={{color: COLORS.blue, marginRight: 10, fontSize: 15}} />
                                           Error Differences
                                       </h5>
                                       {
                                           this.diffDetails && (
                                               <div>
                                                   <Tooltip title="Maximize"
                                                            classes={{
                                                                tooltip: classes.tooltip,
                                                                popper: classes.popper,
                                                            }}>
                                                       <SettingsEthernetIcon
                                                           color="primary"
                                                           onClick={this.props.openDiffDetailsDialog.bind(this, prevDetail, newDetail)}
                                                           style={{ cursor: 'pointer', marginRight: 5, transform: 'rotate(-45deg)', fontSize: 18, color: COLORS.blue }} />
                                                   </Tooltip>
                                               </div>
                                           )
                                       }
                                   </div>
                                   {
                                       diff.length === 1 && (
                                           <span style={{
                                               marginLeft: 25,
                                           }}>
                                               {'Previous and current errors are equals.'}
                                           </span>
                                       )
                                   }
                                   {
                                       diff.length > 300 && (
                                           <span style={{
                                               marginLeft: 25,
                                           }}>
                                               {'Previous and current errors are excessively different.'}
                                           </span>
                                       )
                                   }

                               </Grid>

                           )
                       }
                       <Grid item xs={12} style={{ marginTop: 10 }}>
                           {
                               this.diffDetails && (
                                   <div className='TriageFooterPreviousErrors'
                                        onClick={this.props.openDiffDetailsDialog.bind(this, prevDetail, newDetail)}
                                        style={{ color: COLORS.black, cursor: 'pointer' }}>
                                       {this.diffDetails}
                                   </div>
                               )
                           }
                       </Grid>

                       <Grid item xs={12}>
                           <hr style={{ margin: '15px 0' }} />
                           <div className="TriageSumaryTitleWithIcon">
                             <h5 className='TriageSumaryListItemTitle TriagePreviousBuildsTitle'>
                                 <CancelIcon style={{color: COLORS.red, marginRight: 10, fontSize: 15}} />
                                 Errors
                             </h5>
                             {
                               prevTriage.testExecution.errorDetails && (
                                 <div>
                                   <Tooltip title="Copy to clipboard"
                                      classes={{
                                        tooltip: classes.tooltip,
                                        popper: classes.popper,
                                      }}>
                                      <AssignmentIcon
                                         style={{ color: COLORS.grey, fontSize: 18, cursor: 'pointer', marginRight: 5 }}
                                         onClick={this.props.copyToClipboard.bind(this, prevTriage.testExecution.errorDetails)} />
                                   </Tooltip>
                                   <Tooltip title="Maximize"
                                       classes={{
                                         tooltip: classes.tooltip,
                                         popper: classes.popper,
                                       }}>
                                       <SettingsEthernetIcon
                                           color="primary"
                                           onClick={this.props.openErrorDetailsDialog.bind(this, prevTriage.testExecution.errorDetails)}
                                           style={{ cursor: 'pointer', marginRight: 5, transform: 'rotate(-45deg)', fontSize: 18, color: COLORS.grey }} />
                                   </Tooltip>
                                  </div>
                               )
                             }
                           </div>
                           {
                             !prevTriage.testExecution.errorDetails && (
                               <span style={{
                                   marginLeft: 25,
                                 }}>
                                   {'No error details'}
                               </span>
                             )
                           }
                       </Grid>
                       <Grid item xs={12} style={{ marginTop: 10 }}>
                            {
                              prevTriage.testExecution.errorDetails && (
                                <div
                                   className='TriageFooterPreviousErrors'
                                   onClick={this.props.openErrorDetailsDialog.bind(this, prevTriage.testExecution.errorDetails)}
                                   style={{ color: COLORS.red, cursor: 'pointer' }}>
                                    {formatException(prevTriage.testExecution.errorDetails)}
                                </div>
                              )
                            }
                            <hr style={{ margin: '15px 0' }} />
                       </Grid>
                       <Grid item xs={12}>
                           <div className="TriageSumaryTitleWithIcon">
                               <h5 className='TriageSumaryListItemTitle TriagePreviousBuildsTitle'>
                                   <ViewHeadlineIcon style={{color: COLORS.orange, marginRight: 10, fontSize: 15}} />
                                   StackTrace
                               </h5>
                               {
                                 prevTriage.testExecution.errorStackTrace && (
                                   <div>
                                     <Tooltip title="Copy to clipboard"
                                        classes={{
                                          tooltip: classes.tooltip,
                                          popper: classes.popper,
                                        }}>
                                        <AssignmentIcon
                                           style={{ color: COLORS.grey, fontSize: 18, cursor: 'pointer', marginRight: 5 }}
                                           onClick={this.props.copyToClipboard.bind(this, prevTriage.testExecution.errorStackTrace)} />
                                     </Tooltip>
                                     <Tooltip title="Maximize"
                                         classes={{
                                           tooltip: classes.tooltip,
                                           popper: classes.popper,
                                         }}>
                                         <SettingsEthernetIcon
                                             color="primary"
                                             onClick={this.props.openStackTraceDialog.bind(this, prevTriage.testExecution.errorStackTrace)}
                                             style={{ cursor: 'pointer', marginRight: 5, transform: 'rotate(-45deg)', fontSize: 18, color: COLORS.grey }} />
                                     </Tooltip>
                                    </div>
                                 )
                               }
                           </div>
                           {
                             !prevTriage.testExecution.errorStackTrace && (
                               <span style={{
                                   marginLeft: 25,
                                 }}>
                                   {'No StackTrace'}
                               </span>
                             )
                           }
                       </Grid>
                       <Grid item xs={12} style={{ marginTop: 10 }}>
                            {
                              prevTriage.testExecution.errorStackTrace && (
                                <div
                                   className='TriageFooterPreviousErrors'
                                   onClick={this.props.openStackTraceDialog.bind(this, prevTriage.testExecution.errorStackTrace)}
                                   style={{ color: COLORS.orange, cursor: 'pointer' }}>
                                    {formatException(prevTriage.testExecution.errorStackTrace)}
                                </div>
                              )
                            }
                       </Grid>
                   </Grid>
               </ListItem>
           </List>
         )
      } else {
        return (
          <Typography style={{
              color: COLORS.grey,
            }}>
              {'No previous builds available'}
          </Typography>
        )
      }
    } else {
      return (
        <div className="circularProgressContainer">
            <CircularProgress color="primary" />
        </div>
      )
    }
  }
}

export default withStyles(styles)(TriagePreviousBuilds)
