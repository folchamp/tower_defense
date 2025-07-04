"use strict";

const { Util } = require("../public/common/Util.js");

class ServerData {
    static GAME_WIDTH = 1920;
    static GAME_HEIGHT = 1080;
    static MAX_AMOUNT_OF_ACTIONS = 3;
    static SHOP_SHIFT = 3;
    static SMART_AIM = 5;
    static STARTING_MONEY = 4500;
    static ENEMIES_INTERVAL = 200;
    static ENEMY_STARTING_POSITION = { x: 0, y: 0 };
    static STARTING_HAND_SIZE = 3;
    static HAND_SIZE = 8;
    static SHOP_SIZE = 8;
    static DIFFICULTY_FACTOR = 4;
    static generateInitialHandData() {
        let handData = [];
        let control = Util.copyObject(this.basicCardsData[0]);
        let shooter = Util.copyObject(this.basicCardsData[1]);
        shooter.range = ServerData.towers["basic_shooter"].range;
        // let draw = { action: "power", text: "augmenter les dégâts des tours", type: "damage_up", price: 200, sellprice: 600 };
        // draw.cardID = Util.getNewID();
        // handData.push(draw);
        control.cardID = Util.getNewID();
        shooter.cardID = Util.getNewID();
        handData.push(control);
        handData.push(shooter);
        for (let index = 0; index < ServerData.STARTING_HAND_SIZE - 2; index++) {
            let card = Util.copyObject(Util.randomFromArray(ServerData.basicCardsData));
            card.cardID = Util.getNewID();
            if (card.action === "build") {
                card.range = ServerData.towers[card.type].range;
            }
            handData.push(card);
        }
        return handData;
    }
    static generateStartingPosition() {
        return { x: Util.randomValue(-180, 180) + ServerData.GAME_WIDTH / 2, y: ServerData.GAME_HEIGHT / 2 };
    }
    static generateShopContent() {
        let shopContent = [];
        for (let i = 0; i < ServerData.SHOP_SIZE; i++) {
            let shopCard = Util.copyObject(Util.randomFromArray(ServerData.shopCardsData));
            shopCard.shopCardID = Util.getNewID();
            if (shopCard.action === "build") {
                shopCard.range = ServerData.towers[shopCard.type].range;
            }
            shopContent.push(shopCard);
        }
        return shopContent;
    }
    static ROUTE = [{ "x": 200, "y": 0 }, { "x": 475, "y": 281 }, { "x": 605, "y": 318 }, { "x": 710, "y": 337 }, { "x": 892, "y": 344 }, { "x": 1108, "y": 338 }, { "x": 1211, "y": 387 }, { "x": 1263, "y": 463 }, { "x": 1267, "y": 555 }, { "x": 1229, "y": 612 }, { "x": 1116, "y": 631 }, { "x": 969, "y": 654 }, { "x": 802, "y": 660 }, { "x": 683, "y": 649 }, { "x": 601, "y": 676 }, { "x": 554, "y": 739 }, { "x": 542, "y": 823 }, { "x": 546, "y": 889 }, { "x": 573, "y": 946 }, { "x": 638, "y": 999 }, { "x": 749, "y": 1023 }, { "x": 831, "y": 1003 }, { "x": 928, "y": 976 }, { "x": 1025, "y": 994 }, { "x": 1151, "y": 1021 }, { "x": 1286, "y": 1049 }, { "x": 1339, "y": 1089 }, { "x": 3200, "y": 3000 }]
    static enemies = [
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "quick_enemy",
        "basic_enemy",
        "basic_enemy",
        "basic_enemy",
        "basic_enemy",
        "basic_enemy",
        "basic_enemy",
        "strong_enemy"
    ]
    static enemiesData = {
        basic_enemy: { name: "basic_enemy", speed: 0.05, imageName: "basic_enemy", maxHP: 10000, reward: 100 },
        quick_enemy: { name: "quick_enemy", speed: 0.09, imageName: "quick_enemy", maxHP: 2000, reward: 2 },
        strong_enemy: { name: "strong_enemy", speed: 0.04, imageName: "strong_enemy", maxHP: 30000, reward: 350 }
    };
    static towers = {
        maki_tower: {
            name: "maki_tower", initialAngle: Math.PI / 4,
            reloadTime: 800, range: 275, bulletData: { damage: 2000, speed: 0.2, color: "pink", size: 7 }
        },
        bandi_tower: {
            name: "bandi_tower", initialAngle: Math.PI / 2,
            reloadTime: 900, range: 200, bulletData: { damage: 2500, speed: 0.2, color: "yellow", size: 7 }
        },
        explosive_shooter: {
            name: "explosive_shooter", initialAngle: Math.PI / 2,
            reloadTime: 800, range: 200, bulletData: { damage: 1000, speed: 0.3, color: "red", size: 5 }
        },
        quick_shooter: {
            name: "quick_shooter", initialAngle: 3 * Math.PI / 4,
            reloadTime: 250, range: 350, bulletData: { damage: 174, speed: 0.45, color: "darkred", size: 2 }
        },
        air_shooter: {
            name: "air_shooter", initialAngle: Math.PI / 2,
            reloadTime: 200, range: 300, bulletData: { damage: 125, speed: 0.4, color: "blue", size: 2, special: "armor_piercer" }
        },
        basic_shooter: {
            name: "basic_shooter", initialAngle: Math.PI / 2,
            reloadTime: 750, range: 250, bulletData: { damage: 500, speed: 0.35, color: "lightgreen", size: 4 }
        },
        control_tower: {
            name: "control_tower",
            auraData: { type: "control", auraRadius: 64, auraColor: "lightblue", spaceLeft: 5 }
        },
        fire_tower: {
            name: "fire_tower", initialAngle: Math.PI / 2,
            reloadTime: 1000, range: 200, bulletData: { damage: 100, speed: 0.2, color: "orange", size: 3, special: "fire" }
        },
        ice_tower: {
            name: "ice_tower", initialAngle: Math.PI / 2,
            reloadTime: 1200, range: 200, bulletData: { damage: 100, speed: 0.2, color: "#739BD0", size: 3, special: "ice" }
        }
    };
    static basicCardsData = [
        { action: "build", text: "Tour de contrôle", type: "control_tower", price: 500, sellprice: 1000 },
        // { action: "build", text: "Tour de glace", type: "ice_tower", price: 700, sellprice: 1400 }, // temp
        { action: "build", text: "Petit canon", type: "basic_shooter", price: 300, sellprice: 600 },
        { action: "build", text: "Mitrailleuse légère", type: "quick_shooter", price: 250, sellprice: 500 },
        { action: "build", text: "Lance-grenade", type: "explosive_shooter", price: 200, sellprice: 400 },
        { action: "power", text: "gagner 300 💶", type: "gain_money_1", price: 100, sellprice: 200 },
        { action: "power", text: "piocher deux cartes", type: "draw_two", price: 100, sellprice: 200 },
        { action: "power", text: "gagner trois actions", type: "three_actions", price: 100, sellprice: 200 }
    ];
    static shopCardsData = [
        { action: "power", text: "une carte, une action, 100💶", type: "gain_all", price: 50, sellprice: 100 },
        { action: "power", text: "gagner 300 💶", type: "gain_money_1", price: 100, sellprice: 200 },
        { action: "power", text: "gagner 600 💶", type: "gain_money_2", price: 300, sellprice: 600 },
        { action: "power", text: "piocher deux cartes", type: "draw_two", price: 100, sellprice: 200 },
        { action: "power", text: "gagner trois actions", type: "three_actions", price: 100, sellprice: 200 },
        // { action: "power", text: "dégâts des tours++", type: "damage_up", price: 300, sellprice: 600 },
        // { action: "power", text: "cadence de tir des tours++", type: "fire_rate_up", price: 300, sellprice: 600 },
        { action: "build", text: "Tour de contrôle", type: "control_tower", price: 1500, sellprice: 3000 },
        { action: "build", text: "Petit canon", type: "basic_shooter", price: 300, sellprice: 600 },
        { action: "build", text: "Mitrailleuse légère", type: "quick_shooter", price: 250, sellprice: 500 },
        { action: "build", text: "Lance-grenade", type: "explosive_shooter", price: 200, sellprice: 400 },
        { action: "build", text: "Arme perce-armure", type: "air_shooter", price: 350, sellprice: 700 },
        { action: "build", text: "Tour de Maki", type: "maki_tower", price: 700, sellprice: 1400 },
        { action: "build", text: "Tour de Bandi", type: "bandi_tower", price: 700, sellprice: 1400 },
        { action: "build", text: "Tour de feu", type: "fire_tower", price: 700, sellprice: 1400 },
        { action: "build", text: "Tour de glace", type: "ice_tower", price: 700, sellprice: 1400 }

    ]
}

exports.ServerData = ServerData;