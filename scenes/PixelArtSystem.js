// PixelArtSystem.js - 像素风美术系统

// 🎨 角色设计配色方案
const CHARACTERS = {
    warrior: {
        name: "钢铁战士",
        primary: "#FF4444",    // 红色装甲
        secondary: "#FFAA00",  // 金色细节
        accent: "#FFFFFF",     // 白色高光
        description: "重装机甲战士，厚重装甲"
    },
    archer: {
        name: "量子射手", 
        primary: "#44FF44",    // 绿色能量
        secondary: "#00FFAA",  // 青色细节
        accent: "#FFFFFF",
        description: "轻型侦察兵，能量弓箭"
    },
    mage: {
        name: "等离子法师",
        primary: "#4444FF",    // 蓝色能量
        secondary: "#AA44FF",  // 紫色魔法
        accent: "#FFFF00",     // 黄色电弧
        description: "能量操控者，等离子法杖"
    },
    assassin: {
        name: "幽影刺客",
        primary: "#AA44AA",    // 紫色隐身
        secondary: "#444444",  // 黑色潜行
        accent: "#FF44FF",     // 粉色能量刀
        description: "隐形特工，能量匕首"
    },
    tank: {
        name: "护盾卫士",
        primary: "#FFAA44",    // 橙色护盾
        secondary: "#FF4444",  // 红色装甲
        accent: "#FFFF44",     // 黄色能量
        description: "防御专家，能量护盾"
    }
};

// 👾 敌人类型设计
const ENEMY_TYPES = {
    drone: {
        name: "侦察无人机",
        size: { width: 12, height: 8 },
        color: "#FF6666",
        accent: "#FFAA00",
        health: 1,
        description: "基础飞行单位"
    },
    soldier: {
        name: "机械士兵", 
        size: { width: 14, height: 18 },
        color: "#666666",
        accent: "#FF4444",
        health: 3,
        description: "地面步兵单位"
    },
    heavy: {
        name: "重型机甲",
        size: { width: 20, height: 24 },
        color: "#444444",
        accent: "#FFAA00",
        health: 8,
        description: "装甲单位"
    },
    flyer: {
        name: "攻击飞艇",
        size: { width: 24, height: 12 },
        color: "#AA4444",
        accent: "#FF8800",
        health: 5,
        description: "空中火力支援"
    }
};

