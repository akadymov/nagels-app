import React from 'react';

import './active-container.css'
import { Switch, Route, withRouter } from 'react-router-dom';

// Local components
import MainLogo from '../main-logo';
import Login from '../../sections/login';
import Registration from '../../sections/registration';
import RegistrationSucceed from '../../sections/registration-succeed'
import Lobby from '../../sections/lobby';
import Room from '../../sections/room';
import About from '../../sections/about';
import Game from '../../sections/game';
import Profile from '../../sections/profile';
import ForgotPassword from '../../sections/forgot-password';
import ResetPassword from '../../sections/reset-password';
import Feedback from '../../sections/feedback';
import LeaderBoard from '../../sections/leaderboard';

export default class ActiveContainer extends React.Component{
    
    render() {

        const RoomWithRouter = withRouter(Room)
        const LeaderBoardWithRouter = withRouter(LeaderBoard)
        const LoginWithRouter = withRouter(Login)
        const AboutWithRouter = withRouter(About)
        const RegistrationSucceedWithRouter = withRouter(RegistrationSucceed)
        const RegistrationWithRouter = withRouter(Registration)
        const GameWithRouter = withRouter(Game)
        const ProfileWithRouter = withRouter(Profile)
        const ForgotPasswordWithRouter = withRouter(ForgotPassword)
        const ResetPasswordWithRouter = withRouter(ResetPassword)
        const FeedbackWithRouter = withRouter(Feedback)

        return (
            <div className={`active-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <MainLogo
                    isMobile = {this.props.isMobile}
                    isDesktop = {this.props.isDesktop}
                    isPortrait = {this.props.isPortrait}
                ></MainLogo>
                <Switch>
                    <Route 
                        path="/game/:gameId" 
                        component={
                            () => <GameWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/about" 
                        component={
                            () => <AboutWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/profile/:username" 
                        component={
                            () => <ProfileWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/feedback" 
                        component={
                            () => <FeedbackWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/profile" 
                        component={
                            () => <ProfileWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/leaderboard" 
                        component={
                            () => <LeaderBoardWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/reset-password/:resetPasswordToken" 
                        component={
                            () => <ResetPasswordWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/room/:roomId" 
                        component={
                            () => <RoomWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        exact path="/lobby" 
                        component={
                            () => <Lobby  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    >
                    </Route>
                    <Route 
                        path="/registration-succeed/:username" 
                        component={
                            () => <RegistrationSucceedWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/register" 
                        component={
                            () => <RegistrationWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                     ></Route>
                    <Route 
                        path="/signout" 
                        component={
                            () => <LoginWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/signin/:username" 
                        component={
                            () => <LoginWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/forgot-password/" 
                        component={
                            () => <ForgotPasswordWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    <Route 
                        path="/" 
                        component={
                            () => <LoginWithRouter  
                                isMobile = {this.props.isMobile}
                                isDesktop = {this.props.isDesktop}
                                isPortrait = {this.props.isPortrait}
                            />
                        }
                    ></Route>
                    {/*<Route path="/forgot-password" component={ForgotPassword}></Route>
                    <Route path="/restore-password" component={RestorePassword}></Route>
                    <Route path="/game/:gameId" component={Game}></Route>
                    <Route path="/leaderboard" component={LeaderBoard}></Route>
                    <Route path="/feedback" component={Feedback}></Route>*/}
                </Switch>
            </div>
        )
    }
}
