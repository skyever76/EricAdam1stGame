// scenes/MainScene.js - ES6模块横版卷轴关卡系统

import { GAME_CONFIG, WEAPON_CONFIGS, UI_LAYOUT, COLOR_CONFIG } from './configs.js';
import { Weapon } from './Weapon.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './EnemyClass.js';
import { EnemyBullet } from './EnemyBullet.js';
import { PowerUp } from './PowerUp.js';
import { Obstacle } from './Obstacle.js';
import { PowerUpManager } from './PowerUpManager.js';
import { ObstacleManager } from './ObstacleManager.js';
import { UIManager } from './UIManager.js';
import { BackgroundManager } from './BackgroundManager.js';
import { AudioManager } from './AudioManager.js';
import { TouchControls } from './TouchControls.js';
import { PixelArtSystem } from './PixelArtSystem.js';
import { AdvancedSceneManager } from './AdvancedSceneManager.js';
import { SceneSwitcher } from './SceneSwitcher.js';
import { ADVANCED_SCENES } from './advancedScenes.js';
import { StatsManager } from './StatsManager.js';
import { AchievementManager } from './AchievementManager.js';
import { SaveManager } from './SaveManager.js';
import { LEVELS_CONFIG } from './levels.js';
import { LEVEL_THEMES } from './levelThemes.js';

export class MainScene extends Phaser.Scene {
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
        console.log('MainScene: 创建横版卷轴场景开始');
        
        // 🔧 清理可能存在的旧事件监听器（防止重复添加）
        this.input.keyboard.removeAllListeners();
        this.events.off('enemyDied');
        this.events.off('enemyEscaped');
      
        // 📊 统计系统由SaveManager统一管理
        
        // 🏆 初始化成就系统
        if (AchievementManager) {
            AchievementManager.init();
        }
        
        // 💾 加载游戏数据
        if (SaveManager) {
            SaveManager.loadAll();
        }
      
        // 🎨 初始化像素艺术系统
        this.pixelArtSystem = new PixelArtSystem(this);
        this.pixelArtSystem.initAllTextures();
      
        // 🔊 音频系统已默认启用，无需手动解锁
        console.log('🎵 音频系统默认启用');
      
        // 🆕 加载当前关卡配置
        this.loadLevelConfig();
      
        // 武器系统初始化
        this.initWeaponSystem();
      
        // 🆕 关卡系统初始化
        this.initLevelSystem();
      
        // 初始化血量系统
        this.initHealthSystem();
  
        // 🎨 初始化背景管理器
        this.backgroundManager = new BackgroundManager(this);
        this.backgroundManager.createLevelBackground();
  
        // 🆕 横版卷轴：设置扩展的世界边界
        console.log(`🌍 设置横版卷轴世界边界: ${GAME_CONFIG.WORLD_WIDTH}x${GAME_CONFIG.WORLD_HEIGHT}`);
        this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // 🆕 横版卷轴：设置摄像机边界和跟随系统
        this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        console.log('📹 摄像机边界设置完成');
  
        // 🆕 创建关卡对应的玩家
        this.createLevelPlayer();
  
