// PowerUpManager.js - 道具管理器
class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerUps = scene.add.group();
        this.activeBonuses = new Map();
        console.log('🎁 道具管理器初始化完成');
    }
    spawnPowerUp(x, y, enemyType = '小兵') {
        const dropRate = ENEMY_DROP_RATES[enemyType] || 0.15;
        if (Math.random() > dropRate) {
            console.log(`❌ 道具掉落失败，掉落率: ${(dropRate * 100).toFixed(1)}%`);
            return null;
        }
        const powerUpType = this.selectPowerUpType(enemyType);
        if (!powerUpType) return null;
        
        // 🆕 横版卷轴：确保道具在世界坐标范围内
        const clampedX = Phaser.Math.Clamp(x, 0, 4000);
        const clampedY = Phaser.Math.Clamp(y, 50, 670);
        
        const powerUp = new PowerUp(this.scene, clampedX, clampedY, powerUpType);
        this.powerUps.add(powerUp);
        console.log(`✅ 道具掉落成功: ${powerUpType.name}，位置: (${clampedX}, ${clampedY})，掉落率: ${(dropRate * 100).toFixed(1)}%`);
        return powerUp;
    }
    selectPowerUpType(enemyType) {
        const powerUpList = Object.values(POWER_UP_TYPES);
        let totalWeight = 0;
        const enemyRarity = ENEMY_DROP_RATES[enemyType] || 0.15;
        const rarityBonus = enemyRarity * 2;
        const weightedList = powerUpList.map(powerUp => {
            let weight = powerUp.rarity;
            if (powerUp.type === 'power_pill' && enemyRarity > 0.25) {
                weight *= 2;
            }
            totalWeight += weight;
            return { powerUp, weight };
        });
        let random = Math.random() * totalWeight;
        for (const item of weightedList) {
            random -= item.weight;
            if (random <= 0) {
                console.log(`🎲 选中道具: ${item.powerUp.name}，权重: ${item.weight.toFixed(3)}`);
                return item.powerUp;
            }
        }
        return powerUpList[0];
    }
    applyPowerUp(powerUpData) {
        const effect = powerUpData.effect;
        console.log(`🎁 应用道具效果: ${powerUpData.name}`);
        switch (effect.type) {
            case 'heal':
                this.applyHealEffect(effect);
                break;
            case 'temporary_boost':
                this.applyTemporaryBoost(powerUpData, effect);
                break;
            default:
                console.warn('未知道具效果类型:', effect.type);
        }
        this.scene.updateHUD();
        this.showPowerUpNotification(powerUpData);
    }
    applyHealEffect(effect) {
        const player = this.scene.player;
        if (!player) return;
        const oldHealth = player.health;
        const maxHealth = player.maxHealth || 100;
        player.health = Math.min(maxHealth, player.health + effect.amount);
        const actualHeal = player.health - oldHealth;
        console.log(`❤️ 治疗效果: +${actualHeal} HP，当前生命值: ${player.health}/${maxHealth}`);
        this.createHealEffect();
    }
    applyTemporaryBoost(powerUpData, effect) {
        const bonusId = `${powerUpData.type}_${Date.now()}`;
        const bonusData = {
            id: bonusId,
            name: powerUpData.name,
            effect: effect,
            endTime: Date.now() + effect.duration,
            symbol: powerUpData.symbol
        };
        this.activeBonuses.set(bonusId, bonusData);
        console.log(`💊 激活临时效果: ${powerUpData.name}，持续时间: ${effect.duration/1000}秒`);
        this.applyBonusEffects();
        this.scene.time.delayedCall(effect.duration, () => {
            this.removeBonusEffect(bonusId);
        });
        this.createBoostEffect(powerUpData);
    }
    applyBonusEffects() {
        const player = this.scene.player;
        if (!player) return;
        let damageMultiplier = 1.0;
        let fireRateMultiplier = 1.0;
        let freeBullets = false;
        let invulnerable = false;
        for (const bonus of this.activeBonuses.values()) {
            const effect = bonus.effect;
            if (effect.damageMultiplier) {
                damageMultiplier *= effect.damageMultiplier;
            }
            if (effect.fireRateMultiplier) {
                fireRateMultiplier *= effect.fireRateMultiplier;
            }
            if (effect.freeBullets) {
                freeBullets = true;
            }
            if (effect.invulnerable) {
                invulnerable = true;
            }
        }
        player.damageMultiplier = damageMultiplier;
        player.fireRateMultiplier = fireRateMultiplier;
        player.freeBullets = freeBullets;
        player.invulnerable = invulnerable;
        console.log(`🔄 更新玩家增强效果: 伤害×${damageMultiplier.toFixed(1)}，射速×${fireRateMultiplier.toFixed(1)}，免费子弹:${freeBullets}，无敌:${invulnerable}`);
    }
    removeBonusEffect(bonusId) {
        const bonus = this.activeBonuses.get(bonusId);
        if (!bonus) return;
        console.log(`❌ 移除增强效果: ${bonus.name}`);
        this.activeBonuses.delete(bonusId);
        this.applyBonusEffects();
        if (this.activeBonuses.size === 0) {
            const player = this.scene.player;
            if (player) {
                player.damageMultiplier = 1.0;
                player.fireRateMultiplier = 1.0;
                player.freeBullets = false;
                player.invulnerable = false;
                console.log('🔄 重置玩家状态');
            }
        }
        this.scene.updateHUD();
    }
    createHealEffect() {
        const player = this.scene.player;
        if (!player) return;
        const healEffect = this.scene.add.particles(player.x, player.y, 'bullet', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 15,
            tint: 0x44ff44
        }).setDepth(150);
        this.scene.time.delayedCall(1200, () => {
            healEffect.destroy();
        });
    }
    createBoostEffect(powerUpData) {
        const player = this.scene.player;
        if (!player) return;
        const boostEffect = this.scene.add.particles(player.x, player.y, 'bullet', {
            speed: { min: 50, max: 120 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 20,
            tint: powerUpData.color
        }).setDepth(150);
        this.scene.time.delayedCall(1800, () => {
            boostEffect.destroy();
        });
        const playerGlow = this.scene.add.circle(player.x, player.y, 30, powerUpData.color, 0.3)
            .setDepth(player.depth - 1);
        this.scene.tweens.add({
            targets: playerGlow,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 1000,
            ease: 'Power2',
            onUpdate: () => {
                if (player && playerGlow) {
                    playerGlow.setPosition(player.x, player.y);
                }
            },
            onComplete: () => {
                playerGlow.destroy();
            }
        });
    }
    showPowerUpNotification(powerUpData) {
        const notification = this.scene.add.container(640, 100);
        const bg = this.scene.add.rectangle(0, 0, 300, 60, 0x000000, 0.7)
            .setStroke(powerUpData.color, 2);
        const text = this.scene.add.text(0, -10, `获得道具: ${powerUpData.symbol} ${powerUpData.name}`, {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        const desc = this.scene.add.text(0, 10, powerUpData.description, {
            fontSize: '12px',
            fill: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);
        notification.add([bg, text, desc]);
        notification.setDepth(1000);
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 120,
            duration: 500,
            ease: 'Back'
        });
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                y: 80,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    update() {
        this.powerUps.children.entries.forEach(powerUp => {
            if (powerUp.update) {
                powerUp.update();
            }
        });
        const now = Date.now();
        for (const [bonusId, bonus] of this.activeBonuses) {
            if (now >= bonus.endTime) {
                this.removeBonusEffect(bonusId);
            }
        }
    }
    getActiveBonuses() {
        return Array.from(this.activeBonuses.values());
    }
    destroy() {
        this.powerUps.clear(true, true);
        this.activeBonuses.clear();
    }
}
window.PowerUpManager = PowerUpManager; 