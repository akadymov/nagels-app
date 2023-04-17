import React from 'react';


//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';
import { getText } from '../../components/user-text';

//Local components
import FormContainer from '../../components/form-container';

export default class About extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            gameInfo: '',
            submitButtonList: [
                {
                    id: 'lobby_or_login',
                    type: 'contained',
                    width: "220px",
                    text: getText('register_new_player'), 
                    onSubmit: () => window.location.assign('/register/')
                },
                {
                    id:"feedback", 
                    type:"outlined", 
                    width: "220px",
                    text:getText('feedback_lower'), 
                    onSubmit: () => window.location.assign('/feedback/')
                }
            ]
        }
    };

    NagelsApi = new NagelsApi();
    Cookies = new Cookies();

    getGameInfo = () => {
        this.NagelsApi.getInfo()
        .then((body) => {
            if(body.errors) {
                this.setState({ gameInfo:getText('get_game_info_error')})
            } else {
                this.setState({gameInfo: body.info})
            }
        });
    }
    
    componentDidMount = () => {
        this.getGameInfo()
        var newSubmitButtonList = this.state.submitButtonList
        if(this.Cookies.get('idToken')) {
            newSubmitButtonList[0].text = getText('go_to_lobby')
            newSubmitButtonList[0].onSubmit = () => window.location.assign('/lobby/')
        }
    };

    render() {
        return(
            <FormContainer 
                isMobile = {this.props.isMobile}
                isDesktop = {this.props.isDesktop}
                isPortrait = {this.props.isPortrait}
                title={getText('about_nagels')}
                htmlMessage={this.state.gameInfo}
                submitButtonList={this.state.submitButtonList}
            >
            </FormContainer>
        )
    };

}