// enemyDesigns.js - 敌人设计配置

// 👾 敌人类型设计
export const ENEMY_DESIGNS = {
    drone: {
        name: "侦察无人机",
        type: "drone",         // 明确的敌人类型标识符
        size: { width: 12, height: 8 },
        color: "#FF6666",
        accent: "#FFAA00",
        health: 1,
        description: "基础飞行单位"
    },
    soldier: {
        name: "机械士兵", 
        type: "soldier",       // 明确的敌人类型标识符
        size: { width: 14, height: 18 },
        color: "#666666",
        accent: "#FF4444",
        health: 3,
        description: "地面步兵单位"
    },
    heavy: {
        name: "重型机甲",
        type: "heavy",         // 明确的敌人类型标识符
        size: { width: 20, height: 24 },
        color: "#444444",
        accent: "#FFAA00",
        health: 8,
        description: "装甲单位"
    },
    flyer: {
        name: "攻击飞艇",
        type: "flyer",         // 明确的敌人类型标识符
        size: { width: 24, height: 12 },
        color: "#AA4444",
        accent: "#FF8800",
        health: 5,
        description: "空中火力支援"
    }
}; 