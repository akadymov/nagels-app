import React from 'react';
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';
import FormContainer from '../../components/form-container';

export default class Registration extends React.Component{

    constructor(props) {
        super(props);
        this.SendRegRequest = this.SendRegRequest.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleRepeatPasswordChange = this.handleRepeatPasswordChange.bind(this);
        this.handleErrorResponse = this.handleErrorResponse.bind(this);
        this.clearErrorMessage = this.clearErrorMessage.bind(this);
        this.state = {
            title: 'Register new player',
            email:'',
            password:'',
            repeatPassword:'',
            username:'',
            preferredLang: '',
            textFieldsList: [
                {
                    id:"username", 
                    label:"username", 
                    type: "text", 
                    width: "300px",
                    placeholder: "Username      ", 
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
                    label:"password", 
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
                    label:"repeat password", 
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
                    text:"Submit", 
                    onSubmit: this.SendRegRequest
                },
                {
                    id:"login_button",
                    width: "300px",
                    type:"outlined",
                    size: "small",
                    text:"Login", 
                    onSubmit: () => window.location.assign('/signin')
                }
            ],
            languages: [
                {type:"radio", id:"preferred-lang-en", name:"preferred-lang", lang:"en", errorMessage:""},
                {type:"radio", id:"preferred-lang-ru", name:"preferred-lang", lang:"ru", errorMessage:""}
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
                this.Cookies.set('username',this.state.username, { path: '/' , expires: expiresIn})
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
                onSubmit={this.SendLoginRequest}
            >
            </FormContainer>
        )
    }
}