// 🏰 BOSS设计
const BOSS_DESIGNS = {
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

// 🌍 关卡主题
const LEVEL_THEMES = {
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

// 🎪 道具设计
const POWERUP_DESIGNS = {
    health: {
        colors: ["#44FF44", "#88FF88", "#AAFFAA"],
        symbol: "+",
        glow: "#00FF00"
    },
    ammo: {
        colors: ["#FFAA00", "#FFCC44", "#FFDD88"], 
        symbol: "◊",
        glow: "#FFAA00"
    },
    shield: {
        colors: ["#4444FF", "#6666FF", "#8888FF"],
        symbol: "◈",
        glow: "#0066FF"
    },
    speed: {
        colors: ["#FF44FF", "#FF66FF", "#FF88FF"],
        symbol: "→",
        glow: "#FF00FF"
    }
};

// 🎨 像素艺术绘制系统
class PixelArtSystem {
    constructor(scene) {
        this.scene = scene;
        this.canvas = null;
        this.ctx = null;
        this.initCanvas();
    }

    initCanvas() {
        // 创建离屏Canvas用于像素绘制
        this.canvas = document.createElement('canvas');
        this.canvas.width = 64;
        this.canvas.height = 64;
        this.ctx = this.canvas.getContext('2d');
        
        // 设置像素完美渲染
        this.ctx.imageSmoothingEnabled = false;
    }

    // 🎭 角色绘制函数
    drawCharacter(ctx, x, y, character, frame = 0) {
        const config = CHARACTERS[character];
        if (!config) return;
      
        // 身体主体 - 像素化矩形组合
        ctx.fillStyle = config.primary;
        ctx.fillRect(x-8, y-12, 16, 20);  // 主体
      
        // 头盔/头部
        ctx.fillStyle = config.secondary;
        ctx.fillRect(x-6, y-16, 12, 8);   // 头部
      
        // 眼部发光效果
        ctx.fillStyle = config.accent;
        ctx.fillRect(x-4, y-14, 2, 2);    // 左眼
        ctx.fillRect(x+2, y-14, 2, 2);    // 右眼
      
        // 武器
        this.drawWeapon(ctx, x, y, character);
      
        // 行走动画 - 简单的腿部摆动
        if (frame % 20 < 10) {
            ctx.fillStyle = config.primary;
            ctx.fillRect(x-6, y+8, 4, 8);  // 左腿前
            ctx.fillRect(x+2, y+8, 4, 8);  // 右腿后
        } else {
            ctx.fillRect(x-2, y+8, 4, 8);  // 左腿后
            ctx.fillRect(x+6, y+8, 4, 8);  // 右腿前
        }
    }

    drawWeapon(ctx, x, y, character) {
        const config = CHARACTERS[character];
        ctx.fillStyle = config.accent;
      
        switch(character) {
            case 'warrior':
                // 重型步枪
                ctx.fillRect(x+8, y-8, 12, 3);
                ctx.fillRect(x+16, y-6, 4, 2);
                break;
            case 'archer':
                // 能量弓
                ctx.strokeStyle = config.accent;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x+10, y-4, 6, 0.3, -0.3);
                ctx.stroke();
                break;
            case 'mage':
                // 法杖
                ctx.fillRect(x+8, y-12, 2, 16);
                ctx.fillRect(x+6, y-14, 6, 4);
                break;
            case 'assassin':
                // 能量匕首
                ctx.fillRect(x+8, y-4, 8, 2);
                ctx.fillRect(x+14, y-5, 2, 4);
                break;
            case 'tank':
                // 护盾
                ctx.fillRect(x+8, y-8, 8, 8);
                ctx.fillStyle = config.secondary;
                ctx.fillRect(x+10, y-6, 4, 4);
                break;
        }
    }

    // 👾 敌人绘制函数
    drawEnemy(ctx, x, y, type, frame = 0) {
        const config = ENEMY_TYPES[type];
        if (!config) return;
        
        const { width, height } = config.size;
      
        // 主体
        ctx.fillStyle = config.color;
        ctx.fillRect(x - width/2, y - height/2, width, height);
      
        // 细节和动画
        switch(type) {
            case 'drone':
                // 旋转螺旋桨效果
                ctx.fillStyle = config.accent;
                const propAngle = (frame * 0.5) % (Math.PI * 2);
                for(let i = 0; i < 4; i++) {
                    const angle = propAngle + (i * Math.PI / 2);
                    const px = x + Math.cos(angle) * 6;
                    const py = y + Math.sin(angle) * 6;
                    ctx.fillRect(px-1, py-1, 2, 2);
                }
                break;
              
            case 'soldier':
                // 红色眼部扫描光
                ctx.fillStyle = config.accent;
                ctx.fillRect(x-4, y-6, 8, 2);
              
                // 武器
                ctx.fillRect(x+width/2, y-2, 6, 2);
                break;
              
            case 'heavy':
                // 装甲细节
                ctx.fillStyle = config.accent;
                ctx.fillRect(x-6, y-8, 12, 4);  // 装甲板
                ctx.fillRect(x-4, y+4, 8, 4);   // 腿部装甲
                break;
              
            case 'flyer':
                // 飞行器细节
                ctx.fillStyle = config.accent;
                ctx.fillRect(x-8, y-2, 16, 2);  // 机翼
                ctx.fillRect(x-2, y-4, 4, 8);   // 机身
                break;
        }
    }

    // 🏰 BOSS绘制函数
    drawBoss(ctx, x, y, bossType, frame, health) {
        const boss = BOSS_DESIGNS[bossType];
        if (!boss) return;
        
        const damage = 1 - (health / (boss.maxHealth || 100));
      
        // 受损效果 - 健康度低时闪烁
        if (damage > 0.7 && frame % 10 < 5) {
            ctx.globalAlpha = 0.7;
        }
      
        // 绘制BOSS主体
        if (boss.parts) {
            boss.parts.forEach(part => {
                ctx.fillStyle = boss.colors.primary;
                ctx.fillRect(
                    x + part.x - part.w/2, 
                    y + part.y - part.h/2, 
                    part.w, 
                    part.h
                );
              
                // 能量发光效果
                ctx.fillStyle = boss.colors.accent;
                ctx.fillRect(
                    x + part.x - part.w/2 + 2, 
                    y + part.y - part.h/2 + 2, 
                    part.w - 4, 
                    part.h - 4
                );
            });
        } else {
            // 简单BOSS绘制
            ctx.fillStyle = boss.colors.primary;
            ctx.fillRect(x - boss.size.width/2, y - boss.size.height/2, 
                        boss.size.width, boss.size.height);
        }
      
        // 能量波动效果
        this.drawEnergyEffect(ctx, x, y, boss.colors.glow, frame);
      
        ctx.globalAlpha = 1;
    }

    // 🌍 背景绘制函数
    drawBackground(ctx, cameraX, level) {
        const theme = LEVEL_THEMES[level];
        if (!theme) return;
      
        // 分层渐变天空背景（Phaser兼容）
        const gradientHeight = 400;
        const colorCount = theme.bgColors.length;
        const segmentHeight = gradientHeight / (colorCount - 1);
        
        for (let i = 0; i < colorCount - 1; i++) {
            const startY = i * segmentHeight;
            const endY = (i + 1) * segmentHeight;
            const startColor = theme.bgColors[i];
            const endColor = theme.bgColors[i + 1];
            
            // 创建渐变效果
            for (let y = startY; y < endY; y++) {
                const ratio = (y - startY) / segmentHeight;
                const color = this.interpolateColor(startColor, endColor, ratio);
                ctx.fillStyle = color;
                ctx.fillRect(0, y, 800, 1);
            }
        }
      
        // 视差背景层
        this.drawParallaxLayer(ctx, cameraX, theme, 0.3, "far");     // 远景
        this.drawParallaxLayer(ctx, cameraX, theme, 0.6, "mid");     // 中景
        this.drawParallaxLayer(ctx, cameraX, theme, 1.0, "near");    // 近景
      
        // 地面
        ctx.fillStyle = theme.groundColor;
        ctx.fillRect(0, 400, 800, 200);
    }

    // 🎨 颜色插值函数
    interpolateColor(color1, color2, ratio) {
        const r1 = parseInt(color1.substr(1, 2), 16);
        const g1 = parseInt(color1.substr(3, 2), 16);
        const b1 = parseInt(color1.substr(5, 2), 16);
        
        const r2 = parseInt(color2.substr(1, 2), 16);
        const g2 = parseInt(color2.substr(3, 2), 16);
        const b2 = parseInt(color2.substr(5, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    drawParallaxLayer(ctx, cameraX, theme, speed, layer) {
        const offset = (cameraX * speed) % 800;
        
        switch(layer) {
            case "far":
                // 远景建筑
                ctx.fillStyle = "#222222";
                for (let i = 0; i < 5; i++) {
                    const x = (i * 200 - offset) % 800;
                    ctx.fillRect(x, 300, 60, 100);
                }
                break;
            case "mid":
                // 中景结构
                ctx.fillStyle = "#444444";
                for (let i = 0; i < 8; i++) {
                    const x = (i * 120 - offset) % 800;
                    ctx.fillRect(x, 350, 40, 50);
                }
                break;
            case "near":
                // 近景细节
                ctx.fillStyle = "#666666";
                for (let i = 0; i < 12; i++) {
                    const x = (i * 80 - offset) % 800;
                    ctx.fillRect(x, 380, 20, 20);
                }
                break;
        }
    }

    // 🎪 道具绘制（带发光和旋转效果）
    drawPowerUp(ctx, x, y, type, frame) {
        const design = POWERUP_DESIGNS[type];
        if (!design) return;
        
        const rotation = (frame * 0.1) % (Math.PI * 2);
      
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
      
        // 发光效果
        ctx.shadowColor = design.glow;
        ctx.shadowBlur = 10;
      
        // 主体 - 多层颜色
        design.colors.forEach((color, i) => {
            ctx.fillStyle = color;
            const size = 12 - i * 3;
            ctx.fillRect(-size/2, -size/2, size, size);
        });
      
        // 符号
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(design.symbol, 0, 4);
      
        ctx.restore();
    }

    // ⚡ 能量效果绘制
    drawEnergyEffect(ctx, x, y, color, frame) {
        const waveCount = 3;
        const maxRadius = 30;
        
        for (let i = 0; i < waveCount; i++) {
            const waveOffset = (frame * 0.1 + i * Math.PI / 3) % (Math.PI * 2);
            const radius = (frame * 0.5 + i * 10) % maxRadius;
            const alpha = 1 - (radius / maxRadius);
            
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    // 🎨 创建像素纹理
    createPixelTexture(key, drawFunction, width = 32, height = 32) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        
        // 调用绘制函数
        drawFunction(this.ctx, width/2, height/2);
        
        // 创建Phaser纹理
        this.scene.textures.addCanvas(key, this.canvas);
        return key;
    }

    // 🎭 创建角色纹理
    createCharacterTextures() {
        Object.keys(CHARACTERS).forEach(character => {
            // 创建多个动画帧
            for (let frame = 0; frame < 4; frame++) {
                const key = `${character}_${frame}`;
                this.createPixelTexture(key, (ctx, x, y) => {
                    this.drawCharacter(ctx, x, y, character, frame);
                });
            }
        });
    }

    // 👾 创建敌人纹理
    createEnemyTextures() {
        Object.keys(ENEMY_TYPES).forEach(enemyType => {
            // 创建多个动画帧
            for (let frame = 0; frame < 4; frame++) {
                const key = `${enemyType}_${frame}`;
                this.createPixelTexture(key, (ctx, x, y) => {
                    this.drawEnemy(ctx, x, y, enemyType, frame);
                });
            }
        });
    }

    // 🏰 创建BOSS纹理
    createBossTextures() {
        Object.keys(BOSS_DESIGNS).forEach(bossType => {
            const boss = BOSS_DESIGNS[bossType];
            const key = `boss_${bossType}`;
            this.createPixelTexture(key, (ctx, x, y) => {
                this.drawBoss(ctx, x, y, bossType, 0, 100);
            }, boss.size.width, boss.size.height);
        });
    }

    // 🎪 创建道具纹理
    createPowerUpTextures() {
        Object.keys(POWERUP_DESIGNS).forEach(powerUpType => {
            // 创建多个动画帧
            for (let frame = 0; frame < 8; frame++) {
                const key = `${powerUpType}_${frame}`;
                this.createPixelTexture(key, (ctx, x, y) => {
                    this.drawPowerUp(ctx, x, y, powerUpType, frame);
                });
            }
        });
    }

    // 🎨 初始化所有纹理
    initAllTextures() {
        console.log('PixelArtSystem: 开始创建像素风纹理...');
        this.createCharacterTextures();
        this.createEnemyTextures();
        this.createBossTextures();
        this.createPowerUpTextures();
        console.log('PixelArtSystem: 像素风纹理创建完成');
    }
}

// 导出到全局
window.PixelArtSystem = PixelArtSystem;
window.CHARACTERS = CHARACTERS;
window.ENEMY_TYPES = ENEMY_TYPES;
window.BOSS_DESIGNS = BOSS_DESIGNS;
window.LEVEL_THEMES = LEVEL_THEMES;
window.POWERUP_DESIGNS = POWERUP_DESIGNS; 