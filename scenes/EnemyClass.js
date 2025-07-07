// scenes/EnemyClass.js - ES6模块敌人类

import { AI_BEHAVIORS } from './levels.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'basic') {
        super(scene, x, y, type);
        
        this.scene = scene;
        this.type = type;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 100;
        this.damage = 20;
        this.score = 10;
        this.aiBehavior = 'patrol';
        this.lastShootTime = 0;
        this.shootInterval = 2000;
        this.bulletSpeed = 200;
        this.isDead = false;
        this.escapeTimer = 0;
        this.escapeTime = 10000; // 10秒后逃跑
        
        // 初始化敌人属性
        this.initEnemyProperties();
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置物理属性
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.2);
        
        // 设置显示属性
        this.setDisplaySize(40, 40);
        this.setTint(this.getEnemyColor());
        
        // 添加AI行为
        this.setupAI();
    }
    
    initEnemyProperties() {
        // 根据敌人类型设置属性
        switch (this.type) {
            case 'thug':
                this.health = 80;
                this.maxHealth = 80;
                this.speed = 120;
                this.damage = 15;
                this.score = 10;
                this.aiBehavior = 'aggressive';
                break;
            case 'soldier':
                this.health = 120;
                this.maxHealth = 120;
                this.speed = 100;
                this.damage = 25;
                this.score = 20;
                this.aiBehavior = 'tactical';
                this.shootInterval = 1500;
                break;
            case 'sniper':
                this.health = 60;
                this.maxHealth = 60;
                this.speed = 80;
                this.damage = 40;
                this.score = 30;
                this.aiBehavior = 'sniper';
                this.shootInterval = 3000;
                this.bulletSpeed = 400;
                break;
            case 'machinegunner':
                this.health = 150;
                this.maxHealth = 150;
                this.speed = 90;
                this.damage = 20;
                this.score = 25;
                this.aiBehavior = 'suppressive';
                this.shootInterval = 800;
                break;
            case 'tank':
                this.health = 300;
                this.maxHealth = 300;
                this.speed = 60;
                this.damage = 35;
                this.score = 50;
                this.aiBehavior = 'tank';
                this.shootInterval = 2500;
                break;
            case 'helicopter':
                this.health = 200;
                this.maxHealth = 200;
                this.speed = 150;
                this.damage = 30;
                this.score = 40;
                this.aiBehavior = 'aerial';
                this.shootInterval = 1200;
                break;
            case 'boss':
                this.health = 1000;
                this.maxHealth = 1000;
                this.speed = 80;
                this.damage = 50;
                this.score = 200;
                this.aiBehavior = 'boss';
                this.shootInterval = 1000;
                this.setDisplaySize(80, 80);
                break;
            default:
                // 基础敌人
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 100;
                this.damage = 20;
                this.score = 10;
                this.aiBehavior = 'patrol';
        }
    }
    
    getEnemyColor() {
        const colors = {
            thug: 0x8B0000,
            soldier: 0x8B4513,
            sniper: 0x4B0082,
            machinegunner: 0x696969,
            tank: 0x2F4F4F,
            helicopter: 0x4169E1,
            boss: 0xFF1493,
            basic: 0xFF0000
        };
        return colors[this.type] || 0xFF0000;
    }
    
    setupAI() {
        // 设置AI行为
        if (AI_BEHAVIORS[this.aiBehavior]) {
            this.aiBehavior = AI_BEHAVIORS[this.aiBehavior];
        }
        
        // 设置移动方向
        this.direction = Phaser.Math.Vector2.RIGHT;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 3000;
    }
    
    update(time, delta) {
        if (this.isDead) return;
        
        // 更新逃跑计时器
        this.escapeTimer += delta;
        if (this.escapeTimer >= this.escapeTime) {
            this.escape();
            return;
        }
        
        // 执行AI行为
        this.executeAI(time, delta);
        
        // 检查射击
        this.checkShooting(time);
        
        // 更新动画
        this.updateAnimation();
    }
    
    executeAI(time, delta) {
        const player = this.scene.player;
        if (!player) return;
        
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        switch (this.aiBehavior) {
            case 'patrol':
                this.patrolBehavior(time, delta);
                break;
            case 'aggressive':
                this.aggressiveBehavior(player, distanceToPlayer);
                break;
            case 'tactical':
                this.tacticalBehavior(player, distanceToPlayer);
                break;
            case 'sniper':
                this.sniperBehavior(player, distanceToPlayer);
                break;
            case 'suppressive':
                this.suppressiveBehavior(player, distanceToPlayer);
                break;
            case 'tank':
                this.tankBehavior(player, distanceToPlayer);
                break;
            case 'aerial':
                this.aerialBehavior(player, distanceToPlayer);
                break;
            case 'boss':
                this.bossBehavior(player, distanceToPlayer, time);
                break;
            default:
                this.patrolBehavior(time, delta);
        }
    }
    
    patrolBehavior(time, delta) {
        // 简单的巡逻行为
        if (time - this.lastDirectionChange > this.directionChangeInterval) {
            this.direction = Phaser.Math.Vector2.RIGHT.rotate(Math.random() * Math.PI * 2);
            this.lastDirectionChange = time;
        }
        
        this.body.setVelocity(this.direction.x * this.speed, this.direction.y * this.speed);
    }
    
    aggressiveBehavior(player, distance) {
        // 主动追击玩家
        if (distance < 300) {
            const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
            this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
        } else {
            this.patrolBehavior(this.scene.time.now, 16);
        }
    }
    
    tacticalBehavior(player, distance) {
        // 战术行为：保持距离
        if (distance < 200) {
            // 太近了，后退
            const direction = new Phaser.Math.Vector2(this.x - player.x, this.y - player.y).normalize();
            this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
        } else if (distance > 400) {
            // 太远了，接近
            const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
            this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
        } else {
            // 保持距离，左右移动
            this.body.setVelocity(0, 0);
        }
    }
    
    sniperBehavior(player, distance) {
        // 狙击手行为：保持距离并精确射击
        if (distance < 150) {
            const direction = new Phaser.Math.Vector2(this.x - player.x, this.y - player.y).normalize();
            this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
        } else if (distance > 500) {
            const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
            this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
        } else {
            this.body.setVelocity(0, 0);
        }
    }
    
    suppressiveBehavior(player, distance) {
        // 机枪手行为：压制射击
        if (distance < 400) {
            const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
            this.body.setVelocity(direction.x * this.speed * 0.5, direction.y * this.speed * 0.5);
        } else {
            this.patrolBehavior(this.scene.time.now, 16);
        }
    }
    
    tankBehavior(player, distance) {
        // 坦克行为：缓慢但坚定地推进
        if (distance < 600) {
            const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
            this.body.setVelocity(direction.x * this.speed * 0.7, direction.y * this.speed * 0.7);
        } else {
            this.patrolBehavior(this.scene.time.now, 16);
        }
    }
    
    aerialBehavior(player, distance) {
        // 空中单位行为：快速移动和攻击
        if (distance < 500) {
            const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
            this.body.setVelocity(direction.x * this.speed * 1.2, direction.y * this.speed * 1.2);
        } else {
            this.patrolBehavior(this.scene.time.now, 16);
        }
    }
    
    bossBehavior(player, distance, time) {
        // BOSS行为：复杂的攻击模式
        const phase = Math.floor(time / 10000) % 4; // 每10秒切换一次阶段
        
        switch (phase) {
            case 0: // 追击阶段
                const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y).normalize();
                this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
                break;
            case 1: // 保持距离阶段
                if (distance < 300) {
                    const retreatDir = new Phaser.Math.Vector2(this.x - player.x, this.y - player.y).normalize();
                    this.body.setVelocity(retreatDir.x * this.speed, retreatDir.y * this.speed);
                } else {
                    this.body.setVelocity(0, 0);
                }
                break;
            case 2: // 快速移动阶段
                const randomDir = new Phaser.Math.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize();
                this.body.setVelocity(randomDir.x * this.speed * 1.5, randomDir.y * this.speed * 1.5);
                break;
            case 3: // 静止射击阶段
                this.body.setVelocity(0, 0);
                break;
        }
    }
    
    checkShooting(time) {
        if (time - this.lastShootTime > this.shootInterval) {
            this.shoot();
            this.lastShootTime = time;
        }
    }
    
    shoot() {
        const player = this.scene.player;
        if (!player) return;
        
        // 计算射击方向
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        // 创建子弹配置
        const bulletConfig = {
            damage: this.damage,
            speed: this.bulletSpeed,
            size: 8,
            color: 0xff0000,
            enemyType: this.type
        };
        
        // 创建子弹
        const bullet = this.scene.enemyBullets.get();
        if (bullet) {
            bullet.fire(this.x, this.y, angle, bulletConfig);
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
    
    takeDamage(damage) {
        this.health -= damage;
        
        // 受伤效果
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.setTint(this.getEnemyColor());
        });
        
        // 检查死亡
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // 创建死亡效果
        this.createDeathEffect();
        
        // 触发死亡事件
        this.scene.events.emit('enemyDied', {
            enemy: this,
            score: this.score,
            position: { x: this.x, y: this.y }
        });
        
        // 销毁敌人
        this.destroy();
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
            lifespan: 1000,
            quantity: 20
        });
        
        // 延迟销毁粒子
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    
    escape() {
        // 敌人逃跑
        this.scene.events.emit('enemyEscaped', {
            enemy: this,
            position: { x: this.x, y: this.y }
        });
        
        // 创建逃跑效果
        this.setTint(0x00ff00);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    // 静态方法：创建敌人
    static create(scene, x, y, type) {
        return new Enemy(scene, x, y, type);
    }
}

console.log('✅ EnemyClass.js ES6模块已加载'); 