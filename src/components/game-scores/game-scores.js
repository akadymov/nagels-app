import React from 'react';

import './game-scores.css';

//MUI components
import Modal from '@mui/material/Modal';

// local components
import NagelsTableContainer from '../../components/nagels-table-container';
import FormButton from '../form-button';
import Cookies from 'universal-cookie';


export default class GameScores extends React.Component{

    Cookies = new Cookies();

    render () {

        return(
            <Modal open={this.props.open}>
                <div className={`game-scores-modal-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}  ${this.Cookies.get('colorScheme')==='dark' ? 'dark-theme' : ''}`}>
                    <div className={`game-scores-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <NagelsTableContainer
                            isMobile={this.props.isMobile}
                            isDesktop={this.props.isDesktop}
                            isPortrait={this.props.isPortrait}
                            padding='4px'
                            headers={this.props.scoresHeaders}
                            playerHeaders={true}
                            rows={this.props.scores}
                            height={this.props.isMobile ? (this.props.isPortrait ? '60vh' : '71vh') : '60vh'}
                            centered={true}
                        ></NagelsTableContainer>
                    </div>
                    <div className={`scores-controls-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <div className="close-scores-button-container">
                            <FormButton
                                key='close_game_scores'
                                variant='outlined'
                                text='Back to game'
                                onSubmit={this.props.closeModal}
                                size='small'
                            ></FormButton>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}