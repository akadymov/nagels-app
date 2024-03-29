import React from 'react';
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';
import FormContainer from '../../components/form-container';
import { getText } from '../../components/user-text';

export default class Login extends React.Component{

    constructor(props) {
        super(props);
        this.SendLoginRequest = this.SendLoginRequest.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleErrorResponse = this.handleErrorResponse.bind(this);
        this.clearErrorMessage = this.clearErrorMessage.bind(this);
        this.CheckIfAlreadyLoggedIn = this.CheckIfAlreadyLoggedIn.bind(this);
        this.state = {
            title: getText('login'),
            username: this.props.match.params.username ? this.props.match.params.username : '',
            password: '',
            textFieldsList: [
                {
                    id:"username", 
                    label: getText('username'), 
                    variant:"outlined", 
                    type: "text", 
                    required: true,
                    autoComplete: 'on',
                    width: "220px",
                    text: this.props.match.params.username ? this.props.match.params.username : '', 
                    //text: '',
                    onChange: this.handleUsernameChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                },
                {
                    id:"password", 
                    label: getText('password'), 
                    variant:"outlined", 
                    type: "password", 
                    required: true,
                    autoComplete: 'on',
                    width: "220px",
                    onChange: this.handlePasswordChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                }
            ],
            submitButtonList: [
                {
                    id:"login_button", 
                    type:"contained", 
                    text: getText('submit'), 
                    width: "220px",
                    onSubmit: this.SendLoginRequest
                },
                {
                    id:"register_button", 
                    type:"outlined", 
                    text: getText('register_new_player'), 
                    width: "220px",
                    size: "small",
                    onSubmit: () => window.location.assign('/register/')
                },
                {
                    id:"forgot_button", 
                    type:"outlined", 
                    text: getText('forgot_password'), 
                    width: "220px",
                    size: "small",
                    onSubmit: () => window.location.assign('/forgot-password/')
                }
            ]
        }
    };
    
    NagelsApi = new NagelsApi();
    Cookies = new Cookies();
    CheckIfAlreadyLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(idToken) {
            window.location.assign('/lobby/');
        }
    }

    SignOut = () => {
        this.Cookies.remove('idToken');
        this.Cookies.remove('username');
        this.Cookies.remove('colorScheme');
        this.Cookies.remove('deckType');
        this.Cookies.remove('preferredLang');
        window.location.assign('/signin');
    }

    SendLoginRequest = () => {
        this.NagelsApi.login(
            this.state.username, 
            this.state.password
        )
        .then((body) => {
            if(body.errors) {
                this.handleErrorResponse(body)
            } else {
                var currentDate = new Date(); 
                var expiresIn = new Date(currentDate.getTime() + body.expiresIn * 1000)
                this.Cookies.set('idToken', body.token, { path: '/' , expires: expiresIn})
                this.Cookies.set('username',body.username, { path: '/' , expires: expiresIn})
                this.Cookies.set('colorScheme',body.colorScheme, { path: '/' , expires: expiresIn})
                this.Cookies.set('deckType',body.deckType, { path: '/' , expires: expiresIn})
                this.Cookies.set('preferredLang', body.preferredLang, { path: '/' , expires: expiresIn})
                //var expiresInEternal = new Date(currentDate.getTime + 999999999)
                //this.Cookies.set('onboardingNavMenu', 0, { path: '/' , expires: expiresIn})
                if(!this.Cookies.get('onboardingLobby')){
                    this.Cookies.set('onboardingLobby', 0, { path: '/' , expires: expiresIn})
                }
                if(!this.Cookies.get('onboardingRoom')){
                    this.Cookies.set('onboardingRoom', 0, { path: '/' , expires: expiresIn})
                }
                if(!this.Cookies.get('onboardingGame')){
                    this.Cookies.set('onboardingGame', 0, { path: '/' , expires: expiresIn})
                }
                if(!this.Cookies.get('onboardingRating')){
                    this.Cookies.set('onboardingRating', 0, { path: '/' , expires: expiresIn})
                }
                if(!this.Cookies.get('onboardingProfile')){
                    this.Cookies.set('onboardingProfile', 0, { path: '/' , expires: expiresIn})
                }
                if(body.connectedRoomId) {
                    window.location.assign('/room/' + body.connectedRoomId)
                } else {
                    window.location.assign('/lobby/');
                }
            }
        });
    };

    handleUsernameChange=(e) => {
        this.setState({username: e.target.value})
    };

    handlePasswordChange=(e) => {
        this.setState({password: e.target.value})
    };
    
    handleErrorResponse(body) {
        let textFieldsListUpdated = [...this.state.textFieldsList]
        textFieldsListUpdated.forEach(f => {
            f.errorMessage="";
        })
        body.errors.forEach(er => {
            var elementsIndex = this.state.textFieldsList.findIndex(element => element.id === er.field )
            textFieldsListUpdated[elementsIndex] = {...textFieldsListUpdated[elementsIndex], errorMessage: er.message}
        });
        this.setState({textFieldsList: textFieldsListUpdated});
    };

    clearErrorMessage=(e) => {
        let textFieldsListUpdated = [...this.state.textFieldsList]
        var elementsIndex = this.state.textFieldsList.findIndex(element => element.id === e.target.id )
        textFieldsListUpdated[elementsIndex] = {...textFieldsListUpdated[elementsIndex], errorMessage: ""}
        this.setState({textFieldsList: textFieldsListUpdated});
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          this.SendLoginRequest();
        }
      };

    render() {
      
        if(window.location.pathname === '/signout') {
            this.SignOut();
        }
      
        this.CheckIfAlreadyLoggedIn();

        return (
            <FormContainer 
                isMobile = {this.props.isMobile}
                isDesktop = {this.props.isDesktop}
                isPortrait = {this.props.isPortrait}
                title={this.state.title}
                onKeyPress={this.handleKeyPress}
                textFieldsList={this.state.textFieldsList}
                submitButtonList={this.state.submitButtonList}
                onSubmit={this.SendLoginRequest}
            >
            </FormContainer>
        )
    }

}