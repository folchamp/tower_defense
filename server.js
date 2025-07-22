"use strict";

const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { PlayerManager } = require("./server/PlayerManager.js");
const { CommunicationManager } = require("./server/CommunicationManager.js");
const { GameManager } = require("./server/GameManager.js");

const app = express();
const server = createServer(app);
const io = new Server(server);

const communicationManager = new CommunicationManager(io);
const broadcast = communicationManager.getBroadcastMethod();

const playerManager = new PlayerManager(broadcast);
const gameManager = new GameManager(playerManager, broadcast);

communicationManager.addListener((data) => { playerManager.listener(data); });
communicationManager.addListener((data) => { gameManager.listener(data); });

app.use(express.static("public"));

server.listen(80, () => {
    console.log("server running at http://localhost:80");
});

// const my_socket = io.sockets.sockets.get('YnwlYH-gCKT2K9jEAAAu');