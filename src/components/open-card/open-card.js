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
        var widthNum = 70
        var height = '100px'
        var heightNum = 100
        var interval = 22
        
        if(this.props.isMobile){
            if(this.props.onTable){
                width = '49px'
                widthNum = 49
                height = '70px'
                heightNum = 70
            }
            if(this.props.modal){
                width = '35px'
                widthNum = 35
                height = '50px'
                heightNum = 50
                interval = 10
            }
        } else {
            if(this.props.modal){
                width = '49px'
                widthNum = 49
                height = '70px'
                heightNum = 70
                interval = 15
            }
        }

        if(!this.props.onTable) {
             leftShift = this.props.index * interval
            if(this.props.selectedCard === this.props.cardId.substring(5)){
                 topShift = -this.props.index * heightNum - 38
            } else {
                 topShift = -this.props.index * heightNum
            }
            
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
