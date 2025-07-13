"use strict";

const { Util } = require("../public/common/Util.js");

class ServerData {
    static GAME_WIDTH = 1920;
    static GAME_HEIGHT = 1080;
    static MAX_AMOUNT_OF_ACTIONS = 3;
    static SHOP_SHIFT = 3;
    static SMART_AIM = 10;
    static ARTIFACT_SPAWN_CHANCE = 100;
    // static ARTIFACT_SPAWN_CHANCE = 10; // for testing
    static STARTING_MONEY = 6000;
    // static STARTING_MONEY = 450000; // for testing
    static ENEMIES_INTERVAL = 300;
    static ENEMY_STARTING_POSITION = { x: 0, y: 0 };
    static STARTING_HAND_SIZE = 3;
    static HAND_SIZE = 8;
    static SHOP_SIZE = 8;
    static DIFFICULTY_FACTOR = 1.5;
    static CHAIN_LIGHTNING_RANGE = 750;
    static SUMMON_CHANCE = 0.9995;
    static generateInitialHandData() {
        let handData = [];
        // let control = Util.copyObject(this.shopCardsData[0]);
        // let shooter = Util.copyObject(this.basicCardsData[0]);
        // shooter.range = ServerData.towers[shooter.type].range;
        // control.cardID = Util.getNewID();
        // shooter.cardID = Util.getNewID();
        // handData.push(control);
        // handData.push(shooter);
        // auto-include for testing
        // let draw = Util.copyObject(this.shopCardsData[1]);
        // draw.cardID = Util.getNewID();
        // draw.range = ServerData.towers[draw.type].range;
        // handData.push(draw);
        // autoinclude for testing
        ServerData.basicCardsData.forEach((card) => {
            card.cardID = Util.getNewID();
            if (card.action === "build") {
                card.range = ServerData.towers[card.type].range;
            }
            handData.push(card);
        });
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
    static towers = {

        bank_tower: {
            name: "bank_tower", type: "support", moneyPerWave: 125
        },
        micro_agence_tower: {
            name: "micro_agence_tower", type: "support", moneyPerWave: 50
        },
        wonder_tower: {
            name: "wonder_tower", type: "support"
        },
        control_tower: {
            name: "control_tower", type: "support",
            auraData: { type: "control", auraRadius: 64, auraColor: "lightblue", spaceLeft: 5 }
        },
        maki_tower: {
            name: "maki_tower", initialAngle: Math.PI / 4,
            reloadTime: 800, range: 275,
            bulletData: { damage: 2000, speed: 0.2, color: "pink", size: 7 }
        },
        bandi_tower: {
            name: "bandi_tower", initialAngle: Math.PI / 2,
            reloadTime: 900, range: 200,
            bulletData: { damage: 2500, speed: 0.2, color: "yellow", size: 7 }
        },
        explosive_shooter: {
            name: "explosive_shooter", initialAngle: Math.PI / 2,
            reloadTime: 800, range: 200,
            bulletData: { damage: 1000, speed: 0.3, color: "red", size: 5 }
        },
        quick_shooter: {
            name: "quick_shooter", initialAngle: Math.PI / 2,
            reloadTime: 250, range: 350,
            bulletData: { damage: 174, speed: 0.45, color: "darkred", size: 2 }
        },
        air_shooter: {
            name: "air_shooter", initialAngle: Math.PI / 2,
            reloadTime: 200, range: 300,
            bulletData: { damage: 125, speed: 0.4, color: "blue", size: 2, special: ["armor_piercer"] }
        },
        basic_shooter: {
            name: "basic_shooter", initialAngle: Math.PI / 2,
            reloadTime: 700, range: 400,
            bulletData: { damage: 500, speed: 0.35, color: "lightgreen", size: 4 }
        },
        fire_tower: {
            name: "fire_tower", initialAngle: Math.PI / 2,
            reloadTime: 1000, range: 200,
            bulletData: { damage: 100, speed: 0.2, color: "orange", size: 3, special: ["fire"] }
        },
        ice_tower: {
            name: "ice_tower", initialAngle: Math.PI / 2,
            reloadTime: 1200, range: 200,
            bulletData: { damage: 100, speed: 0.2, color: "#739BD0", size: 3, special: ["ice"] }
        },
        railgun_tower: {
            name: "railgun_tower", initialAngle: Math.PI / 2,
            reloadTime: 1800, range: 400,
            bulletData: { damage: 5000, speed: 0.6, color: "silver", size: 8, special: ["armor_piercer"] }
        },
        venom_tower: {
            name: "venom_tower", initialAngle: Math.PI / 2,
            reloadTime: 900, range: 250,
            bulletData: { damage: 300, speed: 0.3, color: "purple", size: 3, special: ["poison"] }
        },
        sniper_tower: {
            name: "sniper_tower", initialAngle: Math.PI / 2,
            reloadTime: 2000, range: 600,
            bulletData: { damage: 8000, speed: 0.8, color: "black", size: 5 }
        },
        storm_tower: {
            name: "storm_tower", initialAngle: Math.PI / 2,
            reloadTime: 1000, range: 300,
            bulletData: { damage: 100, speed: 0.4, color: "cyan", size: 3, special: ["chain_lightning"] }
        },
        decay_tower: {
            name: "decay_tower", initialAngle: Math.PI / 2,
            reloadTime: 200, range: 100,
            bulletData: { damage: 100, speed: 0.2, color: "darkgreen", size: 5, special: ["armor_piercer"] }
        },
        multi_shot_tower: {
            name: "multi_shot_tower", initialAngle: 3 * Math.PI / 4,
            reloadTime: 1000, range: 225,
            bulletData: { damage: 400, speed: 0.35, color: "white", size: 2, special: ["triple_shot"] }
        }
    };
    static basicCardsData = [
        { action: "build", text: "Petit canon", type: "basic_shooter", price: 300, sellprice: 400 }, // auto-include
        { action: "build", text: "Lance-grenade", type: "explosive_shooter", price: 200, sellprice: 400 }, // auto-include
        { action: "build", text: "Arme légère", type: "quick_shooter", price: 250, sellprice: 400 }, // auto-include
        { action: "build", subType: "support", text: "Tour de contrôle", type: "control_tower", price: 500, sellprice: 1000 },  // auto-include
    ];
    static shopCardsData = [
        // autoinclude for testing
        // { action: "build", text: "Tour d'orage", type: "storm_tower", price: 800, sellprice: 1000 },
        // { action: "build", text: "Tir multiple", type: "multi_shot_tower", price: 650, sellprice: 1300 }, // temp auto-include
        // { action: "build", text: "Tour venimeuse", type: "venom_tower", price: 600, sellprice: 1200 },
        // { action: "build", text: "Tour d'orage", type: "storm_tower", price: 800, sellprice: 1000 },
        // end autoinclude for testing

        { action: "power", text: "super contrôle", type: "upgrade_control", price: 750, sellprice: 1500, size: 24 },
        { action: "build", subType: "support", text: "Banque", type: "bank_tower", price: 400, sellprice: 800 },
        { action: "build", subType: "support", text: "Micro-agence", type: "micro_agence_tower", price: 150, sellprice: 300 },
        { action: "build", subType: "support", text: "Merveille", type: "wonder_tower", price: 8000, sellprice: 500 },

        { action: "build", text: "Tour venimeuse", type: "venom_tower", price: 600, sellprice: 1000 },
        { action: "build", text: "Petit canon", type: "basic_shooter", price: 300, sellprice: 400 },
        { action: "build", text: "Arme légère", type: "quick_shooter", price: 250, sellprice: 400 },
        { action: "build", text: "Lance-grenade", type: "explosive_shooter", price: 200, sellprice: 400 },
        { action: "build", text: "Perce-armure", type: "air_shooter", price: 350, sellprice: 400 },
        { action: "build", text: "Tour de Maki", type: "maki_tower", price: 700, sellprice: 1000 },
        { action: "build", text: "Tour de Bandi", type: "bandi_tower", price: 700, sellprice: 1000 },
        { action: "build", text: "Tour de feu", type: "fire_tower", price: 700, sellprice: 1000 },
        { action: "build", text: "Tour de glace", type: "ice_tower", price: 700, sellprice: 1000 },
        { action: "build", text: "Canon rail", type: "railgun_tower", price: 1200, sellprice: 2000 },
        { action: "build", text: "Tour sniper", type: "sniper_tower", price: 1500, sellprice: 2000 },
        { action: "build", text: "Tour d'orage", type: "storm_tower", price: 800, sellprice: 1000 },
        { action: "build", text: "Tour de corrosion", type: "decay_tower", price: 550, sellprice: 1000 },
        { action: "build", text: "Tir multiple", type: "multi_shot_tower", price: 650, sellprice: 1000 },

        { action: "power", text: "nouveau magasin", type: "new_shop", price: 400, sellprice: 400 },
        { action: "power", text: "piocher deux cartes", type: "draw_two", price: 100, sellprice: 200 },
        { action: "power", text: "gagner trois actions", type: "three_actions", price: 100, sellprice: 200 },
        { action: "power", text: "gagner 300💶", type: "gain_money_1", price: 100, sellprice: 200 },
        { action: "power", text: "gagner 600💶", type: "gain_money_2", price: 300, sellprice: 600 },

        { action: "power", text: "pioche pour tous", type: "everyone_draws", price: 200, sellprice: 400 },
        // { action: "power", text: "gagner 300💶", type: "gain_money_1", price: 100, sellprice: 200 },
        // { action: "power", text: "piocher deux cartes", type: "draw_two", price: 100, sellprice: 200 },
        // { action: "power", text: "gagner trois actions", type: "three_actions", price: 100, sellprice: 200 },
        // { action: "power", text: "gagner 600💶", type: "gain_money_2", price: 300, sellprice: 600 }

    ]
    // { action: "power", text: "une carte, une action, 100💶", type: "gain_all", price: 50, sellprice: 100 },
    // { action: "power", text: "dégâts des tours++", type: "damage_up", price: 300, sellprice: 600 },
    // { action: "power", text: "cadence de tir des tours++", type: "fire_rate_up", price: 300, sellprice: 600 },
    // { action: "power", text: "piocher deux cartes", type: "draw_two", price: 100, sellprice: 200 },
    // { action: "power", text: "gagner 300 💶", type: "gain_money_1", price: 100, sellprice: 200 },
    // { action: "power", text: "gagner trois actions", type: "three_actions", price: 100, sellprice: 200 }
    // { action: "build", text: "Tour de contrôle", type: "control_tower", price: 500, sellprice: 1000 },
    // { action: "build", text: "Tour de glace", type: "ice_tower", price: 700, sellprice: 1400 }, // temp

    static enemies = [
        "buzz_enemy",
        "mini_enemy",

        "veteran_enemy", // summon on death

        "kamikaze_enemy",
        "crawler_enemy",

        "drone_enemy", // fly

        "basic_enemy", // pretty tanky but we need to make the game harder at this point

        "ghost_enemy", // teleports 

        "scout_enemy",

        "quick_enemy",
        "mutant_enemy", // summons

        "infected_enemy",
        "elite_enemy", // on death, summons drones

        "armored_enemy",


        "strong_enemy",
        "tank_enemy",
        "boss_enemy",

        "brute_enemy", // venom immune
        "swarm_enemy", // summoned enemy
    ]
    static enemiesData = {

        buzz_enemy: {
            name: "buzz_enemy",
            speed: 0.14,
            imageName: "buzz_enemy",
            maxHP: 1200,
            reward: 10,
            size: 24,
            abilities: ["regenerates"]
        },
        mini_enemy: {
            name: "mini_enemy",
            speed: 0.1,
            imageName: "mini_enemy",
            maxHP: 1200,
            reward: 10,
            abilities: ["resistant"]
        },

        veteran_enemy: {
            name: "veteran_enemy",
            speed: 0.055,
            imageName: "veteran_enemy",
            maxHP: 3500,
            reward: 25,
            size: 24,
            abilities: ["summon_minions"]
        },

        kamikaze_enemy: {
            name: "kamikaze_enemy",
            speed: 0.13,
            imageName: "kamikaze_enemy",
            maxHP: 1000,
            reward: 25,
            size: 24,
            abilities: ["fly"]
        },

        crawler_enemy: {
            name: "crawler_enemy",
            speed: 0.06,
            imageName: "crawler_enemy",
            maxHP: 2100,
            reward: 25,
            abilities: ["accelerates", "resistant"]
        },

        drone_enemy: {
            name: "drone_enemy",
            speed: 0.11,
            imageName: "drone_enemy",
            maxHP: 1000,
            reward: 25,
            abilities: ["fly"]
        },

        basic_enemy: {
            name: "basic_enemy",
            speed: 0.04,
            imageName: "basic_enemy",
            maxHP: 5000,
            reward: 25,
            size: 30,
            abilities: ["accelerates"]
        },

        scout_enemy: {
            name: "scout_enemy",
            speed: 0.12,
            imageName: "scout_enemy",
            maxHP: 1500,
            reward: 25,
            abilities: ["regenerates"]
        },

        ghost_enemy: {
            name: "ghost_enemy",
            speed: 0.10,
            imageName: "ghost_enemy",
            maxHP: 2500,
            reward: 25,
            size: 22,
            abilities: ["jump_forward_on_hit"]
        },

        quick_enemy: {
            name: "quick_enemy",
            speed: 0.09,
            imageName: "quick_enemy",
            maxHP: 2000,
            reward: 25,
            abilities: ["immunity", "resistant"]
        },

        mutant_enemy: {
            name: "mutant_enemy",
            speed: 0.1,
            imageName: "mutant_enemy",
            maxHP: 3000,
            reward: 25,
            size: 18,
            abilities: ["summoner"]
        },

        infected_enemy: {
            name: "infected_enemy",
            speed: 0.065,
            imageName: "infected_enemy",
            maxHP: 4000,
            reward: 25,
            size: 30,
            abilities: ["fly"]
        },

        elite_enemy: {
            name: "elite_enemy",
            speed: 0.06,
            imageName: "elite_enemy",
            maxHP: 5000,
            reward: 25,
            abilities: ["summon_drones"]
        },

        armored_enemy: {
            name: "armored_enemy",
            speed: 0.045,
            imageName: "armored_enemy",
            maxHP: 3500,
            reward: 25,
            abilities: ["accelerates", "summons_on_hit"]
        },

        strong_enemy: {
            name: "strong_enemy",
            speed: 0.04,
            imageName: "strong_enemy",
            maxHP: 7000,
            reward: 25,
            abilities: ["fly", "summon_drones"]
        },

        tank_enemy: {
            name: "tank_enemy",
            speed: 0.03,
            imageName: "tank_enemy",
            maxHP: 8000,
            reward: 25,
            abilities: ["immunity", "jump_forward_on_hit", "resistance"]
        },

        boss_enemy: {
            name: "boss_enemy",
            speed: 0.025,
            imageName: "boss_enemy",
            maxHP: 200000,
            reward: 25,
            abilities: ["immunity", "summoner", "regenerates"]
        },

        brute_enemy: {
            name: "brute_enemy",
            speed: 0.035,
            imageName: "brute_enemy",
            maxHP: 3500,
            reward: 25,
            abilities: ["immunity"]
        },

        swarm_enemy: {
            name: "swarm_enemy",
            speed: 0.11,
            imageName: "swarm_enemy",
            maxHP: 800,
            reward: 1
        },
    };

    static artifacts = [
        {
            title: "Journal d’un éclaireur des mines de Zekk",
            description: "On était certain de forer dans un monde où la vie n'avait jamais éclos. Aujourd'hui, on a perçu du mouvement. Notre auxiliaire a enregistré des sons que nos machines ne pourraient pas avoir émis. Quelque chose suinte de la paroi.",
            imageName: "artifact"
        },
        {
            title: "Transcription d’un captif",
            description: "Il parlait, parfois. Difficilement. Comme si son corps et son esprit se bagarraient. Il a dit : 'Orrak-Tar... mère m'attend'",
            imageName: "artifact"
        },
        {
            title: "Plan d'un souterrain",
            description: "Une cavité immense sous le tunnel 03-Nova. Rayée en rouge. Dossier classé NON-EXPLOITABLE. Un titre manuscrit, presque illisible. Orrak-Tar.",
            imageName: "artifact"
        },
        {
            title: "Schéma trouvé dans un abri isolé",
            description: "« Une carte. Des flèches. Quelques équations mathémathiques. Au centre, une annotation griffonnée à la hâte. « C’est là qu’elle est née. C’est là qu’on la tuera. » Aucun nom, aucune signature. Juste une phrase. « J’y vais seul. Si je ne reviens pas, prévenez mes enfants. »",
            imageName: "artifact"
        },
        {
            title: "Entrée d’un journal personnel retrouvé dans le no-man's land",
            description: "J’ai vu l’un d’eux de près, trop près. Je crois que c’était un médecin, autrefois, son badge était encore accroché à sa chemise. Il m’a regardé et je jure qu’il a hésité. Ils ne sont pas morts, j'ai l'impression. Ils sont coincés.",
            imageName: "artifact"
        },
        {
            title: "Note manuscrite, refuge du Secteur N3",
            description: "Ils en reste, tu sais, des enfants. On les protège dans les salles inférieures. Ils ne voient jamais le ciel, mais ils rient. Ils dessinent des étoiles. Peut-être qu’un jour, ils les verront pour de vrai.",
            imageName: "artifact"
        },
        {
            title: "Carnet d’un technicien, Forteresse orbitale Delta",
            description: "Ce ne sont pas des armes, mais des bricolages de matériel de recupération. Des morceaux de machines agricoles, de découpeurs de glace, de drones de maintenance. On les assemble comme on peut et on espère que ça tire dans la bonne direction.",
            imageName: "artifact"
        },
        {
            title: "Enregistrement détérioré",
            description: "[...] Que le souvenir de notre échec serve de leçon à ceux qui survivront. Nous avons voulu soumettre l’univers à nos besoins et il nous exprime sa colère. Que chaque bastion se prépare car nous ne serons plus là pour les guider.",
            imageName: "artifact"
        },
        {
            title: "Journal d’un stratège militaire, archive classifiée",
            description: "Nous avons sacrifié sept mondes, pour l'instant. L'arme nucléaire a servi à des fins de guerre, ce n'était plus arrivé depuis 1945. Les scientifiques pensait que l’Huile n’irait pas là où la vie était impossible et... ils se sont trompés.",
            imageName: "artifact"
        },
        {
            title: "Note vocale civile, module de transit 17-Theta",
            description: "Ils ont bloqué les docks. Seule une navette sur cinq est encore opérationnelle. On se bat pour entrer. J’ai vu un officier tirer sur une mère pour prendre sa place. Je la revois chaque nuit. Pourquoi ai-je survécu ?",
            imageName: "artifact"
        },
        {
            title: "Transmission d'urgence, Planète Miri-Hek, ex-colonie civile",
            description: "L'huile ne suit aucune logique biologique et nous rappelle les enseignements des vieux sages : en fait, nous ne savons rien. Elle traverse le sol et la fibre, survit au vide et coule même sans gravité. Comment lui échapper ?",
            imageName: "artifact"
        },
        {
            title: "Journal scientifique, fragment récupéré - Station Rhéa IX",
            description: "L’échantillon est arrivé par erreur, il n'était pas sur l'inventaire de la cargaison. Une masse noire, scellée dans une capsule marquée d'un sceau inconnu. Le labo 4 l'a ouvert, Georges n'a jamais pu contenir sa curiosité. Trente heures plus tard, plus personne de son équipe ne répondait à la radio. Nous avons verrouillé le secteur, mais c'est impossible de dire si nous avons agi suffisamment vite.",
            imageName: "artifact"
        },
        {
            title: "Message gravé sur un mur du bastion Sigma",
            description: "On ne parle plus des planètes perdues, ni des morts. Il ne reste que nous, sur ce monde-ci, je crois. L’Huile n’a pas tout ravagé, l'espoir persiste. Nous vivons encore.",
            imageName: "artifact"
        },
        {
            title: "Fragment d’échange radio",
            description: "- Tu crois qu’on peut gagner ? - Gagner ? Non. Mais tenir un jour de plus, oui. Et après, on verra.",
            imageName: "artifact"
        },
        {
            title: "Photographie ancienne avec annotation manuscrite",
            description: "Ma sœur portait encore ses bottes de mineuse. Son armure était une simple plaque de métal rouillé sur la poitrine. Elle tuait ces horreurs avec un marteau géant et, chaque soir, elle recousait ses vêtements et rassassait les souvenirs d'avant.",
            imageName: "artifact"
        },
        // {
        //     title: "",
        //     description: ""
        // },
        // {
        //     title: "",
        //     description: ""
        // },
        // {
        //     title: "",
        //     description: ""
        // },
        // {
        //     title: "",
        //     description: ""
        // },
        // {
        //     title: "",
        //     description: ""
        // },
        // {
        //     title: "",
        //     description: ""
        // },
    ]
}

exports.ServerData = ServerData;