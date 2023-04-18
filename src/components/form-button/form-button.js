import React from 'react';

import './form-button.css';

//MUI components
import Button from '@mui/material/Button';

//Local components
import Cookies from 'universal-cookie';


export default class FormButton extends React.Component{

    Cookies = new Cookies();

    render() {


        return(
            <div className="button-container">
                <Button
                    id={this.props.id}
                    variant={this.props.variant}
                    disabled={this.props.disabled}
                    onClick={this.props.onSubmit}
                    onMouseDown={this.props.onMouseDown}
                    onMouseUp={this.props.onMouseUp}
                    size={this.props.size}
                    color={this.props.color}
                    sx={{
                        width:this.props.width,
                        display: this.props.hidden ? 'none' : 'block'
                    }}
                >{this.props.text}</Button>
            </div>
        )
    }
}