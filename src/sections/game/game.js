import React from 'react';

import './game.css'

//Local services
import Cookies from 'universal-cookie';
import NagelsApi from '../../services/nagels-api-service';
import { lobbySocket, roomSocket, gameSocket } from '../../services/socket';

//Local components
import SectionHeader from '../../components/section-header';
import PlayerContainer from '../../components/player-container';
import OpponentContainer from '../../components/opponent-container';
import NagelsModal from '../../components/nagels-modal';
import TableActionMessage from '../../components/table-action-message';
import TablePutCards from '../../components/table-put-cards';
import GameScores from '../../components/game-scores';
import { getText } from '../../components/user-text';

//MUI components
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

export default class Game extends React.Component{

    constructor(props) {
        super(props);
        this.handleBetChange = this.handleBetChange.bind(this);
        this.selectCard = this.selectCard.bind(this);
        this.state = {
            userSettings: {
                deckType: this.Cookies.get('deckType'),
                colorScheme: this.Cookies.get('colorScheme'),
                preferredLang: this.Cookies.get('preferredLang')
            },
            replayMode: false,
            replayedHand: 0,
            replayedTurn: 0,
            gameDetails: {
                gameId: null,
                roomId: null,
                roomName: null,
                host: null,
                positionsDefined: false,
                canDeal: false,
                actionMessage: '',
                allowedSuites: [],
                attentionToMessage: false,
                gameScores: [],
                playedHands: [],
                nextActingPlayer: null,
                players: [],
                cardsOnTable: [],
                lastTurnCards: [],
                showLastTurn: [],
                myInHandInfo: {
                    username: null,
                    betSize: null,
                    tookTurns: null,
                    dealtCards: [],
                    selectedCard: null
                }
            },
            headerControls: [],
            scoresModalOpen: false,
            modalContentType: '',
            modalOpen: false,
            modalText: '',
            modalCanClose: false,
            modalControls: []
        }
    };

    Cookies = new Cookies();
    NagelsApi = new NagelsApi();

    CheckIfAlreadyLoggedIn = () => {
        const idToken = this.Cookies.get('idToken')
        if(!idToken) {
            window.location.assign('/signin/expired');
        }
    }

    handleApiError(responseWithErrors){
        console.log('REST API error:')
        responseWithErrors.errors.forEach(error => {
            console.log(error.message)
        })
    }

    handleInGameError(responseWithErrorMessage){
        var newGameDetails = this.state.gameDetails
        newGameDetails.actionMessage = responseWithErrorMessage.errors[0].message
        if(responseWithErrorMessage.errors[0].allowedSuites){
            newGameDetails.allowedSuites = responseWithErrorMessage.errors[0].allowedSuites
        }
        this.setState({gameDetails: newGameDetails})
    }

