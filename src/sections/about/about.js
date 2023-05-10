import React from 'react';

import './about.css'

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';
import { getText } from '../../components/user-text';

//Local components
import FormContainer from '../../components/form-container';

//MUI components
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

export default class About extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            gameInfo: '',
            preferredLang: this.Cookies.get('preferredLang'),
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

    handleLangChange = (e) => {
        const currentDate = new Date();
        const expiresIn = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
        this.setState({
            preferredLang: e.target.value
        })
        this.Cookies.set('preferredLang', e.target.value, { path: '/' , expires: expiresIn})
        window.location.reload()
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
            <div>
                {this.props.isDesktop ? 
                    <div className={`about-lang-select-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <Select
                            labelId="lang-select-label"
                            id="lang-select"
                            value={this.state.preferredLang || 'en'}
                            label={getText('language')}
                            size='small'
                            sx={{fontSize: 14, width: '130px', textAlign: 'left'}}
                            onChange={this.handleLangChange}
                        >
                            <MenuItem value='en' sx={{fontSize: 14}}>{getText('english')}</MenuItem>
                            <MenuItem value='ru' sx={{fontSize: 14}}>{getText('russian')}</MenuItem>
                        </Select>
                        <InputLabel id="lang-label" sx={{fontSize: '0.75rem', textAlign: 'left', marginLeft: '14px', marginTop: '4px'}}>{getText('language')}</InputLabel>
                </div>
                :
                    ''
                }
                <FormContainer 
                    isMobile = {this.props.isMobile}
                    isDesktop = {this.props.isDesktop}
                    isPortrait = {this.props.isPortrait}
                    title={getText('about_nagels')}
                    htmlMessage={this.state.gameInfo}
                    submitButtonList={this.state.submitButtonList}
                >
                </FormContainer>
            </div>
        )
    };

}