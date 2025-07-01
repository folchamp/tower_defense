"use strict";

class Tower {
    constructor(cardData, towerData, position, playerName, towerID) {
        this.cardData = cardData;
        this.towerData = towerData;
        this.position = position;
        this.playerName = playerName;
        this.target = undefined;
        this.totalTimePassed = 0;
        this.towerID = towerID;
        this.angle;
        this.targettedBy = [];
        this.isAlive = true;
    }
    load(data) {
        this.cardData = data.cardData;
        this.towerData = data.towerData;
        this.position = data.position;
        this.playerName = data.playerName;
        this.target = data.target;
        this.totalTimePassed = data.totalTimePassed;
        this.towerID = data.towerID;
        this.angle = data.angle;
        this.targettedBy = data.targettedBy;
        this.isAlive = data.isAlive;
    }
    isTargetetBy(enemy) {
        this.targettedBy.push(enemy);
    }
    move(timePassed) {
        this.totalTimePassed += timePassed;
        if (this.totalTimePassed > this.towerData.reloadTime) {
            if (this.hasTarget()) {
                this.totalTimePassed -= this.towerData.reloadTime;
                this.shoot();
            } else {
                this.totalTimePassed = this.towerData.reloadTime;
            }
        }
    }
    hasTarget() {
        return this.target && this.target.isAlive();
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