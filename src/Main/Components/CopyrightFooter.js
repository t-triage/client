import React from 'react'
import TTriageLogo from "../../images/ttriage_greylogo.png"
import ClarolabLogo from "../../images/clarolab_greylogo.svg"

import { renderPopover } from './TriageUtils'
import {COLORS, WIKI_URL} from './Globals'

const CopyrightFooter = (props) => {
  let buildInfo = JSON.parse(sessionStorage.getItem("buildInfo"))
  return buildInfo && (
    <footer className="Site-Footer">
        <div id={"footerHelp"} style={{ display: 'flex', alignItems: 'center' }}>
					<a
						target="_blank"
						href="https://www.ttriage.com">
            <img
              src={TTriageLogo}
              style={{
                width: 60,
                marginTop: 2,
              }}
            />
          </a>
            &nbsp;|&nbsp;
            <a
                target="_blank"
                style={{ textDecoration: 'none', color: COLORS.primary, fontWeight: 'bold' }}
                href= {WIKI_URL + "community/publico/t-triage-support"}>
                    Send Feedback
            </a>
        </div>
      {/*TODO: uncomment to show Clarolab Logo in the footer*/}
				{/*<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>*/}
					{/*<img*/}
						{/*src={ClarolabLogo}*/}
						{/*alt="Clarolab logo"*/}
						{/*style={{*/}
							{/*width: '100px'*/}
						{/*}}*/}
						{/*onClick={null}*/}
					{/*/>*/}
					{/*<div>Software Development Services</div>*/}
				{/*</div>*/}
        {
          window.location.pathname.includes("/admin") && (
            <div>{`${buildInfo[0].value} - ${buildInfo[1].value} - ${buildInfo[5].value}`}</div>
          )
        }
        <div>
            {buildInfo[4].value}
        </div>
    </footer>
  )
}

export default CopyrightFooter;
