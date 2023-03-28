import React from 'react';

import './form-container.css';
import FormButton from '../form-button';
import TextField from '@mui/material/TextField';
import parse from 'html-react-parser';
import { ThemeProvider } from '@mui/material/styles';

// Local components
import defaultTheme from '../../themes/default';


export default class FormContainer extends React.Component{

    render() {
        return(
            <div className={`form-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`} onKeyPress={this.props.onKeyPress}>
                <div className="form-title">{this.props.title}</div>
                {this.props.infoMessage ? 
                    <div className="form-message">{this.props.infoMessage}</div>
                :
                    ''
                }
                {this.props.htmlMessage ? 
                    <div className="form-message">{parse(this.props.htmlMessage)}</div>
                :
                    ''
                }
                { this.props.textFieldsList ? 
                    this.props.textFieldsList.map(field => {
                        return (
                            <div className="form-element-container" key={`container-${field.id}`}>
                                <ThemeProvider theme={defaultTheme} key={`theme-provider-${field.id}`}>
                                    <TextField
                                        id={field.id}
                                        key={field.id}
                                        label={field.label}
                                        variant={field.variant}
                                        onChange={field.onChange}
                                        onClick={field.onClick}
                                        error={field.errorMessage !== ''}
                                        helperText={field.errorMessage}
                                        type={field.type}
                                        required={field.required}
                                        defaultValue={field.text}
                                        autoComplete={field.autoComplete}
                                        multiline={field.rows}
                                        rows={field.rows}
                                        sx={{
                                            width: field.width,
                                            display: !field.hidden ? 'inline-flex' : 'none'
                                        }}
                                    ></TextField>
                                </ThemeProvider>
                            </div>
                        )
                    })
                :
                    ''
                }
                { this.props.submitButtonList ?
                    this.props.submitButtonList.map(button => {
                        return( 
                            <div className="form-element-container" key={`container-${button.id}`}>
                                <FormButton 
                                    key={button.id}
                                    variant={button.type}
                                    text={button.text}
                                    onSubmit={button.onSubmit}
                                    width={button.width}
                                    disabled={button.disabled}
                                    size={button.size}
                                    hidden={button.hidden}
                                ></FormButton>
                            </div>
                        )
                    })
                :
                    ''
                }
            </div>
        )
    }
}