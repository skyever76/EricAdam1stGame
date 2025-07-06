export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        console.log('PreloaderScene: 开始初始化...');
      
        // 创建加载进度条UI（纯装饰性）
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(540, 320, 200, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
      
        const loadingText = this.add.text(width / 2, height / 2 - 50, '初始化游戏资源...', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 模拟加载进度
        let progress = 0;
        const timer = this.time.addEvent({
            delay: 100,
            callback: () => {
                progress += 10;
                const value = progress / 100;
              
                progressBar.clear();
                progressBar.fillStyle(0xffffff, 1);
                progressBar.fillRect(550, 330, 180 * value, 30);
                percentText.setText(Math.round(value * 100) + '%');
              
                console.log('PreloaderScene: 初始化进度:', Math.round(value * 100) + '%');
              
                if (progress >= 100) {
                    timer.destroy();
                  
                    // 清理UI
                    progressBar.destroy();
                    progressBox.destroy();
                    loadingText.destroy();
                    percentText.destroy();
                  
                    // 创建纹理后切换场景
                    this.createTexturesAndProceed();
                }
            },
            repeat: 9
        });
      
        console.log('PreloaderScene: 跳过外部资源加载，使用内置纹理生成');
    }

    createTexturesAndProceed() {
        console.log('PreloaderScene: 开始创建游戏纹理...');
      
        try {
            // 创建所有需要的纹理
            this.createAllGameTextures();
          
            // 验证纹理创建
            const textureKeys = this.textures.getTextureKeys();
            console.log('PreloaderScene: 成功创建纹理:', textureKeys);
          
            // 切换到玩家选择场景
            this.time.delayedCall(500, () => {
                console.log('PreloaderScene: 切换到PlayerSelectScene');
                this.scene.start('PlayerSelectScene');
            });
          
        } catch (error) {
            console.error('PreloaderScene: 纹理创建失败:', error);
          
            // 错误处理：显示错误信息
            this.add.text(640, 360, '纹理创建失败，请刷新页面重试', {
                font: '24px Arial',
                fill: '#ff0000'
            }).setOrigin(0.5);
        }
    }

    createAllGameTextures() {
        // 🔧 修复纹理配置数组 - 调整小尺寸纹理
        const textureConfigs = [
            // 基础游戏对象
            { key: 'player', color: '#00ff00', size: 32, shape: 'circle' },
            { key: 'enemy', color: '#ff0000', size: 32, shape: 'circle' },
            { key: 'bullet', color: '#ffff00', size: 8, shape: 'circle' },
            { key: 'background', color: '#001122', size: 64, shape: 'square' },
        
            // 玩家角色
            { key: 'elf', color: '#90EE90', size: 40, shape: 'circle', border: '#ffffff' },
            { key: 'soldier', color: '#8B4513', size: 40, shape: 'circle', border: '#ffffff' },
            { key: 'diver', color: '#4169E1', size: 40, shape: 'circle', border: '#ffffff' },
            { key: 'tank', color: '#696969', size: 40, shape: 'square', border: '#ffffff' },
            { key: 'spaceship', color: '#C0C0C0', size: 40, shape: 'triangle', border: '#ffffff' },
          
            // 🔧 修复粒子效果纹理 - 增加最小尺寸
            { key: 'shoot', color: '#ffff00', size: 6, shape: 'circle' },     // 从4改为6
            { key: 'explosion', color: '#ff6600', size: 8, shape: 'circle' }, // 从6改为8
            { key: 'damage', color: '#ff0000', size: 6, shape: 'circle' },    // 从3改为6
            { key: 'death', color: '#ff00ff', size: 8, shape: 'circle' },     // 从5改为8
          
            // 🆕 敌人子弹纹理
            { key: 'enemyBullet', color: '#ff0000', size: 8, shape: 'circle' },
          
            // 🆕 关卡背景纹理（占位符）
            { key: 'city', color: '#2c3e50', size: 64, shape: 'square' },
            { key: 'desert', color: '#d2691e', size: 64, shape: 'square' },
            { key: 'forest', color: '#228b22', size: 64, shape: 'square' },
            { key: 'ocean', color: '#191970', size: 64, shape: 'square' },
            { key: 'space', color: '#000000', size: 64, shape: 'square' },
          
            // 🆕 敌人纹理
            { key: 'thug', color: '#8B0000', size: 32, shape: 'circle', border: '#ffffff' },
            { key: 'scorpion', color: '#DAA520', size: 32, shape: 'triangle', border: '#000000' },
            { key: 'wolf', color: '#696969', size: 32, shape: 'circle', border: '#000000' },
            { key: 'archer', color: '#8B4513', size: 32, shape: 'circle', border: '#ffffff' },
            { key: 'squid', color: '#4B0082', size: 32, shape: 'circle', border: '#ffffff' },
            { key: 'eel', color: '#00CED1', size: 32, shape: 'circle', border: '#000000' },
            { key: 'pirate', color: '#8B4513', size: 32, shape: 'square', border: '#ffffff' },
            { key: 'alien', color: '#00FF00', size: 32, shape: 'triangle', border: '#000000' },
            { key: 'robot', color: '#C0C0C0', size: 32, shape: 'square', border: '#000000' },
            { key: 'ufo', color: '#9370DB', size: 32, shape: 'circle', border: '#ffffff' },
            { key: 'boss', color: '#FF1493', size: 64, shape: 'square', border: '#ffffff' }
        ];

        // 创建每个纹理
        textureConfigs.forEach(config => {
            this.createSingleTexture(config);
        });
    }

    createSingleTexture(config) {
        const { key, color, size, shape = 'circle', border = null } = config;
    
        try {
            // 🔧 确保尺寸不小于最小值
            const minSize = 6; // 最小尺寸6像素
            const actualSize = Math.max(size, minSize);
          
            if (actualSize !== size) {
                console.log(`PreloaderScene: 纹理 ${key} 尺寸从 ${size} 调整为 ${actualSize}`);
            }
          
            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.width = actualSize;
            canvas.height = actualSize;
            const ctx = canvas.getContext('2d');
        
            // 清除canvas
            ctx.clearRect(0, 0, actualSize, actualSize);
        
            // 设置主要颜色
            ctx.fillStyle = color;
        
            // 🔧 修复半径计算 - 确保半径不为负数
            const padding = 2; // 边距
            const maxRadius = (actualSize / 2) - padding;
            const radius = Math.max(1, maxRadius); // 确保半径至少为1
          
            // 根据形状绘制
            switch (shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(actualSize/2, actualSize/2, radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                
                case 'square':
                    const squareSize = actualSize - (padding * 2);
                    ctx.fillRect(padding, padding, squareSize, squareSize);
                    break;
                
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(actualSize/2, padding);
                    ctx.lineTo(actualSize - padding, actualSize - padding);
                    ctx.lineTo(padding, actualSize - padding);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        
            // 🔧 修复边框绘制 - 确保边框半径不为负数
            if (border) {
                ctx.strokeStyle = border;
                ctx.lineWidth = Math.min(2, actualSize / 4); // 动态线宽
            
                switch (shape) {
                    case 'circle':
                        ctx.beginPath();
                        ctx.arc(actualSize/2, actualSize/2, radius, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                    
                    case 'square':
                        const squareSize = actualSize - (padding * 2);
                        ctx.strokeRect(padding, padding, squareSize, squareSize);
                        break;
                    
                    case 'triangle':
                        ctx.beginPath();
                        ctx.moveTo(actualSize/2, padding);
                        ctx.lineTo(actualSize - padding, actualSize - padding);
                        ctx.lineTo(padding, actualSize - padding);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                }
            }
        
            // 添加到Phaser纹理管理器
            this.textures.addCanvas(key, canvas);
        
            console.log(`PreloaderScene: 成功创建纹理 ${key} (${actualSize}x${actualSize}, ${color})`);
        
        } catch (error) {
            console.error(`PreloaderScene: 创建纹理 ${key} 失败:`, error);
        
            // 创建备用纯色方块
            this.createFallbackTexture(key, Math.max(size, 6));
        }
    }

    // 🔧 改进备用纹理创建
    createFallbackTexture(key, size) {
        try {
            const actualSize = Math.max(size, 6); // 确保最小尺寸
            const canvas = document.createElement('canvas');
            canvas.width = actualSize;
            canvas.height = actualSize;
            const ctx = canvas.getContext('2d');
        
            // 创建简单的白色方块
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, actualSize, actualSize);
          
            // 添加简单的边框以便识别
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, actualSize, actualSize);
        
            this.textures.addCanvas(key, canvas);
            console.log(`PreloaderScene: 创建备用纹理 ${key} (${actualSize}x${actualSize})`);
        
        } catch (error) {
            console.error(`PreloaderScene: 备用纹理创建也失败 ${key}:`, error);
        }
    }

    create() {
        console.log('PreloaderScene: create() 执行完成');
        // 所有逻辑都在 preload() 中处理了
    }
}