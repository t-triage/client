import React from 'react'
import ReactPlayer from 'react-player'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import IconButton from "@mui/material/IconButton"
import UserPicker from './UserPicker'
import TextField from "@mui/material/TextField"
import Grid from "@mui/material/Grid"
import Grow from '@mui/material/Grow';
import Tooltip from "@mui/material/Tooltip"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Typography from "@mui/material/Typography"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Popover from "@mui/material/Popover"
import Dialog from "@mui/material/Dialog"
import Popper from '@mui/material/Popper';
import CardMedia from '@mui/material/CardMedia';
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import AssignmentIcon from '@mui/icons-material/Assignment'
import { COLORS } from './Globals'

export let dialogProps = {
  maxWidth: "lg",
  fullWidth: true,
  style: {
    fontSize: '.875rem', fontFamily: 'Courier',
  }
}

export const getStatusTagColor = (status) => {
  switch (status) {
    case 'NEWFAIL':
      return COLORS.newFail;
    case 'FAIL':
      return COLORS.fail;
    case 'NEWPASS':
      return COLORS.newPass;
    case 'PASS':
      return COLORS.green;
    // case 'SKIP':
    // case 'INVALID':
    case 'PERMANENT':
      return COLORS.fail;
    case 'UNDEFINED':
      return COLORS.grey;
    default:
      return COLORS.grey;
  }
}

export const getStatusTagName = (status) => {
  switch (status) {
    case 'NEWFAIL':
      return 'New Fail';
    case 'FAIL':
      return 'Fail';
    case 'NEWPASS':
      return 'New Pass';
    case 'PASS':
      return 'Pass';
    case 'SKIP':
      return 'Skip';
    case 'INVALID':
      return 'Invalid';
    case 'PERMANENT':
      return 'Permanent';
    case 'UNDEFINED':
      return 'Undefined';
    default:
      return 'Undefined';
  }
}

export const getTestFailTagName = (status) => {
  switch (status) {
    case 'NO_FAIL':
      return 'Re Run and worked'
    case 'EXTERNAL_CAUSE':
      return 'Test Environment Issue'
    case 'TEST_ASSIGNED_TO_FIX':
      return 'Filed Ticket'
    case 'WONT_FILE':
      return 'Won\'t Fix'
    case 'UNDEFINED':
      return 'Skip'
    default:
      return 'I don\'t Know'
  }
}

export const getApplicationFailTagName = (status) => {
  switch (status) {
    case 'NO_FAIL':
      return 'Manual Test Succeed'
    case 'EXTERNAL_CAUSE':
      return 'Test Environment Issue'
    case 'FEATURE_IN_MAINTENANCE':
      return 'Stable Functionality'
    case 'FEATURE_NOT_COMPLETED':
      return 'Area In Dev'
    case 'FILED_TICKET':
      return 'Filed ticket'
    case 'UNDEFINED':
      return 'Skip'
    default:
      return 'I don\'t Know'
  }
}


const getTriageStatus = (testTriage) => {
    let {currentState} = testTriage;
    return (
      <div className='statusTag' style={{
        backgroundColor: getStatusTagColor(currentState),
        padding: '0 20',
        marginLeft: 20,
      }}>
          {getStatusTagName(currentState)}
      </div>
    )
  }

export const TextFieldInput = (props) => {
	return <TextField
		{...props}
		fullWidth
		variant="outlined"
		InputLabelProps={{
			shrink: true,
		}}
		style={{marginTop: props.nomargintop ? 0 : 20}}
		inputProps={{
			style: {
				fontSize: '.875rem',
			}
		}}
	/>
}

