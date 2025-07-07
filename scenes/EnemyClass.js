// scenes/EnemyClass.js - ES6模块敌人类

import { AI_BEHAVIORS } from './levels.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyConfig) {
        super(scene, x, y, enemyConfig.sprite);
        
        this.scene = scene;
        this.enemyConfig = enemyConfig; // 保存配置
        this.isDead = false;
        this.escapeTimer = 0;
        this.escapeTime = 10000; // 10秒后逃跑
        
        // 从配置初始化所有属性
        this.health = enemyConfig.hp;
        this.maxHealth = enemyConfig.hp;
        this.speed = enemyConfig.speed;
        this.score = enemyConfig.score;
        this.canShoot = enemyConfig.canShoot;
        this.shootRate = enemyConfig.shootRate;
        this.lastShootTime = 0;
        this.bulletSpeed = enemyConfig.bulletSpeed || 200;
        this.bulletDamage = enemyConfig.bulletDamage || 15;

        // 设置AI行为
        this.aiUpdate = AI_BEHAVIORS[enemyConfig.ai]?.update || AI_BEHAVIORS.straight.update;
        this.aiData = {}; // 用于存储AI的特定状态数据

        // 添加到场景
        scene.add.existing(this);
        
        // 设置物理属性
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.2);
        
        // 设置显示属性
        this.setDisplaySize(40, 40);
        this.setTint(this.getEnemyColor());
        
        // 设置移动方向
        this.direction = Phaser.Math.Vector2.RIGHT;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 3000;
    }
    
    getEnemyColor() {
        return this.enemyConfig.color || 0xFF0000;
    }
    
    update(time, delta) {
        if (this.isDead) return;
        
        // 更新逃跑计时器
        this.escapeTimer += delta;
        if (this.escapeTimer >= this.escapeTime) {
            this.escape();
            return;
        }
        
        // 直接调用从配置中获取的AI更新函数
        if (this.aiUpdate) {
            this.aiUpdate(this, time, delta);
        }
        
        // 检查射击
        if (this.canShoot) {
            this.checkShooting(time);
        }
        
        // 检查特殊能力
        this.checkSpecialAbility(time, delta);
        
        // 更新动画
        this.updateAnimation();
    }
    
    checkShooting(time) {
        if (time - this.lastShootTime > this.shootRate) {
            this.shoot();
            this.lastShootTime = time;
        }
    }
    
    shoot() {
        const player = this.scene.player;
        if (!player) return;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        const bullet = this.scene.enemyBullets.get();
        if (bullet) {
            // 传递一个简单的配置
            bullet.fire(this.x, this.y, angle, { 
                damage: this.bulletDamage, 
                speed: this.bulletSpeed,
                size: 8,
                color: 0xff4500
            });
        }
    }
    
    updateAnimation() {
        // 根据移动方向更新动画
        if (this.body.velocity.x > 0) {
            this.setFlipX(false);
        } else if (this.body.velocity.x < 0) {
            this.setFlipX(true);
        }
    }
    
    // 🆕 特殊能力检查
    checkSpecialAbility(time, delta) {
        if (!this.enemyConfig.special) return;
        
        // 初始化特殊能力数据
        if (!this.specialData) {
            this.specialData = {
                lastAbilityTime: 0,
                abilityCooldown: 5000, // 5秒冷却
                abilityDuration: 2000, // 2秒持续时间
                isActive: false
            };
        }
        
        // 检查冷却时间
        if (time - this.specialData.lastAbilityTime < this.specialData.abilityCooldown) {
            return;
        }
        
        // 执行特殊能力
        switch (this.enemyConfig.special) {
            case 'repair':
                this.executeRepairAbility(time);
                break;
            case 'web':
                this.executeWebAbility(time);
                break;
            case 'multiply':
                this.executeMultiplyAbility(time);
                break;
            case 'poison':
                this.executePoisonAbility(time);
                break;
            case 'disguise':
                this.executeDisguiseAbility(time);
                break;
            case 'replicate':
                this.executeReplicateAbility(time);
                break;
            case 'acid':
                this.executeAcidAbility(time);
                break;
            case 'entangle':
                this.executeEntangleAbility(time);
                break;
            case 'intangible':
                this.executeIntangibleAbility(time);
                break;
            case 'fear':
                this.executeFearAbility(time);
                break;
            case 'screech':
                this.executeScreechAbility(time);
                break;
            case 'claw':
                this.executeClawAbility(time);
                break;
            case 'blade':
                this.executeBladeAbility(time);
                break;
            case 'timerift':
                this.executeTimeRiftAbility(time);
                break;
            case 'reflect':
                this.executeReflectAbility(time);
                break;
            case 'blind':
                this.executeBlindAbility(time);
                break;
        }
        
        this.specialData.lastAbilityTime = time;
    }
    
    // 🔧 维修能力
    executeRepairAbility(time) {
        const nearbyEnemies = this.scene.enemies?.getChildren() || [];
        let repaired = false;
        
        nearbyEnemies.forEach(otherEnemy => {
            if (otherEnemy !== this && otherEnemy.active && !otherEnemy.isDead) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, otherEnemy.x, otherEnemy.y);
                if (distance < 150 && otherEnemy.health < otherEnemy.maxHealth) {
                    otherEnemy.health = Math.min(otherEnemy.maxHealth, otherEnemy.health + 20);
                    repaired = true;
                    
                    // 创建修复效果
                    this.createRepairEffect(otherEnemy.x, otherEnemy.y);
                }
            }
        });
        
        if (repaired) {
            console.log('🔧 维修无人机修复了附近敌人');
        }
    }
    
    // 🕸️ 蛛网能力
    executeWebAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 200) {
            // 减速玩家
            player.setVelocity(player.body.velocity.x * 0.5, player.body.velocity.y * 0.5);
            
            // 创建蛛网效果
            this.createWebEffect(player.x, player.y);
            
            console.log('🕸️ 机械蜘蛛释放了蛛网');
        }
    }
    
    // 🦠 分裂能力
    executeMultiplyAbility(time) {
        if (this.health < this.maxHealth * 0.3) { // 血量低于30%时分裂
            // 创建分裂效果
            this.createMultiplyEffect();
            
            // 分裂成两个较小的敌人
            for (let i = 0; i < 2; i++) {
                const newEnemy = this.scene.enemies.get();
                if (newEnemy) {
                    const offsetX = (Math.random() - 0.5) * 50;
                    const offsetY = (Math.random() - 0.5) * 50;
                    newEnemy.spawn(this.x + offsetX, this.y + offsetY, {
                        ...this.enemyConfig,
                        hp: Math.floor(this.health * 0.5),
                        size: this.enemyConfig.size * 0.7
                    });
                }
            }
            
            console.log('🦠 病毒分裂了');
        }
    }
    
    // ☠️ 毒液能力
    executePoisonAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 100) {
            // 对玩家造成持续伤害
            if (player.takeDamage) {
                player.takeDamage(5);
            }
            
            // 创建毒液效果
            this.createPoisonEffect(player.x, player.y);
            
            console.log('☠️ 细菌释放了毒液');
        }
    }
    
    // 🎭 伪装能力
    executeDisguiseAbility(time) {
        // 切换外观
        const colors = [0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.setTint(randomColor);
        
        // 创建伪装效果
        this.createDisguiseEffect();
        
        console.log('🎭 木马程序伪装了');
    }
    
    // 🔄 复制能力
    executeReplicateAbility(time) {
        // 创建复制效果
        this.createReplicateEffect();
        
        // 短暂提升属性
        this.speed *= 1.5;
        this.health = Math.min(this.maxHealth, this.health + 10);
        
        // 3秒后恢复正常
        this.scene.time.delayedCall(3000, () => {
            this.speed = this.enemyConfig.speed;
        });
        
        console.log('🔄 蠕虫病毒复制了');
    }
    
    // 🧪 酸液能力
    executeAcidAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 120) {
            // 对玩家造成额外伤害
            if (player.takeDamage) {
                player.takeDamage(15);
            }
            
            // 创建酸液效果
            this.createAcidEffect(player.x, player.y);
            
            console.log('🧪 变异昆虫释放了酸液');
        }
    }
    
    // 🌿 缠绕能力
    executeEntangleAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 150) {
            // 完全停止玩家移动
            player.setVelocity(0, 0);
            
            // 创建缠绕效果
            this.createEntangleEffect(player.x, player.y);
            
            // 2秒后恢复
            this.scene.time.delayedCall(2000, () => {
                if (player && player.active) {
                    // 恢复玩家移动
                }
            });
            
            console.log('🌿 行走植物缠绕了玩家');
        }
    }
    
    // 👻 无形能力
    executeIntangibleAbility(time) {
        // 短暂变为无形状态
        this.setAlpha(0.3);
        this.body.enable = false;
        
        // 创建无形效果
        this.createIntangibleEffect();
        
        // 3秒后恢复
        this.scene.time.delayedCall(3000, () => {
            this.setAlpha(1);
            this.body.enable = true;
        });
        
        console.log('👻 阴影人变为无形');
    }
    
    // 😱 恐惧能力
    executeFearAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        // 创建恐惧效果
        this.createFearEffect();
        
        // 短暂提升攻击力
        this.enemyConfig.damage *= 1.5;
        
        // 5秒后恢复正常
        this.scene.time.delayedCall(5000, () => {
            this.enemyConfig.damage = this.enemyConfig.damage / 1.5;
        });
        
        console.log('😱 梦魇释放了恐惧');
    }
    
    // 🦅 尖啸能力
    executeScreechAbility(time) {
        // 创建尖啸效果
        this.createScreechEffect();
        
        // 短暂眩晕附近敌人（如果有的话）
        const nearbyEnemies = this.scene.enemies?.getChildren() || [];
        nearbyEnemies.forEach(otherEnemy => {
            if (otherEnemy !== this && otherEnemy.active) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, otherEnemy.x, otherEnemy.y);
                if (distance < 200) {
                    otherEnemy.setVelocity(0, 0);
                    this.scene.time.delayedCall(1000, () => {
                        if (otherEnemy.active) {
                            // 恢复敌人移动
                        }
                    });
                }
            }
        });
        
        console.log('🦅 鹰身女妖发出尖啸');
    }
    
    // 🦁 利爪能力
    executeClawAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 80) {
            // 造成高伤害
            if (player.takeDamage) {
                player.takeDamage(30);
            }
            
            // 创建利爪效果
            this.createClawEffect(player.x, player.y);
            
            console.log('🦁 狮鹫使用了利爪攻击');
        }
    }
    
    // ⚔️ 刀刃能力
    executeBladeAbility(time) {
        // 创建刀刃效果
        this.createBladeEffect();
        
        // 提升攻击力
        this.enemyConfig.damage *= 2;
        
        // 4秒后恢复正常
        this.scene.time.delayedCall(4000, () => {
            this.enemyConfig.damage = this.enemyConfig.damage / 2;
        });
        
        console.log('⚔️ 赛博武士激活了刀刃');
    }
    
    // ⏰ 时空裂隙能力
    executeTimeRiftAbility(time) {
        // 创建时空裂隙效果
        this.createTimeRiftEffect();
        
        // 短暂加速
        this.speed *= 2;
        
        // 2秒后恢复正常
        this.scene.time.delayedCall(2000, () => {
            this.speed = this.enemyConfig.speed;
        });
        
        console.log('⏰ 时空士兵开启了时空裂隙');
    }
    
    // 💎 反射能力
    executeReflectAbility(time) {
        // 创建反射效果
        this.createReflectEffect();
        
        // 短暂无敌
        this.setAlpha(0.8);
        this.isInvulnerable = true;
        
        // 3秒后恢复正常
        this.scene.time.delayedCall(3000, () => {
            this.setAlpha(1);
            this.isInvulnerable = false;
        });
        
        console.log('💎 水晶魔像激活了反射护盾');
    }
    
    // 💡 致盲能力
    executeBlindAbility(time) {
        const player = this.scene.player;
        if (!player) return;
        
        // 创建致盲效果
        this.createBlindEffect();
        
        // 对玩家造成视觉干扰
        if (player.setAlpha) {
            player.setAlpha(0.5);
            this.scene.time.delayedCall(2000, () => {
                if (player && player.active) {
                    player.setAlpha(1);
                }
            });
        }
        
        console.log('💡 光元素致盲了玩家');
    }
    
    // 特效创建方法
    createRepairEffect(x, y) {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 20, max: 60 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0x00ff00,
            lifespan: 800,
            quantity: 10
        });
        
        this.scene.time.delayedCall(800, () => {
            particles.destroy();
        });
    }
    
    createWebEffect(x, y) {
        const web = this.scene.add.graphics();
        web.lineStyle(2, 0x8B4513, 0.7);
        web.strokeCircle(x, y, 50);
        web.setDepth(10);
        
        this.scene.time.delayedCall(2000, () => {
            web.destroy();
        });
    }
    
    createMultiplyEffect() {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 30, max: 80 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff00ff,
            lifespan: 1000,
            quantity: 15
        });
        
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    
    createPoisonEffect(x, y) {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 10, max: 30 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0x00ff00,
            lifespan: 1500,
            quantity: 8
        });
        
        this.scene.time.delayedCall(1500, () => {
            particles.destroy();
        });
    }
    
    createDisguiseEffect() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
    }
    
    createReplicateEffect() {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 20, max: 50 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0x00ffff,
            lifespan: 600,
            quantity: 12
        });
        
        this.scene.time.delayedCall(600, () => {
            particles.destroy();
        });
    }
    
    createAcidEffect(x, y) {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 15, max: 40 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: 0x90ee90,
            lifespan: 1200,
            quantity: 10
        });
        
        this.scene.time.delayedCall(1200, () => {
            particles.destroy();
        });
    }
    
    createEntangleEffect(x, y) {
        const vines = this.scene.add.graphics();
        vines.lineStyle(3, 0x228b22, 0.8);
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const startX = x + Math.cos(angle) * 20;
            const startY = y + Math.sin(angle) * 20;
            const endX = x + Math.cos(angle) * 60;
            const endY = y + Math.sin(angle) * 60;
            vines.lineBetween(startX, startY, endX, endY);
        }
        vines.setDepth(10);
        
        this.scene.time.delayedCall(2000, () => {
            vines.destroy();
        });
    }
    
    createIntangibleEffect() {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 10, max: 30 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: 0x000000,
            lifespan: 800,
            quantity: 6
        });
        
        this.scene.time.delayedCall(800, () => {
            particles.destroy();
        });
    }
    
    createFearEffect() {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 25, max: 60 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0x8b0000,
            lifespan: 1000,
            quantity: 15
        });
        
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    
    createScreechEffect() {
        const screech = this.scene.add.graphics();
        screech.lineStyle(4, 0xdaa520, 0.6);
        screech.strokeCircle(this.x, this.y, 100);
        screech.setDepth(10);
        
        this.scene.tweens.add({
            targets: screech,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                screech.destroy();
            }
        });
    }
    
    createClawEffect(x, y) {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 40, max: 80 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xcd853f,
            lifespan: 600,
            quantity: 12
        });
        
        this.scene.time.delayedCall(600, () => {
            particles.destroy();
        });
    }
    
    createBladeEffect() {
        const blade = this.scene.add.graphics();
        blade.lineStyle(5, 0x4169e1, 0.9);
        blade.lineBetween(this.x - 30, this.y, this.x + 30, this.y);
        blade.setDepth(10);
        
        this.scene.tweens.add({
            targets: blade,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                blade.destroy();
            }
        });
    }
    
    createTimeRiftEffect() {
        const rift = this.scene.add.graphics();
        rift.lineStyle(3, 0xff6600, 0.7);
        rift.strokeCircle(this.x, this.y, 80);
        rift.setDepth(10);
        
        this.scene.tweens.add({
            targets: rift,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                rift.destroy();
            }
        });
    }
    
    createReflectEffect() {
        const shield = this.scene.add.graphics();
        shield.lineStyle(6, 0x9370db, 0.8);
        shield.strokeCircle(this.x, this.y, 60);
        shield.setDepth(10);
        
        this.scene.tweens.add({
            targets: shield,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                shield.destroy();
            }
        });
    }
    
    createBlindEffect() {
        const flash = this.scene.add.graphics();
        flash.fillStyle(0xffffff, 0.3);
        flash.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        flash.setDepth(100);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    takeDamage(damage) {
        if (this.isDead) return;
        
        this.health -= damage;
        
        // 创建伤害效果
        this.createDamageEffect(damage);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    createDamageEffect(damage) {
        // 创建伤害数字
        const damageText = this.scene.add.text(this.x, this.y - 30, `-${damage}`, {
            fontSize: '16px',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 伤害数字动画
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });
        
        // 闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // 创建死亡效果
        this.createDeathEffect();
        
        // 触发敌人死亡事件
        this.scene.events.emit('enemyDied', {
            enemy: this,
            score: this.score,
            position: { x: this.x, y: this.y }
        });
        
        // 回收敌人到对象池
        this.recycle();
    }
    
    createDeathEffect() {
        // 创建爆炸粒子效果
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: this.getEnemyColor(),
            lifespan: 1000,
            quantity: 20
        });
        
        // 1秒后销毁粒子系统
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
        
        // 播放死亡音效
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('enemy_death');
        }
    }
    
    escape() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // 触发敌人逃跑事件
        this.scene.events.emit('enemyEscaped', {
            enemy: this,
            damage: this.enemyConfig.escapeDamage || 10,
            position: { x: this.x, y: this.y }
        });
        
        // 回收敌人到对象池
        this.recycle();
    }
    
    // 对象池回收方法
    recycle() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
        this.body.setVelocity(0, 0);
        this.setPosition(0, 0);
        
        // 重置状态
        this.isDead = false;
        this.escapeTimer = 0;
        this.health = this.maxHealth;
        this.lastShootTime = 0;
        this.aiData = {};
        this.setAlpha(1);
        this.setTint(this.getEnemyColor());
    }
    
    // 从对象池激活敌人
    spawn(x, y, enemyConfig) {
        // 更新配置
        this.enemyConfig = enemyConfig;
        
        // 重置属性
        this.health = enemyConfig.hp;
        this.maxHealth = enemyConfig.hp;
        this.speed = enemyConfig.speed;
        this.score = enemyConfig.score;
        this.canShoot = enemyConfig.canShoot;
        this.shootRate = enemyConfig.shootRate;
        this.bulletSpeed = enemyConfig.bulletSpeed || 200;
        this.bulletDamage = enemyConfig.bulletDamage || 15;
        
        // 更新AI行为
        this.aiUpdate = AI_BEHAVIORS[enemyConfig.ai]?.update || AI_BEHAVIORS.straight.update;
        this.aiData = {};
        
        // 设置位置和显示
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.setTint(this.getEnemyColor());
        
        // 重置状态
        this.isDead = false;
        this.escapeTimer = 0;
        this.lastShootTime = 0;
        this.setAlpha(1);
    }
}

console.log('✅ EnemyClass.js ES6模块已加载'); 