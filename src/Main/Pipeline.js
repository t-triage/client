import "../styles/home.scss"
import React, { Component } from "react"
import Globals, {WIKI_URL} from "./Components/Globals"
import history from "./Components/History"
import CopyrightFooter from "./Components/CopyrightFooter"
import Kanban from "./Kanban"
import Nav from "./Components/Nav"
import SuiteList from "./SuiteList"
import Triage from "./Triage"
import PipelineKanban from "./PipelineKanban"
import PipelineList from "./PipelineList"

import withStyles from '@mui/styles/withStyles';
import { styles, COLORS, renderDeadLine, DEFAULT_PIPELINE_FILTERS, snackbarStyle, PipeStage } from './Components/Globals'
const workspaceUrl = WIKI_URL + 'docs/DOC-7272'
const kanbanUrl = WIKI_URL + 'docs/DOC-7272'
const triageUrl = WIKI_URL + 'docs/DOC-6974#jive_content_id_Test_details'

class Pipeline extends Component {
  constructor(props) {
    super(props)
    let { params } = props.match;
    this.state = {
     helpEnabled: false,
      loadKanbanData: true,
      pipeStage:!!params.pipelineID ? Globals.PipeStage.PIPELINEKANBAN : !!params.pipelineID ? Globals.PipeStage.TRIAGE :  Globals.PipeStage.PIPELINELIST,
      selectedPipeline: params.pipelineID,
      redirectUrl: !!params.pipelineID ? kanbanUrl : !!params.testId ? triageUrl : workspaceUrl,
      selectedTestCaseId: !!params.testId ? params.testId : 0,     

    }
    this.currentUrl = params.path
    this.needsUpdateData = false
  }

  componentDidMount() {
    window.onpopstate = e => {
      this.switchToStage()
    }
  }

  componentDidUpdate() {
    this.switchToStage()
    if (this.needsUpdateData) {
      // Inser magic here
      this.needsUpdateData = false
    }
  }

  switchToStage() {
    if (this.props.match.path != this.currentUrl) {
      let switchToStage = (path => {
          if (path == "/PipelineList" || path == "/PipelineList/Container/:containerID/")
          return Globals.PipeStage.PIPELINELIST
        if (path == "/PipelineList/:pipelineID/Kanban")
          return Globals.PipeStage.PIPELINEKANBAN
        if (path == "/Test/:testId/Pipeline")
            return Globals.PipeStage.TRIAGE
      })(this.props.match.path)
      this.currentUrl = this.props.match.path
      this.setState({
        PipeStage: switchToStage,
      })
    }
  }

  goBackToList(containerID) {
    if (containerID) {
      history.push(`/PipelineList/Container/${containerID}`)
    } else {
      history.push('/PipelineList')
    }
    this.setState({
      redirectUrl: workspaceUrl,
      pipeStage: Globals.PipeStage.PIPELINELIST,
    })
  }

  setSelectedPipeline(selectedPipeline) {
    /*this.setState({
      selectedPipeline,
    })*/
  }
  
  goTriage(selectedTestCaseId) {
    this.setState({
      pipeStage: Globals.PipeStage.TRIAGE,
      redirectUrl: triageUrl,
      selectedTestCaseId,
    })
  }

  goToKanban = (selectedPipeline, loadKanbanData) => {
    if (!selectedPipeline && !this.state.selectedPipeline) {
      history.push("/PipelineList/")
      this.setState({
        pipeStage: Globals.PipeStage.PIPELINELIST,
        redirectUrl: workspaceUrl,
      })
    } else {
      if (!selectedPipeline) {
        history.push("/PipelineList/" + this.state.selectedPipeline + "/Kanban")
        this.setState({
          pipeStage: Globals.PipeStage.PIPELINEKANBAN,
          redirectUrl: kanbanUrl,
        })
      } else {
        this.setState({
          selectedPipeline,
          loadKanbanData,
        }, () => {
          history.push("/PipelineList/" + selectedPipeline + "/Kanban")
          this.setState({
            pipeStage: Globals.PipeStage.PIPELINEKANBAN,
            redirectUrl: kanbanUrl,
          })
        })
      }
    }
  }

