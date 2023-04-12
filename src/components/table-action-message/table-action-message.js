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
                {this.props.allowedSuites ? 
                    this.props.allowedSuites.map(allowedSuit => {
                        return(
                            <p class={`${allowedSuit} trump-container action-message-text`} style={{position: 'relative', display: 'inline-block'}}>{this.props.allowedSuites.indexOf(allowedSuit) === 0 ? "Allowed card suits: " : ''}</p>
                        )
                    })
                :  
                    <p className={`action-message-text ${this.props.highlighted ? 'highlighted' : ''}`}>
                        {this.props.message}
                    </p>
                }
                {!this.props.isMobile && !this.props.highlighted && this.props.message !== 'This game is closed!' ? 
                    <LinearProgress
                        color='primary'
                        size='large'
                        sx={{width:'40%',positon: 'absolute', left: '50%', transform: 'translate(-50%, -300%)'}}
                    ></LinearProgress>
                :
                    ''
                }
            </div>
        )
    }
}