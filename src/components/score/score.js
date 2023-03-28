import React from 'react';

import './score.css';

export default class Score extends React.Component{

    render () {
        return(
            <div className="score-container">
                <div className="bet-size-container">
                    <div className={`bet-size ${this.props.bonus ? 'bonus' : ''}`}>{this.props.betSize}</div>
                </div>
                <div className={`score`}>{this.props.score}</div>
            </div>
        )
    }
}