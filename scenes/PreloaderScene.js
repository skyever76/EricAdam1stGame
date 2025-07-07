// scenes/PreloaderScene.js - ES6模块预加载场景

import { ASSET_CONFIG } from './configs.js';

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
        // 角色、敌人、道具等纹理将由PixelArtSystem程序化生成。
        // 此处只加载那些必须从外部文件读取的资源（如有）。
        // 创建子弹占位符纹理
        this.createBulletDummyTexture();
        // 创建粒子纹理
        this.createParticleTexture();
    }

    loadAudio() {
        // 音频将由AudioManager程序化生成，此处无需加载任何文件。
        console.log('🎵 音频资源将由AudioManager程序化生成。');
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

    createParticleTexture() {
        // 创建更好的粒子纹理
        const graphics = this.add.graphics();
        
        // 创建圆形粒子
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
        
        // 创建AK47专用粒子纹理
        const ak47Graphics = this.add.graphics();
        ak47Graphics.fillStyle(0xff6600, 1);
        ak47Graphics.fillCircle(3, 3, 3);
        ak47Graphics.fillStyle(0xffff00, 0.6);
        ak47Graphics.fillCircle(3, 3, 5);
        ak47Graphics.generateTexture('ak47_particle', 6, 6);
        ak47Graphics.destroy();
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