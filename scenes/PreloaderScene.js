// scenes/PreloaderScene.js - ES6模块预加载场景

export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        console.log('PreloaderScene: 开始预加载资源');
        
        // 创建加载进度条
        this.createLoadingBar();
        
        // 加载图片资源
        this.loadImages();
        
        // 加载音频资源
        this.loadAudio();
        
        // 加载字体资源
        this.loadFonts();
    }

    create() {
        console.log('PreloaderScene: 预加载完成，切换到玩家选择场景');
        
        // 显示加载完成信息
        this.showLoadingComplete();
        
        // 延迟切换到玩家选择场景
        this.time.delayedCall(1500, () => {
            this.scene.start('PlayerSelectScene');
        });
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 创建进度条背景
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // 创建进度条边框
        const progressBorder = this.add.graphics();
        progressBorder.lineStyle(3, 0xffffff);
        progressBorder.strokeRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // 创建进度条
        const progressBar = this.add.graphics();
        
        // 创建加载文本
        const loadingText = this.add.text(width / 2, height / 2 - 50, '游戏资源加载中...', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5);
        
        const assetText = this.add.text(width / 2, height / 2 + 50, '', {
            font: '14px Arial',
            fill: '#ffffff'
        });
        assetText.setOrigin(0.5);
        
        // 监听加载进度
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(Math.round(value * 100) + '%');
        });
        
        this.load.on('fileprogress', (file) => {
            assetText.setText('加载中: ' + file.key);
        });
        
        this.load.on('complete', () => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300, 30);
            percentText.setText('100%');
            assetText.setText('加载完成！');
        });
        
        // 保存引用以便清理
        this.progressElements = {
            progressBox,
            progressBorder,
            progressBar,
            loadingText,
            percentText,
            assetText
        };
    }

    loadImages() {
        // 加载角色图片
        this.load.image('soldier', 'images/characters/soldier.png');
        this.load.image('diver', 'images/characters/diver.png');
        this.load.image('tank', 'images/characters/tank.png');
        this.load.image('spaceship', 'images/characters/spaceship.png');
        this.load.image('elf', 'images/characters/elf.png');
        
        // 加载敌人图片
        this.load.image('alien', 'images/enemies/alien.png');
        this.load.image('robot', 'images/enemies/robot.png');
        this.load.image('scorpion', 'images/enemies/scorpion.png');
        this.load.image('shark', 'images/enemies/shark.png');
        this.load.image('wolf', 'images/enemies/wolf.png');
        
        // 加载武器图片
        this.load.image('ak47', 'images/ak47.png');
        this.load.image('pistol', 'images/pistol.png');
        this.load.image('gatling', 'images/gatling.png');
        this.load.image('tesla', 'images/tesla.png');
        this.load.image('missile', 'images/missile.png');
        this.load.image('nuke', 'images/nuke.png');
        
        // 加载道具图片
        this.load.image('health', 'images/health.png');
        this.load.image('power', 'images/power.png');
        
        // 加载背景图片
        this.load.image('background', 'images/background.png');
        this.load.image('city', 'images/backgrounds/city.png');
        this.load.image('desert', 'images/backgrounds/desert.png');
        this.load.image('forest', 'images/backgrounds/forest.png');
        this.load.image('ocean', 'images/backgrounds/ocean.png');
        this.load.image('space', 'images/backgrounds/space.png');
        
        // 加载BOSS图片
        this.load.image('cosmic-lord', 'images/bosses/cosmic-lord.png');
        this.load.image('deep-sea-lord', 'images/bosses/deep-sea-lord.png');
        this.load.image('desert-king', 'images/bosses/desert-king.png');
        this.load.image('forest-king', 'images/bosses/forest-king.png');
        this.load.image('mecha-beast', 'images/bosses/mecha-beast.png');
        
        // 加载障碍物图片
        this.load.image('asteroid', 'images/obstacles/asteroid.png');
        this.load.image('building', 'images/obstacles/building.png');
        this.load.image('coral', 'images/obstacles/coral.png');
        this.load.image('rock', 'images/obstacles/rock.png');
        this.load.image('tree', 'images/obstacles/tree.png');
        
        // 加载粒子效果
        this.load.image('particle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // 创建子弹占位符纹理
        this.createBulletDummyTexture();
    }

    loadAudio() {
        // 加载音效文件
        this.load.audio('shoot', 'audio/shoot.mp3');
        this.load.audio('hit', 'audio/hit.mp3');
        this.load.audio('explosion', 'audio/explosion.mp3');
        this.load.audio('damage', 'audio/damage.mp3');
        this.load.audio('death', 'audio/death.mp3');
        this.load.audio('powerup', 'audio/powerup.mp3');
        this.load.audio('game_over', 'audio/game_over.mp3');
        
        // 加载背景音乐
        this.load.audio('bgm_forest', 'audio/bgm_forest.mp3');
        this.load.audio('bgm_city', 'audio/bgm_city.mp3');
        this.load.audio('bgm_ocean', 'audio/bgm_ocean.mp3');
        this.load.audio('bgm_desert', 'audio/bgm_desert.mp3');
        this.load.audio('bgm_space', 'audio/bgm_space.mp3');
    }

    loadFonts() {
        // 加载自定义字体（如果有的话）
        // this.load.webfont('gameFont', 'fonts/game-font.woff2');
    }

    createBulletDummyTexture() {
        // 创建一个1x1的透明像素作为子弹占位符
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0); // 透明
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('bullet_dummy', 1, 1);
        graphics.destroy();
    }

    showLoadingComplete() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 显示加载完成文本
        const completeText = this.add.text(width / 2, height / 2 + 100, '加载完成！准备开始游戏...', {
            font: '24px Arial',
            fill: '#00ff00'
        });
        completeText.setOrigin(0.5);
        
        // 添加淡入效果
        completeText.setAlpha(0);
        this.tweens.add({
            targets: completeText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });
        
        // 清理进度条元素
        if (this.progressElements) {
            Object.values(this.progressElements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        }
    }
}

console.log('✅ PreloaderScene.js ES6模块已加载');