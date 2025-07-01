class Shop {
    constructor(callback) {
        this.callback = callback;
    }
    refreshHandData(hand) {
        Util.emptyElement(ELEMENTS["shopHandContainer"]);
        hand.forEach((card) => {
            let shopCard = new ShopCard(card.cardData, "sell", this.callback);
            shopCard.appendTo(ELEMENTS["shopHandContainer"]);
        });
    }
    refreshShopContent(shopContent) {
        Util.emptyElement(ELEMENTS["shopContentContainer"]);
        shopContent.forEach((cardData) => {
            let shopCard = new ShopCard(cardData, "buy", this.callback);
            shopCard.appendTo(ELEMENTS["shopContentContainer"]);
        });
    }
}