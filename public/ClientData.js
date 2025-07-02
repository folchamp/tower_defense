"use strict";

class ClientData {
    static GAME_WIDTH = 1920;
    static GAME_HEIGHT = 1080;
    static CANVAS_WIDTH = 360;
    static CANVAS_HEIGHT = 740;
    static TOWER_SIZE = 16;
    static TOWER_HALF_SIZE = ClientData.TOWER_SIZE / 2;
    static HEALTH_BAR_SIZE = 16;
    static imagesPaths = [
        "background",
        "basic_shooter",
        "control_tower",
        "basic_enemy",
        "strong_enemy",
        "quick_enemy",
        "quick_shooter",
        "explosive_shooter",
        "air_shooter",
        "smallCard",
        "maki_tower",
        "bandi_tower",
        "fire_tower",
        "ice_tower"
    ];
    static images = {};
    static loadImages() {
        ClientData.imagesPaths.forEach((path) => {
            let sample = new Image();
            sample.src = `images/${path}.png`;
            ClientData.images[path] = sample;
        });
    }
}