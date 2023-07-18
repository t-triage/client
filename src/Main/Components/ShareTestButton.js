import React from "react"
import IconButton from "@mui/material/IconButton"
import InsertLink from "@mui/icons-material/InsertLink"
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import Tooltip from  "@mui/material/Tooltip"

//copio en el portapapeles
const copyClipboard = (text) => {
    return navigator.clipboard.writeText(text).then(
        function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
}


const onClickReturnFunction = (text) => {
    return () => {
        copyClipboard(text)
    }
}


export const ShareTestButton = (props) => {
    const location = window.location.href;
    const { textId } = props;
    const url = location + '?id=' + textId;
    return (
        <Tooltip title="copy Link">
            <IconButton onClick={onClickReturnFunction(url)} size="large">
                    <InsertLink/>
            </IconButton>
        </Tooltip>
    );
}



//    <ShareTestButton testId={test.id}/>