    newGameStatus = () => {
        // get game status
        var newHeaderControls = []
        var newModalControls = []
        this.NagelsApi.getGame(this.props.match.params.gameId, this.Cookies.get('idToken'))
        .then((getGameResponse) => {
            if(getGameResponse.errors){
                this.handleApiError(getGameResponse)
            } else {
                if(getGameResponse.autodeal && getGameResponse.host === this.Cookies.get('username')){
                    if(getGameResponse.canDeal){
                        this.dealCards()
                    }
                    if(!getGameResponse.positionsDefined){
                        this.definePositions()
                    }
                }
                newHeaderControls = [
                    {
                        id: 'scores',
                        type: 'button',
                        text: getText('scores'),
                        variant: 'outlined',
                        disabled: false,
                        size: 'small',
                        width: '130px',
                        onSubmit: this.showScores
                    },
                    {
                        id: 'refresh',
                        type: 'button',
                        text: getText('refresh'),
                        variant: 'outlined',
                        disabled: false,
                        size: 'small',
                        width: '130px',
                        onSubmit: this.newGameStatus
                    },
                    {
                        id: 'exit',
                        type: 'button',
                        text: getGameResponse.host === this.Cookies.get('username') && getGameResponse.status !== 'finished' ? getText('finish') : getText('exit'),
                        variant: 'text',
                        disabled: false,
                        size: 'small',
                        width: '130px',
                        color: 'error',
                        onSubmit: getGameResponse.host === this.Cookies.get('username') && getGameResponse.status !== 'finished' ? this.finishGame : (getGameResponse.myInHandInfo.username && getGameResponse.status !== 'finished' ? this.exitGame : ()=> window.location.assign('/lobby'))
                    }
                ]
                if (getGameResponse.host === this.Cookies.get('username')){
                    if(!getGameResponse.positionsDefined){
                        newHeaderControls.unshift({
                            id: 'shuffle',
                            type: 'button',
                            text: getText('shuffle'),
                            variant: 'contained',
                            disabled: getGameResponse.status === 'finished',
                            size: 'small',
                            width: '130px',
                            onSubmit: this.definePositions
                        })
                    }
                    if(getGameResponse.status === 'finished'){
                        newHeaderControls.unshift({
                            id: 'restart',
                            type: 'button',
                            text: getText('start_new_game'),
                            variant: 'contained',
                            disabled: getGameResponse.status !== 'finished',
                            size: 'small',
                            width: '130px',
                            onSubmit: this.restartGame
                        })
                        newHeaderControls.push({
                            id: 'replay_button',
                            type: 'button',
                            text: getText('replay_hands'),
                            variant: 'contained',
                            disabled: getGameResponse.status !== 'finished' && getGameResponse.playedHands,
                            size: 'small',
                            width: '130px',
                            onSubmit: this.viewPlayedHands
                        })
                    }
                    if(getGameResponse.canDeal){
                        newHeaderControls.push({
                            id: 'deal',
                            type: 'button',
                            text: getText('deal'),
                            variant: 'contained',
                            disabled: !getGameResponse.canDeal,
                            size: 'small',
                            width: '130px',
                            onSubmit: this.dealCards
                        })
                    }
                    if(!getGameResponse.positionsDefined){
                        getGameResponse.attentionToMessage = true
                        getGameResponse.actionMessage = getText('press_shuffle')
                    }
                    if(getGameResponse.canDeal){
                        getGameResponse.attentionToMessage = true
                        getGameResponse.actionMessage = getText('press_deal')
                    }
                }
                if(getGameResponse.lastTurnCards.length > 0) {
                    newHeaderControls.push({
                        id: 'last_turn',
                        type: 'button',
                        text: getText('last_turn'),
                        variant: 'contained',
                        disabled: getGameResponse.lastTurnCards === [],
                        size: 'small',
                        width: '130px',
                        onSubmit: this.showLastTurnMobile,
                        onMouseDown: (e) => this.handleLastTurnClick(e),
                        onMouseUp: (e) => this.handleLastTurnClick(e)
                    })
                }
                if(getGameResponse.nextActingPlayer === this.Cookies.get('username') && !getGameResponse.betsAreMade){
                    var betPlayers = []
                    var playersToBet = []
                    //var sumOfMadeBets = 0
                    getGameResponse.players.map(player => {
                        if(player.username !== this.Cookies.get('username')){
                            if(player.betSize !== null){
                                betPlayers.push(player)
                                //sumOfMadeBets =+ player.betSize
                            } else {
                                playersToBet.push(player)
                            }
                        }
                    })
                    newModalControls = [
                        {
                            id: "hand_cards",
                            type: "hand-cards",
                            cards: getGameResponse.myInHandInfo.dealtCards
                        },
                        {
                            id: "bet_players",
                            header: getText('made_bets'),
                            type: "players-bet-info",
                            players: betPlayers
                        },
                        {
                            id: "bet_size_input",
                            type: "input",
                            textFormat: "number",
                            label: getText('bet_size'),
                            required: true,
                            variant: "outlined",
                            value: this.state.myBetSizeValue,
                            errorMessage: "",
                            onChange: this.handleBetChange,
                            width: '150px',
                            defaultValue:0
                        },
                        {
                            id: "players_to_bet",
                            header: getText('players_to_bet'),
                            type: "players-bet-info",
                            players: playersToBet
                        },
                        {
                            id: "bet_size_confirm_button",
                            type: "button",
                            variant: "contained",
                            text: getText('confirm'),
                            width: "195px",
                            onSubmit: this.makeBet
                        },
                        {
                            id: "scores_view_button",
                            type: "button",
                            variant: "outlined",
                            text: getText('scores'),
                            width: "195px",
                            onSubmit: this.showScores
                        }
                    ]
                }
                if(getGameResponse.nextActingPlayer === this.Cookies.get('username')){
                    getGameResponse.attentionToMessage = true
                }
                this.setState({
                    gameDetails: getGameResponse,
                    headerControls: newHeaderControls,
                    modalControls: newModalControls,
                    modalOpen: getGameResponse.nextActingPlayer === this.Cookies.get('username') && !getGameResponse.betsAreMade,
                    modalText: getText('make_a_bet'),
                    modalCanClose: false,
                    modalContentType: 'Bet',
                    replayMode: false
                })
                /*if(getGameResponse.players.length === getGameResponse.cardsOnTable.length){
                    setTimeout(this.utilizeCards(getGameResponse.currentHandId, getGameResponse.nextActingPlayer), 3000)
                }*/
            }
        })
    }

    restartGame = () => {

        this.NagelsApi.startGame(
            this.Cookies.get('idToken'), 
            this.state.gameDetails.autodeal, 
            this.state.gameDetails.singleCardHands,
            this.state.gameDetails.ratingGame
        ) // TODO: introduce autodeal checkbox
        .then((body) => {
            if(body.errors) {
                alert(body.errors[0].message)
            } else {
                console.log('Emitting event "start_game_in_room"')
                roomSocket.emit('start_game_in_room', this.Cookies.get('username'), body.gameId, this.state.gameDetails.roomId)
                setTimeout(function(){
                    window.location.assign('/game/' + body.gameId)
                }, 1000)
            }
        })
    }

