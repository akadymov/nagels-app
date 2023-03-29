import { Manager } from 'socket.io-client';
import configFile from '../config.json'

const env = configFile.ENVIRONMENT

const socketHost = configFile.API.HOST[env]
const socketPort = configFile.API.PORT[env]

const manager = new Manager(socketHost + ':' + socketPort)

const lobbySocket = manager.socket("/lobby", {autoConnect : false});
const roomSocket = manager.socket("/room", {autoConnect : false});
const gameSocket = manager.socket("/game", {autoConnect : false});

export { lobbySocket, roomSocket, gameSocket }