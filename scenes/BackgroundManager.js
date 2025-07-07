// scenes/BackgroundManager.js - ES6模块背景管理系统

import { LEVEL_CONFIG, COLOR_CONFIG } from './configs.js';

export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgrounds = {};
        this.currentTheme = null;
        this.parallaxLayers = [];
        this.environmentEffects = [];
        
        this.initBackgrounds();
    }
    
    initBackgrounds() {
        // 初始化各种背景类型
        this.backgrounds = {
            parallax: this.createParallaxBackground.bind(this),
            pixel_art: this.createPixelArtBackground.bind(this),
            simple: this.createSimpleBackground.bind(this)
        };
        
        // 初始化主题
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
    
    createBackground(type, theme, levelType) {
        // 清理现有背景
        this.clearBackground();
        
        // 创建新背景
        if (this.backgrounds[type]) {
            this.backgrounds[type](theme, levelType);
        }
        
        // 添加环境效果
        this.addEnvironmentEffect(levelType);
        
        this.currentTheme = theme;
    }
    
    createParallaxBackground(theme, levelType) {
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
            
            // 设置视差速度
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    createPixelArtBackground(theme, levelType) {
        const bg = this.scene.add.graphics();
        bg.setPosition(0, 0);
        
        // 创建像素艺术背景
        this.drawPixelArtBackground(bg, theme, levelType);
        
        this.parallaxLayers.push(bg);
    }
    
    createSimpleBackground(theme, levelType) {
        const bg = this.scene.add.graphics();
        bg.setPosition(0, 0);
        
        // 创建简单背景
        this.drawSimpleBackground(bg, theme, levelType);
        
        this.parallaxLayers.push(bg);
    }
    
    createLevelBackground() {
        // 根据关卡类型创建背景
        const levelType = this.scene.currentLevelConfig?.type || 'forest';
        const theme = this.getThemeForLevelType(levelType);
        
        this.createBackground('parallax', theme, levelType);
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
    
    // 添加视差背景生成方法
    generateParallaxTechGridBackground() {
        const worldWidth = 4000;
        const worldHeight = 720;
        
        // 创建三层视差背景
        const layers = [
            { speed: 0.1, alpha: 0.3 },
            { speed: 0.3, alpha: 0.6 },
            { speed: 0.6, alpha: 0.8 }
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            // 绘制科技网格背景
            this.drawTechGridBackground(bg, worldWidth, worldHeight, layer.alpha);
            
            // 设置视差速度
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    generateParallaxCloudBackground() {
        const worldWidth = 4000;
        const worldHeight = 720;
        
        const layers = [
            { speed: 0.1, alpha: 0.3 },
            { speed: 0.3, alpha: 0.6 },
            { speed: 0.6, alpha: 0.8 }
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            this.drawCloudBackground(bg, worldWidth, worldHeight, layer.alpha);
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    generateParallaxCircuitBackground() {
        const worldWidth = 4000;
        const worldHeight = 720;
        
        const layers = [
            { speed: 0.1, alpha: 0.3 },
            { speed: 0.3, alpha: 0.6 },
            { speed: 0.6, alpha: 0.8 }
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            this.drawCircuitBackground(bg, worldWidth, worldHeight, layer.alpha);
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    generateParallaxStarFieldBackground() {
        const worldWidth = 4000;
        const worldHeight = 720;
        
        const layers = [
            { speed: 0.1, alpha: 0.3 },
            { speed: 0.3, alpha: 0.6 },
            { speed: 0.6, alpha: 0.8 }
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            this.drawStarFieldBackground(bg, worldWidth, worldHeight, layer.alpha);
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    generateParallaxHexagonBackground() {
        const worldWidth = 4000;
        const worldHeight = 720;
        
        const layers = [
            { speed: 0.1, alpha: 0.3 },
            { speed: 0.3, alpha: 0.6 },
            { speed: 0.6, alpha: 0.8 }
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            this.drawHexagonBackground(bg, worldWidth, worldHeight, layer.alpha);
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    generateParallaxWaveBackground() {
        const worldWidth = 4000;
        const worldHeight = 720;
        
        const layers = [
            { speed: 0.1, alpha: 0.3 },
            { speed: 0.3, alpha: 0.6 },
            { speed: 0.6, alpha: 0.8 }
        ];
        
        layers.forEach((layer, index) => {
            const bg = this.scene.add.graphics();
            bg.setPosition(0, 0);
            
            this.drawWaveBackground(bg, worldWidth, worldHeight, layer.alpha);
            bg.setScrollFactor(layer.speed);
            
            this.parallaxLayers.push(bg);
        });
    }
    
    // 绘制方法
    drawTechGridBackground(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(1, COLOR_CONFIG.CYAN, alpha * 0.5);
        
        // 绘制网格
        for (let x = 0; x < width; x += 50) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 50) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }
        graphics.strokePaths();
    }
    
    drawCloudBackground(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(COLOR_CONFIG.BLUE, alpha * 0.3);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制云朵
        graphics.fillStyle(COLOR_CONFIG.WHITE, alpha * 0.4);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 100 + 50;
            
            graphics.fillCircle(x, y, size);
        }
    }
    
    drawCircuitBackground(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(2, COLOR_CONFIG.GREEN, alpha * 0.6);
        
        // 绘制电路图案
        for (let i = 0; i < 10; i++) {
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            
            for (let j = 0; j < 5; j++) {
                const endX = startX + (Math.random() - 0.5) * 200;
                const endY = startY + (Math.random() - 0.5) * 200;
                graphics.lineTo(endX, endY);
            }
            graphics.strokePath();
        }
    }
    
    drawStarFieldBackground(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制星星
        graphics.fillStyle(COLOR_CONFIG.WHITE, alpha);
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;
            
            graphics.fillCircle(x, y, size);
        }
    }
    
    drawHexagonBackground(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(1, COLOR_CONFIG.MAGENTA, alpha * 0.5);
        
        // 绘制六边形图案
        const hexSize = 40;
        for (let x = 0; x < width; x += hexSize * 1.5) {
            for (let y = 0; y < height; y += hexSize * 1.3) {
                this.drawHexagon(graphics, x, y, hexSize);
            }
        }
    }
    
    drawWaveBackground(graphics, width, height, alpha) {
        graphics.clear();
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(2, COLOR_CONFIG.YELLOW, alpha * 0.6);
        
        // 绘制波浪图案
        for (let y = 0; y < height; y += 50) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            
            for (let x = 0; x < width; x += 10) {
                const waveY = y + Math.sin(x * 0.01) * 20;
                graphics.lineTo(x, waveY);
            }
            graphics.strokePath();
        }
    }
    
    drawThemeBackground(graphics, theme, width, height, alpha) {
        graphics.clear();
        
        if (this.themes[theme]) {
            this.themes[theme](graphics, width, height, alpha);
        } else {
            // 默认背景
            graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
            graphics.fillRect(0, 0, width, height);
        }
    }
    
    createTechGridTheme(graphics, width, height, alpha) {
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(1, COLOR_CONFIG.CYAN, alpha * 0.5);
        
        // 绘制网格
        for (let x = 0; x < width; x += 50) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 50) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }
        graphics.strokePaths();
    }
    
    createCloudTheme(graphics, width, height, alpha) {
        graphics.fillStyle(COLOR_CONFIG.BLUE, alpha * 0.3);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制云朵
        graphics.fillStyle(COLOR_CONFIG.WHITE, alpha * 0.4);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 100 + 50;
            
            graphics.fillCircle(x, y, size);
        }
    }
    
    createCircuitTheme(graphics, width, height, alpha) {
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(2, COLOR_CONFIG.GREEN, alpha * 0.6);
        
        // 绘制电路图案
        for (let i = 0; i < 10; i++) {
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            
            for (let j = 0; j < 5; j++) {
                const endX = startX + (Math.random() - 0.5) * 200;
                const endY = startY + (Math.random() - 0.5) * 200;
                graphics.lineTo(endX, endY);
            }
            graphics.strokePath();
        }
    }
    
    createStarFieldTheme(graphics, width, height, alpha) {
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        // 绘制星星
        graphics.fillStyle(COLOR_CONFIG.WHITE, alpha);
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;
            
            graphics.fillCircle(x, y, size);
        }
    }
    
    createHexagonTheme(graphics, width, height, alpha) {
        graphics.fillStyle(COLOR_CONFIG.BLACK, alpha);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(1, COLOR_CONFIG.MAGENTA, alpha * 0.5);
        
        // 绘制六边形图案
        const hexSize = 40;
        for (let x = 0; x < width; x += hexSize * 1.5) {
            for (let y = 0; y < height; y += hexSize * 1.3) {
                this.drawHexagon(graphics, x, y, hexSize);
            }
        }
    }
    
    createWaveTheme(graphics, width, height, alpha) {
        graphics.fillStyle(COLOR_CONFIG.BLUE, alpha * 0.3);
        graphics.fillRect(0, 0, width, height);
        
        graphics.lineStyle(2, COLOR_CONFIG.CYAN, alpha * 0.6);
        
        // 绘制波浪
        for (let i = 0; i < 5; i++) {
            graphics.beginPath();
            graphics.moveTo(0, height / 2 + Math.sin(0) * 50 + i * 100);
            
            for (let x = 0; x < width; x += 10) {
                const y = height / 2 + Math.sin(x * 0.01 + i) * 50 + i * 100;
                graphics.lineTo(x, y);
            }
            graphics.strokePath();
        }
    }
    
    drawHexagon(graphics, x, y, size) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            points.push({
                x: x + size * Math.cos(angle),
                y: y + size * Math.sin(angle)
            });
        }
        
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
        graphics.strokePath();
    }
    
    drawPixelArtBackground(graphics, theme, levelType) {
        graphics.clear();
        
        // 根据关卡类型设置颜色
        let bgColor = COLOR_CONFIG.BLACK;
        let accentColor = COLOR_CONFIG.WHITE;
        
        switch (levelType) {
            case LEVEL_CONFIG.FOREST:
                bgColor = 0x0a4a0a;
                accentColor = 0x00ff00;
                break;
            case LEVEL_CONFIG.CITY:
                bgColor = 0x2a2a2a;
                accentColor = 0x00ffff;
                break;
            case LEVEL_CONFIG.OCEAN:
                bgColor = 0x004466;
                accentColor = 0x00ffff;
                break;
            case LEVEL_CONFIG.DESERT:
                bgColor = 0x664400;
                accentColor = 0xffff00;
                break;
            case LEVEL_CONFIG.SPACE:
                bgColor = 0x000022;
                accentColor = 0xffffff;
                break;
        }
        
        graphics.fillStyle(bgColor);
        graphics.fillRect(0, 0, 4000, 720);
        
        // 绘制像素艺术图案
        this.drawPixelArtPattern(graphics, accentColor);
    }
    
    drawPixelArtPattern(graphics, color) {
        graphics.fillStyle(color);
        
        // 绘制随机像素点
        for (let i = 0; i < 1000; i++) {
            const x = Math.floor(Math.random() * 4000);
            const y = Math.floor(Math.random() * 720);
            const size = Math.random() * 3 + 1;
            
            graphics.fillRect(x, y, size, size);
        }
    }
    
    drawSimpleBackground(graphics, theme, levelType) {
        graphics.clear();
        
        // 简单的渐变背景
        const gradient = graphics.createLinearGradient(0, 0, 0, 720);
        
        switch (levelType) {
            case LEVEL_CONFIG.FOREST:
                gradient.addColorStop(0, '#0a4a0a');
                gradient.addColorStop(1, '#1a6a1a');
                break;
            case LEVEL_CONFIG.CITY:
                gradient.addColorStop(0, '#2a2a2a');
                gradient.addColorStop(1, '#4a4a4a');
                break;
            case LEVEL_CONFIG.OCEAN:
                gradient.addColorStop(0, '#004466');
                gradient.addColorStop(1, '#006688');
                break;
            case LEVEL_CONFIG.DESERT:
                gradient.addColorStop(0, '#664400');
                gradient.addColorStop(1, '#886600');
                break;
            case LEVEL_CONFIG.SPACE:
                gradient.addColorStop(0, '#000022');
                gradient.addColorStop(1, '#000044');
                break;
            default:
                gradient.addColorStop(0, '#000000');
                gradient.addColorStop(1, '#222222');
        }
        
        graphics.fillStyle(gradient);
        graphics.fillRect(0, 0, 4000, 720);
    }
    
    addEnvironmentEffect(levelType) {
        // 清理现有效果
        this.clearEnvironmentEffects();
        
        // 根据关卡类型添加环境效果
        switch (levelType) {
            case LEVEL_CONFIG.DESERT:
                this.environmentEffects.push(this.effects.sandstorm());
                break;
            case LEVEL_CONFIG.FOREST:
                this.environmentEffects.push(this.effects.fog());
                break;
            case LEVEL_CONFIG.OCEAN:
                this.environmentEffects.push(this.effects.bubbles());
                break;
            case LEVEL_CONFIG.SPACE:
                this.environmentEffects.push(this.effects.stars());
                break;
        }
    }
    
    createSandstormEffect() {
        const particles = this.scene.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: { min: 0, max: 1280 },
            y: { min: 0, max: 720 },
            speedX: { min: -50, max: -100 },
            speedY: { min: -10, max: 10 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 3000,
            frequency: 100
        });
        
        return { particles, emitter };
    }
    
    createFogEffect() {
        const fog = this.scene.add.graphics();
        fog.setScrollFactor(0);
        fog.fillStyle(0xffffff, 0.1);
        fog.fillRect(0, 0, 1280, 720);
        
        return { fog };
    }
    
    createBubbleEffect() {
        const particles = this.scene.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: { min: 0, max: 1280 },
            y: 720,
            speedY: { min: -30, max: -50 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 4000,
            frequency: 200
        });
        
        return { particles, emitter };
    }
    
    createStarEffect() {
        const particles = this.scene.add.particles('particle');
        
        const emitter = particles.createEmitter({
            x: { min: 0, max: 1280 },
            y: { min: 0, max: 720 },
            speedX: { min: -10, max: 10 },
            speedY: { min: -10, max: 10 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 2000,
            frequency: 50
        });
        
        return { particles, emitter };
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
            if (effect.particles && effect.particles.destroy) {
                effect.particles.destroy();
            }
            if (effect.fog && effect.fog.destroy) {
                effect.fog.destroy();
            }
        });
        this.environmentEffects = [];
    }
    
    update(cameraX, cameraY) {
        // 更新视差背景位置
        this.parallaxLayers.forEach(layer => {
            if (layer && layer.setPosition) {
                layer.setPosition(-cameraX * layer.scrollFactorX, -cameraY * layer.scrollFactorY);
            }
        });
    }
    
    destroy() {
        this.clearBackground();
        this.clearEnvironmentEffects();
    }
}

console.log('✅ BackgroundManager.js ES6模块已加载'); 