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
        "ice_tower",
        "tank_enemy",
        "scout_enemy",
        "brute_enemy",
        "swarm_enemy",
        "elite_enemy",
        "ghost_enemy",
        "armored_enemy",
        "mutant_enemy",
        "boss_enemy",
        "infected_enemy",
        "kamikaze_enemy",
        "veteran_enemy",
        "railgun_tower",
        "venom_tower",
        "sniper_tower",
        "storm_tower",
        "decay_tower",
        "multi_shot_tower",
        "mini_enemy",
        "crawler_enemy",
        "buzz_enemy",
        "drone_enemy",
        "ping",
        "wonder_tower",
        "bank_tower",
        "upgraded_control_tower",
        "micro_agence_tower"
    ];
    static images = {};
    static loadImages() {
        ClientData.imagesPaths.forEach((path) => {
            let sample = new Image();
            sample.src = `images/${path}.png`;
            ClientData.images[path] = sample;
        });
    }
    static enemiesDescriptions = {
        "mini_enemy": {
            "loreName": "Fouisseur",
            "description": "Ancien rongeur de compagnie, son squelette a été renforcé d'un châssis métallique. Ses pattes s’enfoncent dans le sol avec des mouvements erratiques. Ses yeux clignotent avec une fréquence inquiétant. L’huile noire goutte de son dos décharné.",
            "abilities": "Rapide"
        },
        "crawler_enemy": {
            "loreName": "Rampant",
            "description": "Ce monstre était probablement un chien, autrefois. Son abdomen est ouvert sur une sorte de chenille roulante qu'il utiliser pour se mouvoir. Il laisse une traînée d’huile noire sur son chemin. Son crâne est encastré dans une coque d’acier.",
            "abilities": "Lent, un peu résistant"
        },
        "buzz_enemy": {
            "loreName": "Grésilleur",
            "description": "Ressemblant vaguement à une mouche, cette créature vole à basse altitude à l’aide d’ailes hybrides, noircies par un procédé méconnu. Son thorax transparent laisse entrevoir un cœur mécanique pulsant si vite que l'œil peine à le suivre. Il émet un sifflement strident lorsqu'il repère des proies humaines.",
            "abilities": "Rapide, fragile"
        },
        "drone_enemy": {
            "loreName": "Chasseur",
            "description": "Appareil civil de surveillance détourné. Son châssis est couvert d'un matière visqueuse et noire. Il vole droit, vite, comme absorbé par une cible. Vous.",
            "abilities": "Rapide, un peu résistant"
        },
        "basic_enemy": {
            "loreName": "Contaminé",
            "description": "Humanoïde dont les organes principaux ont été remplacés par des artifices complexes imaginés par l'huile. Ses membres sont couverts de pointes et de lames dégoulinantes d'huile.",
            "abilities": "Lent, très résistant"
        },
        "quick_enemy": {
            "loreName": "Sprinter",
            "description": "Ses jambes, solidifiées par des armatures en acier, l'entraînent en avant à grande vitesse.",
            "abilities": "Rapide, fragile"
        },
        "strong_enemy": {
            "loreName": "Charognard",
            "description": "Probablement une bête de somme contaminée. Son torse a été entièrement blindé avec des plaques de métal rouillé. Il avance comme au ralenti mais peut encaisser de nombreuses attaques. De l’huile s’écoule par les défauts de son armure.",
            "abilities": "Très résistant, très lent"
        },
        "tank_enemy": {
            "loreName": "Blindé",
            "description": "Ancien véhicule militaire fusionné avec ses pilotes contaminés. Sa coque respire avec de violentes saccades, comme s'il était doté d'une vie propre.",
            "abilities": "Très résistant, très lent"
        },
        "scout_enemy": {
            "loreName": "Éclaireur",
            "description": "Petit corps humanoïde allégé pour la reconnaissance. Une antenne tordue sort de son crâne. Il court avec une surprenante agilité. Ses yeux brillent d’un vert toxique.",
            "abilities": "Rapide, fragile"
        },
        "brute_enemy": {
            "loreName": "Casseur d’os",
            "description": "Le torse d’un gorille, les jambes robotiques, comme d'immondes prothèses couvertes d'huile. Son visage est figé dans une grimace simiesque. Chaque pas qu'il fait fait trembler le sol.",
            "abilities": "Lent, résistant"
        },
        "swarm_enemy": {
            "loreName": "Vermine",
            "description": "Multiples créatures de petite taille – oiseaux, rongeurs, insectes – amalgamés en une masse grouillante. Ce nuage de bestioles émet des cliquetis constants comme un broyeur à déchets qui tourne fou.",
            "abilities": "Fragile"
        },
        "elite_enemy": {
            "loreName": "Alpha",
            "description": "Un ancien soldat. Son uniforme est en loques. Un canon est intégré à son torse, heureusement inactif. Son regard chercheur trahit une forme de conscience résiduelle. Il marche avec autorité, le dos droit, comme il devait le faire avant la contagion.",
            "abilities": "Résistant, rapide"
        },
        "ghost_enemy": {
            "loreName": "Spectre Noir",
            "description": "Spectre à la peau blanche, presque translucide. Il avance vite et sans bruit, flottant à quelques centimètres du sol. Les projectiles semblent le traverser sans effet.",
            "abilities": "Rapide, résistant"
        },
        "armored_enemy": {
            "loreName": "Paladin du Ravage",
            "description": "Exosquelette militaire greffé à son pilote contaminé, ses bras sont encore marqués de logos d'une armée aujourd'hui disparue. Chaque membre est renforcé par des barres métalliques grossièrement soudées. Il encaisse. Il avance.",
            "abilities": "Très résistant"
        },
        "mutant_enemy": {
            "loreName": "Mutant",
            "description": "Une bête non-identifiable, peut-être la fusion de plusieurs être vivants. Sa chair est molle mais résistante, déchirée ci-et-là, suintant d'huile. Elle émet un grognement sourd, dernier vestige de sa vie passée.",
            "abilities": "Résistant, lent"
        },
        "boss_enemy": {
            "loreName": "Le Colosse",
            "description": "C’est une colline en marche. Réacteur nucléaire sur pattes. Commandé par une force distante, la Reine elle-même. Il avance lentement, implacablement, portant sur son dos les restes de ses victimes.",
            "abilities": "Boss"
        },
        "infected_enemy": {
            "loreName": "Corps contaminé",
            "description": "Un humain, fraîchement transformé. Ses traits sont encore reconnaissables. Des câbles sortent de sa bouche. Ses mouvements sont saccadés, comme s’il luttait encore. L’huile lui coule des yeux et des oreilles.",
            "abilities": ""
        },
        "kamikaze_enemy": {
            "loreName": "Hurleur",
            "description": "Petit corps compact, truffé de réservoirs d'huile. Il fonce en ligne droite, propulsé par des jambes métalliques. Son abdomen vibre dangereusement, prêt à se rompre. Il se jette contre tout ce qui vit.",
            "abilities": "Très rapide"
        },
        "veteran_enemy": {
            "loreName": "Passé",
            "description": "Un ancien défenseur humain tombé dans le no-man’s land. Son armure est fondue, son arme arrachée. L’huile l’a ressuscité sans le reconstruire entièrement. Il marche comme un mort, mais son regard familier ne vous lâche pas.",
            "abilities": "Résistant"
        }
    }

    static towersDescriptions = {
        "bank_tower": {
            "description": "Vestige d'un CCLA (comptoir commercial local automatisé), cette tour a été modifiée pour racler les maigres ressources qui traînent encore dans le no-man's land.",
            "capacity": "Génère 125 thunes par vague."
        },
        "micro_agence_tower": {
            "description": "Petite structure semblable à un bureau de poste de l'ancien temps, elle trie et recycle automatiquement les vieilleries du no-man's land qui l'entourent pour subvenir aux besoin de matériaux des ingénieurs. Peu productive mais facile à installer.",
            "capacity": "Génère 50 thunes par vague."
        },
        "wonder_tower": {
            "description": "Personne ne se souvient vraiment de sa fonction d'origine. Elle émet d'étranges signaux, comme si elle cherchait à entrer en contact avec un ailleurs oublié. Une relique qui, peut-être, révélera sa fonction un jour.",
            "capacity": "Effets mystérieux."
        },
        "control_tower": {
            "description": "Assemblage délicat de divers systèmes de communication et de logistique. Cette tourelle tactique, augmente la cohésion locale en diffusant des ordres envoyés par une antique IA militaire. Elle donne un semblant d'odre dans le chaos du no-man's land.",
            "capacity": "Crée une zone de 5 emplacements de construction."
        },
        "maki_tower": {
            "description": "Une tourelle d'artillerie rotative ultra-puissante montée sur un trépied hydraulique. Surnommée Maki en souvenir de son créateur, un ingénieur survivaliste, élu beau gosse de l'année 3014, aujourd'hui déclaré MIA (missing in action). Elle allie style et puissance.",
            "capacity": "Gros dégâts. Gros canon."
        },
        "bandi_tower": {
            "description": "Construite à partir d’un exosquelette de chantier (ultra-moderne à l'époque), cette tourelle tire des salves lumineuses avec une précision brutale. Les lueurs jaunes de ses projectiles évoquent inspirent la peur, d'abord. Puis l'espoir. Son inventeur est à la première page des ingénieurs les plus aimés du système.",
            "capacity": "Tire des projectiles incandescants qui éblouissent ses admirateurs."
        },
        "explosive_shooter": {
            "description": "Simple lance-patates automatisé, cette tour utilise des projectiles légers qui explosent à l’impact. Grenades, batons de dynamites, têtes de mortier, elle a un des meilleurs ratio dégâts/coût du bastion.",
            "capacity": "Tire des projectiles mortels sur une courte distance."
        },
        "quick_shooter": {
            "description": "Cette petite tourelle, une fois en action, claque et craque sans cesse. Construite à partir d'anciens moteurs de grues portuaires, elle est capable d'envoyer des projectils à un rythme effréné.",
            "capacity": "Dégâts faibles, cadence élevée."
        },
        "air_shooter": {
            "description": "Cette tourelle, basée sur d'anciens systèmes de DCA (Defensive Counterair), fonctionne presque comme à l'origine. Ses opérateurs, dorénavant robotiques, utilisent l'arme pour projeter des billes perforantes à haute vitesse.",
            "capacity": "Tire des projectiles perçants (efficaces contre les gros monstres) à haute fréquence."
        },
        "basic_shooter": {
            "description": "Tourelle standard bricolée à partir d’un découpeur laser industriel. Elle offre un équilibre efficace entre cadence, portée et puissance.",
            "capacity": "Bonne portée. Bon dégâts. Bonne cadence. Une tourelle qui a rendu de fiers services et qui continera à en rendre."
        },
        "fire_tower": {
            "description": "Un simple lance-flamme automatisé affecté à la destructions de monstres. Il couvre les ennemis de substances inflammables (carburant ou napalm) puis change de cible immédiatement.",
            "capacity": "Met les ennemis en feu, un par un, inlassablement."
        },
        "ice_tower": {
            "description": "Système d'extinction d'incendie de réacteur d'avion greffé à un robot d'assemblage industriel, cette tourelle tente de ralentir la progression ennemie par le froid.",
            "capacity": "Tirs glacés ralentissant la cible."
        },
        "railgun_tower": {
            "description": "Fruit d’une technologie prototypaire de la fin de l'Âge des Humains, cette arme magnétique accumule de l'énergie cynétique dans un projectile dévastateur.",
            "capacity": "Dégâts massifs, cadence lente."
        },
        "venom_tower": {
            "description": "Une tour bricolée par la classe de première année de l'école des ingénieurs, elle tire des flasques biologiques. Ce système aurait été interdit par la Convention de Genève à l'époque. Les ennemis, nerveusement désorientés, sont forcés de faire demi-tour.",
            "capacity": "Tirs de poison qui font reculer l'ennemi."
        },
        "sniper_tower": {
            "description": "Surélevée, cette tourelle semble réfléchir avant de lâcher un trait noir d’une létalité rare.",
            "capacity": "Dégâts très élevés, portée extrême."
        },
        "storm_tower": {
            "description": "Système de tir simple, munitions ultra-technologiques qui rebondissent entre les ennemis. Nom de code : STORM",
            "capacity": "Munitions rebondissantes."
        },
        "decay_tower": {
            "description": "Cette tour maintient ses canons en rotation lente pour gagner du temps de préparation lorsque l'ennemi apparaît. Elle est fumante, grinçante, et dégage une odeur de brûlé. Ses tirs broient les armures.",
            "capacity": "Petits projectiles efficaces contre les cibles blindées. Haute cadence de tir."
        },
        "multi_shot_tower": {
            "description": "Tourelle laser, son faisceau passe par un prisme qui le divise en trois éclats distincts, capables de toucher plusieurs cibles simultanément.",
            "capacity": "Tire trois projectiles à chaque salve. Dégâts moyens."
        }
    }
}