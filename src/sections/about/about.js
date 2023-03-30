import React from 'react';


//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';

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
                    text: "Register new player", 
                    onSubmit: () => window.location.assign('/register/')
                },
                {
                    id:"feedback", 
                    type:"outlined", 
                    width: "220px",
                    text:"Feedback", 
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
                this.setState({ gameInfo:'Something went wrong! Cannot get game info!'})
            } else {
                this.setState({gameInfo: body.info})
            }
        });
    }
    
    componentDidMount = () => {
        this.getGameInfo()
        var newSubmitButtonList = this.state.submitButtonList
        if(this.Cookies.get('idToken')) {
            newSubmitButtonList[0].text = "Go to games lobby"
            newSubmitButtonList[0].onSubmit = () => window.location.assign('/lobby/')
        }
    };

    render() {
        return(
            <FormContainer 
                isMobile = {this.props.isMobile}
                isDesktop = {this.props.isDesktop}
                isPortrait = {this.props.isPortrait}
                title="About Nägels"
                htmlMessage={this.state.gameInfo}
                submitButtonList={this.state.submitButtonList}
            >
            </FormContainer>
        )
    };

}