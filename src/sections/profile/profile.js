import React from 'react';

import './profile.css'

//Local services
import NigelsApi from '../../services/nigels-api-service';
import Cookies from 'universal-cookie';
import NigelsModal from '../../components/nigels-modal';

//Local components
import FormButton from '../../components/form-button';
import defaultTheme from '../../themes/default';
import NigelsAvatar from '../../components/nigels-avatar'

//MUI components
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/material/styles';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';


export default class Profile extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            picControlsVisible: false,
            userData: {
                aboutMe: null,
                email: null,
                lastSeen: null,
                preferredLang: null,
                registered: null,
                username: null,
                connectedRoomId: null,
                stats: []
            },
            aboutMeSymbols: 0,
            canUpdate: false,
            currentPassword: null,
            newPassword: null,
            repeatPassword: null,
            canUpdatePassword: false,
            passwordUpdated: false,
            errors:{},
            avatarFile: null,
            modalControls: [
                {
                    id: "select_avatar_input",
                    type: "input-file",
                    accept: "image/png",
                    onChange: this.handleFileChange
                }
            ],
            modalOpen: false
        }
    }

    NigelsApi = new NigelsApi();
    Cookies = new Cookies();

    CheckIfLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(!idToken) {
            window.location.assign('/signin/');
        }
    };

    backToGame = () => {
        this.NigelsApi.getUser(this.Cookies.get('username'))
        .then((body)=>{
            if(body.connectedRoomId){
                window.location.assign('/room/' + body.connectedRoomId)
            } else {
                window.location.assign('/lobby/')
            }
        })
    }

    getUserProfile = () => {
        this.NigelsApi.getUser(this.props.match.params.username || this.Cookies.get('username'))
        .then((body)=>{
            if(body.errors) {
                window.location.assign('/lobby/')
            } else {
                this.setState({ 
                    userData: body, 
                    canUpdate: false, 
                    canUpdatePassword: false, 
                    aboutMeSymbols: body.aboutMe ? body.aboutMe.length : 0
                })
            }
        })
    }

    updateProfile = () => {
        this.NigelsApi.updateUser(this.props.match.params.username || this.Cookies.get('username'), this.Cookies.get('idToken'), this.state.userData.email, this.state.userData.aboutMe || '')
        .then((body)=>{
            if(body.errors) {
                var newErrors = this.state.errors
                var fieldName = ''
                var helperMessage = ''
                body.errors.forEach(error => {
                    fieldName = error.field
                    helperMessage = error.message
                    newErrors[fieldName] = helperMessage
                })
                this.setState({ 
                    errors: newErrors, 
                    canUpdate: false,
                    passwordUpdated: false 
                })
            } else {
                this.setState({ 
                    userData: body, 
                    canUpdate: false, 
                    passwordUpdated: false,
                    errors: {}
                })
            }
        })
    }

    updatePassword = () => {
        if(this.state.newPassword !== this.state.repeatPassword){
            var newErrors = {
                repeatPassword: 'password confirmation does not match'
            }
            this.setState({ errors: newErrors })
        } else {
            this.NigelsApi.updatePassword(this.Cookies.get('idToken'), this.state.currentPassword, this.state.newPassword, this.state.repeatPassword)
            .then((body)=>{
                if(body.errors) {
                    var newErrors = this.state.errors
                    var fieldName = ''
                    var helperMessage = ''
                    body.errors.forEach(error => {
                        fieldName = error.field
                        helperMessage = error.message
                        newErrors[fieldName] = helperMessage
                    })
                    this.setState({ 
                        errors: newErrors, 
                        canUpdate: false, 
                        passwordUpdated: false 
                    })
                } else {
                    this.setState({ 
                        currentPassword: null, 
                        newPassword: null, 
                        repeatPassword: null, 
                        passwordUpdated: true,
                        canUpdatePassword: false,
                        errors: {}
                    })
                }
            })
        }
    }

    activatePicControls = () => {
        if(this.props.isDesktop){
            this.setState({ picControlsVisible: true })
        }
    }

    deActivatePicControls = () => {
        if(this.props.isDesktop){
            this.setState({ picControlsVisible: false })
        }
    }

    handleEmailChange = (e) => {
        var newUserData = this.state.userData
        newUserData.email = e.target.value
        var newErrors = this.state.errors
        newErrors.email = null
        this.setState({ 
            userData: newUserData, 
            canUpdate: true,
            passwordUpdated: false,
            errors: newErrors
        })
    }

    handleAboutMeChange = (e) => {
        var newUserData = this.state.userData
        newUserData.aboutMe = e.target.value
        var newErrors = this.state.errors
        newErrors.aboutMe = e.target.value.length > 500 ? 'about me (' + this.state.aboutMeSymbols + '/500)' : null
        this.setState({ 
            userData: newUserData, 
            canUpdate: newErrors.aboutMe == null, 
            aboutMeSymbols: e.target.value.length,
            passwordUpdated: false ,
            errors: newErrors
        })
    }

    handlecurrentPasswordChange = (e) => {
        var newErrors = this.state.errors
        newErrors.currentPassword = null
        this.setState({ 
            currentPassword: e.target.value, 
            canUpdatePassword: true ,
            passwordUpdated: false,
            errors: newErrors
        })
    }

    handleNewPasswordChange = (e) => {
        var newErrors = this.state.errors
        newErrors.newPassword = null
        this.setState({ 
            newPassword: e.target.value, 
            canUpdatePassword: true ,
            passwordUpdated: false,
            errors: newErrors
        })
    }

    handleRepeatNewPasswordChange = (e) => {
        var newErrors = this.state.errors
        newErrors.repeatPassword = null
        this.setState({ 
            repeatPassword: e.target.value, 
            canUpdatePassword: true ,
            passwordUpdated: false,
            errors: newErrors
        })
    }

    handleFileChange = (e) => {
        var newModalControls = this.state.modalControls
        if (!e.target.files[0]) {
            newModalControls = [
                {
                    id: "select_avatar_input",
                    type: "input-file",
                    accept: "image/png",
                    onChange: this.handleFileChange,
                }
            ];
        } else {
            if (e.target.files[0].type !== 'image/png'){
                newModalControls = [
                    {
                        id: "select_avatar_input",
                        type: "input-file",
                        accept: "image/png",
                        onChange: this.handleFileChange,
                    },
                    {
                        id: "file_type_error",
                        type: "text",
                        style: 'error',
                        text: "Only PNG file types supported"
                    }
                ]
            } else {
                if (e.target.files[0].size > 200000){
                    newModalControls = [
                        {
                            id: "select_avatar_input",
                            type: "input-file",
                            accept: "image/png",
                            onChange: this.handleFileChange,
                        },
                        {
                            id: "file_type_error",
                            type: "text",
                            style: 'error',
                            text: "Max file size is 200 KB"
                        }
                    ]
                } else {
                    newModalControls = [
                        {
                            id: "select_avatar_input",
                            type: "input-file",
                            accept: "image/png",
                            onChange: this.handleFileChange,
                        },
                        {
                            id: "upload_avatar",
                            type: "button",
                            variant: "contained",
                            text: "Upload",
                            size: "small",
                            width: '140px',
                            onSubmit: this.uploadFile
                        }
                    ]
                }
            }
        }
        
        this.setState({ 
            avatarFile: e.target.files[0],
            modalControls: newModalControls
         });
    }

    uploadFile = async (e) => { // TODO upload avatar method is not working (problem may exist in FE, BE or both)
        // alert('Work in progress: upload tool is in development')
        this.NigelsApi.uploadProfilePic(this.Cookies.get('idToken'), this.props.match.params.username || this.Cookies.get('username'), this.state.avatarFile)
        .then((body) => {
            if(body.errors) {
                console.log(body.errors)
            } else {
                this.getUserProfile()
            }
        })
    }

    componentDidMount = () => {
        this.getUserProfile()
        this.CheckIfLoggedIn();
    }

    render () {
        return(
            <div className={`profile-form-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <div className={`profile-picture-controls-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    <div 
                        className={`profile-picture-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                        onMouseEnter={this.activatePicControls}
                        onMouseLeave={this.deActivatePicControls}
                        onClick={() => {this.setState({modalOpen: true})}} // FIXME
                    >
                        <NigelsAvatar
                            username={this.props.match.params.username || this.Cookies.get('username')}
                            width={this.props.isMobile ? 120 : 200}
                            height={this.props.isMobile ? 120 : 200}
                        ></NigelsAvatar>
                        <div 
                            className={`profile-picture-update-controls ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                            style={{ display: this.state.picControlsVisible ? 'block' : 'none' }}
                        >
                            <div className="avatar-upload-button-container">
                                <FormButton
                                    id='avatar_update_button'
                                    key='avatar_update_button'
                                    onClick={() => {this.setState({modalOpen: true})}} // FIXME
                                    variant='outlined'
                                    text='Upload new'
                                    size={this.props.isMobile ? 'small' : 'medium'}
                                    color='shadowed'
                                ></FormButton>
                            </div>
                        </div>
                        <div className={`profile-username-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            {this.props.match.params.username || this.Cookies.get('username')}
                        </div>
                </div>
                </div>
                <div className={`profile-text-data-controls-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    <ThemeProvider theme={defaultTheme}>
                        <div className={`profile-text-field-control-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <TextField
                                id='email'
                                disabled={this.state.userData.username !== this.Cookies.get('username')}
                                size='small'
                                helperText={this.state.errors.email || 'email'}
                                error={this.state.errors.email}
                                value={this.state.userData.email}
                                sx={{width: this.props.isMobile ? (this.props.isPortrait ? '90vw' : '55vw') : '30vw'}}
                                onChange={this.handleEmailChange}
                            ></TextField>
                        </div>
                        {!this.props.isMobile ? 
                            <div className={`profile-text-field-control-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <TextField
                                    id='registered'
                                    disabled
                                    variant='filled'
                                    size='small'
                                    helperText='registered'
                                    value={this.state.userData.registered}
                                    sx={{width: this.props.isMobile ? (this.props.isPortrait ? '90vw' : '55vw') : '30vw'}}
                                ></TextField>
                            </div>
                        :
                            ''
                        }
                        <div className={`profile-text-field-control-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <TextField
                                id='about'
                                disabled={this.state.userData.username !== this.Cookies.get('username')}
                                helperText={this.state.errors.aboutMe || 'about me (' + this.state.aboutMeSymbols + '/500)'}
                                error={this.state.errors.aboutMe}
                                value={this.state.userData.aboutMe}
                                sx={{width: this.props.isMobile ? (this.props.isPortrait ? '90vw' : '55vw') : '49vw'}}
                                onChange={this.handleAboutMeChange}
                                multiline
                                rows={2}
                            ></TextField>
                        </div>
                        {this.state.userData.username === this.Cookies.get('username')?
                            <div className={`profile-control-submit-button-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <FormButton
                                    id='profile_update_button'
                                    key='profile_update_button'
                                    disabled={!this.state.canUpdate}
                                    onSubmit={this.updateProfile}
                                    variant='contained'
                                    text='Update profile'
                                    width='180px'
                                ></FormButton>
                            </div>
                        :
                            ''
                        }
                        {this.state.userData.username === this.Cookies.get('username')?
                            <div className={`profile-text-field-control-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <TextField
                                    id='current_password'
                                    helperText={this.state.errors.currentPassword || 'current password'}
                                    error={this.state.errors.currentPassword}
                                    value={this.state.currentPassword}
                                    type='password'
                                    required={true}
                                    size='small'
                                    sx={{width: this.props.isMobile ? (this.props.isPortrait ? '90vw' : '55vw') : '24vw'}}
                                    onChange={this.handlecurrentPasswordChange}
                                ></TextField>
                            </div>
                        :
                            ''
                        }
                        {this.state.userData.username === this.Cookies.get('username')?
                            <div className={`profile-text-field-control-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <TextField
                                    id='new_password'
                                    helperText={this.state.errors.newPassword || 'new password'}
                                    error={this.state.errors.newPassword}
                                    value={this.state.newPassword}
                                    type='password'
                                    required={true}
                                    size='small'
                                    sx={{width: this.props.isMobile ? (this.props.isPortrait ? '90vw' : '55vw') : '24vw'}}
                                    onChange={this.handleNewPasswordChange}
                                ></TextField>
                            </div>
                        :
                            ''
                        }
                        {this.state.userData.username === this.Cookies.get('username')?
                            <div className={`profile-text-field-control-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <TextField
                                    id='confirm_password'
                                    helperText={this.state.errors.repeatPassword || 'repeat password'}
                                    error={this.state.errors.repeatPassword}
                                    value={this.state.repeatPassword}
                                    type='password'
                                    required={true}
                                    size='small'
                                    sx={{width: this.props.isMobile ? (this.props.isPortrait ? '90vw' : '55vw') : '24vw'}}
                                    onChange={this.handleRepeatNewPasswordChange}
                                ></TextField>
                            </div>
                        :
                            ''
                        }
                        {this.state.userData.username === this.Cookies.get('username')?
                            <div className={`profile-control-submit-button-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <FormButton
                                    id='password_update_button'
                                    key='password_update_button'
                                    disabled={!this.state.canUpdatePassword}
                                    onSubmit={this.updatePassword}
                                    variant='contained'
                                    text='Update password'
                                    width='180px'
                                ></FormButton>
                                <div className="password-update-confirmation-message" style={{ display: this.state.passwordUpdated ? 'block' : 'none' }}>Password is saved</div>
                            </div>
                        :
                            ''
                        }
                        <div className={`profile-backtogame-button-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <Tooltip title="Back to game" onClick={this.backToGame}>
                            <IconButton>
                                <KeyboardBackspaceIcon/>
                            </IconButton>
                            </Tooltip>
                        </div>
                    </ThemeProvider>
                </div>
                {this.state.userData.stats ? 
                    <div className={`profile-stats-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <div className={`user-stats line1  ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <div className={`user-stat-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <div className={`user-stat-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{this.state.userData.stats.gamesPlayed}</div>
                                <div className={`user-stat-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Games</div>
                            </div>
                            <div className={`user-stat-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <div className={`user-stat-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{100*this.state.userData.stats.winRatio}</div>
                                <div className={`user-stat-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Won %</div>
                            </div>
                            <div className={`user-stat-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <div className={`user-stat-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{this.state.userData.stats.avgScore}</div>
                                <div className={`user-stat-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Avg Score</div>
                            </div>
                        </div>
                        <div className={`user-stats line2 ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <div className={`user-stat-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <div className={`user-stat-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{this.state.userData.stats.avgBonuses}</div>
                                <div className={`user-stat-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Avg Bonuses</div>
                            </div>
                            <div className={`user-stat-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <div className={`user-stat-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{this.state.userData.stats.avgBetSize}</div>
                                <div className={`user-stat-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Avg Bet</div>
                            </div>
                            <div className={`user-stat-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <div className={`user-stat-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{this.state.userData.stats.totalScore}</div>
                                <div className={`user-stat-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Total Score</div>
                            </div>
                        </div>
                        {this.state.userData.connectedRoomId ? 
                            <div className="connected-room-container">
                                <FormButton
                                    id='go_to_room'
                                    key='go_to_room'
                                    onSubmit={()=>window.location.assign('/room/' + this.state.userData.connectedRoomId)}
                                    variant='outlined'
                                    text={'Connected to room#' + this.state.userData.connectedRoomId}
                                    size='small'
                                    width='190px'
                                ></FormButton>
                            </div>
                        :
                            ''
                        }
                    </div>
                : 
                    ''
                }
                <NigelsModal
                    open={this.state.modalOpen}
                    text="Upload new profile picture"
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.modalControls}
                    modalCanClose={true}
                    closeModal={()=>this.setState({modalOpen: false})}
                ></NigelsModal>
            </div>
        )
    }
}