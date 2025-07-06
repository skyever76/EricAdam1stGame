// Obstacle.js - 障碍物基类
class Obstacle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, obstacleData) {
        super(scene, x, y);
      
        this.scene = scene;
        this.obstacleData = obstacleData;
        this.obstacleType = obstacleData.type;
        this.name = obstacleData.name;
      
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
      
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
      
        // 主体
        this.mainBody = this.scene.add.graphics();
        this.mainBody.fillStyle(data.primaryColor, 1);
        this.mainBody.lineStyle(3, data.secondaryColor, 1);
      
        // 根据障碍物类型创建不同外观
        switch (this.obstacleType) {
            case 'rock':
                this.createRock();
                break;
            case 'tree':
                this.createTree();
                break;
            case 'building':
                this.createBuilding();
                break;
            case 'coral':
                this.createCoral();
                break;
            case 'asteroid':
                this.createAsteroid();
                break;
        }
      
        this.add(this.mainBody);
        this.setDepth(50);
    }
  
    createRock() {
        const data = this.obstacleData;
      
        // 不规则岩石形状
        this.mainBody.beginPath();
        this.mainBody.moveTo(-data.width/2, -data.height/2);
        this.mainBody.lineTo(data.width/2, -data.height/3);
        this.mainBody.lineTo(data.width/3, data.height/2);
        this.mainBody.lineTo(-data.width/3, data.height/2);
        this.mainBody.closePath();
        this.mainBody.fillPath();
        this.mainBody.strokePath();
      
        // 岩石纹理
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * data.width * 0.6;
            const y = (Math.random() - 0.5) * data.height * 0.6;
            this.mainBody.fillStyle(0x666666);
            this.mainBody.fillCircle(x, y, 3);
        }
    }
  
    createTree() {
        const data = this.obstacleData;
      
        // 树干
        this.mainBody.fillRect(-data.width/4, -data.height/2, data.width/2, data.height);
        this.mainBody.strokeRect(-data.width/4, -data.height/2, data.width/2, data.height);
      
        // 树冠
        this.mainBody.fillStyle(0x2d5016);
        this.mainBody.fillCircle(0, -data.height/2, data.width/2);
        this.mainBody.strokeCircle(0, -data.height/2, data.width/2);
      
        // 树叶细节
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * (data.width * 0.3);
            const y = -data.height/2 + Math.sin(angle) * (data.height * 0.3);
            this.mainBody.fillStyle(0x4a5d23);
            this.mainBody.fillCircle(x, y, 8);
        }
    }
  
    createBuilding() {
        const data = this.obstacleData;
      
        // 建筑主体
        this.mainBody.fillRect(-data.width/2, -data.height/2, data.width, data.height);
        this.mainBody.strokeRect(-data.width/2, -data.height/2, data.width, data.height);
      
        // 窗户
        const windowSize = 8;
        const windows = [
            { x: -data.width/4, y: -data.height/4 },
            { x: data.width/4, y: -data.height/4 },
            { x: -data.width/4, y: data.height/4 },
            { x: data.width/4, y: data.height/4 }
        ];
      
        windows.forEach(window => {
            this.mainBody.fillStyle(0x87ceeb);
            this.mainBody.fillRect(window.x - windowSize/2, window.y - windowSize/2, windowSize, windowSize);
            this.mainBody.strokeRect(window.x - windowSize/2, window.y - windowSize/2, windowSize, windowSize);
        });
    }
  
    createCoral() {
        const data = this.obstacleData;
      
        // 珊瑚主体
        this.mainBody.fillStyle(0xff6b9d);
        this.mainBody.fillCircle(0, 0, data.width/2);
        this.mainBody.strokeCircle(0, 0, data.width/2);
      
        // 珊瑚分支
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const startX = Math.cos(angle) * (data.width * 0.2);
            const startY = Math.sin(angle) * (data.height * 0.2);
            const endX = Math.cos(angle) * (data.width * 0.4);
            const endY = Math.sin(angle) * (data.height * 0.4);
          
            this.mainBody.lineStyle(4, 0xff8fab, 1);
            this.mainBody.moveTo(startX, startY);
            this.mainBody.lineTo(endX, endY);
            this.mainBody.strokePath();
        }
    }
  
    createAsteroid() {
        const data = this.obstacleData;
      
        // 小行星主体
        this.mainBody.fillCircle(0, 0, data.width/2);
        this.mainBody.strokeCircle(0, 0, data.width/2);
      
        // 陨石坑
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * (data.width * 0.3);
            const y = Math.sin(angle) * (data.height * 0.3);
          
            this.mainBody.fillStyle(0x444444);
            this.mainBody.fillCircle(x, y, 6);
        }
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
      
        this.add([this.healthBarBg, this.healthBar, this.healthBarBorder]);
    }
  
    setupAnimations() {
        // 轻微浮动动画
        this.scene.tweens.add({
            targets: this,
            y: this.y - 2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
  
    // 🎯 受到伤害
    takeDamage(damage, damageType = 'bullet', attacker = null) {
        if (!this.isDestructible || this.isDestroyed) {
            return false;
        }
      
        console.log(`🪨 ${this.name} 受到 ${damage} 点伤害`);
      
        this.health -= damage;
        this.updateHealthBar();
      
        // 受击效果
        this.createDamageEffect(damage);
      
        // 检查是否被摧毁
        if (this.health <= 0) {
            this.startDestructionSequence();
            return true;
        }
      
        return false;
    }
  
    // 🩸 更新血条
    updateHealthBar() {
        if (!this.isDestructible || !this.healthBar) return;
      
        const healthRatio = Math.max(0, this.health / this.maxHealth);
        const barWidth = 60;
      
        this.healthBar.setSize(barWidth * healthRatio, 6);
      
        // 血条颜色变化
        if (healthRatio > 0.6) {
            this.healthBar.setFillStyle(0x00ff00);
        } else if (healthRatio > 0.3) {
            this.healthBar.setFillStyle(0xffff00);
        } else {
            this.healthBar.setFillStyle(0xff0000);
        }
    }
  
    // 💥 创建受击效果
    createDamageEffect(damage) {
        // 受击闪烁
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
      
        // 伤害数字
        const damageText = this.scene.add.text(
            this.x + (Math.random() - 0.5) * 30,
            this.y - 30,
            `-${damage}`,
            {
                fontSize: '16px',
                fill: '#ff0000',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        ).setDepth(200);
      
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });
      
        // 受击粒子
        const hitEffect = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 8,
            tint: 0xff4444
        }).setDepth(150);
      
        this.scene.time.delayedCall(500, () => {
            hitEffect.destroy();
        });
    }
  
    // 💀 开始摧毁序列
    startDestructionSequence() {
        console.log(`💀 ${this.name} 开始摧毁序列`);
      
        this.isDestroyed = true;
      
        // 摧毁动画
        this.createDestructionEffect();
      
        // 1.5秒后完成摧毁
        this.scene.time.delayedCall(1500, () => {
            this.completeDestruction();
        });
    }
  
    // 🔥 创建摧毁特效
    createDestructionEffect() {
        // 爆炸效果
        const explosion = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: { min: 60, max: 150 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 15,
            tint: [0xff8800, 0xffff00, 0xff4444]
        }).setDepth(200);
      
        // 碎片效果
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const fragment = this.scene.add.rectangle(
                this.x + Math.cos(angle) * 20,
                this.y + Math.sin(angle) * 20,
                8, 8, this.obstacleData.primaryColor
            );
          
            this.scene.tweens.add({
                targets: fragment,
                x: fragment.x + Math.cos(angle) * 100,
                y: fragment.y + Math.sin(angle) * 100,
                alpha: 0,
                rotation: Math.PI * 2,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    fragment.destroy();
                }
            });
        }
      
        // 摄像机震动
        this.scene.cameras.main.shake(300, 0.02);
      
        // 清理效果
        this.scene.time.delayedCall(800, () => {
            explosion.destroy();
        });
    }
  
    // ✅ 完成摧毁
    completeDestruction() {
        console.log(`✅ ${this.name} 摧毁完成`);
      
        // 可能掉落道具
        this.dropLoot();
      
        // 通知管理器
        if (this.scene.obstacleManager) {
            this.scene.obstacleManager.onObstacleDestroyed(this);
        }
      
        // 销毁障碍物
        this.destroy();
    }
  
    // 🎁 掉落道具
    dropLoot() {
        if (!this.obstacleData.loot || Math.random() > 0.3) return; // 30%概率掉落
      
        const loot = this.obstacleData.loot;
        const player = this.scene.player;
      
        if (!player) return;
      
        console.log(`🎁 ${this.name} 掉落道具`);
      
        // 经验奖励
        if (loot.experience && player.gainExperience) {
            player.gainExperience(loot.experience);
        }
      
        // 金币奖励
        if (loot.coins && this.scene.gameState) {
            this.scene.gameState.coins += loot.coins;
        }
      
        // 道具奖励
        if (loot.powerUps && this.scene.powerUpManager) {
            loot.powerUps.forEach((powerUpType, index) => {
                const x = this.x + (Math.random() - 0.5) * 60;
                const y = this.y + (Math.random() - 0.5) * 60;
              
                this.scene.time.delayedCall(index * 150, () => {
                    const powerUpData = POWER_UP_TYPES[powerUpType];
                    if (powerUpData) {
                        this.scene.powerUpManager.createPowerUp(x, y, powerUpData);
                    }
                });
            });
        }
    }
  
    // 🔄 更新障碍物
    update(time, delta) {
        // 障碍物通常不需要复杂的更新逻辑
        // 可以在这里添加特殊效果或状态更新
    }
  
    // 💀 销毁障碍物
    destroy() {
        console.log(`💀 ${this.name} 已被销毁`);
        super.destroy();
    }
}

window.Obstacle = Obstacle; 