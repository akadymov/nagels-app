import React from 'react';

import './table-put-cards.css';
import OpenCard from '../open-card';
import { getText } from '../user-text';
import NagelsAvatar from '../nagels-avatar';

export default class TablePutCards extends React.Component{

    getRelativePosition(playerInitialPosition){
        var relativePosition = (playerInitialPosition - this.props.myPosition) % this.props.playersCount
        if (relativePosition < 0){
            relativePosition = this.props.playersCount + relativePosition
        }
        return relativePosition
    }
    
    render() {
        
        return (
            <div className={`table-put-cards-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                {this.props.isLastTurn ? 
                    <div className='last-turn-header'>{getText('last_turn')}</div>
                :
                    ''
                }
                {this.props.cardsOnTable.map(card => {return(
                    <div 
                        className={`table-put-card player${this.getRelativePosition(card.playerPosition)} outof${this.props.playersCount} ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                        style={{zIndex: this.props.cardsOnTable.findIndex( el => el === card )}}
                        key={`table-put-card-${card.cardId}`}
                    >
                        <OpenCard 
                            isMobile={this.props.isMobile}
                            isDesktop={this.props.isDesktop}
                            isPortrait={this.props.isPortrait}
                            cardId={'card-' + card.cardId}
                            key={'card-' + card.cardId}
                            onTable={true}
                            size={this.props.isMobile ? 'small' : 'medium'}
                        ></OpenCard>
                        {card.playerUsername ? 
                            <div className={`put-card-avatar player${this.getRelativePosition(card.playerPosition)} outof${this.props.playersCount} ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <NagelsAvatar
                                    width = {this.props.isMobile ? "20px" : "20px"}
                                    height = {this.props.isMobile ? "20px" : "20px"}
                                    username = {card.playerUsername}
                                ></NagelsAvatar>
                            </div>
                        :
                            ''
                        }
                    </div>
                    )})}
            </div>
        )
    }
}