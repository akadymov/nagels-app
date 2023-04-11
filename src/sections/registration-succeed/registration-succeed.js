import React from 'react';

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';

//Local components
import FormContainer from '../../components/form-container';

export default class RegistrationSucceed extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            infoMessage: 'User ' + this.props.match.params.username + ' was successfully registered.',
            title: 'Successful registration',
            textFieldsList: [],
            submitButtonList: [
                {
                    id:"login_button",
                    type:"contained", 
                    width:"220px",
                    text:"Log in", 
                    onSubmit: () => window.location.assign('/signin/' + this.props.match.params.username)
                },
                {
                    id:"register_button",
                    type:"outlined",
                    width:"220px",
                    size: "small",
                    text:"Register another user", 
                    onSubmit: () => window.location.assign('/register')
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
                window.location.assign('/registration-succeed/' + this.state.username);
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
            var elementsIndex = this.state.textFieldsList.findIndex(element => element.name === er.field )
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
                infoMessage={this.state.infoMessage}
            >
            </FormContainer>
        )
    }
}