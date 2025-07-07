// Obstacle.js - 障碍物基类
import { POWER_UP_TYPES } from './PowerUpDef.js';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, obstacleData) {
        super(scene, x, y);
      
        this.scene = scene;
        this.obstacleData = obstacleData;
        this.obstacleType = obstacleData.type;
        this.name = obstacleData.name;
      
        // 添加到场景
        scene.add.existing(this);
      
        // 障碍物基础属性
        this.health = obstacleData.health;
        this.maxHealth = this.health;
        this.isDestroyed = false;
        this.isDestructible = obstacleData.destructible !== false;
      
        // 物理属性
        this.body.setSize(obstacleData.width, obstacleData.height);
        this.body.setImmovable(true);
        this.body.setCollideWorldBounds(false);
      
        // 视觉效果
        this.createVisual();
        this.createHealthBar();
        this.setupAnimations();
      
        console.log(`🪨 障碍物生成: ${this.name} (${this.health}HP)`);
    }
  
    createVisual() {
        const data = this.obstacleData;
      
        // 创建临时Graphics对象来绘制纹理
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(data.primaryColor, 1);
        graphics.lineStyle(3, data.secondaryColor, 1);
      
        // 使用配置中的视觉绘制函数
        if (data.visualizer) {
            data.visualizer(graphics, data);
        }
      
        // 将Graphics转换为纹理并应用到Sprite
        graphics.generateTexture('obstacle_' + this.obstacleType, data.width, data.height);
        this.setTexture('obstacle_' + this.obstacleType);
        graphics.destroy();
      
        this.setDepth(50);
    }
  
    createHealthBar() {
        if (!this.isDestructible) return;
      
        const barWidth = 60;
        const barHeight = 6;
        const x = -barWidth / 2;
        const y = -this.obstacleData.height / 2 - 15;
      
        // 背景
        this.healthBarBg = this.scene.add.rectangle(x, y, barWidth, barHeight, 0x333333);
        this.healthBarBg.setOrigin(0, 0.5);
      
        // 血条
        this.healthBar = this.scene.add.rectangle(x, y, barWidth, barHeight, 0x00ff00);
        this.healthBar.setOrigin(0, 0.5);
      
        // 边框
        this.healthBarBorder = this.scene.add.rectangle(x + barWidth/2, y, barWidth, barHeight);
        this.healthBarBorder.setStrokeStyle(1, 0xffffff, 1);
        this.healthBarBorder.setFillStyle();
      
        // 将血条作为子对象添加到障碍物容器中
        this.add([this.healthBarBg, this.healthBar, this.healthBarBorder]);
    }
  
    setupAnimations() {
        // 轻微浮动动画
        this.scene.tweens.add({
            targets: this,
            y: this.y + 2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
  
    // 🎯 对象池支持 - 重置障碍物
    spawn(x, y, obstacleData) {
        this.setPosition(x, y);
        this.obstacleData = obstacleData;
        this.obstacleType = obstacleData.type;
        this.name = obstacleData.name;
        this.health = obstacleData.health;
        this.maxHealth = this.health;
        this.isDestroyed = false;
        this.isDestructible = obstacleData.destructible !== false;
        
        // 重新创建视觉效果
        this.createVisual();
        this.createHealthBar();
        this.setupAnimations();
        
        this.setActive(true);
        this.setVisible(true);
        
        console.log(`🪨 障碍物重生: ${this.name} (${this.health}HP)`);
    }
  
    // 🔄 对象池支持 - 回收障碍物
    recycle() {
        this.setActive(false);
        this.setVisible(false);
        
        // 停止动画
        this.scene.tweens.killTweensOf(this);
        
        // 清理血条（子对象会自动被清理）
        this.healthBarBg = null;
        this.healthBar = null;
        this.healthBarBorder = null;
        
        console.log(`🔄 障碍物回收: ${this.name}`);
    }
  
    takeDamage(damage, damageType = 'bullet', attacker = null) {
        if (this.isDestroyed || !this.isDestructible) {
            return false;
        }
      
        this.health -= damage;
        this.updateHealthBar();
        this.createDamageEffect(damage);
      
        console.log(`💥 障碍物受伤: ${this.name} -${damage}HP (剩余: ${this.health})`);
      
        if (this.health <= 0) {
            this.startDestructionSequence();
            return true;
        }
      
        return false;
    }
  
    updateHealthBar() {
        if (!this.isDestructible || !this.healthBar) return;
      
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 60;
      
        this.healthBar.width = barWidth * healthPercent;
      
        // 根据血量改变颜色
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00ff00);
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xffff00);
        } else {
            this.healthBar.setFillStyle(0xff0000);
        }
    }
  
    createDamageEffect(damage) {
        // 伤害数字
        const damageText = this.scene.add.text(this.x, this.y - 30, `-${damage}`, {
            fontSize: '16px',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 2
        });
        damageText.setOrigin(0.5);
      
        // 闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
      
        // 伤害数字动画
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
            }
        });
      
        // 受击粒子效果
        this.createHitParticles();
    }
  
    createHitParticles() {
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff6666,
            lifespan: 500,
            quantity: 8
        });
      
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }
  
    startDestructionSequence() {
        if (this.isDestroyed) return;
      
        this.isDestroyed = true;
        console.log(`💥 障碍物开始摧毁: ${this.name}`);
      
        // 创建摧毁特效
        this.createDestructionEffect();
      
        // 延迟完成摧毁
        this.scene.time.delayedCall(1000, () => {
            this.completeDestruction();
        });
    }
  
    createDestructionEffect() {
        // 爆炸粒子效果
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xffaa00,
            lifespan: 1000,
            quantity: 15
        });
      
        // 震动效果
        this.scene.cameras.main.shake(300, 0.01);
      
        // 清理粒子
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
  
    completeDestruction() {
        console.log(`✅ 障碍物摧毁完成: ${this.name}`);
      
        // 掉落物品
        this.dropLoot();
      
        // 通知管理器
        if (this.scene.obstacleManager) {
            this.scene.obstacleManager.onObstacleDestroyed(this);
        }
      
        // 使用对象池回收而不是销毁
        this.recycle();
    }
  
    dropLoot() {
        if (!this.obstacleData.loot) return;
      
        const loot = this.obstacleData.loot;
        console.log(`🎁 障碍物掉落物品: ${this.name}`);
      
        // 掉落经验
        if (loot.experience && this.scene.statsManager) {
            this.scene.statsManager.addExperience(loot.experience);
        }
      
        // 掉落金币
        if (loot.coins && this.scene.statsManager) {
            this.scene.statsManager.addCoins(loot.coins);
        }
      
        // 掉落道具
        if (loot.powerUps && this.scene.powerUpManager) {
            loot.powerUps.forEach(powerUpType => {
                if (Math.random() < 0.3) { // 30%概率掉落
                    const powerUpData = POWER_UP_TYPES[powerUpType];
                    if (powerUpData) {
                        this.scene.powerUpManager.spawnPowerUp(this.x, this.y, powerUpData);
                    }
                }
            });
        }
    }
  
    destroy() {
        // 停止动画
        this.scene.tweens.killTweensOf(this);
        
        super.destroy();
    }
} 