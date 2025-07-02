"use strict";

const { ServerData } = require("./ServerData.js");
const { ShopManager } = require("./ShopManager.js");
const { Bullet } = require("../public/common/Bullet.js");
const { Tower } = require("../public/common/Tower.js");
const { Enemy } = require("../public/common/Enemy.js");
const { Util } = require("../public/common/Util.js");

class GameManager {
    constructor(playerManager, broadcast) {
        this.playerManager = playerManager;
        this.broadcast = broadcast;
        this.shopManager = new ShopManager();

        this.reset();
        this.lastTimeStamp = Date.now();
        console.log(`route length : ${this.gameElements.route.length}`);
        setInterval(() => {
            if (this.enemiesLeftToSpawn > 0) {
                this.spawnEnemy();
                this.enemiesLeftToSpawn--;
            }
            this.checkGameLost();
        }, ServerData.ENEMIES_INTERVAL);
        setInterval(() => {
            let now = Date.now();
            let dt = now - this.lastTimeStamp;
            this.lastTimeStamp = now;
            this.checkActionsDone();
            this.enemiesAct(dt);
            this.towersAct(dt);
            this.bulletsAct(dt);
            this.cleanBullets();
            this.cleanTowers();
            this.cleanEnemies();
            this.refreshGameState();
        }, 17); // approx. 1/60 of a second
    }
    sendNextWave() {
        this.drawTime();
        this.drawTime();
        this.refreshPlayerActions()
        this.globalEnemyStrength += ServerData.DIFFICULTY_FACTOR;
        this.enemiesLeftToSpawn = this.globalEnemyStrength;
        this.shopManager.resplenish();
        this.playerManager.refreshPlayerList(); // only refreshes shop when not broadcasted... TODO change this behavior
    }
    reset() {
        this.enemiesLeftToSpawn = 0;
        this.globalEnemyStrength = 0;
        this.gameElements = {
            route: ServerData.ROUTE,
            auras: [],
            towers: [],
            enemies: [],
            bullets: []
        };
        this.hasStarted = false;
        this.isLost = false;
        this.shopManager.reset();
        this.resetNewGameStateElements();
    }
    resetNewGameStateElements() {
        this.newGameStateElements = {
            bullets: [],
            enemies: [],
            towers: [],
            towerIDsToRemove: [],
            enemyIDsToRemove: []
            // bulletsToRemove: []
        }
    }
    checkGameLost() {
        if (this.hasStarted && this.gameElements.towers.length === 0 || this.isLost) {
            console.log("lost");
            this.broadcast({ message: "server_score", score: Math.round(this.globalEnemyStrength) });
            this.reset();
            for (let playerID in this.playerManager.players) {
                let player = this.playerManager.players[playerID];
                player.handData = ServerData.generateInitialHandData();
                player.reset();
                this.sendPlayerGameData(player);
            }
            this.refreshGameState();
            this.playerManager.refreshPlayerList();
        }
    }
    sendPlayerGameData(player) {
        this.broadcast({ message: "server_get_your_game_data_boy", gameElements: this.gameElements, handData: player.handData, recipient: player.playerID });
    }
    refreshGameState() {
        this.broadcast({ message: "server_refresh_game_state", gameElements: this.newGameStateElements });
        this.resetNewGameStateElements();
    }
    giveReward(enemy) {
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            player.money += enemy.enemyData.reward;
        };
        this.playerManager.refreshPlayerList();
    }
    cleanTowers() {
        for (let index = 0; index < this.gameElements.towers.length; index++) {
            const tower = this.gameElements.towers[index];
            tower.targettedBy.forEach((enemy) => {
                if (enemy.reachTurret) {
                    tower.isAlive = false;
                }
            });
            if (!tower.isAlive) {
                tower.targettedBy.forEach((enemy) => {
                    enemy.target = false;
                    enemy.reachTurret = false;
                });
                this.newGameStateElements.towerIDsToRemove.push(this.gameElements.towers[index].towerID);
                if (this.gameElements.towers.length === index + 1) {
                    this.gameElements.towers.pop(); // the tower being analyzed is the last one of the list
                } else {
                    this.gameElements.towers[index] = this.gameElements.towers.pop();
                }
            }
        }
    }
    cleanEnemies() {
        for (let index = 0; index < this.gameElements.enemies.length; index++) {
            const enemy = this.gameElements.enemies[index];
            if (!enemy.isAlive()) {
                this.newGameStateElements.enemyIDsToRemove.push(this.gameElements.enemies[index].enemyID);
                if (this.gameElements.enemies.length === index + 1) {
                    this.gameElements.enemies.pop();
                } else {
                    this.gameElements.enemies[index] = this.gameElements.enemies.pop();
                }
                this.giveReward(enemy);
            }
        }
    }
    cleanBullets() {
        for (let index = 0; index < this.gameElements.bullets.length; index++) {
            const bullet = this.gameElements.bullets[index];
            if (bullet.hit) {
                bullet.isActive = false;
                bullet.target.hit(bullet.bulletData.damage, bullet.bulletData.special);
                // this.newGameStateElements.bulletsToRemove.push(this.gameElements.bullets[index]);
                if (this.gameElements.bullets.length === index + 1) {
                    this.gameElements.bullets.pop();
                } else {
                    this.gameElements.bullets[index] = this.gameElements.bullets.pop();
                }
            }
        }
    }
    bulletsAct(timePassed) {
        this.gameElements.bullets.forEach((bullet) => {
            bullet.move(timePassed);
        });
    }
    towersAct(timePassed) {
        this.gameElements.towers.forEach((tower) => {
            if (tower.hasTarget()) {
                tower.move(timePassed);
            } else {
                tower.setTarget(this.gameElements.enemies[Util.randomValue(0, Math.min(5, this.gameElements.enemies.length))]);
                this.newGameStateElements.towers.push(tower);
            }
            if (tower.stockedBullet) {
                let bullet = new Bullet(Util.copyObject(tower.stockedBullet.position), tower.stockedBullet.target, tower.stockedBullet.bulletData)
                this.gameElements.bullets.push(bullet);
                this.newGameStateElements.bullets.push(bullet);
                tower.stockedBullet = undefined;
                this.newGameStateElements.towers.push(tower);
            }
        });
    }
    enemiesAct(timePassed) {
        this.gameElements.enemies.forEach((enemy) => {
            if (this.gameElements.towers.length > 0 && !enemy.hasTarget()) {
                // TODO reinstate this but with a 128 virtual grid for proximity attack
                // enemy.setTarget(Util.randomFromArray(this.gameElements.towers));
            }
            if (!enemy.hasTarget()) {
                if (enemy.routeCheckPoint === this.gameElements.route.length - 1) {
                    this.isLost = true;
                }
                enemy.direction = this.gameElements.route[enemy.routeCheckPoint];
            }
            enemy.move(timePassed);
        });
    }
    spawnEnemy() {
        let newEnemy = new Enemy(
            Util.copyObject(this.gameElements.route[0]),
            Util.copyObject(this.gameElements.route[0]),
            Util.copyObject(ServerData.enemiesData[Util.randomFromArray(ServerData.enemies)]),
            Util.getNewID());
        newEnemy.enemyData.maxHP = newEnemy.enemyData.maxHP * this.playerManager.getAmountOfPlayers();
        newEnemy.actualHP = newEnemy.enemyData.maxHP;
        this.gameElements.enemies.push(newEnemy);
        this.newGameStateElements.enemies.push(newEnemy);
    }
    drawTime() {
        for (let playerID in this.playerManager.players) {
            this.playerDraw(playerID);
        }
    }
    playerDraw(playerID) {
        let player = this.playerManager.players[playerID];
        let drawnCards = player.draw();
        this.broadcast({ message: "server_draw_cards", recipient: player.playerID, drawnCards: drawnCards });
    }
    refreshPlayerActions() {
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            player.actualAmountOfActions = player.maxAmountOfActions;
        }
        this.playerManager.refreshPlayerList();
    }
    checkActionsDone() {
        let done = true;
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            if (player.actualAmountOfActions !== 0) {
                done = false;
            }
        }
        if (done) {
            // only a new wave refreshes the player actions
            // this.refreshPlayerActions();
        }
    }
    newPlayerArrived(data) {
        let player = this.playerManager.players[data.playerID];
        if (player.handData === undefined) {
            player.handData = ServerData.generateInitialHandData();
        }
        this.sendPlayerGameData(player);
    }
    buy(data) {
        let player = this.playerManager.players[data.playerID];
        let card = this.shopManager.getCard(data.cardData.shopCardID);
        if (player.money >= card.sellprice) {
            player.money -= card.sellprice;
            card.cardID = data.cardData.shopCardID;
            this.shopManager.removeCard(data.cardData.shopCardID);
            player.discard.push(card);
        }
        this.playerManager.refreshPlayerList();
    }
    sell(data) {
        let player = this.playerManager.players[data.playerID];
        let card = data.cardData;
        if (player.hasCard(card)) {
            player.money += card.sellprice;
            player.removeCard(card, true);
        }
        this.playerManager.refreshPlayerList();
        this.broadcast({ message: "server_card_sold", cardID: card.cardID, recipient: player.playerID });
    }
    buySell(data) {
        if (data.type === "buy") {
            this.buy(data);
        }
        if (data.type === "sell") {
            this.sell(data);
        }
    }
    refreshPlayerList(data) {
        // nothing to do here TODO strange way to implement this TODO check
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    useSpaceInControlZone(data) {
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius && aura.auraData.spaceLeft > 0) {
                aura.auraData.spaceLeft--;
            }
        });
    }
    spaceLeftInsideControlZone(data) {
        let spaceLeft = false;
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius && aura.auraData.spaceLeft > 0) {
                spaceLeft = true;
            }
        });
        return spaceLeft;
    }
    isInsideControlZone(data) {
        let isInside = false;
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius) {
                isInside = true;
            }
        });
        return isInside;
    }
    cleanAfterCardSucces(data) {
        let player = this.playerManager.players[data.playerID];
        player.actualAmountOfActions--;
        player.money -= data.cardData.price;
        player.removeCard(data.cardData);
        this.playerManager.refreshPlayerList();
    }
    usePowerCard(data) {
        let player = this.playerManager.players[data.playerID];
        let feedbackMessage = "";
        let success = false;
        if (!player.hasCard(data.cardData)) {
            feedbackMessage = "vous ne possédez pas cette carte";
        } else if (player.actualAmountOfActions < 1) {
            feedbackMessage = "plus d'actions disponibles";
        } else if (data.cardData.price > player.money) {
            feedbackMessage = "pas assez d'argent";
        } else {
            if (data.cardData.type === "gain_money_1") {
                player.money += 350;
            }
            if (data.cardData.type === "draw_two") {
                this.playerDraw(data.playerID);
                this.playerDraw(data.playerID);
            }
            if (data.cardData.type === "fire_rate_up") {
                this.gameElements.towers.forEach((tower) => {
                    if (tower.towerData.bulletData !== undefined) {
                        tower.towerData = Util.copyObject(tower.towerData);
                        tower.towerData.reloadTime = Math.floor(tower.towerData.reloadTime * 0.99);
                    }
                });
            }
            if (data.cardData.type === "damage_up") {
                this.gameElements.towers.forEach((tower) => {
                    if (tower.towerData.bulletData !== undefined) {
                        tower.towerData.bulletData = Util.copyObject(tower.towerData.bulletData);
                        tower.towerData.bulletData.damage += 15;
                    }
                });
            }
            feedbackMessage = "pouvoir utilisé";
            success = true;
            this.cleanAfterCardSucces(data);
        }
        this.broadcast({
            message: "server_card_feedback",
            success: success,
            recipient: player.playerID,
            cardData: data.cardData,
            feedbackMessage: feedbackMessage
        });
    }
    buildTowerHere(data) {
        let feedbackMessage = "";
        let success = false;
        let cardData = data.cardData;
        let position = data.position;
        let player = this.playerManager.players[data.playerID];
        if (player.actualAmountOfActions < 1) {
            feedbackMessage = "plus d'actions disponibles";
        } else if (cardData.price > player.money) {
            feedbackMessage = "pas assez d'argent";
        } else if (cardData.type !== "control_tower" && !this.isInsideControlZone(data)) {
            feedbackMessage = "hors zone de contrôle";
        } else if (!player.hasCard(cardData)) {
            feedbackMessage = "vous ne possédez pas cette carte";
        } else if (cardData.type !== "control_tower" && !this.spaceLeftInsideControlZone(data)) {
            feedbackMessage = "plus de place dans cette zone";
        } else {
            success = true;
            feedbackMessage = "construction validée";
            this.cleanAfterCardSucces(data);
        }
        if (success) {
            let returnData = {};
            let towerData = ServerData.towers[cardData.type];
            let tower = new Tower(cardData, Util.copyObject(towerData), position, player.playerName, Util.getNewID());
            this.gameElements.towers.push(tower);
            if (tower.towerData.auraData !== undefined) {
                tower.towerData.auraData = Util.copyObject(tower.towerData.auraData);
                this.gameElements.auras.push({
                    position: tower.position,
                    auraData: tower.towerData.auraData
                });
            } else {
                tower.towerData.bulletData = Util.copyObject(tower.towerData.bulletData);
                this.useSpaceInControlZone(data);
            }
            returnData.message = "server_construction_successful";
            returnData.tower = tower;
            this.hasStarted = true; // start spawning enemies
            this.broadcast(returnData);
        }
        this.broadcast({
            message: "server_card_feedback",
            success: success,
            recipient: player.playerID,
            cardData: cardData,
            feedbackMessage: feedbackMessage
        });
    }
    listener(data) {
        if (data.message === "client_next_wave") {
            this.sendNextWave(data);
        }
        if (data.message === "server_refreshPlayerList") {
            this.refreshPlayerList(data);
        }
        if (data.message === "client_buildTowerHere") {
            this.buildTowerHere(data);
        }
        if (data.message === "server_new_player_arrived") {
            this.newPlayerArrived(data);
        }
        if (data.message === "client_buy_sell") {
            this.buySell(data);
        }
        if (data.message === "client_power_card") {
            this.usePowerCard(data);
        }
    }
}

exports.GameManager = GameManager;