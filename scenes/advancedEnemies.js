// advancedEnemies.js - 高级场景专用敌人
export const ADVANCED_ENEMY_TYPES = {
    // 🔧 机械内部敌人
    REPAIR_DRONE: {
        name: '维修无人机',
        health: 40,
        speed: 80,
        damage: 15,
        color: 0x888888,
        size: 25,
        behavior: 'patrol',
        special: 'repair'
    },
  
    MECHANICAL_SPIDER: {
        name: '机械蜘蛛',
        health: 60,
        speed: 120,
        damage: 20,
        color: 0x333333,
        size: 30,
        behavior: 'ambush',
        special: 'web'
    },
  
    // 🔬 微观世界敌人
    VIRUS: {
        name: '病毒',
        health: 20,
        speed: 150,
        damage: 12,
        color: 0x00ff00,
        size: 15,
        behavior: 'swarm',
        special: 'multiply'
    },
  
    BACTERIA: {
        name: '细菌',
        health: 35,
        speed: 60,
        damage: 18,
        color: 0xffff00,
        size: 20,
        behavior: 'drift',
        special: 'poison'
    },
  
    // 💻 赛博空间敌人
    TROJAN_HORSE: {
        name: '木马程序',
        health: 80,
        speed: 90,
        damage: 25,
        color: 0xff0000,
        size: 40,
        behavior: 'deceive',
        special: 'disguise'
    },
  
    WORM_VIRUS: {
        name: '蠕虫病毒',
        health: 45,
        speed: 100,
        damage: 15,
        color: 0x00ffff,
        size: 25,
        behavior: 'tunnel',
        special: 'replicate'
    },
  
    // 🍄 变异丛林敌人
    MUTANT_BUG: {
        name: '变异昆虫',
        health: 30,
        speed: 140,
        damage: 20,
        color: 0x90ee90,
        size: 20,
        behavior: 'buzz',
        special: 'acid'
    },
  
    WALKING_PLANT: {
        name: '行走植物',
        health: 70,
        speed: 40,
        damage: 30,
        color: 0x228b22,
        size: 35,
        behavior: 'root',
        special: 'entangle'
    },
  
    // 🌀 梦境敌人
    SHADOW_PERSON: {
        name: '阴影人',
        health: 50,
        speed: 110,
        damage: 22,
        color: 0x000000,
        size: 30,
        behavior: 'phase',
        special: 'intangible'
    },
  
    NIGHTMARE: {
        name: '梦魇',
        health: 90,
        speed: 70,
        damage: 35,
        color: 0x8b0000,
        size: 45,
        behavior: 'terrorize',
        special: 'fear'
    },
  
    // ⚡ 天界敌人
    HARPY: {
        name: '鹰身女妖',
        health: 60,
        speed: 160,
        damage: 25,
        color: 0xdaa520,
        size: 30,
        behavior: 'dive',
        special: 'screech'
    },
  
    GRYPHON: {
        name: '狮鹫',
        health: 120,
        speed: 130,
        damage: 40,
        color: 0xcd853f,
        size: 50,
        behavior: 'aerial',
        special: 'claw'
    },
  
    // ⏰ 时空战场敌人
    CYBER_SAMURAI: {
        name: '赛博武士',
        health: 100,
        speed: 120,
        damage: 45,
        color: 0x4169e1,
        size: 35,
        behavior: 'honor',
        special: 'blade'
    },
  
    TIME_SOLDIER: {
        name: '时空士兵',
        health: 80,
        speed: 100,
        damage: 30,
        color: 0xff6600,
        size: 30,
        behavior: 'tactical',
        special: 'timerift'
    },
  
    // 💎 水晶洞穴敌人
    CRYSTAL_GOLEM: {
        name: '水晶魔像',
        health: 150,
        speed: 50,
        damage: 50,
        color: 0x9370db,
        size: 60,
        behavior: 'guard',
        special: 'reflect'
    },
  
    LIGHT_ELEMENTAL: {
        name: '光元素',
        health: 40,
        speed: 180,
        damage: 25,
        color: 0xffffff,
        size: 25,
        behavior: 'beam',
        special: 'blind'
    }
}; 