import React from 'react';

import './main-logo.css'

export default class MainLogo extends React.Component{
    
    render() {
        return (
            <div className={`main-logo-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <div className={`main-logo ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}></div>
            </div>
        )
    }
}
