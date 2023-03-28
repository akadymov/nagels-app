import React from 'react';

import './open-card.css';

export default class OpenCard extends React.Component{

    constructor(props) {
        super(props);
        this.state = {}
    }
    
    render() {

        var leftShift = 0
        var topShift = 0
        var zindex = this.props.index
        var width = '70px'
        var height = '100px'

        if(!this.props.onTable) {
             leftShift = this.props.index * 22
            if(this.props.selectedCard === this.props.cardId.substring(5)){
                 topShift = -this.props.index * 100 - 38
            } else {
                 topShift = -this.props.index * 100
            }
            
        } 
        if(this.props.isMobile && this.props.onTable) {
            width = '49px'
            height = '70px'
        }

        return (
            <div 
                className="open-card" 
                onClick={this.props.onClick}
                cardid={this.props.cardId}
                index={this.props.index}
                selectedcard={this.props.selectedCard}
                style={{
                    zIndex: zindex, 
                    //left: this.props.cardOnTable ? leftShift : this.props.index*22, 
                    //top:  this.props.cardOnTable ? topShift : (-this.props.index*100 - 38 * (this.props.selectedCard === this.props.cardId.substring(5) ? 1 : 0))
                    left: leftShift,
                    top: topShift,
                    width: width,
                    height: height
                }}
            ></div>
        )
    }
}
