// PixelArtSystem.js - 像素风美术系统

// 导入所有设计配置
import { CHARACTER_DESIGNS } from './characterDesigns.js';
import { ENEMY_DESIGNS } from './enemyDesigns.js';
import { BOSS_DESIGNS } from './bossDesigns.js';
import { LEVEL_THEMES } from './levelThemes.js';
import { POWERUP_DESIGNS } from './powerUpDesigns.js';

// 🎨 像素艺术绘制系统
export class PixelArtSystem {
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
    drawCharacter(ctx, x, y, characterConfig, frame = 0) {
        if (!characterConfig) return;
      
        // 身体主体 - 像素化矩形组合
        ctx.fillStyle = characterConfig.primary;
        ctx.fillRect(x-8, y-12, 16, 20);  // 主体
      
        // 头盔/头部
        ctx.fillStyle = characterConfig.secondary;
        ctx.fillRect(x-6, y-16, 12, 8);   // 头部
      
        // 眼部发光效果
        ctx.fillStyle = characterConfig.accent;
        ctx.fillRect(x-4, y-14, 2, 2);    // 左眼
        ctx.fillRect(x+2, y-14, 2, 2);    // 右眼
      
        // 武器
        this.drawWeapon(ctx, x, y, characterConfig);
      
        // 行走动画 - 简单的腿部摆动
        if (frame % 20 < 10) {
            ctx.fillStyle = characterConfig.primary;
            ctx.fillRect(x-6, y+8, 3, 4);   // 左腿
            ctx.fillRect(x+3, y+8, 3, 4);   // 右腿
        } else {
            ctx.fillStyle = characterConfig.primary;
            ctx.fillRect(x-6, y+8, 3, 6);   // 左腿
            ctx.fillRect(x+3, y+8, 3, 2);   // 右腿
        }
    }

    // 🔫 武器绘制
    drawWeapon(ctx, x, y, characterConfig) {
        ctx.fillStyle = characterConfig.accent;
        
        // 使用明确的角色类型标识符来判断武器类型
        switch(characterConfig.role) {
            case 'warrior':
                // 能量剑
                ctx.fillRect(x+8, y-4, 8, 2);
                ctx.fillRect(x+12, y-6, 2, 6);
                break;
            case 'archer':
                // 能量弓
                ctx.beginPath();
                ctx.arc(x+8, y, 6, 0, Math.PI, true);
                ctx.stroke();
                ctx.fillRect(x+8, y-2, 2, 4);
                break;
            case 'mage':
                // 法杖
                ctx.fillRect(x+8, y-8, 2, 12);
                ctx.fillRect(x+6, y-10, 6, 4);
                break;
            case 'assassin':
                // 能量匕首
                ctx.fillRect(x+8, y-2, 6, 2);
                ctx.fillRect(x+12, y-3, 2, 4);
                break;
            case 'tank':
                // 能量盾
                ctx.fillRect(x+8, y-6, 8, 8);
                ctx.fillStyle = characterConfig.primary;
                ctx.fillRect(x+10, y-4, 4, 4);
                break;
            default:
                // 默认武器（能量剑）
                ctx.fillRect(x+8, y-4, 8, 2);
                ctx.fillRect(x+12, y-6, 2, 6);
                break;
        }
    }

