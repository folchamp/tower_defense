"use strict";

const { ServerData } = require("./ServerData");
const { Util } = require("../public/common/Util.js");

class Player {
    constructor(playerName, playerID, socketID) {
        this.playerName = playerName;
        this.playerID = playerID;
        this.socketID = socketID;
        this.connected = false;
        this.reset();
    }
    reset() {
        this.maxAmountOfActions = ServerData.MAX_AMOUNT_OF_ACTIONS;
        this.actualAmountOfActions = this.maxAmountOfActions;
        this.money = ServerData.STARTING_MONEY;
        this.deck = [];
        this.discard = [];
        // hand is reset somewhere else
    }
    draw() {
        let cardsToReturn = [];
        if (this.handData.length < ServerData.HAND_SIZE) {
            if (this.deck.length === 0) {
                while (this.discard.length) {
                    this.deck.push(this.discard.pop());
                }
                Util.shuffle(this.deck);
            }
            if (this.deck.length > 0) {
                let drawnCard = this.deck.pop();
                this.handData.push(drawnCard);
                cardsToReturn.push(drawnCard);
            }
        }
        return cardsToReturn;
    }
    hasCard(cardData) {
        // console.log(cardData);
        let hasGivenCard = false;
        if (this.handData) {
            this.handData.forEach((posessedCardData) => {
                if (posessedCardData.cardID === cardData.cardID) {
                    hasGivenCard = true;
                    for (let attribute in cardData) {
                        // console.log(`${cardData[attribute]} === ${posessedCardData[attribute]}`);
                        if (cardData[attribute] !== posessedCardData[attribute]) {
                            hasGivenCard = false;
                        }
                    }
                }
            })
        }
        if (!hasGivenCard) {
            console.log(`cards don't match, the player doesn't have the card`);
        }
        return hasGivenCard;
    }
    removeCard(cardData, isDefinitive) {
        let indexToRemove;
        for (let index = 0; index < this.handData.length; index++) {
            const posessedCardData = this.handData[index];
            if (posessedCardData.cardID === cardData.cardID) {
                indexToRemove = index;
            }
        }
        if (indexToRemove !== undefined) {
            this.handData.splice(indexToRemove, 1);
            if (!isDefinitive) {
                this.discard.push(cardData);
            } else {
                console.log("card sold");
            }
        }
    }
}

exports.Player = Player;