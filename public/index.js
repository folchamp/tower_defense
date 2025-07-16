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
    "continueButton",
    "loreListContainer"
]

const audioURLs = {
    loop: "/sounds/loop.wav",
    one_ready1: "/sounds/one_ready1.mp3",
    one_ready2: "/sounds/one_ready2.mp3",
    shot1: "/sounds/shot1.wav",
    shot1: "/sounds/shot1.wav",
    shot1: "/sounds/shot1.wav",
    wave_start: "/sounds/wave_start.mp3",

    echoes: "/music/action/Echoes.mp3",
    frenzy: "/music/action/Frenzy.mp3",
    fury: "/music/action/Fury.mp3",
    hunted: "/music/action/Hunted.mp3",
    rebel: "/music/action/Rebel.mp3",
    rustborn: "/music/action/Rustborn.mp3",
    skies: "/music/action/Skies.mp3",
    void: "/music/action/Void.mp3",
    warriors: "/music/action/Warriors.mp3",
    wasteland: "/music/action/Wasteland.mp3",
    zone: "/music/action/Zone.mp3",

    ash: "/music/peace/Ash.mp3",
    countdown: "/music/peace/Countdown.mp3",
    elegy: "/music/peace/Elegy.mp3",
    forgotten: "/music/peace/Forgotten.mp3",
    graveyard: "/music/peace/Graveyard.mp3",
    ironclad: "/music/peace/Ironclad.mp3",
    light: "/music/peace/Light.mp3",
    machina: "/music/peace/Machina.mp3",
    phantom: "/music/peace/Phantom.mp3",
    remains: "/music/peace/Remains.mp3",
    rust: "/music/peace/Rust.mp3",
    walker: "/music/peace/Walker.mp3",

}

const AUDIO = Util.loadSounds(audioURLs);

const ELEMENTS = Util.getElements(elementNames);

const socket = io();

const game = new Game();