    // 👾 敌人绘制函数
    drawEnemy(ctx, x, y, enemyConfig, frame = 0) {
        if (!enemyConfig) return;
        
        const size = enemyConfig.size;
        const centerX = x - size.width / 2;
        const centerY = y - size.height / 2;
        
        // 主体
        ctx.fillStyle = enemyConfig.color;
        ctx.fillRect(centerX, centerY, size.width, size.height);
        
        // 细节装饰
        ctx.fillStyle = enemyConfig.accent;
        
        // 使用明确的敌人类型标识符来添加不同细节
        switch(enemyConfig.type) {
            case 'drone':
                // 螺旋桨动画
                const rotation = (frame * 0.2) % (Math.PI * 2);
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.fillRect(-8, -1, 16, 2);
                ctx.fillRect(-1, -8, 2, 16);
                ctx.restore();
                
                // 传感器
                ctx.fillRect(centerX + 2, centerY + 2, 2, 2);
                ctx.fillRect(centerX + size.width - 4, centerY + 2, 2, 2);
                break;
            case 'soldier':
                // 装甲板
                ctx.fillRect(centerX + 2, centerY + 2, size.width - 4, 4);
                ctx.fillRect(centerX + 2, centerY + size.height - 6, size.width - 4, 4);
                
                // 武器
                ctx.fillRect(centerX + size.width, centerY + size.height/2 - 1, 4, 2);
                break;
            case 'heavy':
                // 装甲条纹
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(centerX + 2, centerY + 6 + i * 4, size.width - 4, 2);
                }
                
                // 炮管
                ctx.fillRect(centerX + size.width, centerY + size.height/2 - 2, 6, 4);
                break;
            case 'flyer':
                // 机翼
                ctx.fillRect(centerX - 4, centerY + 2, 4, size.height - 4);
                ctx.fillRect(centerX + size.width, centerY + 2, 4, size.height - 4);
                
                // 推进器
                ctx.fillRect(centerX + size.width/2 - 1, centerY + size.height, 2, 3);
                break;
            default:
                // 默认细节（装甲板）
                ctx.fillRect(centerX + 2, centerY + 2, size.width - 4, 4);
                break;
        }
    }

    // 🏰 BOSS绘制函数
    drawBoss(ctx, x, y, bossConfig, frame, health) {
        if (!bossConfig) return;
        
        const size = bossConfig.size;
        const colors = bossConfig.colors;
        
        // 发光效果
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 15;
        
        // 主体绘制
        ctx.fillStyle = colors.primary;
        ctx.fillRect(x - size.width/2, y - size.height/2, size.width, size.height);
        
        // 细节装饰
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(x - size.width/2 + 5, y - size.height/2 + 5, size.width - 10, 10);
        
        // 能量核心
        ctx.fillStyle = colors.accent;
        ctx.fillRect(x - 8, y - 8, 16, 16);
        
        // 血条
        const healthBarWidth = size.width - 20;
        const healthBarHeight = 6;
        const healthPercentage = health / 100;
        
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(x - healthBarWidth/2, y - size.height/2 - 10, healthBarWidth, healthBarHeight);
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(x - healthBarWidth/2, y - size.height/2 - 10, healthBarWidth * healthPercentage, healthBarHeight);
        
        // 重置阴影
        ctx.shadowBlur = 0;
        
        // 如果有部件配置，绘制部件
        if (bossConfig.parts) {
            bossConfig.parts.forEach(part => {
                ctx.fillStyle = colors.secondary;
                ctx.fillRect(x + part.x - part.w/2, y + part.y - part.h/2, part.w, part.h);
            });
        }
    }

    // 🌍 背景绘制函数
    drawBackground(ctx, cameraX, levelTheme) {
        if (!levelTheme) return;
        
        const bgColors = levelTheme.bgColors;
        const groundColor = levelTheme.groundColor;
        
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        bgColors.forEach((color, index) => {
            gradient.addColorStop(index / (bgColors.length - 1), color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 400);
        
        // 地面
        ctx.fillStyle = groundColor;
        ctx.fillRect(0, 380, 800, 20);
        
        // 视差层
        this.drawParallaxLayer(ctx, cameraX, levelTheme, 0.3, "far");
        this.drawParallaxLayer(ctx, cameraX, levelTheme, 0.6, "mid");
        this.drawParallaxLayer(ctx, cameraX, levelTheme, 0.9, "near");
    }

    // 🎨 颜色插值函数
    interpolateColor(color1, color2, ratio) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 🏗️ 视差层绘制
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
    drawPowerUp(ctx, x, y, powerUpConfig, frame) {
        if (!powerUpConfig) return;
        
        const rotation = (frame * 0.1) % (Math.PI * 2);
      
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
      
        // 发光效果
        ctx.shadowColor = powerUpConfig.glow;
        ctx.shadowBlur = 10;
      
        // 主体 - 多层颜色
        powerUpConfig.colors.forEach((color, i) => {
            ctx.fillStyle = color;
            const size = 12 - i * 3;
            ctx.fillRect(-size/2, -size/2, size, size);
        });
      
        // 符号
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(powerUpConfig.symbol, 0, 4);
      
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
        try {
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx.clearRect(0, 0, width, height);
            
            // 调用绘制函数
            drawFunction(this.ctx, width/2, height/2);
            
            // 创建Phaser纹理
            this.scene.textures.addCanvas(key, this.canvas);
            return key;
        } catch (error) {
            console.error(`创建纹理 ${key} 失败:`, error);
            // 创建备用纹理
            return this.createFallbackTexture(key, width, height);
        }
    }
    
    createFallbackTexture(key, width = 32, height = 32) {
        try {
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx.clearRect(0, 0, width, height);
            
            // 创建简单的备用纹理
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(0, 0, width, height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(2, 2, width - 4, height - 4);
            
            this.scene.textures.addCanvas(key, this.canvas);
            console.log(`创建备用纹理: ${key}`);
            return key;
        } catch (error) {
            console.error(`创建备用纹理 ${key} 也失败:`, error);
            return null;
        }
    }

    // 🎭 创建角色纹理
    createCharacterTextures(characterConfigs) {
        Object.keys(characterConfigs).forEach(characterKey => {
            const characterConfig = characterConfigs[characterKey];
            // 创建多个动画帧
            for (let frame = 0; frame < 4; frame++) {
                const key = `${characterKey}_${frame}`;
                this.createPixelTexture(key, (ctx, x, y) => {
                    this.drawCharacter(ctx, x, y, characterConfig, frame);
                });
            }
        });
    }

    // 👾 创建敌人纹理
    createEnemyTextures(enemyConfigs) {
        Object.keys(enemyConfigs).forEach(enemyKey => {
            const enemyConfig = enemyConfigs[enemyKey];
            // 创建多个动画帧
            for (let frame = 0; frame < 4; frame++) {
                const key = `${enemyKey}_${frame}`;
                this.createPixelTexture(key, (ctx, x, y) => {
                    this.drawEnemy(ctx, x, y, enemyConfig, frame);
                });
            }
        });
    }

    // 🏰 创建BOSS纹理
    createBossTextures(bossConfigs) {
        Object.keys(bossConfigs).forEach(bossKey => {
            const bossConfig = bossConfigs[bossKey];
            const key = `boss_${bossKey}`;
            this.createPixelTexture(key, (ctx, x, y) => {
                this.drawBoss(ctx, x, y, bossConfig, 0, 100);
            }, bossConfig.size.width, bossConfig.size.height);
        });
    }

    // 🎪 创建道具纹理
    createPowerUpTextures(powerUpConfigs) {
        Object.keys(powerUpConfigs).forEach(powerUpKey => {
            const powerUpConfig = powerUpConfigs[powerUpKey];
            // 创建多个动画帧
            for (let frame = 0; frame < 8; frame++) {
                const key = `${powerUpKey}_${frame}`;
                this.createPixelTexture(key, (ctx, x, y) => {
                    this.drawPowerUp(ctx, x, y, powerUpConfig, frame);
                });
            }
        });
    }

    // 🎨 初始化所有纹理
    initAllTextures() {
        console.log('PixelArtSystem: 开始创建像素风纹理...');
        this.createCharacterTextures(CHARACTER_DESIGNS);
        this.createEnemyTextures(ENEMY_DESIGNS);
        this.createBossTextures(BOSS_DESIGNS);
        this.createPowerUpTextures(POWERUP_DESIGNS);
        console.log('PixelArtSystem: 像素风纹理创建完成');
    }
} 