import React from 'react';

import './main-logo.css'

export default class MainLogo extends React.Component{
    
    render() {
        return (
            <div className={`main-logo-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <p className={`main-logo-text ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Nigels Online</p>
            </div>
        )
    }
}
