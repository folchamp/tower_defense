"use strict";

class Card {
    constructor(cardData, cardClickCallback) {
        this.cardData = cardData;
        this.cardClickCallback = cardClickCallback;
        this.attached = true;

        this.cardContainer = Util.quickElement("cardContainer", "div", document.body);
        this.cardHeaderContainer = Util.quickElement("cardHeaderContainer", "div", this.cardContainer);
        this.cardTextContainer = Util.quickElement("cardTextContainer", "div", this.cardHeaderContainer);
        this.cardImageContainer = Util.quickElement("cardImageContainer", "div", this.cardHeaderContainer);
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
        })
    }
    destroy() {
        this.cardContainer.remove();
    }
    appendTo(oldParent) {
        this.oldParent = oldParent;
        this.oldParent.appendChild(this.cardContainer);
    }
    unattach(position) {
        this.attached = false;
        this.cardContainer.classList.add("unattached");
        // document.body.appendChild(this.cardContainer);
        // this.updatePosition(position);
    }
    updatePosition(position) {
        if (this.attached === false) {
            // this.cardContainer.style.left = position.x - ClientData.CARD_WIDTH + "px";
            // this.cardContainer.style.top = position.y + "px";
        }
    }
    attach() {
        if (this.attached === false) {
            this.attached = true;
            // this.oldParent.appendChild(this.cardContainer);
            this.cardContainer.classList.remove("unattached");
            // this.cardContainer.style.left = "0px";
            // this.cardContainer.style.top = "0px";
        }
    }
    show() {
        Util.show(this.cardContainer);
    }
    hide() {
        Util.hide(this.cardContainer);
    }
}