  selectPipeline = (pipelineID) => {

    selectedPipeline = parseInt(pipelineID)
    if (!isNaN(pipelineID)) {
      this.setState({
        selectedPipeline,
        triageStage: Globals.PipeStage.PIPELINEKANBAN,
        loadKanbanData: true,
      })
    } else {
      history.push("dashboard", "/PipelineList/")
      this.setState({
        pipeStage: Globals.PipeStage.PIPELINELIST,
        redirectUrl: workspaceUrl,
      })
    }
  }
  setSelectedContainerID(selectedContainerID) {
    this.setState({
      selectedContainerID
    })
  }


  onHelpClick = filter => event => {
    let value = this.state[filter]
    this.setState({
      [filter]: !value
    })
  }

  getHelpItems() {
    let items, extraItems, goalText, actionText, videoUrl;

    switch (this.state.PipeStage) {
      case Globals.PipeStage.TRIAGE:
        goalText = 'Analyze: (1) verify if the product is working and (2) if the automation is working.';
        actionText = 'Check the Product and Automation Functionality, and press Triage Done';
        videoUrl = 'https://youtu.be/05b_H6K67f4';
        break;
      case Globals.PipeStage.PIPELINEKANBAN:
        goalText = 'Classified test failures to analyze and get into Triage Done.';
        actionText = 'Click on each test to Triage.';
        videoUrl = 'https://youtu.be/G3Ft3RBmcsA';

        break;
      default:

        goalText = 'Overview page with organized failing test suites to work on.';
        actionText = 'Click on test suite.';
        videoUrl = 'https://youtu.be/G3Ft3RBmcsA';
        break;
    }

    items = [
      [
        {
          title: 'PAGE GOAL',
          text: goalText
        },
        {
          title: 'USER ACTION',
          text: actionText
        },
        {
          title: 'DOCUMENTATION',
          text: `Detailed documentation <a target="_blank" href=${this.state.redirectUrl}>HERE</a>`
        },
        {
          title: null,
          text: null,
          videoURL: videoUrl
        }
      ]
    ]


    return items;
  }

  render() {
    let { helpEnabled } = this.state;
    let helpItems = this.getHelpItems();

    return (
      <div className="homeRoot" style={{ minHeight: 'calc(100% - 91px)' }}>
        <Nav
          pipeStage={this.state.pipeStage}
          selectedContainerID={this.state.selectedContainerID}
          selectedPipeline={this.state.selectedPipeline}
          helpEnabled={helpEnabled}
          helpItems={helpItems}
          screen={'pipeline'}
          title={'Pipeline Checkpoints'}
          onHelpClick={this.onHelpClick.bind(this)}
          goToKanban={this.goToKanban.bind(this)}
          goBackToList={this.goBackToList.bind(this)}
        />
        <main style={{ marginTop: helpEnabled && helpItems.length > 1 ? 340 : (helpEnabled ? 225 : 91) }}>
          {
              this.state.pipeStage == Globals.PipeStage.TRIAGE ?
              <Triage
                  goToKanban={this.goToKanban.bind(this)}
                  setSelectedSuite={this.setSelectedPipeline.bind(this)}
                  testId={this.state.selectedTestCaseId} />
                  :
                      this.state.pipeStage == Globals.PipeStage.PIPELINEKANBAN ?
                           <PipelineKanban
                             loadKanbanData={this.state.loadKanbanData}
                             helpEnabled={helpEnabled}
                             selectedPipeline={this.state.selectedPipeline}
                             goBack={this.goBackToList.bind(this)}
                             goTriage={this.goTriage.bind(this)}
                             selectedSuite={this.state.selectedSuite}
                             setSelectedContainerID={this.setSelectedContainerID.bind(this)}
                             selectedTestCaseId={this.state.selectedTestCaseId}
                             params={this.props.match.params}
                             />
                             : 
                             <PipelineList
                               pipelineID={this.state.selectedPipeline}
                               helpEnabled={helpEnabled}
                               selectPipeline={this.selectPipeline.bind(this)}
                               params={this.props.match.params}/>
          }

        </main>
            <CopyrightFooter helpEnabled={helpEnabled} />
      </div>
    )
  }
}
export default withStyles(styles)(Pipeline)