    /*utilizeCards = (tookPlayerUsername, handId) => {
        if (tookPlayerUsername === this.state.gameDetails.nextActingPlayer && handId === this.state.gameDetails.currentHandId) {
            this.state.gameDetails.cardsOnTable = []
        }
    }*/

    finishGame = () => {
        var newModalControls = [
            {
                id: "confirm_finish_game",
                type: "button",
                variant: "text",
                text: getText('finish_game'),
                width: '140px',
                color: 'error',
                disabled: false,
                onSubmit: this.confirmFinishGame
            },
            {
                id: "cancel_finish_game",
                type: "button",
                variant: "contained",
                text: getText('cancel'),
                width: '140px',
                disabled: false,
                onSubmit: this.closeModal
            }
        ]
        this.setState({
            modalControls: newModalControls,
            modalOpen: true,
            modalText: getText('confirm_game_finish'),
            modalCanClose: true,
            modalContentType: 'Finish'
        })
    }

    viewPlayedHands = () => {
        var newGameDetails = this.state.gameDetails
        var newHeaderControls = this.state.headerControls
        newGameDetails.actionMessage = getText('this_is_replay')
        newGameDetails.attentionToMessage = true
        newHeaderControls = [
            {
                id: 'next_hand',
                type: 'button',
                text: getText('next_hand'),
                variant: 'contained',
                size: 'small',
                disabled: this.state.replayedHand === newGameDetails.playedHands.length - 1,
                width: '130px',
                onSubmit: this.viewNextHand
            },
            {
                id: 'next_turn',
                type: 'button',
                text: getText('next_turn'),
                variant: 'contained',
                size: 'small',
                disabled: this.state.replayedHand === newGameDetails.playedHands.length - 1 && this.state.replayedTurn === newGameDetails.playedHands[this.state.replayedHand].turns.length - 1,
                width: '130px',
                onSubmit: this.viewNextTurn
            },
            {
                id: 'previous_turn',
                type: 'button',
                text: getText('previous_turn'),
                variant: 'contained',
                size: 'small',
                disabled: this.state.replayedTurn === 0 && this.state.replayedHand === 0,
                width: '130px',
                onSubmit: this.viewPreviousTurn
            },
            {
                id: 'previous_hand',
                type: 'button',
                text: getText('previous_hand'),
                variant: 'contained',
                size: 'small',
                disabled: this.state.replayedHand === 0,
                width: '130px',
                onSubmit: this.viewPreviousHand
            },
            {
                id: 'back_to_game_button',
                type: 'button',
                text: getText('back_to_game'),
                variant: 'contained',
                size: 'small',
                width: '130px',
                onSubmit: this.newGameStatus
            }
        ]
        this.setState({ 
            replayMode: true,
            gameDetails: newGameDetails,
            headerControls: newHeaderControls
        })
    }

    viewNextHand = () => {
        var previousHandIndex = this.state.replayedHand + 1
        this.setState({
            replayedHand: previousHandIndex,
            replayedTurn: 0
        }, () => {
            this.viewPlayedHands()
        });
    }

    viewPreviousHand = () => {
        var nextHandId = 0
        this.setState({
            replayedHand: nextHandId,
            replayedTurn: 0
        }, () => {
            this.viewPlayedHands()
        });
    }

    viewNextTurn = () => {
        var previousHandIndex = 0
        var previousTurnIndex = 0
        if(this.state.replayedTurn === this.state.gameDetails.playedHands[this.state.replayedHand].turns.length - 1){
            previousHandIndex = this.state.replayedHand + 1
        } else {
            previousHandIndex = this.state.replayedHand
            previousTurnIndex = this.state.replayedTurn + 1
        }
        this.setState({
            replayedHand: previousHandIndex,
            replayedTurn: previousTurnIndex
        }, () => {
            this.viewPlayedHands()
        });
    }

    viewPreviousTurn = () => {
        var nextTurnIndex = 0
        var nextHandId = 0
        if(this.state.replayedTurn === 0){
            nextHandId = this.state.replayedHand - 1
            nextTurnIndex = this.state.gameDetails.playedHands[this.state.replayedHand].turns.length - 1
        } else {
            nextHandId = this.state.replayedHand
            nextTurnIndex = this.state.replayedTurn - 1
        }
        this.setState({
            replayedHand: nextHandId,
            replayedTurn: nextTurnIndex
        }, () => {
            this.viewPlayedHands()
        });
    }

    closeModal = () => {
        this.setState({ 
            modalControls: [],
            modalOpen: false
        })
    }

