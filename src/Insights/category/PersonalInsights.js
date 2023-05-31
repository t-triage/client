import React, { Component } from 'react'
import Api from "../../Main/Components/Api"
import axios from 'axios'
import CircularChart from '../CircularChart'
import TriagesForDayChart from '../TriagesForDayChart'
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"

export default class AutomationEngine extends Component {
  state = {
    pending: 0,
    fixed: 0,
    total: 0
  }

  componentWillMount() {
    axios.get(Api.getBaseUrl() + Api.ENDPOINTS.GetAutomationPendingAndFixesForUser )
        .then(res => {
            let {data} = res
            let testSummary = [
             {key: "Issues", value: data.newFixes},
             {key: "Pending Issues", value: data.pending},
            ]
            if (data.total === 0) {
              testSummary = [{ key: "", value: 100 }]
            }
            this.setState({
              testSummary,
              total: data.total
            })
        })
  }

  toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
  }

  downloadUserReport() {
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
    axios(Api.getBaseUrl() + Api.ENDPOINTS.DownloadUserReport, {
      method: 'GET',
      responseType: 'blob',
    })
      .then(res => {
        const file = new Blob(
          [res.data],
          {type: 'application/pdf'}
        )
        const fileURL = URL.createObjectURL(file)
        window.open(fileURL)
      })
      .catch(err => {
        console.log("ERROR", err)
      })
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <div className='insightsDownload'>
          <Button
              className="globalButton"
              variant="contained"
              onClick={this.downloadUserReport.bind(this)}
              color="primary">Download Report</Button>
        </div>
        <Grid container spacing={24} justify="center">
            <Grid item xs={10}>
                <Paper className='chartBigContainer'>
                  <TriagesForDayChart />
                </Paper>
                <Paper className='chartBigContainer'>
                    <CircularChart
                        title="Automation Issues"
                        testSummary={this.state.testSummary}
                        totalSummary={this.state.total}
                        randomColors={true}
                        tooltip={
                          <div>
                              Pending and fixed automation issues
                          </div>
                        } />
                </Paper>
            </Grid>
        </Grid>
      </div>
    )
  }
}
