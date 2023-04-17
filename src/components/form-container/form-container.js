import React from 'react';

import './form-container.css';
import FormButton from '../form-button';
import TextField from '@mui/material/TextField';
import parse from 'html-react-parser';
import { getText } from '../user-text';

//MUI components
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';


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
                            </div>
                        )
                    })
                :
                    ''
                }
                { this.props.selectList ? 
                    this.props.selectList.map(select => {
                        return(
                            <div className="form-element-container" key={`container-${select.id}`}>
                                <Select
                                    labelId={select.id}
                                    id={select.id}
                                    value={select.defaultValue}
                                    label={select.value}
                                    sx={{width: select.width, textAlign: 'left'}}
                                    onChange={select.onChange}
                                >
                                    {select.values.map(selectValue => {
                                        return(
                                            <MenuItem value={selectValue.value}>{selectValue.label}</MenuItem>
                                        )
                                    })}
                                </Select>
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