        // 创建游戏对象组
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 50
        });
        
        console.log(`🔫 子弹组创建完成: 最大大小=${this.bullets.maxSize}, 当前大小=${this.bullets.getLength()}`);
  
        this.enemies = this.physics.add.group({
            classType: Enemy, // 🔧 使用导入的Enemy类
            maxSize: 20
        });
      
        // 🆕 敌人子弹组
        this.enemyBullets = this.physics.add.group({
            classType: EnemyBullet, // 🔧 使用导入的EnemyBullet类
            maxSize: 30
        });
      
        // 创建粒子效果系统
        this.createParticleSystems();
  
        // 🆕 碰撞检测（增加敌人子弹）
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHit, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.handleEnemyBulletHit, null, this);
        
        // 🪨 障碍物碰撞检测（在障碍物管理器初始化后设置）
        // 🆕 临时禁用障碍物碰撞检测
        // this.setupObstacleCollisions();
  
        // 🆕 初始化触摸控制系统（仅iPad启用）
        this.touchControls = new TouchControls(this);
        this.touchControls.create();

        // 输入控制
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 添加WASD键支持
        this.wasdKeys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // 🆕 添加调试键 - F1键显示物理体边界
        this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
        this.showPhysicsBounds = false;
        this.physicsDebugGraphics = null;
        
        // 修复射击事件绑定 - 使用包装函数传递正确的参数
        this.input.on('pointerdown', (pointer) => {
            // 鼠标点击时，计算从玩家到鼠标的角度
            if (this.player && this.player.active) {
                const startX = this.player.x + this.playerSize / 2;
                const startY = this.player.y;
                const angle = Phaser.Math.Angle.Between(startX, startY, pointer.worldX, pointer.worldY);
                this.shoot(angle);
            }
        }, this);
        
        this.input.keyboard.on('keydown-SPACE', () => {
            // 键盘射击时，默认朝右射击（角度0）
            this.shoot(0);
        }, this);
        this.input.keyboard.on('keydown-P', this.togglePause, this);
        
        // 🆕 武器切换按键
        this.input.keyboard.on('keydown-ONE', () => this.switchWeapon(0), this);
        this.input.keyboard.on('keydown-TWO', () => this.switchWeapon(1), this);
        this.input.keyboard.on('keydown-THREE', () => this.switchWeapon(2), this);
        this.input.keyboard.on('keydown-FOUR', () => this.switchWeapon(3), this);
        this.input.keyboard.on('keydown-FIVE', () => this.switchWeapon(4), this);
        this.input.keyboard.on('keydown-SIX', () => this.switchWeapon(5), this);
        
        // 🌍 初始化高级场景系统
        this.advancedSceneManager = new AdvancedSceneManager(this);
        
        // 🌍 初始化场景切换器
        this.sceneSwitcher = new SceneSwitcher(this, ADVANCED_SCENES);
        
        // 🌍 添加场景切换快捷键
        this.sceneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // 🌍 默认加载第一个场景
        this.advancedSceneManager.loadScene('mechanical_interior');
        
        // 全局R键监听器（用于重新开始游戏）
        this.input.keyboard.on('keydown-R', this.handleRestart, this);
        
        // 初始化音频上下文（解决AudioContext警告）
        this.input.once('pointerdown', () => {
            // 解锁AudioManager
            if (AudioManager && !AudioManager.audioUnlocked) {
                AudioManager.unlockAudio();
                console.log('MainScene: AudioManager已解锁');
            }
            
            // 恢复Phaser音频上下文
            if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
                console.log('MainScene: Phaser音频上下文已恢复');
            }
        });
  
        // 📊 初始化UI管理器
        this.uiManager = new UIManager(this);
        this.uiManager.createHUD();
  
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
        this.add.text(1000, 680, 'v4.1-SideScroll', { 
            font: '12px Arial', 
            fill: '#666666' 
        }).setOrigin(1).setScrollFactor(0); // 🆕 固定显示
    
        console.log('MainScene: 横版卷轴场景创建完成');

        // 设置初始积分（根据角色配置）
        this.score = this.selectedPlayer ? (this.selectedPlayer.initPoints || 0) : 0;

        this.powerUpManager = new PowerUpManager(this);
        // 玩家与道具碰撞检测
        this.physics.add.overlap(this.player, this.powerUpManager.powerUps, this.collectPowerUp, null, this);

        // 🆕 初始化障碍物系统
        this.obstacleManager = new ObstacleManager(this);
        this.obstacleManager.setLevel('forest');
        // 🆕 临时禁用障碍物生成
        // this.obstacleManager.spawnObstacles();
    }

    // 🆕 初始化武器系统
    initWeaponSystem() {
        this.lastShootTime = 0;
        
        // 🔧 使用配置文件创建武器
        this.weapons = [
            new Weapon(this, WEAPON_CONFIGS.AK47),
            new Weapon(this, WEAPON_CONFIGS.DESERT_EAGLE),
            new Weapon(this, WEAPON_CONFIGS.GATLING),
            new Weapon(this, WEAPON_CONFIGS.SONIC_GUN),
            new Weapon(this, WEAPON_CONFIGS.MISSILE),
            new Weapon(this, WEAPON_CONFIGS.NUKE)
        ];
        
        this.currentWeaponIndex = 0;
        this.currentWeapon = this.weapons[this.currentWeaponIndex];
        
        console.log('🔫 武器系统初始化完成，当前武器:', this.currentWeapon.name);
    }
    
    switchWeapon(index) {
        if (this.isGameOver) return;
        
        if (index >= 0 && index < this.weapons.length) {
            const targetWeapon = this.weapons[index];
            
            // 检查是否需要购买子弹
            if (!targetWeapon.hasAmmo()) {
                const costFor5Bullets = targetWeapon.bulletCost * 5;
                
                if (this.score >= costFor5Bullets) {
                    this.score -= costFor5Bullets;
                    targetWeapon.bulletCount = 5;
                    this.showBulletPurchaseMessage(targetWeapon.name, 5, costFor5Bullets);
                } else {
                    this.showInsufficientScoreForBulletsMessage(targetWeapon.name, costFor5Bullets);
                    return;
                }
            }
            
            this.currentWeaponIndex = index;
            this.currentWeapon = targetWeapon;
            
            // 🆕 如果是iPad，高亮触摸控制按钮
            if (this.touchControls && this.touchControls.isMobile) {
                this.touchControls.highlightWeaponButton(index);
            }
            
            this.showWeaponSwitchMessage();
        }
    }
    
    showBulletPurchaseMessage(weaponName, bulletCount, cost) {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `自动购买${weaponName}子弹${bulletCount}发，消耗${cost}积分`, {
            font: '24px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }
    
    showInsufficientScoreForBulletsMessage(weaponName, requiredScore) {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `积分不足购买${weaponName}子弹！需要${requiredScore}积分`, {
            font: '24px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }
    

    
    showWeaponSwitchMessage() {
        if (this.weaponSwitchText) {
            this.weaponSwitchText.destroy();
        }
        
        this.weaponSwitchText = this.add.text(640, 200, `武器: ${this.currentWeapon.name}`, {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        this.time.delayedCall(2000, () => {
            if (this.weaponSwitchText) {
                this.weaponSwitchText.destroy();
                this.weaponSwitchText = null;
            }
        }, null, this);
    }

    // 🆕 初始化血量系统
    initHealthSystem() {
        this.maxHealth = this.selectedPlayer ? this.selectedPlayer.health : GAME_CONFIG.MAX_HEALTH;
        this.currentHealth = this.maxHealth;
        this.damagePerEnemyEscape = 10;
        this.collisionDamage = 20;
        this.invincibilityTime = 500;
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
            console.log('MainScene: background纹理不存在，使用偏淡背景');
            this.add.rectangle(640, 360, 1280, 720, 0xe8f4f8); // 偏淡的蓝白色背景
        }
    }

    createPlayer() {
        // 确定使用哪个纹理
        let playerTexture = 'player'; // 默认
      
        // 预设玩家属性
        this.playerSpeed = GAME_CONFIG.PLAYER_SPEED;
        this.playerSize = GAME_CONFIG.PLAYER_SIZE;
      
        if (this.selectedPlayer && this.textures.exists(this.selectedPlayer.key)) {
            playerTexture = this.selectedPlayer.key;
            this.playerSpeed = this.selectedPlayer.speed || 400;
            console.log('MainScene: 使用角色纹理:', playerTexture, '速度:', this.playerSpeed);
        } else {
            console.log('MainScene: 使用默认玩家纹理:', playerTexture);
        }
          
        this.player = this.physics.add.sprite(100, 360, playerTexture)
            .setDisplaySize(this.playerSize, this.playerSize);
        
        // 🆕 确保物理体正确设置
        if (this.player.body) {
            this.player.body.setCollideWorldBounds(false);
            this.player.body.setBounce(0, 0);
            this.player.body.setDrag(0, 0);
            this.player.body.setFriction(0, 0);
            this.player.body.setGravity(0, 0);
            this.player.body.setImmovable(false);
            this.player.body.setMass(1);
            this.player.body.setSize(this.playerSize, this.playerSize);
            
            console.log('🎮 玩家物理体设置完成:', {
                collideWorldBounds: this.player.body.collideWorldBounds,
                bounce: this.player.body.bounce,
                drag: this.player.body.drag,
                friction: this.player.body.friction,
                gravity: this.player.body.gravity,
                immovable: this.player.body.immovable,
                mass: this.player.body.mass,
                size: `${this.player.body.width}x${this.player.body.height}`
            });
        }
    
        // 设置玩家属性到 sprite
        this.player.playerSpeed = this.playerSpeed;
        this.player.isInvincible = false;
    
        console.log('🎮 横版卷轴玩家创建完成，类型:', this.selectedPlayer ? this.selectedPlayer.key : 'default');
    }





    // 🆕 修改敌人生成方法（横版卷轴版本）
    spawnEnemy() {
        if (this.isGameOver) return;
        
        console.log('MainScene: 横版卷轴敌人生成');
        
        if (!this.textures.exists('enemy')) {
            console.error('MainScene: 敌人纹理不存在！');
            return;
        }
        
        const y = Phaser.Math.Between(50, 670);
        // 🆕 横版卷轴：在摄像机右侧外生成敌人
        const spawnX = this.cameras.main.scrollX + 900; // 摄像机右侧900像素处
        const enemy = this.enemies.create(spawnX, y, 'enemy');
        
        if (enemy) {
            enemy.setDisplaySize(32, 32);
            enemy.setVelocityX(-100); // 向左移动（相对世界坐标）
            
            if (enemy.body) {
                enemy.body.enable = true;
            }
            
            enemy.checkBounds = true;
            
            console.log(`MainScene: 横版卷轴敌人生成成功，位置: (${enemy.x}, ${enemy.y})，当前敌人数量: ${this.enemies.children.size}`);
        } else {
            console.error('MainScene: 无法创建敌人对象');
        }
    }

    // 🆕 修改敌人逃脱检查（横版卷轴版本）
    checkEnemyEscape() {
        if (this.isGameOver) return;
      
        const cameraLeft = this.cameras.main.scrollX;
        
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.x < cameraLeft - 100) { // 敌人移出摄像机左侧
                console.log('MainScene: 横版卷轴敌人逃脱！');
                this.handleEnemyEscape(enemy);
            }
        });
    }

    // 🆕 处理敌人逃脱（单个敌人）
    handleEnemyEscape(enemy) {
        // 触发敌人逃脱事件，让事件处理器统一处理
        enemy.escape();
    }

    // 🆕 显示受伤效果
    showDamageEffect(damageAmount, damageType = 'escape') {
        // 💔 受伤效果 - 使用简单的Graphics动画
        if (this.player) {
            const damageEffect = this.add.graphics();
            damageEffect.fillStyle(0xff0000, 0.6);
            damageEffect.fillCircle(this.player.x, this.player.y, 30);
            damageEffect.setDepth(150);
            
            // 简单的扩散和淡出动画
            this.tweens.add({
                targets: damageEffect,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => damageEffect.destroy()
            });
        }
        
        // 屏幕红色闪烁效果
        const damageOverlay = this.add.rectangle(640, 360, 1280, 720, 0xff0000, 0.3).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 闪烁动画
        this.tweens.add({
            targets: damageOverlay,
            alpha: 0,
            duration: 200,
            onComplete: () => damageOverlay.destroy()
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
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 伤害文字动画
        this.tweens.add({
            targets: damage,
            y: damage.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => damage.destroy()
        });
    }

    // updateHUD方法已完全移至UIManager
    // 所有UI更新现在通过updateUISystem() -> uiManager.update(gameState)处理

    // 🔄 重构后的update方法 - 模块化设计
    update() {
        // 基础检查
        if (!this.isGameActive()) return;
        
        // 🆕 游戏结束时只更新UI系统，保持输入事件处理
        if (this.isGameOver) {
            this.updateUISystem();
            return;
        }
        
        // 更新各个系统
        this.updatePlayerSystem();
        this.updateEnemySystem();
        this.updateWeaponSystem();
        this.updatePowerUpSystem();
        this.updateObstacleSystem();
        this.updateSceneSystem();
        this.updateUISystem();
        
        // 检查游戏状态
        this.checkGameState();
    }

    // ✅ 检查游戏是否活跃
    isGameActive() {
        // 🆕 游戏结束时仍然需要处理UI更新和输入事件
        if (this.isGameOver) {
            return this.player && this.player.active;
        }
        return this.player && this.player.active && !this.scene.isPaused();
    }

    // 🎯 获取游戏状态数据包 - 提供给UIManager使用
    getGameStateForUI() {
        return {
            score: this.score,
            currentHealth: this.currentHealth,
            maxHealth: this.maxHealth,
            weapon: this.currentWeapon,
            killCount: this.killCount,
            levelCompleteKills: this.levelCompleteKills,
            player: this.player,
            gameStartTime: this.gameStartTime,
            isGameOver: this.isGameOver,
            levelComplete: this.levelComplete,
            levelEndTime: this.levelEndTime,
            powerUpManager: this.powerUpManager,
            obstacleManager: this.obstacleManager,
            advancedSceneManager: this.advancedSceneManager,
            time: this.time,
            // 🆕 添加小地图需要的数据
            enemies: this.enemies ? this.enemies.getChildren() : [],
            camera: this.cameras.main
        };
    }

    // 🎮 更新玩家系统
    updatePlayerSystem() {
        if (this.isGameOver) return;
        
        // 🆕 检查触摸控制系统状态
        if (this.touchControls) {
            const touchStatus = {
                isMobile: this.touchControls.isMobile,
                leftStickActive: this.touchControls.leftStick ? this.touchControls.leftStick.active : false,
                isEnabled: this.touchControls.isEnabled
            };
            
            // 🆕 只在触摸控制状态异常时显示警告
            if (touchStatus.isMobile && !touchStatus.isEnabled) {
                console.warn(`⚠️ 触摸控制系统状态异常:`, touchStatus);
            }
            
            this.touchControls.update();
        }
        
        // 🆕 键盘控制（所有设备都启用，iPad可同时使用）
        this.updatePlayerMovement();
        
        // 🆕 注释掉原来的条件检查
        // 键盘控制（非触摸设备）
        // if (!this.touchControls || !this.touchControls.isMobile) {
        //     this.updatePlayerMovement();
        // }
    }

    // 🎮 更新玩家移动
    updatePlayerMovement() {
        // 简化移动逻辑，移除复杂的调试和检查
        if (!this.player || !this.player.body) return;
        
        // 重置速度
        this.player.setVelocity(0);
        
        // 水平移动
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        }
        
        // 垂直移动（限制在世界边界内）
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            if (this.player.y > 50) {
                this.player.setVelocityY(-this.playerSpeed);
            }
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            if (this.player.y < 670) {
                this.player.setVelocityY(this.playerSpeed);
            }
        }
        
        // 简单的调试信息（只在按键时显示）
        const keysPressed = [];
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) keysPressed.push('左');
        if (this.cursors.right.isDown || this.wasdKeys.D.isDown) keysPressed.push('右');
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) keysPressed.push('上');
        if (this.cursors.down.isDown || this.wasdKeys.S.isDown) keysPressed.push('下');
        
        if (keysPressed.length > 0) {
            console.log(`🎮 移动: ${keysPressed.join(',')} | 位置: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}) | 速度: (${this.player.body.velocity.x.toFixed(0)}, ${this.player.body.velocity.y.toFixed(0)})`);
        }
    }
    


    // 👾 更新敌人系统
    updateEnemySystem() {
        // 更新所有敌人AI
        if (!this.enemies || !this.enemies.children || !this.enemies.children.entries) {
            return;
        }
        
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.update) {
                enemy.update(this.time.now, this.game.loop.delta);
            }
        });
        
        // 检查敌人逃脱
        this.checkEnemyEscape();
    }

    // 🔫 更新武器系统
    updateWeaponSystem() {
        // 武器系统更新逻辑（如果需要）
        // 重构后的Weapon类不再需要update方法，所有逻辑都在MainScene中处理
    }

    // ⚡ 更新道具系统
    updatePowerUpSystem() {
        if (this.powerUpManager) {
            this.powerUpManager.update();
        }
            }

    // 🪨 更新障碍物系统
    updateObstacleSystem() {
        // ObstacleManager 现在不需要每帧更新，只在障碍物被摧毁时自动处理
        // 这里可以保留用于未来扩展
        }
        
    // 🌍 更新场景系统
    updateSceneSystem() {
        if (this.advancedSceneManager) {
            this.advancedSceneManager.update(this.time.now, this.game.loop.delta);
        }
        
        // 检查场景切换快捷键
        if (Phaser.Input.Keyboard.JustDown(this.sceneKey)) {
            this.sceneSwitcher.toggle();
        }
        
        // 🆕 检查调试键
        if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
            this.togglePhysicsDebug();
        }
        
        // 🆕 更新物理体调试显示
        if (this.showPhysicsBounds) {
            this.updatePhysicsDebug();
        }
    }

    // 📊 更新UI系统
    updateUISystem() {
        if (this.uiManager) {
            // 传递完整的游戏状态数据包给UIManager
            this.uiManager.update(this.getGameStateForUI());
        }
    }

    // 🎯 检查游戏状态
    checkGameState() {
        if (this.isGameOver) {
            return; // 🆕 UI更新已在update方法中处理
        }
      
        // 检查关卡完成条件
        this.checkLevelComplete();
        
        // 🆕 检查伤害区域
        this.checkDamageZones();
    }
    
    // 🆕 检查伤害区域
    checkDamageZones() {
        if (!this.advancedSceneManager || !this.player) return;
        
        const damageZones = this.advancedSceneManager.damageZones;
        if (!damageZones || !damageZones.forEach) return;
        
        damageZones.forEach((data, zone) => {
            if (zone.active && this.player.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    zone.x, zone.y
                );
                
                if (distance < zone.width / 2) {
                    // 玩家在伤害区域内
                    this.handleDamageZoneHit(data);
                }
            }
        });
    }
    
    // 🆕 处理伤害区域击中
    handleDamageZoneHit(data) {
        if (this.player.isInvincible) return;
        
        const damage = data.damage || 10;
        this.currentHealth -= damage;
        
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        
        console.log(`MainScene: 玩家受到${data.type}伤害 ${damage}，当前血量: ${this.currentHealth}/${this.maxHealth}`);
        
        // 🔊 播放受伤音效
        AudioManager.play('hurt');
        
        // 显示受伤效果
        this.showDamageEffect(damage, data.type);
        
        // 设置无敌状态
        this.player.isInvincible = true;
        this.player.setTint(0xff0000);
        this.time.delayedCall(this.invincibilityTime, () => {
            if (this.player && this.player.active) {
                this.player.isInvincible = false;
                this.player.clearTint();
            }
        });
        
        if (this.currentHealth <= 0) {
            this.gameOver();
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
      
        // 🔊 播放受伤音效
        AudioManager.play('hurt');
      
        // 显示受伤效果
        this.showDamageEffect(this.collisionDamage, 'collision');
      
        // UI更新通过主循环自动处理
      
        // 设置无敌状态
        player.isInvincible = true;
        player.setTint(0xff0000);
        this.time.delayedCall(this.invincibilityTime, () => {
            if (player && player.active) {
                player.isInvincible = false;
                player.clearTint();
                console.log(`🛡️ 玩家无敌状态结束`);
            }
        });
      
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }

    handleBulletHit(bullet, enemy) {
        if (!enemy.active) return;

        // 🆕 详细的中文击中信息
        const enemyName = enemy.enemyConfig?.name || enemy.enemyData?.name || '未知敌人';
        const bulletPos = `(${bullet.x.toFixed(0)}, ${bullet.y.toFixed(0)})`;
        const enemyPos = `(${enemy.x.toFixed(0)}, ${enemy.y.toFixed(0)})`;
        const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
        
        console.log(`🎯 子弹击中敌人: ${bullet.weaponType} | 子弹位置: ${bulletPos} | 敌人位置: ${enemyPos} | 距离: ${distance.toFixed(1)} | 敌人: ${enemyName}`);

        // 🔊 播放击中音效
        AudioManager.play('hit');

        let isDead = false;

        // 🔧 特殊武器处理（导弹、核弹）
        if (bullet.weaponType === '导弹') {
            console.log('💥 MainScene: 执行导弹爆炸');
            this.executeMissileExplosion(bullet, enemy);
            // 导弹爆炸后，自身也应被回收，但不要在这里立即返回
        } else if (bullet.weaponType === '核弹') {
            console.log('☢️ MainScene: 执行核弹爆炸');
            this.executeNuclearStrike(bullet, enemy);
            // 核弹爆炸后，自身也应被回收，但不要在这里立即返回
        } else {
            // 🔧 普通武器 - 让敌人类处理自己的伤害计算
            if (enemy.takeDamage) {
                const enemyHealth = enemy.health || enemy.maxHealth || 100;
                console.log(`💥 普通武器攻击: ${bullet.weaponType} | 伤害: ${bullet.damage} | 敌人血量: ${enemyHealth} → ${enemyHealth - bullet.damage}`);
                isDead = enemy.takeDamage(bullet.damage);
            } else {
                // 兼容旧版敌人
                console.log(`💥 兼容模式攻击: ${bullet.weaponType} | 直接击杀敌人`);
                isDead = true;
            }
        }
        
        // 🔧 统一在最后回收子弹（使用kill()而不是destroy()）
        bullet.kill();
        
        if (isDead) {
            // 通过事件系统报告击杀，让事件处理器统一处理
            const enemyName = enemy.enemyConfig?.name || enemy.enemyData?.name || '小兵';
            let baseScore = bullet.damage;
            if (this.selectedPlayer && this.selectedPlayer.damageMultiplier) {
                baseScore = Math.round(baseScore * this.selectedPlayer.damageMultiplier);
            }
            const killBonus = 20;
            const scoreGain = baseScore + killBonus;
            
            console.log(`💀 敌人死亡: ${enemyName} | 武器: ${bullet.weaponType} | 得分: ${scoreGain} (基础${baseScore} + 击杀奖励${killBonus})`);
            
            this.events.emit('enemyDied', { 
                enemyName: enemyName,
                score: scoreGain,
                killedBy: 'player_bullet',
                enemy: enemy,
                weaponType: bullet.weaponType
            });
        } else {
            console.log(`💪 敌人存活: ${enemyName} | 剩余血量: ${enemy.health || '未知'}`);
        }

        console.log(`✅ MainScene: 使用${bullet.weaponType}攻击完成`);
    }

    gameOver() {
        if (this.isGameOver) return; // 防止重复调用
      
        console.log('MainScene: 游戏结束 - 血量耗尽');
        this.isGameOver = true;
        
        // 📊 记录游戏结束统计
        if (StatsManager) {
            const survivalTime = this.time.now - this.gameStartTime;
            StatsManager.gameEnd(this.score, survivalTime);
        }
        
        // 💾 保存游戏数据
        if (SaveManager) {
            SaveManager.saveAll();
        }
        
        // 🔊 播放游戏结束音效
        AudioManager.play('gameOver');
        
        // 🆕 记录游戏结束时间
        this.levelEndTime = this.time.now;
      
        // 停止敌人生成
        if (this.enemySpawner) {
            this.enemySpawner.remove();
            this.enemySpawner = null;
        }
      
        // 清除所有敌人和子弹
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        this.enemyBullets.clear(true, true);
      
        // 显示游戏结束界面
        const gameOverBg = this.add.rectangle(640, 360, 400, 200, 0x000000, 0.8).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        this.add.text(640, 320, 'GAME OVER', {
            font: '48px Arial',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        this.add.text(640, 380, `最终分数: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 🆕 创建重新开始按钮
        const restartButton = this.add.rectangle(640, 420, 200, 50, 0x4CAF50, 0.8)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });
        
        const restartText = this.add.text(640, 420, '重新开始', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 🆕 按钮悬停效果
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x66BB6A, 0.9);
            restartText.setStyle({ fill: '#ffffff' });
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x4CAF50, 0.8);
            restartText.setStyle({ fill: '#ffffff' });
        });
        
        // 🆕 按钮点击事件
        restartButton.on('pointerdown', () => {
            console.log('🔄 用户点击重新开始按钮');
            this.handleRestart();
        });
        
        // 🆕 保存按钮引用以便后续清理
        this.gameOverUI = {
            background: gameOverBg,
            restartButton: restartButton,
            restartText: restartText
        };
      
        // 🆕 暂停游戏逻辑但保持输入监听器活跃
        this.scene.pause();
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

    shoot(angle = null) {
        console.log(`🎯 射击触发: 角度=${angle}, 游戏状态=${this.isGameOver}, 暂停=${this.scene.isPaused()}`);
        
        if (this.isGameOver || this.scene.isPaused()) {
            console.log('❌ 射击被阻止：游戏结束或暂停');
            return; // 游戏状态检查
        }
        
        // 🆕 检查子弹是否足够
        if (!this.currentWeapon.hasAmmo()) {
            console.log('❌ 射击被阻止：子弹不足');
            this.showNoBulletsMessage();
            return;
        }
        
        // 🆕 检查射击冷却（应用角色射速倍数）
        const fireRateMultiplier = this.selectedPlayer ? (this.selectedPlayer.fireRateMultiplier || 1.0) : 1.0;
        const adjustedFireRate = this.currentWeapon.fireRate / fireRateMultiplier;
        const now = this.time.now;
        if (now - this.lastShootTime < adjustedFireRate) {
            console.log('MainScene: 射击冷却中');
            return; // 冷却时间未到
        }
        
        if (!this.player || !this.player.active) {
            console.log('MainScene: 玩家不存在或未激活');
            return;
        }
        
        console.log(`✅ 射击条件满足，开始射击: 武器=${this.currentWeapon.name}, 子弹数=${this.currentWeapon.bulletCount}`);
        
        // 🆕 消耗子弹
        this.currentWeapon.consumeAmmo();
        this.lastShootTime = this.time.now;
        
        console.log(`MainScene: 消耗1发${this.currentWeapon.name}子弹，剩余${this.currentWeapon.bulletCount}发`);
        
        // 🆕 执行连发射击，传递射击角度
        this.executeBurstFire(angle);
    }
    
    // 🆕 执行连发射击
    executeBurstFire(angle = null) {
        const weapon = this.currentWeapon;
        const offsetX = this.playerSize / 2;
        const startX = this.player.x + offsetX;
        const startY = this.player.y;
        
        // 🆕 如果提供了角度（来自触摸控制），使用它；否则计算鼠标角度
        if (angle === null) {
            const mouseX = this.input.activePointer.worldX;
            const mouseY = this.input.activePointer.worldY;
            angle = Phaser.Math.Angle.Between(startX, startY, mouseX, mouseY);
            
            const angleDegrees = Phaser.Math.RadToDeg(angle);
            const distance = Phaser.Math.Distance.Between(startX, startY, mouseX, mouseY);
            console.log(`🎯 计算射击角度: 玩家位置(${startX.toFixed(0)}, ${startY.toFixed(0)}) | 鼠标位置(${mouseX.toFixed(0)}, ${mouseY.toFixed(0)}) | 角度: ${angleDegrees.toFixed(1)}° | 距离: ${distance.toFixed(0)}`);
        } else {
            const angleDegrees = Phaser.Math.RadToDeg(angle);
            console.log(`🎯 使用预设角度: ${angleDegrees.toFixed(1)}°`);
        }
        
        // 🆕 加特林扇形散弹
        if (weapon.name === '加特林') {
            const spreadAngle = Math.PI / 4; // 45度扇形
            const bulletCount = 8; // 固定8发子弹
            const angleStep = spreadAngle / (bulletCount - 1);
            const startAngle = angle - spreadAngle / 2;
            
            // 🆕 同时发射8发扇形散弹
            for (let i = 0; i < bulletCount; i++) {
                const bulletAngle = startAngle + angleStep * i;
                // 移除延迟，所有子弹同时发射
                if (!this.isGameOver && this.player && this.player.active) {
                    this.fireSingleBullet(startX, startY, bulletAngle, weapon);
                }
            }
            
            console.log(`MainScene: 发射${weapon.name}，同时扇形散弹${bulletCount}发，角度范围${spreadAngle * 180 / Math.PI}度`);
        } else {
            // 其他武器的普通连发
            // 发射第一发
            this.fireSingleBullet(startX, startY, angle, weapon);
            
            // 如果有连发，继续发射
            const burstDelays = weapon.getBurstDelays();
            for (let i = 1; i < burstDelays.length; i++) {
                this.time.delayedCall(burstDelays[i], () => {
                        if (!this.isGameOver && this.player && this.player.active) {
                            this.fireSingleBullet(startX, startY, angle, weapon);
                        }
                    }, null, this);
            }
            
            console.log(`MainScene: 发射${weapon.name}，连发${weapon.burstCount}发`);
        }
    }
    
    // 🆕 发射单发子弹
    fireSingleBullet(x, y, angle, weapon) {
        const angleDegrees = Phaser.Math.RadToDeg(angle);
        console.log(`🔫 尝试发射子弹: 位置(${x.toFixed(0)}, ${y.toFixed(0)}), 角度${angleDegrees.toFixed(1)}°, 武器${weapon.name}`);
        
        const bullet = this.bullets.get();
        if (bullet) {
            console.log(`✅ 成功获取子弹对象，开始发射`);
            
            // 调用Bullet实例的fire方法，并把当前武器的配置传进去
            bullet.fire(x, y, angle, weapon);
            
            console.log(`✅ 子弹发射完成，位置(${bullet.x.toFixed(0)}, ${bullet.y.toFixed(0)}), 可见性:${bullet.visible}, 激活:${bullet.active}`);
            
            // 🔊 播放射击音效
            if (this.audioManager) {
                this.audioManager.play('shoot');
            }
            
            // 🔊 播放射击音效
            AudioManager.play('shoot');
            
            // 🔫 射击视觉效果
            this.createShootEffect(x, y);
            
            // 🆕 特殊武器效果
            if (weapon.name === '声波枪' && weapon.isContinuous) {
                this.executeTeslaBeam(bullet);
            }
            
            // 🆕 核弹追踪功能
            if (weapon.name === '核弹') {
                this.setupNuclearHoming(bullet);
            }
        } else {
            console.error(`❌ 无法从子弹组获取子弹对象！子弹组大小: ${this.bullets.getLength()}`);
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
                
                // 添加追踪轨迹效果（不使用过时的粒子系统）
                if (Math.random() < 0.5) { // 增加轨迹概率
                    const trail = this.add.graphics();
                    trail.fillStyle(0xff0000, 0.5);
                    trail.fillCircle(bullet.x, bullet.y, 3);
                    trail.setDepth(5);
                    
                    this.time.delayedCall(300, () => {
                        trail.destroy();
                    });
                }
            }
        };
    }
    
    // 🆕 核弹爆炸效果（改进版）
    // 🆕 核弹爆炸效果（完全重写，增加全屏特效）
    executeNuclearStrike(bullet, hitEnemy) {
        const weapon = this.weapons.find(w => w.name === '核弹');
      
        // 🔧 修复爆炸中心坐标计算
        const explosionCenter = hitEnemy ? 
            { x: hitEnemy.x, y: hitEnemy.y } : 
            { x: bullet.x, y: bullet.y };
      
        const explosionRadius = (weapon && weapon.config && weapon.config.damageRadius) ? 
            weapon.config.damageRadius : 400;
      
        console.log(`🔥 核弹爆炸开始：中心(${explosionCenter.x}, ${explosionCenter.y})，半径${explosionRadius}`);
      
        // 🆕 立即开始全屏特效
        this.createNuclearExplosionEffects(explosionCenter);
      
        let killedEnemies = 0;
        const enemies = this.enemies.getChildren();
        const totalEnemies = enemies.filter(e => e.active).length;
      
        console.log(`核弹爆炸前总敌人数量：${totalEnemies}`);
      
        // 🆕 延迟爆炸伤害，配合视觉效果
        this.time.delayedCall(300, () => {
            for (let enemy of enemies) {
                if (enemy.active) {
                    const distance = Phaser.Math.Distance.Between(
                        explosionCenter.x, explosionCenter.y, 
                        enemy.x, enemy.y
                    );
                    const enemyName = enemy.enemyData ? enemy.enemyData.name : 'Unknown';
                  
                    if (distance <= explosionRadius) {
                        killedEnemies++;
                        this.killCount++;
                      
                        // 🆕 增加核弹特殊得分
                        const baseScore = 150; // 核弹基础分数更高
                        const distanceFactor = Math.max(0.3, 1 - distance / explosionRadius);
                        const scoreGain = Math.floor(baseScore * distanceFactor);
                        this.score += scoreGain;
                      
                        console.log(`☢️ 核弹击杀：${enemyName}，距离${distance.toFixed(2)}，得分${scoreGain}`);
                      
                        // 🆕 敌人消失特效
                        this.createEnemyVaporizeEffect(enemy);
                      
                        enemy.destroy();
                    }
                }
            }
          
            const remainingEnemies = this.enemies.getChildren().filter(e => e.active).length;
            console.log(`☢️ 核弹爆炸完成：击杀${killedEnemies}/${totalEnemies}个敌人，剩余${remainingEnemies}个敌人`);
          
            // UI更新通过主循环自动处理
        });
    }
    
    // 🔧 修复导弹爆炸效果（也增强一下）
    executeMissileExplosion(bullet, hitEnemy) {
        const weapon = this.weapons.find(w => w.name === '导弹');
      
        // 🔧 修复爆炸中心坐标计算
        const explosionCenter = hitEnemy ? 
            { x: hitEnemy.x, y: hitEnemy.y } : 
            { x: bullet.x, y: bullet.y };
      
        const explosionRadius = (weapon && weapon.config && weapon.config.damageRadius) ? 
            weapon.config.damageRadius : 200;
      
        console.log(`💥 导弹爆炸：中心(${explosionCenter.x}, ${explosionCenter.y})，半径${explosionRadius}`);
      
        let killedEnemies = 0;
        const enemies = this.enemies.getChildren();
      
        for (let enemy of enemies) {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(
                    explosionCenter.x, explosionCenter.y, 
                    enemy.x, enemy.y
                );
              
                if (distance <= explosionRadius) {
                    killedEnemies++;
                    this.killCount++;
                    const baseScore = weapon ? weapon.damage : 60;
                    const distanceFactor = Math.max(0.5, 1 - distance / explosionRadius);
                    const scoreGain = Math.floor(baseScore * distanceFactor);
                    this.score += scoreGain;
                  
                                        // 💀 死亡视觉效果
                    this.createDeathEffect(enemy.x, enemy.y);
                    enemy.destroy();
                }
            }
        }
      
        // 🆕 增强导弹爆炸特效
        this.createMissileExplosionEffect(explosionCenter);
        // UI更新通过主循环自动处理
        // 爆炸击杀的敌人也可能掉落道具
        for (let enemy of enemies) {
            if (enemy.active && distance <= explosionRadius) {
                const enemyType = enemy.enemyData ? enemy.enemyData.name : '小兵';
                if (Math.random() < 0.3) {
                    if (this.powerUpManager) this.powerUpManager.spawnPowerUp(enemy.x, enemy.y, enemyType);
                }
                enemy.destroy();
            }
        }
    }

    // 🆕 增强导弹爆炸特效
    createMissileExplosionEffect(center) {
        // 爆炸火球
        const fireball = this.add.circle(center.x, center.y, 10, 0xff4400, 0.8)
            .setDepth(400);
      
        this.tweens.add({
            targets: fireball,
            scaleX: 6,
            scaleY: 6,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => fireball.destroy()
        });
      
        // 爆炸冲击波
        const shockwave = this.add.graphics().setDepth(399);
        this.tweens.add({
            targets: shockwave,
            duration: 600,
            onUpdate: (tween) => {
                const progress = tween.progress;
                const radius = progress * 250;
                const alpha = 1 - progress;
              
                shockwave.clear();
                shockwave.lineStyle(4, 0xff6600, alpha);
                shockwave.strokeCircle(center.x, center.y, radius);
            },
            onComplete: () => shockwave.destroy()
        });
      
        // 屏幕震动
        this.cameras.main.shake(300, 0.02);
      
        // 爆炸视觉效果
        this.createExplosionEffect(center.x, center.y);
    }
    
    // 🆕 声波持续效果
    executeTeslaBeam(bullet) {
        // 声波持续2秒
        this.time.delayedCall(this.currentWeapon.duration, () => {
            if (bullet && bullet.active) {
                bullet.kill(); // 🔧 使用kill()回收子弹到对象池
            }
        }, null, this);
    }

    // 🆕 创建核弹爆炸全屏特效
    createNuclearExplosionEffects(explosionCenter) {
        console.log('🎆 开始核弹全屏特效');
      
        // 1. 🆕 全屏白光闪烁
        const flashOverlay = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.9)
            .setDepth(999);
      
        this.tweens.add({
            targets: flashOverlay,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => flashOverlay.destroy()
        });
      
        // 2. 🆕 核爆冲击波环
        const shockwaveRings = [];
        for (let i = 0; i < 3; i++) {
            const ring = this.add.graphics()
                .setDepth(500);
          
            this.time.delayedCall(i * 100, () => {
                this.tweens.add({
                    targets: ring,
                    duration: 1000,
                    ease: 'Power2',
                    onUpdate: (tween) => {
                        const progress = tween.progress;
                        const radius = progress * 600;
                        const alpha = 1 - progress;
                      
                        ring.clear();
                        ring.lineStyle(8, 0xff6600, alpha);
                        ring.strokeCircle(explosionCenter.x, explosionCenter.y, radius);
                    },
                    onComplete: () => ring.destroy()
                });
            });
          
            shockwaveRings.push(ring);
        }
      
        // 3. 🆕 核爆蘑菇云效果
        this.createMushroomCloudEffect(explosionCenter);
      
        // 4. 🆕 屏幕剧烈震动
        this.cameras.main.shake(1000, 0.05);
      
        // 5. 🆕 全屏放射性粒子
        this.createRadiationParticles(explosionCenter);
      
        // 6. 🆕 音效和时间减慢效果
        this.createNuclearSoundEffect();
        this.createTimeSlowEffect();
    }

    // 🆕 创建蘑菇云效果
    createMushroomCloudEffect(center) {
        // 创建多层蘑菇云
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.circle(
                center.x + Phaser.Math.Between(-50, 50),
                center.y - i * 30,
                20 + i * 10,
                0xff4400,
                0.7
            ).setDepth(400);
          
            // 蘑菇云上升和扩散动画
            this.tweens.add({
                targets: cloud,
                y: cloud.y - 100,
                scaleX: 2 + i * 0.5,
                scaleY: 1.5 + i * 0.3,
                alpha: 0,
                duration: 2000 + i * 200,
                ease: 'Power2',
                onComplete: () => cloud.destroy()
            });
        }
    }

    // 🆕 创建放射性粒子效果
    createRadiationParticles(center) {
        // 创建简单的放射性效果（不使用过时的粒子系统）
        const effect = this.add.graphics();
        effect.fillStyle(0xff0000, 0.6);
        effect.fillCircle(center.x, center.y, 50);
        effect.setDepth(600);
        
        // 放射性扩散动画
        this.tweens.add({
            targets: effect,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    // 🆕 创建敌人蒸发效果
    createEnemyVaporizeEffect(enemy) {
        // 创建简单的蒸发效果（不使用过时的粒子系统）
        const effect = this.add.graphics();
        effect.fillStyle(0x00ff00, 0.8);
        effect.fillCircle(enemy.x, enemy.y, 30);
        effect.setDepth(10);
        
        // 蒸发扩散动画
        this.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    // 🆕 创建核弹音效
    createNuclearSoundEffect() {
        // 模拟音效（如果有音频资源可以播放真实音效）
        console.log('🔊 播放核弹爆炸音效');
      
        // 可以在这里添加真实音效播放
        // this.sound.play('nuclearExplosion');
    }

    // 🆕 创建时间减慢效果
    createTimeSlowEffect() {
        // 短暂减慢游戏时间
        this.physics.world.timeScale = 0.3;
        this.time.timeScale = 0.3;
      
        this.time.delayedCall(500, () => {
            this.physics.world.timeScale = 1;
            this.time.timeScale = 1;
            console.log('⏰ 时间流速恢复正常');
        });
      
        console.log('⏰ 时间减慢效果启动');
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
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
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
        }).setOrigin(0.5).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
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
            console.log('MainScene: 重新开始游戏');
            
            // 🆕 清理游戏结束界面UI
            if (this.gameOverUI) {
                if (this.gameOverUI.background) this.gameOverUI.background.destroy();
                if (this.gameOverUI.restartButton) this.gameOverUI.restartButton.destroy();
                if (this.gameOverUI.restartText) this.gameOverUI.restartText.destroy();
                this.gameOverUI = null;
            }
            
            // 🆕 确保场景恢复运行状态
            if (this.scene.isPaused()) {
                this.scene.resume();
            }
            
            // 🆕 重置游戏状态
            this.isGameOver = false;
            this.isLevelCompleted = false;
            
            // 🆕 延迟一帧后重新开始场景，确保状态完全重置
            this.time.delayedCall(100, () => {
                console.log('🔄 执行场景重启');
                this.scene.restart({ 
                    player: this.selectedPlayer, 
                    level: this.currentLevelIndex 
                });
            });
        }
    }
    
    // 🆕 检查关卡完成条件
    checkLevelComplete() {
        if (this.isGameOver || this.isLevelCompleted) return;

        // 只检查BOSS是否被击败
        if (this.bossDefeated) {
            this.completeLevel('击败关卡BOSS');
        }
    }
    
    // 🆕 完成关卡
    completeLevel(reason) {
        if (this.isLevelCompleted) return;
      
        this.isLevelCompleted = true;
        console.log(`MainScene: 关卡 ${this.currentLevel.name} 完成！原因: ${reason}`);
      
        this.levelEndTime = this.time.now;
        this.levelComplete = true;
        
        // 🆕 横版卷轴：BOSS战时锁定摄像机
        if (reason.includes('BOSS') || reason.includes('终点')) {
            this.cameras.main.stopFollow();
            console.log('🔒 摄像机已锁定，BOSS战开始');
        }
      
        // 停止敌人生成
        if (this.enemySpawner) {
            this.enemySpawner.remove();
            this.enemySpawner = null;
        }
      
        // 清除所有敌人和子弹
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
      
        // 💾 保存游戏数据
        if (SaveManager) {
            SaveManager.saveAll();
        }
      
        // 显示关卡完成界面
        this.showLevelCompleteScreen(reason);
    }
    
    // 🆕 下一关
    nextLevel() {
        console.log('MainScene: 进入下一关');
        
        const nextLevelIndex = this.currentLevelIndex + 1;
        if (nextLevelIndex < LEVELS_CONFIG.length) {
            // 如果场景被暂停，先恢复
            if (this.scene.isPaused()) {
                this.scene.resume();
            }
            
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
        // 从LEVELS_CONFIG加载关卡配置
        if (this.currentLevelIndex >= 0 && this.currentLevelIndex < LEVELS_CONFIG.length) {
            this.currentLevel = LEVELS_CONFIG[this.currentLevelIndex];
            console.log(`🎵 加载关卡 ${this.currentLevelIndex + 1}: ${this.currentLevel.name}`);
            
            // 🆕 播放背景音乐
            if (this.currentLevel.music) {
                AudioManager.playBackgroundMusic(this.currentLevel.music);
            }
        } else {
            // 使用默认关卡配置
            this.currentLevel = {
                name: '横版卷轴测试关卡',
                description: '测试横版卷轴机制',
                levelDuration: 120000, // 2分钟
                targetKills: 30,
                spawnRate: 2000,
                maxEnemies: 10,
                environmentEffects: [],
                music: 'city_theme'
            };
            
            // 🆕 播放默认背景音乐
            AudioManager.playBackgroundMusic('city_theme');
        }
    }

    // 🆕 显示关卡开场动画
    showLevelIntro() {
        console.log('MainScene: 显示关卡介绍:', this.currentLevel.name);
        
        // 创建关卡介绍背景（确保在最顶层）
        const introBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9)
            .setDepth(1000).setScrollFactor(0); // 设置最高深度并固定显示
      
        // 关卡名称
        const levelTitle = this.add.text(640, 280, this.currentLevel.name, {
            font: '72px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(1001).setScrollFactor(0);
      
        // 关卡描述
        const levelDesc = this.add.text(640, 360, this.currentLevel.description, {
            font: '24px Arial',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0).setDepth(1001).setScrollFactor(0);
      
        // 关卡目标
        const targetText = `目标: 到达终点并击败关卡BOSS`;
        const levelTarget = this.add.text(640, 420, targetText, {
            font: '18px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setAlpha(0).setDepth(1001).setScrollFactor(0);
      
        // 开始提示
        const startHint = this.add.text(640, 480, '3秒后开始...', {
            font: '20px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0).setDepth(1001).setScrollFactor(0);
      
        // 倒计时显示
        let countdown = 3;
        const countdownText = this.add.text(640, 520, `${countdown}`, {
            font: '36px Arial',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0).setDepth(1001).setScrollFactor(0);
      
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
                    
                    // 🆕 启动敌人生成器
                    this.startEnemySpawner();
                    
                    // 🆕 启动关卡敌人生成器
                    this.startLevelEnemySpawner();
                }
            });
        });
    }

    initLevelSystem() {
        this.gameStartTime = this.time.now;
        this.killCount = 0;
        this.levelCompleteTime = this.currentLevel.levelDuration;
        this.levelCompleteKills = this.currentLevel.targetKills;
        this.levelEndTime = null;
        this.levelComplete = false;
        this.isLevelCompleted = false;
        this.enemySpawnRate = this.currentLevel.spawnRate;
        this.maxEnemies = this.currentLevel.maxEnemies;
        this.currentEnemyCount = 0;
        this.bossDefeated = false; // 🆕 初始化BOSS击败状态
        this.bossSpawned = false; // 🆕 初始化BOSS生成状态
        this.bossTriggerDistance = 3500; // 🆕 BOSS触发距离（距离关底500像素）
    }

    createLevelBackground() {
        // 简化的横版卷轴背景 - 淡色半透明效果
        const graphics = this.add.graphics();
      
        // 天空渐变 - 淡色半透明
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xF0F8FF, 0xF0F8FF, 0.3); // 透明度0.3
        graphics.fillRect(0, 0, 4000, 400);
      
        // 地面 - 淡色半透明
        graphics.fillStyle(0x228B22, 0.4); // 透明度0.4
        graphics.fillRect(0, 400, 4000, 320);
      
        graphics.setDepth(-100);
        graphics.setScrollFactor(0.3); // 背景视差效果
      
        console.log('🌄 横版卷轴淡色半透明背景创建完成');
    }

    // 🎨 创建像素艺术背景 - 淡色半透明效果
    createPixelArtBackground() {
        // 根据关卡索引选择主题
        const levelIndex = this.currentLevelIndex + 1;
        const theme = LEVEL_THEMES[levelIndex] || LEVEL_THEMES[1];
        
        // 创建背景图形
        const graphics = this.add.graphics();
        
        // 分层渐变天空背景（Phaser兼容）- 淡色半透明
        const gradientHeight = 400;
        const colorCount = theme.bgColors.length;
        const segmentHeight = gradientHeight / (colorCount - 1);
        
        for (let i = 0; i < colorCount - 1; i++) {
            const startY = i * segmentHeight;
            const endY = (i + 1) * segmentHeight;
            const startColor = this.hexToRgb(theme.bgColors[i]);
            const endColor = this.hexToRgb(theme.bgColors[i + 1]);
            
            // 创建渐变效果 - 淡色半透明
            for (let y = startY; y < endY; y++) {
                const ratio = (y - startY) / segmentHeight;
                const color = this.interpolateColor(startColor, endColor, ratio);
                graphics.fillStyle(color, 0.3); // 透明度0.3
                graphics.fillRect(0, y, 4000, 1);
            }
        }
        
        // 视差背景层 - 淡色半透明
        this.createParallaxLayers(graphics, theme);
        
        // 地面 - 淡色半透明
        graphics.fillStyle(this.hexToRgb(theme.groundColor), 0.4); // 透明度0.4
        graphics.fillRect(0, 400, 4000, 320);
        
        graphics.setDepth(-100);
    }

    // 🎨 颜色转换和插值函数
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    interpolateColor(color1, color2, ratio) {
        const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
        const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
        const b = Math.round(color1.b + (color2.b - color1.b) * ratio);
        return (r << 16) | (g << 8) | b;
    }

    // �� 创建视差背景层 - 淡色半透明效果
    createParallaxLayers(graphics, theme) {
        // 远景层 - 淡色半透明
        graphics.fillStyle(0x222222, 0.2); // 透明度0.2
        for (let i = 0; i < 20; i++) {
            const x = i * 200;
            graphics.fillRect(x, 300, 60, 100);
        }
        
        // 中景层 - 淡色半透明
        graphics.fillStyle(0x444444, 0.3); // 透明度0.3
        for (let i = 0; i < 33; i++) {
            const x = i * 120;
            graphics.fillRect(x, 350, 40, 50);
        }
        
        // 近景层 - 淡色半透明
        graphics.fillStyle(0x666666, 0.4); // 透明度0.4
        for (let i = 0; i < 50; i++) {
            const x = i * 80;
            graphics.fillRect(x, 380, 20, 20);
        }
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

    // 🆕 创建关卡对应的玩家（横版卷轴版本）
    createLevelPlayer() {
        // 🎨 使用像素艺术角色纹理
        let characterType = 'warrior';
        
        if (this.selectedPlayer && this.selectedPlayer.key) {
            const characterMap = {
                'soldier': 'warrior', 
                'diver': 'mage',
                'tank': 'tank',
                'spaceship': 'assassin'
            };
            characterType = characterMap[this.selectedPlayer.key] || 'warrior';
        }
        
        const playerTexture = `${characterType}_0`;
        this.playerSpeed = (this.selectedPlayer && this.selectedPlayer.speed) || 400;
        this.playerSize = 40;
        
        // 🆕 横版卷轴：玩家在世界坐标中的起始位置
        this.player = this.physics.add.sprite(100, 360, playerTexture)
            .setCollideWorldBounds(false) // 🆕 移除世界边界限制，避免卡住
            .setDisplaySize(this.playerSize, this.playerSize);
      
        this.player.playerSpeed = this.playerSpeed;
        this.player.isInvincible = false;
        this.player.characterType = characterType;
        this.player.animationFrame = 0;
        
        // 🎨 设置角色动画
        this.player.animationTimer = this.time.addEvent({
            delay: 200,
            callback: this.updatePlayerAnimation,
            callbackScope: this,
            loop: true
        });
        
        // 🆕 横版卷轴：设置摄像机跟随玩家
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1); // 平滑跟随
        this.cameras.main.setDeadzone(200, 100); // 死区设置
  
        console.log('🎮 横版卷轴玩家创建完成，类型:', characterType);
    }

    startLevelEnemySpawner() {
        this.enemySpawner = this.time.addEvent({
            delay: this.enemySpawnRate,
            callback: this.spawnLevelEnemy,
            callbackScope: this,
            loop: true
        });
    }

    // 🎨 更新玩家动画
    updatePlayerAnimation() {
        if (!this.player || !this.player.active) return;
        
        this.player.animationFrame = (this.player.animationFrame + 1) % 4;
        const newTexture = `${this.player.characterType}_${this.player.animationFrame}`;
        
        if (this.textures.exists(newTexture)) {
            this.player.setTexture(newTexture);
        }
    }

    // 🎨 更新敌人动画
    updateEnemyAnimation(enemy) {
        if (!enemy || !enemy.active) return;
        
        enemy.animationFrame = (enemy.animationFrame + 1) % 4;
        const newTexture = `${enemy.pixelType}_${enemy.animationFrame}`;
        
        if (this.textures.exists(newTexture)) {
            enemy.setTexture(newTexture);
        }
    }

    // 🆕 生成关卡敌人
    spawnLevelEnemy() {
        if (this.isGameOver || this.currentEnemyCount >= this.maxEnemies) return;
      
        // 🆕 检查是否应该触发BOSS
        if (!this.bossSpawned && this.player && this.player.x >= this.bossTriggerDistance) {
            this.spawnBoss();
            return;
        }
      
        // 从关卡配置中选择敌人类型（排除BOSS）
        const enemyConfig = this.selectEnemyType();
        if (!enemyConfig) return;
      
        const y = Phaser.Math.Between(50, 670);
        // 🆕 横版卷轴：在摄像机右侧生成敌人
        const spawnX = this.cameras.main.scrollX + 900;
      
        // 从对象池获取敌人
        const enemy = this.enemies.get();
        if (enemy) {
            // 使用配置激活敌人
            enemy.spawn(spawnX, y, enemyConfig);
            this.currentEnemyCount++;
            
            console.log(`MainScene: 横版卷轴敌人生成成功，类型: ${enemyConfig.name}，位置: (${enemy.x}, ${enemy.y})，当前敌人数量: ${this.currentEnemyCount}/${this.maxEnemies}`);
        } else {
            console.error('MainScene: 无法从对象池获取敌人对象');
        }
    }

    // 🆕 根据权重选择敌人类型（排除BOSS）
    selectEnemyType() {
        const enemies = this.currentLevel.enemies;
        // 过滤掉BOSS敌人
        const normalEnemies = enemies.filter(enemy => !enemy.isBoss);
        
        if (normalEnemies.length === 0) return null;
        
        let totalWeight = normalEnemies.reduce((sum, enemy) => sum + enemy.weight, 0);
        let random = Math.random() * totalWeight;
      
        for (let enemy of normalEnemies) {
            random -= enemy.weight;
            if (random <= 0) {
                return enemy;
            }
        }
      
        return normalEnemies[0]; // 备用
    }

    // 🆕 处理敌人子弹击中玩家
    handleEnemyBulletHit(player, bullet) {
        if (player.isInvincible) return;
      
        // 🆕 详细的中文击中信息
        const bulletPos = `(${bullet.x.toFixed(0)}, ${bullet.y.toFixed(0)})`;
        const playerPos = `(${player.x.toFixed(0)}, ${player.y.toFixed(0)})`;
        const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, player.x, player.y);
        
        console.log(`🎯 敌人子弹击中玩家: 子弹位置: ${bulletPos} | 玩家位置: ${playerPos} | 距离: ${distance.toFixed(1)} | 伤害: ${bullet.damage || 15}`);
      
        bullet.kill(); // 使用kill()回收对象池，而不是destroy()
      
        // 子弹伤害
        const bulletDamage = bullet.damage || 15;
        const oldHealth = this.currentHealth;
        this.currentHealth -= bulletDamage;
      
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
      
        console.log(`💥 玩家受伤: 血量: ${oldHealth} → ${this.currentHealth} | 伤害: ${bulletDamage} | 剩余血量: ${this.currentHealth}/${this.maxHealth}`);
      
        // 显示受伤效果
        this.showDamageEffect(bulletDamage, 'bullet');
      
        // UI更新通过主循环自动处理
      
        // 设置无敌状态
        player.isInvincible = true;
        player.setTint(0xff0000);
        this.time.delayedCall(this.invincibilityTime, () => {
            if (player && player.active) {
                player.isInvincible = false;
                player.clearTint();
                console.log(`🛡️ 玩家无敌状态结束`);
            }
        });
      
        if (this.currentHealth <= 0) {
            console.log(`💀 玩家死亡: 血量耗尽`);
            this.gameOver();
        }
    }

    // 🔧 新增敌人死亡处理方法
    handleEnemyDeath(deathData) {
        console.log(`MainScene: 敌人死亡事件 - ${deathData.enemyName}, 得分: ${deathData.score}, 击杀方式: ${deathData.killedBy}`);
      
        // 增加分数和击杀数
        this.score += deathData.score;
        this.killCount++;
        this.currentEnemyCount--;
      
        // 📊 记录统计
        if (StatsManager) {
            StatsManager.addKill();
            StatsManager.addScore(deathData.score);
        }
        
        // 🏆 检查成就
        if (AchievementManager) {
            AchievementManager.checkAchievements();
        }
        
        // 创建死亡效果
        if (deathData.enemy) {
            this.createDeathEffect(deathData.enemy.x, deathData.enemy.y);
        }
        
        // 普通武器击杀时尝试掉落道具
        if (deathData.weaponType && deathData.weaponType !== '导弹' && deathData.weaponType !== '核弹') {
            if (deathData.enemy && this.powerUpManager) {
                const enemyType = deathData.enemy.enemyData ? deathData.enemy.enemyData.name : '小兵';
                this.powerUpManager.spawnPowerUp(deathData.enemy.x, deathData.enemy.y, enemyType);
            }
        }
        
        // 敌人对象已通过recycle()方法回收到对象池
        // 不需要手动销毁
      
        // UI更新通过主循环自动处理
      
        // 检查关卡完成
        // this.checkLevelComplete();
        // 健壮BOSS判定
        if (this.isBossEnemy(deathData)) {
            this.bossDefeated = true; // 🆕 设置BOSS击败标志
            console.log('🎉 BOSS已被击败！');
        }
        console.log(`MainScene: 敌人死亡处理完成 - 击杀数: ${this.killCount}/${this.levelCompleteKills}, 当前分数: ${this.score}`);
    }
  
    // 🔧 修改敌人逃脱处理
    handleEnemyEscape(escapeData) {
        // 确保escapeData存在且有有效数据
        if (!escapeData) {
            console.warn('MainScene: 敌人逃脱事件数据为空');
            return;
        }
        
        const enemyName = escapeData.enemyName || '未知敌人';
        const damage = escapeData.damage || 10; // 默认扣血10点
        
        console.log(`MainScene: 敌人逃脱事件 - ${enemyName}`);
      
        // 扣除血量
        this.currentHealth -= damage;
      
        // 确保血量不低于0
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
      
        console.log(`MainScene: 敌人逃脱扣血 ${damage}，当前血量: ${this.currentHealth}/${this.maxHealth}`);
      
        // 减少敌人计数
        this.currentEnemyCount--;
      
        // 视觉反馈效果
        this.showDamageEffect(damage, 'escape');
      
        // UI更新通过主循环自动处理
      
        // 检查游戏是否结束
        if (this.currentHealth <= 0) {
            this.gameOver();
        }
    }
  


    // 🆕 修改关卡完成检查
    // 🆕 关卡完成检查（横版卷轴版本）
    checkLevelComplete() {
        if (this.isGameOver || this.isLevelCompleted) return;
      
        const currentTime = this.time.now;
        const survivalTime = currentTime - this.gameStartTime;
      
        // 🆕 检查BOSS是否被击败（唯一过关条件）
        if (this.bossDefeated) {
            this.completeLevel(`击败关卡BOSS`);
            return;
        }
      
        // 🆕 横版卷轴：检查距离条件 - 到达世界右边界（备用条件）
        if (this.player && this.player.x >= 3800) { // 接近4000像素时触发
            this.completeLevel(`到达关卡终点`);
            return;
        }
      
        // 🆕 移除击杀数和生存时间条件，只保留BOSS击败作为主要过关条件
        // 检查生存时间条件（备用条件）
        if (survivalTime >= this.levelCompleteTime) {
            this.completeLevel(`生存时间达到${this.levelCompleteTime/1000}秒`);
            return;
        }
      
        // 🆕 注释掉击杀数条件，确保只有击败BOSS才能过关
        // if (this.killCount >= this.levelCompleteKills) {
        //     this.completeLevel(`击杀${this.levelCompleteKills}个敌人`);
        //     return;
        // }
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
        const completeBg = this.add.rectangle(640, 360, 600, 400, 0x000000, 0.9).setScrollFactor(0);
      
        this.add.text(640, 240, '🎉 关卡完成！🎉', {
            font: '48px Arial',
            fill: '#00ff00',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.add.text(640, 300, `${this.currentLevel.name}`, {
            font: '32px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.add.text(640, 340, `完成条件: ${reason}`, {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);
      
        // 🆕 如果击败了BOSS，额外显示
        if (this.bossDefeated) {
            this.add.text(640, 370, '已经击败关卡BOSS', {
                font: '22px Arial',
                fill: '#ff4444',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0);
        }
      
        this.add.text(640, 380, `最终分数: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.add.text(640, 420, `击杀数: ${this.killCount}`, {
            font: '20px Arial',
            fill: '#cccccc'
        }).setOrigin(0.5).setScrollFactor(0);
      
        // 按键提示
        this.add.text(640, 480, '🏆 横版卷轴测试完成！🏆', {
                font: '24px Arial',
                fill: '#ffd700'
        }).setOrigin(0.5).setScrollFactor(0);
      
        this.add.text(640, 520, '按 R 重新开始本关', {
            font: '16px Arial',
            fill: '#cccccc'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // 注意：R键监听器已在create()方法中设置，这里不需要重复添加
    }

    // 🔧 在场景销毁时清理事件监听器
    destroy() {
        // 🆕 清理游戏结束界面UI
        if (this.gameOverUI) {
            if (this.gameOverUI.background) this.gameOverUI.background.destroy();
            if (this.gameOverUI.restartButton) this.gameOverUI.restartButton.destroy();
            if (this.gameOverUI.restartText) this.gameOverUI.restartText.destroy();
            this.gameOverUI = null;
        }
        
        // 清理触摸控制
        if (this.touchControls) {
            this.touchControls.destroy();
        }
        
        // 🎨 清理像素艺术动画定时器
        if (this.player && this.player.animationTimer) {
            this.player.animationTimer.destroy();
        }
        
        // 🔊 停止背景音乐（单例模式）
        AudioManager.stopBackgroundMusic();
        
        // 🕐 清理所有定时器
        if (this.enemySpawner) {
            this.enemySpawner.destroy();
        }
        
        // 💥 清理所有粒子系统
        // 清理视觉效果系统
        this.effectsEnabled = false;
        
        // 🎁 清理道具管理器
        if (this.powerUpManager) {
            this.powerUpManager.destroy();
        }
        
        // 🏗️ 清理障碍物管理器
        if (this.obstacleManager) {
            this.obstacleManager.destroy();
        }
        
        // 📊 清理UI管理器
        if (this.uiManager) {
            this.uiManager.destroy();
        }
        
        // 🎨 清理背景管理器
        if (this.backgroundManager) {
            this.backgroundManager.destroy();
        }
        
        // 📊 统计系统由SaveManager统一管理
        
        // 💾 保存游戏数据
        if (SaveManager) {
            SaveManager.saveAll();
        }
        
        // 清理自定义事件监听器
        this.events.off('enemyDied', this.handleEnemyDeath, this);
        this.events.off('enemyEscaped', this.handleEnemyEscape, this);
        
        // 清理键盘事件监听器
        this.input.keyboard.off('keydown-R', this.handleRestart, this);
        this.input.keyboard.off('keydown-N', this.nextLevel, this);
        
        // 清理其他事件监听器
        this.input.keyboard.off('keydown-SPACE', this.shoot, this);
        this.input.keyboard.off('keydown-P', this.togglePause, this);
        this.input.keyboard.off('keydown-ONE', () => this.switchWeapon(0), this);
        this.input.keyboard.off('keydown-TWO', () => this.switchWeapon(1), this);
        this.input.keyboard.off('keydown-THREE', () => this.switchWeapon(2), this);
        this.input.keyboard.off('keydown-FOUR', () => this.switchWeapon(3), this);
        this.input.keyboard.off('keydown-FIVE', () => this.switchWeapon(4), this);
        this.input.keyboard.off('keydown-SIX', () => this.switchWeapon(5), this);
        
        super.destroy();
    }

    // 环境效果方法（占位符）
    createSandstormEffect() {
        // 沙尘暴效果实现
        console.log('MainScene: 创建沙尘暴效果');
    }

    createFogEffect() {
        // 迷雾效果实现
        console.log('MainScene: 创建迷雾效果');
    }

    // 🎨 添加缺失的辅助绘制方法
    drawCloud(graphics, cloudX, cloudY, cloudSize) {
        // 绘制云朵的具体实现
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * cloudSize;
            const offsetY = (Math.random() - 0.5) * cloudSize * 0.5;
            graphics.fillCircle(cloudX + offsetX, cloudY + offsetY, cloudSize * 0.3);
        }
    }

    drawHexagon(graphics, x, y, size) {
        graphics.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = x + Math.cos(angle) * size;
            const hy = y + Math.sin(angle) * size;
            if (i === 0) graphics.moveTo(hx, hy);
            else graphics.lineTo(hx, hy);
        }
        graphics.closePath();
        graphics.strokePath();
    }

    fillHexagon(graphics, x, y, size) {
        graphics.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = x + Math.cos(angle) * size;
            const hy = y + Math.sin(angle) * size;
            if (i === 0) graphics.moveTo(hx, hy);
            else graphics.lineTo(hx, hy);
        }
        graphics.closePath();
        graphics.fillPath();
    }

    createBubblesEffect() {
        // 气泡效果实现
        console.log('MainScene: 创建气泡效果');
    }

    createStarsEffect() {
        // 星空效果实现
        console.log('MainScene: 创建星空效果');
    }

    collectPowerUp(player, powerUp) {
        if (powerUp.collect) {
            powerUp.collect();
        }
    }



    switchLevel(levelType) {
        console.log(`🌍 切换到 ${levelType} 关卡`);
        
        // 🆕 更新障碍物系统关卡
        if (this.obstacleManager) {
            this.obstacleManager.setLevel(levelType);
            // 🆕 临时禁用障碍物生成
            // this.obstacleManager.spawnObstacles();
        }
        
        // ... 其他关卡切换逻辑 ...
    }
    
    // 🪨 设置障碍物碰撞检测
    setupObstacleCollisions() {
        // 等待障碍物管理器初始化完成后再设置碰撞
        this.time.delayedCall(100, () => {
            if (this.obstacleManager && this.obstacleManager.obstacles) {
                // 玩家与障碍物碰撞
                this.physics.add.collider(
                    this.player, 
                    this.obstacleManager.obstacles, 
                    this.handlePlayerObstacleCollision, 
                    null, 
                    this
                );
                
                // 敌人与障碍物碰撞
                if (this.enemies) {
                    this.physics.add.collider(
                        this.enemies, 
                        this.obstacleManager.obstacles, 
                        this.handleEnemyObstacleCollision, 
                        null, 
                        this
                    );
                }
                
                // 玩家子弹与障碍物碰撞
                if (this.bullets) {
                    this.physics.add.overlap(
                        this.bullets, 
                        this.obstacleManager.obstacles, 
                        this.handleBulletObstacleCollision, 
                        null, 
                        this
                    );
                }
                
                // 敌人子弹与障碍物碰撞
                if (this.enemyBullets) {
                    this.physics.add.overlap(
                        this.enemyBullets, 
                        this.obstacleManager.obstacles, 
                        this.handleEnemyBulletObstacleCollision, 
                        null, 
                        this
                    );
                }
                
                console.log('🪨 障碍物碰撞检测设置完成');
            }
        });
    }
    
    // 👤 处理玩家与障碍物碰撞
    handlePlayerObstacleCollision(player, obstacle) {
        if (!obstacle.isDestructible) {
            // 不可摧毁的障碍物，阻止玩家移动
            const playerBody = player.body;
            const obstacleBody = obstacle.body;
          
            // 简单的碰撞响应
            if (playerBody.x < obstacleBody.x) {
                playerBody.x = obstacleBody.x - playerBody.width;
            } else if (playerBody.x > obstacleBody.x) {
                playerBody.x = obstacleBody.x + obstacleBody.width;
            }
        }
    }
    
    // 👾 处理敌人与障碍物碰撞
    handleEnemyObstacleCollision(enemy, obstacle) {
        if (!obstacle.isDestructible) {
            // 敌人遇到不可摧毁的障碍物时，触发智能避障
            enemy.triggerObstacleAvoidance(obstacle);
        }
    }
    
    // 🔫 处理子弹与障碍物碰撞
    handleBulletObstacleCollision(bullet, obstacle) {
        if (!obstacle.isDestructible) {
            // 不可摧毁的障碍物，只销毁子弹
            bullet.destroy();
            return;
        }
      
        // 可摧毁的障碍物
        const damage = bullet.damage || 10;
        const weaponType = bullet.weaponType || 'bullet';
      
        // 对障碍物造成伤害
        const destroyed = obstacle.takeDamage(damage, weaponType, bullet.owner);
      
        // 创建击中特效
        this.createObstacleHitEffect(bullet.x, bullet.y, weaponType);
      
        // 销毁子弹
        bullet.destroy();
      
        if (destroyed) {
            console.log(`💥 障碍物被摧毁: ${obstacle.name}`);
            // 通知障碍物管理器
            if (this.obstacleManager) {
                this.obstacleManager.onObstacleDestroyed(obstacle);
            }
            // 显示摧毁通知
            this.showObstacleDestructionNotification(obstacle.name);
        }
    }
    
    // 🔫 处理敌人子弹与障碍物碰撞
    handleEnemyBulletObstacleCollision(bullet, obstacle) {
        // 敌人子弹通常不摧毁障碍物，只销毁子弹
        bullet.destroy();
    }
    
    // 💥 创建障碍物击中特效
    createObstacleHitEffect(x, y, weaponType) {
        // 根据武器类型创建不同的击中特效
        let effectColor = 0xff6666;
        let effectSize = 15;
      
        switch (weaponType) {
            case 'laser':
                effectColor = 0x00ffff;
                effectSize = 20;
                break;
            case 'missile':
                effectColor = 0xffaa00;
                effectSize = 25;
                break;
            case 'nuke':
                effectColor = 0xff0000;
                effectSize = 30;
                break;
            default:
                effectColor = 0xff6666;
                effectSize = 15;
        }
      
        // 创建击中效果（不使用过时的粒子系统）
        const effect = this.add.graphics();
        effect.fillStyle(effectColor, 0.8);
        effect.fillCircle(x, y, effectSize);
        effect.setDepth(10);
        
        // 爆炸动画
        this.tweens.add({
            targets: effect,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    // 📢 显示障碍物摧毁通知
    showObstacleDestructionNotification(obstacleName) {
        // 创建通知文本
        const notification = this.add.text(
            this.cameras.main.centerX,
            100,
            `💥 ${obstacleName} 被摧毁！`,
            {
                fontSize: '20px',
                fill: '#ffaa00',
                stroke: '#000000',
                strokeThickness: 3,
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        notification.setOrigin(0.5);
        notification.setDepth(1000);
        notification.setScrollFactor(0); // 固定显示
      
        // 动画效果
        this.tweens.add({
            targets: notification,
            y: notification.y - 50,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy();
            }
        });
    }

    // 健壮的BOSS判定
    isBossEnemy(deathData) {
        // 1. 名称判定（不区分大小写）
        if (deathData.enemyName && deathData.enemyName.toLowerCase().includes('boss')) return true;
        // 2. sprite判定
        if (deathData.enemy && deathData.enemy.enemyConfig && deathData.enemy.enemyConfig.sprite === 'boss') return true;
        // 3. AI类型判定
        if (deathData.enemy && deathData.enemy.enemyConfig && deathData.enemy.enemyConfig.ai === 'boss') return true;
        // 4. 特殊标记
        if (deathData.enemy && deathData.enemy.isBoss) return true;
        if (deathData.enemy && deathData.enemy.enemyConfig && deathData.enemy.enemyConfig.isBoss) return true;
        // 5. 血量阈值（可选）
        if (deathData.enemy && deathData.enemy.maxHealth >= 300 && deathData.enemy.score >= 300) return true;
        return false;
    }

    // 🆕 生成BOSS
    spawnBoss() {
        // 找到关卡中的BOSS配置
        const bossConfig = this.currentLevel.enemies.find(enemy => enemy.isBoss);
        if (!bossConfig) {
            console.error('MainScene: 未找到BOSS配置');
            return;
        }
        
        // 清除所有普通敌人，为BOSS战做准备
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && !enemy.isBoss) {
                enemy.kill();
                this.currentEnemyCount--;
            }
        });
        
        // 生成BOSS在关底最右边
        const y = Phaser.Math.Between(200, 520); // BOSS在屏幕中央区域生成
        const spawnX = 3900; // 🆕 BOSS在关底最右边生成（距离右边界100像素）
        
        const boss = this.enemies.get();
        if (boss) {
            // 使用BOSS配置激活敌人
            boss.spawn(spawnX, y, bossConfig);
            boss.isBoss = true; // 标记为BOSS
            this.currentEnemyCount++;
            this.bossSpawned = true; // 标记BOSS已生成
            
            // 显示BOSS出现提示
            this.showBossAppearanceNotification(bossConfig.name);
            
            // 播放BOSS出现音效
            if (AudioManager) {
                AudioManager.play('bossAppear');
            }
            
            console.log(`🎉 BOSS出现！类型: ${bossConfig.name}，位置: (${boss.x}, ${boss.y})`);
        } else {
            console.error('MainScene: 无法从对象池获取BOSS对象');
        }
    }

    // 🆕 显示BOSS出现提示
    showBossAppearanceNotification(bossName) {
        // 创建BOSS出现背景
        const bossBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7)
            .setDepth(999).setScrollFactor(0);
        
        // BOSS出现标题
        const bossTitle = this.add.text(640, 280, '⚠️ BOSS出现！⚠️', {
            font: '48px Arial',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000).setScrollFactor(0);
        
        // BOSS名称
        const bossNameText = this.add.text(640, 340, bossName, {
            font: '36px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1000).setScrollFactor(0);
        
        // 提示文本
        const hintText = this.add.text(640, 400, '击败BOSS才能过关！', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000).setScrollFactor(0);
        
        // 3秒后隐藏提示
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [bossBg, bossTitle, bossNameText, hintText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    bossBg.destroy();
                    bossTitle.destroy();
                    bossNameText.destroy();
                    hintText.destroy();
                }
            });
        });
    }

    // 🆕 创建视觉效果系统 - 使用Graphics替代粒子系统
    createParticleSystems() {
        console.log('✨ 创建Graphics视觉效果系统...');
        
        // 初始化效果标志
        this.effectsEnabled = true;
        
        console.log('✨ Graphics视觉效果系统创建完成');
        
        // 🧪 测试视觉效果系统
        this.time.delayedCall(2000, () => {
            this.createExplosionEffect(400, 300);
            console.log('🧪 测试视觉效果系统...');
        });
    }
    
    // 🆕 创建爆炸视觉效果
    createExplosionEffect(x, y) {
        if (!this.effectsEnabled) return;
        
        // 创建爆炸圆圈
        const explosion = this.add.circle(x, y, 20, 0xff6600, 0.8).setDepth(400);
        
        // 爆炸扩散动画
        this.tweens.add({
            targets: explosion,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
        
        // 创建多个小爆炸点
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            const particle = this.add.circle(particleX, particleY, 3, 0xffff00, 0.9).setDepth(401);
            
            this.tweens.add({
                targets: particle,
                x: particleX + Math.cos(angle) * 50,
                y: particleY + Math.sin(angle) * 50,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    // 🆕 创建射击视觉效果
    createShootEffect(x, y) {
        if (!this.effectsEnabled) return;
        
        // 创建射击闪光
        const flash = this.add.circle(x, y, 8, 0xffff00, 0.8).setDepth(300);
        
        this.tweens.add({
            targets: flash,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }
    
    // 🆕 创建死亡视觉效果
    createDeathEffect(x, y) {
        if (!this.effectsEnabled) return;
        
        // 创建主死亡圆圈 - 增大尺寸
        const death = this.add.circle(x, y, 40, 0xff0000, 0.8).setDepth(200);
        
        this.tweens.add({
            targets: death,
            scaleX: 3.0,
            scaleY: 3.0,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => death.destroy()
        });
        
        // 创建外圈爆炸效果
        const explosion = this.add.circle(x, y, 60, 0xff6600, 0.6).setDepth(199);
        
        this.tweens.add({
            targets: explosion,
            scaleX: 2.5,
            scaleY: 2.5,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
        
        // 创建更多死亡粒子 - 增加数量和大小
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 35;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            const particle = this.add.circle(particleX, particleY, 4, 0xff0000, 0.9).setDepth(201);
            
            this.tweens.add({
                targets: particle,
                x: particleX + Math.cos(angle) * 80,
                y: particleY + Math.sin(angle) * 80,
                alpha: 0,
                duration: 700,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
        
        // 创建额外的闪光效果
        const flash = this.add.circle(x, y, 20, 0xffffff, 0.9).setDepth(202);
        
        this.tweens.add({
            targets: flash,
            scaleX: 4.0,
            scaleY: 4.0,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }
    
    // 🆕 创建受伤视觉效果
    createDamageEffect(x, y) {
        // 创建伤害效果
        const effect = this.add.graphics();
        effect.fillStyle(0xff0000, 0.6);
        effect.fillCircle(x, y, 20);
        effect.setDepth(10);
        
        this.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    // 🆕 切换物理体调试显示
    togglePhysicsDebug() {
        this.showPhysicsBounds = !this.showPhysicsBounds;
        
        if (this.showPhysicsBounds) {
            console.log('🔍 启用物理体调试显示 - 按F1键关闭');
            this.physicsDebugGraphics = this.add.graphics();
            this.physicsDebugGraphics.setDepth(1000);
        } else {
            console.log('🔍 关闭物理体调试显示');
            if (this.physicsDebugGraphics) {
                this.physicsDebugGraphics.destroy();
                this.physicsDebugGraphics = null;
            }
        }
    }
    
    // 🆕 更新物理体调试显示
    updatePhysicsDebug() {
        if (!this.physicsDebugGraphics) return;
        
        this.physicsDebugGraphics.clear();
        
        // 显示玩家物理体 - 绿色
        if (this.player && this.player.body) {
            this.physicsDebugGraphics.lineStyle(3, 0x00ff00, 1);
            this.physicsDebugGraphics.strokeRect(
                this.player.body.x, 
                this.player.body.y, 
                this.player.body.width, 
                this.player.body.height
            );
            // 显示玩家中心点
            this.physicsDebugGraphics.fillStyle(0x00ff00, 1);
            this.physicsDebugGraphics.fillCircle(this.player.x, this.player.y, 3);
        }
        
        // 显示障碍物物理体 - 红色
        if (this.obstacleManager && this.obstacleManager.obstacles) {
            this.obstacleManager.obstacles.getChildren().forEach(obstacle => {
                if (obstacle.active && obstacle.body) {
                    this.physicsDebugGraphics.lineStyle(2, 0xff0000, 1);
                    this.physicsDebugGraphics.strokeRect(
                        obstacle.body.x, 
                        obstacle.body.y, 
                        obstacle.body.width, 
                        obstacle.body.height
                    );
                    // 显示障碍物名称
                    this.physicsDebugGraphics.fillStyle(0xff0000, 1);
                    this.physicsDebugGraphics.fillText(obstacle.name || 'obstacle', obstacle.x, obstacle.y - 20);
                }
            });
        }
        
        // 显示敌人物理体 - 蓝色
        if (this.enemies) {
            this.enemies.getChildren().forEach(enemy => {
                if (enemy.active && enemy.body) {
                    this.physicsDebugGraphics.lineStyle(2, 0x0000ff, 1);
                    this.physicsDebugGraphics.strokeRect(
                        enemy.body.x, 
                        enemy.body.y, 
                        enemy.body.width, 
                        enemy.body.height
                    );
                }
            });
        }
        
        // 显示子弹物理体 - 黄色
        if (this.bullets) {
            this.bullets.getChildren().forEach(bullet => {
                if (bullet.active && bullet.body) {
                    this.physicsDebugGraphics.lineStyle(1, 0xffff00, 1);
                    this.physicsDebugGraphics.strokeRect(
                        bullet.body.x, 
                        bullet.body.y, 
                        bullet.body.width, 
                        bullet.body.height
                    );
                }
            });
        }
        
        // 显示敌人子弹物理体 - 紫色
        if (this.enemyBullets) {
            this.enemyBullets.getChildren().forEach(bullet => {
                if (bullet.active && bullet.body) {
                    this.physicsDebugGraphics.lineStyle(1, 0xff00ff, 1);
                    this.physicsDebugGraphics.strokeRect(
                        bullet.body.x, 
                        bullet.body.y, 
                        bullet.body.width, 
                        bullet.body.height
                    );
                }
            });
        }
        
        // 🆕 显示所有其他物理体 - 橙色（可能包含隐藏的障碍物）
        this.scene.children.entries.forEach(child => {
            if (child.body && child !== this.player && 
                !this.enemies.getChildren().includes(child) &&
                (!this.obstacleManager || !this.obstacleManager.obstacles.getChildren().includes(child)) &&
                (!this.bullets || !this.bullets.getChildren().includes(child)) &&
                (!this.enemyBullets || !this.enemyBullets.getChildren().includes(child))) {
                this.physicsDebugGraphics.lineStyle(1, 0xff8800, 0.5);
                this.physicsDebugGraphics.strokeRect(
                    child.body.x, 
                    child.body.y, 
                    child.body.width, 
                    child.body.height
                );
                // 显示对象类型
                this.physicsDebugGraphics.fillStyle(0xff8800, 1);
                this.physicsDebugGraphics.fillText(child.constructor.name || 'unknown', child.x, child.y - 10);
            }
        });
    }
}

console.log('✅ MainScene.js ES6模块已加载'); 
console.log('✅ MainScene.js ES6模块已加载'); 