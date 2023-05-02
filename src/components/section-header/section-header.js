import React from 'react';
import FormButton from '../form-button';

import './section-header.css';

import defaultTheme from '../../themes/default';

import Cookies from 'universal-cookie';

export default class SectionHeader extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    Cookies = new Cookies();

    render() {

        return(
            <div 
                className={`section-header-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
            >
                {this.props.title ?
                    <div className={`section-title-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        {this.props.title}
                    </div>
                :
                    ''
                }
                {this.props.subtitle ?
                    <div className={`section-subtitle-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        {this.props.subtitle}
                    </div>
                :
                    ''
                }
                <div 
                    className={`controls-container  ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                >
                    {this.props.controls.map(control => {
                        return(
                            <FormButton
                                key={control.id}
                                id={control.id}
                                variant={control.variant}
                                text={control.text}
                                disabled={control.disabled}
                                onSubmit={control.onSubmit}
                                onMouseDown={control.onMouseDown}
                                onMouseUp={control.onMouseUp}
                                width={control.width}
                                size={control.size}
                                color={control.color}
                            ></FormButton>
                        )
                    })}
                </div>
            </div>
        )
    }
}