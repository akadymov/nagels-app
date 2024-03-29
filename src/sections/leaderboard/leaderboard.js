import React from 'react';

import './leaderboard.css'

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';

//Local components
import NagelsTableContainer from '../../components/nagels-table-container';
import SectionHeader from '../../components/section-header';
import { getText } from '../../components/user-text';


export default class LeaderBoard extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            gameRatingHeaders: this.props.isMobile && this.props.isPortrait ? [getText('username_capitalize'), getText('games'), getText('won'), getText('avg_score')] : [getText('username_capitalize'), getText('played_games'), getText('won_games'), getText('avg_game_score'), getText('bonuses_per_game'), getText('total_score')],
            gameRatings: []
        }
    }

    NagelsApi = new NagelsApi();
    Cookies = new Cookies();

    getRatings = () => {
        this.NagelsApi.getRatings()
        .then((body)=>{
            var newRatings = []
            if(body){
                body.forEach(rating => {
                    rating.id = rating.username
                    rating.dataArray = [
                            {
                                type: 'player',
                                username: rating.username
                            },
                            {
                                type: 'text',
                                value: rating.gamesPlayed
                            },
                            {
                                type: 'text',
                                value: Math.round(100 * rating.winRatio) + '%'
                            },
                            {
                                type: 'text',
                                value: rating.avgScore
                            }
                        ]
                        if (!(this.props.isMobile && this.props.isPortrait)){
                            rating.dataArray.push({
                                type: 'text',
                                value: rating.bonuses
                            },
                            {
                                type: 'text',
                                value: rating.totalScore
                            })
                        }
                    newRatings.push(rating)
                });
                this.setState({gameRatings: newRatings})
            }
        })
    }

    componentDidMount = () => {
        this.getRatings()
    }

    render () {
        return (
            <div className={`leaderboard-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <SectionHeader
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={[]}
                    title={!this.props.isMobile ? getText('rating') : ''}
                ></SectionHeader>
                <div className={`lobby-table-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    <NagelsTableContainer 
                        height={this.props.isMobile ? (this.props.isPortrait ? '74vh' : '88vh') : '68vh'}
                        headers={this.state.gameRatingHeaders}
                        rows={this.state.gameRatings}
                        onClick={this.getRatings}
                        selected={''}
                    ></NagelsTableContainer>
                </div>
            </div>
        )
    }
}