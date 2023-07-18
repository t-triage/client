import React, { Component } from 'react'
import DoneIcon from "@mui/icons-material/Done";
import TriageInfoBox from "./TriageInfoBox";
import Grid from "@mui/material/Grid";
// import spacing from "@mui/material/styles/spacing";
import InfoBox from "./InfoBox";
import Card from "@mui/material/Card";
import {CardContent} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import LockIcon from "@mui/icons-material/Lock";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import TableCell from "@mui/material/TableCell";
import {COLORS} from "./Globals";
import TimelineIcon from "@mui/icons-material/Timeline";
import StarsIcon from "@mui/icons-material/Star";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import TTriageLogo from "../../images/favicon.png";
import TTriageLogo1 from "../../images/ttriage_greylogo.png";
import {Image} from "@mui/icons-material";

export default class Success extends Component{
    componentDidMount() {
        window.opener.grantAccess()
        console.log(window.opener)
    }

    render() {
        return(
            // <div className="CenterList" style={{backgroundColor: "lightgrey", alignItems:"center"}}>
            // <div style={{backgroundColor: "lightgrey", alignItems:"center", justifyItems:"center", justifyContent:"center", border: '10px solid rgba(0, 0, 0, .125)', borderColor: "#2196f3"}}>
            <div style={{alignItems:"center", justifyItems:"center", justifyContent:"center"}}>
                {/*<div style={{justifyContent:"center"}}>*/}
                <div style={{
                    justifyContent:"center",
                    display: "flex",
                    // flexDirection: "column",
                    alignItems: "center",
                    marginBottom:20}}>
                    <img src={TTriageLogo} style={{width: 35, display:"flex"}}/>
                    <img src={TTriageLogo1} style={{width: 125, display:"flex", marginTop:12}}/>
                </div>
                {/*<Image src="../images/favicon.png" alt="TTriageLog"/>*/}
                {/*<h5 style={{fontSize: 16, justifyItems:"center", justifyContent:"center", padding:'80px 140px 80px 155px'}}>*/}
                <h5 style={{fontSize: 16, justifyItems:"center", justifyContent:"center", padding:'80px 0px 80px 0px', display:"flex"}}>
                <div style={{color: COLORS.primary, justifyItems:"center", justifyContent:"center", borderLeft: '8px solid', padding:'0px 0px 0px 30px'}}>
                        <h1 style={{color: COLORS.primary}}>Permission Granted</h1>
                    </div>
                </h5>
                <h3 style={{textAlign:"center", padding:'0px 0px 60px 0px'}}>Your product is now connected</h3>
                {/*<CheckCircleOutlineIcon style={{color: "#2196f3", backgroundColor: "white", fontSize: 180, shapeImageThreshold:4}}/>*/}
                {/*<br/><br/><br/>*/}
                <div className="CenterList" style={{borderRadius:140, height:140, width:140, background: COLORS.green1, margin:"auto", alignItems: "center", justifyContent:"center", justifyItems:"center", padding:'0px 0px 0px 0px'}}>
                    <div style={{borderRadius:120, height:120, width:120, background: COLORS.green1, margin:0, alignItems: "center"}}>
                        {/*<i className="checkmark">✓</i>*/}
                        <DoneIcon style={{fontSize: 60, height:120, width:120, color: "white", alignItems:"center"}}/>
                    </div>
                </div>
                {/*<div className="Containers-Main" style={{backgroundColor: "lightyellow", borderRadius: 5, marginTop: 80, marginLeft: 80, marginRight: 80, alignItems: "center"  }}>*/}
                    {/*<CardContent color="primary" style={{backgroundColor: "#2196f3", borderRadius: 5}}>*/}
                    {/*    <h1 style={{color: "white"}}>Permission Granted <CheckCircleIcon></CheckCircleIcon></h1>*/}
                    {/*</CardContent>*/}
                    {/*    <p>You can now close this window</p>*/}
                    {/*    <DoneIcon style={{backgroundColor: "mediumspringgreen"}}></DoneIcon>*/}
                    {/*    <div>*/}
                    {/*    <button color={"blue"} style={{backgroundColor: "mediumspringgreen"}}>aaa</button>*/}
                    {/*    <div color="primary">azul</div>*/}
                    {/*        <ListItemText className={"itemText"} primary="Change Password" />*/}
                    {/*        <ListItem className={"itemContent"} button key="changePassword">*/}
                    {/*            <ListItemIcon className={"itemIcon"}><LockIcon /></ListItemIcon>*/}
                    {/*            <ListItemText className={"itemText"} primary="Change Password" />*/}
                    {/*        </ListItem>*/}
                    {/*        <TableCell className="jobsTableRow" style={{borderLeft: '10px solid rgba(0, 0, 0, .125)', borderColor: "yellow"}}><Typography>probando</Typography></TableCell>*/}
                    {/*        <TimelineIcon className='triageBoxIcon' style={{color: COLORS.yellow}} />*/}
                    {/*        <StarsIcon style={{  padding: '0px 6px', color: COLORS.yellow }} />*/}
                    {/*</div>*/}
                    {/*<body>*/}

                    {/*<div className="card" style={{alignItems:"center", justifyContent:"center"}}>*/}
                        {/*<div style={{borderRadius:200, height:200, width:200, background: "#F8FAF5", margin:0}}>*/}
                        {/*<h1>Success</h1>*/}
                        {/*<p>We received your purchase request;<br/> we'll be in touch shortly!</p>*/}
                    {/*</div>*/}
                {/*<br/><br/><br/><br/>*/}
                    <body1 className={Typography} style={{justifyItems:"center", justifyContent:"center", margin:"auto", textAlign:"center"}}>
                        {/*<div className="TriageDialogTitle" style={{borderColor: "#2196f3", justifyItems:"center", justifyContent:"center"}}>*/}
                            <h3 style={{margin:"auto", padding: '80px 0px 180px 0px'}}>Thanks for trusting t-Triage</h3>
                        {/*</div>*/}
                    </body1>
                {/*<br/><br/><br/><br/><br/><br/><br/><br/><br/>*/}
                <CardActions style={{justifyContent: 'flex-end', marginRight: 40, textAlign:"center"}}>
                    <Button
                        type="button"
                        className="globalButton"
                        variant="contained"
                        onClick={window.close}
                        color="primary">
                        Close
                    </Button>
                </CardActions>
                    {/*</body>*/}
                {/*</div>*/}
                {/*<script type="text/javascript">*/}
                {/*    window.onunload = function () {*/}
                {/*    // opener.callParentFunction()*/}
                {/*    opener.validateTest()*/}
                {/*};*/}
                {/*    /!*    window.opener.onunload(e.validateTest.bind(this))*!/*/}
                {/*</script>*/}
            </div>
        )
    }
}