import React from 'react';

import './user-info.css';
import Cookies from 'universal-cookie';

//MUI components

//Local components
import NagelsAvatar from '../nagels-avatar';


export default class UserInfo extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            usernameExpanded: false
        }
    }

    stringToColor(string) {
        let hash = 0;
        let i;
      
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
          hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
      
        let color = '#';
      
        for (i = 0; i < 3; i += 1) {
          const value = (hash >> (i * 8)) & 0xff;
          color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */
      
        return color;
    }
      
    stringAvatar(name) {
        return {
            sx: {
            bgcolor: this.stringToColor(name),
            },
            children: `${name[0][0]}`,
        };
    }
    
    expandUsername = () => {
        this.setState({ usernameExpanded: true })
    }
    
    collapseUsername = () => {
        this.setState({ usernameExpanded: false })
    }

    Cookies = new Cookies();

    render() {
        return(
            this.Cookies.get('idToken') && this.Cookies.get('username') ? 
                <div 
                    className={`user-info-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                    onMouseOver={this.expandUsername}
                    onMouseLeave={this.collapseUsername}
                >
                    {this.state.usernameExpanded ? 
                        <div className={`username-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            {this.Cookies.get('username')}
                        </div>
                    :
                        ''
                    }
                    <div className={`user-image-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <NagelsAvatar
                            username={this.Cookies.get('username')}
                            width={50}
                            height={50}
                        ></NagelsAvatar>
                    </div>
                </div>
            :
                <div></div>
            
        )
    }
}