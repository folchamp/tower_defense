"use strict";

class Bullet {
    constructor(position, target, bulletData) {
        this.position = position;
        this.target = target;
        this.bulletData = bulletData
        this.hit = false;
        this.isActive = true;
    }
    load(data) {
        this.position = data.position;
        this.target = data.target;
        this.bulletData = data.bulletData;
        this.hit = data.hit;
        this.isActive = data.isActive;
    }
    move(timePassed) {
        let direction = { x: this.target.position.x, y: this.target.position.y };
        let dx = direction.x - this.position.x;
        let dy = direction.y - this.position.y;
        let angle = Math.atan2(dy, dx)
        let xVelocity = this.bulletData.speed * Math.cos(angle) * timePassed;
        let yVelocity = this.bulletData.speed * Math.sin(angle) * timePassed;

        if (this.distance(this.position, direction) < Math.sqrt(xVelocity * xVelocity + yVelocity * yVelocity)) {
            this.hit = true;
        } else {
            this.position.x += xVelocity;
            this.position.y += yVelocity;
        }
    }
    distance(one, two) {
        let a = one.x - two.x;
        let b = one.y - two.y;
        return Math.sqrt(a * a + b * b);
    }
    findTarget(enemies) {
        enemies.forEach((enemy) => {
            if (this.target.enemyID === enemy.enemyID) {
                this.target = enemy;
            }
        });
    }
}

(function (exports) {
    exports.Bullet = Bullet;
}(typeof exports === 'undefined' ? {} : exports));