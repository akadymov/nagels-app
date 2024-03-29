import React from 'react';

import './table-action-message.css';
import Cookies from 'universal-cookie';

//MUI components
import LinearProgress from '@mui/material/LinearProgress';

import { getText } from '../user-text';

export default class TableActionMessage extends React.Component{

    Cookies = new Cookies();
    
    render() {
        
        return (
            <div 
                className={`action-message-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"} ${this.props.highlighted ? 'highlighted' : ''}`}
            >
                <div className={`action-message-text ${this.props.highlighted ? 'highlighted' : ''}`}>
                    {this.props.message}
                </div>
                {this.props.allowedSuites ? 
                    this.props.allowedSuites.map(allowedSuit => {
                        return(
                            <div class={`${allowedSuit} trump-container action-message-text ${this.Cookies.get('deckType') === '4color' ? 'fourcolor' : ''}`} style={{position: 'relative', display: 'inline-block'}}></div>
                        )
                    })
                :  
                    ''
                }
                {!this.props.isMobile && !this.props.highlighted && this.props.message !== getText('game_closed_action_message') ? 
                    <LinearProgress
                        color='primary'
                        size='large'
                        sx={{width:'40%', display: 'inline-block', marginBottom: '8px'}}
                    ></LinearProgress>
                :
                    ''
                }
            </div>
        )
    }
}