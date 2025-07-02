"use strict";

const appName = "tower_defense";

const elementNames = [
    "game",
    "playerNameContainer",
    "playerNameInput",
    "playerList",
    "cardsContainer",
    "gameCanvas",
    "feedbackText",
    "shopButton",
    "multiPlayerInfoContainer",
    "playersButton",
    "myResources",
    "shopHandContainer",
    "shopContainer",
    "shopContentContainer",
    "nextWaveButton",
    "fullscreenButton",
    "handButton",
    "handContainer",
    "waveNotification"
]

const ELEMENTS = Util.getElements(elementNames);

const socket = io();

const game = new Game();