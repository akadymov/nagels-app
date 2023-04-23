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
import defaultTheme from '../../themes/default';
import { getText } from '../user-text';
import NagelsModal from '../nagels-modal';


export default class NavMenu extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            menuExpanded: false,
            hoveredItem: null,
            loggedIn: false,
            modalOpen: false,
            modalControls: [],
            modalText: ''
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
        if(!this.props.isMobile && this.props.isDesktop){
            this.setState({ menuExpanded: true})
        }
    }

    wrapMenu = () => {
        if(!this.props.isMobile && this.props.isDesktop){
            this.setState({ menuExpanded: false})
        }
    }

    hoverItem = (e) => {
        if(!this.props.isMobile && this.props.isDesktop){
            this.setState({ hoveredItem: e.target.id })
        }
    }

    unhoverItems = () => {
        if(!this.props.isMobile && this.props.isDesktop){
            this.setState({ hoveredItem: null })
        }
    }

    handleNavItemClick = (pathname) => {
        window.location.assign(pathname)
    }

    signOut = () => {
        var newModalControls = [
            {
                id: "confirm_sign_out",
                type: "button",
                variant: "text",
                variant: "contained",
                color: 'error',
                text: getText('sign_out'),
                width: '140px',
                disabled: false,
                onSubmit: this.confirmSignOut
            },
            {
                id: "cancel_sign_in",
                type: "button",
                variant: "contained",
                text: getText('cancel'),
                width: '140px',
                disabled: false,
                onSubmit: this.closeModal
            }
        ]
        this.setState({
            modalControls: newModalControls,
            modalOpen: true,
            modalText: getText('are_you_sure'),
            modalCanClose: true
        })
    }

    confirmSignOut = () => {
        this.Cookies.remove('idToken', {path:'/'})
        this.Cookies.remove('username');
        this.Cookies.remove('colorScheme');
        this.Cookies.remove('deckType');
        this.Cookies.remove('preferredLang');
        window.location.assign('/signin')
    }

    closeModal = () => {
        this.setState({
            modalControls: [],
            modalOpen: false,
            modalText: ''
        })
    }

    componentDidMount() {
        this.CheckIfAlreadyLoggedIn()
    }

    render() {
        
        const ScreenSizeClassPostfix = this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")
        const ScreenOrientationClassPostfix = this.props.isPortrait ? "portrait" : "landscape"

        return(
            <div className={`nav-menu ${ ScreenSizeClassPostfix} ${ ScreenOrientationClassPostfix }`} onMouseOver={this.expandMenu} onMouseLeave={this.wrapMenu}>
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
                                outline={this.state.hoveredItem === 'profile' ? '2px solid ' + (this.Cookies.get('colorScheme') === 'piggy' ? defaultTheme.palette.primary.piggy : defaultTheme.palette.primary.main) : (window.location.pathname.startsWith('/profile') ? '2px solid ' + (this.Cookies.get('colorScheme') === 'piggy' ? defaultTheme.palette.primary.piggy : defaultTheme.palette.primary.main) : 'none')}
                            ></NagelsAvatar>
                        </div>
                        {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.hoveredItem === 'profile' ? 'action' : (window.location.pathname.startsWith('/profile') ? 'action' :'')}`}>{getText('profile')}</p>
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
                                color={this.state.hoveredItem === 'feedback' ? 'action' : (window.location.pathname.startsWith('/feedback') ? 'action' :'primary')}
                            />
                        </div>
                        {this.state.menuExpanded ? 
                            <div className="menu-item-title-container">
                                <p className={`menu-item-title ${this.state.hoveredItem === 'feedback' ? 'action' : (window.location.pathname.startsWith('/feedback') ? 'action' :'')}`}>{getText('feedback')}</p>
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
                            color={this.state.hoveredItem === 'leaderboard' ? 'action' : (window.location.pathname.startsWith('/leaderboard') ? 'action' :'primary')}
                        />
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.hoveredItem === 'leaderboard' ? 'action' : (window.location.pathname.startsWith('/leaderboard') ? 'action' :'')}`}>{getText('leaderboard')}</p>
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
                            color={this.state.loggedIn ? (this.state.hoveredItem === 'lobby' ? 'action' : (window.location.pathname.startsWith('/lobby') ? 'action' : 'primary')) : 'disabled'}
                        />
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.loggedIn ? (this.state.hoveredItem === 'lobby' ? 'action' : (window.location.pathname.startsWith('/lobby') ? 'action' :'')) : 'disabled'}`}>{getText('lobby')}</p>
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
                            color={this.state.hoveredItem === 'about' ? 'action' : (window.location.pathname.startsWith('/about') ? 'action' :'primary')}
                        />
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container"><p className={`menu-item-title ${this.state.hoveredItem === 'about' ? 'action' : (window.location.pathname.startsWith('/about') ? 'action' :'')}`}>{getText('about')}</p></div>   
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
                            <LogoutRoundedIcon type="navItem" fontSize="large" color={this.state.hoveredItem === 'signout' ? 'action' : 'primary'}/>
                        :
                            <LoginRoundedIcon type="navItem" fontSize="large" color={this.state.hoveredItem === 'signin' ? 'action' : (window.location.pathname === '/signin' ? 'action' :'primary')}/>
                        }
                    </div>
                    {this.state.menuExpanded ? 
                        <div className="menu-item-title-container">
                            <p className={`menu-item-title ${this.state.hoveredItem === (this.state.loggedIn ? "signout" : "signin") ? 'action' : (window.location.pathname === '/signin' ? 'action' :'')}`}>
                                {this.state.loggedIn ? getText('sign_out') : getText('sign_in')}
                            </p>
                        </div>   
                    :
                        ''
                    }
                </div>
                <NagelsModal
                    open={this.state.modalOpen}
                    text={this.state.modalText}
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.modalControls}
                    closeModal={this.closeModal}
                    modalCanClose={true}
                ></NagelsModal>
            </div>
        )
    }
}