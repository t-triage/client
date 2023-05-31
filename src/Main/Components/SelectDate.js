import React,{Component} from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { styles, COLORS } from '../../Main/Components/Globals'
class SelectDate extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        anchorEl: null,
        valueSelect:null,
    };

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };
    handleDate = (number) => {
        this.handleClose()
        let dateActual = new Date();
        dateActual.setDate( dateActual.getDate() - number );
        this.setState({ anchorEl: null , valueSelect:dateActual});
        this.handleShow(dateActual)

    };
    handleShow(date){
        if(date != undefined){
            this.props.handleFilter(date);
        }
    }

    render() {
        const { anchorEl,valueSelect } = this.state;

        return (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Button variant="contained" href="#contained-buttons" color='primary' size='medium'
                    aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    Filter Date
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    <MenuItem  onClick={()=>this.handleDate(30)}>1 Month</MenuItem>
                    <MenuItem onClick={()=>this.handleDate(180)}>6 Month</MenuItem>
                    <MenuItem onClick={()=>this.handleDate(365)}>1 Year</MenuItem>
                </Menu>
            </div>
        );
    }
}

export default SelectDate;
