// scenes/MainScene.js - 关卡系统集成

import { LEVELS_CONFIG } from '../levels.js';
import Enemy from './EnemyClass.js';
import EnemyBullet from './EnemyBullet.js';

// 🆕 武器系统类
class Weapon {
    constructor(name, damage, fireRate, bulletSpeed, bulletSize, bulletColor, texture, 
                burstCount = 1, burstDelay = 0, bulletCost = 0, specialEffect = null, 
                isContinuous = false, duration = 0, config = {}) {
        this.name = name;
        this.damage = damage;
        this.fireRate = fireRate; // 毫秒
        this.bulletSpeed = bulletSpeed;
        this.bulletSize = bulletSize;
        this.bulletColor = bulletColor;
        this.texture = texture;
        this.burstCount = burstCount; // 连发数量
        this.burstDelay = burstDelay; // 连发间隔
        this.bulletCost = bulletCost; // 每发子弹消耗积分
        this.specialEffect = specialEffect;
        this.isContinuous = isContinuous; // 是否持续武器
        this.duration = duration; // 持续时间
        this.bulletCount = 0; // 当前子弹数量
        this.config = config;
    }
}

// 🆕 子弹类，支持不同武器类型
class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.weaponType = null;
        this.damage = 10;
    }

    fire(x, y, weapon) {
        this.setActive(true).setVisible(true);
        this.body.reset(x, y);
        this.weaponType = weapon.name;
        this.damage = weapon.damage;

        // 计算射击角度（朝向鼠标位置）
        const angle = Phaser.Math.Angle.Between(
            x, y,
            this.scene.input.activePointer.worldX,
            this.scene.input.activePointer.worldY
        );

        // 设置速度和大小
        this.scene.physics.velocityFromRotation(
            angle,
            weapon.bulletSpeed,
            this.body.velocity
        );
      
        this.setDisplaySize(weapon.bulletSize.width, weapon.bulletSize.height);
        this.setTint(weapon.bulletColor);
        
        // 🆕 声波枪特殊旋转处理
        if (weapon.name === '声波枪') {
            this.setRotation(angle + Math.PI / 2);
        }

        // 🆕 特殊武器效果
        if (weapon.specialEffect) {
            weapon.specialEffect(this, x, y);
        }

        // 自动销毁
        this.scene.time.delayedCall(3000, () => {
            if (this.active) this.destroy();
        }, null, this);
    }

    // 销毁越界子弹
    preUpdate() {
        super.preUpdate();
        if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
            // 🆕 导弹和核弹在边界爆炸
            if (this.weaponType === '导弹' || this.weaponType === '核弹') {
                this.explodeAtBoundary();
            } else {
                this.destroy();
            }
        }
    }
    
    // 🆕 在边界爆炸
    explodeAtBoundary() {
        if (this.weaponType === '导弹') {
            this.scene.executeMissileExplosion(this, { x: this.x, y: this.y });
        } else if (this.weaponType === '核弹') {
            this.scene.executeNuclearStrike(this, { x: this.x, y: this.y });
        }
        this.destroy();
    }
}

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    init(data) {
        console.log('MainScene: 初始化，接收到的数据:', data);
        this.selectedPlayer = data.player || null;
        this.currentLevelIndex = data.level || 0; // 🆕 接收关卡索引
        console.log('MainScene: 选中的玩家:', this.selectedPlayer);
        console.log('MainScene: 当前关卡索引:', this.currentLevelIndex);
    }

    create() {
        console.log('MainScene: 创建场景开始');
      
        // 🆕 加载当前关卡配置
        this.loadLevelConfig();
      
        // 武器系统初始化
        this.initWeaponSystem();
      
        // 🆕 关卡系统初始化
        this.initLevelSystem();
      
        // 初始化血量系统
        this.initHealthSystem();
  
        // 🆕 创建关卡背景
        this.createLevelBackground();
  
        // 设置物理边界
        this.physics.world.setBounds(0, 0, 1280, 720);
  
        // 🆕 创建关卡对应的玩家
        this.createLevelPlayer();
  
        // 创建游戏对象组
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 50
        });
  
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 20
        });
      
        // 🆕 敌人子弹组
        this.enemyBullets = this.physics.add.group({
            classType: EnemyBullet,
            maxSize: 30
        });
      
        // 创建粒子效果系统
        this.createParticleSystems();
  
        // 🆕 碰撞检测（增加敌人子弹）
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHit, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.handleEnemyBulletHit, null, this);
  
        // 输入控制
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 添加WASD键支持
        this.wasdKeys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        this.input.on('pointerdown', this.shoot, this);
        this.input.keyboard.on('keydown-SPACE', this.shoot, this);
        this.input.keyboard.on('keydown-P', this.togglePause, this);
        
        // 🆕 武器切换按键
        this.input.keyboard.on('keydown-ONE', () => this.switchWeapon(0), this);
        this.input.keyboard.on('keydown-TWO', () => this.switchWeapon(1), this);
        this.input.keyboard.on('keydown-THREE', () => this.switchWeapon(2), this);
        this.input.keyboard.on('keydown-FOUR', () => this.switchWeapon(3), this);
        this.input.keyboard.on('keydown-FIVE', () => this.switchWeapon(4), this);
        this.input.keyboard.on('keydown-SIX', () => this.switchWeapon(5), this);
        
        // 全局R键监听器（用于重新开始游戏）
        this.input.keyboard.on('keydown-R', this.handleRestart, this);
        
        // 初始化音频上下文（解决AudioContext警告）
        this.input.once('pointerdown', () => {
            if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
                console.log('MainScene: 音频上下文已恢复');
            }
        });
  
        // 创建UI
        this.createHUD();
  
        // 🔧 添加敌人死亡事件监听器
        this.events.on('enemyDied', this.handleEnemyDeath, this);
        this.events.on('enemyEscaped', this.handleEnemyEscape, this);
  
        // 🆕 显示关卡开场动画（在所有元素创建完成后）
        this.showLevelIntro();
  
        // 🆕 开始关卡特定的敌人生成（在介绍结束后）
        this.time.delayedCall(3500, () => {
            this.startLevelEnemySpawner();
        });

        // 显示版本信息
        this.add.text(1200, 700, 'v4.0-LevelSystem', { 
            font: '14px Arial', 
            fill: '#666666' 
        }).setOrigin(1);
    
        console.log('MainScene: 场景创建完成');

        // 设置初始积分为5000
        this.score = 5000;
    }

    // 🆕 初始化武器系统
    initWeaponSystem() {
        // 射击冷却时间初始化
        this.lastShootTime = 0;
        
        // 定义6种武器及其特性
        this.weapons = [
            // AK47 - 射速快，一次连续三发 (免费无限子弹)
            new Weapon('AK47', 15, 200, 600, {width: 10, height: 5}, 0xffff00, 'ak47', 
                3, 50, 0), // 3发连射，50ms间隔，免费
            
            // 沙漠之鹰 - 射速快，伤害高，一发 (免费无限子弹)
            new Weapon('沙漠之鹰', 60, 300, 800, {width: 12, height: 8}, 0xff6600, 'pistol', 
                1, 0, 0), // 单发，免费
            
            // 加特林 - 射速极快，一次20发，每次5秒冷却 (每次射击20积分)
            new Weapon('加特林', 12, 100, 700, {width: 8, height: 4}, 0xff0000, 'gatling', 
                20, 30, 20), // 20发连射，30ms间隔，每次射击20积分
            
            // 声波枪 - 射速快，伤害高，声波持续2秒 (每发10积分)
            new Weapon('声波枪', 40, 150, 900, {width: 150, height: 4}, 0x00ffff, 'tesla', 
                1, 0, 10, 
                (bullet, x, y) => {
                    bullet.scene.tweens.add({
                        targets: bullet,
                        alpha: 0.7,
                        duration: 200,
                        yoyo: true,
                        repeat: -1
                    });
                }, true, 2000),
            
            // 导弹 - 射速慢，爆炸范围大 (每发20积分)
            new Weapon('导弹', 300, 1000, 400, {width: 15, height: 10}, 0x00ff00, 'missile', 
                1, 0, 20, 
                (bullet, x, y) => {
                    bullet.scene.tweens.add({
                        targets: bullet,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 100,
                        yoyo: true,
                        repeat: -1
                    });
                }, false, 0, { damageRadius: 200 }),
            
            // 核弹 - 追踪型全屏武器 (每发50积分)
            new Weapon('核弹', 999, 1000, 300, {width: 20, height: 15}, 0xff00ff, 'nuke', 
                1, 0, 50,
                (bullet, x, y) => {
                    bullet.scene.tweens.add({
                        targets: bullet,
                        alpha: 0.5,
                        duration: 200,
                        yoyo: true,
                        repeat: -1
                    });
                }, false, 0, { 
                    damageRadius: 400,  // 核弹爆炸半径
                    isHoming: true      // 追踪功能
                })
        ];
        
        // 🆕 武器冷却时间
        this.weaponCooldowns = [0, 0, 0, 0, 0, 0]; // 每种武器的冷却时间
        
        // 当前武器索引
        this.currentWeaponIndex = 0;
        this.currentWeapon = this.weapons[0];
        
        console.log('MainScene: 武器系统初始化完成，当前武器:', this.currentWeapon.name);
    }
    
    // 🆕 切换武器
    switchWeapon(index) {
        if (this.isGameOver) return;
        
        if (index >= 0 && index < this.weapons.length) {
            const targetWeapon = this.weapons[index];
            
            // 🆕 检查是否需要购买子弹
            if (targetWeapon.bulletCost > 0 && targetWeapon.bulletCount <= 0) {
                const costFor5Bullets = targetWeapon.bulletCost * 5;
                
                // 检查积分是否足够购买5发子弹
                if (this.score >= costFor5Bullets) {
                    // 自动购买5发子弹
                    this.score -= costFor5Bullets;
                    targetWeapon.bulletCount = 5;
                    console.log(`MainScene: 自动购买${targetWeapon.name}子弹5发，消耗${costFor5Bullets}积分`);
                    this.showBulletPurchaseMessage(targetWeapon.name, 5, costFor5Bullets);
                } else {
                    // 积分不足，切换失败
                    this.showInsufficientScoreForBulletsMessage(targetWeapon.name, costFor5Bullets);
                    return;
                }
            }
            
            this.currentWeaponIndex = index;
            this.currentWeapon = targetWeapon;
            console.log(`MainScene: 切换到武器: ${this.currentWeapon.name}，剩余子弹: ${this.currentWeapon.bulletCount}`);
            
            // 显示武器切换提示
            this.showWeaponSwitchMessage();
        }
    }
    
    // 🆕 显示子弹购买提示
    showBulletPurchaseMessage(weaponName, bulletCount, cost) {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `自动购买${weaponName}子弹${bulletCount}发，消耗${cost}积分`, {
            font: '24px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }
    
    // 🆕 显示积分不足购买子弹提示
    showInsufficientScoreForBulletsMessage(weaponName, requiredScore) {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `积分不足购买${weaponName}子弹！需要${requiredScore}积分`, {
            font: '24px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }
    

    
    // 🆕 显示武器切换提示
    showWeaponSwitchMessage() {
        // 移除之前的提示
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `武器: ${this.currentWeapon.name}`, {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // 2秒后自动消失
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }

    // 🆕 初始化血量系统
    initHealthSystem() {
        // 设置最大血量和当前血量
        this.maxHealth = this.selectedPlayer ? this.selectedPlayer.health : 100;
        this.currentHealth = this.maxHealth;
      
        // 每个敌人到达左边界扣除的血量
        this.damagePerEnemyEscape = 10;
        this.collisionDamage = 20;
        this.invincibilityTime = 500;
      
        console.log(`MainScene: 血量系统初始化 - 最大血量: ${this.maxHealth}, 当前血量: ${this.currentHealth}`);
    }

    createBackground() {
        if (this.textures.exists('background')) {
            console.log('MainScene: 使用background纹理创建背景');
            // 创建平铺背景
            for (let x = 0; x < 1280; x += 64) {
                for (let y = 0; y < 720; y += 64) {
                    this.add.image(x, y, 'background').setOrigin(0, 0);
                }
            }
        } else {
            console.log('MainScene: background纹理不存在，使用纯色背景');
            this.add.rectangle(640, 360, 1280, 720, 0x001122);
        }
    }

    createPlayer() {
        // 确定使用哪个纹理
        let playerTexture = 'player'; // 默认
      
        // 预设玩家属性
        this.playerSpeed = 400;
        this.playerSize = 40;
      
        if (this.selectedPlayer && this.textures.exists(this.selectedPlayer.key)) {
            playerTexture = this.selectedPlayer.key;
            this.playerSpeed = this.selectedPlayer.speed || 400;
            console.log('MainScene: 使用角色纹理:', playerTexture, '速度:', this.playerSpeed);
        } else {
            console.log('MainScene: 使用默认玩家纹理:', playerTexture);
        }
          
        this.player = this.physics.add.sprite(100, 360, playerTexture)
            .setCollideWorldBounds(true)
            .setDisplaySize(this.playerSize, this.playerSize);
    
        // 设置玩家属性到 sprite
        this.player.playerSpeed = this.playerSpeed;
        this.player.isInvincible = false;
    
        console.log('MainScene: 玩家创建完成，速度:', this.playerSpeed);
    }

    createHUD() {
        console.log('MainScene: 创建游戏HUD');
      
        // 游戏状态初始化
        this.score = (this.selectedPlayer && this.selectedPlayer.initPoints) ? this.selectedPlayer.initPoints : 0;
        this.level = 1;
      
        // 🆕 统一的HUD文本样式（与右上角保持一致）
        const hudStyle = {
            font: '18px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        };
      
        // 分数显示
        this.scoreText = this.add.text(20, 20, '分数: 0', hudStyle);
      
        // 🆕 血量显示（替换生命值显示）
        this.healthText = this.add.text(20, 50, `血量: ${this.currentHealth}/${this.maxHealth}`, hudStyle);
      
        // 🆕 血量条
        this.createHealthBar();
      
        // 🆕 关卡信息显示
        this.levelInfoText = this.add.text(640, 20, 
            `${this.currentLevel.name} (${this.currentLevelIndex + 1}/${LEVELS_CONFIG.length})`, 
            {
                font: '18px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(0.5, 0);
        
        // 🆕 当前武器显示
        this.weaponText = this.add.text(20, 140, '武器: AK47', hudStyle);
        
        // 🆕 子弹数量显示
        this.bulletCountText = this.add.text(20, 170, '子弹: 无限', {
            font: '14px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 6, y: 2 }
        });
        
        // 🆕 右上角显示时间和击杀数
        const rightHudStyle = {
            font: '18px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        };
        
        // 时间显示（右上角）
        this.timeText = this.add.text(1280 - 20, 20, '时间: 00:00', rightHudStyle).setOrigin(1, 0);
        
        // 击杀数显示（右上角）
        this.killText = this.add.text(1280 - 20, 50, '击杀: 0/30', rightHudStyle).setOrigin(1, 0);
      
        // 控制说明
        const controlStyle = {
            font: '14px Arial',
            fill: '#cccccc',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        };
      

        

      
        console.log('MainScene: HUD创建完成');
    }

    // 🆕 创建粒子效果系统
    createParticleSystems() {
        // 射击粒子效果
        this.shootEmitter = this.add.particles(0, 0, 'shoot', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            frequency: 50,
            blendMode: 'ADD'
        });
        
        // 爆炸粒子效果
        this.explosionEmitter = this.add.particles(0, 0, 'explosion', {
            speed: { min: 100, max: 300 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            frequency: 20,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 }
        });
        
        // 受伤粒子效果
        this.damageEmitter = this.add.particles(0, 0, 'damage', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            frequency: 30,
            blendMode: 'ADD',
            angle: { min: -30, max: 30 }
        });
        
        // 敌人死亡粒子效果
        this.deathEmitter = this.add.particles(0, 0, 'death', {
            speed: { min: 80, max: 200 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            frequency: 25,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 }
        });
        
        console.log('MainScene: 粒子效果系统创建完成');
    }

    // 🆕 创建血量条
    createHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 85;
      
        // 血量条背景
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x333333);
        this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);
        this.healthBarBg.lineStyle(2, 0xffffff);
        this.healthBarBg.strokeRect(barX, barY, barWidth, barHeight);
      
        // 血量条前景
        this.healthBar = this.add.graphics();
        this.updateHealthBar();
    }

    // 🆕 更新血量条
    updateHealthBar() {
        if (!this.healthBar) return;
      
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 85;
      
        this.healthBar.clear();
      
        // 计算血量百分比
        const healthPercent = this.currentHealth / this.maxHealth;
        const currentBarWidth = barWidth * healthPercent;
      
        // 根据血量百分比选择颜色
        let barColor;
        if (healthPercent > 0.6) {
            barColor = 0x00ff00; // 绿色
        } else if (healthPercent > 0.3) {
            barColor = 0xffff00; // 黄色
        } else {
            barColor = 0xff0000; // 红色
        }
      
        this.healthBar.fillStyle(barColor);
        this.healthBar.fillRect(barX, barY, currentBarWidth, barHeight);
    }

    // 修改敌人生成方法
    spawnEnemy() {
        if (this.isGameOver) return; // 游戏结束时停止生成敌人
        
        console.log('MainScene: 开始生成敌人');
        
        // 检查敌人纹理是否存在
        if (!this.textures.exists('enemy')) {
            console.error('MainScene: 敌人纹理不存在！');
            return;
        }
        
        const y = Phaser.Math.Between(50, 670);
        // 直接在组中创建敌人，避免重复添加
        const enemy = this.enemies.create(1280, y, 'enemy');
        
        if (enemy) {
            enemy.setDisplaySize(32, 32);
            enemy.setVelocityX(-100);
            
            // 确保物理体被启用
            if (enemy.body) {
                enemy.body.enable = true;
            }
            
            // 🆕 自定义边界检测 - 不使用世界边界事件
            enemy.checkBounds = true;
            
            console.log('MainScene: 生成新敌人，位置:', enemy.x, enemy.y, '速度:', enemy.body.velocity.x, '当前敌人数量:', this.enemies.children.size);
        } else {
            console.error('MainScene: 无法创建敌人对象');
        }
    }

    // 🆕 检查敌人是否逃脱
    checkEnemyEscape() {
        if (this.isGameOver) return; // 游戏结束时停止检查
        
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.x < -50) { // 敌人完全离开屏幕左边
                console.log('MainScene: 敌人逃脱！扣除血量');
                this.handleEnemyEscape(enemy);
            }
        });
    }

    // 🆕 处理敌人逃脱
    handleEnemyEscape(enemy) {
        // 扣除血量
        this.currentHealth -= this.damagePerEnemyEscape;
      
        // 确保血量不低于0
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
      
        console.log(`MainScene: 敌人逃脱扣血 ${this.damagePerEnemyEscape}，当前血量: ${this.currentHealth}/${this.maxHealth}`);
      
        // 销毁敌人
        enemy.destroy();
      
        // 🆕 视觉反馈效果
        this.showDamageEffect(this.damagePerEnemyEscape, 'escape');
      
        // 更新HUD
        this.updateHUD();
      
        // 检查游戏是否结束
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }

    // 🆕 显示受伤效果
    showDamageEffect(damageAmount, damageType = 'escape') {
        // 🆕 受伤粒子效果
        this.damageEmitter.setPosition(this.player.x, this.player.y);
        this.damageEmitter.start();
        this.time.delayedCall(150, () => {
            this.damageEmitter.stop();
        });
        
        // 屏幕红色闪烁效果
        const damageOverlay = this.add.rectangle(640, 360, 1280, 720, 0xff0000, 0.3);
      
        // 闪烁动画
        this.tweens.add({
            targets: damageOverlay,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                damageOverlay.destroy();
            }
        });
      
        // 摄像机震动效果
        this.cameras.main.shake(100, 0.02);
      
        // 根据伤害类型显示不同文字和颜色
        let damageText, textColor;
        if (damageType === 'escape') {
            damageText = `-${damageAmount} HP (敌人逃脱)`;
            textColor = '#ff6600';
        } else {
            damageText = `-${damageAmount} HP (直接撞击)`;
            textColor = '#ff0000';
        }
      
        const damage = this.add.text(640, 300, damageText, {
            font: '24px Arial',
            fill: textColor,
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
      
        // 伤害文字动画
        this.tweens.add({
            targets: damage,
            y: damage.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damage.destroy();
            }
        });
    }

    // 更新HUD显示
    updateHUD() {
        if (this.scoreText) {
            this.scoreText.setText(`分数: ${this.score}`);
        }
        if (this.healthText) {
            this.healthText.setText(`血量: ${this.currentHealth}/${this.maxHealth}`);
        }
        if (this.levelText) {
            this.levelText.setText(`关卡: ${this.level}`);
        }
        if (this.weaponText) {
            this.weaponText.setText(`武器: ${this.currentWeapon.name}`);
        }
        if (this.bulletCountText) {
            // 🆕 更新子弹数量显示
            let bulletText;
            if (this.currentWeapon.bulletCost === 0) {
                bulletText = '子弹: 无限';
                this.bulletCountText.setFill('#00ff00');
            } else {
                bulletText = `子弹: ${this.currentWeapon.bulletCount}发`;
                // 🆕 根据子弹数量改变颜色
                if (this.currentWeapon.bulletCount <= 0) {
                    this.bulletCountText.setFill('#ff0000'); // 红色表示无子弹
                } else if (this.currentWeapon.bulletCount <= 2) {
                    this.bulletCountText.setFill('#ffff00'); // 黄色表示子弹少
                } else {
                    this.bulletCountText.setFill('#00ff00'); // 绿色表示子弹充足
                }
            }
            this.bulletCountText.setText(bulletText);
        }
        if (this.killText) {
            this.killText.setText(`击杀: ${this.killCount}/${this.levelCompleteKills}`);
        }
        
        // 🆕 更新时间显示
        if (this.timeText) {
            // 关卡结束后停止计时
            const elapsedTime = this.isGameOver || this.levelComplete ? 
                Math.floor((this.levelEndTime - this.gameStartTime) / 1000) : 
                Math.floor((this.time.now - this.gameStartTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            const timeString = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.timeText.setText(timeString);
        }
      
        // 更新血量条
        this.updateHealthBar();
    }

    // 修改 update 方法
    update() {
        if (!this.player || !this.player.active) return;
        if (this.scene.isPaused()) return; // 暂停时不更新
        
        // 🆕 游戏结束后只更新HUD，不执行其他游戏逻辑
        if (this.isGameOver) {
            this.updateHUD();
            return;
        }
      
        // 🆕 更新所有敌人AI
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.update) {
                enemy.update();
            }
        });
      
        // 🆕 检查关卡完成条件
        this.checkLevelComplete();
      
        // 🆕 检查敌人逃脱
        this.checkEnemyEscape();
        
        // 🆕 更新HUD（包括时间显示）
        this.updateHUD();
      
        // 玩家移动
        this.player.setVelocity(0);
      
        // 水平移动 (左右方向键 或 A/D键)
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        }
      
        // 垂直移动 (上下方向键 或 W/S键)
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            this.player.setVelocityY(-this.playerSpeed);
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            this.player.setVelocityY(this.playerSpeed);
        }
    }

    // 🆕 修改玩家受伤逻辑
    handlePlayerHit(player, enemy) {
        if (player.isInvincible) return; // 防止无敌时间内重复受伤
      
        enemy.destroy();
      
        // 直接碰撞造成更大伤害
        const collisionDamage = this.collisionDamage;
        this.currentHealth -= collisionDamage;
      
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
      
        console.log(`MainScene: 玩家被撞击扣血 ${collisionDamage}，当前血量: ${this.currentHealth}/${this.maxHealth}`);
      
        // 显示受伤效果
        this.showDamageEffect(this.collisionDamage, 'collision');
        this.updateHUD();
      
        // 设置无敌状态
        player.isInvincible = true;
        player.setTint(0xff0000);
        this.time.delayedCall(this.invincibilityTime, () => {
            if (player && player.active) {
                player.isInvincible = false;
                player.clearTint();
            }
        });
      
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }

    handleBulletHit(bullet, enemy) {
        if (!enemy.active) return;
        if (bullet.weaponType === '导弹') {
            this.executeMissileExplosion(bullet, enemy);
        } else if (bullet.weaponType === '核弹') {
            this.executeNuclearStrike(bullet, enemy);
        } else {
            enemy.destroy();
            if (this.deathEmitter) {
                this.deathEmitter.setPosition(enemy.x, enemy.y);
                this.deathEmitter.start();
                this.time.delayedCall(100, () => { if (this.deathEmitter) this.deathEmitter.stop(); });
            }
        }
        if (bullet.weaponType !== '导弹' && bullet.weaponType !== '核弹') {
            bullet.destroy();
        }
        // 🆕 根据武器伤害计算分数（增加击杀奖励）
        let baseScore = bullet.damage;
        // 🆕 骑士伤害加成
        if (this.selectedPlayer && this.selectedPlayer.damageMultiplier && bullet.weaponType !== '导弹' && bullet.weaponType !== '核弹') {
            baseScore = Math.round(baseScore * this.selectedPlayer.damageMultiplier);
        }
        const killBonus = 20; // 击杀奖励
        const scoreGain = baseScore + killBonus;
        this.score += scoreGain;
        this.killCount++;
        
        this.updateHUD();
      
        console.log(`MainScene: 使用${bullet.weaponType}击毁敌人，伤害: ${bullet.damage}，得分 +${scoreGain}，击杀数: ${this.killCount}/${this.levelCompleteKills}，当前分数: ${this.score}`);
        
        // 🆕 检查是否达到击杀目标
        this.checkLevelComplete();
    }

    gameOver() {
        if (this.isGameOver) return; // 防止重复调用
      
        console.log('MainScene: 游戏结束 - 血量耗尽');
        this.isGameOver = true;
        
        // 🆕 记录游戏结束时间
        this.levelEndTime = this.time.now;
      
        // 停止敌人生成
        if (this.enemySpawner) {
            this.enemySpawner.remove();
            this.enemySpawner = null;
        }
      
        // 清除所有敌人
        this.enemies.clear(true, true);
      
        // 清除所有子弹
        this.bullets.clear(true, true);
      
        // 显示游戏结束界面
        const gameOverBg = this.add.rectangle(640, 360, 400, 200, 0x000000, 0.8);
      
        this.add.text(640, 320, 'GAME OVER', {
            font: '48px Arial',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
      
        this.add.text(640, 380, `最终分数: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
      
        this.add.text(640, 410, '按 R 重新开始', {
            font: '16px Arial',
            fill: '#cccccc'
        }).setOrigin(0.5);
      
        // 🆕 不暂停场景，保持输入监听器活跃
        // this.scene.pause(); // 移除这行，避免输入监听器失效
    }

    startEnemySpawner() {
        console.log('MainScene: 启动敌人生成器');
        // 定期生成敌人
        this.enemySpawner = this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        console.log('MainScene: 敌人生成器已创建');
    }

    shoot() {
        if (this.isGameOver || this.scene.isPaused()) return; // 游戏状态检查
        const currentTime = this.time.now;
        // 🆕 检查子弹是否足够
        if (this.currentWeapon.bulletCost > 0 && this.currentWeapon.bulletCount <= 0) {
            this.showNoBulletsMessage();
            return;
        }
        // 🆕 检查普通射击冷却
        if (currentTime - this.lastShootTime < this.currentWeapon.fireRate) {
            console.log('MainScene: 射击冷却中');
            return; // 冷却时间未到
        }
        if (!this.player || !this.player.active) {
            console.log('MainScene: 玩家不存在或未激活');
            return;
        }
        // 🆕 消耗子弹
        if (this.currentWeapon.bulletCost > 0) {
            this.currentWeapon.bulletCount--;
            console.log(`MainScene: 消耗1发${this.currentWeapon.name}子弹，剩余${this.currentWeapon.bulletCount}发`);
        }
        this.lastShootTime = currentTime;
        // 🆕 执行连发射击
        this.executeBurstFire();
    }
    
    // 🆕 执行连发射击
    executeBurstFire() {
        const weapon = this.currentWeapon;
        const offsetX = this.playerSize / 2;
        const startX = this.player.x + offsetX;
        const startY = this.player.y;
        
        // 计算射击角度
        const angle = Phaser.Math.Angle.Between(
            startX, startY,
            this.input.activePointer.worldX,
            this.input.activePointer.worldY
        );
        
        // 🆕 加特林扇形散弹
        if (weapon.name === '加特林') {
            const spreadAngle = Math.PI / 3; // 60度扇形（加大）
            const bulletCount = weapon.burstCount;
            const angleStep = spreadAngle / (bulletCount - 1);
            const startAngle = angle - spreadAngle / 2;
            
            // 发射扇形散弹
            for (let i = 0; i < bulletCount; i++) {
                const bulletAngle = startAngle + angleStep * i;
                this.time.delayedCall(weapon.burstDelay * i, () => {
                    if (!this.isGameOver && this.player && this.player.active) {
                        this.fireSingleBullet(startX, startY, bulletAngle, weapon);
                    }
                }, null, this);
            }
            
            console.log(`MainScene: 发射${weapon.name}，扇形散弹${bulletCount}发，角度范围${spreadAngle * 180 / Math.PI}度`);
        } else {
            // 其他武器的普通连发
            // 发射第一发
            this.fireSingleBullet(startX, startY, angle, weapon);
            
            // 如果有连发，继续发射
            if (weapon.burstCount > 1) {
                for (let i = 1; i < weapon.burstCount; i++) {
                    this.time.delayedCall(weapon.burstDelay * i, () => {
                        if (!this.isGameOver && this.player && this.player.active) {
                            this.fireSingleBullet(startX, startY, angle, weapon);
                        }
                    }, null, this);
                }
            }
            
            console.log(`MainScene: 发射${weapon.name}，连发${weapon.burstCount}发`);
        }
    }
    
    // 🆕 发射单发子弹
    fireSingleBullet(x, y, angle, weapon) {
        const bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(x, y, weapon);
            
            // 🆕 射击粒子效果
            this.shootEmitter.setPosition(x, y);
            this.shootEmitter.start();
            this.time.delayedCall(100, () => {
                this.shootEmitter.stop();
            });
            
            // 🆕 特殊武器效果
            if (weapon.name === '声波枪' && weapon.isContinuous) {
                this.executeTeslaBeam(bullet);
            }
            
            // 🆕 核弹追踪功能
            if (weapon.name === '核弹' && weapon.config && weapon.config.isHoming) {
                this.setupNuclearHoming(bullet);
            }
        }
    }
    
        // 🆕 核弹追踪功能
    setupNuclearHoming(bullet) {
        console.log('设置核弹追踪功能');
        
        // 设置核弹追踪最近的敌人
        bullet.update = () => {
            if (!bullet.active) return;
            
            // 寻找最近的敌人
            const enemies = this.enemies.getChildren();
            let nearestEnemy = null;
            let nearestDistance = Infinity;
            
            for (let enemy of enemies) {
                if (enemy.active) {
                    const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestEnemy = enemy;
                    }
                }
            }
            
            // 如果找到敌人，调整核弹方向
            if (nearestEnemy) {
                const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, nearestEnemy.x, nearestEnemy.y);
                const speed = bullet.body.velocity.length();
                
                // 平滑追踪：逐渐调整方向而不是瞬间改变
                const currentAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
                const angleDiff = Phaser.Math.Angle.Wrap(angle - currentAngle);
                const maxTurnRate = 0.15; // 增加转向速率
                const turnRate = Phaser.Math.Clamp(angleDiff, -maxTurnRate, maxTurnRate);
                const newAngle = currentAngle + turnRate;
                
                this.physics.velocityFromRotation(newAngle, speed, bullet.body.velocity);
                
                // 添加追踪视觉效果
                bullet.setRotation(newAngle);
                
                // 添加追踪轨迹效果
                if (Math.random() < 0.5) { // 增加轨迹概率
                    this.add.particles('nuke').createEmitter({
                        x: bullet.x,
                        y: bullet.y,
                        speed: { min: 10, max: 30 },
                        scale: { start: 0.3, end: 0 },
                        alpha: { start: 0.5, end: 0 },
                        lifespan: 300,
                        quantity: 1
                    });
                }
            }
        };
    }
    
    // 🆕 核弹爆炸效果（改进版）
    executeNuclearStrike(bullet, hitEnemy) {
        const weapon = this.weapons.find(w => w.name === '核弹');
        const explosionCenter = hitEnemy || { x: bullet.x, y: bullet.y };
        const explosionRadius = (weapon && weapon.config && weapon.config.damageRadius) ? weapon.config.damageRadius : 400;
        
        console.log(`核弹爆炸：中心(${explosionCenter.x}, ${explosionCenter.y})，半径${explosionRadius}`);
        
        let killedEnemies = 0;
        const enemies = this.enemies.getChildren();
        const totalEnemies = enemies.filter(e => e.active).length;
        
        console.log(`核弹爆炸前总敌人数量：${totalEnemies}`);
        
        for (let enemy of enemies) {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(explosionCenter.x, explosionCenter.y, enemy.x, enemy.y);
                const enemyName = enemy.enemyData ? enemy.enemyData.name : 'Unknown';
                console.log(`敌人${enemyName}位置(${enemy.x}, ${enemy.y})，距离爆炸中心：${distance.toFixed(2)}`);
                
                if (distance <= explosionRadius) {
                    killedEnemies++;
                    this.killCount++;
                    const baseScore = 100;
                    const distanceFactor = Math.max(0.5, 1 - distance / explosionRadius);
                    const scoreGain = Math.floor(baseScore * distanceFactor);
                    this.score += scoreGain;
                    
                    console.log(`✅ 核弹击杀：${enemyName}，距离${distance.toFixed(2)}，得分${scoreGain}`);
                    
                    if (this.deathEmitter) {
                        this.deathEmitter.setPosition(enemy.x, enemy.y);
                        this.deathEmitter.start();
                        this.time.delayedCall(100, () => { if (this.deathEmitter) this.deathEmitter.stop(); });
                    }
                    enemy.destroy();
                } else {
                    console.log(`❌ 敌人${enemyName}在爆炸范围外，距离${distance.toFixed(2)} > ${explosionRadius}`);
                }
            }
        }
        
        const remainingEnemies = this.enemies.getChildren().filter(e => e.active).length;
        console.log(`核弹爆炸完成：击杀${killedEnemies}/${totalEnemies}个敌人，剩余${remainingEnemies}个敌人`);
        
        if (this.explosionEmitter) {
            this.explosionEmitter.setPosition(explosionCenter.x, explosionCenter.y);
            this.explosionEmitter.start();
            this.time.delayedCall(200, () => { if (this.explosionEmitter) this.explosionEmitter.stop(); });
        }
        
        this.updateHUD();
    }
    
    // 🆕 导弹爆炸效果
    executeMissileExplosion(bullet, hitEnemy) {
        const weapon = this.weapons.find(w => w.name === '导弹');
        const explosionCenter = hitEnemy || { x: bullet.x, y: bullet.y };
        const explosionRadius = (weapon && weapon.config && weapon.config.damageRadius) ? weapon.config.damageRadius : 200;
        
        console.log(`导弹爆炸：中心(${explosionCenter.x}, ${explosionCenter.y})，半径${explosionRadius}`);
        
        let killedEnemies = 0;
        const enemies = this.enemies.getChildren();
        
        for (let enemy of enemies) {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(explosionCenter.x, explosionCenter.y, enemy.x, enemy.y);
                if (distance <= explosionRadius) {
                    killedEnemies++;
                    this.killCount++;
                    const baseScore = weapon ? weapon.damage : 60;
                    const distanceFactor = Math.max(0.5, 1 - distance / explosionRadius);
                    const scoreGain = Math.floor(baseScore * distanceFactor);
                    this.score += scoreGain;
                    if (this.deathEmitter) {
                        this.deathEmitter.setPosition(enemy.x, enemy.y);
                        this.deathEmitter.start();
                        this.time.delayedCall(100, () => { if (this.deathEmitter) this.deathEmitter.stop(); });
                    }
                    enemy.destroy();
                }
            }
        }
        if (this.explosionEmitter) {
            this.explosionEmitter.setPosition(explosionCenter.x, explosionCenter.y);
            this.explosionEmitter.start();
            this.time.delayedCall(200, () => { if (this.explosionEmitter) this.explosionEmitter.stop(); });
        }
        this.updateHUD();
    }
    
    // 🆕 声波持续效果
    executeTeslaBeam(bullet) {
        // 声波持续2秒
        this.time.delayedCall(this.currentWeapon.duration, () => {
            if (bullet && bullet.active) {
                bullet.destroy();
            }
        }, null, this);
    }
    
    // 🆕 显示子弹不足提示
    showNoBulletsMessage() {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `${this.currentWeapon.name}子弹不足！按${this.currentWeaponIndex + 1}键购买子弹`, {
            font: '24px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }
    
    // 🆕 显示武器冷却提示
    showWeaponCooldownMessage(remainingTime, state = '冷却') {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `加特林${state}中！剩余${remainingTime}秒`, {
            font: '24px Arial',
            fill: '#ff6600',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }

    togglePause() {
        if (this.scene.isPaused()) {
            this.scene.resume();
        } else {
            this.scene.pause();
        }
    }
    
    // 处理重新开始游戏
    handleRestart() {
        if (this.isGameOver || this.isLevelCompleted) {
            console.log('MainScene: 检测到R键，重新开始游戏');
            // 清理所有事件监听器
            this.input.keyboard.off('keydown-R', this.handleRestart, this);
            this.input.keyboard.off('keydown-N', this.nextLevel, this);
            
            // 重新开始场景，保持当前关卡
            this.scene.restart({ 
                player: this.selectedPlayer, 
                level: this.currentLevelIndex 
            });
        }
    }
    
    // 🆕 检查关卡完成条件
    checkLevelComplete() {
        if (this.isGameOver || this.isLevelCompleted) return;
      
        const currentTime = this.time.now;
        const survivalTime = currentTime - this.gameStartTime;
      
        // 检查生存时间条件
        if (survivalTime >= this.levelCompleteTime) {
            this.completeLevel(`生存时间达到${this.levelCompleteTime/1000}秒`);
            return;
        }
      
        // 检查击杀数条件
        if (this.killCount >= this.levelCompleteKills) {
            this.completeLevel(`击杀${this.levelCompleteKills}个敌人`);
            return;
        }
    }
    
    // 🆕 完成关卡
    completeLevel(reason) {
        if (this.isLevelCompleted) return;
      
        this.isLevelCompleted = true;
        console.log(`MainScene: 关卡 ${this.currentLevel.name} 完成！原因: ${reason}`);
      
        this.levelEndTime = this.time.now;
        this.levelComplete = true;
      
        // 停止敌人生成
        if (this.enemySpawner) {
            this.enemySpawner.remove();
            this.enemySpawner = null;
        }
      
        // 清除所有敌人和子弹
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
      
        // 显示关卡完成界面
        this.showLevelCompleteScreen(reason);
    }
    
    // 🆕 下一关
    nextLevel() {
        console.log('MainScene: 进入下一关');
        
        const nextLevelIndex = this.currentLevelIndex + 1;
        if (nextLevelIndex < LEVELS_CONFIG.length) {
            // 清理事件监听器
            this.input.keyboard.off('keydown-N', this.nextLevel, this);
          
            // 启动下一关
            this.scene.restart({ 
                player: this.selectedPlayer, 
                level: nextLevelIndex 
            });
        } else {
            console.log('MainScene: 已完成所有关卡！');
        }
    }

    // 🆕 加载关卡配置
    loadLevelConfig() {
        this.currentLevel = LEVELS_CONFIG[this.currentLevelIndex] || LEVELS_CONFIG[0];
        console.log('MainScene: 加载关卡配置:', this.currentLevel.name);
        console.log('MainScene: 关卡详情:', {
            name: this.currentLevel.name,
            description: this.currentLevel.description,
            duration: this.currentLevel.levelDuration,
            targetKills: this.currentLevel.targetKills
        });
    }

    // 🆕 显示关卡开场动画
    showLevelIntro() {
        console.log('MainScene: 显示关卡介绍:', this.currentLevel.name);
        
        // 创建关卡介绍背景（确保在最顶层）
        const introBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9)
            .setDepth(1000); // 设置最高深度
      
        // 关卡名称
        const levelTitle = this.add.text(640, 280, this.currentLevel.name, {
            font: '72px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(1001);
      
        // 关卡描述
        const levelDesc = this.add.text(640, 360, this.currentLevel.description, {
            font: '24px Arial',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0).setDepth(1001);
      
        // 关卡目标
        const targetText = `目标: 生存${this.currentLevel.levelDuration/1000}秒 或 击杀${this.currentLevel.targetKills}个敌人`;
        const levelTarget = this.add.text(640, 420, targetText, {
            font: '18px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setAlpha(0).setDepth(1001);
      
        // 开始提示
        const startHint = this.add.text(640, 480, '3秒后开始...', {
            font: '20px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0).setDepth(1001);
      
        // 倒计时显示
        let countdown = 3;
        const countdownText = this.add.text(640, 520, `${countdown}`, {
            font: '36px Arial',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0).setDepth(1001);
      
        // 动画序列
        this.tweens.add({
            targets: levelTitle,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                this.tweens.add({
                    targets: levelDesc,
                    alpha: 1,
                    duration: 500,
                    onComplete: () => {
                        this.tweens.add({
                            targets: levelTarget,
                            alpha: 1,
                            duration: 500,
                            onComplete: () => {
                                this.tweens.add({
                                    targets: [startHint, countdownText],
                                    alpha: 1,
                                    duration: 500
                                });
                            }
                        });
                    }
                });
            }
        });
      
        // 倒计时更新
        const countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--;
                if (countdown > 0) {
                    countdownText.setText(`${countdown}`);
                    // 倒计时闪烁效果
                    this.tweens.add({
                        targets: countdownText,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 200,
                        yoyo: true
                    });
                }
            },
            loop: true
        });
      
        // 3秒后隐藏介绍
        this.time.delayedCall(3000, () => {
            countdownTimer.remove(); // 停止倒计时
            this.tweens.add({
                targets: [introBg, levelTitle, levelDesc, levelTarget, startHint, countdownText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    introBg.destroy();
                    levelTitle.destroy();
                    levelDesc.destroy();
                    levelTarget.destroy();
                    startHint.destroy();
                    countdownText.destroy();
                    console.log('MainScene: 关卡介绍结束，游戏开始');
                }
            });
        });
    }

    // 🆕 初始化关卡系统
    initLevelSystem() {
        this.gameStartTime = this.time.now;
        this.killCount = 0;
        this.levelCompleteTime = this.currentLevel.levelDuration;
        this.levelCompleteKills = this.currentLevel.targetKills;
        this.levelEndTime = null;
        this.levelComplete = false;
        this.isLevelCompleted = false;
      
        // 敌人生成控制
        this.enemySpawnRate = this.currentLevel.spawnRate;
        this.maxEnemies = this.currentLevel.maxEnemies;
        this.currentEnemyCount = 0;
      
        console.log(`MainScene: 关卡系统初始化完成 - ${this.currentLevel.name}`);
    }

    // 🆕 创建关卡背景
    createLevelBackground() {
        // 设置背景颜色
        this.cameras.main.setBackgroundColor(this.currentLevel.bgColor);
      
        // 如果有背景纹理则使用，否则使用纯色
        if (this.textures.exists(this.currentLevel.background)) {
            console.log('MainScene: 使用关卡背景纹理:', this.currentLevel.background);
            for (let x = 0; x < 1280; x += 64) {
                for (let y = 0; y < 720; y += 64) {
                    this.add.image(x, y, this.currentLevel.background).setOrigin(0, 0);
                }
            }
        } else {
            console.log('MainScene: 使用关卡背景颜色:', this.currentLevel.bgColor);
        }
      
        // 🆕 添加环境效果
        this.addEnvironmentEffects();
    }

    // 🆕 添加环境效果
    addEnvironmentEffects() {
        this.currentLevel.environmentEffects.forEach(effect => {
            switch (effect) {
                case 'sandstorm':
                    this.createSandstormEffect();
                    break;
                case 'fog':
                    this.createFogEffect();
                    break;
                case 'bubbles':
                    this.createBubblesEffect();
                    break;
                case 'stars':
                    this.createStarsEffect();
                    break;
                // 更多效果...
            }
        });
    }

    // 🆕 创建关卡对应的玩家
    createLevelPlayer() {
        // 使用关卡指定的玩家皮肤，如果没有则使用选择的角色
        let playerTexture = this.currentLevel.playerSkin;
      
        if (!this.textures.exists(playerTexture)) {
            playerTexture = (this.selectedPlayer && this.selectedPlayer.key) || 'player';
        }
      
        this.playerSpeed = (this.selectedPlayer && this.selectedPlayer.speed) || 400;
        this.playerSize = 40;
        
        this.player = this.physics.add.sprite(100, 360, playerTexture)
            .setCollideWorldBounds(true)
            .setDisplaySize(this.playerSize, this.playerSize);
      
        this.player.playerSpeed = this.playerSpeed;
        this.player.isInvincible = false;
  
        console.log('MainScene: 关卡玩家创建完成，皮肤:', playerTexture);
    }

    // 🆕 关卡特定的敌人生成
    startLevelEnemySpawner() {
        console.log('MainScene: 启动关卡敌人生成器');
        this.enemySpawner = this.time.addEvent({
            delay: this.enemySpawnRate,
            callback: this.spawnLevelEnemy,
            callbackScope: this,
            loop: true
        });
    }

    // 🆕 生成关卡敌人
    spawnLevelEnemy() {
        if (this.isGameOver || this.currentEnemyCount >= this.maxEnemies) return;
      
        // 根据权重随机选择敌人类型
        const enemyType = this.selectEnemyType();
        if (!enemyType) return;
      
        const y = Phaser.Math.Between(50, 670);
        const enemy = this.enemies.create(1300, y, enemyType.sprite);
      
        if (enemy) {
            // 设置敌人数据
            enemy.enemyData = enemyType;
            enemy.maxHp = enemyType.hp;
            enemy.currentHp = enemyType.hp;
            enemy.enemySpeed = enemyType.speed;
            enemy.scoreValue = enemyType.score;
            enemy.canShoot = enemyType.canShoot;
            enemy.shootRate = enemyType.shootRate;
            enemy.aiType = enemyType.ai;
            
            // 初始化敌人
            enemy.init();
            this.currentEnemyCount++;
            
            console.log(`MainScene: 生成关卡敌人: ${enemyType.name}，当前数量: ${this.currentEnemyCount}/${this.maxEnemies}`);
        } else {
            console.error('MainScene: 无法创建敌人对象');
        }
    }

    // 🆕 根据权重选择敌人类型
    selectEnemyType() {
        const enemies = this.currentLevel.enemies;
        let totalWeight = enemies.reduce((sum, enemy) => sum + enemy.weight, 0);
        let random = Math.random() * totalWeight;
      
        for (let enemy of enemies) {
            random -= enemy.weight;
            if (random <= 0) {
                return enemy;
            }
        }
      
        return enemies[0]; // 备用
    }

    // 🆕 处理敌人子弹击中玩家
    handleEnemyBulletHit(player, bullet) {
        if (player.isInvincible) return;
      
        bullet.destroy();
      
        // 子弹伤害
        const bulletDamage = bullet.damage || 15;
        this.currentHealth -= bulletDamage;
      
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
      
        console.log(`MainScene: 玩家被敌人子弹击中，扣血 ${bulletDamage}，当前血量: ${this.currentHealth}/${this.maxHealth}`);
      
        // 显示受伤效果
        this.showDamageEffect(bulletDamage, 'bullet');
        this.updateHUD();
      
        // 设置无敌状态
        player.isInvincible = true;
        player.setTint(0xff0000);
        this.time.delayedCall(this.invincibilityTime, () => {
            if (player && player.active) {
                player.isInvincible = false;
                player.clearTint();
            }
        });
      
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }

    // 🔧 新增敌人死亡处理方法
    handleEnemyDeath(deathData) {
        console.log(`MainScene: 敌人死亡事件 - ${deathData.enemyName}, 得分: ${deathData.score}`);
      
        // 增加分数和击杀数
        this.score += deathData.score;
        this.killCount++;
        this.currentEnemyCount--;
      
        // 更新HUD
        this.updateHUD();
      
        // 检查关卡完成
        this.checkLevelComplete();
    }
  
    // 🔧 修改敌人逃脱处理
    handleEnemyEscape(escapeData) {
        console.log(`MainScene: 敌人逃脱事件 - ${escapeData.enemyName}`);
      
        // 扣除血量
        this.currentHealth -= escapeData.damage;
      
        // 确保血量不低于0
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
      
        console.log(`MainScene: 敌人逃脱扣血 ${escapeData.damage}，当前血量: ${this.currentHealth}/${this.maxHealth}`);
      
        // 减少敌人计数
        this.currentEnemyCount--;
      
        // 视觉反馈效果
        this.showDamageEffect(escapeData.damage, 'escape');
      
        // 更新HUD
        this.updateHUD();
      
        // 检查游戏是否结束
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }
  
    // 🆕 修改子弹击中敌人的处理
    handleBulletHit(bullet, enemy) {
        if (!enemy.active || enemy.isDying) return;
      
        console.log(`MainScene: 子弹击中敌人 - 武器类型: ${bullet.weaponType}, 敌人: ${enemy.enemyData ? enemy.enemyData.name : 'Unknown'}`);
      
        // 🔧 特殊武器处理（导弹、核弹）
        if (bullet.weaponType === '导弹') {
            console.log('MainScene: 执行导弹爆炸');
            this.executeMissileExplosion(bullet, enemy);
            bullet.destroy();
            return;
        } else if (bullet.weaponType === '核弹') {
            console.log('MainScene: 执行核弹爆炸');
            this.executeNuclearStrike(bullet, enemy);
            bullet.destroy();
            return;
        }
      
        // 🔧 普通武器 - 让敌人处理伤害
        const isDead = enemy.takeDamage(bullet.damage);
      
        // 销毁子弹
        bullet.destroy();
      
        console.log(`MainScene: 使用${bullet.weaponType}攻击${enemy.enemyData ? enemy.enemyData.name : 'Unknown'}`);
    }

    // 🆕 修改关卡完成检查
    checkLevelComplete() {
        if (this.isGameOver || this.isLevelCompleted) return;
      
        const currentTime = this.time.now;
        const survivalTime = currentTime - this.gameStartTime;
      
        // 检查生存时间条件
        if (survivalTime >= this.levelCompleteTime) {
            this.completeLevel(`生存时间达到${this.levelCompleteTime/1000}秒`);
            return;
        }
      
        // 检查击杀数条件
        if (this.killCount >= this.levelCompleteKills) {
            this.completeLevel(`击杀${this.levelCompleteKills}个敌人`);
            return;
        }
    }

    // 🆕 完成关卡
    completeLevel(reason) {
        if (this.isLevelCompleted) return;
      
        this.isLevelCompleted = true;
        console.log(`MainScene: 关卡 ${this.currentLevel.name} 完成！原因: ${reason}`);
      
        this.levelEndTime = this.time.now;
        this.levelComplete = true;
      
        // 停止敌人生成
        if (this.enemySpawner) {
            this.enemySpawner.remove();
            this.enemySpawner = null;
        }
      
        // 清除所有敌人和子弹
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
      
        // 显示关卡完成界面
        this.showLevelCompleteScreen(reason);
    }

    // 🆕 显示关卡完成界面
    showLevelCompleteScreen(reason) {
        const completeBg = this.add.rectangle(640, 360, 600, 400, 0x000000, 0.9);
      
        this.add.text(640, 240, '🎉 关卡完成！🎉', {
            font: '48px Arial',
            fill: '#00ff00',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
      
        this.add.text(640, 300, `${this.currentLevel.name}`, {
            font: '32px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
      
        this.add.text(640, 340, `完成条件: ${reason}`, {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
      
        this.add.text(640, 380, `最终分数: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
      
        this.add.text(640, 420, `击杀数: ${this.killCount}`, {
            font: '20px Arial',
            fill: '#cccccc'
        }).setOrigin(0.5);
      
        // 按键提示
        const nextLevel = this.currentLevelIndex + 1;
        if (nextLevel < LEVELS_CONFIG.length) {
            this.add.text(640, 480, '按 N 进入下一关', {
                font: '18px Arial',
                fill: '#00ffff'
            }).setOrigin(0.5);
          
            this.input.keyboard.on('keydown-N', this.nextLevel, this);
        } else {
            this.add.text(640, 480, '🏆 恭喜通关！🏆', {
                font: '24px Arial',
                fill: '#ffd700'
            }).setOrigin(0.5);
        }
      
        this.add.text(640, 520, '按 R 重新开始本关', {
            font: '16px Arial',
            fill: '#cccccc'
        }).setOrigin(0.5);
    }

    // 🔧 在场景销毁时清理事件监听器
    destroy() {
        this.events.off('enemyDied', this.handleEnemyDeath, this);
        this.events.off('enemyEscaped', this.handleEnemyEscape, this);
        super.destroy();
    }

    // 环境效果方法（占位符）
    createSandstormEffect() {
        // 沙尘暴效果实现
        console.log('MainScene: 创建沙尘暴效果');
    }

    createFogEffect() {
        // 雾气效果实现
        console.log('MainScene: 创建雾气效果');
    }

    createBubblesEffect() {
        // 气泡效果实现
        console.log('MainScene: 创建气泡效果');
    }

    createStarsEffect() {
        // 星空效果实现
        console.log('MainScene: 创建星空效果');
    }
} 