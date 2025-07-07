// characterDesigns.js - 角色设计配置

// 🎨 角色设计配色方案
export const CHARACTER_DESIGNS = {
    warrior: {
        name: "钢铁战士",
        role: "warrior",       // 明确的角色类型标识符
        primary: "#FF4444",    // 红色装甲
        secondary: "#FFAA00",  // 金色细节
        accent: "#FFFFFF",     // 白色高光
        description: "重装机甲战士，厚重装甲"
    },
    archer: {
        name: "量子射手", 
        role: "archer",        // 明确的角色类型标识符
        primary: "#44FF44",    // 绿色能量
        secondary: "#00FFAA",  // 青色细节
        accent: "#FFFFFF",
        description: "轻型侦察兵，能量弓箭"
    },
    mage: {
        name: "等离子法师",
        role: "mage",          // 明确的角色类型标识符
        primary: "#4444FF",    // 蓝色能量
        secondary: "#AA44FF",  // 紫色魔法
        accent: "#FFFF00",     // 黄色电弧
        description: "能量操控者，等离子法杖"
    },
    assassin: {
        name: "幽影刺客",
        role: "assassin",      // 明确的角色类型标识符
        primary: "#AA44AA",    // 紫色隐身
        secondary: "#444444",  // 黑色潜行
        accent: "#FF44FF",     // 粉色能量刀
        description: "隐形特工，能量匕首"
    },
    tank: {
        name: "护盾卫士",
        role: "tank",          // 明确的角色类型标识符
        primary: "#FFAA44",    // 橙色护盾
        secondary: "#FF4444",  // 红色装甲
        accent: "#FFFF44",     // 黄色能量
        description: "防御专家，能量护盾"
    }
}; 