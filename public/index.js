"use strict";

const appName = "tower_defense";

const elementNames = [
    "mainMenu",
    "game",
    "about",
    "credits",
    "logs",
    "gameMenuLink",
    "aboutMenuLink",
    "creditsMenuLink",
    "logsMenuLink",
    "logsContainer",
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
    "handContainer"
]

const ELEMENTS = Util.getElements(elementNames);

const socket = io();

const gamePage = new Page("game");
const aboutPage = new Page("about");
const creditsPage = new Page("credits");
const logsPage = new Page("logs");

const menuData = [
    { button: "gameMenuLink", element: "game", page: gamePage },
    { button: "aboutMenuLink", element: "about", page: aboutPage },
    { button: "creditsMenuLink", element: "credits", page: creditsPage },
    { button: "logsMenuLink", element: "logs", page: logsPage }
];

const menu = new Menu(menuData);
const logs = new Logs(ELEMENTS["logsContainer"]);
const game = new Game();

menu.open("game");