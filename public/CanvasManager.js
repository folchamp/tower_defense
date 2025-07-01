"use strict";

class CanvasManager {
    constructor(canvas, gameElements, mouseCallback) {
        this.canvas = canvas;
        this.gameElements = gameElements;
        this.mouseCallback = mouseCallback;

        this.context = this.canvas.getContext("2d");
        this.lastTimeStamp = Date.now();
        this.moving = false;
        this.mouseDrawData = { draw: false, imageName: "basic_shooter" };
        this.offset = { x: 0, y: 0 };
        this.fullscreen = false;

        this.autoresize();

        ELEMENTS["fullscreenButton"].addEventListener("click", (event) => {
            if (this.fullscreen) {
                document.exitFullscreen().then(() => {
                    this.autoresize();
                    this.fullscreen = false;
                });
            } else {
                document.body.requestFullscreen().then(() => {
                    this.autoresize();
                    this.fullscreen = true;
                });
            }
        })

        this.canvas.addEventListener("click", (event) => {
            let position = this.getMousePosition(event);
            this.mouseCallback("click", position);
        });

        this.canvas.addEventListener("mousemove", (event) => {
            let position = this.getMousePosition(event);
            this.mouseCallback("mousemove", position);
        });

        this.canvas.addEventListener("mouseleave", (event) => {
            let position = this.getMousePosition(event);
            this.mouseCallback("mouseleave", position);
        });

        this.canvas.addEventListener("mouseenter", (event) => {
            let position = this.getMousePosition(event);
            this.mouseCallback("mouseenter", position);
        });

        this.canvas.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this.touchstart(event.changedTouches[0]);
        });

        this.canvas.addEventListener("touchmove", (event) => {
            event.preventDefault();
            this.touchmove(event.changedTouches[0]);
        });

        this.canvas.addEventListener("touchend", (event) => {
            event.preventDefault();
            this.touchend(event.changedTouches[0], true);
        });

        this.canvas.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            this.touchstart(event);
        });
        this.canvas.addEventListener("mousemove", (event) => {
            event.stopPropagation();
            this.touchmove(event);
        });
        this.canvas.addEventListener("mouseup", (event) => {
            event.stopPropagation();
            this.touchend(event, false);
        });
        this.loop();
    }
    autoresize() {
        this.offset = { x: window.innerWidth / 2 - ClientData.GAME_WIDTH / 2, y: window.innerHeight / 2 - ClientData.GAME_HEIGHT / 2 }
        this.canvas.width = window.innerWidth;
        this.canvas.height = ClientData.CANVAS_HEIGHT;
    }
    touchstart(touch) {
        this.moving = true;
        let position = this.getMousePosition(touch);
        this.touchStartPosition = position;
    }
    touchmove(touch) {
        let position = this.getMousePosition(touch);
        if (this.moving) {
            this.offset.x -= this.touchStartPosition.x - position.x;
            this.offset.y -= this.touchStartPosition.y - position.y;
        }
        this.touchStartPosition = position;
    }
    touchend(touch, trueClick) {
        let position = this.getMousePosition(touch);
        this.touchStartPosition = position;
        if (trueClick) {
            // if the mouse is used to move the canvas around, we don't want it to trigger a click on mouseup
            // TODO check if this really works
            this.mouseCallback("click", position);
        }
        this.moving = false;
    }
    getMousePosition(event) {
        let bounding = this.canvas.getBoundingClientRect()
        let position = {
            x: event.clientX - bounding.left,
            y: event.clientY - bounding.top
        }
        return position;
    }
    loop() {
        this.canvas.height = window.innerHeight - this.canvas.getBoundingClientRect().top; // TODO is this still necessary ?
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(ClientData.images["background"], 0 + this.offset.x, 0 + this.offset.y);
        this.draw();
        window.requestAnimationFrame(() => { this.loop(); });
    }
    draw() {
        let newTimeStamp = Date.now();
        let dt = newTimeStamp - this.lastTimeStamp;
        this.lastTimeStamp = newTimeStamp;
        this.gameElements.drawOrder.forEach((order) => {
            if (order === "auras") {
                // AURAS
                this.gameElements[order].forEach((aura) => {
                    this.context.fillStyle = aura.auraData.auraColor;
                    this.context.globalAlpha = 0.35;
                    this.context.beginPath();
                    this.context.arc(
                        aura.position.x + this.offset.x,
                        aura.position.y + this.offset.y,
                        aura.auraData.auraRadius, 0, 2 * Math.PI);
                    this.context.fill();
                    this.context.globalAlpha = 1;
                });
            } else if (order === "towers") {
                // TOWERS
                this.gameElements[order].forEach((tower) => {
                    this.context.save();
                    this.context.translate(
                        tower.position.x + this.offset.x,
                        tower.position.y + this.offset.y);
                    if (tower.angle) {
                        this.context.rotate(tower.angle);
                        if (tower.towerData.initialAngle) {
                            this.context.rotate(tower.towerData.initialAngle);
                        }
                    }
                    this.context.drawImage(
                        ClientData.images[tower.towerData.name],
                        - ClientData.TOWER_HALF_SIZE,
                        - ClientData.TOWER_HALF_SIZE);
                    this.context.restore();
                });
            } else if (order === "enemies") {
                // ENEMIES
                this.gameElements[order].forEach((enemy) => {
                    enemy.move(dt);
                    if (enemy.isAlive()) {
                        this.context.drawImage(
                            ClientData.images[enemy.enemyData.imageName],
                            enemy.position.x - ClientData.TOWER_HALF_SIZE + this.offset.x,
                            enemy.position.y - ClientData.TOWER_HALF_SIZE + this.offset.y);
                        this.context.fillStyle = "red";
                        this.context.fillRect(enemy.position.x - 8 + this.offset.x, enemy.position.y + this.offset.y - 16, ClientData.HEALTH_BAR_SIZE, 4);
                        this.context.fillStyle = "lightgreen";
                        this.context.fillRect(enemy.position.x - 8 + this.offset.x, enemy.position.y - 16 + this.offset.y, (enemy.actualHP / enemy.enemyData.maxHP) * ClientData.HEALTH_BAR_SIZE, 4);
                    }
                });
            } else if (order === "bullets") {
                // BULLETS
                this.gameElements[order].forEach((bullet) => {
                    bullet.move(dt);
                    this.context.fillStyle = bullet.bulletData.color;
                    if (bullet.isActive) {
                        this.context.beginPath();
                        this.context.arc(
                            bullet.position.x + this.offset.x,
                            bullet.position.y + this.offset.y,
                            bullet.bulletData.size, 0, 2 * Math.PI);
                        this.context.fill();
                    }
                })
            } else if (order === "route") {
                // ROUTE
                this.context.beginPath()
                this.context.moveTo(this.gameElements[order][0].x + this.offset.x, this.gameElements[order][0].y + this.offset.y);
                this.gameElements[order].forEach((point) => {
                    this.context.lineTo(point.x + this.offset.x, point.y + this.offset.y);
                })
                this.context.stroke();
            }
        });
        if (this.mouseDrawData.draw) {
            this.context.drawImage(ClientData.images[this.mouseDrawData.imageName], this.mouseDrawData.x - ClientData.TOWER_HALF_SIZE, this.mouseDrawData.y - ClientData.TOWER_HALF_SIZE);
        }
    }
}