    closeScoresModal = () => {
        this.setState({ scoresModalOpen: false })
    }

    confirmFinishGame = () => {
        const gameId = this.state.gameDetails.gameId
        const roomId = this.state.gameDetails.roomId
        this.NagelsApi.finishGame(this.Cookies.get('idToken'))
        .then((body) => {
            if(body.errors){
                this.handleInGameError(body)
            } else {
                console.log('Emitting event "finish_game_in_room"')
                gameSocket.emit('finish_game_in_room', this.Cookies.get('username'), gameId, roomId);
                this.setState({actionMessage: getText('game_id') + gameId + getText('was_finished')})
                window.location.assign('/room/' + roomId)
            }
        });
    }

    dealCards = () => {
        this.NagelsApi.dealCards(this.props.match.params.gameId, this.Cookies.get('idToken'))
        .then((body) => {
            if(body.errors) {
                this.handleInGameError(body)
            } else{
                console.log('Emitting event "deal_cards"')
                gameSocket.emit('deal_cards', this.props.match.params.gameId)
                this.newGameStatus();
            }
        });
    };

    makeBet = () => {
        this.NagelsApi.makeBet(this.Cookies.get('idToken'), this.state.gameDetails.gameId, this.state.gameDetails.currentHandId, parseInt(this.state.myBetSizeValue,10))
        .then((body) => {
            if(body.errors) {
                var newModalControls = this.state.modalControls
                var inputControlIndex = newModalControls.findIndex(el => el.id === "bet_size_input")
                newModalControls[inputControlIndex].errorMessage = body.errors[0].message
                this.setState({
                    modalControls: newModalControls
                })
            } else {
                console.log('Emitting event "make_bet"')
                gameSocket.emit(
                    'make_bet', 
                    this.props.match.params.gameId,
                    this.state.gameDetails.currentHandId, 
                    this.Cookies.get('username'), 
                    parseInt(this.state.myBetSizeValue,10),
                    body.isLastPlayerToBet,
                    body.nextActingPlayer
                )
                this.newGameStatus();
                }
            });
    };

    definePositions = () => {
        this.NagelsApi.definePositions(this.props.match.params.gameId, this.Cookies.get('idToken'))
        .then((body) => {
            if(body.errors) {
                this.handleInGameError(body)
            } else {
                console.log('Emitting event "define_positions"')
                gameSocket.emit('define_positions', this.props.match.params.gameId, body.players)
                this.newGameStatus()
            }
        });
    };

    handleLastTurnClick = (e) => {
        if (e.type === "mousedown") {
            this.setState({
                showLastTurn: true
            })
        } else {
            this.setState({
                showLastTurn: false
            })
        }
    }

    selectCard = (cardId) => {
        
        if( cardId !== this.state.selectedCard) {
            this.setState({
                selectedCard: cardId
            })
        } else {
            this.NagelsApi.putCard(
                this.Cookies.get('idToken'),
                this.state.gameDetails.gameId,
                this.state.gameDetails.currentHandId,
                cardId
            )
            .then((body) => {
                if(body.errors) {
                    this.handleInGameError(body)
                } else {
                    console.log('Emitting event "put_card"')
                    gameSocket.emit(
                        'put_card', 
                        this.props.match.params.gameId,
                        this.state.gameDetails.currentHandId,
                        this.Cookies.get('username'),
                        body.cardsOnTable,
                        body.tookPlayer,
                        body.nextActingPlayer,
                        body.cardsOnTable || this.state.gameDetails.lastTurnCards,
                        body.isLastCardInHand,
                        body.gameIsFinished
                    )
                    if(body.isLastCardInHand && body.tookPlayer){
                        var newGameDetails = this.state.gameDetails
                        newGameDetails.cardsOnTable.push({
                            'cardId': cardId,
                            'playerId': this.Cookies.get('username'),
                            'playerPosition': newGameDetails.myInHandInfo.position,
                            'playerRelativePosition': 0
                        })
                        var putCardIndex = newGameDetails.myInHandInfo.dealtCards.findIndex(el => el.cardId === cardId)
                        var tookPlayerIndex = newGameDetails.players.findIndex(el => el.username === body.tookPlayer)
                        newGameDetails.players[tookPlayerIndex].tookTurns ++
                        newGameDetails.myInHandInfo.dealtCards.splice(putCardIndex, 1)
                        newGameDetails.actionMessage = getText('dealing_cards')
                        this.setState({
                            gameDetails: newGameDetails
                        })
                        setTimeout(function(){
                            window.location.reload();
                        }, 5000)
                    } else {
                        this.newGameStatus();
                    }
                }
            })
        }
    }

    handleBetChange(e) {
        this.setState({myBetSizeValue: e.target.value})
    };

    showScores = () => {
        this.setState({
            scoresModalOpen: true
        })
    }

