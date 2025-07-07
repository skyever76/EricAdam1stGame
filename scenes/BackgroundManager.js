// scenes/BackgroundManager.js - ES6模块背景管理系统

import { LEVEL_CONFIG, COLOR_CONFIG } from './configs.js';

export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTheme = null;
        this.parallaxLayers = [];
        this.environmentEffects = [];
        
        this.initThemes();
    }
    
    initThemes() {
        // 初始化主题系统
        this.themes = {
            tech_grid: this.createTechGridTheme.bind(this),
            cloud: this.createCloudTheme.bind(this),
            circuit: this.createCircuitTheme.bind(this),
            star_field: this.createStarFieldTheme.bind(this),
            hexagon: this.createHexagonTheme.bind(this),
            wave: this.createWaveTheme.bind(this)
        };
        
        // 初始化环境效果
        this.effects = {
            sandstorm: this.createSandstormEffect.bind(this),
            fog: this.createFogEffect.bind(this),
            bubbles: this.createBubbleEffect.bind(this),
            stars: this.createStarEffect.bind(this)
        };
    }
    
    createLevelBackground() {
        // 根据关卡类型创建背景
        const levelType = this.scene.currentLevel?.type || 'forest';
        const theme = this.getThemeForLevelType(levelType);
        
        this.createParallaxBackground(theme);
        this.addEnvironmentEffect(levelType);
        
        this.currentTheme = theme;
    }
    
    getThemeForLevelType(levelType) {
        const themeMap = {
            forest: 'hexagon',
            desert: 'wave',
            ocean: 'cloud',
            space: 'star_field',
            city: 'tech_grid'
        };
        return themeMap[levelType] || 'hexagon';
    }
    
    createParallaxBackground(theme) {
        this.clearBackground();
        
        const worldWidth = 4000;
        const worldHeight = 720;
        
        // 创建三层视差背景
        const layers = [
            { speed: 0.1, alpha: 0.3 }, // 远景
            { speed: 0.3, alpha: 0.6 }, // 中景
            { speed: 0.6, alpha: 0.8 }  // 近景
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            // 根据主题绘制背景
            this.drawThemeBackground(bg, theme, worldWidth, worldHeight, layer.alpha);
            
            // 设置视差速度（只在X轴）
            bg.setScrollFactor(layer.speed, 0);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    drawThemeBackground(graphics, theme, width, height, alpha) {
        if (this.themes[theme]) {
            // 调用对应的主题绘制函数
            this.themes[theme](graphics, width, height, alpha);
        }
    }
    
    // 主题绘制方法
    createTechGridTheme(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(0x001122, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制科技网格
        graphics.lineStyle(1, 0x00ffff, alpha * 0.5);
        const gridSize = 50;
        
        for (let x = 0; x < width; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }
        
        for (let y = 0; y < height; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }
        
        graphics.strokePaths();
    }
    
    createCloudTheme(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(0x87ceeb, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制云朵
        graphics.fillStyle(0xffffff, alpha * 0.8);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.6;
            const size = Math.random() * 60 + 40;
            this.drawCloud(graphics, x, y, size);
        }
    }
    
    createCircuitTheme(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(0x000022, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制电路板图案
        graphics.lineStyle(2, 0x00ff00, alpha * 0.7);
        
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const length = Math.random() * 100 + 50;
            
            graphics.moveTo(x, y);
            graphics.lineTo(x + length, y);
            graphics.moveTo(x, y);
            graphics.lineTo(x, y + length);
        }
        
        graphics.strokePaths();
    }
    
    createStarFieldTheme(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(0x000011, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制星星
        graphics.fillStyle(0xffffff, alpha);
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;
            
            graphics.fillCircle(x, y, size);
        }
    }
    
    createHexagonTheme(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(0x1a4d1a, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制六边形图案
        graphics.lineStyle(1, 0x90ee90, alpha * 0.6);
        graphics.beginPath();
        const hexSize = 40;
        
        for (let x = 0; x < width; x += hexSize * 1.5) {
            for (let y = 0; y < height; y += hexSize * 1.3) {
                this.drawHexagon(graphics, x, y, hexSize);
            }
        }
        
        graphics.strokePath();
    }
    
    createWaveTheme(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(0x4169e1, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制波浪
        graphics.lineStyle(3, 0x87ceeb, alpha * 0.8);
        
        for (let wave = 0; wave < 3; wave++) {
            graphics.beginPath();
            graphics.moveTo(0, height * 0.3 + wave * 100);
            
            for (let x = 0; x < width; x += 20) {
                const y = height * 0.3 + wave * 100 + 
                         Math.sin(x * 0.01 + wave) * 30;
                graphics.lineTo(x, y);
            }
            
            graphics.strokePath();
        }
    }
    
    drawHexagon(graphics, x, y, size) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            points.push({ x: px, y: py });
        }
        
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
    }
    
    drawCloud(graphics, x, y, size) {
        graphics.fillCircle(x, y, size * 0.3);
        graphics.fillCircle(x + size * 0.3, y, size * 0.4);
        graphics.fillCircle(x + size * 0.6, y, size * 0.3);
        graphics.fillCircle(x + size * 0.3, y - size * 0.2, size * 0.3);
    }
    
    addEnvironmentEffect(levelType) {
        // this.clearEnvironmentEffects();
        // const effectMap = {
        //     forest: 'fog',
        //     desert: 'sandstorm',
        //     ocean: 'bubbles',
        //     space: 'stars'
        // };
        // const effect = effectMap[levelType];
        // if (effect && this.effects[effect]) {
        //     this.effects[effect]();
        // }
    }
    
    createSandstormEffect() {
        // const sandstorm = this.scene.add.graphics();
        // sandstorm.fillStyle(0xf4e4bc, 0.3);
        // for (let i = 0; i < 50; i++) {
        //     const x = Math.random() * 1280;
        //     const y = Math.random() * 720;
        //     const size = Math.random() * 3 + 1;
        //     sandstorm.fillCircle(x, y, size);
        // }
        // this.environmentEffects.push(sandstorm);
    }
    
    createFogEffect() {
        const fog = this.scene.add.graphics();
        fog.fillStyle(0xcccccc, 0.2);
        fog.fillRect(0, 0, 1280, 720);
        
        this.environmentEffects.push(fog);
    }
    
    createBubbleEffect() {
        // const bubbles = this.scene.add.graphics();
        // bubbles.fillStyle(0x87ceeb, 0.5);
        // for (let i = 0; i < 30; i++) {
        //     const x = Math.random() * 1280;
        //     const y = Math.random() * 720;
        //     const size = Math.random() * 8 + 4;
        //     bubbles.fillCircle(x, y, size);
        // }
        // this.environmentEffects.push(bubbles);
    }
    
    createStarEffect() {
        // const stars = this.scene.add.graphics();
        // stars.fillStyle(0xffffff, 0.8);
        // for (let i = 0; i < 100; i++) {
        //     const x = Math.random() * 1280;
        //     const y = Math.random() * 720;
        //     const size = Math.random() * 2 + 1;
        //     stars.fillCircle(x, y, size);
        // }
        // this.environmentEffects.push(stars);
    }
    
    clearBackground() {
        this.parallaxLayers.forEach(layer => {
            if (layer && layer.destroy) {
                layer.destroy();
            }
        });
        this.parallaxLayers = [];
    }
    
    clearEnvironmentEffects() {
        this.environmentEffects.forEach(effect => {
            if (effect && effect.destroy) {
                effect.destroy();
            }
        });
        this.environmentEffects = [];
    }
    
    destroy() {
        this.clearBackground();
        this.clearEnvironmentEffects();
    }
}

console.log('✅ BackgroundManager.js ES6模块已加载'); 