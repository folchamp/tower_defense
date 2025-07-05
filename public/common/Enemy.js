"use strict";

class Enemy {
    constructor(position, direction, enemyData, enemyID) {
        this.position = position;
        this.direction = direction;
        this.enemyData = enemyData;
        this.enemyID = enemyID;

        this.alive = true;
        this.target = false;
        this.reachTurret = false;
        this.routeCheckPoint = 0;
        this.routeID = 0;
        this.onFire = false;
        this.onIce = false;
    }
    load(data) {
        this.position = data.position;
        this.direction = data.direction;
        this.enemyData = data.enemyData;
        this.enemyID = data.enemyID;

        this.alive = data.alive;
        this.target = data.target;
        this.reachTurret = data.reachTurret;
        this.routeCheckPoint = data.routeCheckPoint
        this.routeID = data.routeID;
        this.onFire = data.onFire;
        this.onIce = data.onIce;

        this.speed = data.speed;
        this.imageName = data.imageName;
        this.actualHP = data.actualHP;
    }
    move(timePassed) {
        let dx = this.direction.x - this.position.x;
        let dy = this.direction.y - this.position.y;
        let angle = Math.atan2(dy, dx)
        let xVelocity = this.enemyData.speed * Math.cos(angle) * timePassed;
        let yVelocity = this.enemyData.speed * Math.sin(angle) * timePassed;

        if (this.distance(this.position, this.direction) < Math.sqrt(xVelocity * xVelocity + yVelocity * yVelocity)) {
            if (this.hasTarget()) {
                this.reachTurret = true;
            } else {
                this.routeCheckPoint++;
            }
        } else {
            this.position.x += xVelocity;
            this.position.y += yVelocity;
        }
        if (this.onFire && this.actualHP > 5) {
            this.actualHP -= 5;
        }
        if (this.onIce) {
            this.position.x -= xVelocity * 0.25;
            this.position.y -= yVelocity * 0.25;
        }
    }
    distance(one, two) {
        let a = one.x - two.x;
        let b = one.y - two.y;
        return Math.sqrt(a * a + b * b);
    }
    setTarget(tower) {
        tower.isTargetetBy(this);
        this.direction = { x: tower.position.x, y: tower.position.y };
        this.target = true;
    }
    hasTarget() {
        return this.target;
    }
    isAlive() {
        return this.alive;
    }
    hit(damage, special) {
        if (this.enemyData.maxHP > 19000 && special === "armor_piercer") {
            this.actualHP -= damage;
            this.actualHP -= damage;
        }
        if (special === "fire") {
            this.onFire = true;
        }
        if (special === "ice") {
            this.onIce = true;
        }
        this.actualHP -= damage;
        if (this.actualHP <= 0) {
            this.alive = false;
        }
    }
}

(function (exports) {
    exports.Enemy = Enemy;
}(typeof exports === 'undefined' ? {} : exports));