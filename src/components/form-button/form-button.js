import React from 'react';

import './form-button.css';

//MUI components
import Button from '@mui/material/Button';


export default class FormButton extends React.Component{

    render() {
        return(
            <div className="button-container">
                <Button
                    id={this.props.id}
                    variant={this.props.variant}
                    disabled={this.props.disabled}
                    onClick={this.props.onSubmit}
                    onmousedown={this.props.onMouseDown}
                    onmouseup={this.props.onMouseUp}
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