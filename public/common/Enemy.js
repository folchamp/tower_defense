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
        // this.specialCounters = {};
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
        // this.specialCounters = data.specialCounters;

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

        if (this.resistanceTimer) {
            this.resistanceTimer -= timePassed;
        }
        if (this.regenerateTimer) {
            this.regenerateTimer -= timePassed;
        }
        if (this.piercingTimer) {
            this.piercingTimer -= timePassed;
        }

        if (this.distance(this.position, this.direction) < Math.sqrt(xVelocity * xVelocity + yVelocity * yVelocity)) {
            if (this.hasTarget()) {
                this.reachTurret = true;
            } else {
                this.routeCheckPoint++;
                this.position.x = this.direction.x;
                this.position.y = this.direction.y;
                if (this.hasAbility("regenerates")) {
                    if (this.actualHP < this.enemyData.maxHP) {
                        this.regenerateTimer = 150;
                    }
                    this.actualHP = Math.min(this.enemyData.maxHP, this.actualHP + 400);
                }
                if (this.hasAbility("regenerates_boss")) {
                    if (this.actualHP < this.enemyData.maxHP) {
                        this.regenerateTimer = 150;
                    }
                    this.actualHP = Math.min(this.enemyData.maxHP, this.actualHP + 3000);
                }
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
    hasAbility(name) {
        return this.enemyData.abilities !== undefined && this.enemyData.abilities.includes(name);
    }
    hit(damage, special) {
        if (this.hasAbility("accelerates") && this.enemyData.speed <= 0.3) {
            this.enemyData.speed += 0.01;
        }
        if (this.hasAbility("jump_forward_on_hit")) {
            this.position.x = this.direction.x;
            this.position.y = this.direction.y;
        }
        if (this.enemyData.maxHP > 2250 && special !== undefined && special.includes("armor_piercer")) {
            this.actualHP -= damage;
            this.actualHP -= damage;
            this.piercingTimer = 150;
        }
        if (special !== undefined && special.includes("fire") && !this.hasAbility("immunity")) {
            this.onFire = true;
        }
        if (special !== undefined && special.includes("ice") && !this.hasAbility("immunity")) {
            this.onIce = true;
        }
        if (special !== undefined && special.includes("poison") && !this.hasAbility("immunity")) {
            this.routeCheckPoint = Math.max(this.routeCheckPoint - 1, 0);
        }
        if (!this.hasAbility("resistant") || damage <= 500) {
            this.actualHP -= damage; // actual damage formula
        } else {
            this.resistanceTimer = 150;
        }
        if (this.actualHP <= 0) {
            this.alive = false;
        }
    }
}

(function (exports) {
    exports.Enemy = Enemy;
}(typeof exports === 'undefined' ? {} : exports));