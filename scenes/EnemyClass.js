// EnemyClass.js - 敌人类重构

import { AI_BEHAVIORS } from '../levels.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
      
        this.scene = scene;
        this.enemyData = null;
      
        // 敌人属性（默认值）
        this.maxHp = 50;
        this.currentHp = 50;
        this.enemySpeed = 100;
        this.scoreValue = 10;
        this.canShoot = false;
        this.shootRate = 2000;
        this.aiType = 'straight';
      
        // AI相关数据
        this.aiData = null;
        this.lastShootTime = 0;
      
        // 视觉效果
        this.healthBar = null;
        this.damageIndicator = null;
        this.speedEffect = null; // 🆕 速度特效
      
        // 🔧 死亡处理标记
        this.isDying = false;
    }
  
    init() {
        // 物理设置
        this.scene.physics.add.existing(this);
        this.setCollideWorldBounds(false);
        this.setDisplaySize(32, 32);
      
        // 初始移动速度
        this.setVelocityX(-this.enemySpeed);
      
        // 创建血量条（如果血量大于基础值）
        if (this.maxHp > 50) {
            this.createHealthBar();
        }
      
        // 设置射击定时器
        if (this.canShoot) {
            this.setupShooting();
        }
      
        // 🆕 为高速敌人添加视觉特效
        this.setupSpeedEffect();
      
        const enemyName = this.enemyData ? this.enemyData.name : 'Unknown';
        console.log(`Enemy created: ${enemyName}, HP: ${this.currentHp}, AI: ${this.aiType}`);
    }
  
    createHealthBar() {
        const barWidth = 30;
        const barHeight = 4;
      
        // 血量条背景
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333);
        this.healthBarBg.fillRect(0, 0, barWidth, barHeight);
      
        // 血量条前景
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }
  
    updateHealthBar() {
        if (!this.healthBar) return;
      
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.currentHp / this.maxHp;
      
        this.healthBar.clear();
      
        // 选择颜色
        let color = 0x00ff00; // 绿色
        if (healthPercent < 0.3) color = 0xff0000; // 红色
        else if (healthPercent < 0.6) color = 0xffff00; // 黄色
      
        this.healthBar.fillStyle(color);
        this.healthBar.fillRect(0, 0, barWidth * healthPercent, barHeight);
      
        // 更新位置
        this.healthBarBg.setPosition(this.x - 15, this.y - 25);
        this.healthBar.setPosition(this.x - 15, this.y - 25);
    }
  
    setupShooting() {
        // 设置射击事件
        this.shootTimer = this.scene.time.addEvent({
            delay: this.shootRate,
            callback: this.tryShoot,
            callbackScope: this,
            loop: true
        });
    }
  
    // 🆕 设置速度特效
    setupSpeedEffect() {
        if (!this.enemyData || !this.scene) return;
      
        // 为高速敌人添加特效
        if (this.enemyData.ai === 'fast_chase' || this.enemyData.ai === 'lightning_hunt') {
            // 创建速度线条特效
            this.speedEffect = this.scene.add.graphics();
            this.speedEffect.setDepth(this.depth - 1);
          
            // 设置特效颜色
            const effectColor = this.enemyData.ai === 'fast_chase' ? 0x00ff00 : 0xff6600;
            this.speedEffect.lineStyle(2, effectColor, 0.6);
          
            // 创建速度线条动画
            this.speedEffectTimer = this.scene.time.addEvent({
                delay: 100,
                callback: this.updateSpeedEffect,
                callbackScope: this,
                loop: true
            });
        }
    }
  
    // 🆕 更新速度特效
    updateSpeedEffect() {
        if (!this.speedEffect || !this.active) return;
      
        this.speedEffect.clear();
      
        // 根据AI类型设置特效颜色
        const effectColor = this.enemyData.ai === 'fast_chase' ? 0x00ff00 : 0xff6600;
        this.speedEffect.lineStyle(2, effectColor, 0.6);
      
        // 绘制速度线条
        const lineLength = 20;
        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        const startX = this.x - Math.cos(angle) * lineLength;
        const startY = this.y - Math.sin(angle) * lineLength;
        const endX = this.x;
        const endY = this.y;
      
        this.speedEffect.moveTo(startX, startY);
        this.speedEffect.lineTo(endX, endY);
      
        // 为极速猎手添加额外的闪电效果
        if (this.enemyData.ai === 'lightning_hunt') {
            this.speedEffect.lineStyle(1, 0xffff00, 0.8);
            this.speedEffect.moveTo(startX + 5, startY + 5);
            this.speedEffect.lineTo(endX + 5, endY + 5);
        }
    }
  
    tryShoot() {
        if (!this.active || !this.scene || !this.scene.player || !this.scene.player.active) return;
      
        // 检查是否在射程内
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.scene.player.x, this.scene.player.y
        );
      
        if (distance < 400) { // 射程400像素
            this.shoot();
        }
    }
  
    shoot() {
        if (!this.scene || !this.scene.enemyBullets) return;
      
        const bullet = this.scene.enemyBullets.get();
        if (bullet) {
            bullet.fireAtPlayer(this.x, this.y, this.scene.player);
            const enemyName = this.enemyData ? this.enemyData.name : 'Unknown';
            console.log(`${enemyName} shoots at player`);
        }
    }
  
    takeDamage(damage) {
        // 🔧 防止重复处理死亡
        if (this.isDying || !this.active) return false;
      
        this.currentHp -= damage;
      
        // 🔧 保存场景引用
        const scene = this.scene;
      
        // 显示伤害数字
        this.showDamageNumber(damage);
      
        // 受伤效果
        this.setTint(0xff0000);
        if (scene) {
            scene.time.delayedCall(100, () => {
                if (this.active) this.clearTint();
            });
        }
      
        // 更新血量条
        this.updateHealthBar();
      
        // 检查是否死亡
        if (this.currentHp <= 0) {
            this.die();
            return true;
        }
      
        return false;
    }
  
    showDamageNumber(damage) {
        // 🔧 检查场景是否存在
        if (!this.scene) return;
      
        const damageText = this.scene.add.text(this.x, this.y - 10, `-${damage}`, {
            font: '14px Arial',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);
      
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });
    }
  
    // 🔧 修复死亡处理 - 移除场景方法调用
    die() {
        // 🔧 防止重复死亡处理
        if (this.isDying) return;
        this.isDying = true;
      
        const enemyName = this.enemyData ? this.enemyData.name : 'Unknown';
        console.log(`${enemyName} destroyed`);
      
        // 🔧 保存场景引用，避免销毁后访问错误
        const scene = this.scene;
        const scoreValue = this.scoreValue;
      
        // 死亡粒子效果
        if (scene && scene.deathEmitter) {
            scene.deathEmitter.setPosition(this.x, this.y);
            scene.deathEmitter.start();
            scene.time.delayedCall(100, () => {
                if (scene.deathEmitter) {
                    scene.deathEmitter.stop();
                }
            });
        }
      
        // 🔧 通过回调通知场景，而不是直接调用场景方法
        const deathData = {
            score: this.scoreValue,
            enemyName: this.enemyData ? this.enemyData.name : 'Unknown',
            position: { x: this.x, y: this.y }
        };
      
        // 发送死亡事件给场景
        if (scene && scene.events) {
            scene.events.emit('enemyDied', deathData);
        }
      
        // 清理血量条
        this.cleanup();
      
        // 销毁自己
        this.destroy();
    }
  
    update() {
        if (!this.active) return;
      
        // 更新AI行为
        this.updateAI();
      
        // 更新血量条位置
        this.updateHealthBar();
      
        // 🆕 更新速度特效
        if (this.speedEffect && this.speedEffectTimer) {
            this.updateSpeedEffect();
        }
      
        // 检查边界
        this.checkBounds();
    }
  
    updateAI() {
        const aiBehavior = AI_BEHAVIORS[this.aiType];
        if (aiBehavior && aiBehavior.update) {
            aiBehavior.update(this);
        }
    }
  
    // 🔧 提取清理逻辑
    cleanup() {
        // 清理血量条
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
            this.healthBarBg = null;
        }
      
        // 清理射击定时器
        if (this.shootTimer) {
            this.shootTimer.destroy();
            this.shootTimer = null;
        }
      
        // 🆕 清理速度特效
        if (this.speedEffect) {
            this.speedEffect.destroy();
            this.speedEffect = null;
        }
        if (this.speedEffectTimer) {
            this.speedEffectTimer.destroy();
            this.speedEffectTimer = null;
        }
    }
  
    checkBounds() {
        // 敌人逃脱检查
        if (this.x < -50 && this.scene) {
            const enemyName = this.enemyData ? this.enemyData.name : 'Unknown';
            console.log(`${enemyName} escaped!`);
          
            // 🔧 通过事件通知场景敌人逃脱
            if (this.scene && this.scene.events) {
                this.scene.events.emit('enemyEscaped', {
                    enemyName: this.enemyData ? this.enemyData.name : 'Unknown',
                    damage: 10 // 逃脱造成的伤害
                });
            }
          
            this.cleanup();
            this.destroy();
        }
    }
  
    destroy() {
        // 🔧 确保完全清理
        this.cleanup();
        super.destroy();
    }
} 