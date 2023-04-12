import React from 'react';

import './nagels-modal.css';

//MUI components
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormButton from '../form-button';
import CloseIcon from '@mui/icons-material/Close';
import NagelsAvatar from '../nagels-avatar/nagels-avatar';
import OpenCard from '../open-card';
import Cookies from 'universal-cookie';

export default class NagelsModal extends React.Component{

    Cookies = new Cookies();

    render() {

        return(
            <Modal
                open={this.props.open}
            >
                <div className={`modal-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"} ${this.Cookies.get('colorScheme')==='dark' ? 'dark-theme' : ''}`}>
                    <div className='modal-content-container'>
                        <div className="modal-header">{this.props.header}</div>
                        <div className="modal-text-container">
                            {this.props.text}
                        </div>
                        <div 
                            className="modal-controls-container"
                            onKeyPress={this.props.onKeyPress}
                        >
                            {this.props.controls.map(control => {
                                switch(control.type){
                                    case 'input':
                                        return (
                                            <div className="modal-control-container" key={control.id}>
                                                    <TextField
                                                        id={control.id}
                                                        key={control.id}
                                                        label={control.label}
                                                        type={control.textFormat}
                                                        variant={control.variant}
                                                        onChange={control.onChange}
                                                        sx={{width: control.width}}
                                                        size='small'
                                                        required={control.required}
                                                        defaultValue={control.text}
                                                        error={control.errorMessage}
                                                        helperText={control.errorMessage}
                                                    ></TextField>
                                            </div>
                                        )
                                    case 'input-file':
                                        return (
                                            <div className="modal-control-container" key={control.id}>
                                                <input
                                                    type="file"
                                                    onChange={control.onChange}
                                                    onClick={control.onClick}
                                                    accept={control.accept}
                                                    style={{ display: control.hidden ? 'none' : 'block' }}
                                                ></input>
                                            </div>
                                        )
                                    case 'hand-cards':
                                        return(
                                            <div className="modal-control-container" key={control.id}>
                                                <div 
                                                    className="modal-cards-container"
                                                    style={{
                                                        width:(this.props.isMobile ? 49 : 60) + (control.cards.length - 1) * (this.props.isMobile ? 15 : 18),
                                                        height: 70
                                                    }}
                                                >
                                                    {control.cards.map(card =>{
                                                        return(<OpenCard 
                                                            key={'modal-card-' + card}
                                                            cardId={'card-' + card}
                                                            selectedCard={null}
                                                            isMobile={this.props.isMobile}
                                                            isPortrait={this.props.isPortrait}
                                                            index={control.cards.findIndex( el => el === card )}
                                                            modal={true}
                                                        ></OpenCard>)
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    case 'button':
                                        return(
                                            <div className="modal-control-container" key={control.id}>
                                            <FormButton
                                                id={control.id}
                                                key={control.id}
                                                onSubmit={control.onSubmit}
                                                variant={control.variant}
                                                disabled={control.disabled}
                                                text={control.text}
                                                width={control.width}
                                                color={control.color}
                                            ></FormButton>
                                            </div>
                                        )
                                    case 'players-bet-info':
                                        return (
                                            <div className="modal-player-bets-container">
                                                {control.players.length ?
                                                    <div className="modal-player-bet-header">{control.header}</div>
                                                :
                                                    ''
                                                }
                                                {control.players.map(player => {
                                                    return(
                                                            <div className="modal-player-bet-info">
                                                                <div className="modal-player-avatar-container">
                                                                    <NagelsAvatar
                                                                        width = "20px"
                                                                        height = "20px"
                                                                        username = {player.username}
                                                                    ></NagelsAvatar>
                                                                </div>
                                                                <div 
                                                                    className="modal-player-username"
                                                                    onClick={()=>window.location.assign('/profile/' + player.username)}
                                                                >{player.username}</div>
                                                                <div className="modal-player-betsize">{player.betSize}</div>
                                                            </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    case 'checkbox':
                                        return(
                                            <div className={`modal-control-container-checkbox`} key={control.id}>
                                                <Checkbox
                                                    key={'checkbox' + control.id}
                                                    value={control.value}
                                                    onChange={control.onChange}
                                                    defaultChecked={control.defaultChecked}
                                                    size='small'
                                                    sx={{padding:'5px'}}
                                                ></Checkbox>
                                                {control.label}
                                            </div>
                                        )
                                    case 'text':
                                        return(
                                            <div className={`modal-control-container ${control.style || ''}`} key={control.id}>
                                                {control.text}
                                            </div>
                                        )
                                    default:
                                        return('')
                                }
                            })}
                        </div>
                        {this.props.modalCanClose ?
                            <div class="modal-close-icon-container">
                                <CloseIcon
                                    onClick={this.props.closeModal}
                                ></CloseIcon>
                            </div>
                        : 
                            ''
                        }
                    </div>
                </div>
            </Modal>
        )
    }
}