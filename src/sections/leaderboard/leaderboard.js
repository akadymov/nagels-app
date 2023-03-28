import React from 'react';

import './leaderboard.css'

//Local services
import NigelsApi from '../../services/nigels-api-service';
import Cookies from 'universal-cookie';

//Local components
import NigelsTableContainer from '../../components/nigels-table-container';
import SectionHeader from '../../components/section-header';


export default class LeaderBoard extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            gameRatingHeaders: this.props.isMobile && this.props.isPortrait ? ['Username', 'Games', 'Won', 'Avg score'] : ['Username', 'Played games', 'Won games', 'Avg game score', 'Bonuses per game', 'Total score'],
            gameRatings: []
        }
    }

    NigelsApi = new NigelsApi();
    Cookies = new Cookies();

    getRatings = () => {
        this.NigelsApi.getRatings()
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
                                value: 100 * rating.winRatio + '%'
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
                    title={!this.props.isMobile ? 'Rating' : ''}
                ></SectionHeader>
                <div className={`lobby-table-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    <NigelsTableContainer 
                        height={this.props.isMobile ? (this.props.isPortrait ? '74vh' : '88vh') : '90vh'}
                        headers={this.state.gameRatingHeaders}
                        rows={this.state.gameRatings}
                        onClick={this.getRatings}
                        selected={''}
                    ></NigelsTableContainer>
                </div>
            </div>
        )
    }
}