"use strict";

class PlayerListManager {
    constructor(callback) {
        this.callback = callback;
    }
    refreshPlayerList(data, you) {
        Util.emptyElement(ELEMENTS["playerList"]);
        data.playerList.forEach((player) => {
            // let playerListElement = Util.quickElement("playerListElement", "li", ELEMENTS["playerList"]);
            Util.quickStructure(["playerListElementLi", "playerListNameText", "playerGiveMoneyButton"], ELEMENTS["playerList"], this);
            this.playerListNameText.innerText = `⭐: ${player.actualAmountOfActions}/${player.maxAmountOfActions} || 🪙: ${player.money} || ${player.playerName}`;
            this.playerGiveMoneyButton.innerHTML = "donner 100🪙";
            if (player.playerName === you) {
                ELEMENTS["myResources"].innerHTML = `⭐: ${player.actualAmountOfActions}/${player.maxAmountOfActions} || 🪙: ${player.money}`;
            }
            this.playerGiveMoneyButton.addEventListener("click", (event) => {
                this.callback(player.playerName);
            });
        });
    }
}