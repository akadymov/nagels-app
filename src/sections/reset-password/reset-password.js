import React from 'react';

import './reset-password.css'

//MUI components

//Local components
import FormContainer from '../../components/form-container';
import { getText } from '../../components/user-text';

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';


export default class ResetPassword extends React.Component{

    constructor(props){
        super(props);
        this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this);
        this.handleRepeatPasswordChange = this.handleRepeatPasswordChange.bind(this);
        this.state = {
            title: getText('reset_password'),
            newPassword: null,
            repeatPassword: null,
            passwordUpdated: false,
            formMessage: null,
            errors: {},
            textFieldsList: [
                {
                    id:"new_password", 
                    label: getText('new_password'), 
                    variant:"outlined", 
                    type: "password", 
                    required: true,
                    autoComplete: 'on',
                    width: "220px",
                    onChange: this.handleNewPasswordChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                },
                {
                    id:"repeat_password", 
                    label: getText('repeat_password'), 
                    variant:"outlined", 
                    type: "password", 
                    required: true,
                    autoComplete: 'on',
                    width: "220px",
                    onChange: this.handleRepeatPasswordChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                }
            ],
            submitButtonList: [
                {
                    id:"reset_password_button", 
                    type:"contained", 
                    text: getText('submit'), 
                    width: "220px",
                    disabled: true,
                    onSubmit: this.resetPassword
                },
                {
                    id:"login_button", 
                    type:"contained", 
                    text: getText('login'), 
                    width: "220px",
                    disabled: false,
                    hidden: true,
                    onSubmit: ()=>window.location.assign('/signin')
                }
            ]
        }
    }

    NagelsApi = new NagelsApi();
    Cookies = new Cookies();



    CheckIfAlreadyLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(idToken) {
            window.location.assign('/lobby/');
        }
    }

    resetPassword = () => {
        this.NagelsApi.resetPassword(this.props.match.params.resetPasswordToken, this.state.newPassword, this.state.repeatPassword)
        .then((body)=>{
            var newSubmitButtonList = []
            if(body.errors){
                var newTextFieldsList = this.state.textFieldsList
                newSubmitButtonList = this.state.submitButtonList
                body.errors.forEach(error=>{
                    switch(error.field) {
                        case 'newPassword':
                            newTextFieldsList[0].errorMessage=error.message
                        break
                        case 'repeatPassword':
                            newTextFieldsList[1].errorMessage=error.message
                        break
                        default:
                            console.log('Unhandled error field in reset password method!')
                    }
                    newSubmitButtonList[0].disabled = true
                    
                })
                this.setState({
                    textFieldsList: newTextFieldsList,
                    submitButtonList: newSubmitButtonList
                })
            } else {
                var password = this.state.newPassword
                newSubmitButtonList = this.state.submitButtonList
                newSubmitButtonList[0].disabled = true
                newSubmitButtonList[1].hidden = false
                this.setState({
                    submitButtonList: newSubmitButtonList,
                    newPassword: null,
                    repeatPassword: null,
                    passwordUpdated: true,
                    formMessage: getText('password_updated')
                })
                setTimeout(this.SendLoginRequest(body.username, password), 3000)
            }
        })
    }

    SendLoginRequest = (username, password) => {
        this.NagelsApi.login(
            username, 
            password
        )
        .then((body) => {
            if(body.errors) {
                window.location.assign('/signin/' + username);
            } else {
                var currentDate = new Date(); 
                var expiresIn = new Date(currentDate.getTime() + body.expiresIn * 1000)
                this.Cookies.set('idToken', body.token, { path: '/' , expires: expiresIn})
                this.Cookies.set('username',body.username, { path: '/' , expires: expiresIn})
                this.Cookies.set('colorScheme',body.colorScheme, { path: '/' , expires: expiresIn})
                this.Cookies.set('deckType',body.deckType, { path: '/' , expires: expiresIn})
                this.Cookies.set('preferredLang', body.preferredLang, { path: '/' , expires: expiresIn})
                window.location.assign('/lobby/');
            }
        });
    };

    handleNewPasswordChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var newSubmitButtonList = this.state.submitButtonList
        newTextFieldsList[0].errorMessage=''
        newTextFieldsList[1].errorMessage=''
        newSubmitButtonList[0].disabled = false
        this.setState({ 
            newPassword: e.target.value,
            textFieldsList: newTextFieldsList,
            passwordUpdated: false
        })
    }

    handleRepeatPasswordChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var newSubmitButtonList = this.state.submitButtonList
        newTextFieldsList[0].errorMessage=''
        newTextFieldsList[1].errorMessage=''
        newSubmitButtonList[0].disabled = false
        this.setState({ 
            repeatPassword: e.target.value,
            textFieldsList: newTextFieldsList,
            passwordUpdated: false
        })
    }

    clearErrorMessage = () => {
        var newTextFieldsList = this.state.textFieldsList
        newTextFieldsList[0].errorMessage=''
        newTextFieldsList[1].errorMessage=''
        this.setState({
            textFieldsList: newTextFieldsList
        })
    }
    
    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          this.ResetPassword();
        }
    };

    componentDidMount = () => {
        this.CheckIfAlreadyLoggedIn()
    }

    render() {
        return(
            <div style={{height: '50vh'}}>
                <FormContainer 
                    isMobile = {this.props.isMobile}
                    isDesktop = {this.props.isDesktop}
                    isPortrait = {this.props.isPortrait}
                    title={this.state.title}
                    onKeyPress={this.handleKeyPress}
                    textFieldsList={this.state.textFieldsList}
                    submitButtonList={this.state.submitButtonList}
                    onSubmit={this.SendLoginRequest}
                    formMessage={this.state.formMessage}
                >
                </FormContainer>
            </div>
        )
    }
}