import React from 'react';

import './dealer-button.css';

export default class DealerButton extends React.Component{

    render () {
        return(
            <div className={`dealer-button ${this.props.position} ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                D
            </div>
        )
    }
}