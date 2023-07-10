import "../styles/home.scss"
import React, { Component } from "react"
import Globals, {GITBOOK_URL} from "./Components/Globals"
import history from "./Components/History"
import CopyrightFooter from "./Components/CopyrightFooter"

import Kanban from "./Kanban"
import Nav from "./Components/Nav"
import SuiteList from "./SuiteList"
import Triage from "./Triage"

const workspaceUrl = GITBOOK_URL + 'docs/user-guide/triage'
const kanbanUrl = GITBOOK_URL + 'docs/user-guide/kanban-view-of-a-suite'
const triageUrl = GITBOOK_URL + 'docs/user-guide/test-details'

export default class Home extends Component {
    constructor(props) {
        super(props)
        let {params} = props.match;
        this.state = {
            triageStage: !!params.suiteID ? Globals.TriageStage.KANBAN : !!params.testId ? Globals.TriageStage.TRIAGE : Globals.TriageStage.SUITELIST,
            selectedSuite: params.suiteID,
            redirectUrl: !!params.suiteID ? kanbanUrl : !!params.testId ? triageUrl : workspaceUrl,
            selectedTestCaseId: !!params.testId ? params.testId : 0,
					  helpEnabled: false,
					  selectedContainerID: 0,
            loadKanbanData: true,
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
          if (path == "/SuiteList" || path == "/SuiteList/Container/:containerID/")
            return Globals.TriageStage.SUITELIST
          if (path == "/SuiteList/:suiteID/Kanban")
            return Globals.TriageStage.KANBAN
          if (path == "/Test/:testId/Triage")
            return Globals.TriageStage.TRIAGE
        })(this.props.match.path)
        this.currentUrl = this.props.match.path
        this.setState({
          triageStage: switchToStage,
        })
      }
    }

    goBackToList(containerID) {
      if (containerID) {
        history.push(`/SuiteList/Container/${containerID}`)
      } else {
        history.push('/SuiteList')
      }
      this.setState({
        redirectUrl: workspaceUrl,
        triageStage: Globals.TriageStage.SUITELIST,
      })
    }

    goToKanban = (selectedSuite, loadKanbanData) => {
        if (!selectedSuite && !this.state.selectedSuite) {
          history.push("/SuiteList/")
          this.setState({
              triageStage: Globals.TriageStage.SUITELIST,
              redirectUrl: workspaceUrl,
          })
        } else {
          if (!selectedSuite) {
            history.push("/SuiteList/" + this.state.selectedSuite + "/Kanban")
          } else {
            this.setState({
                selectedSuite,
                loadKanbanData,
            }, () => {
              history.push("/SuiteList/" + selectedSuite + "/Kanban")
              this.setState({
                  triageStage: Globals.TriageStage.KANBAN,
                  redirectUrl: kanbanUrl,
              })
            })
          }
        }
    }

    goTriage(selectedTestCaseId) {
      this.setState({
        triageStage: Globals.TriageStage.TRIAGE,
        redirectUrl: triageUrl,
        selectedTestCaseId,
      })
    }

    selectSuite = (selectedSuite, containerId) => {
        selectedSuite = parseInt(selectedSuite)
        if (!isNaN(selectedSuite)) {
            // history.push("/Dashboard/" + selectedSuite + "/Kanban")
            this.setState({
                selectedSuite,
                triageStage: Globals.TriageStage.KANBAN,
                redirectUrl: kanbanUrl,
                selectedContainerID: containerId,
                loadKanbanData: true,
            })
        } else {
            history.push("dashboard", "/SuiteList/")
            this.setState({
              triageStage: Globals.TriageStage.SUITELIST,
              redirectUrl: workspaceUrl,
            })
        }
    }

    setSelectedContainerID(selectedContainerID) {
      this.setState({
        selectedContainerID
      })
    }

    setSelectedSuite(selectedSuite) {
      this.setState({
        selectedSuite,
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

        switch (this.state.triageStage) {
            case Globals.TriageStage.TRIAGE:
                goalText = 'Analyze: (1) verify if the product is working and (2) if the automation is working.';
                actionText = 'Check the Product and Automation Functionality, and press Triage Done';
                videoUrl = 'https://youtu.be/05b_H6K67f4';
                break;
            case Globals.TriageStage.KANBAN:
                goalText = 'Classified test failures to analyze and get into Triage Done.';
                actionText =  'Click on each test to Triage.';
                videoUrl = 'https://youtu.be/o8fDzGGffX4';
                break;
            default:
                goalText = 'Overview page with organized failing test suites to work on.';
                actionText =  'Click on test suite.';
                videoUrl = 'https://youtu.be/BHvEROfmT30';
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

        return(
            <div className="homeRoot" style={{ minHeight: 'calc(100% - 91px)'}}>
                <Nav
                    triageStage={this.state.triageStage}
                    selectedContainerID={this.state.selectedContainerID}
                    selectedSuite={this.state.selectedSuite}
                    helpEnabled={helpEnabled}
                    helpItems={helpItems}
                    screen={'main'}
                    onHelpClick={this.onHelpClick.bind(this)}
                    goToKanban={this.goToKanban.bind(this)}
                    goBackToList={this.goBackToList.bind(this)}
                />
                <main style={{ marginTop: helpEnabled && helpItems.length > 1 ? 340 : (helpEnabled ? 225 : 91) }}>
                    {

                        this.state.triageStage == Globals.TriageStage.TRIAGE ?
                            <Triage
                                goToKanban={this.goToKanban.bind(this)}
                                setSelectedSuite={this.setSelectedSuite.bind(this)}
                                testId={this.state.selectedTestCaseId} />
                        :   this.state.triageStage == Globals.TriageStage.KANBAN ?
                                <Kanban
                                    goBack={this.goBackToList.bind(this)}
                                    goTriage={this.goTriage.bind(this)}
                                    loadKanbanData={this.state.loadKanbanData}
                                    helpEnabled={helpEnabled}
                                    selectedSuite={this.state.selectedSuite}
                                    setSelectedContainerID={this.setSelectedContainerID.bind(this)}
                                    selectedTestCaseId={this.state.selectedTestCaseId} />
                            :   <SuiteList
                                    suiteID={this.state.selectedSuite}
                                    helpEnabled={helpEnabled}
                                    selectSuite={this.selectSuite.bind(this)}
                                    triageStage={this.state.triageStage}
                                    params={this.props.match.params}
                                    onRef={ref => (this.child = ref)} />
                    }
                </main>
                {
                  this.state.triageStage != Globals.TriageStage.TRIAGE && (
                    <CopyrightFooter helpEnabled={helpEnabled} />
                  )
                }
            </div>
        )
    }
}
