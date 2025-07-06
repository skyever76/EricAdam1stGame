// PowerUp.js - 道具类
class PowerUp extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, powerUpData) {
        super(scene, x, y, 'bullet'); // 临时使用bullet纹理，后面可以换
        this.scene = scene;
        this.powerUpData = powerUpData;
        this.powerUpType = powerUpData.type;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(30, 30);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.3);
        this.body.setDrag(100);
        this.setScale(0.8);
        this.setTint(powerUpData.color);
        this.setDepth(100);
        this.lifeTime = powerUpData.lifeTime || 15000;
        this.collected = false;
        this.magnetRange = 80;
        this.setupAppearance();
        this.setupAnimations();
        this.setupLifeTimer();
        console.log(`🎁 生成道具: ${powerUpData.name} 在位置 (${x}, ${y})`);
    }
    setupAppearance() {
        this.glowEffect = this.scene.add.circle(this.x, this.y, 20, this.powerUpData.color, 0.3)
            .setDepth(this.depth - 1);
        this.label = this.scene.add.text(this.x, this.y - 40, this.powerUpData.symbol, {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(this.depth + 1);
    }
    setupAnimations() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.scene.tweens.add({
            targets: this.glowEffect,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.6,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.scene.tweens.add({
            targets: this,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
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
            targets: [this, this.glowEffect, this.label],
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }
    update() {
        if (this.collected) return;
        if (this.glowEffect) {
            this.glowEffect.setPosition(this.x, this.y);
        }
        if (this.label) {
            this.label.setPosition(this.x, this.y - 40);
        }
        this.checkMagnetEffect();
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
        this.createCollectEffect();
        this.applyEffect();
        if (this.lifeTimer) this.lifeTimer.destroy();
        if (this.warningTimer) this.warningTimer.destroy();
        this.destroy();
        return true;
    }
    createCollectEffect() {
        const collectEffect = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 10,
            tint: this.powerUpData.color
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
            targets: [this, this.glowEffect, this.label],
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
        if (this.glowEffect) this.glowEffect.destroy();
        if (this.label) this.label.destroy();
        if (this.lifeTimer) this.lifeTimer.destroy();
        if (this.warningTimer) this.warningTimer.destroy();
        super.destroy();
    }
}
window.PowerUp = PowerUp; 