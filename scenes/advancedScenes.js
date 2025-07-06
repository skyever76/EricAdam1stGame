// advancedScenes.js - 高级场景配置
const ADVANCED_SCENES = {
    // 🔧 巨型机械内部
    INSIDE_GOLEM: {
        id: 'inside_golem',
        name: '巨型机械内部',
        description: '在运作的古代魔像内部战斗',
        backgroundColor: 0x2a1810,
        ambientColor: 0xff8800,
        music: 'mechanicalAmbient',
      
        // 视觉特效
        effects: {
            steam: true,
            electricArcs: true,
            rotatingGears: true,
            pistons: true,
            energyFlow: true
        },
      
        // 环境危害
        hazards: {
            steamJets: { damage: 15, interval: 3000 },
            electricShock: { damage: 25, probability: 0.1 },
            crushingPistons: { damage: 50, warningTime: 1000 }
        },
      
        // 特殊机制
        mechanics: {
            destructiblePipes: true,
            movingPlatforms: true,
            powerNodes: true
        },
      
        enemies: ['REPAIR_DRONE', 'MECHANICAL_SPIDER', 'STEAM_GOLEM'],
        boss: 'CORE_BRAIN',
      
        obstacles: ['GEAR_OBSTACLE', 'STEAM_PIPE', 'ELECTRIC_CONDUIT']
    },
  
    // 🔬 微观人体世界
    MICROSCOPIC_WORLD: {
        id: 'microscopic_world',
        name: '微观人体世界',
        description: '在生物体内的纳米战场',
        backgroundColor: 0x8b0000,
        ambientColor: 0xff6b6b,
        music: 'biologicalAmbient',
      
        effects: {
            bloodFlow: true,
            cellDivision: true,
            organicPulse: true,
            dnaStrands: true
        },
      
        hazards: {
            antibodies: { damage: 20, trackingSpeed: 100 },
            toxicArea: { damage: 5, tickRate: 500 },
            bloodClot: { obstruction: true, health: 100 }
        },
      
        mechanics: {
            bloodCurrent: true,
            cellAbsorption: true,
            immuneResponse: true
        },
      
        enemies: ['VIRUS', 'BACTERIA', 'CANCER_CELL', 'NANO_ROBOT'],
        boss: 'GIANT_PHAGE',
      
        obstacles: ['BLOOD_CLOT', 'TISSUE_WALL', 'NERVE_FIBER']
    },
  
    // 💻 赛博数据洪流
    CYBERSPACE: {
        id: 'cyberspace',
        name: '赛博数据洪流',
        description: '在虚拟世界中对抗AI',
        backgroundColor: 0x000022,
        ambientColor: 0x00ffff,
        music: 'cyberspaceAmbient',
      
        effects: {
            dataStream: true,
            glitchArt: true,
            codeRain: true,
            gridLines: true,
            digitalNoise: true
        },
      
        hazards: {
            glitchZone: { effect: 'confusion', duration: 2000 },
            firewall: { damage: 30, blockage: true },
            virusCloud: { damage: 10, spreading: true }
        },
      
        mechanics: {
            realityGlitch: true,
            dataNodeHacking: true,
            quantumTunnel: true
        },
      
        enemies: ['TROJAN_HORSE', 'WORM_VIRUS', 'FIREWALL_GUARDIAN', 'AI_SENTINEL'],
        boss: 'MASTER_AI',
      
        obstacles: ['DATA_WALL', 'ENCRYPTION_BARRIER', 'QUANTUM_GATE']
    },
  
    // 🍄 废土异变丛林
    MUTATED_JUNGLE: {
        id: 'mutated_jungle',
        name: '废土异变丛林',
        description: '核辐射后的变异植物世界',
        backgroundColor: 0x1a4d1a,
        ambientColor: 0x90ee90,
        music: 'mutatedAmbient',
      
        effects: {
            toxicSpores: true,
            bioluminescence: true,
            radioactiveGlow: true,
            mutatedGrowth: true
        },
      
        hazards: {
            poisonSpores: { damage: 8, duration: 5000 },
            acidSap: { damage: 15, corrosive: true },
            carnivoriousPlant: { grab: true, damage: 25 }
        },
      
        mechanics: {
            plantGrowth: true,
            sporeInfection: true,
            lightInteraction: true
        },
      
        enemies: ['MUTANT_BUG', 'WALKING_PLANT', 'FUNGAL_ZOMBIE', 'SPORE_MOTHER'],
        boss: 'PLANT_OVERLORD',
      
        obstacles: ['MUTANT_TREE', 'ACID_POOL', 'THORNY_VINE']
    },
  
    // 🌀 梦境潜意识
    DREAM_REALM: {
        id: 'dream_realm',
        name: '梦境潜意识',
        description: '超现实的梦境世界',
        backgroundColor: 0x2d1b69,
        ambientColor: 0x9d4edd,
        music: 'dreamAmbient',
      
        effects: {
            realityWarp: true,
            floatingObjects: true,
            colorShift: true,
            meltingClocks: true,
            impossible_geometry: true
        },
      
        hazards: {
            nightmare: { fear: true, damage: 20 },
            realityTear: { teleport: true, damage: 15 },
            memoryFog: { confusion: true, vision: 0.5 }
        },
      
        mechanics: {
            gravityShift: true,
            shapeShifting: true,
            thoughtManifestation: true
        },
      
        enemies: ['SHADOW_PERSON', 'NIGHTMARE', 'MEMORY_FRAGMENT', 'FEAR_INCARNATE'],
        boss: 'DREAM_DEVOURER',
      
        obstacles: ['FLOATING_PLATFORM', 'THOUGHT_BARRIER', 'TIME_DISTORTION']
    },
  
    // ⚡ 神话天界
    CELESTIAL_REALM: {
        id: 'celestial_realm',
        name: '神话天界',
        description: '神明居住的天界领域',
        backgroundColor: 0x87ceeb,
        ambientColor: 0xffd700,
        music: 'celestialAmbient',
      
        effects: {
            divineLight: true,
            cloudFormation: true,
            rainbowBridge: true,
            holyAura: true,
            celestialRunes: true
        },
      
        hazards: {
            divineLightning: { damage: 40, chain: true },
            holyFire: { damage: 25, purifying: true },
            celestialStorm: { knockback: 200, damage: 20 }
        },
      
        mechanics: {
            divineBlessing: true,
            skyWalking: true,
            mythicPower: true
        },
      
        enemies: ['HARPY', 'GRYPHON', 'ANGEL_GUARDIAN', 'TITAN_GUARD'],
        boss: 'FALLEN_GOD',
      
        obstacles: ['CLOUD_PLATFORM', 'DIVINE_BARRIER', 'CELESTIAL_PILLAR']
    },
  
    // ⏰ 时空古战场
    TIME_WARPED_BATTLEFIELD: {
        id: 'time_warped_battlefield',
        name: '时空错乱古战场',
        description: '未来科技入侵古代战场',
        backgroundColor: 0x4a4a4a,
        ambientColor: 0xff6600,
        music: 'timeWarpAmbient',
      
        effects: {
            temporalRift: true,
            anachronism: true,
            timeDistortion: true,
            culturalClash: true
        },
      
        hazards: {
            timeStorm: { displacement: true, damage: 30 },
            ancientCurse: { debuff: true, duration: 10000 },
            futureTech: { overload: true, damage: 35 }
        },
      
        mechanics: {
            timeTech: true,
            culturalFusion: true,
            paradoxEffect: true
        },
      
        enemies: ['CYBER_SAMURAI', 'ROBO_GLADIATOR', 'TIME_SOLDIER', 'TECH_SHAMAN'],
        boss: 'TEMPORAL_OVERLORD',
      
        obstacles: ['ANCIENT_WALL', 'FUTURE_SHIELD', 'TIME_CRYSTAL']
    },
  
    // 💎 水晶溶洞
    CRYSTAL_CAVERNS: {
        id: 'crystal_caverns',
        name: '水晶溶洞',
        description: '发光水晶构成的地心世界',
        backgroundColor: 0x1a1a2e,
        ambientColor: 0x9370db,
        music: 'crystalAmbient',
      
        effects: {
            crystalGlow: true,
            lightRefraction: true,
            resonance: true,
            prismaticRainbow: true
        },
      
        hazards: {
            crystalSpike: { piercing: true, damage: 35 },
            lightBeam: { reflected: true, damage: 20 },
            resonanceShock: { sonic: true, damage: 25 }
        },
      
        mechanics: {
            lightReflection: true,
            crystalDestruction: true,
            energyConduction: true
        },
      
        enemies: ['CRYSTAL_GOLEM', 'LIGHT_ELEMENTAL', 'PRISM_GUARDIAN', 'ECHO_SPIRIT'],
        boss: 'CRYSTAL_CORE',
      
        obstacles: ['CRYSTAL_WALL', 'PRISM_BLOCK', 'ENERGY_CRYSTAL']
    }
}; 