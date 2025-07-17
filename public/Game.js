"use strict";

class Game {
    constructor() {
        ClientData.loadImages();

        this.gameElements = {
            drawOrder: ["routes", "auras", "caches", "artifacts", "towers", "enemies", "bullets"],
            auras: [],
            towers: [],
            enemies: [],
            bullets: [],
            artifacts: [],
            caches: [],
            routes: [[{ x: 0, y: 0 }]]
        };
        this.session = new Session();
        this.canvasManager = new CanvasManager(
            ELEMENTS["gameCanvas"],
            this.gameElements,
            (eventType, position) => { return this.canvasMouseCallback(eventType, position); });
        this.shop = new Shop(
            (eventType, cardData) => { return this.shopCallback(eventType, cardData); });
        this.quickFeedback = new QuickFeedback(ELEMENTS["feedbackText"]);
        this.waveNotifier = new WaveNotifier(ELEMENTS["waveNotification"]);
        this.deckDisplayer = new DeckDisplayer();
        this.pingManager = new PingManager((data) => { this.sendPingCallback(data); }, (data) => { this.canvasManager.displayPing(data); });
        this.soundManager = new SoundManager();
        this.rolesManager = new RolesManager();
        this.loreManager = new LoreManager();

        this.loreManager.addLoreElement(
            {
                title: "Cycle inconnu",
                subtitle: "Bastion B633",
                description: "L'humain fut autrefois le maître de l'univers mais quelque chose s'est produit, il y a très longtemps, qui l'a détruit, éparpillé, mis sur la défensive. Aujourd'hui, les bastions humains survivent ci et là contre d'incessantes attaques mi-organiques, mi-robotiques.",
                vrac: "L'huile a tout contaminé. Ils arrivent.",
                imageName: `images/wonder_tower.png`
            }
        );

        this.hand = [];
        this.grabbedCard = undefined;
        this.mousePosition = { x: 0, y: 0 };

        document.body.addEventListener("mousemove", (event) => {
            this.mousePosition.x = event.clientX;
            this.mousePosition.y = event.clientY;
        });

        // document.body.addEventListener("click", (event) => {
        //     this.mouseClick(event);
        // });

        document.body.addEventListener("keydown", (event) => {
            console.log(event.code);
            if (event.code === "Space") {
                if (document.activeElement !== ELEMENTS["playerNameInput"]) {
                    this.readyForNextWave();
                }
            }
            if (event.code === "KeyQ") {
                if (document.activeElement !== ELEMENTS["playerNameInput"]) {
                    this.closeAllPopups();
                    ELEMENTS["cardsContainer"].classList.remove("hidden");
                    ELEMENTS["handButton"].classList.add("selectedMenuElement");
                }
            }
            if (event.code === "KeyW") {
                if (document.activeElement !== ELEMENTS["playerNameInput"]) {
                    this.closeAllPopups();
                    ELEMENTS["shopContainer"].classList.remove("hidden");
                    ELEMENTS["shopButton"].classList.add("selectedMenuElement");
                }
            }
            if (event.code === "KeyE") {
                if (document.activeElement !== ELEMENTS["playerNameInput"]) {
                    this.closeAllPopups();
                    ELEMENTS["multiPlayerInfoContainer"].classList.remove("hidden");
                    ELEMENTS["playersButton"].classList.add("selectedMenuElement");
                }
            }
            if (event.code === "KeyR") {
                if (document.activeElement !== ELEMENTS["playerNameInput"]) {
                    this.closeAllPopups();
                    ELEMENTS["deckDisplayerContainer"].classList.remove("hidden");
                    ELEMENTS["deckDisplayerButton"].classList.add("selectedMenuElement");
                }
            }
            if (event.code === "Escape") {
                this.closeAllPopups();
                this.loreManager.closePopup();
                // this.soundManager.go();
            }
        });

        // MENU BUTTONS
        ELEMENTS["shopButton"].addEventListener("click", (event) => {
            this.closeAllPopups();
            ELEMENTS["shopContainer"].classList.remove("hidden");
            ELEMENTS["shopButton"].classList.add("selectedMenuElement");
        });

        ELEMENTS["playersButton"].addEventListener("click", (event) => {
            this.closeAllPopups();
            ELEMENTS["multiPlayerInfoContainer"].classList.remove("hidden");
            ELEMENTS["playersButton"].classList.add("selectedMenuElement");
        });

        ELEMENTS["handButton"].addEventListener("click", (event) => {
            this.closeAllPopups();
            ELEMENTS["cardsContainer"].classList.remove("hidden");
            ELEMENTS["handButton"].classList.add("selectedMenuElement");
        });

        ELEMENTS["deckDisplayerButton"].addEventListener("click", (event) => {
            this.closeAllPopups();
            ELEMENTS["deckDisplayerContainer"].classList.remove("hidden");
            ELEMENTS["deckDisplayerButton"].classList.add("selectedMenuElement");
        });
        // END MENU BUTTONS

        ELEMENTS["playerNameInput"].value = this.session.getPlayerName();

        ELEMENTS["playerNameInput"].addEventListener("change", (event) => {
            this.changePlayerName();
        });

        ELEMENTS["nextWaveButton"].addEventListener("click", (event) => {
            this.readyForNextWave();
        });

        socket.emit("message", { message: "client_connection", playerID: this.session.playerID, playerName: this.session.getPlayerName() });

        socket.on("message", (data) => {
            let message = data.message;
            if (message === "server_send_roles") {
                this.rolesManager.displayRolesChoice(data);
            }
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
                if (data.win) {
                    alert(`Victoire\nScore : ${data.score}\nVague : ${data.waveCounter}`);
                } else {
                    alert(`Défaite\nScore : ${data.score}\nVague : ${data.waveCounter}`);
                }
            }
            if (message === "server_shop_content") {
                this.shop.refreshShopContent(data.shopContent);
            }
            if (message === "server_card_sold" && this.isForMe(data)) {
                this.cardSold(data);
            }
            if (message === "server_wave_finished") {
                this.waveNotifier.notifyEndWave();
                console.log("wave finished");
            }
            if (message === "server_new_wave") {
                this.newWaveArrives(data);
            }
            if (message === "server_all_your_cards_bro" && this.isForMe(data)) {
                this.deckDisplayer.refreshFullDeckDisplay(data);
            }
            if (message === "server_ping") {
                this.pingManager.displayPing(data);
            }
        });
    }
    sendPingCallback(data) {
        socket.emit("message", {
            message: "client_ping", position: data.position, pingText: data.pingText, sender: this.session.getPlayerName()
        });
    }
    newWaveArrives(data) {
        Util.hide(ELEMENTS["readyDisplayer"]);
        this.waveNotifier.notifyNextWave(data.waveCounter);
        // AUDIO["wave_start"].play();
        console.log("new wave");
    }
    readyForNextWave() {
        Util.show(ELEMENTS["readyDisplayer"]);
        socket.emit("message", { message: "client_next_wave", playerID: this.session.playerID });
        // AUDIO["one_ready1"].play();
    }
    closeAllPopups() {
        ELEMENTS["shopContainer"].classList.add("hidden");
        ELEMENTS["cardsContainer"].classList.add("hidden");
        ELEMENTS["multiPlayerInfoContainer"].classList.add("hidden");
        ELEMENTS["deckDisplayerContainer"].classList.add("hidden");

        ELEMENTS["handButton"].classList.remove("selectedMenuElement");
        ELEMENTS["shopButton"].classList.remove("selectedMenuElement");
        ELEMENTS["playersButton"].classList.remove("selectedMenuElement");
        ELEMENTS["deckDisplayerButton"].classList.remove("selectedMenuElement");
    }
    shopCallback(eventType, cardData) {
        socket.emit("message", { message: "client_buy_sell", type: eventType, cardData: cardData, playerID: this.session.playerID });
    }

    isForMe(data) {
        return data.recipient === this.session.playerID;
    }
    canvasMouseCallback(eventType, position) {
        if (eventType === "click") {
            this.pingManager.closePingSender();
            this.mousePosition = position;
            let offsetPosition = { x: position.x - this.canvasManager.offset.x, y: position.y - this.canvasManager.offset.y };
            if (this.grabbedCard !== undefined) {
                if (this.grabbedCard.cardData.action === "build") {
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
                        position: offsetPosition,
                        playerID: this.session.playerID
                    });
                }
            } else {
                this.gameElements.artifacts.forEach((artifact) => {
                    // ARTIFACTS
                    if (Util.distance(offsetPosition, artifact.position) <= 16) {
                        this.loreManager.addLoreElement(
                            {
                                title: artifact.artifactData.title,
                                subtitle: "",
                                description: artifact.artifactData.description,
                                vrac: "",
                                imageName: `images/${artifact.artifactData.imageName}.png`
                            }
                        );
                        socket.emit("message",
                            { message: "artifact_picked_up", artifactID: artifact.artifactID, playerID: this.session.playerID });
                    }
                });
                this.gameElements.caches.forEach((cache) => {
                    // CACHES
                    if (Util.distance(offsetPosition, cache.position) <= 16) {
                        this.loreManager.addLoreElement(
                            {
                                title: cache.cacheData.title,
                                subtitle: "",
                                description: cache.cacheData.description,
                                vrac: cache.cacheData.cacheEffect,
                                imageName: `images/${cache.imageName}.png`
                            }
                        );
                        socket.emit("message",
                            { message: "cache_picked_up", cacheID: cache.cacheID, playerID: this.session.playerID });
                    }
                });
            }
        }
        if (eventType === "mouseenter") {
            this.mouseInsideCanvas = true;
            if (this.grabbedCard !== undefined) {
                this.canvasManager.mouseDrawData.draw = true;
                this.canvasManager.mouseDrawData.card = this.grabbedCard;
            }
        }
        if (eventType === "mouseleave") {
            this.canvasManager.mouseDrawData.draw = false;
            this.mouseInsideCanvas = false;
        }
        if (eventType === "mousemove") {
            this.canvasManager.mouseDrawData.x = position.x;
            this.canvasManager.mouseDrawData.y = position.y;
        }
        if (eventType === "contextmenu") {
            let offsetPosition = { x: position.x - this.canvasManager.offset.x, y: position.y - this.canvasManager.offset.y };
            this.pingManager.openPingSender(position, offsetPosition);
        }
    }
    cardClickCallback(card) {
        let putCardDown = false;
        if (this.grabbedCard !== undefined) {
            if (card.cardData.cardID === this.grabbedCard.cardData.cardID) {
                putCardDown = true;
            }
            this.grabbedCard.attach();
            this.grabbedCard = undefined;
        }
        if (this.grabbedCard === undefined && !putCardDown) {
            this.grabbedCard = card;
            card.unattach();
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
        this.loreManager.addLoreElement(
            {
                title: `Codename : ${tower.towerData.name.toUpperCase()}`,
                subtitle: tower.towerData.bulletData !== undefined && tower.towerData.bulletData.special !== undefined ? `${JSON.stringify(tower.towerData.bulletData.special)}` : "",
                description: ClientData.towersDescriptions[tower.towerData.name].description,
                vrac: `${ClientData.towersDescriptions[tower.towerData.name].capacity}`,
                imageName: `images/${tower.towerData.name}.png`
            }
        );
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
    refreshPlayerList(data) {
        Util.emptyElement(ELEMENTS["playerList"]);
        data.playerList.forEach((player) => {
            let playerListElement = Util.quickElement("playerListElement", "li", ELEMENTS["playerList"]);
            playerListElement.innerText = `⭐: ${player.actualAmountOfActions}/${player.maxAmountOfActions} || 🪙: ${player.money} || ${player.playerName}`;
            if (player.playerName === this.session.getPlayerName()) {
                ELEMENTS["myResources"].innerHTML = `⭐: ${player.actualAmountOfActions}/${player.maxAmountOfActions} || 🪙: ${player.money}`;
            }
        });
    }
    changePlayerName() {
        const playerName = ELEMENTS["playerNameInput"].value.substring(0, 16);
        socket.emit("message", { message: "client_setPlayerName", playerID: this.session.playerID, playerName: playerName });
        this.session.setPlayerName(playerName);
    }
    refreshGameData(data) {
        this.loreManager.addLoreElement(
            {
                title: data.mapInfo.name,
                subtitle: "",
                description: data.mapInfo.description,
                vrac: "",
                imageName: `images/map.png`
            });
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
        for (let attribute in data.gameElements) {
            this.gameElements[attribute] = data.gameElements[attribute];
        }
        for (let index = 0; index < this.gameElements.enemies.length; index++) {
            const enemyData = this.gameElements.enemies[index];
            const enemy = new Enemy(enemyData.position, enemyData.direction, enemyData.enemyData);
            enemy.load(enemyData);
            this.gameElements.enemies[index] = enemy;
            if (enemy.hit === undefined) {
                // TODO remove this
                console.log("wtf, shouldn't happen");
            }
        }
        for (let index = 0; index < this.gameElements.bullets.length; index++) {
            const bulletData = this.gameElements.bullets[index];
            const bullet = new Bullet()
            bullet.load(bulletData);
            bullet.findTarget(this.gameElements.enemies);
            this.gameElements.bullets[index] = bullet;
        }
    }
    refreshGameState(data) {
        let bullets = data.gameElements.bullets;
        let enemies = data.gameElements.enemies;
        let towers = data.gameElements.towers;
        let artifacts = data.gameElements.artifacts;
        let caches = data.gameElements.caches;
        let towerIDsToRemove = data.gameElements.towerIDsToRemove;
        let enemyIDsToRemove = data.gameElements.enemyIDsToRemove;
        let artifactIDsToRemove = data.gameElements.artifactIDsToRemove;
        let cacheIDsToRemove = data.gameElements.cacheIDsToRemove;
        // towers
        towers.forEach((newTower) => {
            for (let index = 0; index < this.gameElements.towers.length; index++) {
                const tower = this.gameElements.towers[index];
                if (tower.towerID === newTower.towerID) {
                    let newNewTower = new Tower();
                    newNewTower.load(newTower);
                    this.gameElements.towers[index] = newNewTower;
                }
            }
        });
        // enemies
        enemies.forEach((enemyData) => {
            const enemy = new Enemy(enemyData.position, enemyData.direction, enemyData.enemyData);
            enemy.load(enemyData);
            this.gameElements.enemies.push(enemy);
            this.loreManager.addLoreElement(
                {
                    title: ClientData.enemiesDescriptions[enemy.enemyData.name].loreName,
                    subtitle: ClientData.enemiesDescriptions[enemy.enemyData.name].abilities,
                    description: ClientData.enemiesDescriptions[enemy.enemyData.name].description,
                    vrac: `Endurance : ${enemy.enemyData.maxHP} || Récompense : ${enemy.enemyData.reward} ${enemy.enemyData.abilities === undefined ? "" : "<br>" + JSON.stringify(enemy.enemyData.abilities)}`,
                    imageName: `images/${enemy.enemyData.imageName}.png`
                }
            );
        });
        // bullets
        bullets.forEach((bulletData) => {
            const bullet = new Bullet();
            bullet.load(bulletData)
            bullet.findTarget(this.gameElements.enemies);
            this.gameElements.bullets.push(bullet);
        });
        // artifacts
        artifacts.forEach((artifactData) => {
            const artifact = new Artifact(artifactData.artifactData, artifactData.position, artifactData.artifactID);
            artifact.load(artifactData);
            this.gameElements.artifacts.push(artifact);
        });
        // caches
        caches.forEach((cacheData) => {
            const cache = new Cache(cacheData.cacheData, cacheData.position, cacheData.cacheID);
            cache.load(cacheData);
            this.gameElements.caches.push(cache);
        });
        // clean towers
        towerIDsToRemove.forEach((towerIDToRemove) => {
            let indexToRemove;
            for (let index = 0; index < this.gameElements.towers.length; index++) {
                const tower = this.gameElements.towers[index];
                if (tower.towerID === towerIDToRemove) {
                    indexToRemove = index;
                }
            }
            if (indexToRemove !== undefined) {
                this.gameElements.towers.splice(indexToRemove, 1);
            }
        });
        // clean enemies
        enemyIDsToRemove.forEach((enemyIDToRemove) => {
            let indexToRemove;
            for (let index = 0; index < this.gameElements.enemies.length; index++) {
                const enemy = this.gameElements.enemies[index];
                if (enemy.enemyID === enemyIDToRemove) {
                    indexToRemove = index;
                }
            }
            if (indexToRemove !== undefined) {
                console.log("remove enemy");
                this.gameElements.enemies.splice(indexToRemove, 1);
            }
        });
        // clean artifacts
        artifactIDsToRemove.forEach((artifactIDToRemove) => {
            let indexToRemove;
            for (let index = 0; index < this.gameElements.artifacts.length; index++) {
                const artifact = this.gameElements.artifacts[index];
                if (artifact.artifactID === artifactIDToRemove) {
                    indexToRemove = index;
                }
            }
            if (indexToRemove !== undefined) {
                console.log("remove artifact");
                this.gameElements.artifacts.splice(indexToRemove, 1);
            }
        });
        // clean caches
        cacheIDsToRemove.forEach((cacheIDToRemove) => {
            let indexToRemove;
            for (let index = 0; index < this.gameElements.caches.length; index++) {
                const cache = this.gameElements.caches[index];
                if (cache.cacheID === cacheIDToRemove) {
                    indexToRemove = index;
                }
            }
            if (indexToRemove !== undefined) {
                console.log("remove cache");
                this.gameElements.caches.splice(indexToRemove, 1);
            }
        });
        // clean bullets
        this.cleanBullets();
    }
    cleanBullets() {
        // duplicate from server
        for (let index = 0; index < this.gameElements.bullets.length; index++) {
            const bullet = this.gameElements.bullets[index];
            if (bullet.hit) {
                bullet.isActive = false;
                if (bullet.target.hit) { // quick bugfix TODO understand why this bug happens (remove condition to test)
                    bullet.target.hit(bullet.bulletData.damage, bullet.bulletData.special);
                } else {
                }
                if (this.gameElements.bullets.length === index + 1) {
                    this.gameElements.bullets.pop();
                } else {
                    this.gameElements.bullets[index] = this.gameElements.bullets.pop();
                }
            }
        }
    }
}