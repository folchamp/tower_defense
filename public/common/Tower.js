"use strict";

class Tower {
    constructor(cardData, towerData, position, playerName, towerID) {
        this.cardData = cardData;
        this.towerData = towerData;
        this.position = position;
        this.playerName = playerName;
        this.towerID = towerID;

        this.target = undefined;
        this.totalTimePassed = 0;
        this.angle;
        this.targettedBy = [];
        this.isAlive = true;
        this.specialData = {};
    }
    load(data) {
        this.cardData = data.cardData;
        this.towerData = data.towerData;
        this.position = data.position;
        this.playerName = data.playerName;
        this.towerID = data.towerID;

        this.target = data.target;
        this.totalTimePassed = data.totalTimePassed;
        this.angle = data.angle;
        this.targettedBy = data.targettedBy;
        this.isAlive = data.isAlive;
        this.specialData = data.specialData;
    }
    hasSpecial(specialName) {
        return this.towerData.bulletData !== undefined && this.towerData.bulletData.special !== undefined && this.towerData.bulletData.special.includes(specialName);
    }
    isTargetetBy(enemy) {
        this.targettedBy.push(enemy);
    }
    hasBigDamage() {
        return this.towerData.bulletData !== undefined && this.towerData.bulletData.damage >= 500;
    }
    move(timePassed) {
        // multi-shot
        if (this.hasSpecial("triple_shot")) {
            if (this.specialData.shots === undefined) {
                this.specialData.shots = 1;
            }
        }
        // end multi-shot
        this.totalTimePassed += timePassed;
        if (this.totalTimePassed > this.towerData.reloadTime) {
            if (this.hasTarget()) {
                this.totalTimePassed -= this.towerData.reloadTime;
                this.shoot();

                if (this.hasSpecial("triple_shot") && this.specialData.shots < 3) {
                    this.totalTimePassed += this.towerData.reloadTime - 75;
                    this.specialData.shots++;
                } else {
                    this.specialData.shots = 1;
                }

            } else if (!this.hasSpecial("tiring")) {
                this.totalTimePassed = this.towerData.reloadTime;
            }
        }
    }
    hasTarget() {
        return this.target !== undefined && this.target.isAlive();
    }
    loseTarget() {
        this.target = undefined;
        this.targetID = undefined;
    }
    setTarget(target) {
        if (target) {
            this.target = target;
            this.targetID = target.enemyID;
        }
    }
    shoot() {
        this.stockedBullet = {
            position: this.position,
            target: this.target,
            bulletData: this.towerData.bulletData
        };
        this.angle = this.getShootingAngle();
    }
    getShootingAngle() {
        let direction = { x: this.target.position.x, y: this.target.position.y };
        let dx = direction.x - this.position.x;
        let dy = direction.y - this.position.y;
        let angle = Math.atan2(dy, dx)
        return angle;
    }
}

(function (exports) {
    exports.Tower = Tower;
}(typeof exports === 'undefined' ? {} : exports));