class ShopCard {
    constructor(cardData, cardFateType, callback) {
        this.cardData = cardData;
        this.cardFateType = cardFateType;
        this.callback = callback;

        this.buildCard();
    }
    buildCard() {
        this.shopCardContainer = Util.quickElement("shopCardContainer", "div", ELEMENTS["shopHandContainer"]);
        this.shopCardTextContainer = Util.quickElement("shopCardTextContainer", "span", this.shopCardContainer);
        this.sellBuyButton = Util.quickElement("sellBuyButton", "button", this.shopCardContainer);
        this.shopCardTextContainer.innerHTML = `${this.cardData.text}<br>💶: ${this.cardData.sellprice}`;
        if (this.cardFateType === "buy") {
            this.sellBuyButton.innerHTML = "acheter";
        } else if (this.cardFateType === "sell") {
            this.sellBuyButton.innerHTML = "vendre";
        }
        this.sellBuyButton.addEventListener("click", (event) => {
            this.callback(this.cardFateType, this.cardData);
        });
        // Util.hide(this.shopCardContainer);
    }
    appendTo(element) {
        element.appendChild(this.shopCardContainer);
    }
}