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
        this.onPoison = false;
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
        this.onPoison = data.onPoison;
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
            this.resistanceTimer = 0;
        }

        if (this.distance(this.position, this.direction) < Math.sqrt(xVelocity * xVelocity + yVelocity * yVelocity)) {
            if (this.hasTarget()) {
                this.reachTurret = true;
            } else {
                this.routeCheckPoint++;
                this.onPoison = false;
                this.position.x = this.direction.x;
                this.position.y = this.direction.y;
                if (this.hasAbility("regenerates") && !this.onIce && !this.onFire && !this.onPoison) {
                    if (this.actualHP < this.enemyData.maxHP) {
                        this.regenerateTimer = 150;
                    }
                    this.actualHP = Math.min(this.enemyData.maxHP, this.actualHP + 400);
                }
                if (this.hasAbility("regenerates_boss")) {
                    if (this.actualHP < this.enemyData.maxHP) {
                        this.regenerateTimer = 150;
                    }
                    this.actualHP = Math.min(this.enemyData.maxHP, this.actualHP + 800);
                }
                this.onIce = false;
            }
        } else {
            this.position.x += xVelocity;
            this.position.y += yVelocity;
        }
        if (this.onFire && this.actualHP > 7) {
            this.actualHP -= 7;
        } else {
            this.onFire = false;
        }
        if (this.onPoison && this.actualHP > 15) {
            this.actualHP -= 15;
        } else {
            this.onPoison = false;
        }
        if (this.onIce) {
            this.position.x -= xVelocity * 0.50;
            this.position.y -= yVelocity * 0.50;
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
        if (special !== undefined && special.includes("armor_piercer")) {
            this.actualHP -= damage;
            this.piercingTimer = 150;
            this.resistanceTimer = 0;
        }
        if (special !== undefined && special.includes("fire") && !this.hasAbility("immunity")) {
            this.onFire = true;
            this.onIce = false;
        }
        if (special !== undefined && special.includes("ice") && !this.hasAbility("immunity")) {
            this.onIce = true;
            this.onFire = false;
        }
        if (special !== undefined && special.includes("poison") && !this.hasAbility("immunity")) {
            this.onPoison = true;
            this.routeCheckPoint = Math.max(this.routeCheckPoint - 1, 0);
        }
        if (this.hasAbility("resistant") && damage > 500) {
            this.resistanceTimer = 150;
            this.actualHP -= (0.20 * damage); // actual damage formula
        } else {
            this.actualHP -= damage; // actual damage formula
        }
        if (this.actualHP <= 0) {
            this.alive = false;
        }
        if (special !== undefined && special.includes("sheep") && !this.hasAbility("immunity")) {
            this.enemyData =
            {
                name: "sheep_enemy",
                speed: 0.11,
                imageName: "sheep_enemy",
                maxHP: 800,
                reward: 1
            }
        }
    }
}

(function (exports) {
    exports.Enemy = Enemy;
}(typeof exports === 'undefined' ? {} : exports));