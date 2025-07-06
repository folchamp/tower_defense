"use strict";

class Card {
    constructor(cardData, cardClickCallback) {
        this.cardData = cardData;
        this.cardClickCallback = cardClickCallback;
        this.attached = true;

        // elements
        this.cardContainer = Util.quickElement("cardContainer", "div", document.body);
        this.cardHeaderContainer = Util.quickElement("cardHeaderContainer", "div", this.cardContainer);
        this.cardTextContainer = Util.quickElement("cardTextContainer", "div", this.cardHeaderContainer);
        this.cardImageContainer = Util.quickElement("cardImageContainer", "div", this.cardContainer);
        if (ClientData.images[this.cardData.type]) {
            this.cardImage = new Image();
            this.cardImage.classList = "cardImage";
            this.cardImage.src = ClientData.images[this.cardData.type].src;
            this.cardImageContainer.appendChild(this.cardImage);
        }
        this.cardPriceContainer = Util.quickElement("cardPriceContainer", "div", this.cardContainer);
        this.cardTextContainer.innerHTML = cardData.text;
        this.cardPriceContainer.innerHTML = `${cardData.price}💶`;

        Util.hide(this.cardContainer);

        this.cardContainer.addEventListener("click", (event) => {
            event.stopPropagation();
            this.cardClickCallback(this);
        });

        this.cardContainer.classList.add(this.cardData.action);
    }
    destroy() {
        this.cardContainer.remove();
    }
    appendTo(oldParent) {
        this.oldParent = oldParent;
        this.oldParent.appendChild(this.cardContainer);
    }
    unattach() {
        this.attached = false;
        this.cardContainer.classList.add("unattached");
    }
    attach() {
        if (this.attached === false) {
            this.attached = true;
            this.cardContainer.classList.remove("unattached");
        }
    }
    show() {
        Util.show(this.cardContainer);
    }
    hide() {
        Util.hide(this.cardContainer);
    }
}