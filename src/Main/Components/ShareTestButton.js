import React from "react"
import IconButton from "@material-ui/core/IconButton"
import InsertLink from "@material-ui/icons/InsertLink"
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import Tooltip from  "@material-ui/core/Tooltip"

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
            <IconButton onClick={onClickReturnFunction(url)}>
                    <InsertLink/>
            </IconButton>
        </Tooltip>
    )
}



//    <ShareTestButton testId={test.id}/>