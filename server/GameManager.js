"use strict";

const { Maps } = require("./Maps.js");
const { ServerData } = require("./ServerData.js");
const { ShopManager } = require("./ShopManager.js");
const { Artifact } = require("../public/common/Artifact.js");
const { Cache } = require("../public/common/Cache.js");
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
        setInterval(() => {
            if (this.enemiesLeftToSpawn > 0) {
                this.spawnEnemy();
                this.enemiesLeftToSpawn--;
            } else if (!this.waveFinished && this.gameElements.enemies.length === 0) {
                this.waveFinished = true;
                this.broadcast({ message: "server_wave_finished" });
                if (this.waveCounter === 2) {
                    this.askRoles(true);
                }
                if (this.waveCounter === 4) {
                    this.askRoles(false);
                }
            }
        }, ServerData.ENEMIES_INTERVAL);
        setTimeout(() => {
            this.lastTimeStamp = Date.now();
            this.loop();
        }, 2000);
    }
    loop() {
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
        this.checkGameLost();
        this.checkGameWon();

        // try to stay as close as possible to 17ms
        this.timeLost += (dt - 17);
        this.timeToWinThisTime = Math.min(7, 17 - this.timeLost); // 7 is arbitrary to not make two loops too close

        setTimeout(() => {
            this.loop();
        }, 17 - this.timeToWinThisTime);
    }
    ecoTowersAct() {
        this.gameElements.towers.forEach((tower) => {
            if (tower.towerData.moneyPerWave !== undefined) {
                for (let playerID in this.playerManager.players) {
                    let player = this.playerManager.players[playerID];
                    player.money += Math.round(tower.towerData.moneyPerWave / this.playerManager.getAmountOfPlayers());
                }
            }
        });
    }
    calcEnemiesThisWave() {
        let wavePointsLeft = Math.round(this.waveCounter - 1);
        let lastEnemyNumber = Math.min(this.waveCounter, ServerData.enemies.length - 1);
        let enemies = [ServerData.enemies[lastEnemyNumber]];
        while (wavePointsLeft > 0) {
            let enemyNumber = Util.randomValue(0, lastEnemyNumber);
            enemies.push(ServerData.enemies[enemyNumber]);
            wavePointsLeft -= enemyNumber;
        }
        return enemies;
    }
    startWave() {
        this.forcestartCounterStarted = false;
        // TODO calc enemies
        // end calc enemies
        this.ecoTowersAct();
        this.playerManager.setEveryoneUnready();
        this.waveCounter++;
        this.broadcast({ message: "server_new_wave", waveCounter: this.waveCounter });
        this.waveFinished = false;
        this.refreshPlayerActions()
        this.drawTime();
        this.drawTime();
        this.drawTime();
        this.globalEnemyStrength += ServerData.DIFFICULTY_FACTOR + this.waveCounter * 1;
        this.enemiesToFightThisWave = this.calcEnemiesThisWave();
        this.enemiesLeftToSpawn = this.globalEnemyStrength;
        // this.enemiesLeftToSpawn = 7;
        this.shopManager.resplenish();
        this.playerManager.refreshPlayerList();
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
        if (this.wonderBuilt) {
            this.spawnEnemy("boss_enemy");
        }
    }
    sendNextWave(data) {
        this.playerManager.setReady(data.playerID);
        if (this.waveFinished === true && (this.playerManager.isEveryoneReady())) {
            this.startWave();
        } else if (!this.forcestartCounterStarted && this.waveFinished) {
            this.forcestartCounterStarted = true;
            this.broadcast({ message: "server_start_ready_counter" });
            setTimeout(() => {
                if (this.waveFinished && this.forcestartCounterStarted) {
                    this.startWave();
                }
            }, 16000);
        }
    }
    reset() {
        let randomCacheFactor = Util.randomValue(0, 100);
        this.cleanRoles();
        this.mapNumber = Util.randomValue(0, Maps.allMaps.length - 1);
        console.log(`Map number : ${this.mapNumber}`);
        this.timeLost = 0;
        this.enemiesLeftToSpawn = 0;
        this.globalEnemyStrength = 0;
        this.gameElements = {
            routes: Maps.allMaps[this.mapNumber],
            auras: [],
            towers: [],
            enemies: [],
            bullets: [],
            artifacts: [],
            caches: []
        };

        for (let index = 0; index < 3; index++) {
            this.gameElements.caches.push(
                new Cache(
                    ServerData.caches[(index + randomCacheFactor) % ServerData.caches.length],
                    ServerData.cachePositions[index],
                    Util.getNewID()));
        }
        this.roles = [];
        this.forcestartCounterStarted = false;
        this.hasStarted = false;
        this.isLost = false;
        this.shopManager.reset();
        this.resetNewGameStateElements();
        this.waveFinished = true;
        this.waveCounter = 0;
        this.wonderBuilt = false;
        this.bossKilled = false;
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            player.handData = ServerData.generateInitialHandData();
            player.reset();
            this.sendPlayerGameData(player);
        }
        this.refreshGameState();
        this.playerManager.refreshPlayerList();
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    resetNewGameStateElements() {
        this.newGameStateElements = {
            bullets: [],
            enemies: [],
            towers: [],
            artifacts: [],
            caches: [],
            auras: [],
            towerIDsToRemove: [],
            enemyIDsToRemove: [],
            artifactIDsToRemove: [],
            cacheIDsToRemove: []
        }
    }
    checkGameWon() {
        if (this.wonderBuilt && this.waveFinished && this.bossKilled) {
            console.log("won");
            this.broadcast({ message: "server_score", win: true, score: Math.round(this.globalEnemyStrength), waveCounter: this.waveCounter });
            this.reset();
        }
    }
    checkGameLost() {
        if ((this.hasStarted && this.gameElements.towers.length === 0) || this.isLost) {
            console.log("lost");
            this.broadcast({ message: "server_score", win: false, score: Math.round(this.globalEnemyStrength), waveCounter: this.waveCounter });
            this.reset();
        }
    }
    sendPlayerGameData(player) {
        this.broadcast({ message: "server_get_your_game_data_boy", mapInfo: Maps.mapDescriptions[this.mapNumber], gameElements: this.gameElements, handData: player.handData, recipient: player.playerID, role: player.roleName });
        this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    refreshGameState() {
        this.broadcast({ message: "server_refresh_game_state", gameElements: this.newGameStateElements });
        this.resetNewGameStateElements();
    }
    giveReward(enemy) {
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            player.money += Math.max(0, enemy.enemyData.reward - (this.waveCounter));
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
    randomizePosition(newEnemy) {
        newEnemy.position.x += Util.randomValue(-20, 20);
        newEnemy.position.y += Util.randomValue(-20, 20);
    }
    cleanEnemies() {
        for (let index = 0; index < this.gameElements.enemies.length; index++) {
            const enemy = this.gameElements.enemies[index];
            if (!enemy.isAlive()) {
                if (enemy.hasAbility("summon_minions")) {
                    for (let index = 0; index < 4; index++) {
                        this.spawnEnemyHere("swarm_enemy", enemy);
                    }
                }
                if (enemy.hasAbility("summon_drones")) {
                    for (let index = 0; index < 2; index++) {
                        this.spawnEnemyHere("drone_enemy", enemy);
                    }
                }
                if (enemy.enemyData.name === "boss_enemy") {
                    this.bossKilled = true;
                }
                this.newGameStateElements.enemyIDsToRemove.push(this.gameElements.enemies[index].enemyID);
                if (this.gameElements.enemies.length === index + 1) {
                    this.gameElements.enemies.pop();
                } else {
                    this.gameElements.enemies[index] = this.gameElements.enemies.pop();
                }
                if (Util.randomValue(0, ServerData.ARTIFACT_SPAWN_CHANCE) === 0) {
                    let newArtifact = new Artifact(Util.copyObject(Util.randomFromArray(ServerData.artifacts)), Util.copyObject(enemy.position), Util.getNewID());
                    this.gameElements.artifacts.push(newArtifact);
                    this.newGameStateElements.artifacts.push(newArtifact);
                }
                this.giveReward(enemy);
            }
        }
    }
    cleanBullets() {
        for (let index = 0; index < this.gameElements.bullets.length; index++) {
            const bullet = this.gameElements.bullets[index];
            if (bullet.hit) {

                if (bullet.hasSpecial("chain_lightning")) {
                    let chosenEnemy;
                    let tooFar = true;
                    if (bullet.lightningCounter === undefined) {
                        bullet.lightningCounter = 0;
                    }
                    for (let index = 0; this.gameElements.enemies.length > 0 && index < ServerData.SMART_AIM && chosenEnemy === undefined && tooFar; index++) {
                        chosenEnemy = this.getRandomEnemy();
                        tooFar = Util.distance(bullet.position, chosenEnemy.position) > ServerData.CHAIN_LIGHTNING_RANGE;
                    }
                    if (chosenEnemy !== undefined && !tooFar && bullet.lightningCounter <= 3) {
                        let newBullet = new Bullet(Util.copyObject(bullet.position), chosenEnemy, bullet.bulletData)
                        newBullet.lightningCounter = bullet.lightningCounter + 1;
                        this.gameElements.bullets.push(newBullet);
                        this.newGameStateElements.bullets.push(newBullet);
                    }
                }
                if (bullet.target.hasAbility("summons_on_hit")) {
                    this.spawnEnemyHere("mini_enemy", bullet.target);
                }
                bullet.target.hit(bullet.bulletData.damage, bullet.bulletData.special);
                bullet.isActive = false;
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
    getRandomEnemy() {
        return Util.randomFromArray(this.gameElements.enemies);
    }
    towersAct(timePassed) {
        this.gameElements.towers.forEach((tower) => {
            // TODO change fire_tower and ice_tower with hasIceBullets and hasFireBullets
            if (!tower.hasTarget() ||
                tower.hasSpecial("fire") ||
                tower.hasSpecial("ice") ||
                tower.hasSpecial("poison") ||
                Util.distance(tower.position, tower.target.position) > tower.towerData.range ||
                tower.hasBigDamage()) {
                let chosenEnemy = undefined;
                let tooFar = true;
                tower.loseTarget(); // in case the enemy gets out of range
                for (let index = 0; this.gameElements.enemies.length > 0 && index < ServerData.SMART_AIM && chosenEnemy === undefined && tooFar; index++) {
                    chosenEnemy = this.getRandomEnemy();
                    tooFar = Util.distance(tower.position, chosenEnemy.position) > tower.towerData.range;
                    // chosenEnemy = this.getRandomEnemy();
                }
                if (chosenEnemy !== undefined && !tooFar) {
                    tower.setTarget(chosenEnemy);
                }
                if (tower.hasTarget()) {
                    this.newGameStateElements.towers.push(tower);
                }
            }
            tower.move(timePassed);
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
                if (enemy.routeCheckPoint >= this.gameElements.routes[enemy.routeID].length - 1) {
                    this.isLost = true;
                }
                enemy.direction = this.gameElements.routes[enemy.routeID][enemy.routeCheckPoint];
            }
            if (enemy.hasAbility("summoner") && Math.random() > ServerData.SUMMON_CHANCE) {
                this.spawnEnemyHere("brute_enemy", enemy);
            }
            enemy.move(timePassed);
        });
    }
    spawnEnemyHere(enemyName, summoner) {
        let newEnemy = this.spawnEnemy(enemyName);
        newEnemy.position.x = summoner.position.x;
        newEnemy.position.y = summoner.position.y;
        newEnemy.routeCheckPoint = summoner.routeCheckPoint;
        newEnemy.routeID = summoner.routeID;
        this.randomizePosition(newEnemy);
    }
    spawnEnemy(enemyName) {
        let newEnemyType
        if (enemyName !== undefined) {
            newEnemyType = enemyName;
        } else {
            // newEnemyType = ServerData.enemies[Util.randomValue(Math.max(0, this.waveCounter - 3), Math.min(this.waveCounter - 1, ServerData.enemies.length - 1))];
            newEnemyType = Util.randomFromArray(this.enemiesToFightThisWave);
        }

        // if (this.temporaryEnemySpawnedYet === undefined) {
        //     this.temporaryEnemySpawnedYet = true;
        //     newEnemyType = "quick_enemy";

        let routeID = Util.randomValue(0, this.gameElements.routes.length - 1);
        let newEnemy = new Enemy(
            Util.copyObject(this.gameElements.routes[routeID][0]),
            Util.copyObject(this.gameElements.routes[routeID][0]),
            Util.copyObject(ServerData.enemiesData[newEnemyType]),
            Util.getNewID());
        newEnemy.routeID = routeID;
        newEnemy.enemyData.maxHP = newEnemy.enemyData.maxHP * this.playerManager.getAmountOfPlayers();
        newEnemy.actualHP = newEnemy.enemyData.maxHP;
        newEnemy.enemyData.speed += (this.waveCounter / 500);
        if (newEnemy.hasAbility("fly")) {
            newEnemy.routeCheckPoint = this.gameElements.routes[newEnemy.routeID].length - 2;
        }
        this.gameElements.enemies.push(newEnemy);
        this.newGameStateElements.enemies.push(newEnemy);
        return newEnemy;
        // }
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
        this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    refreshPlayerActions() {
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            if (player.roleName.includes("guetteur")) {
                player.money += player.actualAmountOfActions * 50;
            }
            if (player.roleName.includes("observateur") && player.actualAmountOfActions === 2) {
                this.playerDraw(player.playerID);
            }
            if (player.roleName.includes("constructeur")) {
                player.money += player.handData.length * 20;
            }
            player.actualAmountOfActions = player.maxAmountOfActions;
        }
        this.playerManager.refreshPlayerList();
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
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
        this.generateRoles(player);
    }
    generateRoles(player) {
        Util.shuffle(ServerData.roles);
        player.roles = [this.createRole(0), this.createRole(1), this.createRole(2)];
        player.rolesTwo = [this.createRole(3), this.createRole(4), this.createRole(5)];
        this.roles = [...this.roles, ...player.roles, ...player.rolesTwo];
        this.sendPlayerGameData(player);
    }
    createRole(index) {
        let role = Util.copyObject(ServerData.roles[index]);
        role.roleID = Util.getNewID();
        return role;
    }
    sendRoles(player, roles) {
        console.log(roles);
        this.broadcast({ message: "server_send_roles", recipient: player.playerID, roles: roles });
    }
    cleanRoles() {
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            player.roles = undefined;
            player.rolesTwo = undefined;
            player.roleName = [];
            this.generateRoles(player);
        }
    }
    askRoles(isFirst) {
        for (let playerID in this.playerManager.players) {
            let player = this.playerManager.players[playerID];
            if (isFirst) {
                this.sendRoles(player, player.roles);
            } else {
                this.sendRoles(player, player.rolesTwo);
            }
        }
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
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    sell(data) {
        let player = this.playerManager.players[data.playerID];
        let card = data.cardData;
        if (player.hasCard(card)) {
            player.money += card.sellprice;
            player.removeCard(card, true);
            if (player.roleName.includes("investisseur")) {
                player.money += 50;
            }
            if (player.roleName.includes("marchand")) {
                this.playerDraw(data.playerID);
                player.actualAmountOfActions++;
            }
        }
        this.playerManager.refreshPlayerList();
        this.broadcast({ message: "server_card_sold", cardID: card.cardID, recipient: player.playerID });
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    buySell(data) {
        let player = this.playerManager.players[data.playerID];
        if (data.type === "buy") {
            this.buy(data);
        }
        if (data.type === "sell") {
            this.sell(data);
        }
        this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    refreshPlayerList(data) {
        // nothing to do here 
    }
    useSpaceInControlZone(data) {
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius && aura.auraData.spaceLeft > 0) {
                aura.auraData.spaceLeft--;
                if (aura.auraData.spaceLeft <= 0) {
                    this.newGameStateElements.auras.push(aura);
                }
            }
        });
    }
    isLastTower(data) {
        let isLast = false;
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius && aura.auraData.spaceLeft === 1) {
                isLast = true;
            }
        });
        return isLast;
    }
    spaceLeftInsideControlZone(data) {
        let spaceLeft = false;
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius && aura.auraData.spaceLeft > 0) {
                spaceLeft = true;
            }
        });
        if (data.cardData.type === "tiring_tower") {
            spaceLeft = true;
        }
        return spaceLeft;
    }
    isInsideControlZone(data) {
        let isInside = false;
        this.gameElements.auras.forEach((aura) => {
            if (aura.auraData.type === "control" && Util.distance(aura.position, data.position) < aura.auraData.auraRadius) {
                isInside = true;
            }
        });
        if (data.cardData.type === "tiring_tower") {
            isInside = true;
        }
        return isInside;
    }
    cleanAfterCardSucces(data) {
        let player = this.playerManager.players[data.playerID];
        if (!(player.roleName.includes("observateur") && data.cardData.action === "power")) {
            player.actualAmountOfActions--;
        }
        player.money -= data.cardData.price;
        player.removeCard(data.cardData);
        this.playerManager.refreshPlayerList();
        this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
        this.broadcast({ message: "server_shop_content", shopContent: this.shopManager.shopContent });
    }
    targetsControlTower(data) {
        let targets = false;
        this.gameElements.towers.forEach((tower) => {
            if (tower.cardData.type === "control_tower" && Util.distance(tower.position, data.position) <= 16) {
                targets = true;
            }
        });
        return targets;
    }
    getTargettedControlTower(data) {
        let target;
        this.gameElements.towers.forEach((tower) => {
            if (tower.cardData.type === "control_tower" && Util.distance(tower.position, data.position) <= 16) {
                target = tower;
            }
        });
        return target;
    }
    getTowerDataFromAura(controlTower) {
        // also remove the towers ?
        let data = { reloadTime: 9999, range: 0, damage: 0, speed: 0.01, color: "blue", size: 2, special: [], towerSize: 24, initialAngle: Math.PI / 2 };
        this.gameElements.towers.forEach((tower) => {
            if (Util.distance(tower.position, controlTower.position) <= controlTower.towerData.auraData.auraRadius && controlTower.towerID !== tower.towerID && !tower.hasSpecial("tiring")) {
                tower.isAlive = false;
                if (tower.towerData.reloadTime !== undefined && tower.towerData.reloadTime < data.reloadTime) {
                    data.reloadTime = tower.towerData.reloadTime;
                    data.totalTimePassed = tower.towerData.reloadTime;
                }
                if (tower.towerData.range !== undefined && tower.towerData.range > data.range) {
                    data.range = tower.towerData.range;
                }
                if (tower.towerData.bulletData !== undefined) {
                    data.damage += tower.towerData.bulletData.damage;
                    if (tower.towerData.bulletData.speed !== undefined && tower.towerData.bulletData.speed > data.speed) {
                        data.speed = tower.towerData.bulletData.speed;
                    }
                    if (tower.towerData.bulletData.size !== undefined && tower.towerData.bulletData.size > data.size) {
                        data.size = tower.towerData.bulletData.size;
                    }
                    if (tower.towerData.bulletData.special !== undefined) {
                        data.special.push(...tower.towerData.bulletData.special);
                    }
                }
            }
        });
        data.size++; // for sports
        return data
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
        } else if (data.cardData.type === "upgrade_control" && !this.targetsControlTower(data)) {
            feedbackMessage = "pas sur une tour de contrôle"
        } else {
            if (data.cardData.type === "upgrade_control") {
                let controlTower = this.getTargettedControlTower(data);
                let newTowerData = this.getTowerDataFromAura(controlTower); // also removes the towers ?
                controlTower.totalTimePassed = newTowerData.totalTimePassed;
                controlTower.towerData.name = "upgraded_control_tower";
                controlTower.towerData.reloadTime = newTowerData.reloadTime;
                controlTower.towerData.range = newTowerData.range;
                controlTower.towerData.size = newTowerData.towerSize;
                controlTower.towerData.initialAngle = newTowerData.initialAngle;
                // controlTower.towerData.name = "upgraded_control_tower";
                controlTower.towerData.bulletData = {
                    damage: Math.min(newTowerData.damage, ServerData.MAX_DAMAGE),
                    speed: newTowerData.speed,
                    color: newTowerData.color,
                    size: newTowerData.size,
                    special: newTowerData.special
                };
                this.newGameStateElements.towers.push(controlTower);
            }
            if (data.cardData.type === "everyone_draws") {
                this.drawTime();
                if (player.roleName.includes("archiviste")) {
                    this.playerDraw(data.playerID);
                }
            }
            if (data.cardData.type === "new_shop") {
                this.shopManager.reset();
            }
            if (data.cardData.type === "gain_money_3") {
                player.money += 50;
            }
            if (data.cardData.type === "gain_money_1") {
                player.money += 300;
            }
            if (data.cardData.type === "gain_money_2") {
                player.money += 600;
            }
            // if (data.cardData.type === "gain_all") {
            //     player.money += 100;
            //     this.playerDraw(data.playerID);
            //     player.actualAmountOfActions += 1;
            // }
            if (data.cardData.type === "draw_two") {
                this.playerDraw(data.playerID);
                this.playerDraw(data.playerID);
                if (player.roleName.includes("archiviste")) {
                    this.playerDraw(data.playerID);
                }
            }
            if (data.cardData.type === "three_actions") {
                player.actualAmountOfActions += 3;
            }
            // if (data.cardData.type === "fire_rate_up") {
            //     this.gameElements.towers.forEach((tower) => {
            //         if (tower.towerData.bulletData !== undefined) {
            //             tower.towerData = Util.copyObject(tower.towerData);
            //             tower.towerData.reloadTime = Math.floor(tower.towerData.reloadTime * 0.99);
            //         }
            //     });
            // }
            // if (data.cardData.type === "damage_up") {
            //     this.gameElements.towers.forEach((tower) => {
            //         if (tower.towerData.bulletData !== undefined) {
            //             tower.towerData.bulletData = Util.copyObject(tower.towerData.bulletData);
            //             tower.towerData.bulletData.damage += 15;
            //         }
            //     });
            // }
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
        } else if (cardData.type === "control_tower" && this.isInsideControlZone(data)) {
            feedbackMessage = "zone déjà contrôlée";
        } else {
            success = true;
            feedbackMessage = "construction validée";
            if (player.roleName.includes("mécanicien") && this.isLastTower(data)) {
                player.money += 150;
            }
            if (player.roleName.includes("constructeur")) {
                this.playerDraw(player.playerID);
            }
            this.cleanAfterCardSucces(data);
        }
        if (success) {
            let returnData = {};
            let towerData = ServerData.towers[cardData.type];
            let tower = new Tower(cardData, Util.copyObject(towerData), position, player.playerName, Util.getNewID());
            if (player.roleName.includes("mécanicien") && tower.towerData.name === "control_tower") {
                tower.towerData.auraData = Util.copyObject(tower.towerData.auraData);
                tower.towerData.auraData.spaceLeft = 3;
                tower.towerData.auraData.auraColor = "orange";
            }
            if (player.roleName.includes("ingénieur") && tower.towerData.name === "control_tower") {
                tower.towerData.auraData = Util.copyObject(tower.towerData.auraData);
                tower.towerData.auraData.spaceLeft = 7;
                tower.towerData.auraData.auraColor = "red";
            }
            if (tower.towerData.name === "tiring_tower") {
                tower.totalTimePassed = 50000;
            }
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
            if (cardData.type === "wonder_tower") {
                this.wonderBuilt = true;
            }
        }
        this.broadcast({
            message: "server_card_feedback",
            success: success,
            recipient: player.playerID,
            cardData: cardData,
            feedbackMessage: feedbackMessage
        });
    }
    pickArtifactUp(data) {
        let player = this.playerManager.players[data.playerID];
        let artifactID = data.artifactID;
        let indexToRemove;
        for (let id in this.gameElements.artifacts) {
            if (this.gameElements.artifacts[id].artifactID === artifactID) {
                indexToRemove = id;
            }
        }
        if (indexToRemove !== undefined) {
            this.gameElements.artifacts.splice(indexToRemove, 1);
            this.newGameStateElements.artifactIDsToRemove.push(artifactID);
            let cardData = { action: "power", text: "Artefact (50🪙)", type: "gain_money_3", price: 1, sellprice: 250 };
            if (player.roleName.includes("investisseur")) {
                player.handData.push(this.newCard(cardData));
            } else {
                player.discard.push(this.newCard(cardData));
            }
            this.broadcast({ message: "server_get_your_game_data_boy", mapInfo: Maps.mapDescriptions[this.mapNumber], gameElements: this.gameElements, handData: player.handData, recipient: player.playerID, role: player.roleName });
            this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
        } else {
            console.log("artifact not found");
        }
    }
    newCard(card) {
        card.cardID = Util.getNewID();
        if (card.action === "build") {
            card.range = ServerData.towers[card.type].range;
        }
        return card;
    }
    pickCacheUp(data) {
        let player = this.playerManager.players[data.playerID]
        this.gameElements.caches.forEach((cache) => {
            if (data.cacheID === cache.cacheID && cache.status === "closed") {
                cache.open();
                this.newGameStateElements.caches.push(cache);
                this.playerDraw(player.playerID);
                this.playerDraw(player.playerID);
                player.actualAmountOfActions += 2;
                this.playerManager.refreshPlayerList();
                this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
            }
        });
    }
    giveMoney(data) {
        // { message: "client_give_money", playerID: this.session.playerID, moneyReceiver: playerName }
        let receiver = undefined;
        let sender = this.playerManager.players[data.playerID];
        for (let receiverID in this.playerManager.players) {
            if (this.playerManager.players[receiverID].playerName === data.moneyReceiver) {
                receiver = this.playerManager.players[receiverID];
            }
        }
        if (receiver !== undefined && sender !== undefined && sender.money >= 100) {
            sender.money -= 100;
            receiver.money += 100;
            this.playerManager.refreshPlayerList();
        }
    }
    setRole(data) {
        let newRole = false;
        let newRoleName;
        let player = this.playerManager.players[data.playerID];
        player.roles.forEach((role) => {
            if (role.roleID === data.roleID) {
                newRole = true;
                console.log(`YOU ARE ${role.roleName} NOW`);
                player.roleName.push(role.roleName);
                player.roles = [role];
                newRoleName = role.roleName;
            }
        });
        player.rolesTwo.forEach((role) => {
            if (role.roleID === data.roleID) {
                newRole = true;
                console.log(`YOU ARE ${role.roleName} NOW`);
                player.roleName.push(role.roleName);
                player.rolesTwo = [role];
                newRoleName = role.roleName;
            }
        });
        if (newRole) {
            if (newRoleName === "ingénieur") {
                player.discard.push(this.newCard({ action: "build", subType: "support", text: "Tour de contrôle", type: "control_tower", price: 500, sellprice: 0 }));
            }
            if (newRoleName === "guetteur") {
                player.discard.push(this.newCard({ action: "power", text: "+3⭐", type: "three_actions", price: 100, sellprice: 200 }));
                player.discard.push(this.newCard({ action: "power", text: "+3⭐", type: "three_actions", price: 100, sellprice: 200 }));
            }
            if (newRoleName === "improvisateur") {
                player.discard.push(this.newCard(Util.copyObject(Util.randomFromArray(ServerData.shopCardsData))));
                player.discard.push(this.newCard(Util.copyObject(Util.randomFromArray(ServerData.shopCardsData))));
                player.money += 1200;
            }
            if (newRoleName === "banquier") {
                player.discard.push(this.newCard({ action: "build", subType: "support", text: "Banque", type: "bank_tower", price: 400, sellprice: 0 }));
                player.discard.push(this.newCard({ action: "power", text: "+300🪙", type: "gain_money_1", price: 100, sellprice: 0 }));
            }
            if (newRoleName === "réserviste") {
                player.discard.push(this.newCard({ action: "build", text: "Tour de secours", type: "tiring_tower", price: 0, sellprice: 0 }));
                player.discard.push(this.newCard({ action: "build", text: "Tour sniper", type: "sniper_tower", price: 1200, sellprice: 0 }));
            }
            if (newRoleName === "stratège") {
                player.discard.push(this.newCard({ action: "power", text: "+2🎴", type: "draw_two", price: 100, sellprice: 0 }));
                player.maxAmountOfActions = 4;
                player.actualAmountOfActions++;
                this.playerManager.refreshPlayerList();
            }
            if (newRoleName === "archiviste") {
                player.discard.push(this.newCard({ action: "power", text: "pioche pour tous", type: "everyone_draws", price: 0, sellprice: 0 }));
            }
            if (newRoleName === "éclaireur") {
                player.discard.push(this.newCard({ action: "build", subType: "support", text: "Micro-agence", type: "micro_agence_tower", price: 0, sellprice: 0 }));
                player.handData.forEach((card) => {
                    if (card.basic) {
                        card.price -= 50;
                    }
                });
                player.discard.forEach((card) => {
                    if (card.basic) {
                        card.price -= 50;
                    }
                });
                player.deck.forEach((card) => {
                    if (card.basic) {
                        card.price -= 50;
                    }
                });
            }
            if (newRoleName === "mécanicien") {
                player.handData.forEach((card) => {
                    if (card.basic && card.type === "control_tower") {
                        card.price = 0;
                    }
                });
                player.discard.forEach((card) => {
                    if (card.basic && card.type === "control_tower") {
                        card.price = 0;
                    }
                });
                player.deck.forEach((card) => {
                    if (card.basic && card.type === "control_tower") {
                        card.price = 0;
                    }
                });
            }
            this.broadcast({ message: "server_all_your_cards_bro", allCards: player.getAllCards(), recipient: player.playerID });
            this.broadcast({ message: "server_get_your_game_data_boy", mapInfo: Maps.mapDescriptions[this.mapNumber], gameElements: this.gameElements, handData: player.handData, recipient: player.playerID, role: player.roleName });
        }
    }
    listener(data) {
        if (data.message.startsWith("client_") && this.playerManager.players[data.playerID] === undefined && data.message !== "client_disconnect") {
            throw `${data.message} not connected`;
        } else {
            if (data.message === "client_chosen_role") {
                this.setRole(data);
            }
            if (data.message === "client_give_money") {
                this.giveMoney(data);
            }
            if (data.message === "artifact_picked_up") {
                this.pickArtifactUp(data);
            }
            if (data.message === "cache_picked_up") {
                this.pickCacheUp(data);
            }
            if (data.message === "client_ping") {
                this.broadcast({
                    message: "server_ping", position: data.position, pingText: data.pingText, sender: data.sender
                });
            }
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
}

exports.GameManager = GameManager;