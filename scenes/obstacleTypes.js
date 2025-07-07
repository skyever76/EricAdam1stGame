// obstacleTypes.js - 障碍物类型配置
import { POWER_UP_TYPES } from './PowerUpDef.js';

// 🎨 障碍物视觉绘制函数
const ObstacleVisualizers = {
    drawRock: (graphics, data) => {
        // 不规则岩石形状
        graphics.beginPath();
        graphics.moveTo(-data.width/2, -data.height/2);
        graphics.lineTo(data.width/2, -data.height/3);
        graphics.lineTo(data.width/3, data.height/2);
        graphics.lineTo(-data.width/3, data.height/2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        // 岩石纹理
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * data.width * 0.6;
            const y = (Math.random() - 0.5) * data.height * 0.6;
            graphics.fillStyle(0x666666);
            graphics.fillCircle(x, y, 3);
        }
    },

    drawTree: (graphics, data) => {
        // 树干
        graphics.fillRect(-data.width/4, -data.height/2, data.width/2, data.height);
        graphics.strokeRect(-data.width/4, -data.height/2, data.width/2, data.height);
        
        // 树冠
        graphics.fillStyle(0x2d5016);
        graphics.fillCircle(0, -data.height/2, data.width/2);
        graphics.strokeCircle(0, -data.height/2, data.width/2);
        
        // 树叶细节
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * (data.width * 0.3);
            const y = -data.height/2 + Math.sin(angle) * (data.height * 0.3);
            graphics.fillStyle(0x4a5d23);
            graphics.fillCircle(x, y, 8);
        }
    },

    drawBuilding: (graphics, data) => {
        // 建筑主体
        graphics.fillRect(-data.width/2, -data.height/2, data.width, data.height);
        graphics.strokeRect(-data.width/2, -data.height/2, data.width, data.height);
        
        // 窗户
        const windowSize = 8;
        const windows = [
            { x: -data.width/4, y: -data.height/4 },
            { x: data.width/4, y: -data.height/4 },
            { x: -data.width/4, y: data.height/4 },
            { x: data.width/4, y: data.height/4 }
        ];
        
        windows.forEach(window => {
            graphics.fillStyle(0x87ceeb);
            graphics.fillRect(window.x - windowSize/2, window.y - windowSize/2, windowSize, windowSize);
            graphics.strokeRect(window.x - windowSize/2, window.y - windowSize/2, windowSize, windowSize);
        });
    },

    drawCoral: (graphics, data) => {
        // 珊瑚主体
        graphics.fillStyle(0xff6b9d);
        graphics.fillCircle(0, 0, data.width/2);
        graphics.strokeCircle(0, 0, data.width/2);
        
        // 珊瑚分支
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const startX = Math.cos(angle) * (data.width * 0.2);
            const startY = Math.sin(angle) * (data.height * 0.2);
            const endX = Math.cos(angle) * (data.width * 0.4);
            const endY = Math.sin(angle) * (data.height * 0.4);
            
            graphics.lineStyle(4, 0xff8fab, 1);
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
        }
    },

    drawAsteroid: (graphics, data) => {
        // 小行星主体
        graphics.fillCircle(0, 0, data.width/2);
        graphics.strokeCircle(0, 0, data.width/2);
        
        // 陨石坑
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * (data.width * 0.3);
            const y = Math.sin(angle) * (data.height * 0.3);
            
            graphics.fillStyle(0x444444);
            graphics.fillCircle(x, y, 6);
        }
    },

    drawWall: (graphics, data) => {
        // 墙壁
        graphics.fillRect(-data.width/2, -data.height/2, data.width, data.height);
        graphics.strokeRect(-data.width/2, -data.height/2, data.width, data.height);
        
        // 砖块纹理
        const brickSize = 8;
        for (let x = -data.width/2; x < data.width/2; x += brickSize) {
            for (let y = -data.height/2; y < data.height/2; y += brickSize) {
                graphics.strokeRect(x, y, brickSize, brickSize);
            }
        }
    },

    drawPillar: (graphics, data) => {
        // 石柱
        graphics.fillRect(-data.width/2, -data.height/2, data.width, data.height);
        graphics.strokeRect(-data.width/2, -data.height/2, data.width, data.height);
        
        // 柱顶装饰
        graphics.fillStyle(0x888888);
        graphics.fillRect(-data.width/2 - 5, -data.height/2 - 5, data.width + 10, 10);
        graphics.strokeRect(-data.width/2 - 5, -data.height/2 - 5, data.width + 10, 10);
    }
};

// 🎯 道具ID常量 - 确保类型安全
const POWER_UP_IDS = {
    HEALTH_PACK: 'HEALTH_PACK',
    POWER_PILL: 'POWER_PILL',
    RAPID_FIRE: 'RAPID_FIRE',
    SHIELD: 'SHIELD'
};

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
        visualizer: ObstacleVisualizers.drawRock,
        loot: {
            experience: 10,
            coins: 5,
            powerUps: [POWER_UP_IDS.HEALTH_PACK] // 使用常量引用
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
        visualizer: ObstacleVisualizers.drawTree,
        loot: {
            experience: 15,
            coins: 8,
            powerUps: [POWER_UP_IDS.POWER_PILL] // 使用常量引用
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
        visualizer: ObstacleVisualizers.drawBuilding,
        loot: {
            experience: 25,
            coins: 15,
            powerUps: [POWER_UP_IDS.SHIELD, POWER_UP_IDS.RAPID_FIRE] // 使用常量引用
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
        visualizer: ObstacleVisualizers.drawCoral,
        loot: {
            experience: 12,
            coins: 6,
            powerUps: [POWER_UP_IDS.HEALTH_PACK] // 使用常量引用
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
        visualizer: ObstacleVisualizers.drawAsteroid,
        loot: {
            experience: 20,
            coins: 12,
            powerUps: [POWER_UP_IDS.POWER_PILL, POWER_UP_IDS.SHIELD] // 使用常量引用
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
        destructible: false,
        visualizer: ObstacleVisualizers.drawWall
    },
  
    PILLAR: {
        type: 'pillar',
        name: '石柱',
        health: 999999,
        width: 30,
        height: 100,
        primaryColor: 0x666666,
        secondaryColor: 0x444444,
        destructible: false,
        visualizer: ObstacleVisualizers.drawPillar
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

export { OBSTACLE_TYPES, LEVEL_OBSTACLE_CONFIG, OBSTACLE_SPAWN_PATTERNS, ObstacleVisualizers, POWER_UP_IDS }; 