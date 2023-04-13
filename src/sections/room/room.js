import React from 'react';

import './room.css'

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';
import { roomSocket, lobbySocket } from '../../services/socket';

//Local components
import NagelsTableContainer from '../../components/nagels-table-container';
import SectionHeader from '../../components/section-header';
import NagelsModal from '../../components/nagels-modal';


export default class Room extends React.Component{

    constructor(props) {
        super(props);
        this.handleInvitedUsernameChange = this.handleInvitedUsernameChange.bind(this);
        this.handleInvitedPasswordChange = this.handleInvitedPasswordChange.bind(this);
        this.handleInvitationEmailChange = this.handleInvitationEmailChange.bind(this);
        this.handleInvitationMessageChange = this.handleInvitationMessageChange.bind(this);
        this.handleReadySwitchChange = this.handleReadySwitchChange.bind(this);
        this.state = {
            playerHeaders: this.props.isMobile && this.props.isPortrait ? ['Player', 'Ready',''] : ['Player','Ready','','Won'],
            players: [],
            autodeal: true,
            singleCardHands: true,
            ratingGame: true,
            modalOpen: false,
            modalHeader: "Please, confirm action",
            modalCanClose: true,
            modalControls: [
                {
                    id: "confirm_close_room",
                    type: "button",
                    variant: "outlined",
                    text: "Close room",
                    width: '140px',
                    color: 'error',
                    disabled: false,
                    onSubmit: this.confirmCloseRoom
                },
                {
                    id: "cancel_close_room",
                    type: "button",
                    variant: "contained",
                    text: "Cancel",
                    width: '140px',
                    disabled: false,
                    onSubmit: this.closeModal
                }
            ],
            roomDetails: {
                connectedUserList: [],
                host: '',
                status: 'open',
                games: []
            },
            invitedUserData: {
                username: null,
                password: null
            },
            headerControls: [
                {
                    id: 'refresh_room',
                    type: 'button',
                    text: 'Refresh',
                    variant: 'outlined',
                    disabled: false,
                    width: '130px',
                    onSubmit: this.GetRoomDetails
                },
                {
                    id: 'start_game',
                    type: 'button',
                    text: 'Start',
                    variant: 'contained',
                    disabled: true,
                    width: '130px',
                    onSubmit: this.startGame
                },
                {
                    id: 'close_room',
                    type: 'button',
                    text: 'Close',
                    variant: 'outlined',
                    disabled: true,
                    color: 'error',
                    width: '130px',
                    onSubmit: this.closeRoom
                }
            ],
            selectedPlayerId: -1,
            selectedPlayerUsername: '',
            selectedPlayerReady: -1,
            startGameError: '',
            confirmActionMsg:'',
            confirmAction:'',
            youAreHost: false,
            nextUrl: ''
        }
    }

    NagelsApi = new NagelsApi();
    Cookies = new Cookies();

    CheckIfLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(!idToken && !this.props.match.params.invitationToken) {
            window.location.assign('/signin/');
        }
    };

    updatePlayersTable = () => {
        var newPlayers = []
        var dataArray = []
        this.state.roomDetails.connectedUserList.forEach((player, index) => { // TODO consider replacing with forEach
            dataArray = [
                {
                    type: 'player',
                    username: player.username,
                    host: player.username === this.state.roomDetails.host
                },
                {
                    type:'switch',
                    checked: player.ready,
                    defaultChecked: player.defaultChecked || player.ready,
                    disabled: player.username === this.state.roomDetails.host || (this.Cookies.get('username') !== this.state.roomDetails.host && player.username !== this.Cookies.get('username')),
                    username: player.username,
                    onChange: this.handleReadySwitchChange.bind(this, index) // FIXME: handle changes state but doesnot change UI appearance
                },
                {
                    type: 'button',
                    variant: 'outlined',
                    text:  player.username === this.Cookies.get('username') ? "Leave" : "Kick",
                    onSubmit: this.disconnectRoom.bind(this, index),
                    width: '130px',
                    color: 'error',
                    disabled: player.username === this.state.roomDetails.host || (player.username !== this.Cookies.get('username') && this.state.roomDetails.host !== this.Cookies.get('username'))
                }
            ]
            if(!(this.props.isMobile && this.props.isPortrait)) {
                dataArray.push({
                    type: 'text',
                    value: 100 * player.winRatio + '%'
                })
            }
            newPlayers.push({
                id: player.id,
                username: player.username,
                dataArray: dataArray
            })
            
        })
        this.setState({ players: newPlayers })
    }

    selectPlayer = (event, playerId) => {
        var selectedPlayerIndex = this.state.roomDetails.connectedUserList.findIndex(player => player.id === playerId)
        if(selectedPlayerIndex < 0){
            this.setState({ selectedPlayerId: -1 }, () => {
                this.updateControls();
            })
        } else {
            this.setState({
                selectedPlayerId: playerId,
                selectedPlayerUsername: this.state.roomDetails.connectedUserList[selectedPlayerIndex].username,
                selectedPlayerReady: this.state.roomDetails.connectedUserList[selectedPlayerIndex].ready
            }, () => {
                this.updateControls();
            })
        }
    }

    updateControls = () => {
        var newHeaderControls = []
        newHeaderControls.push({
            id: 'refresh_room',
            type: 'button',
            text: 'Refresh',
            variant: 'outlined',
            disabled: false,
            width: '130px',
            onSubmit: this.GetRoomDetails
        })
        newHeaderControls.push({
            id: 'invite_player',
            type: 'button',
            text: 'Invite',
            variant: 'outlined',
            disabled: !this.state.youAreHost,
            width: '130px',
            onSubmit: this.invitePlayer
        })
        newHeaderControls.push({
            id: 'start_game',
            type: 'button',
            text: 'Start',
            variant: 'contained',
            disabled: !this.state.youAreHost,
            width: '130px',
            onSubmit: this.startGame
        })
        newHeaderControls.push({
            id: 'close_room',
            type: 'button',
            text: 'Close',
            variant: 'outlined',
            color: 'error',
            disabled: !this.state.youAreHost,
            width: '130px',
            onSubmit: this.closeRoom
        })
        this.setState({ headerControls: newHeaderControls })
    }
    

    GetRoomDetails = () => {
        this.NagelsApi.getRoom(this.props.match.params.roomId)
        .then((body) => {
            if(body.errors) {
                console.log('Something went wrong! Cannot get rooms list!')
            } else {
                if(body.games.ongoingGameId) {
                    window.location.assign('/game/' + body.games.ongoingGameId)
                } else {
                    this.setState({roomDetails: body}, () => {
                        this.updatePlayersTable()
                        this.updateControls()
                    })
                    if(body.host === this.Cookies.get('username')) {
                        this.setState({youAreHost: true}, () => {
                            this.updateControls()
                        })
                    }
                    if(this.props.match.params.invitationToken && !this.Cookies.get('idToken')){
                        this.setState({
                            modalControls: [
                                {
                                    id: "invitation_text",
                                    type: "text",
                                    text: 'Welcome to Nägels App! User ' + this.state.roomDetails.host + ' invited you to room "' + this.state.roomDetails.roomName + '". Please, create a username and password to continue or log in if you already have an account. You can add other details to your profile later.'
                                },
                                {
                                    id: "invited_username_input",
                                    type: "input",
                                    variant: "outlined",
                                    value: this.state.invitedUserData.username,
                                    required: true,
                                    width: '205px',
                                    errorMessage: "",
                                    label: "Username",
                                    onChange: this.handleInvitedUsernameChange
                                },
                                {
                                    id: "invited_password_input",
                                    type: "input",
                                    textFormat: "password",
                                    variant: "outlined",
                                    value: this.state.invitedUserData.password,
                                    required: true,
                                    width: '205px',
                                    errorMessage: "",
                                    label: "Password",
                                    onChange: this.handleInvitedPasswordChange
                                },
                                {
                                    id: "invited_register_button",
                                    type: "button",
                                    variant: "contained",
                                    text: "Register and join",
                                    width: '210px',
                                    disabled: false,
                                    onSubmit: this.registerInvitedPlayer
                                },
                                {
                                    id: "invited_login_button",
                                    type: "button",
                                    variant: "outlined",
                                    text: "Log in and join",
                                    width: '210px',
                                    disabled: false,
                                    onSubmit: this.loginInvitedPlayer
                                }
                            ],
                            modalCanClose: false,
                            modalOpen: true,
                            modalHeader: "Register new player"
                        })
                    }
                    if(this.state.roomDetails.status === 'closed') {
                        window.location.assign('/lobby')
                    }
                }
            }
        });
    };

    disconnectRoom = (playerIndex) => {
        const username = this.state.players[playerIndex].username
        const roomId = this.state.roomDetails.roomId
        const roomName = this.state.roomDetails.roomName
        //if(username===this.state.roomDetails.host){
        //    this.setState({
        //        confirmActionMsg: 'Are you sure you want to leave room? It will be closed since you are host',
        //        confirmAction: this.confirmCloseRoom
        //    })
        //}
        this.NagelsApi.disconnectRoom(this.Cookies.get('idToken'), roomId, username)
        .then((body) => {
            if(!body.errors){
                console.log('Emitting event "remove_player_from_room"')
                roomSocket.emit('remove_player_from_room', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
                console.log('Emitting event "decrease_room_players"')
                lobbySocket.emit('decrease_room_players', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
                if(username === this.Cookies.get('username')){
                    window.location.assign('/lobby')
                } else {
                    var newPlayers = this.state.players
                    var disconnectedUserIndex = newPlayers.findIndex(element => element.username === username )
                    if (disconnectedUserIndex >= 0){
                        newPlayers.splice(disconnectedUserIndex,1)
                        this.setState({ players: newPlayers })
                    }
                }
            } else {
                alert(body.errors[0].message)
            }
        });
    }

    confirmReady = (username = this.state.selectedPlayerUsername ? this.state.selectedPlayerUsername : this.Cookies.get('username')) => {
        const roomId = this.state.roomDetails.roomId
        this.NagelsApi.confirmReady(this.Cookies.get('idToken'), roomId, username)
        .then((body) => {
            if(!body.errors){
                var newRoomDetails = this.state.roomDetails
                var targetUserUpdated = newRoomDetails.connectedUserList.findIndex(element => element.username === username )
                newRoomDetails.connectedUserList[targetUserUpdated].ready = true
                this.setState({roomDetails: newRoomDetails})
                console.log('Emitting event "ready"')
                roomSocket.emit('ready', this.Cookies.get('username'), username, roomId)
            } else {
                alert(body.errors[0].message)
            }
        });
    }

    resetReady = (username = this.state.selectedPlayerUsername ? this.state.selectedPlayerUsername : this.Cookies.get('username')) => {
        const roomId = this.state.roomDetails.roomId
        this.NagelsApi.resetReady(this.Cookies.get('idToken'), roomId, username)
        .then((body) => {
            if(!body.errors){
                var newRoomDetails = this.state.roomDetails
                var targetUserUpdated = newRoomDetails.connectedUserList.findIndex(element => element.username === username )
                newRoomDetails.connectedUserList[targetUserUpdated].ready = false
                this.setState({roomDetails: newRoomDetails})
                console.log('Emitting event "not_ready"')
                roomSocket.emit('not_ready', this.Cookies.get('username'), username, roomId)
            } else {
                alert(body.errors[0].message)
            }
        });
    }

    createInviteLink = () => {
        var newModalControls = this.state.modalControls
        this.NagelsApi.invitePlayer(
            this.props.match.params.roomId,
            this.state.invitationEmail,
            this.state.invitationMessage
        )
        .then((body)=>{
            if(body.errors){
                body.errors.forEach(error=>{
                    if(error.field === 'email'){
                        newModalControls[0].errorMessage = error.message
                    }
                    if(error.field === 'message'){
                        newModalControls[1].errorMessage = error.message
                    }
                })
                this.setState({
                    modalControls: newModalControls
                })
            } else {
                this.setState({
                    modalControls: [
                        {
                            id: "invitation_succeed_message",
                            type: "text",
                            text: "Invitation link created and sent to specified email. You can share it with invited players"
                        },
                        {
                            id: "invitation_link",
                            type: "text",
                            text: body.inviteLink,
                            style: 'wrap'
                        },
                        {
                            id: "invitation_close_button",
                            type: "button",
                            variant: "contained",
                            text: "Close",
                            width: '195px',
                            disabled: false,
                            onSubmit: () => this.setState({ modalOpen: false })
                        }
                    ],
                    modalCanClose: true,
                    modalOpen: true,
                    modalHeader: "Invite new player"
                })
            }
        })
    }

    loginInvitedPlayer = () => {
        this.NagelsApi.login(
            this.state.invitedUserData.username, 
            this.state.invitedUserData.password
        )
        .then((body) => {
            if(body.errors) {
                var newModalControls = this.state.modalControls
                body.errors.forEach(error=>{
                    if(error.field === 'username'){
                        newModalControls[1].errorMessage = error.message
                    }
                    if(error.field === 'password'){
                        newModalControls[2].errorMessage = error.message
                    }
                })
                this.setState({
                    modalControls: newModalControls
                })
            } else {
                var currentDate = new Date(); 
                var expiresIn = new Date(currentDate.getTime() + body.expiresIn * 1000)
                this.Cookies.set('idToken', body.token, { path: '/' , expires: expiresIn})
                this.Cookies.set('username',body.username, { path: '/' , expires: expiresIn})
                this.Cookies.set('colorScheme',body.colorScheme, { path: '/' , colorScheme: expiresIn})
                if(body.connectedRoomId) {
                    window.location.assign('/room/' + body.connectedRoomId)
                } else {
                    this.connectRoom(this.props.match.params.roomId)
                }
            }
        });
    };

    connectRoom = (roomId) => {
        this.NagelsApi.connectRoom(this.Cookies.get('idToken'), roomId)
        .then((body) => {
            if(!body.errors){
                console.log('Emitting event "add_player_to_room"')
                roomSocket.emit('add_player_to_room', this.Cookies.get('username'), roomId, body.roomName, body.connectedUsers)
                lobbySocket.emit('increase_room_players', this.Cookies.get('username'), roomId, body.roomName, body.connectedUsers)
                setTimeout(function(){
                    window.location.assign('/room/' + roomId)
                }, 1000)
            } else {
                alert(body.errors[0].message)
            }
        });
    };

    registerInvitedPlayer = () => {
        this.NagelsApi.registerTempAccount(
            this.props.match.params.roomId,
            this.props.match.params.invitationToken, 
            this.state.invitedUserData.username, 
            this.state.invitedUserData.password
        )
        .then((body)=>{
            if(body.errors) {
                var newModalControls = this.state.modalControls
                body.errors.forEach(error=>{
                    if(error.field === 'username'){
                        newModalControls[1].errorMessage = error.message
                    }
                    if(error.field === 'password'){
                        newModalControls[2].errorMessage = error.message
                    }
                })
                this.setState({
                    modalControls: newModalControls
                })
            } else {
                this.loginInvitedPlayer();
            }
        })
    }

    handleInvitationEmailChange(e) {
        var newModalControls = this.state.modalControls
        newModalControls[0].errorMessage = ''
        newModalControls[1].errorMessage = ''
        this.setState({
            invitationEmail: e.target.value,
            modalControls: newModalControls
        })
    };

    handleInvitationMessageChange(e) {
        var newModalControls = this.state.modalControls
        newModalControls[0].errorMessage = ''
        newModalControls[1].errorMessage = ''
        this.setState({
            invitationMessage: e.target.value,
            modalControls: newModalControls
        })
    };

    handleInvitedUsernameChange(e) {
        var newInvitedUserData = this.state.invitedUserData
        var newModalControls = this.state.modalControls
        newInvitedUserData.username =  e.target.value
        newModalControls[1].errorMessage = ''
        newModalControls[2].errorMessage = ''
        this.setState({
            invitedUserData: newInvitedUserData,
            modalControls: newModalControls
        })
    };

    handleInvitedPasswordChange(e) {
        var newInvitedUserData = this.state.invitedUserData
        var newModalControls = this.state.modalControls
        newInvitedUserData.password =  e.target.value
        newModalControls[1].errorMessage = ''
        newModalControls[2].errorMessage = ''
        this.setState({
            invitedUserData: newInvitedUserData,
            modalControls: newModalControls
        })
    };

    handleAutodealChange = () => {
        var curValue = this.state.autodeal
        this.setState({autodeal: !curValue})
    }

    handleSingleCardChange = () => {
        var curValue = this.state.singleCardHands
        this.setState({singleCardHands: !curValue})
    }

    handleRatingGameChange = () => {
        var curValue = this.state.ratingGame
        this.setState({ratingGame: !curValue})
    }

    handleReadySwitchChange = (playerIndex) => {
        var newPlayers = this.state.players
        /*var targetSwitch = document.getElementById('ready-switch-' + newPlayers[playerIndex].username)
        if (targetSwitch) {
            targetSwitch.checked = !newPlayers[playerIndex].ready
        }*/
        newPlayers[playerIndex].defaultChecked = newPlayers[playerIndex].ready
        newPlayers[playerIndex].ready = !newPlayers[playerIndex].ready
        if (newPlayers[playerIndex].ready) {
            this.confirmReady(newPlayers[playerIndex].username)
            this.setState({players: newPlayers})
        } else {
            this.resetReady(newPlayers[playerIndex].username)
            this.setState({players: newPlayers})
        }
    }

    closeRoom = () => {
        this.setState({
            modalOpen: true
        })
    }

    closeModal = () => {
        this.setState({ 
            modalOpen: false 
        })
    }

    confirmCloseRoom = () => {
        const roomId = this.state.roomDetails.roomId
        this.NagelsApi.closeRoom(this.Cookies.get('idToken'), roomId)
        .then((body) => {
            if(body.errors){
                alert(body.errors[0].message)
            } else {
                console.log('Emitting event "close_room"')
                roomSocket.emit('close_room', this.Cookies.get('username'), roomId);
                console.log('Emitting event "remove_room_from_lobby"')
                lobbySocket.emit('remove_room_from_lobby', roomId);
                window.location.assign('/lobby' + roomId)
            }
        });
    }

    invitePlayer = () => {
        this.setState({
            modalControls: [
                {
                    id: "invitation_email",
                    type: "input",
                    variant: "outlined",
                    value: '',
                    label: "Player email",
                    onChange: this.handleInvitationEmailChange
                },
                {
                    id: "invitation_text",
                    type: "input",
                    variant: "outlined",
                    value: 'Nägels Online player ' + this.state.roomDetails.host + ' invites you to room "' + this.state.roomDetails.roomName + '".',
                    label: "Message",
                    onChange: this.handleInvitationMessageChange
                },
                {
                    id: "invitation_confirm_button",
                    type: "button",
                    variant: "contained",
                    text: "Create invite link",
                    width: '195px',
                    disabled: false,
                    onSubmit: this.createInviteLink
                }
            ],
            modalCanClose: true,
            modalOpen: true,
            modalHeader: "Invite new player"
        })
    }

    startGame = () => {
        this.setState({
            modalControls: [
                {
                    id: "autodeal_checkbox",
                    type: "checkbox",
                    label: "Auto deal cards",
                    defaultChecked: this.state.autodeal,
                    onChange: this.handleAutodealChange
                },
                {
                    id: "single_card_hands",
                    type: "checkbox",
                    label: "Single card hands",
                    defaultChecked: this.state.singleCardHands,
                    onChange: this.handleSingleCardChange
                },
                {
                    id: "rating_game",
                    type: "checkbox",
                    label: "Rating game",
                    defaultChecked: this.state.ratingGame,
                    onChange: this.handleRatingGameChange
                },
                {
                    id: "confirm_start_game_button",
                    type: "button",
                    variant: "contained",
                    text: "Start game",
                    width: '140px',
                    disabled: false,
                    onSubmit: ()=>this.confirmStartGame(this.state.autodeal, this.state.singleCardHands, this.state.ratingGame)
                }
            ],
            modalCanClose: true,
            modalOpen: true,
            modalHeader: "New game"
        })
    }

    confirmStartGame = (autodeal, singleCardHands, ratingGame) => {
        this.NagelsApi.startGame(
            this.Cookies.get('idToken'), 
            autodeal, 
            singleCardHands, 
            ratingGame
        )
        .then((body) => {
            if(body.errors) {
                alert(body.errors[0].message)
            } else {
                console.log('Emitting event "start_game_in_room"')
                roomSocket.emit('start_game_in_room', this.Cookies.get('username'), body.gameId, this.props.match.params.roomId)
                setTimeout(function(){
                    window.location.assign('/game/' + body.gameId)
                }, 1000)
            }
        })
    }

    roomAutoUpdate = () => { // update lobby every 60 seconds
        setTimeout(function(){
            this.GetRoomDetails()
        }.bind(this), 300000)
    }
    
    componentDidMount = () => {
        this.GetRoomDetails();

        this.roomAutoUpdate();
        roomSocket.on("update_room", (data) => {
            if(this.Cookies.get('username') !== data.actor){
                if(data.roomId && data.username){
                    if(parseInt(data.roomId) === parseInt(this.state.roomDetails.roomId)){
                        var newRoomDetails = {}
                        var targetUserUpdated = -1
                        switch(data.event){
                            case "ready" :
                                newRoomDetails = this.state.roomDetails
                                targetUserUpdated = newRoomDetails.connectedUserList.findIndex(element => element.username === data.username )
                                newRoomDetails.connectedUserList[targetUserUpdated].defaultChecked = newRoomDetails.connectedUserList[targetUserUpdated].ready
                                newRoomDetails.connectedUserList[targetUserUpdated].ready = true
                                if (targetUserUpdated>0){
                                    this.setState({roomDetails: newRoomDetails}, () => {this.updatePlayersTable()})
                                }
                                break
                            case 'not ready':
                                newRoomDetails = this.state.roomDetails
                                targetUserUpdated = newRoomDetails.connectedUserList.findIndex(element => element.username === data.username )
                                newRoomDetails.connectedUserList[targetUserUpdated].defaultChecked = newRoomDetails.connectedUserList[targetUserUpdated].ready
                                newRoomDetails.connectedUserList[targetUserUpdated].ready = false
                                if (targetUserUpdated>0){
                                    this.setState({roomDetails: newRoomDetails}, () => {this.updatePlayersTable()})
                                }
                                break
                            case 'connect':
                                targetUserUpdated = this.state.roomDetails.connectedUserList.findIndex(element => element.username === data.username )
                                this.GetRoomDetails()
                                break
                            case 'disconnect':
                                targetUserUpdated = this.state.roomDetails.connectedUserList.findIndex(element => element.username === data.username )
                                if (targetUserUpdated >= 0){
                                    if(this.state.roomDetails.connectedUserList[targetUserUpdated].username === this.Cookies.get('username')){
                                        this.setState({
                                            modalControls: [
                                                {
                                                    id: "empty_margin",
                                                    type: "text",
                                                    text: ""
                                                },
                                                {
                                                    id: "kick_message",
                                                    type: "text",
                                                    text: "Sorry, you were kicked from the room. Disconnecting..."
                                                }
                                            ],
                                            modalCanClose: false,
                                            modalOpen: true,
                                            modalHeader: ""
                                        })
                                        setTimeout(function(){
                                            window.location.assign('/lobby/')
                                        }, 3000)
                                        
                                    } else {
                                        this.GetRoomDetails()
                                    }
                                }
                                break
                            default:
                                console.log('Received unknown roomsocket event "' + data.event + '"')
                        }
                    }
                }
            }
        });

        
        roomSocket.on("exit_room", (data) => {
            if(parseInt(data.roomId) === parseInt(this.state.roomDetails.roomId)){
                if(data.username === 0 || data.username === this.Cookies.get('username')){
                    window.location.assign('/lobby/')
                }
            }
        });
        

        roomSocket.on("start_game", (data) => {
            if(data.roomId === this.state.roomDetails.roomId){
                window.location.assign('/game/' + data.gameId)
            }
        });

    };

    componentWillUnmount = () => {
        roomSocket.disconnect()
        lobbySocket.disconnect()
    }

    render() {
      
        this.CheckIfLoggedIn();

        return(
            <div className={`room-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <SectionHeader
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.headerControls}
                    title={!this.props.isMobile ? this.state.roomDetails.roomName : ''}
                    subtitle={!this.props.isMobile ? this.state.roomDetails.host : ''}
                ></SectionHeader>
                <div className={`room-table-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    <NagelsTableContainer
                        height={this.props.isMobile ? (this.props.isPortrait ? '74vh' : '88vh') : '68vh'}
                        headers={this.state.playerHeaders}
                        rows={this.state.players}
                        onClick={this.selectPlayer}
                        selected={this.state.selectedPlayerId}
                    ></NagelsTableContainer>
                </div>
                <NagelsModal
                    open={this.state.modalOpen}
                    text={this.state.modalHeader}
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.modalControls}
                    closeModal={this.closeModal}
                    modalCanClose={this.state.modalCanClose}
                ></NagelsModal>
            </div>
        )
    }
}
