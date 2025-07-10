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
    "waveNotification",
    "deckDisplayerContainer",
    "deckDisplayerButton",
    "deckDisplayerHandTitle",
    "deckDisplayerHandContainer",
    "deckDisplayerDeckTitle",
    "deckDisplayerDeckContainer",
    "deckDisplayerDiscardTitle",
    "deckDisplayerDiscardContainer",
    "gameHeader",
    "readyDisplayer",
    "pingSendContainer",
    "infoPopupContainer",
    "infoPopupBigTitle",
    "infoPopupSubtitle",
    "infoPopupDescription",
    "infoPopupVrac",
    "infoPopupCloseButton",
    "infoPopupImage",
    "continueButton"
]

const ELEMENTS = Util.getElements(elementNames);

const socket = io();

const game = new Game();