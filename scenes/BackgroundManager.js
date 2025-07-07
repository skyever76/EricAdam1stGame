// scenes/BackgroundManager.js - 背景管理器

class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgroundLayers = [];
        this.currentTheme = null;
        this.parallaxLayers = [];
    }

    // 🎨 创建关卡背景
    createLevelBackground() {
        console.log('BackgroundManager: 创建关卡背景');
        
        // 清除现有背景
        this.clearBackground();
        
        // 根据关卡配置创建背景
        if (this.scene.currentLevel && this.scene.currentLevel.background) {
            this.createBackgroundByConfig(this.scene.currentLevel.background);
        } else {
            // 默认背景
            this.createDefaultBackground();
        }
        
        // 添加环境效果
        this.addEnvironmentEffects();
    }

    // 🎨 根据配置创建背景
    createBackgroundByConfig(config) {
        const { type, theme } = config;
        
        switch (type) {
            case LEVEL_CONFIG.BACKGROUND_TYPES.PARALLAX:
                this.createParallaxBackground(theme);
                break;
            case LEVEL_CONFIG.BACKGROUND_TYPES.PIXEL_ART:
                this.createPixelArtBackground();
                break;
            case LEVEL_CONFIG.BACKGROUND_TYPES.SIMPLE:
                this.createSimpleBackground();
                break;
            default:
                this.createDefaultBackground();
        }
    }

    // 🌊 创建视差背景
    createParallaxBackground(theme) {
        console.log(`BackgroundManager: 创建视差背景，主题: ${theme}`);
        
        // 创建多层视差背景
        this.createParallaxLayers(theme);
        
        // 设置视差滚动
        this.setupParallaxScrolling();
    }

    // 🎨 创建像素艺术背景
    createPixelArtBackground() {
        console.log('BackgroundManager: 创建像素艺术背景');
        
        // 创建基础背景
        const graphics = this.scene.add.graphics();
        
        // 根据关卡类型选择颜色主题
        const colors = this.getLevelColors();
        
        // 创建渐变背景
        this.createGradientBackground(graphics, colors);
        
        // 添加像素艺术元素
        this.addPixelArtElements(graphics, colors);
        
        this.backgroundLayers.push(graphics);
    }

    // 🌊 创建视差层
    createParallaxLayers(theme) {
        // 远景层（滚动速度 0.3）
        const farLayer = this.createParallaxLayer(theme, 0.3, 'far');
        
        // 中景层（滚动速度 0.6）
        const midLayer = this.createParallaxLayer(theme, 0.6, 'mid');
        
        // 近景层（滚动速度 0.9）
        const nearLayer = this.createParallaxLayer(theme, 0.9, 'near');
        
        this.parallaxLayers = [farLayer, midLayer, nearLayer];
    }

    // 🎨 创建视差层
    createParallaxLayer(theme, scrollFactor, layerType) {
        const graphics = this.scene.add.graphics();
        graphics.setScrollFactor(scrollFactor);
        
        switch (theme) {
            case LEVEL_CONFIG.THEME_TYPES.TECH_GRID:
                this.generateTechGridLayer(graphics, layerType);
                break;
            case LEVEL_CONFIG.THEME_TYPES.CLOUD:
                this.generateCloudLayer(graphics, layerType);
                break;
            case LEVEL_CONFIG.THEME_TYPES.CIRCUIT:
                this.generateCircuitLayer(graphics, layerType);
                break;
            case LEVEL_CONFIG.THEME_TYPES.STAR_FIELD:
                this.generateStarFieldLayer(graphics, layerType);
                break;
            case LEVEL_CONFIG.THEME_TYPES.HEXAGON:
                this.generateHexagonLayer(graphics, layerType);
                break;
            case LEVEL_CONFIG.THEME_TYPES.WAVE:
                this.generateWaveLayer(graphics, layerType);
                break;
            default:
                this.generateSimpleLayer(graphics, layerType);
        }
        
        return graphics;
    }

    // 🔧 生成科技网格层
    generateTechGridLayer(graphics, layerType) {
        const colors = this.getTechGridColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 网格线
        graphics.lineStyle(1, colors.grid, 0.3);
        const gridSize = layerType === 'far' ? 100 : layerType === 'mid' ? 50 : 25;
        
        for (let x = 0; x <= GAME_CONFIG.WORLD_WIDTH; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, GAME_CONFIG.WORLD_HEIGHT);
        }
        
        for (let y = 0; y <= GAME_CONFIG.WORLD_HEIGHT; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(GAME_CONFIG.WORLD_WIDTH, y);
        }
        
        // 添加科技元素
        this.addTechElements(graphics, colors, layerType);
    }

    // ☁️ 生成云层
    generateCloudLayer(graphics, layerType) {
        const colors = this.getCloudColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 绘制云朵
        const cloudCount = layerType === 'far' ? 8 : layerType === 'mid' ? 12 : 16;
        
        for (let i = 0; i < cloudCount; i++) {
            const x = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const y = Math.random() * GAME_CONFIG.WORLD_HEIGHT * 0.6;
            const size = (layerType === 'far' ? 40 : layerType === 'mid' ? 30 : 20) + Math.random() * 20;
            
            this.drawCloud(graphics, x, y, size, colors.cloud);
        }
    }

    // ⚡ 生成电路层
    generateCircuitLayer(graphics, layerType) {
        const colors = this.getCircuitColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 绘制电路
        this.drawCircuitPattern(graphics, colors, layerType);
    }

    // ⭐ 生成星空层
    generateStarFieldLayer(graphics, layerType) {
        const colors = this.getStarFieldColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 绘制星星
        const starCount = layerType === 'far' ? 50 : layerType === 'mid' ? 80 : 120;
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const y = Math.random() * GAME_CONFIG.WORLD_HEIGHT;
            const size = (layerType === 'far' ? 2 : layerType === 'mid' ? 1.5 : 1) + Math.random();
            const alpha = 0.3 + Math.random() * 0.7;
            
            graphics.fillStyle(colors.star, alpha);
            graphics.fillCircle(x, y, size);
        }
    }

    // 🔷 生成六边形层
    generateHexagonLayer(graphics, layerType) {
        const colors = this.getHexagonColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 绘制六边形图案
        const hexSize = layerType === 'far' ? 60 : layerType === 'mid' ? 40 : 25;
        const spacing = hexSize * 1.5;
        
        for (let x = 0; x < GAME_CONFIG.WORLD_WIDTH; x += spacing) {
            for (let y = 0; y < GAME_CONFIG.WORLD_HEIGHT; y += spacing * 0.866) {
                this.drawHexagon(graphics, x, y, hexSize, colors.hexagon);
            }
        }
    }

    // 🌊 生成波浪层
    generateWaveLayer(graphics, layerType) {
        const colors = this.getWaveColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 绘制波浪
        this.drawWavePattern(graphics, colors, layerType);
    }

    // 🎨 生成简单层
    generateSimpleLayer(graphics, layerType) {
        const colors = this.getSimpleColors(layerType);
        
        // 背景色
        graphics.fillStyle(colors.background);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 添加简单装饰
        this.addSimpleDecorations(graphics, colors, layerType);
    }

    // 🎨 创建默认背景
    createDefaultBackground() {
        console.log('BackgroundManager: 创建默认背景');
        
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xe8f4f8);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        this.backgroundLayers.push(graphics);
    }

    // 🎨 创建简单背景
    createSimpleBackground() {
        console.log('BackgroundManager: 创建简单背景');
        
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x87ceeb);
        graphics.fillRect(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        this.backgroundLayers.push(graphics);
    }

    // 🌊 设置视差滚动
    setupParallaxScrolling() {
        // 视差滚动在Phaser中通过setScrollFactor自动处理
        // 这里可以添加额外的视差效果
    }

    // 🎨 创建渐变背景
    createGradientBackground(graphics, colors) {
        // 使用分层矩形模拟渐变效果
        const segments = 10;
        const segmentHeight = GAME_CONFIG.WORLD_HEIGHT / segments;
        
        for (let i = 0; i < segments; i++) {
            const ratio = i / segments;
            const color = this.interpolateColor(colors.top, colors.bottom, ratio);
            const y = i * segmentHeight;
            
            graphics.fillStyle(color);
            graphics.fillRect(0, y, GAME_CONFIG.WORLD_WIDTH, segmentHeight);
        }
    }

    // 🎨 添加像素艺术元素
    addPixelArtElements(graphics, colors) {
        // 添加像素风格的装饰元素
        const elementCount = 20;
        
        for (let i = 0; i < elementCount; i++) {
            const x = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const y = Math.random() * GAME_CONFIG.WORLD_HEIGHT;
            const size = 5 + Math.random() * 15;
            
            graphics.fillStyle(colors.accent, 0.3);
            graphics.fillRect(x, y, size, size);
        }
    }

    // 🔧 添加科技元素
    addTechElements(graphics, colors, layerType) {
        const elementCount = layerType === 'far' ? 5 : layerType === 'mid' ? 10 : 15;
        
        for (let i = 0; i < elementCount; i++) {
            const x = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const y = Math.random() * GAME_CONFIG.WORLD_HEIGHT;
            const size = 10 + Math.random() * 20;
            
            graphics.fillStyle(colors.accent, 0.4);
            graphics.fillCircle(x, y, size);
            
            graphics.lineStyle(2, colors.accent, 0.6);
            graphics.strokeCircle(x, y, size);
        }
    }

    // ⚡ 绘制电路图案
    drawCircuitPattern(graphics, colors, layerType) {
        const lineCount = layerType === 'far' ? 8 : layerType === 'mid' ? 12 : 16;
        
        for (let i = 0; i < lineCount; i++) {
            const startX = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const startY = Math.random() * GAME_CONFIG.WORLD_HEIGHT;
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = startY + (Math.random() - 0.5) * 200;
            
            graphics.lineStyle(2, colors.circuit, 0.6);
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            
            // 添加节点
            graphics.fillStyle(colors.node, 0.8);
            graphics.fillCircle(startX, startY, 3);
            graphics.fillCircle(endX, endY, 3);
        }
    }

    // 🌊 绘制波浪图案
    drawWavePattern(graphics, colors, layerType) {
        const waveCount = layerType === 'far' ? 3 : layerType === 'mid' ? 5 : 7;
        
        for (let i = 0; i < waveCount; i++) {
            const amplitude = 20 + Math.random() * 30;
            const frequency = 0.01 + Math.random() * 0.02;
            const y = (i + 1) * (GAME_CONFIG.WORLD_HEIGHT / (waveCount + 1));
            
            graphics.lineStyle(3, colors.wave, 0.4);
            graphics.beginPath();
            
            for (let x = 0; x < GAME_CONFIG.WORLD_WIDTH; x += 5) {
                const waveY = y + Math.sin(x * frequency) * amplitude;
                if (x === 0) {
                    graphics.moveTo(x, waveY);
                } else {
                    graphics.lineTo(x, waveY);
                }
            }
            
            graphics.strokePath();
        }
    }

    // 🎨 添加简单装饰
    addSimpleDecorations(graphics, colors, layerType) {
        const decorationCount = layerType === 'far' ? 5 : layerType === 'mid' ? 8 : 12;
        
        for (let i = 0; i < decorationCount; i++) {
            const x = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const y = Math.random() * GAME_CONFIG.WORLD_HEIGHT;
            const size = 5 + Math.random() * 10;
            
            graphics.fillStyle(colors.decoration, 0.3);
            graphics.fillCircle(x, y, size);
        }
    }

    // 🌊 绘制云朵
    drawCloud(graphics, cloudX, cloudY, cloudSize, color) {
        graphics.fillStyle(color, 0.6);
        
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * cloudSize;
            const offsetY = (Math.random() - 0.5) * cloudSize * 0.5;
            graphics.fillCircle(cloudX + offsetX, cloudY + offsetY, cloudSize * 0.3);
        }
    }

    // 🔷 绘制六边形
    drawHexagon(graphics, x, y, size, color) {
        graphics.lineStyle(1, color, 0.3);
        graphics.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = x + Math.cos(angle) * size;
            const hy = y + Math.sin(angle) * size;
            
            if (i === 0) {
                graphics.moveTo(hx, hy);
            } else {
                graphics.lineTo(hx, hy);
            }
        }
        
        graphics.closePath();
        graphics.strokePath();
    }

    // 🌍 添加环境效果
    addEnvironmentEffects() {
        if (this.scene.currentLevel && this.scene.currentLevel.environmentEffects) {
            this.scene.currentLevel.environmentEffects.forEach(effect => {
                this.addEnvironmentEffect(effect);
            });
        }
    }

    // 🌪️ 添加环境效果
    addEnvironmentEffect(effect) {
        switch (effect) {
            case 'sandstorm':
                this.createSandstormEffect();
                break;
            case 'fog':
                this.createFogEffect();
                break;
            case 'bubbles':
                this.createBubblesEffect();
                break;
            case 'stars':
                this.createStarsEffect();
                break;
        }
    }

    // 🌪️ 创建沙尘暴效果
    createSandstormEffect() {
        console.log('BackgroundManager: 创建沙尘暴效果');
        // 实现沙尘暴粒子效果
    }

    // 🌫️ 创建迷雾效果
    createFogEffect() {
        console.log('BackgroundManager: 创建迷雾效果');
        // 实现迷雾效果
    }

    // 💧 创建气泡效果
    createBubblesEffect() {
        console.log('BackgroundManager: 创建气泡效果');
        // 实现气泡效果
    }

    // ⭐ 创建星空效果
    createStarsEffect() {
        console.log('BackgroundManager: 创建星空效果');
        // 实现星空效果
    }

    // 🎨 获取关卡颜色
    getLevelColors() {
        const levelType = this.scene.currentLevel ? this.scene.currentLevel.type : 'default';
        
        switch (levelType) {
            case LEVEL_CONFIG.FOREST:
                return {
                    top: 0x228B22,
                    bottom: 0x006400,
                    accent: 0x90EE90
                };
            case LEVEL_CONFIG.CITY:
                return {
                    top: 0x696969,
                    bottom: 0x2F4F4F,
                    accent: 0x87CEEB
                };
            case LEVEL_CONFIG.OCEAN:
                return {
                    top: 0x4169E1,
                    bottom: 0x000080,
                    accent: 0x00CED1
                };
            case LEVEL_CONFIG.DESERT:
                return {
                    top: 0xDAA520,
                    bottom: 0xCD853F,
                    accent: 0xF4A460
                };
            case LEVEL_CONFIG.SPACE:
                return {
                    top: 0x191970,
                    bottom: 0x000000,
                    accent: 0x00FFFF
                };
            default:
                return {
                    top: 0x87CEEB,
                    bottom: 0x4682B4,
                    accent: 0xFFFFFF
                };
        }
    }

    // 🔧 获取科技网格颜色
    getTechGridColors(layerType) {
        const alpha = layerType === 'far' ? 0.2 : layerType === 'mid' ? 0.4 : 0.6;
        return {
            background: 0x000033,
            grid: 0x00FFFF,
            accent: 0x00FF00,
            alpha: alpha
        };
    }

    // ☁️ 获取云层颜色
    getCloudColors(layerType) {
        const alpha = layerType === 'far' ? 0.3 : layerType === 'mid' ? 0.5 : 0.7;
        return {
            background: 0x87CEEB,
            cloud: 0xFFFFFF,
            alpha: alpha
        };
    }

    // ⚡ 获取电路颜色
    getCircuitColors(layerType) {
        const alpha = layerType === 'far' ? 0.2 : layerType === 'mid' ? 0.4 : 0.6;
        return {
            background: 0x000033,
            circuit: 0x00FF00,
            node: 0xFF0000,
            alpha: alpha
        };
    }

    // ⭐ 获取星空颜色
    getStarFieldColors(layerType) {
        const alpha = layerType === 'far' ? 0.3 : layerType === 'mid' ? 0.5 : 0.7;
        return {
            background: 0x000033,
            star: 0xFFFFFF,
            alpha: alpha
        };
    }

    // 🔷 获取六边形颜色
    getHexagonColors(layerType) {
        const alpha = layerType === 'far' ? 0.2 : layerType === 'mid' ? 0.4 : 0.6;
        return {
            background: 0x1E1E1E,
            hexagon: 0x00FFFF,
            alpha: alpha
        };
    }

    // 🌊 获取波浪颜色
    getWaveColors(layerType) {
        const alpha = layerType === 'far' ? 0.3 : layerType === 'mid' ? 0.5 : 0.7;
        return {
            background: 0x000080,
            wave: 0x00FFFF,
            alpha: alpha
        };
    }

    // 🎨 获取简单颜色
    getSimpleColors(layerType) {
        const alpha = layerType === 'far' ? 0.2 : layerType === 'mid' ? 0.4 : 0.6;
        return {
            background: 0x87CEEB,
            decoration: 0xFFFFFF,
            alpha: alpha
        };
    }

    // 🎨 颜色插值
    interpolateColor(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 255;
        const g1 = (color1 >> 8) & 255;
        const b1 = color1 & 255;
        
        const r2 = (color2 >> 16) & 255;
        const g2 = (color2 >> 8) & 255;
        const b2 = color2 & 255;
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return (r << 16) | (g << 8) | b;
    }

    // 🧹 清除背景
    clearBackground() {
        this.backgroundLayers.forEach(layer => {
            if (layer) layer.destroy();
        });
        this.backgroundLayers = [];
        
        this.parallaxLayers.forEach(layer => {
            if (layer) layer.destroy();
        });
        this.parallaxLayers = [];
    }

    // 🧹 销毁
    destroy() {
        this.clearBackground();
    }
}

// 将BackgroundManager类暴露到全局
window.BackgroundManager = BackgroundManager; 