    exitGame = () => {
        var newModalControls = [
            {
                id: "confirm_exit_game",
                type: "button",
                variant: "text",
                text: getText('exit_game'),
                width: '140px',
                color: 'error',
                disabled: false,
                onSubmit: this.confirmExit
            },
            {
                id: "cancel_exit_game",
                type: "button",
                variant: "contained",
                text: getText('cancel'),
                width: '140px',
                disabled: false,
                onSubmit: this.closeModal
            }
        ]
        this.setState({
            modalControls: newModalControls,
            modalOpen: true,
            modalContentType: 'Exit',
            modalText: getText('confirm_exit'),
            modalCanClose: true
        })
    }

    confirmExit = () => {
        const roomId = this.state.gameDetails.roomId
        const roomName = this.state.gameDetails.roomName
        const username = this.Cookies.get('username')
        this.NagelsApi.disconnectRoom(this.Cookies.get('idToken'), roomId, username)
        .then((body) => {
            if(!body.errors){
                console.log('Emitting event "remove_player_from_room"')
                roomSocket.emit('remove_player_from_room', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
                lobbySocket.emit('decrease_room_players', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
                window.location.assign('/lobby')
            } else {
                this.setState({actionMessage: body.errors[0].message})
            }
        });
    }

    showLastTurnMobile = () => {
        if(this.props.isMobile){ 
            var showLastTurn = this.state.showLastTurn; 
            this.setState({ showLastTurn: !showLastTurn }) 
            setTimeout(function(){
                this.setState({ showLastTurn: showLastTurn })
            }.bind(this), 2000)
        }
    }

    onSelectCard = (e) => {
        const cardId = e.target.getAttribute('cardId').substring(5)
        if(this.state.gameDetails.nextActingPlayer === this.state.gameDetails.myInHandInfo.username && this.state.gameDetails.betsAreMade) {
            this.selectCard(cardId)
        }
    }
    
    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            switch(this.state.modalContentType){
                case 'Bet':
                    this.makeBet();
                break
                case 'Exit':
                    this.confirmExit();
                break
                default:

            }
        }
    };

    handleDeckTypeChange = () => {
        this.NagelsApi.getUser(this.Cookies.get('username'))
        .then((body)=>{
            if(!body.errors) {
                var newUserData = body
                var newUserSettings = this.state.userSettings
                newUserSettings.deckType = newUserSettings.deckType === '4color' ? 'classic' : '4color'
                this.NagelsApi.updateUser(
                    this.Cookies.get('username'), 
                    this.Cookies.get('idToken'), 
                    newUserData.email, 
                    newUserData.aboutMe, 
                    newUserData.colorScheme,
                    newUserSettings.deckType,
                    newUserData.preferredLang
                )
                var currentDate = new Date(); 
                var expiresIn = new Date(currentDate.getTime() + body.expiresIn * 1000)
                this.Cookies.set('deckType', newUserSettings.deckType, { path: '/' , deckType: expiresIn})
                this.setState({userSettings: newUserSettings})
            }
        })
    }

    handleColorSchemeChange = (e) => {
        this.NagelsApi.getUser(this.Cookies.get('username'))
        .then((body)=>{
            if(!body.errors) {
                var newUserData = body
                var newUserSettings = this.state.userSettings
                newUserSettings.colorScheme = e.target.value
                this.NagelsApi.updateUser(
                    this.Cookies.get('username'), 
                    this.Cookies.get('idToken'), 
                    newUserData.email, 
                    newUserData.aboutMe, 
                    newUserSettings.colorScheme,
                    newUserData.deckType,
                    newUserData.preferredLang
                )
                var currentDate = new Date(); 
                var expiresIn = new Date(currentDate.getTime() + body.expiresIn * 1000)
                this.Cookies.set('colorScheme', newUserSettings.colorScheme, { path: '/' , colorScheme: expiresIn})
                this.setState({userSettings: newUserSettings})
                window.location.reload()
            }
        })
    }
    
