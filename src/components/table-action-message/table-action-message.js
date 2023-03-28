import React from 'react';

import './table-action-message.css';

//MUI components
import LinearProgress from '@mui/material/LinearProgress';
import { ThemeProvider } from '@mui/material/styles';

// local components
import defaultTheme from '../../themes/default';

export default class TableActionMessage extends React.Component{
    
    render() {
        
        return (
            <div 
                className={`action-message-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"} ${this.props.highlighted ? 'highlighted' : ''}`}
            >
                <p className={`action-message-text ${this.props.highlighted ? 'highlighted' : ''}`}>
                    {this.props.message}
                </p>
                {!this.props.isMobile && !this.props.highlighted && this.props.message !== 'This game is closed!' ? 
                    <ThemeProvider theme={defaultTheme}>
                        <LinearProgress
                            color='primary'
                            size='large'
                            sx={{width:'40%',positon: 'absolute', left: '50%', transform: 'translate(-50%, -300%)'}}
                        ></LinearProgress>
                    </ThemeProvider>
                :
                    ''
                }
            </div>
        )
    }
}