export const getSummaryDetails = (testTriage, onChange) => {
  return testTriage && (
    <List className='triageBoxDetailsList'>
        <ListItem className='TriageSumaryListItem'>
            <Grid container direction='column'>
                <Grid item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h6>Status</h6>
                        {getTriageStatus(testTriage)}
                    </div>
                </Grid>
                <Grid item>
                    <span>
                        {testTriage.deducedReason}
                    </span>
                </Grid>
                <Grid item style={{ marginTop: 10 }}>
                    <h6>Assignee</h6>
                </Grid>
                <Grid item>
                    <UserPicker
                        onChange={onChange}
                        buildTriage={testTriage.buildTriageId}
                        selectedItem={testTriage.triager}
												disabled={testTriage.triaged}
                    />
                </Grid>
                <Grid item style={{ marginTop: 10 }}>
                    <h6>Execution</h6>
                </Grid>
                <Grid item>
                    <span>
                        {`Container: ${testTriage.containerName}`}
                    </span>
                </Grid>
                <Grid item>
                    <span>
                        {`Suite: ${testTriage.executorName}`}
                    </span>
                </Grid>
                <Grid item>
                    <span>
                        {`Date: ${new Date(testTriage.executionDate).toLocaleDateString("en-US", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: false,
                        })}`}
                    </span>
                </Grid>
                <Grid item>
                    <span>
                        {`Duration: ${formatDuration(testTriage.testExecution.duration)}`}
                    </span>
                </Grid>
            </Grid>
        </ListItem>
    </List>
  )
}

