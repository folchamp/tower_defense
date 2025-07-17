"use strict";

const { ServerData } = require("./ServerData");

class ShopManager {
    constructor() {
        // this.reset();
    }
    resplenish() {
        let temporaryShop = ServerData.generateShopContent();
        for (let index = 0; index < ServerData.SHOP_SHIFT; index++) {
            this.shopContent.shift();
        }
        while (this.shopContent.length < ServerData.SHOP_SIZE) {
            this.shopContent.push(temporaryShop.pop());
        }
    }
    reset() {
        this.shopContent = ServerData.generateShopContent();
    }
    removeCard(cardID) {
        let indexFound;
        for (let index = 0; index < this.shopContent.length; index++) {
            let cardData = this.shopContent[index];
            if (cardData.shopCardID === cardID) {
                indexFound = index;
            }
        }
        if (indexFound === undefined) {
            console.log("card not found");
        } else {
            this.shopContent.splice(indexFound, 1);
        }
    }
    getCard(cardID) {
        let cardToReturn;
        this.shopContent.forEach((cardData) => {
            if (cardData.shopCardID === cardID) {
                cardToReturn = cardData;
            }
        });
        if (cardToReturn === undefined) {
            console.log("card not found");
        }
        return cardToReturn;
    }
}

exports.ShopManager = ShopManager;