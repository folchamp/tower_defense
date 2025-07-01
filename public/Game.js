"use strict";

class Game {
    constructor() {
        ClientData.loadImages();

        this.gameElements = {
            drawOrder: ["auras", "towers", "enemies", "bullets", "route"],
            auras: [],
            towers: [],
            enemies: [],
            bullets: [],
            route: [{ x: 0, y: 0 }]
        };
        this.session = new Session();
        this.canvasManager = new CanvasManager(
            ELEMENTS["gameCanvas"],
            this.gameElements,
            (eventType, position) => { return this.canvasMouseCallback(eventType, position); });
        this.shop = new Shop(
            (eventType, cardData) => { return this.shopCallback(eventType, cardData); });
        this.quickFeedback = new QuickFeedback(ELEMENTS["feedbackText"]);

        this.hand = [];
        this.grabbedCard = undefined;
        this.mousePosition = { x: 0, y: 0 };

        document.body.addEventListener("mousemove", (event) => {
            this.mousePosition.x = event.clientX;
            this.mousePosition.y = event.clientY;
            if (this.grabbedCard !== undefined) {
                this.grabbedCard.updatePosition(this.mousePosition);
            }
        });

        document.body.addEventListener("click", (event) => {
            this.mouseClick(event);
        });

        ELEMENTS["shopButton"].addEventListener("click", (event) => {
            ELEMENTS["shopContainer"].classList.toggle("hidden");
            ELEMENTS["cardsContainer"].classList.toggle("hidden");
        });

        ELEMENTS["playersButton"].addEventListener("click", (event) => {
            ELEMENTS["cardsContainer"].classList.toggle("hidden");
            ELEMENTS["multiPlayerInfoContainer"].classList.toggle("hidden");
        });

        ELEMENTS["playerNameInput"].value = this.session.getPlayerName();

        ELEMENTS["playerNameInput"].addEventListener("change", (event) => {
            this.changePlayerName();
        });

        ELEMENTS["nextWaveButton"].addEventListener("click", (event) => {
            socket.emit("message", { message: "client_next_wave" });
        });

        socket.emit("message", { message: "client_connection", playerID: this.session.playerID, playerName: this.session.getPlayerName() });

        socket.on("message", (data) => {
            let message = data.message;
            if (message === "server_refreshPlayerList") {
                this.refreshPlayerList(data);
            }
            if (message === "server_get_your_game_data_boy" && this.isForMe(data)) {
                this.refreshGameData(data);
            }
            if (message === "server_card_feedback" && this.isForMe(data)) {
                this.readCardFeedback(data);
            }
            if (message === "server_draw_cards" && this.isForMe(data)) {
                this.drawCards(data);
            }
            if (message === "server_construction_successful") {
                this.constructionSuccessful(data);
            }
            if (message === "server_refresh_game_state") {
                this.refreshGameState(data);
            }
            if (message === "server_score") {
                alert(`Score : ${data.score}`);
            }
            if (message === "server_shop_content") {
                this.shop.refreshShopContent(data.shopContent);
            }
            if (message === "server_card_sold" && this.isForMe(data)) {
                this.cardSold(data);
            }
        });
    }
    shopCallback(eventType, cardData) {
        socket.emit("message", { message: "client_buy_sell", type: eventType, cardData: cardData, playerID: this.session.playerID });
    }
    refreshGameState(data) {
        for (let attribute in data.gameElements) {
            this.gameElements[attribute] = data.gameElements[attribute];
        }
        for (let index = 0; index < this.gameElements.enemies.length; index++) {
            const enemyData = this.gameElements.enemies[index];
            const enemy = new Enemy(enemyData.position, enemyData.direction, enemyData.enemyData);
            enemy.load(enemyData);
            this.gameElements.enemies[index] = enemy;
        }
        for (let index = 0; index < this.gameElements.bullets.length; index++) {
            const bulletData = this.gameElements.bullets[index];
            const bullet = new Bullet()
            bullet.load(bulletData);
            this.gameElements.bullets[index] = bullet;
        }
    }
    isForMe(data) {
        return data.recipient === this.session.playerID;
    }
    mouseClick(event) {
        if (!this.mouseInsideCanvas) {
            if (this.grabbedCard !== undefined) {
                // put card back in hand
                this.grabbedCard.attach();
                this.grabbedCard = undefined;
            }
        }
    }
    canvasMouseCallback(eventType, position) {
        if (eventType === "click") {
            this.mousePosition = position;
            if (this.grabbedCard !== undefined) {
                if (this.grabbedCard.cardData.action === "build") {
                    let offsetPosition = { x: position.x - this.canvasManager.offset.x, y: position.y - this.canvasManager.offset.y };
                    socket.emit("message", {
                        message: "client_buildTowerHere",
                        cardData: this.grabbedCard.cardData,
                        position: offsetPosition,
                        playerID: this.session.playerID
                    });
                } else if (this.grabbedCard.cardData.action === "power") {
                    socket.emit("message", {
                        message: "client_power_card",
                        cardData: this.grabbedCard.cardData,
                        playerID: this.session.playerID
                    });
                }
            }
        }
        if (eventType === "mouseenter") {
            this.mouseInsideCanvas = true;
            if (this.grabbedCard !== undefined) {
                if (this.grabbedCard.cardData.action === "build") {
                    this.canvasManager.mouseDrawData.draw = true;
                    this.canvasManager.mouseDrawData.imageName = this.grabbedCard.cardData.type;
                    // this.grabbedCard.hide();
                }
            }
        }
        if (eventType === "mouseleave") {
            this.canvasManager.mouseDrawData.draw = false;
            this.mouseInsideCanvas = false;
            if (this.grabbedCard !== undefined) {
                // this.grabbedCard.show();
            }
        }
        if (eventType === "mousemove") {
            this.canvasManager.mouseDrawData.x = position.x;
            this.canvasManager.mouseDrawData.y = position.y;
        }
    }
    cardClickCallback(card) {
        if (this.grabbedCard !== undefined) {
            this.grabbedCard.attach();
            this.grabbedCard = undefined;
        }
        if (this.grabbedCard === undefined) {
            this.grabbedCard = card;
            card.unattach(this.mousePosition);
        }
    }
    constructionSuccessful(data) {
        let tower = data.tower;
        this.gameElements.towers.push(tower);
        if (tower.towerData.auraData !== undefined) {
            this.gameElements.auras.push({
                position: tower.position,
                auraData: tower.towerData.auraData
            });
        }
    }
    cardSold(data) {
        console.log("card sold");
        let cardIndexToRemove;
        for (let index = 0; index < this.hand.length; index++) {
            const card = this.hand[index];
            if (card.cardData.cardID === data.cardID) {
                cardIndexToRemove = index;
            }
        }
        this.hand[cardIndexToRemove].destroy(); // remove the card element from DOM
        this.hand.splice(cardIndexToRemove, 1); // remove the card from the hand list
        this.shop.refreshHandData(this.hand);
    }
    readCardFeedback(data) {
        this.quickFeedback.displayFeedback(data.feedbackMessage, this.mousePosition, data.success);
        if (data.success) {
            let cardID = data.cardData.cardID;
            let cardIndexToRemove;
            for (let index = 0; index < this.hand.length; index++) {
                const card = this.hand[index];
                if (card.cardData.cardID === cardID) {
                    cardIndexToRemove = index;
                }
            }
            this.grabbedCard = undefined; // ungrab the card
            this.hand[cardIndexToRemove].attach(); // reset card position (unnessecary)
            this.hand[cardIndexToRemove].destroy(); // remove the card element from DOM
            this.hand.splice(cardIndexToRemove, 1); // remove the card from the hand list
            this.canvasManager.mouseDrawData.draw = false; // stop pre-drawing the newly built tower
            this.shop.refreshHandData(this.hand);
        }
    }
    drawCards(data) {
        data.drawnCards.forEach((cardData) => {
            let card = new Card(cardData, (cardData) => { this.cardClickCallback(cardData); });
            this.hand.push(card);
            card.appendTo(ELEMENTS["handContainer"]);
            card.show();
        });
        this.shop.refreshHandData(this.hand);
    }
    refreshGameData(data) {
        this.hand = [];
        if (this.grabbedCard) {
            this.grabbedCard.attach();
            this.grabbedCard = undefined;
        }
        Util.emptyElement(ELEMENTS["handContainer"]);
        data.handData.forEach((cardData) => {
            let card = new Card(cardData, (cardData) => { this.cardClickCallback(cardData); });
            this.hand.push(card);
            card.appendTo(ELEMENTS["handContainer"]);
            card.show();
        });
        this.shop.refreshHandData(this.hand);
        this.refreshGameState(data);
    }
    refreshPlayerList(data) {
        Util.emptyElement(ELEMENTS["playerList"]);
        data.playerList.forEach((player) => {
            let playerListElement = Util.quickElement("playerListElement", "li", ELEMENTS["playerList"]);
            playerListElement.innerHTML = `⭐: ${player.actualAmountOfActions}/${player.maxAmountOfActions} || 💶: ${player.money} || ${player.playerName}`;
            if (player.playerName === this.session.getPlayerName()) {
                ELEMENTS["myResources"].innerHTML = `⭐: ${player.actualAmountOfActions}/${player.maxAmountOfActions} || 💶: ${player.money}`;
            }
        });
    }
    changePlayerName() {
        const playerName = ELEMENTS["playerNameInput"].value
        socket.emit("message", { message: "client_setPlayerName", playerID: this.session.playerID, playerName: playerName });
        Util.saveToLocalStorage("playerName", playerName);
        this.session.setPlayerName(playerName);
    }
}