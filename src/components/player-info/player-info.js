import React from 'react';

import './player-info.css';
import NagelsAvatar from '../nagels-avatar';
import defaultTheme from '../../themes/default';
import Cookies from 'universal-cookie';
import { getText } from '../user-text';

export default class PlayerInfo extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    Cookies = new Cookies();

    render() {
        return(
            
                <div 
                    className={`player-info-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                    active={this.props.active ? 'true' : 'false'}
                    onClick={()=>window.location.assign('/profile/' + this.props.username)}
                >
                    <div 
                        className={`player-info-avatar-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                    >
                        <NagelsAvatar
                            username={this.props.username}
                            width={this.props.isMobile ? 38 :61} 
                            height={this.props.isMobile ? 38 : 61}
                            outline={this.props.active ? '2px solid ' + this.Cookies.get('colorScheme') === 'piggy' ? defaultTheme.palette.primary.piggy : defaultTheme.palette.primary.main : 'none'}
                        ></NagelsAvatar>
                    </div>
                    <div className={`player-data-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <div 
                            className={`player-username-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                        >
                        {this.props.username}
                        </div>
                        <div className={`player-bets-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <div className={`player-bets-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            {getText('bet')}
                            </div>
                            <div className={`player-bets-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            {this.props.betSize}
                            </div>
                        </div>
                        <div className={`player-took-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <div className={`player-took-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            {getText('took')}
                            </div>
                            <div className={`player-took-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            {this.props.tookTurns}
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}