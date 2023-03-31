import React from 'react';
import './nav-menu.css';

//MUI components
import FeedbackRoundedIcon from '@mui/icons-material/Feedback';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEvents';
import HomeRoundedIcon from '@mui/icons-material/Home';
import InfoRoundedIcon from '@mui/icons-material/Info';
import LogoutRoundedIcon from '@mui/icons-material/Logout';
import LoginRoundedIcon from '@mui/icons-material/Login';

// Integration modules
import Cookies from 'universal-cookie';

//Local components
import NagelsAvatar from '../nagels-avatar';


export default class NavMenu extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            menuExpanded: false,
            hoveredItem: null,
            loggedIn: false
        }
    }
    Cookies = new Cookies();

    CheckIfAlreadyLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(idToken) {
            this.setState({ loggedIn: true })
        }
    }

    expandMenu = () => {
        if(this.props.isDesktop){
            this.setState({ menuExpanded: true})
        }
    }

    wrapMenu = () => {
        this.setState({ menuExpanded: false})
    }

    hoverItem = (e) => {
        this.setState({ hoveredItem: e.target.id })
    }

    unhoverItems = () => {
        this.setState({ hoveredItem: null })
    }

    handleNavItemClick = (pathname) => {
        window.location.assign(pathname)
    }

    signOut = () => {
        this.Cookies.remove('idToken', {path:'/login'})
        window.location.assign('/signin')
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

    componentDidMount() {
        this.CheckIfAlreadyLoggedIn()
    }

    render() {
        
        const ScreenSizeClassPostfix = this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")
        const ScreenOrientationClassPostfix = this.props.isPortrait ? "portrait" : "landscape"

        return(
            <div className={`nav-menu ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} onMouseOver={this.expandMenu} onMouseLeave={this.wrapMenu}> {/* FIXME: when hovering element above function is not triggered*/}
                {this.state.loggedIn ? 
                    <div 
                        className={`menu-item-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} 
                        id="profile"
                        onMouseEnter={this.hoverItem} 
                        onMouseLeave={this.unhoverItems}
                        onClick={() => {this.handleNavItemClick('/profile')}}
                    >
                        <div className={`menu-item-icon-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <NagelsAvatar
                                username={this.Cookies.get('username')}
                                width={35}
                                height={35}
                                outline={this.state.hoveredItem === 'profile' ? '1px solid darkViolet' : (window.location.pathname.startsWith('/profile') ? '1px solid #01aa00' : 'none')}
                            ></NagelsAvatar>
                        </div>
                        {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.hoveredItem === 'profile' ? 'secondary' : (window.location.pathname.startsWith('/profile') ? 'action' :'')}`}>PROFILE</p>
                        </div>   
                    :
                        ''
                    }
                    </div>
                :
                    <div 
                        className={`menu-item-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} 
                        id="feedback" 
                        onMouseEnter={this.hoverItem} 
                        onMouseLeave={this.unhoverItems}
                        onClick={() => {this.handleNavItemClick('/feedback')}}
                    >
                        <div className={`menu-item-icon-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`}>
                            <FeedbackRoundedIcon 
                                type="navItem"
                                fontSize="large" 
                                color={this.state.hoveredItem === 'feedback' ? 'secondary' : (window.location.pathname.startsWith('/feedback') ? 'action' :'primary')}
                            />
                        </div>
                        {this.state.menuExpanded ? 
                            <div className="menu-item-title-container">
                                <p className={`menu-item-title ${this.state.hoveredItem === 'feedback' ? 'secondary' : (window.location.pathname.startsWith('/feedback') ? 'action' :'')}`}>FEEDBACK</p>
                            </div>   
                        :
                            ''
                        }
                    </div>
                }
                <div 
                    className={`menu-item-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} 
                    id="leaderboard" 
                    onMouseEnter={this.hoverItem} 
                    onMouseLeave={this.unhoverItems}
                    onClick={() => {this.handleNavItemClick('/leaderboard')}}
                >
                    <div className={`menu-item-icon-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`}>
                        <EmojiEventsRoundedIcon 
                            type="navItem"
                            fontSize="large" 
                            color={this.state.hoveredItem === 'leaderboard' ? 'secondary' : (window.location.pathname.startsWith('/leaderboard') ? 'action' :'primary')}
                        />
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.hoveredItem === 'leaderboard' ? 'secondary' : (window.location.pathname.startsWith('/leaderboard') ? 'action' :'')}`}>LEADERBOARD</p>
                        </div>   
                    :
                        ''
                    }
                </div>
                <div 
                    className={`menu-item-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} 
                    id="lobby" 
                    onMouseEnter={this.hoverItem} 
                    onMouseLeave={this.unhoverItems}
                    onClick={() => {this.handleNavItemClick('/lobby')}}
                >
                    <div className={`menu-item-icon-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`}>
                        <HomeRoundedIcon 
                            type="navItem"
                            fontSize="large" 
                            color={this.state.loggedIn ? (this.state.hoveredItem === 'lobby' ? 'secondary' : (window.location.pathname.startsWith('/lobby') ? 'action' : 'primary')) : 'disabled'}
                        />
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.loggedIn ? (this.state.hoveredItem === 'lobby' ? 'secondary' : (window.location.pathname.startsWith('/lobby') ? 'action' :'')) : 'disabled'}`}>LOBBY</p>
                        </div>   
                    :
                        ''
                    }
                </div>
                <div 
                    className={`menu-item-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} 
                    id="about" onMouseEnter={this.hoverItem} 
                    onMouseLeave={this.unhoverItems}
                    onClick={() => {this.handleNavItemClick('/about')}}
                >
                    <div className={`menu-item-icon-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`}>
                        <InfoRoundedIcon 
                            type="navItem"
                            fontSize="large" 
                            color={this.state.hoveredItem === 'about' ? 'secondary' : (window.location.pathname.startsWith('/about') ? 'action' :'primary')}
                        />
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container"><p className={`menu-item-title ${this.state.hoveredItem === 'about' ? 'secondary' : (window.location.pathname.startsWith('/about') ? 'action' :'')}`}>ABOUT</p></div>   
                    :
                        ''
                    }
                </div>
                <div 
                    className={`menu-item-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} 
                    id={this.state.loggedIn ? "signout" : "signin"} 
                    onMouseEnter={this.hoverItem} 
                    onMouseLeave={this.unhoverItems}
                    onClick={this.signOut}
                >
                    <div className={`menu-item-icon-container ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`}>
                        {this.state.loggedIn ?
                            <LogoutRoundedIcon type="navItem" fontSize="large" color={this.state.hoveredItem === 'signout' ? 'secondary' : 'primary'}/>
                        :
                            <LoginRoundedIcon type="navItem" fontSize="large" color={this.state.hoveredItem === 'signin' ? 'secondary' : (window.location.pathname === '/login' ? 'action' :'primary')}/>
                        }
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.hoveredItem === (this.state.loggedIn ? "signout" : "signin") ? 'secondary' : (window.location.pathname === '/login' ? 'action' :'')}`}>
                                {this.state.loggedIn ? "SIGN OUT" : "SIGN IN"}
                            </p>
                        </div>   
                    :
                        ''
                    }
                </div>
            </div>
        )
    }
}