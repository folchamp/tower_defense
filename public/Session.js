"use strict";

class Session {
    constructor() {
        this.playerID = this.fetchPlayerID();
        this.playerName = this.fetchPlayerName();
    }
    fetchPlayerName() {
        let savedPlayerName = Util.getFromLocalStorage("playerName");
        if (savedPlayerName === undefined || savedPlayerName === null) {
            savedPlayerName = "unnamed player";
        }
        this.setPlayerName(savedPlayerName);
        return savedPlayerName;
    }
    fetchPlayerID() {
        let id = Util.getFromLocalStorage("playerID");
        if (id === undefined || id === null) {
            id = Util.getNewID();
            Util.saveToLocalStorage("playerID", id);
        }
        return id;
    }
    setPlayerName(playerName) {
        Util.saveToLocalStorage("playerName", playerName);
        this.playerName = playerName;
    }
    getPlayerName() {
        return this.playerName;
    }
}