// scenes/configs.js - ES6模块配置文件

// 🎨 颜色配置（优先定义，供其他配置引用）
export const COLOR_CONFIG = {
    // 基础颜色
    WHITE: 0xffffff,
    BLACK: 0x000000,
    RED: 0xff0000,
    GREEN: 0x00ff00,
    BLUE: 0x0000ff,
    YELLOW: 0xffff00,
    CYAN: 0x00ffff,
    MAGENTA: 0xff00ff,
    ORANGE: 0xff6600,
    
    // UI颜色
    UI_BACKGROUND: 0x000000,
    UI_BORDER: 0xffffff,
    UI_TEXT: 0xffffff,
    UI_HIGHLIGHT: 0xffff00,
    
    // 状态颜色
    HEALTH_FULL: 0x00ff00,
    HEALTH_MEDIUM: 0xffff00,
    HEALTH_LOW: 0xff0000,
    
    // 武器颜色
    WEAPON_ACTIVE: 0x00ff00,
    WEAPON_INACTIVE: 0x666666,
    WEAPON_COOLDOWN: 0xff0000
};

// 🎮 游戏核心配置
export const GAME_CONFIG = {
    // 世界边界
    WORLD_WIDTH: 4000,
    WORLD_HEIGHT: 720,
    
    // 摄像机设置
    CAMERA_LERP_X: 0.1,
    CAMERA_LERP_Y: 0.1,
    CAMERA_DEADZONE_X: 200,
    CAMERA_DEADZONE_Y: 100,
    
    // 玩家设置
    PLAYER_SPEED: 400,
    PLAYER_SIZE: 40,
    MAX_HEALTH: 100,
    
    // 敌人生成
    ENEMY_SPAWN_RATE: 2000, // 毫秒
    MAX_ENEMIES: 10,
    ENEMY_SPEED: 100,
    
    // 关卡设置
    LEVEL_COMPLETE_TIME: 120000, // 毫秒
    TARGET_KILLS: 30,
    
    // 子弹设置
    BULLET_LIFETIME: 3000, // 毫秒
    BULLET_BOUNDARY_MARGIN: 100,
    
    // 粒子效果
    PARTICLE_COUNT: 20,
    EXPLOSION_DURATION: 1000,
    
    // 音效设置
    SOUND_VOLUME: 0.5,
    MUSIC_VOLUME: 0.3
};

// 🎯 UI布局配置
export const UI_LAYOUT = {
    // HUD位置
    SCORE_POS: { x: 20, y: 20 },
    HEALTH_POS: { x: 20, y: 60 },
    WEAPON_POS: { x: 20, y: 100 },
    KILL_COUNT_POS: { x: 20, y: 140 },
    TIME_POS: { x: 20, y: 180 },
    
    // 进度条位置
    DISTANCE_PROGRESS_POS: { x: 640, y: 680 },
    DISTANCE_PROGRESS_SIZE: { width: 800, height: 20 },
    
    // 小地图位置
    MINIMAP_POS: { x: 1200, y: 100 },
    MINIMAP_SIZE: { width: 200, height: 150 },
    
    // 对话框位置
    DIALOG_CENTER: { x: 640, y: 360 },
    DIALOG_SIZE: { width: 500, height: 400 },
    
    // 音效控制位置
    AUDIO_CONTROLS_POS: { x: 1200, y: 300 },
    
    // 统计按钮位置
    STATS_BUTTON_POS: { x: 1200, y: 400 }
};

