// PowerUp.js - 道具类
import { POWERUP_DESIGNS } from './powerUpDesigns.js';

export class PowerUp extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey) {
        super(scene, x, y, textureKey);
        this.scene = scene;
        
        // 基础属性
        this.powerUpData = null;
        this.powerUpType = null;
        this.pixelType = null;
        this.animationFrame = 0;
        this.lifeTime = 15000;
        this.collected = false;
        this.magnetRange = 80;
        
        // 计时器引用
        this.animationTimer = null;
        this.lifeTimer = null;
        this.warningTimer = null;
        this.hoverTween = null;
        this.warningTween = null;
        
        // 初始化物理属性
        scene.add.existing(this);
        this.body.setSize(30, 30);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.3);
        this.body.setDrag(100);
        this.setScale(0.8);
        this.setDepth(100);
        
        // 初始状态为禁用
        this.setActive(false);
        this.setVisible(false);
    }

    // 🎯 对象池激活方法
    spawn(x, y, powerUpData) {
        // 🎨 使用像素艺术道具纹理
        const powerUpType = this.mapPowerUpType(powerUpData.type);
        const textureKey = `${powerUpType}_0`; // 使用第一帧
        
        // 设置基础属性
        this.powerUpData = powerUpData;
        this.powerUpType = powerUpData.type;
        this.pixelType = powerUpType;
        this.animationFrame = 0;
        this.lifeTime = powerUpData.lifeTime || 15000;
        this.collected = false;
        
        // 设置位置和纹理
        this.setPosition(x, y);
        this.setTexture(textureKey);
        this.setAlpha(1);
        this.setScale(0.8);
        
        // 激活对象
        this.setActive(true);
        this.setVisible(true);
        
        // 🎨 设置道具动画
        this.animationTimer = this.scene.time.addEvent({
            delay: 200,
            callback: this.updateAnimation,
            callbackScope: this,
            loop: true
        });
        
        this.setupAnimations();
        this.setupLifeTimer();
        
        console.log(`🎁 生成像素风道具: ${powerUpData.name} 在位置 (${x}, ${y})`);
    }

    // 🔄 对象池回收方法
    recycle() {
        // 停止所有计时器和动画
        this.stopAllTimers();
        this.stopAllTweens();
        
        // 重置状态
        this.powerUpData = null;
        this.powerUpType = null;
        this.pixelType = null;
        this.animationFrame = 0;
        this.collected = false;
        
        // 重置物理属性
        this.body.setVelocity(0, 0);
        this.setAlpha(1);
        this.setScale(0.8);
        
        // 禁用对象
        this.setActive(false);
        this.setVisible(false);
        
        console.log('🔄 道具已回收到对象池');
    }

    // 🛑 停止所有计时器
    stopAllTimers() {
        if (this.animationTimer) {
            this.animationTimer.destroy();
            this.animationTimer = null;
        }
        if (this.lifeTimer) {
            this.lifeTimer.destroy();
            this.lifeTimer = null;
        }
        if (this.warningTimer) {
            this.warningTimer.destroy();
            this.warningTimer = null;
        }
    }

    // 🛑 停止所有补间动画
    stopAllTweens() {
        if (this.hoverTween) {
            this.hoverTween.stop();
            this.hoverTween = null;
        }
        if (this.warningTween) {
            this.warningTween.stop();
            this.warningTween = null;
        }
    }

    // 🎨 映射道具类型到像素艺术类型
    mapPowerUpType(type) {
        const typeMap = {
            'HEALTH_PACK': 'health',
            'POWER_PILL': 'ammo',
            'SHIELD': 'shield',
            'RAPID_FIRE': 'speed'
        };
        return typeMap[type] || 'health';
    }

    // 🎨 更新道具动画
    updateAnimation() {
        if (!this.active) return;
        
        this.animationFrame = (this.animationFrame + 1) % 8;
        const newTexture = `${this.pixelType}_${this.animationFrame}`;
        
        if (this.scene.textures.exists(newTexture)) {
            this.setTexture(newTexture);
        }
    }

    setupAnimations() {
        // 🎨 简单的悬停动画
        this.hoverTween = this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    setupLifeTimer() {
        this.lifeTimer = this.scene.time.delayedCall(this.lifeTime, () => {
            this.expire();
        });
        this.warningTimer = this.scene.time.delayedCall(this.lifeTime - 3000, () => {
            this.startWarningBlink();
        });
    }

    startWarningBlink() {
        this.warningTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    update() {
        if (this.collected || !this.active) return;
        this.checkMagnetEffect();
        
        // 🆕 横版卷轴：检查是否移出摄像机左侧
        if (this.scene && this.scene.cameras) {
            const cameraLeft = this.scene.cameras.main.scrollX;
            if (this.x < cameraLeft - 100) {
                console.log(`⏰ 道具移出视野，自动回收: ${this.powerUpData.name}`);
                this.recycle();
            }
        }
    }

    checkMagnetEffect() {
        if (!this.scene.player) return;
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.scene.player.x, this.scene.player.y
        );
        if (distance < this.magnetRange && distance > 20) {
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                this.scene.player.x, this.scene.player.y
            );
            const force = Math.max(50, (this.magnetRange - distance) * 3);
            this.body.setVelocity(
                Math.cos(angle) * force,
                Math.sin(angle) * force
            );
        }
    }

    collect() {
        if (this.collected || !this.active) return false;
        this.collected = true;
        console.log(`🎁 收集道具: ${this.powerUpData.name}`);
        
        // 🔊 播放道具收集音效
        if (this.scene && this.scene.audioManager) {
            this.scene.audioManager.play('powerup');
        }
        
        this.createCollectEffect();
        this.applyEffect();
        this.recycle(); // 🔄 使用对象池回收而不是销毁
        return true;
    }

    createCollectEffect() {
        // 🎨 使用像素艺术道具的发光颜色
        const design = POWERUP_DESIGNS[this.pixelType];
        const glowColor = design ? design.glow : 0x00ff00;
        
        const collectEffect = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 10,
            tint: glowColor
        }).setDepth(200);
        this.scene.time.delayedCall(600, () => {
            collectEffect.destroy();
        });
    }

    applyEffect() {
        if (this.scene.powerUpManager) {
            this.scene.powerUpManager.applyPowerUp(this.powerUpData);
        }
    }

    expire() {
        console.log(`⏰ 道具过期: ${this.powerUpData.name}`);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.recycle(); // 🔄 使用对象池回收而不是销毁
            }
        });
    }

    destroy() {
        this.stopAllTimers();
        this.stopAllTweens();
        super.destroy();
    }
} 