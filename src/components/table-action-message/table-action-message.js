import React from 'react';

import './table-action-message.css';

//MUI components
import LinearProgress from '@mui/material/LinearProgress';

export default class TableActionMessage extends React.Component{
    
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
                {!this.props.isMobile && !this.props.highlighted && this.props.message !== 'This game is closed!' ? 
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