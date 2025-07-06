// obstacleTypes.js - 障碍物类型配置
const OBSTACLE_TYPES = {
    ROCK: {
        type: 'rock',
        name: '岩石',
        health: 100,
        width: 40,
        height: 40,
        primaryColor: 0x666666,
        secondaryColor: 0x444444,
        destructible: true,
        loot: {
            experience: 10,
            coins: 5,
            powerUps: ['HEALTH_PACK']
        }
    },
  
    TREE: {
        type: 'tree',
        name: '大树',
        health: 150,
        width: 50,
        height: 80,
        primaryColor: 0x8b4513,
        secondaryColor: 0x654321,
        destructible: true,
        loot: {
            experience: 15,
            coins: 8,
            powerUps: ['POWER_PILL']
        }
    },
  
    BUILDING: {
        type: 'building',
        name: '建筑',
        health: 300,
        width: 80,
        height: 60,
        primaryColor: 0x888888,
        secondaryColor: 0x666666,
        destructible: true,
        loot: {
            experience: 25,
            coins: 15,
            powerUps: ['SHIELD', 'RAPID_FIRE']
        }
    },
  
    CORAL: {
        type: 'coral',
        name: '珊瑚',
        health: 80,
        width: 45,
        height: 45,
        primaryColor: 0xff6b9d,
        secondaryColor: 0xff8fab,
        destructible: true,
        loot: {
            experience: 12,
            coins: 6,
            powerUps: ['HEALTH_PACK']
        }
    },
  
    ASTEROID: {
        type: 'asteroid',
        name: '小行星',
        health: 200,
        width: 60,
        height: 60,
        primaryColor: 0x555555,
        secondaryColor: 0x333333,
        destructible: true,
        loot: {
            experience: 20,
            coins: 12,
            powerUps: ['POWER_PILL', 'SHIELD']
        }
    },
  
    // 不可摧毁的障碍物
    WALL: {
        type: 'wall',
        name: '墙壁',
        health: 999999,
        width: 100,
        height: 20,
        primaryColor: 0x444444,
        secondaryColor: 0x222222,
        destructible: false
    },
  
    PILLAR: {
        type: 'pillar',
        name: '石柱',
        health: 999999,
        width: 30,
        height: 100,
        primaryColor: 0x666666,
        secondaryColor: 0x444444,
        destructible: false
    }
};

// 🌍 关卡对应的障碍物配置
const LEVEL_OBSTACLE_CONFIG = {
    'forest': {
        types: ['ROCK', 'TREE', 'PILLAR'],
        density: 0.3, // 障碍物密度
        maxCount: 15,
        spawnPattern: 'scattered'
    },
    'city': {
        types: ['BUILDING', 'WALL', 'PILLAR'],
        density: 0.4,
        maxCount: 20,
        spawnPattern: 'grid'
    },
    'ocean': {
        types: ['CORAL', 'ROCK'],
        density: 0.25,
        maxCount: 12,
        spawnPattern: 'clusters'
    },
    'desert': {
        types: ['ROCK', 'PILLAR'],
        density: 0.2,
        maxCount: 10,
        spawnPattern: 'scattered'
    },
    'space': {
        types: ['ASTEROID', 'ROCK'],
        density: 0.35,
        maxCount: 18,
        spawnPattern: 'random'
    }
};

// 🎯 障碍物生成模式
const OBSTACLE_SPAWN_PATTERNS = {
    scattered: {
        minDistance: 100,
        maxDistance: 300,
        clusterSize: 1
    },
    grid: {
        minDistance: 150,
        maxDistance: 200,
        clusterSize: 3
    },
    clusters: {
        minDistance: 80,
        maxDistance: 250,
        clusterSize: 4
    },
    random: {
        minDistance: 120,
        maxDistance: 400,
        clusterSize: 2
    }
}; 