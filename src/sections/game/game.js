import React from 'react';

import './game.css'

//Local services
import Cookies from 'universal-cookie';
import NigelsApi from '../../services/nigels-api-service';
import { lobbySocket, roomSocket, gameSocket } from '../../services/socket';

//Local components
import SectionHeader from '../../components/section-header';
import PlayerContainer from '../../components/player-container';
import OpponentContainer from '../../components/opponent-container';
import NigelsModal from '../../components/nigels-modal';
import TableActionMessage from '../../components/table-action-message';
import TablePutCards from '../../components/table-put-cards';
import GameScores from '../../components/game-scores';

export default class Game extends React.Component{

    constructor(props) {
        super(props);
        this.handleBetChange = this.handleBetChange.bind(this);
        this.selectCard = this.selectCard.bind(this);
        this.state = {
            gameDetails: {
                gameId: null,
                roomId: null,
                roomName: null,
                host: null,
                positionsDefined: false,
                canDeal: false,
                actionMessage: '',
                attentionToMessage: false,
                gameScores: [],
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
    NigelsApi = new NigelsApi();

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
        this.setState({gameDetails: newGameDetails})
    }

    newGameStatus = () => {
        // get game status
        var newHeaderControls = []
        var newModalControls = []
        this.NigelsApi.getGame(this.props.match.params.gameId, this.Cookies.get('idToken'))
        .then((getGameResponse) => {
            if(getGameResponse.errors){
                this.handleApiError(getGameResponse)
            } else {
                if(getGameResponse.canDeal && getGameResponse.autodeal && this.state.gameDetails.host === this.Cookies.get('username')){
                    this.dealCards()
                } else {
                    newHeaderControls = [
                        {
                            id: 'scores',
                            type: 'button',
                            text: 'Scores',
                            variant: 'outlined',
                            disabled: false,
                            size: 'small',
                            width: '130px',
                            onSubmit: this.showScores
                        },
                        {
                            id: 'refresh',
                            type: 'button',
                            text: 'Refresh',
                            variant: 'outlined',
                            disabled: false,
                            size: 'small',
                            width: '130px',
                            onSubmit: this.newGameStatus
                        },
                        {
                            id: 'exit',
                            type: 'button',
                            text: getGameResponse.host === this.Cookies.get('username') ? 'Finish' : 'Exit',
                            variant: 'contained',
                            disabled: false,
                            size: 'small',
                            width: '130px',
                            color: 'error',
                            onSubmit: getGameResponse.host === this.Cookies.get('username') ? this.finishGame : (getGameResponse.myInHandInfo.username ? this.exitGame : ()=> window.location.assign('/lobby'))
                        }
                    ]
                    if (getGameResponse.host === this.Cookies.get('username')){
                        newHeaderControls.push({
                            id: 'shuffle',
                            type: 'button',
                            text: 'Shuffle',
                            variant: 'contained',
                            disabled: getGameResponse.positionsDefined,
                            size: 'small',
                            width: '130px',
                            onSubmit: this.definePositions
                        })
                        /*newHeaderControls.push({
                            id: 'deal',
                            type: 'button',
                            text: 'Deal',
                            variant: 'contained',
                            disabled: !getGameResponse.canDeal,
                            size: 'small',
                            width: '130px',
                            onSubmit: this.dealCards
                        })*/
                        if(!getGameResponse.positionsDefined){
                            getGameResponse.attentionToMessage = true
                            getGameResponse.actionMessage = 'Press "SHUFFLE" button in game controls to define players positions in game and deal cards'
                        }
                        if(getGameResponse.canDeal){
                            getGameResponse.attentionToMessage = true
                            getGameResponse.actionMessage = 'Press "DEAL" button in game controls to deal cards in hand'
                        }
                    }
                    if(getGameResponse.lastTurnCards.length > 0) {
                        newHeaderControls.push({
                            id: 'last_turn',
                            type: 'button',
                            text: 'Last turn',
                            variant: 'contained',
                            disabled: getGameResponse.lastTurnCards === [],
                            size: 'small',
                            width: '130px',
                            onMouseDown: (e) => this.handleLastTurnClick(),
                            onMouseUp: (e) => this.handleLastTurnClick()
                        })
                    }
                    if(getGameResponse.nextActingPlayer === this.Cookies.get('username') && !getGameResponse.betsAreMade){
                        newModalControls = [
                            {
                                id: "bet_size_input",
                                type: "input",
                                textFormat: "number",
                                label: "bet size",
                                required: true,
                                variant: "outlined",
                                value: this.state.myBetSizeValue,
                                errorMessage: "",
                                onChange: this.handleBetChange,
                                width: '5px',
                                defaultValue:0
                            },
                            {
                                id: "bet_size_confirm_button",
                                type: "button",
                                variant: "contained",
                                text: "Confirm",
                                onSubmit: this.makeBet
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
                        modalText: "Make a bet",
                        modalCanClose: false,
                        modalContentType: 'Bet'
                    })
                    /*if(getGameResponse.players.length === getGameResponse.cardsOnTable.length){
                        setTimeout(this.utilizeCards(getGameResponse.currentHandId, getGameResponse.nextActingPlayer), 3000)
                    }*/
                }
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
                variant: "contained",
                text: "Finish game",
                width: '140px',
                color: 'error',
                disabled: false,
                onSubmit: this.confirmFinishGame
            },
            {
                id: "cancel_finish_game",
                type: "button",
                variant: "contained",
                text: "Cancel",
                width: '140px',
                disabled: false,
                onSubmit: this.closeModal
            }
        ]
        this.setState({
            modalControls: newModalControls,
            modalOpen: true,
            modalText: "Please, confirm finishing the game",
            modalCanClose: true,
            modalContentType: 'Finish'
        })
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
        this.NigelsApi.finishGame(this.Cookies.get('idToken'))
        .then((body) => {
            if(body.errors){
                this.handleInGameError(body)
            } else {
                gameSocket.emit('finish_game_in_room', this.Cookies.get('username'), gameId, roomId);
                this.setState({actionMessage: 'Game #' + gameId + ' was successfully finished!'})
                window.location.assign('/room/' + roomId)
            }
        });
    }

    dealCards = () => {
        this.NigelsApi.dealCards(this.props.match.params.gameId, this.Cookies.get('idToken'))
        .then((body) => {
            if(body.errors) {
                this.handleInGameError(body)
            } else{
                gameSocket.emit('deal_cards', this.props.match.params.gameId)
                this.newGameStatus();
            }
        });
    };

    makeBet = () => {
        this.NigelsApi.makeBet(this.Cookies.get('idToken'), this.state.gameDetails.gameId, this.state.gameDetails.currentHandId, parseInt(this.state.myBetSizeValue,10))
        .then((body) => {
            if(body.errors) {
                var newModalControls = this.state.modalControls
                newModalControls[0].errorMessage = body.errors[0].message
                this.setState({
                    modalControls: newModalControls
                })
            } else {
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
        this.NigelsApi.definePositions(this.props.match.params.gameId, this.Cookies.get('idToken'))
        .then((body) => {
            if(body.errors) {
                this.handleInGameError(body)
            } else {
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
            this.NigelsApi.putCard(
                this.Cookies.get('idToken'),
                this.state.gameDetails.gameId,
                this.state.gameDetails.currentHandId,
                cardId
            )
            .then((body) => {
                if(body.errors) {
                    this.handleInGameError(body)
                } else {
                    gameSocket.emit(
                        'put_card', 
                        this.props.match.params.gameId,
                        this.state.gameDetails.currentHandId,
                        this.Cookies.get('username'),
                        body.cardsOnTable,
                        body.tookPlayer,
                        body.nextActingPlayer,
                        body.isLastCardInHand
                    )
                    this.newGameStatus();
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
                variant: "contained",
                text: "Exit game",
                width: '140px',
                color: 'error',
                disabled: false,
                onSubmit: this.confirmExit
            },
            {
                id: "cancel_exit_game",
                type: "button",
                variant: "contained",
                text: "Cancel",
                width: '140px',
                disabled: false,
                onSubmit: this.closeModal
            }
        ]
        this.setState({
            modalControls: newModalControls,
            modalOpen: true,
            modalContentType: 'Exit',
            modalText: "Please, confirm exit",
            modalCanClose: true
        })
    }

    confirmExit = () => {
        const roomId = this.state.gameDetails.roomId
        const roomName = this.state.gameDetails.roomName
        const username = this.Cookies.get('username')
        this.NigelsApi.disconnectRoom(this.Cookies.get('idToken'), roomId, username)
        .then((body) => {
            if(!body.errors){
                roomSocket.emit('remove_player_from_room', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
                lobbySocket.emit('decrease_room_players', this.Cookies.get('username'), username, roomId, roomName, body.connectedUsers)
                window.location.assign('/lobby')
            } else {
                this.setState({actionMessage: body.errors[0].message})
            }
        });
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
    
    componentDidMount = () => {
        this.newGameStatus()

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
                            if (updatedPlayerIndex >= 0){
                                newGameDetails.players[updatedPlayerIndex].betSize = data.betSize
                                newGameDetails.nextActingPlayer = data.nextPlayerToBet
                                if(data.isLastPlayerToBet){
                                    newGameDetails.betsAreMade = data.isLastPlayerToBet
                                    newGameDetails.nextActingPlayer = data.nextActingPlayer
                                    if(data.nextActingPlayer === this.Cookies.get('username')){
                                        newGameDetails.actionMessage = "It's your turn now"
                                        newGameDetails.attentionToMessage = true
                                    } else{
                                        newGameDetails.actionMessage = data.nextActingPlayer + "'s turn..."
                                    }
                                } else {
                                    if(data.nextActingPlayer === this.Cookies.get('username')){
                                        newGameDetails.actionMessage = "It's your turn now"
                                        newGameDetails.attentionToMessage = true
                                        newModalOpen = true
                                        newScoresModalOpen = false
                                        newModalControls = newModalControls = [
                                            {
                                                id: "bet_size_input",
                                                type: "input",
                                                textFormat: "number",
                                                label: "bet size",
                                                variant: "outlined",
                                                required: true,
                                                value: this.state.myBetSizeValue,
                                                errorMessage: "",
                                                onChange: this.handleBetChange,
                                                width: '5px',
                                                defaultValue:0
                                            },
                                            {
                                                id: "bet_size_confirm_button",
                                                type: "button",
                                                variant: "contained",
                                                text: "Confirm",
                                                onSubmit: this.makeBet
                                            }
                                        ]
                                        newModalText = "Make a bet"
                                        newModalCanClose = false
                                    } else {
                                        newGameDetails.actionMessage = data.nextActingPlayer + ' is making bet...'
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
                        case 'put card':
                            newGameDetails.cardsOnTable = data.cardsOnTable
                            newGameDetails.nextActingPlayer = data.nextActingPlayer
                            if(data.isLastCardInHand){
                                this.newGameStatus()
                            } else {
                                var tookPlayerIndex = newGameDetails.players.findIndex(el => el.username === data.tookPlayer)
                                if(data.tookPlayerIndex >= 0){
                                    newGameDetails.players[tookPlayerIndex].tookTurns ++
                                }
                                if(data.tookPlayer === newGameDetails.myInHandInfo.username) {
                                    newGameDetails.myInHandInfo.tookTurns ++
                                }
                                if(data.nextActingPlayer === this.Cookies.get('username')) {
                                    newGameDetails.actionMessage = "It's your turn now"
                                    newGameDetails.attentionToMessage = true
                                } else {
                                    newGameDetails.actionMessage = data.nextActingPlayer + "'s turn..."
                                }
                                this.setState({
                                    gameDetails: newGameDetails
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

    /*componentDidUpdate = () => {
        if(this.state.handDetails.cardsOnTable.length === this.state.gameDetails.players.length){
            var newHandDetails = this.state.handDetails
            setTimeout(function(){
                newHandDetails.cardsOnTable = []
                this.setState({ handDetails: newHandDetails })
            }.bind(this), 3000)
        }
    }*/


    render() {
        
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
                <div className={`game-table ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                    {
                        this.state.gameDetails.actionMessage && (!this.props.isMobile || this.props.isPortrait || this.state.gameDetails.cardsOnTable.length === 0) ? 
                        <TableActionMessage
                            isMobile={this.props.isMobile}
                            isDesktop={this.props.isDesktop}
                            isPortrait={this.props.isPortrait}
                            message={this.state.gameDetails.actionMessage}
                            highlighted={this.state.gameDetails.attentionToMessage}
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
                                cardsOnTable={this.state.gameDetails.cardsOnTable}
                                playersCount={this.state.gameDetails.players.length}
                            ></TablePutCards>
                        :
                            ''
                    }
                    {
                        this.state.gameDetails.lastTurnCards.length > 0 && this.state.showLastTurn ?
                            <TablePutCards
                                isMobile={this.props.isMobile}
                                isDesktop={this.props.isDesktop}
                                isPortrait={this.props.isPortrait}
                                cardsOnTable={this.state.gameDetails.lastTurnCards}
                                playersCount={this.state.gameDetails.players.length}
                            ></TablePutCards>
                        :
                            ''
                    }
                    {
                    this.state.gameDetails.players.map(player => {  // TODO consider replacing with forEach
                        if(player.username !== this.Cookies.get('username')) {
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
                                    ></OpponentContainer>
                                )
                            }
                        }
                    })}
                    {this.state.gameDetails.positionsDefined && this.state.gameDetails.myInHandInfo.dealtCards ? 
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
                        ></PlayerContainer>
                    :
                        ''
                    }
                    {this.state.gameDetails.currentHandId ?
                        <div className={`current-game-trump-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <div className={`hand-id-label ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>Hand #{this.state.gameDetails.currentHandSerialNo}/20</div>
                            <div className={`hand-id-value ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                                <p className={`${this.state.gameDetails.trump || 'x'} trump-container`}>{this.state.gameDetails.cardsPerPlayer}</p>
                            </div>
                        </div>
                    : '' }
                </div>
                
                <NigelsModal
                    open={this.state.modalOpen}
                    text={this.state.modalText}
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.modalControls}
                    onKeyPress={this.handleKeyPress}
                    closeModal={this.closeModal}
                    modalCanClose={this.modalCanClose}
                ></NigelsModal>
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