// 🔫 武器配置
export const WEAPON_CONFIGS = {
    AK47: {
        name: 'AK47',
        damage: 15,
        fireRate: 200,
        bulletSpeed: 600,
        bulletSize: { width: 8, height: 8 },
        bulletColor: COLOR_CONFIG.YELLOW, // 🔧 引用颜色配置
        texture: 'ak47',
        burstCount: 3,
        burstDelay: 50,
        bulletCost: 0,
        isContinuous: false,
        duration: 0
    },
    
    DESERT_EAGLE: {
        name: '沙漠之鹰',
        damage: 60,
        fireRate: 300,
        bulletSpeed: 800,
        bulletSize: { width: 12, height: 12 },
        bulletColor: COLOR_CONFIG.ORANGE, // 🔧 引用颜色配置
        texture: 'pistol',
        burstCount: 1,
        burstDelay: 0,
        bulletCost: 0,
        isContinuous: false,
        duration: 0
    },
    
    GATLING: {
        name: '加特林',
        damage: 12,
        fireRate: 100,
        bulletSpeed: 700,
        bulletSize: { width: 6, height: 6 },
        bulletColor: COLOR_CONFIG.RED, // 🔧 引用颜色配置
        texture: 'gatling',
        burstCount: 1,
        burstDelay: 0,
        bulletCost: 0,
        isContinuous: true,
        duration: 5000
    },
    
    SONIC_GUN: {
        name: '声波枪',
        damage: 60,
        fireRate: 150,
        bulletSpeed: 900,
        bulletSize: { width: 10, height: 10 },
        bulletColor: COLOR_CONFIG.CYAN, // 🔧 引用颜色配置
        texture: 'tesla',
        burstCount: 1,
        burstDelay: 0,
        bulletCost: 0,
        isContinuous: false,
        duration: 0
    },
    
    MISSILE: {
        name: '导弹',
        damage: 300,
        fireRate: 1000,
        bulletSpeed: 400,
        bulletSize: { width: 16, height: 16 },
        bulletColor: COLOR_CONFIG.MAGENTA, // 🔧 引用颜色配置
        texture: 'missile',
        burstCount: 1,
        burstDelay: 0,
        bulletCost: 50,
        isContinuous: false,
        duration: 0
    },
    
    NUKE: {
        name: '核弹',
        damage: 999,
        fireRate: 1000,
        bulletSpeed: 300,
        bulletSize: { width: 20, height: 20 },
        bulletColor: COLOR_CONFIG.RED, // 🔧 引用颜色配置
        texture: 'nuke',
        burstCount: 1,
        burstDelay: 0,
        bulletCost: 200,
        isContinuous: false,
        duration: 0
    }
};

// 🎵 音效配置
export const SOUND_CONFIG = {
    // 音效类型
    SHOOT: 'shoot',
    HIT: 'hit',
    EXPLOSION: 'explosion',
    DAMAGE: 'damage',
    DEATH: 'death',
    POWERUP: 'powerup',
    GAME_OVER: 'game_over',
    
    // 音量设置
    DEFAULT_VOLUME: 0.5,
    MUSIC_VOLUME: 0.3,
    SFX_VOLUME: 0.6
};

// 🏆 成就配置
export const ACHIEVEMENT_CONFIG = {
    firstKill: { 
        name: "首次击杀", 
        desc: "击败第一个敌人", 
        condition: { stat: 'totalKills', value: 1 } 
    },
    killer10: { 
        name: "新手猎手", 
        desc: "击杀10个敌人", 
        condition: { stat: 'totalKills', value: 10 } 
    },
    killer50: { 
        name: "经验猎手", 
        desc: "击杀50个敌人", 
        condition: { stat: 'totalKills', value: 50 } 
    },
    scorer1000: { 
        name: "千分达人", 
        desc: "单局得分1000", 
        condition: { stat: 'highestScore', value: 1000 } 
    },
    survivor60: { 
        name: "生存专家", 
        desc: "生存60秒", 
        condition: { stat: 'longestSurvival', value: 60000 } 
    },
    death10: { 
        name: "不屈意志", 
        desc: "死亡10次仍不放弃", 
        condition: { stat: 'totalDeaths', value: 10 } 
    }
};

// 🌍 关卡配置
export const LEVEL_CONFIG = {
    // 关卡类型
    FOREST: 'forest',
    CITY: 'city',
    OCEAN: 'ocean',
    DESERT: 'desert',
    SPACE: 'space',
    
    // 背景类型
    BACKGROUND_TYPES: {
        PARALLAX: 'parallax',
        PIXEL_ART: 'pixel_art',
        SIMPLE: 'simple'
    },
    
    // 主题类型
    THEME_TYPES: {
        TECH_GRID: 'tech_grid',
        CLOUD: 'cloud',
        CIRCUIT: 'circuit',
        STAR_FIELD: 'star_field',
        HEXAGON: 'hexagon',
        WAVE: 'wave'
    }
};

