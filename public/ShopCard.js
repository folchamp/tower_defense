class ShopCard {
    constructor(cardData, cardFateType, callback) {
        this.cardData = cardData;
        this.cardFateType = cardFateType;
        this.callback = callback;

        this.buildCard();
    }
    buildCard() {
        this.shopCardContainer = Util.quickElement("shopCardContainer", "div", ELEMENTS["shopHandContainer"]);
        this.shopCardHeaderContainer = Util.quickElement("cardHeaderContainer", "div", this.shopCardContainer);
        this.shopCardTextContainer = Util.quickElement("shopCardTextContainer", "span", this.shopCardHeaderContainer);
        this.cardImageContainer = Util.quickElement("cardImageContainer", "div", this.shopCardHeaderContainer);
        if (ClientData.images[this.cardData.type]) {
            this.cardImage = new Image();
            this.cardImage.classList = "cardImage";
            this.cardImage.src = ClientData.images[this.cardData.type].src;
            this.cardImageContainer.appendChild(this.cardImage);
        }
        this.shopCardPriceContainer = Util.quickElement("shopCardPriceContainer", "span", this.shopCardContainer);
        // this.sellBuyButton = Util.quickElement("sellBuyButton", "button", this.shopCardContainer);
        this.shopCardTextContainer.innerHTML = `${this.cardData.text}`;
        this.shopCardPriceContainer.innerHTML = `${this.cardData.sellprice}💶`;
        if (this.cardFateType === "buy") {
            // this.sellBuyButton.innerHTML = "acheter";
        } else if (this.cardFateType === "sell") {
            // this.sellBuyButton.innerHTML = "vendre";
        }
        this.shopCardContainer.addEventListener("click", (event) => {
            this.callback(this.cardFateType, this.cardData);
        });
        this.shopCardContainer.classList.add(this.cardData.action);

    }
    appendTo(element) {
        element.appendChild(this.shopCardContainer);
    }
}