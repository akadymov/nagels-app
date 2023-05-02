import React from 'react';

import './opponent-container.css';

//Local Components
import OpponentCards from '../opponent-cards';
import PlayerInfo from '../player-info/player-info';
import DealerButton from '../dealer-button';
import Cookies from 'universal-cookie';
import defaultTheme from '../../themes/default';


export default class OpponentContainer extends React.Component{

    Cookies = new Cookies();

    render() {
        return (
            <div 
                className={`opponent-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"} player${this.props.position} outof${this.props.numberOfPlayers}`}
            >
                <OpponentCards
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    cards={this.props.cards}
                    myPosition={this.props.myPosition}
                ></OpponentCards>
                <PlayerInfo
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    username={this.props.username}
                    betSize={this.props.betSize}
                    tookTurns={this.props.tookTurns}
                    active={this.props.active}
                ></PlayerInfo>
                {
                    this.props.isStarter ?
                        <DealerButton 
                            position={`player${this.props.position + 'outof' + this.props.numberOfPlayers}`}
                            isMobile={this.props.isMobile}
                            isDesktop={this.props.isDesktop}
                            isPortrait={this.props.isPortrait}
                        ></DealerButton>
                    :
                        ''
                }
            </div>
        )
    }
}