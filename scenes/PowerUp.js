// PowerUp.js - 道具类
class PowerUp extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, powerUpData) {
        // 🎨 使用像素艺术道具纹理
        const powerUpType = this.mapPowerUpType(powerUpData.type);
        const textureKey = `${powerUpType}_0`; // 使用第一帧
        
        super(scene, x, y, textureKey);
        this.scene = scene;
        this.powerUpData = powerUpData;
        this.powerUpType = powerUpData.type;
        this.pixelType = powerUpType;
        this.animationFrame = 0;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(30, 30);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.3);
        this.body.setDrag(100);
        this.setScale(0.8);
        this.setDepth(100);
        this.lifeTime = powerUpData.lifeTime || 15000;
        this.collected = false;
        this.magnetRange = 80;
        
        // 🎨 设置道具动画
        this.animationTimer = this.scene.time.addEvent({
            delay: 200,
            callback: this.updateAnimation,
            callbackScope: this,
            loop: true
        });
        
        this.setupAppearance();
        this.setupAnimations();
        this.setupLifeTimer();
        console.log(`🎁 生成像素风道具: ${powerUpData.name} 在位置 (${x}, ${y})`);
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
    setupAppearance() {
        // 🎨 像素艺术纹理已经包含发光效果和符号，不需要额外的视觉效果
        // 只保留简单的悬停动画
    }
    setupAnimations() {
        // 🎨 简单的悬停动画
        this.scene.tweens.add({
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
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }
    update() {
        if (this.collected) return;
        this.checkMagnetEffect();
        
        // 🆕 横版卷轴：检查是否移出摄像机左侧
        if (this.scene && this.scene.cameras) {
            const cameraLeft = this.scene.cameras.main.scrollX;
            if (this.x < cameraLeft - 100) {
                console.log(`⏰ 道具移出视野，自动销毁: ${this.powerUpData.name}`);
                this.destroy();
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
        if (this.collected) return false;
        this.collected = true;
        console.log(`🎁 收集道具: ${this.powerUpData.name}`);
        
        // 🔊 播放道具收集音效
        if (this.scene && this.scene.audioManager) {
            this.scene.audioManager.play('powerup');
        }
        
        this.createCollectEffect();
        this.applyEffect();
        if (this.lifeTimer) this.lifeTimer.destroy();
        if (this.warningTimer) this.warningTimer.destroy();
        this.destroy();
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
                this.destroy();
            }
        });
    }
    destroy() {
        if (this.lifeTimer) this.lifeTimer.destroy();
        if (this.warningTimer) this.warningTimer.destroy();
        if (this.animationTimer) this.animationTimer.destroy();
        super.destroy();
    }
}
window.PowerUp = PowerUp; 