import React from 'react';
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';
import FormContainer from '../../components/form-container';
import { getText } from '../../components/user-text';

export default class Registration extends React.Component{

    constructor(props) {
        super(props);
        this.SendRegRequest = this.SendRegRequest.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleRepeatPasswordChange = this.handleRepeatPasswordChange.bind(this);
        this.handleLangChange = this.handleLangChange.bind(this);
        this.handleErrorResponse = this.handleErrorResponse.bind(this);
        this.clearErrorMessage = this.clearErrorMessage.bind(this);
        this.state = {
            title: getText('register_new_player'),
            email:'',
            password:'',
            repeatPassword:'',
            username:'',
            preferredLang: '',
            textFieldsList: [
                {
                    id:"username", 
                    label: getText('username'), 
                    type: "text", 
                    width: "300px",
                    placeholder: getText('username_placeholder'), 
                    onChange: this.handleUsernameChange, 
                    errorMessage: "", 
                    value: "", 
                    required: true,
                    onClick: this.clearErrorMessage
                },
                {
                    id:"email", 
                    label:"email", 
                    type: "text", 
                    width: "300px",
                    onChange: this.handleEmailChange, 
                    errorMessage: "", 
                    value: "", 
                    required: true,
                    onClick: this.clearErrorMessage
                },
                {
                    id:"password", 
                    label: getText('password'), 
                    type: "password", 
                    width: "300px",
                    onChange: this.handlePasswordChange, 
                    errorMessage: "", 
                    value: "", 
                    required: true,
                    onClick: this.clearErrorMessage
                },
                {
                    id:"repeatPassword",
                    label: getText('repeat_password'), 
                    type: "password", 
                    width: "300px",
                    onChange: this.handleRepeatPasswordChange, 
                    errorMessage: "", 
                    value: "", 
                    required: true,
                    onClick: this.clearErrorMessage
                }
            ],
            submitButtonList: [
                {
                    id:"register_button", 
                    width: "300px",
                    type:"contained", 
                    text: getText('submit'), 
                    onSubmit: this.SendRegRequest
                },
                {
                    id:"login_button",
                    width: "300px",
                    type:"outlined",
                    size: "small",
                    text: getText('log_in'), 
                    onSubmit: () => window.location.assign('/signin')
                }
            ],
            selectList: [
                {
                    id: "preferred_lang",
                    label: getText('language'),
                    defaultValue: 'en',
                    width: "300px",
                    onChange: this.handleLangChange,
                    values: [
                        {
                            value: 'en',
                            label: getText('english')
                        },
                        {
                            value: 'ru',
                            label: getText('russian')
                        }
                    ]
                }
            ]
      };
    }

    NagelsApi = new NagelsApi();
    Cookies = new Cookies();
    CheckIfAlreadyLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(idToken) {
            window.location.assign('/lobby/');
        }
    }

    SendRegRequest = () => {
        this.NagelsApi.registerUser(
            this.state.email, 
            this.state.username, 
            this.state.password, 
            this.state.repeatPassword,
            this.state.preferredLang
        )
        .then((body) => {
            if(body.errors) {
                this.handleErrorResponse(body)
            } else {
                this.SendLoginRequest()
            }
        });
    };

    SendLoginRequest = () => {
        this.NagelsApi.login(
            this.state.username, 
            this.state.password
        )
        .then((body) => {
            if(body.errors) {
                window.location.assign('/registration-succeed/' + this.state.username);
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

    handleUsernameChange(e) {
        this.setState({username: e.target.value})
    };

    handlePasswordChange(e) {
        this.setState({password: e.target.value})
    };

    handleRepeatPasswordChange(e) {
        this.setState({repeatPassword: e.target.value})
    };

    handleEmailChange(e) {
        this.setState({email: e.target.value})
    };

    handleLangChange=(e) => {
        this.setState({preferredLang: e.target.value})
    };

    clearErrorMessage=(e) => {
        let textFieldsListUpdated = [...this.state.textFieldsList]
        var elementsIndex = this.state.textFieldsList.findIndex(element => element.id === e.target.id )
        textFieldsListUpdated[elementsIndex] = {...textFieldsListUpdated[elementsIndex], errorMessage: ""}
        this.setState({textFieldsList: textFieldsListUpdated});
    }

    handleErrorResponse=(body) => {
        let textFieldsListUpdated = [...this.state.textFieldsList]
        textFieldsListUpdated.forEach(f => {
            f.errorMessage="";
        })
        body.errors.forEach(er => {
            var elementsIndex = this.state.textFieldsList.findIndex(element => element.id === er.field )
            textFieldsListUpdated[elementsIndex] = {...textFieldsListUpdated[elementsIndex], errorMessage: er.message}
        });
        this.setState({textFieldsList: textFieldsListUpdated});
    }

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          this.SendRegRequest();
        }
      };

    render() {
      
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
                selectList={this.state.selectList}
                onSubmit={this.SendLoginRequest}
            >
            </FormContainer>
        )
    }
}