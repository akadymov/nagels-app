import React from 'react';

import './forgot-password.css'

//MUI components

//Local components
import FormContainer from '../../components/form-container';

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';


export default class ForgotPassword extends React.Component{

    constructor(props){
        super(props);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.state = {
            title: 'Recover password',
            username: null,
            email: null,
            recoverySent: false,
            errors: {},
            textFieldsList: [
                {
                    id:"username", 
                    label:"username", 
                    variant:"outlined", 
                    type: "text", 
                    required: true,
                    autoComplete: 'on',
                    width: "220px",
                    onChange: this.handleUsernameChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                },
                {
                    id:"email", 
                    label:"email", 
                    variant:"outlined", 
                    type: "text", 
                    required: true,
                    autoComplete: 'on',
                    width: "220px",
                    onChange: this.handleEmailChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                }
            ],
            submitButtonList: [
                {
                    id:"recover_button", 
                    type:"contained", 
                    text:"Submit", 
                    width: "220px",
                    disabled: true,
                    onSubmit: this.recoverPassword
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

    recoverPassword = () => {
        this.NagelsApi.sendPasswordRecovery(this.state.username, this.state.email)
        .then((body)=>{
            var newSubmitButtonList = []
            if(body.errors){
                var newTextFieldsList = this.state.textFieldsList
                newSubmitButtonList = this.state.submitButtonList
                body.errors.forEach(error=>{
                    switch(error.field) {
                        case 'username':
                            newTextFieldsList[0].errorMessage=error.message
                        break
                        case 'email':
                            newTextFieldsList[1].errorMessage=error.message
                        break
                        default:
                            console.log('Unhandled error field in recover password method!')
                    }
                    newSubmitButtonList[0].disabled = true
                    
                })
                this.setState({
                    textFieldsList: newTextFieldsList,
                    submitButtonList: newSubmitButtonList
                })
            } else {
                newSubmitButtonList = this.state.submitButtonList
                newSubmitButtonList[0].disabled = true
                this.setState({
                    submitButtonList: newSubmitButtonList,
                    username: null,
                    email: null,
                    recoverySent: true
                })
            }
        })
    }

    handleEmailChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var newSubmitButtonList = this.state.submitButtonList
        newTextFieldsList[0].errorMessage=''
        newTextFieldsList[1].errorMessage=''
        newSubmitButtonList[0].disabled = false
        this.setState({ 
            email: e.target.value,
            textFieldsList: newTextFieldsList,
            recoverySent: false
        })
    }

    handleUsernameChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var newSubmitButtonList = this.state.submitButtonList
        newTextFieldsList[0].errorMessage=''
        newTextFieldsList[1].errorMessage=''
        newSubmitButtonList[0].disabled = false
        this.setState({ 
            username: e.target.value,
            textFieldsList: newTextFieldsList,
            recoverySent: false
        })
    }
    
    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          this.recoverPassword();
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
                >
                </FormContainer>
                <div 
                    className={`recovery-sent-confirmation-message ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                    style={{ display: this.state.recoverySent ? 'block' : 'none' }}
                >
                    Password recovery letter sent: check your mail inbox
                </div>
            </div>
        )
    }
}