export const getTimeAgo = (millis) => {
	let timeAgo = {
	  label: '',
    isToday: true
  }
	let millisAgo = new Date().getTime() - millis
	let daysAgo = Math.floor(millisAgo / 1000 / 60 / 60 / 24)
	let hoursAgo = Math.floor(millisAgo / 1000 / 60 / 60)
	let minutesAgo = Math.floor(millisAgo / 1000 / 60)
	let secondsAgo = Math.floor(millisAgo / 1000)

	if (daysAgo > 0) {
		timeAgo.label = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago.`
    timeAgo.isToday = false;
	}
	else if (hoursAgo > 0) {
		timeAgo.label = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago.`
	}
	else if (minutesAgo > 0) {
		timeAgo.label = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago.`
	}
	else if (secondsAgo > 0) {
		timeAgo.label = `${secondsAgo} second${secondsAgo > 1 ? 's' : ''} ago.`
	}

	return timeAgo
}

export const formatDuration = (millis) => {
    let hours = Math.floor(millis / 3600000)
    let minutes = Math.floor((millis / 60000) - (hours * 24))
    let seconds = Math.floor((millis / 1000) - (minutes * 60))
    let ms = Math.floor(millis - (seconds * 1000))

    return `${hours ? hours + 'h ': ''}${minutes ? minutes + 'm ' : ''}${seconds ? seconds + 's ' : ''}${ms}ms`
}

export const renderTableWithItems = (selector, isOpen=false, itemsArrays=[], usesRef=false, handleArrowRef=null, arrowRef=null, placement='bottom', showVideo=false, onShowVideo=null, onCloseVideo=null) => {
	let el = usesRef ? selector.current : document.getElementById(selector);
	let helpMenuesLength = itemsArrays.length;

	return (
		<Grow
			in={isOpen}
			timeout={'auto'}>
            <div>
                <div id={'demoVideoContainer'} />
                {itemsArrays.map((items, indexArray) => {
                return (
                    <div key={indexArray} id={"helpPopover" + selector}
                    className={`helpPopperContainer helpPopperContainerWithItems helpPopperTableWithItems ${helpMenuesLength > 1 ? 'multipleHelpMenues' : ''} ${isOpen ? 'isOpen' : ''} ${placement}`}
                    >
                        {items.map((item, index) => {
                            return (<div key={index} className={'popperItemContainer'}>
                            <div className={`popperItem ${item.videoURL ? 'hasVideo' : ''}`}>
                                {item.title && <h6 className={"activitiesTitle"}>{item.title}</h6>}
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    {item.text && <span style={{textTransform: 'initial', textAlign:'center'}} dangerouslySetInnerHTML={{__html: item.text}}/>}
                                    {item.videoURL ? (showVideo ? (
                                        <Popover
                                            id="demoVideoPopover"
                                            anchorEl={document.getElementById('demoVideoContainer')}
                                            open={Boolean(showVideo)}
                                            onClose={() => onCloseVideo && onCloseVideo()}
                                            anchorOrigin={{
                                                vertical: 'center',
                                                horizontal: 'center',
                                            }}
                                            transformOrigin={{
                                                vertical: 'center',
                                                horizontal: 'center',
                                            }}
                                            style={{zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.2)'}}
                                        >
                                            <Grow
                                                in={showVideo}
                                                timeout={'auto'}>
                                                <ReactPlayer
                                                    url={item.videoURL}
                                                    className={'demoVideo'}
                                                    controls={true}
                                                    playing
                                                />
                                            </Grow>
                                        </Popover>
                                    ) : (
                                            <ReactPlayer
                                                url={item.videoURL}
                                                controls={true}
                                                playing={false}
                                                width={"190px"}
                                                height={"110px"}
                                            />
                                    )): null}
                                </div>
                            </div>
                        </div>)
                        })}
                    </div>)
            })}
            </div>
        </Grow>)
}

export const renderPopoverWithItems = (selector, isOpen=false, items=[], usesRef=false, handleArrowRef=null, arrowRef=null, placement='bottom') => {
	let el = usesRef ? selector.current : document.getElementById(selector);

	return (<Popper
		id={"helpPopover" + selector}
		className={`helpPopperContainer helpPopperContainerWithItems ${placement}`}
		disablePortal={true}
		anchorEl={el}
		open={Boolean(isOpen)}
		placement={placement}
		modifiers={{
			flip: {
				enabled: true,
			},
			preventOverflow: {
				enabled: true,
				boundariesElement: 'scrollParent',
			},
			arrow: {
				enabled: true,
				element: arrowRef ? arrowRef.current : null

			}
		}}
	>
		{<span className={`arrow ${placement}`} ref={arrowRef} />}
		{items.map((item, index) => {
			return (<div className={'popperItemContainer'}>
				<div className={`popperItem ${item.videoURL ? 'hasVideo' : ''}`}>
					{item.title && <h6 className={"activitiesTitle"}>{item.title}</h6>}
					<div style={{display: 'flex', flexDirection: 'column'}}>
						{item.text && <span style={{textTransform: 'initial', textAlign:'center'}} dangerouslySetInnerHTML={{__html: item.text}}/>}
						{item.videoURL && (
							<ReactPlayer
								url={item.videoURL}
								controls={true}
								width={"120px"}
								height={"100px"}
							/>
						)}
					</div>
				</div>
			</div>)
		})}
	</Popper>)
}

export const renderPopover = (selector, isOpen=false, title=null, text=null, videoURL=null, usesRef=false, handleArrowRef=null, arrowRef=null, placement='bottom') => {
	let el = usesRef ? selector.current : document.getElementById(selector);

	return (<Popper
		id={"helpPopover" + selector}
		className={`helpPopperContainer ${placement}`}
		disablePortal={true}
		anchorEl={el}
		open={Boolean(isOpen)}
		placement={placement}
		modifiers={{
			flip: {
				enabled: true,
			},
			preventOverflow: {
				enabled: true,
				boundariesElement: 'scrollParent',
			},
			arrow: {
				enabled: true,
				element: arrowRef ? arrowRef.current : null

			}
		}}
	>
		{<span className={`arrow ${placement}`} ref={arrowRef} />}
		<div className={`boardActivities helpPopper ${videoURL ? 'hasVideo' : ''}`} style={{backgroundColor:'white', fontSize: '16px'}}>
      {title && <h6 className={"activitiesTitle"}>{title}</h6>}
			<div style={{display: 'flex', flexDirection: 'column'}}>
        {text && <span style={{textTransform: 'initial', textAlign:'center'}} dangerouslySetInnerHTML={{__html: text}}/>}
        {videoURL && (
          <ReactPlayer
						url={videoURL}
						controls={true}
						width={"200px"}
						height={"112px"}
					/>
        )}
			</div>
		</div>
	</Popper>)
}

export const DIALOG = (dialogProps, title, open, onClose, data, color, diff = false, copyToCLipboard=true, actionButtons=null) => {
  return (
    <Dialog {...dialogProps}
        key={`dialog-${title}`}
        open={open}
        onClose={onClose}
        aria-labelledby="stackTrace-dialog-title"
        aria-describedby="stackTrace-dialog-description">
        <DialogTitle id="stackTrace-dialog-title" className="DialogTitle">
            <div className="TriageDialogTitle" style={{borderColor: color}}>
                <h5 style={{ color }}>{title}</h5>
              {copyToCLipboard && !diff && <AssignmentIcon
                    onClick={copyToClipboard.bind(this, data)}
                    style={{
                      color,
                      marginLeft: 15,
                      cursor: 'pointer',
                    }} />}
            </div>
        </DialogTitle>
        <DialogContent style={{whiteSpace: 'pre-wrap'}} className={"triageDialogContent"} id="stackTrace-dialog-description">
            {data}
        </DialogContent>

        <DialogActions style={{ padding: '16' }}>
          {!actionButtons && <Button
                onClick={onClose}
                className="globalButton"
                type="submit"
                variant="contained"
                color={'primary'}>
                {'Close'}
            </Button> }
          {actionButtons}
        </DialogActions>
    </Dialog>
  )
}

export const renderStepDetailsDialog  = (open, onClose, details, title) => {
    dialogProps = {...dialogProps, maxWidth: 'md'}
    return open && (
      DIALOG(dialogProps, title, open, onClose, details, COLORS.yellow)
    )
}

export const renderChangePasswordDialog  = (open, onClose, content, title, actionButtons) => {
	dialogProps = {...dialogProps, maxWidth: 'md'}
	return open && (
		DIALOG(dialogProps, title, open, onClose, content, COLORS.yellow, false,false, actionButtons)
	)
}

export const renderCoverageChartDialog  = (open, onClose, content, title) => {
	dialogProps = {
	  ...dialogProps,
    maxWidth: 'md',
    className: 'coverageChartDialog',
    classes: {
			paper: 'coverageChartDialogContainer'
		}
	}

	return open && (
		DIALOG(dialogProps, title, open, onClose, content, COLORS.yellow, false, false)
	)
}

export const getBoldCharCode = (char) => {
  return char.replace(/\w/g, (c) => isNaN(c) ? String.fromCodePoint(0x1D58D + c.charCodeAt(0)) : String.fromCodePoint(0x1D7BC + c.charCodeAt(0)));
}

export const renderStackTraceDialog = (open, onClose, stackTrace, productPackages) => {
    if (productPackages) {
      productPackages = productPackages.split(',')
      productPackages.map(pack => {
        let replace = pack.bold()
        stackTrace = stackTrace.replace(new RegExp(pack,"g"), getBoldCharCode(pack))
      })
    }
    stackTrace = formatException(stackTrace)
    dialogProps = {
        ...dialogProps,
        maxWidth: 'xl'
    }
    return open && (
      DIALOG(dialogProps, 'STACKTRACE', open, onClose, stackTrace, '#ffaa1b')
    )
}

export const renderErrorDetailsDialog = (open, onClose, errorDetails) => {
    return open && (
      DIALOG(dialogProps, 'ERROR DETAILS', open, onClose, errorDetails, '#d40000')
    )
}

export const renderDiffDetailsDialog = (open, onClose, prevDetail, newDetail) => {
    return open && (
        DIALOGDIFF(dialogProps,'ERROR DIFFERENCES', open, onClose, prevDetail, newDetail, '#4285F4', true)
    )
}

export const DIALOGDIFF = (dialogProps, title, open, onClose, prevDetail, newDetail, color, diff = false, copyToCLipboard=true, actionButtons=null) => {
    return (
        <Dialog{...dialogProps}
                key={`dialog-${title}`}
                open={open}
                onClose={onClose}
                aria-labelledby="stackTrace-dialog-title"
                aria-describedby="stackTrace-dialog-description">
            <DialogTitle id="stackTrace-dialog-title" className="DialogTitle">
                <div className="TriageDialogTitle" style={{borderColor: color}}>
                    <h5 style={{ color }}>{title}</h5>
                </div>
            </DialogTitle>

            <DialogContent style={{whiteSpace: 'pre-wrap'}} className={"triageDialogContent"} id="stackTrace-dialog-description">
                <Grid container>
                    <Grid item xs={6} style={{ overflow: "hidden", overflowWrap: "break-word"}}>
                        <DialogTitle id="stackTrace-dialog-title" className="DialogTitle">
                            <h5 style={{ color:'#ff7f7f', fontSize: 15 }}>Previous error</h5>
                        </DialogTitle>
                        {prevDetail}
                    </Grid>
                    <Grid item xs={6}>
                        <DialogTitle id="stackTrace-dialog-title" className="DialogTitle">
                            <h5 style={{ color: '#7fbf7f', fontSize: 15  }}>Current error</h5>
                        </DialogTitle>
                        {newDetail}
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions style={{ padding: '16' }}>
                {!actionButtons && <Button
                    onClick={onClose}
                    className="globalButton"
                    type="submit"
                    variant="contained"
                    color={'primary'}>
                    {'Close'}
                </Button> }
                {actionButtons}
            </DialogActions>
        </Dialog>

    )
}

export const renderScreenshotDialog = (open, onClose, screenshot) => {
    let props = {
      open,
      onClose,
      maxWidth: "lg",
      fullWidth: true,
    }

    return open && (
      <Dialog {...props}
          aria-labelledby="errorDetails-dialog-title"
          aria-describedby="errorDetails-dialog-description">
          <DialogTitle id="errorDetails-dialog-title">
              <span style={{borderColor: COLORS.red}} className="errorStyles headerErrorDetails">SCREENSHOT</span>
          </DialogTitle>
          <DialogContent id="errorDetails-dialog-description">
              {
                screenshot && (
                  <a href={screenshot} target="_blank">
                      <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={screenshot} ></img>
                  </a>
                )
              }
              {
                !screenshot && (
                  <div className="circularProgressContainer" style={{ height: '25%' }}>
                      <CircularProgress color="primary" />
                  </div>
                )
              }
          </DialogContent>
          <DialogActions>
              <Button
                  onClick={onClose}
                  className="globalButton"
                  type="submit"
                  variant="contained"
                  color={'primary'}>
                  {'Close'}
              </Button>
          </DialogActions>
      </Dialog>
    )
}

export const copyToClipboard = (details) => {
  let {clipboard} = navigator
  if (clipboard) {
    clipboard.writeText(details)
  } else {
    copyToClipboardOld(details)
  }
}

export const copyToClipboardOld = (details) => {
  let text = document.createElement('textarea')
  text.value = details
  text.setAttribute('readonly', '')
  document.body.appendChild(text)
  text.select()
  text.focus()
  document.execCommand('copy')
  document.body.removeChild(text)
}

export const getPrevButtonStyle = (prevTriageIndex) => {
  let condition = prevTriageIndex === 0;
  return {
    color: condition ? '#ccc' : COLORS.blue,
    cursor: condition ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
  }
}

export const getNextButtonStyle = (previousTriage, prevTriageIndex) => {
  let condition = prevTriageIndex === previousTriage.length - 1;
  return {
    color: condition ? '#ccc' : COLORS.blue,
    cursor: condition ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
  }
}

export const formatException = (exceptionMessage) => {
    let result = exceptionMessage || '';

    let searchReplaces = [
        {
            find:/   at/g,
            repl: '\r\n   at'},
        {
            find:/ ---> /g,
            repl: '\r\n ---> '},
        {
            find:/\) at /g,
            repl: '\r\n at '},
        {
            find:/ --- End of inner exception stack trace ---/g,
            repl: '\r\n   --- End of inner exception stack trace ---'}
    ]

    searchReplaces.forEach(function(item){
        result = result.replace(item.find, item.repl);
    });

    return result;
};

export const isEmptyOrNull = (string) => {
    if (string == null){return true}
    if (string == ""){return true}
    return false;
}

export const capitalize = string => {
	return string.charAt().toUpperCase() + string.slice(1).toLowerCase();
};

export const prettify = string => {
	return string.replace(/_|-/g,' ');
};
