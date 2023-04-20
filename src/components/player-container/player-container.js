import React from 'react';

import './player-container.css';

//Local components
import PlayerInfo from '../player-info/player-info';
import OpenCard from '../open-card';
import DealerButton from '../dealer-button';


export default class PlayerContainer extends React.Component{

    render() {

        const cardsDivWidth = 22*(this.props.dealtCards.length - 1) + 70

        return (
            <div className={`player-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <div 
                    className={`player-cards-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                    style={{width:  cardsDivWidth}}
                >
                    {this.props.dealtCards.map(card => {return(
                        <OpenCard 
                            key={'card-' + card}
                            cardId={'card-' + card}
                            selectedCard={this.props.selectedCard}
                            index={this.props.dealtCards.findIndex( el => el === card )}
                            onClick={this.props.onSelectCard}
                            size={this.props.isMobile ? 'small' : 'large'}
                        ></OpenCard>
                    )})}
                    {
                        this.props.isStarter ?
                            <DealerButton
                                isMobile={this.props.isMobile}
                                isDesktop={this.props.isDesktop}
                                isPortrait={this.props.isPortrait}
                            ></DealerButton>
                        :
                            ''
                    }
                </div>
                <PlayerInfo
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    username={this.props.username}
                    betSize={this.props.betSize}
                    tookTurns={this.props.tookTurns}
                    active={this.props.active}
                ></PlayerInfo>
            </div>
        )
    }
}