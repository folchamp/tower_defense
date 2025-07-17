class Shop {
    constructor(callback) {
        this.callback = (eventType, cardData) => {
            if (!this.shopBlocked) {
                callback(eventType, cardData);
            };
        }
        this.shopBlocked = false;
    }
    refreshHandData(hand) {
        Util.emptyElement(ELEMENTS["shopHandContainer"]);
        hand.forEach((card) => {
            let shopCard = new ShopCard(card.cardData, "sell", this.callback);
            shopCard.appendTo(ELEMENTS["shopHandContainer"]);
        });
    }
    refreshShopContent(shopContent) {
        this.shopBlocked = true;
        ELEMENTS["shopContainer"].classList.add("shopBlocked");
        Util.emptyElement(ELEMENTS["shopContentContainer"]);
        shopContent.forEach((cardData) => {
            let shopCard = new ShopCard(cardData, "buy", this.callback);
            shopCard.appendTo(ELEMENTS["shopContentContainer"]);
        });
        setTimeout(() => {
            this.shopBlocked = false;
            ELEMENTS["shopContainer"].classList.remove("shopBlocked");
        }, 1500);
    }
}