    componentDidMount = () => {
        this.newGameStatus();

        roomSocket.on("start_game", (data) => {
            if(data.roomId === this.state.gameDetails.roomId){
                window.location.assign('/game/' + data.gameId)
            }
        });

        gameSocket.on('refresh_game_table', (data) => {
            if(parseInt(data.gameId) === parseInt(this.props.match.params.gameId)){
                if(data.actor !== this.Cookies.get('username')){
                    var newGameDetails = this.state.gameDetails
                    var newModalOpen = this.state.modalOpen
                    var newModalControls = this.state.modalControls
                    var newModalText = this.state.modalText
                    var newModalCanClose = this.state.modalCanClose
                    var newScoresModalOpen = this.state.scoresModalOpen
                    var updatedPlayerIndex = -1
                    switch(data.event){
                        case 'define positions':
                            /*newGameDetails.players = data.players
                            newGameDetails.positionsDefined = true
                            newGameDetails.canDeal = true
                            newGameDetails.actionMessage = 'Dealing cards...'
                            this.setState({ gameDetails: newGameDetails })*/
                            this.newGameStatus() // TODO replace whole page refreshing to socket transfer of updated data only
                        break
                        case 'deal cards':
                            this.newGameStatus(); // TODO replace whole page refreshing to socket transfer of updated data only
                        break
                        case 'make bet':
                            updatedPlayerIndex = newGameDetails.players.findIndex(el => el.username === data.actor)
                            newGameDetails.players[updatedPlayerIndex].betSize = data.betSize
                            newGameDetails.nextActingPlayer = data.nextActingPlayer
                            if (updatedPlayerIndex >= 0){
                                if(data.isLastPlayerToBet){
                                    newGameDetails.betsAreMade = data.isLastPlayerToBet
                                    if(data.nextActingPlayer === this.Cookies.get('username')){
                                        newGameDetails.actionMessage = getText('its_your_turn')
                                        newGameDetails.attentionToMessage = true
                                    } else{
                                        newGameDetails.actionMessage = data.nextActingPlayer + getText('-s_turn')
                                    }
                                } else {
                                    if(data.nextActingPlayer === this.Cookies.get('username')){
                                        newGameDetails.actionMessage = getText('its_your_turn')
                                        newGameDetails.attentionToMessage = true
                                        newModalOpen = true
                                        newScoresModalOpen = false
                                        var betPlayers = []
                                        var playersToBet = []
                                        //var sumOfMadeBets = 0
                                        newGameDetails.players.map(player => {
                                            if(player.username !== this.Cookies.get('username')){
                                                if(player.betSize !== null){
                                                    betPlayers.push(player)
                                                    //sumOfMadeBets =+ player.betSize
                                                } else {
                                                    playersToBet.push(player)
                                                }
                                            }
                                        })
                                        newModalControls = newModalControls = [
                                            {
                                                id: "hand_cards",
                                                type: "hand-cards",
                                                cards: newGameDetails.myInHandInfo.dealtCards
                                            },
                                            {
                                                id: "bet_players",
                                                header: getText('made_bets'),
                                                type: "players-bet-info",
                                                players: betPlayers
                                            },
                                            {
                                                id: "bet_size_input",
                                                type: "input",
                                                textFormat: "number",
                                                label: getText('bet_size'),
                                                variant: "outlined",
                                                required: true,
                                                value: this.state.myBetSizeValue,
                                                errorMessage: "",
                                                onChange: this.handleBetChange,
                                                width: '150px',
                                                defaultValue:0
                                            },
                                            {
                                                id: "players_to_bet",
                                                header: getText('players_to_bet'),
                                                type: "players-bet-info",
                                                players: playersToBet
                                            },
                                            {
                                                id: "bet_size_confirm_button",
                                                type: "button",
                                                variant: "contained",
                                                text: getText('confirm'),
                                                width: "195px",
                                                onSubmit: this.makeBet
                                            },
                                            {
                                                id: "scores_view_button",
                                                type: "button",
                                                variant: "outlined",
                                                text: getText('scores'),
                                                width: "195px",
                                                onSubmit: this.showScores
                                            }
                                        ]
                                        newModalText = getText('make_a_bet')
                                        newModalCanClose = false
                                    } else {
                                        newGameDetails.actionMessage = data.nextActingPlayer + getText('is_making_bet')
                                    }
                                }
                                this.setState({
                                    gameDetails: newGameDetails,
                                    modalOpen: newModalOpen,
                                    modalControls: newModalControls,
                                    modalCanClose: newModalCanClose,
                                    modalContentType: 'Bet',
                                    modalText: newModalText,
                                    scoresModalOpen: newScoresModalOpen
                                })
                            }
                        break
                        case "put card":
                            newGameDetails.cardsOnTable = data.cardsOnTable
                            newGameDetails.nextActingPlayer = data.nextActingPlayer
                            var putPlayerIndex = newGameDetails.players.findIndex(el => el.username === data.actor)
                            var newHeaderControls = this.state.headerControls
                            newGameDetails.players[putPlayerIndex].cardsOnHand --
                            if(data.tookPlayer){
                                var tookPlayerIndex = newGameDetails.players.findIndex(el => el.username === data.tookPlayer)
                                if(tookPlayerIndex >= 0){
                                    newGameDetails.players[tookPlayerIndex].tookTurns ++
                                }
                                if(data.tookPlayer === newGameDetails.myInHandInfo.username) {
                                    newGameDetails.myInHandInfo.tookTurns ++
                                }
                                var lastTurnControlIndex = newHeaderControls.findIndex(control=>control.id==='last_turn')
                                var newLastTurnControl = {
                                    id: 'last_turn',
                                    type: 'button',
                                    text: getText('last_turn'),
                                    variant: 'contained',
                                    disabled: newGameDetails.lastTurnCards === [],
                                    size: 'small',
                                    width: '130px',
                                    onSubmit: this.showLastTurnMobile,
                                    onMouseDown: (e) => this.handleLastTurnClick(e),
                                    onMouseUp: (e) => this.handleLastTurnClick(e)
                                }
                                if(lastTurnControlIndex){
                                    newHeaderControls[lastTurnControlIndex] = newLastTurnControl
                                } else {
                                    newHeaderControls.push({newLastTurnControl})
                                }
                                newGameDetails.lastTurnCards = data.lastTurnCards
                            }
                            if(data.isLastCardInHand){
                                if(data.gameIsFinished){
                                    setTimeout(function(){
                                        window.location.reload();
                                    }, 5000)
                                } else {
                                    newGameDetails.actionMessage = getText('dealing_cards')
                                    this.setState({
                                        gameDetails: newGameDetails
                                    })
                                    if(this.Cookies.get('username') === newGameDetails.host){
                                        setTimeout(function(){
                                            window.location.reload();
                                        }, 5000)
                                    }
                                }
                            } else {
                                if(data.nextActingPlayer === this.Cookies.get('username')) {
                                    newGameDetails.actionMessage = getText('its_your_turn')
                                    newGameDetails.attentionToMessage = true
                                } else {
                                    newGameDetails.actionMessage = data.nextActingPlayer + getText('-s_turn')
                                }
                                this.setState({
                                    gameDetails: newGameDetails,
                                    headerControls: newHeaderControls
                                })
                            }
                        break
                        case 'finish':
                            if(data.actor !== this.Cookies.get('username')){
                                window.location.assign('/room/' + data.roomId)
                            }
                        break
                        default:
                            console.log('Received unknown event "' + data.event + '" from game socket')
                        break
                    }
                }
            }
        });
    }

