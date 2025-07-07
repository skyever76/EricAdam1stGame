// Obstacle.js - 障碍物基类
import { POWER_UP_TYPES } from './PowerUpDef.js';

export class Obstacle extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y, []);
        this.scene = scene;
        // 其余属性全部在spawn方法中初始化
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
        const visualSprite = this.scene.add.sprite(0, 0, 'obstacle_' + this.obstacleType);
        graphics.destroy();
      
        // 将主视觉Sprite作为子对象添加到容器中
        this.add(visualSprite);
        this.mainBody = visualSprite;
        this.setDepth(50);
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
  
    spawn(x, y, obstacleData) {
        this.setPosition(x, y);
        this.obstacleData = obstacleData;
        this.obstacleType = obstacleData.type;
        this.name = obstacleData.name;
        this.health = obstacleData.health;
        this.maxHealth = this.health;
        this.isDestroyed = false;
        this.isDestructible = obstacleData.destructible !== false;
        
        // 将容器自身添加到场景和物理系统
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // 设置物理体的属性
        this.body.setSize(obstacleData.width, obstacleData.height);
        this.body.setImmovable(true);
        this.body.setCollideWorldBounds(false);
        
        // 重新创建视觉效果
        this.createVisual();
        this.setupAnimations();
        
        this.setActive(true);
        this.setVisible(true);
        
        console.log(`🪨 障碍物重生: ${this.name} (${this.health}HP)`);
    }
  
    // 🔄 对象池支持 - 回收障碍物
    recycle() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false; // 禁用物理体
        
        // 停止动画
        this.scene.tweens.killTweensOf(this);
        
        // ✅ 一键销毁所有子对象（主视觉、血条等），非常干净
        this.removeAll(true);
        
        // 重置引用
        this.mainBody = null;
        
        console.log(`🔄 障碍物回收: ${this.name}`);
    }
  
    takeDamage(damage, damageType = 'bullet', attacker = null) {
        if (this.isDestroyed || !this.isDestructible) {
            return false;
        }
      
        this.health -= damage;
        this.createDamageEffect(damage);
      
        console.log(`💥 障碍物受伤: ${this.name} -${damage}HP (剩余: ${this.health})`);
      
        if (this.health <= 0) {
            this.startDestructionSequence();
            return true;
        }
      
        return false;
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
        // 创建受击效果（不使用过时的粒子系统）
        const effect = this.scene.add.graphics();
        effect.fillStyle(0xff6666, 0.8);
        effect.fillCircle(this.x, this.y, 12);
        effect.setDepth(10);
        
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                effect.destroy();
            }
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
        // 爆炸效果（不使用过时的粒子系统）
        const effect = this.scene.add.graphics();
        effect.fillStyle(0xffaa00, 1);
        effect.fillCircle(this.x, this.y, 25);
        effect.setDepth(10);
        
        // 爆炸动画
        this.scene.tweens.add({
            targets: effect,
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                effect.destroy();
            }
        });
      
        // 震动效果
        this.scene.cameras.main.shake(300, 0.01);
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
        
        // ✅ 一键销毁所有子对象
        this.removeAll(true);
        
        super.destroy();
    }
} 