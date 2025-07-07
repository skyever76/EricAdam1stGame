// scenes/configs.js - 全局配置文件

// 🎮 游戏核心配置
window.GAME_CONFIG = {
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
window.UI_LAYOUT = {
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
window.WEAPON_CONFIGS = {
    AK47: {
        name: 'AK47',
        damage: 15,
        fireRate: 200,
        bulletSpeed: 600,
        bulletSize: { width: 8, height: 8 },
        bulletColor: 0xffff00,
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
        bulletColor: 0xff6600,
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
        bulletColor: 0xff0000,
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
        bulletColor: 0x00ffff,
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
        bulletColor: 0xff00ff,
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
        bulletColor: 0xff0000,
        texture: 'nuke',
        burstCount: 1,
        burstDelay: 0,
        bulletCost: 200,
        isContinuous: false,
        duration: 0
    }
};

// 🎨 颜色配置
window.COLOR_CONFIG = {
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

// 🎵 音效配置
window.SOUND_CONFIG = {
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

// 🎯 成就配置
window.ACHIEVEMENT_CONFIG = {
    FIRST_KILL: { id: 'firstKill', name: '首次击杀', desc: '击败第一个敌人', kills: 1 },
    KILLER_10: { id: 'killer10', name: '新手猎手', desc: '击杀10个敌人', kills: 10 },
    KILLER_50: { id: 'killer50', name: '经验猎手', desc: '击杀50个敌人', kills: 50 },
    SCORER_1000: { id: 'scorer1000', name: '千分达人', desc: '单局得分1000', score: 1000 },
    SURVIVOR_60: { id: 'survivor60', name: '生存专家', desc: '生存60秒', time: 60000 },
    DEATH_10: { id: 'death10', name: '不屈意志', desc: '死亡10次仍不放弃', deaths: 10 }
};

// 🌍 关卡配置
window.LEVEL_CONFIG = {
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