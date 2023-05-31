import React, { Component } from 'react';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography"
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { formatException } from './TriageUtils'
import { COLORS } from './Globals'

export default class TriageInfoBox extends Component {

  render() {
    let isStackTrace = this.props.title === 'StackTrace';
    let isErrorDetails = this.props.title === 'Error Details';

    return <Paper style={{
                marginTop: this.props.marginTop,
                padding: this.props.padding ? this.props.padding : '10 20 20 20',
                maxHeight: this.props.height ? this.props.height : 'auto',
                borderRadius: 3,
                fontSize: '.875rem',
                color: 'rgba(0, 0, 0, .85)'
            }}>
                <Grid container>
                    <Grid item style={{ marginRight: 20 }}>
                        {this.props.icon}
                    </Grid>
                    <Grid item style={{
                      display: 'flex',
                      alignItems: 'center',
                      width:'calc(100% - 60px)',
                    }}>
                        <div style={{ width: '100%' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                                <h5 style={{color: COLORS.greyDark }}>
                                    {this.props.title}
                                </h5>
                                <div>
                                    {
                                        this.props.showExtra && (
                                          this.props.title !== 'Previous Runs' ?
                                              this.props.extra
                                          :   (
                                              <a href={this.props.buildLink} target="_blank" style={{ marginTop: 2, marginRight: 10, fontWeight: 'bold' }}>
                                                  {this.props.extra}
                                              </a>
                                          )
                                        )
                                    }
                                </div>
                            </div>
                            <div>
                                {this.props.description}
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={12} className={
                      this.props.shortBox ?
                        'triageBoxDetailsShort'
                      : this.props.dejaVu ?
                          'triageBoxDejaVuDetails'
                        : this.props.title === 'Summary' ?
                            'triageBoxSummary'
                          : 'triageBoxDetails'
                    } onClick={
                      isStackTrace ?
                        this.props.openStackTraceDialog.bind(this, this.props.details)
                      : isErrorDetails ? this.props.openErrorDetailsDialog.bind(this, this.props.details) : () => null
                    } style={{
                      cursor: isStackTrace || isErrorDetails ? 'pointer' : 'default',
                      whiteSpace: 'pre-wrap',
                    }}>
                        {
                          this.props.plainDetails ?
                              <Typography style={{color: this.props.color}}>
                                  {formatException(this.props.details)}
                              </Typography>
                          :   this.props.details
                        }
                    </Grid>
                </Grid>
            </Paper>
  }
}
