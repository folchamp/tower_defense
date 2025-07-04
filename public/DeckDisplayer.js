"use strict";

class DeckDisplayer {
    constructor() {

    }
    refreshFullDeckDisplay(data) {
        // console.log(data);
        let hand = data.allCards.hand;
        let deck = data.allCards.deck;
        let discard = data.allCards.discard;
        let string = "";
        hand.forEach((card) => {
            string += `${card.text}<br>`;
        });
        ELEMENTS["deckDisplayerHandContainer"].innerHTML = string;
        string = "";
        deck.forEach((card) => {
            string += `${card.text}<br>`;
        });
        ELEMENTS["deckDisplayerDeckContainer"].innerHTML = string;
        string = "";
        discard.forEach((card) => {
            string += `${card.text}<br>`;
        });
        ELEMENTS["deckDisplayerDiscardContainer"].innerHTML = string;
    }
}