"use strict";

const { Player } = require("./Player.js")

class PlayerManager {
    constructor(broadcast) {
        this.broadcast = broadcast;
        this.players = {};
        this.amountOfPlayers = 0;
    }
    getAmountOfPlayers() {
        return this.amountOfPlayers;
    }
    countAmountOfPlayers() {
        let count = 0;
        for (let playerID in this.players) {
            count++;
        }
        this.amountOfPlayers = count;
        console.log(`${count} players active`);
    }
    disconnect(socketID) {
        console.log(socketID);
        for (let playerID in this.players) {
            console.log(this.players[playerID].socketID);
            if (this.players[playerID].socketID === socketID) {
                this.players[playerID].connected = false;
                console.log(`${this.players[playerID].playerName} disconnected`);
            }
        }
        this.countAmountOfPlayers();
        this.refreshPlayerList();
    }
    connect(playerID, socketID, playerName) {
        if (this.players[playerID] === undefined) {
            this.players[playerID] = new Player(playerName, playerID, socketID);
        }
        this.players[playerID].connected = true;
        this.broadcast({ message: "server_new_player_arrived", playerID: playerID, socketID: socketID });
        console.log(`${playerName} connected`);
        this.countAmountOfPlayers();
        this.refreshPlayerList();
    }
    setPlayerName(playerID, playerName) {
        this.players[playerID].playerName = playerName;
        this.refreshPlayerList();
    }
    listener(data) {
        if (data.message === "client_disconnect") {
            this.disconnect(data.socketID);
        };
        if (data.message === "client_connection") {
            this.connect(data.playerID, data.socketID, data.playerName);
        };
        if (data.message === "client_setPlayerName") {
            this.setPlayerName(data.playerID, data.playerName);
        };
    }
    refreshPlayerList() {
        this.broadcast({ message: "server_refreshPlayerList", playerList: this.getPlayerList() });
    }
    getPlayerList() {
        let playerList = [];
        for (let playerID in this.players) {
            let player = this.players[playerID];
            if (player.connected) {
                playerList.push({
                    playerName: player.playerName,
                    actualAmountOfActions: player.actualAmountOfActions,
                    maxAmountOfActions: player.maxAmountOfActions,
                    money: player.money,
                    socketID: player.socketID
                });
            }
        };
        return playerList;
    }
}

exports.PlayerManager = PlayerManager;