    componentDidUpdate = () => {

        var lastTurnCards = this.state.gameDetails.lastTurnCards
        
        setTimeout(function(){

            if(this.state.gameDetails.cardsOnTable.length === this.state.gameDetails.players.length && lastTurnCards === this.state.gameDetails.lastTurnCards && !this.state.replayMode){
                var newGameDetails = this.state.gameDetails
                newGameDetails.cardsOnTable = []
                this.setState({ gameDetails: newGameDetails })
            }
        }.bind(this), 5000)
    }

    render() {

        var players = this.state.gameDetails.players
        if(this.state.replayMode){
            players = this.state.gameDetails.playedHands[this.state.replayedHand].turns[this.state.replayedTurn].players
        }

        return (
            <div className={`game-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                <SectionHeader
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.headerControls}
                    title={this.state.gameDetails.roomName}
                    subtitle={this.state.gameDetails.host}
                ></SectionHeader>
                <div className={`game-table ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"} ${this.Cookies.get('colorScheme')}`}>
                    {
                        this.state.gameDetails.actionMessage && !this.state.showLastTurn && (!this.props.isMobile || this.props.isPortrait || this.state.gameDetails.cardsOnTable.length === 0) ? 
                        <TableActionMessage
                            isMobile={this.props.isMobile}
                            isDesktop={this.props.isDesktop}
                            isPortrait={this.props.isPortrait}
                            message={this.state.gameDetails.actionMessage}
                            highlighted={this.state.gameDetails.attentionToMessage}
                            allowedSuites={this.state.gameDetails.allowedSuites}
                        >
                        </TableActionMessage>
                        :
                            ''
                    }
                    {
                        this.state.gameDetails.cardsOnTable.length > 0 && !this.state.showLastTurn ?
                            <TablePutCards
                                isMobile={this.props.isMobile}
                                isDesktop={this.props.isDesktop}
                                isPortrait={this.props.isPortrait}
                                cardsOnTable={this.state.replayMode ? this.state.gameDetails.playedHands[this.state.replayedHand].turns[this.state.replayedTurn].turnCards : this.state.gameDetails.cardsOnTable}
                                playersCount={this.state.gameDetails.players.length}
                                myPosition={this.state.gameDetails.myInHandInfo.position ? this.state.gameDetails.myInHandInfo.position : 0}
                            ></TablePutCards>
                        :
                            ''
                    }
                    {
                        this.state.showLastTurn ?
                            <TablePutCards
                                isMobile={this.props.isMobile}
                                isDesktop={this.props.isDesktop}
                                isPortrait={this.props.isPortrait}
                                cardsOnTable={this.state.gameDetails.lastTurnCards.length > 0 ? this.state.gameDetails.lastTurnCards : this.state.gameDetails.cardsOnTable}
                                playersCount={this.state.gameDetails.players.length}
                                isLastTurn={this.state.showLastTurn}
                                myPosition={this.state.gameDetails.myInHandInfo.position ? this.state.gameDetails.myInHandInfo.position : 0}
                            ></TablePutCards>
                        :
                            ''
                    }
                    {
                    players.map(player => {  // TODO consider replacing with forEach
                        if(player.username !== this.Cookies.get('username') || this.state.replayMode) {
                            if(this.state.gameDetails.positionsDefined){
                                return (
                                    <OpponentContainer
                                        key={`player ${player.position} conrainer`}
                                        isMobile={this.props.isMobile}
                                        isDesktop={this.props.isDesktop}
                                        isPortrait={this.props.isPortrait}
                                        cards={player.cardsOnHand}
                                        numberOfPlayers={this.state.gameDetails.players.length}
                                        username={player.username}
                                        position={player.relativePosition}
                                        betSize={player.betSize}
                                        tookTurns={player.tookTurns}
                                        active={this.state.gameDetails.nextActingPlayer === player.username}
                                        isStarter={this.state.gameDetails.handStarter === player.username}
                                    ></OpponentContainer>
                                )
                            }
                        }
                    })}
                    {this.state.gameDetails.positionsDefined && this.state.gameDetails.myInHandInfo.dealtCards && !this.state.replayMode ? 
                        <PlayerContainer
                            isMobile={this.props.isMobile}
                            isDesktop={this.props.isDesktop}
                            isPortrait={this.props.isPortrait}
                            username={this.state.gameDetails.myInHandInfo.username}
                            betSize={this.state.gameDetails.myInHandInfo.betSize}
                            tookTurns={this.state.gameDetails.myInHandInfo.tookTurns}
                            active={this.state.gameDetails.myInHandInfo.username === this.state.gameDetails.nextActingPlayer}
                            dealtCards={this.state.gameDetails.myInHandInfo.dealtCards}
                            selectedCard={this.state.selectedCard}
                            onSelectCard={this.onSelectCard}
                            isStarter={this.Cookies.get('username')===this.state.gameDetails.handStarter}
                        ></PlayerContainer>
                    :
                        ''
                    }
                    {this.state.gameDetails.currentHandId ?
                        <div className={`current-game-trump-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <div className={`hand-id-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>{getText('hand_id')}{this.state.replayMode ? this.state.gameDetails.playedHands[this.state.replayedHand].handSerialNo : this.state.gameDetails.currentHandSerialNo}/{this.state.gameDetails.players.length === 6 ? 16 : 20}</div>
                            <div className={`hand-id-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <p className={`${(this.state.replayMode ? this.state.gameDetails.playedHands[this.state.replayedHand].trump : this.state.gameDetails.trump) || 'x'} trump-container ${this.Cookies.get('deckType') === '4color' ? 'fourcolor' : ''}`}>{this.state.replayMode ? this.state.gameDetails.playedHands[this.state.replayedHand].cards : this.state.gameDetails.cardsPerPlayer}</p>
                            </div>
                        </div>
                    : '' }
                </div>
                
                {!this.props.isMobile ?
                    <div className='game-deck-type-checkbox-container'>
                        <Checkbox
                            key='game-deck-type-checkbox'
                            onChange={this.handleDeckTypeChange}
                            defaultChecked={this.state.userSettings.deckType === "4color"}
                            size='medium'
                            sx={{padding:'5px'}}
                        ></Checkbox>
                        {getText('4_color_deck')}
                    </div>
                :
                    ''
                }
                {!this.props.isMobile ?
                    <div className='game-color-scheme-select-container'>
                    <InputLabel id="color-scheme-label" sx={{fontSize: '0.75rem', textAlign: 'right', marginBottom: '4px'}}>{getText('color_scheme')}</InputLabel>
                        <Select
                            labelId="color-scheme-select-label"
                            id="color-scheme-select"
                            value={this.state.userSettings.colorScheme || 'light'}
                            label={getText('color_scheme')}
                            size='small'
                            sx={{fontSize: 14, width: '100px', textAlign: 'left'}}
                            onChange={this.handleColorSchemeChange}
                        >
                            <MenuItem value='light' sx={{fontSize: 14}}>{getText('light')}</MenuItem>
                            <MenuItem value='dark' sx={{fontSize: 14}}>{getText('dark')}</MenuItem>
                            <MenuItem value='piggy' sx={{fontSize: 14}}>{getText('piggy')}</MenuItem>
                        </Select>
                    </div>
                :
                    ''
                }

                <NagelsModal
                    open={this.state.modalOpen}
                    text={this.state.modalText}
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.modalControls}
                    onKeyPress={this.handleKeyPress}
                    closeModal={this.closeModal}
                    modalCanClose={this.modalCanClose}
                ></NagelsModal>
                <GameScores
                    open={this.state.scoresModalOpen}
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    scoresHeaders={this.state.gameDetails.gameScores.headers}
                    scores={this.state.gameDetails.gameScores.rows}
                    closeModal={this.closeScoresModal}
                ></GameScores>
            </div>
        )
    }
}

