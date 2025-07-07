// bossDesigns.js - BOSS设计配置

// 🏰 BOSS设计
export const BOSS_DESIGNS = {
    level1: {
        name: "钢铁巨兽",
        size: { width: 80, height: 120 },
        colors: {
            primary: "#444444",    // 深灰装甲
            secondary: "#666666",  // 中灰细节
            accent: "#FF4444",     // 红色能量
            glow: "#FFAA00"        // 黄色发光
        },
        parts: [
            { name: "主体", x: 0, y: 0, w: 80, h: 80 },
            { name: "左臂", x: -30, y: -10, w: 25, h: 40 },
            { name: "右臂", x: 30, y: -10, w: 25, h: 40 },
            { name: "炮台", x: 0, y: -40, w: 20, h: 15 }
        ]
    },
    level2: {
        name: "量子恶魔",
        size: { width: 100, height: 100 },
        colors: {
            primary: "#AA44AA",    // 紫色能量
            secondary: "#444444",  // 黑色实体
            accent: "#FF44FF",     // 亮粉色
            glow: "#AAAAFF"        // 蓝紫光芒
        }
    }
}; 