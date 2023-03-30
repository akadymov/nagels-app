import React from 'react';

import './nagels-modal.css';

//MUI components
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormButton from '../form-button';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider } from '@mui/material/styles';

// local components
import defaultTheme from '../../themes/default';


export default class NagelsModal extends React.Component{

    render() {
        return(
            <Modal
                open={this.props.open}
            >
                <div className={`modal-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    <div className='modal-content-container'>
                        <ThemeProvider theme={defaultTheme}>
                            <div className="modal-header">{this.props.header}</div>
                            <div className="modal-text-container">
                                <p>{this.props.text}</p>
                            </div>
                            <div 
                                className="modal-controls-container"
                                onKeyPress={this.props.onKeyPress}
                            >
                                {this.props.controls.map(control => {
                                    switch(control.type){
                                        case 'input':
                                            return (
                                                <div className="modal-control-container" key={control.id}>
                                                        <TextField
                                                            id={control.id}
                                                            key={control.id}
                                                            label={control.label}
                                                            type={control.textFormat}
                                                            variant={control.variant}
                                                            onChange={control.onChange}
                                                            width={control.width}
                                                            required={control.required}
                                                            defaultValue={control.text}
                                                            error={control.errorMessage}
                                                            helperText={control.errorMessage}
                                                        ></TextField>
                                                </div>
                                            )
                                        case 'input-file':
                                            return (
                                                <div className="modal-control-container" key={control.id}>
                                                    <input
                                                        type="file"
                                                        onChange={control.onChange}
                                                        onClick={control.onClick}
                                                        accept={control.accept}
                                                        style={{ display: control.hidden ? 'none' : 'block' }}
                                                    ></input>
                                                </div>
                                            )
                                        case 'button':
                                            return(
                                                <div className="modal-control-container" key={control.id}>
                                                <FormButton
                                                    id={control.id}
                                                    key={control.id}
                                                    onSubmit={control.onSubmit}
                                                    variant={control.variant}
                                                    disabled={control.disabled}
                                                    text={control.text}
                                                    width={control.width}
                                                    color={control.color}
                                                ></FormButton>
                                                </div>
                                            )
                                        case 'text':
                                            return(
                                                <div className={`modal-control-container ${control.style || ''}`} key={control.id}>
                                                    {control.text}
                                                </div>
                                            )
                                        default:
                                            return('')
                                    }
                                })}
                            </div>
                            {this.props.modalCanClose ?
                                <div class="modal-close-icon-container">
                                    <CloseIcon
                                        onClick={this.props.closeModal}
                                    ></CloseIcon>
                                </div>
                            : 
                                ''
                            }
                        </ThemeProvider>
                    </div>
                </div>
            </Modal>
        )
    }
}