export const PLAYER_CONFIGS = [
    { key: 'soldier', name: '士兵', description: '平衡型，攻防兼备', speed: 400, health: 100 },
    { key: 'diver', name: '坦克', description: '防御型，生命值高', speed: 350, health: 200 },
    { key: 'tank', name: '骑士', description: '攻击型，伤害高', speed: 300, health: 90, damageMultiplier: 1.5 },
    { key: 'spaceship', name: '战机', description: '特殊型，技能独特', speed: 500, health: 70, initPoints: 500 }
];

export const ASSET_CONFIG = {
    IMAGES: [
        { key: 'soldier', path: 'images/characters/soldier.png' },
        { key: 'diver', path: 'images/characters/diver.png' },
        { key: 'tank', path: 'images/characters/tank.png' },
        { key: 'spaceship', path: 'images/characters/spaceship.png' },
        { key: 'elf', path: 'images/characters/elf.png' },
        { key: 'alien', path: 'images/enemies/alien.png' },
        { key: 'robot', path: 'images/enemies/robot.png' },
        { key: 'scorpion', path: 'images/enemies/scorpion.png' },
        { key: 'shark', path: 'images/enemies/shark.png' },
        { key: 'wolf', path: 'images/enemies/wolf.png' },
        { key: 'ak47', path: 'images/ak47.png' },
        { key: 'pistol', path: 'images/pistol.png' },
        { key: 'gatling', path: 'images/gatling.png' },
        { key: 'tesla', path: 'images/tesla.png' },
        { key: 'missile', path: 'images/missile.png' },
        { key: 'nuke', path: 'images/nuke.png' },
        { key: 'health', path: 'images/health.png' },
        { key: 'power', path: 'images/power.png' },
        { key: 'background', path: 'images/background.png' },
        { key: 'city', path: 'images/backgrounds/city.png' },
        { key: 'desert', path: 'images/backgrounds/desert.png' },
        { key: 'forest', path: 'images/backgrounds/forest.png' },
        { key: 'ocean', path: 'images/backgrounds/ocean.png' },
        { key: 'space', path: 'images/backgrounds/space.png' },
        { key: 'cosmic-lord', path: 'images/bosses/cosmic-lord.png' },
        { key: 'deep-sea-lord', path: 'images/bosses/deep-sea-lord.png' },
        { key: 'desert-king', path: 'images/bosses/desert-king.png' },
        { key: 'forest-king', path: 'images/bosses/forest-king.png' },
        { key: 'mecha-beast', path: 'images/bosses/mecha-beast.png' },
        { key: 'asteroid', path: 'images/obstacles/asteroid.png' },
        { key: 'building', path: 'images/obstacles/building.png' },
        { key: 'coral', path: 'images/obstacles/coral.png' },
        { key: 'rock', path: 'images/obstacles/rock.png' },
        { key: 'tree', path: 'images/obstacles/tree.png' }
    ],
    AUDIO: [
        { key: 'shoot', path: 'audio/shoot.mp3' },
        { key: 'hit', path: 'audio/hit.mp3' },
        { key: 'explosion', path: 'audio/explosion.mp3' },
        { key: 'damage', path: 'audio/damage.mp3' },
        { key: 'death', path: 'audio/death.mp3' },
        { key: 'powerup', path: 'audio/powerup.mp3' },
        { key: 'game_over', path: 'audio/game_over.mp3' },
        { key: 'bgm_forest', path: 'audio/bgm_forest.mp3' },
        { key: 'bgm_city', path: 'audio/bgm_city.mp3' },
        { key: 'bgm_ocean', path: 'audio/bgm_ocean.mp3' },
        { key: 'bgm_desert', path: 'audio/bgm_desert.mp3' },
        { key: 'bgm_space', path: 'audio/bgm_space.mp3' }
    ]
};

// 存档配置
export const SAVE_KEY = 'gameData';

console.log('✅ configs.js ES6模块已加载'); 