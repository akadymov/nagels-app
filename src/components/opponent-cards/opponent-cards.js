import React from 'react';

import './opponent-cards.css'

export default class OpponentCards extends React.Component{
    
    render() {

        const cards = []
        const numberOfCards = this.props.cards ? this.props.cards : 0
        
        for (var i = 0; i < numberOfCards; i++) {
            cards.push(
                <div key={`card ${i}`}
                    className={`opponent-card ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"} player${this.props.position} outof${this.props.numberOfPlayers}`}
                    style={{
                        zindex: numberOfCards-i, 
                        left: i*(this.props.isMobile ? 10 : 14),
                        top: -i*(this.props.isMobile ? 50 : 90)
                    }}
                ></div>
            )
        }

        return (
            <div 
                className="cards-container"
                style={{
                    left: -(numberOfCards-1)*(this.props.isMobile ? 5 : 7)
                }}
            >{cards}</div>
        )
    }
}
