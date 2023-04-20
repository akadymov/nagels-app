import React from 'react';

import './open-card.css';
import Cookies from 'universal-cookie';

export default class OpenCard extends React.Component{

    constructor(props) {
        super(props);
        this.state = {}
    }

    Cookies = new Cookies();
    
    render() {

        var leftShift = 0
        var topShift = 0
        var zindex = this.props.index
        var width = '70px'
        //var widthNum = 70
        var height = '100px'
        var heightNum = 100
        var interval = 22
        
        /*if(this.props.isMobile){
            if(this.props.onTable){
                width = '49px'
                //widthNum = 49
                height = '70px'
                heightNum = 70
            }
            if(this.props.modal){
                width = '49px'
                //widthNum = this.props.isPortrait ? 49 : 35
                height = '70px'
                heightNum = 70
                interval = 15
            }
        } else {
            if(this.props.modal){
                width = '60px'
                //widthNum = 60
                height = '86px'
                heightNum = 86
                interval = 18
            }
        }*/

        switch(this.props.size){
            case 'small':
                width = '49px'
                //widthNum = 49
                height = '70px'
                heightNum = 70
                interval = 15
                break
            case 'medium':
                width = '60px'
                //widthNum = 60
                height = '86px'
                heightNum = 86
                interval = 18
                break
            case 'large':
                width = '70px'
                //var widthNum = 70
                height = '100px'
                heightNum = 100
                interval = 22
                break
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
                className={`open-card ${this.Cookies.get('deckType') === '4color' ? 'fourcolor' : 'classic'} ${this.Cookies.get('colorScheme') === 'dark' ? 'inverted' : ''}`}
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
