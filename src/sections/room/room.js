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
        this.handleReadySwitchChange = this.handleReadySwitchChange.bind(this);
        this.state = {
            playerHeaders: this.props.isMobile && this.props.isPortrait ? ['Player', 'Ready',''] : ['Player','Ready','','Won'],
            players: [],
            modalOpen: false,
            modalHeader: "Please, confirm action",
            modalControls: [
                {
                    id: "confirm_close_room",
                    type: "button",
                    variant: "contained",
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
                    variant: 'contained',
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
        if(!idToken) {
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
                    variant: 'contained',
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
            variant: 'contained',
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
                roomSocket.emit('remove_player_from_room', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
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
                roomSocket.emit('not_ready', this.Cookies.get('username'), username, roomId)
            } else {
                alert(body.errors[0].message)
            }
        });
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
                roomSocket.emit('close_room', this.Cookies.get('username'), roomId);
                lobbySocket.emit('remove_room_from_lobby', roomId);
                window.location.assign('/lobby' + roomId)
            }
        });
    }

    startGame = () => {
        this.NagelsApi.startGame(this.Cookies.get('idToken'), 1) // TODO: introduce autodeal checkbox
        .then((body) => {
            if(body.errors) {
                alert(body.errors[0].message)
            } else {
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
                    modalCanClose={true}
                ></NagelsModal>
            </div>
        )
    }
}
