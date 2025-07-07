// levelThemes.js - 关卡主题配置

// 🌍 关卡主题
export const LEVEL_THEMES = {
    1: {
        name: "工业废墟",
        bgColors: ["#1a1a2e", "#16213e", "#0f3460"],  // 深蓝渐变
        groundColor: "#333333",
        obstacles: ["factory", "pipes", "containers"],
        atmosphere: "pollution"
    },
    2: {
        name: "能量矩阵", 
        bgColors: ["#2d1b69", "#11055c", "#130f40"],  // 紫色空间
        groundColor: "#444466",
        obstacles: ["crystals", "energy_nodes", "portals"],
        atmosphere: "electric"
    },
    3: {
        name: "机械城市",
        bgColors: ["#ff6b6b", "#ee5a24", "#ea2027"],  // 红色警戒
        groundColor: "#666666", 
        obstacles: ["buildings", "towers", "bridges"],
        atmosphere: "neon"
    }
}; 