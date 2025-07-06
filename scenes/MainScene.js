// scenes/MainScene.js - 关卡系统集成

// 🆕 使用全局变量，因为文件已通过script标签加载
const LEVELS_CONFIG = window.LEVELS_CONFIG;
const Enemy = window.Enemy;
const EnemyBullet = window.EnemyBullet;

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
        
        // 检查是否飞出边界
        const worldView = this.scene.cameras.main.worldView;
        const isOutOfBounds = !worldView.contains(this.x, this.y);
        
        if (isOutOfBounds) {
            console.log(`子弹越界检测：${this.weaponType} 在位置 (${this.x}, ${this.y})，世界视图: (${worldView.x}, ${worldView.y}, ${worldView.width}, ${worldView.height})`);
            
            // 🆕 导弹和核弹在边界爆炸
            if (this.weaponType === '导弹' || this.weaponType === '核弹') {
                this.explodeAtBoundary();
            } else {
                console.log(`普通子弹越界，直接销毁`);
                this.destroy();
            }
        }
    }
    
    // 🆕 在边界爆炸
    explodeAtBoundary() {
        console.log(`边界爆炸触发：${this.weaponType} 在位置 (${this.x}, ${this.y})`);
        
        if (this.weaponType === '导弹') {
            this.scene.executeMissileExplosion(this, { x: this.x, y: this.y });
        } else if (this.weaponType === '核弹') {
            this.scene.executeNuclearStrike(this, { x: this.x, y: this.y });
        }
        
        // 延迟销毁子弹，确保爆炸效果完成
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
}

class MainScene extends Phaser.Scene {
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
      
        // 🎨 初始化像素艺术系统
        this.pixelArtSystem = new PixelArtSystem(this);
        this.pixelArtSystem.initAllTextures();
      
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
  
        // 🆕 横版卷轴：设置扩展的世界边界
        this.physics.world.setBounds(0, 0, 4000, 720);
        
        // 🆕 横版卷轴：设置摄像机边界和跟随系统
        this.cameras.main.setBounds(0, 0, 4000, 720);
  
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
  
        // 🆕 初始化触摸控制系统
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
        
        // 🌍 初始化高级场景系统
        this.advancedSceneManager = new AdvancedSceneManager(this);
        
        // 🌍 初始化场景切换器
        this.sceneSwitcher = new SceneSwitcher(this);
        
        // 🌍 添加场景切换快捷键
        this.sceneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // 🌍 默认加载第一个场景
        this.advancedSceneManager.loadScene('inside_golem');
        
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

        this.powerUpManager = new window.PowerUpManager(this);
        // 玩家与道具碰撞检测
        this.physics.add.overlap(this.player, this.powerUpManager.powerUps, this.collectPowerUp, null, this);

        // 🆕 初始化障碍物系统
        this.obstacleManager = new window.ObstacleManager(this);
        this.obstacleManager.setLevel('forest');
        this.obstacleManager.spawnObstacles();
    }

    // 🆕 初始化武器系统
    initWeaponSystem() {
        // 射击冷却时间初始化
        this.lastShootTime = 0;
        
        // 定义6种武器及其特性（调整颜色以适应偏淡背景）
        this.weapons = [
            // AK47 - 射速快，一次连续三发 (免费无限子弹)
            new Weapon('AK47', 15, 200, 600, {width: 10, height: 5}, 0xcc6600, 'ak47', 
                3, 50, 0), // 深橙色，3发连射，50ms间隔，免费
            
            // 沙漠之鹰 - 射速快，伤害高，一发 (免费无限子弹)
            new Weapon('沙漠之鹰', 60, 300, 800, {width: 12, height: 8}, 0xcc3300, 'pistol', 
                1, 0, 0), // 深红色，单发，免费
            
            // 加特林 - 射速极快，同时8发扇形散弹，每次5秒冷却 (每次射击20积分)
            new Weapon('加特林', 12, 100, 700, {width: 8, height: 4}, 0x990000, 'gatling', 
                8, 0, 20), // 深红色，8发同时发射，无间隔，每次射击20积分
            
            // 声波枪 - 射速快，伤害高，声波持续2秒 (每发10积分)
            new Weapon('声波枪', 60, 150, 900, {width: 150, height: 4}, 0x0066cc, 'tesla', 
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
            new Weapon('导弹', 300, 1000, 400, {width: 15, height: 10}, 0x006600, 'missile', 
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
            new Weapon('核弹', 999, 1000, 300, {width: 20, height: 15}, 0x660066, 'nuke', 
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
            
            // 🆕 如果是触摸控制，更新UI高亮
            if (this.touchControls && this.touchControls.isMobile) {
                this.touchControls.highlightWeaponButton(index);
            }
            
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
            console.log('MainScene: background纹理不存在，使用偏淡背景');
            this.add.rectangle(640, 360, 1280, 720, 0xe8f4f8); // 偏淡的蓝白色背景
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
        this.scoreText = this.add.text(20, 20, '分数: 0', hudStyle).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 🆕 血量显示（替换生命值显示）
        this.healthText = this.add.text(20, 50, `血量: ${this.currentHealth}/${this.maxHealth}`, hudStyle).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
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
        ).setOrigin(0.5, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🆕 横版卷轴：距离进度显示
        this.distanceText = this.add.text(640, 50, '距离: 0/4000', {
            font: '16px Arial',
            fill: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🆕 横版卷轴：距离进度条
        this.createDistanceProgressBar();
        
        // 🆕 横版卷轴：创建小地图
        this.createMiniMap();
        
        // 🆕 当前武器显示
        this.weaponText = this.add.text(20, 140, '武器: AK47', hudStyle).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🆕 子弹数量显示
        this.bulletCountText = this.add.text(20, 170, '子弹: 无限', {
            font: '14px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 6, y: 2 }
        }).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🆕 右上角显示时间和击杀数
        const rightHudStyle = {
            font: '18px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        };
        
        // 时间显示（右上角）
        this.timeText = this.add.text(1280 - 20, 20, '时间: 00:00', rightHudStyle).setOrigin(1, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 击杀数显示（右上角）
        this.killText = this.add.text(1280 - 20, 50, '击杀: 0/30', rightHudStyle).setOrigin(1, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🆕 障碍物状态显示（右上角）
        this.obstacleText = this.add.text(1280 - 20, 80, '🪨 障碍物: 0/0', rightHudStyle).setOrigin(1, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🌍 场景信息显示（右上角）
        this.sceneText = this.add.text(1280 - 20, 110, '🌍 场景: 巨型机械内部', rightHudStyle).setOrigin(1, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
        
        // 🌍 场景切换提示（右上角）
        this.sceneHintText = this.add.text(1280 - 20, 140, '按 M 键切换场景', {
            font: '14px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        }).setOrigin(1, 0).setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 控制说明
        const controlStyle = {
            font: '14px Arial',
            fill: '#cccccc',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        };
      

        

      
        console.log('MainScene: HUD创建完成');
        
        // 🆕 如果是移动设备，调整HUD位置
        if (this.touchControls && this.touchControls.isMobile) {
            this.adjustHUDForMobile();
        }
    }
    
    // 🆕 为移动设备调整HUD位置
    adjustHUDForMobile() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
      
        // 调整分数显示位置（避免与触摸控制重叠）
        if (this.scoreText) {
            this.scoreText.setPosition(width / 2 - 100, 20);
        }
      
        // 调整血量显示位置
        if (this.healthText) {
            this.healthText.setPosition(width / 2 - 100, 50);
        }
      
        // 调整血量条位置
        if (this.healthBarBg) {
            this.healthBarBg.setPosition(width / 2 - 100, 85);
        }
      
        // 调整武器信息位置
        if (this.weaponText) {
            this.weaponText.setPosition(width / 2 - 100, 110);
        }
      
        if (this.bulletCountText) {
            this.bulletCountText.setPosition(width / 2 - 100, 140);
        }
      
        console.log('📱 HUD已针对移动设备调整');
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
        this.healthBarBg.setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 血量条前景
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0); // 🆕 横版卷轴：固定显示
        this.updateHealthBar();
    }
    
    // 🆕 横版卷轴：创建距离进度条
    createDistanceProgressBar() {
        const barWidth = 400;
        const barHeight = 8;
        const barX = 640 - barWidth / 2;
        const barY = 80;
      
        // 距离进度条背景
        this.distanceBarBg = this.add.graphics();
        this.distanceBarBg.fillStyle(0x333333);
        this.distanceBarBg.fillRect(barX, barY, barWidth, barHeight);
        this.distanceBarBg.lineStyle(1, 0x00ffff);
        this.distanceBarBg.strokeRect(barX, barY, barWidth, barHeight);
        this.distanceBarBg.setScrollFactor(0); // 🆕 横版卷轴：固定显示
      
        // 距离进度条前景
        this.distanceBar = this.add.graphics();
        this.distanceBar.setScrollFactor(0); // 🆕 横版卷轴：固定显示
        this.updateDistanceProgressBar();
    }
    
    // 🆕 横版卷轴：创建小地图
    createMiniMap() {
        const mapSize = 120;
        const mapX = 1280 - mapSize - 20;
        const mapY = 180;
        
        // 小地图背景
        this.miniMapBg = this.add.graphics();
        this.miniMapBg.fillStyle(0x000000, 0.7);
        this.miniMapBg.fillRect(mapX, mapY, mapSize, mapSize);
        this.miniMapBg.lineStyle(2, 0x00ffff);
        this.miniMapBg.strokeRect(mapX, mapY, mapSize, mapSize);
        this.miniMapBg.setScrollFactor(0);
        
        // 小地图内容
        this.miniMap = this.add.graphics();
        this.miniMap.setScrollFactor(0);
        
        // 小地图标题
        this.miniMapTitle = this.add.text(mapX + mapSize/2, mapY - 10, '小地图', {
            font: '12px Arial',
            fill: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5, 1).setScrollFactor(0);
        
        this.updateMiniMap();
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
    
    // 🆕 横版卷轴：更新距离进度条
    updateDistanceProgressBar() {
        if (!this.distanceBar || !this.player) return;
      
        const barWidth = 400;
        const barHeight = 8;
        const barX = 640 - barWidth / 2;
        const barY = 80;
      
        this.distanceBar.clear();
      
        // 计算距离进度（基于玩家X位置）
        const currentDistance = Math.max(0, this.player.x);
        const maxDistance = 4000; // 关卡总长度
        const progress = Math.min(1, currentDistance / maxDistance);
        const currentBarWidth = barWidth * progress;
      
        // 设置进度条颜色（从绿色渐变到红色）
        let barColor;
        if (progress < 0.5) {
            barColor = 0x00ff00; // 绿色
        } else if (progress < 0.8) {
            barColor = 0xffff00; // 黄色
        } else {
            barColor = 0xff0000; // 红色（接近BOSS）
        }
      
        this.distanceBar.fillStyle(barColor);
        this.distanceBar.fillRect(barX, barY, currentBarWidth, barHeight);
      
        // 更新距离文本
        if (this.distanceText) {
            this.distanceText.setText(`距离: ${Math.round(currentDistance)}/${maxDistance}`);
        }
    }
    
    // 🆕 横版卷轴：更新小地图
    updateMiniMap() {
        if (!this.miniMap || !this.player) return;
        
        const mapSize = 120;
        const mapX = 1280 - mapSize - 20;
        const mapY = 180;
        const worldWidth = 4000;
        const worldHeight = 720;
        
        this.miniMap.clear();
        
        // 绘制世界边界
        this.miniMap.lineStyle(1, 0x444444);
        this.miniMap.strokeRect(mapX + 2, mapY + 2, mapSize - 4, mapSize - 4);
        
        // 绘制玩家位置
        const playerMapX = mapX + (this.player.x / worldWidth) * (mapSize - 4) + 2;
        const playerMapY = mapY + (this.player.y / worldHeight) * (mapSize - 4) + 2;
        this.miniMap.fillStyle(0x00ff00);
        this.miniMap.fillCircle(playerMapX, playerMapY, 3);
        
        // 绘制敌人位置
        if (this.enemies) {
            this.miniMap.fillStyle(0xff0000);
            this.enemies.children.entries.forEach(enemy => {
                if (enemy.active) {
                    const enemyMapX = mapX + (enemy.x / worldWidth) * (mapSize - 4) + 2;
                    const enemyMapY = mapY + (enemy.y / worldHeight) * (mapSize - 4) + 2;
                    this.miniMap.fillCircle(enemyMapX, enemyMapY, 1);
                }
            });
        }
        
        // 绘制摄像机视窗
        const cameraLeft = this.cameras.main.scrollX;
        const cameraRight = cameraLeft + 1280;
        const cameraMapLeft = mapX + (cameraLeft / worldWidth) * (mapSize - 4) + 2;
        const cameraMapRight = mapX + (cameraRight / worldWidth) * (mapSize - 4) + 2;
        this.miniMap.lineStyle(1, 0x00ffff, 0.5);
        this.miniMap.strokeRect(cameraMapLeft, mapY + 2, cameraMapRight - cameraMapLeft, mapSize - 4);
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
        
        // 🆕 横版卷轴：更新距离进度条
        this.updateDistanceProgressBar();
        
        // 🆕 横版卷轴：更新小地图
        this.updateMiniMap();
        
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
        if (this.powerUpManager) {
            this.updatePowerUpHUD();
        }
        // 🆕 显示障碍物状态
        if (this.obstacleManager) {
            const obstacleStatus = this.obstacleManager.getObstacleStatus();
            if (this.obstacleText) {
                this.obstacleText.setText(`🪨 障碍物: ${obstacleStatus.count}/${obstacleStatus.maxCount}`);
            }
        }
        
        // 🌍 显示当前场景信息
        if (this.advancedSceneManager) {
            const sceneStatus = this.advancedSceneManager.getSceneStatus();
            if (this.sceneText) {
                this.sceneText.setText(`🌍 场景: ${sceneStatus.currentScene}`);
            }
        }
        
        // 🌍 显示场景切换提示
        if (this.sceneHintText) {
            this.sceneHintText.setText(`按 M 键切换场景`);
        }
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
      
        // 🆕 更新触摸控制
        if (this.touchControls) {
            this.touchControls.update();
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
      
        // 🆕 如果不是触摸设备，使用键盘控制
        if (!this.touchControls || !this.touchControls.isMobile) {
            // 玩家移动
            this.player.setVelocity(0);
          
            // 🆕 横版卷轴：限制玩家在可视区域内移动
            const cameraLeft = this.cameras.main.scrollX;
            const cameraRight = cameraLeft + 1280; // 游戏宽度
            const cameraCenter = cameraLeft + 640; // 屏幕中心
          
            // 水平移动 (左右方向键 或 A/D键)
            if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
                // 限制玩家不能移出屏幕左边缘
                if (this.player.x > cameraLeft + 50) {
                    this.player.setVelocityX(-this.playerSpeed);
                }
            } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
                // 允许玩家向右移动，触发摄像机滚动
                this.player.setVelocityX(this.playerSpeed);
            }
          
            // 垂直移动 (上下方向键 或 W/S键) - 不受摄像机影响
            if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
                this.player.setVelocityY(-this.playerSpeed);
            } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
                this.player.setVelocityY(this.playerSpeed);
            }
        }
        if (this.powerUpManager) {
            this.powerUpManager.update();
        }
        // 🆕 更新障碍物系统
        if (this.obstacleManager) {
            this.obstacleManager.update(this.time.now, this.game.loop.delta);
        }
        
        // 🌍 更新高级场景
        if (this.advancedSceneManager) {
            this.advancedSceneManager.update(this.time.now, this.game.loop.delta);
        }
        
        // 🌍 检查场景切换快捷键
        if (Phaser.Input.Keyboard.JustDown(this.sceneKey)) {
            this.sceneSwitcher.toggle();
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
        if (!enemy.active) return; // 简化条件，移除 isDying 检查

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

        // 🔧 普通武器 - 处理敌人伤害
        if (enemy.takeDamage) {
            const isDead = enemy.takeDamage(bullet.damage);
            if (isDead) {
                // 敌人死亡，增加击杀数和分数
                this.killCount++;
                let baseScore = bullet.damage;
                // 🆕 骑士伤害加成
                if (this.selectedPlayer && this.selectedPlayer.damageMultiplier) {
                    baseScore = Math.round(baseScore * this.selectedPlayer.damageMultiplier);
                }
                const killBonus = 20; // 击杀奖励
                const scoreGain = baseScore + killBonus;
                this.score += scoreGain;
                
                console.log(`MainScene: 使用${bullet.weaponType}击毁敌人，伤害: ${bullet.damage}，得分 +${scoreGain}，击杀数: ${this.killCount}/${this.levelCompleteKills}，当前分数: ${this.score}`);
            }
        } else {
            // 兼容旧版敌人
            enemy.destroy();
            this.killCount++;
            let baseScore = bullet.damage;
            // 🆕 骑士伤害加成
            if (this.selectedPlayer && this.selectedPlayer.damageMultiplier) {
                baseScore = Math.round(baseScore * this.selectedPlayer.damageMultiplier);
            }
            const killBonus = 20; // 击杀奖励
            const scoreGain = baseScore + killBonus;
            this.score += scoreGain;
          
            if (this.deathEmitter) {
                this.deathEmitter.setPosition(enemy.x, enemy.y);
                this.deathEmitter.start();
                this.time.delayedCall(100, () => { if (this.deathEmitter) this.deathEmitter.stop(); });
            }
            
            console.log(`MainScene: 使用${bullet.weaponType}击毁敌人，伤害: ${bullet.damage}，得分 +${scoreGain}，击杀数: ${this.killCount}/${this.levelCompleteKills}，当前分数: ${this.score}`);
        }
      
        // 销毁子弹
        bullet.destroy();
        this.updateHUD();

        console.log(`MainScene: 使用${bullet.weaponType}攻击完成`);
        
        // 🆕 检查是否达到击杀目标
        this.checkLevelComplete();
        // 普通武器击杀时尝试掉落道具
        if (bullet.weaponType !== '导弹' && bullet.weaponType !== '核弹') {
            enemy.destroy();
            const enemyType = enemy.enemyData ? enemy.enemyData.name : '小兵';
            if (this.powerUpManager) this.powerUpManager.spawnPowerUp(enemy.x, enemy.y, enemyType);
            // ... 其他击杀逻辑 ...
        }
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
      
        // 清除所有敌人和子弹
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        this.enemyBullets.clear(true, true);
      
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
            angle = Phaser.Math.Angle.Between(
                startX, startY,
                this.input.activePointer.worldX,
                this.input.activePointer.worldY
            );
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
          
            this.updateHUD();
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
                  
                    if (this.deathEmitter) {
                        this.deathEmitter.setPosition(enemy.x, enemy.y);
                        this.deathEmitter.start();
                        this.time.delayedCall(100, () => { 
                            if (this.deathEmitter) this.deathEmitter.stop(); 
                        });
                    }
                    enemy.destroy();
                }
            }
        }
      
        // 🆕 增强导弹爆炸特效
        this.createMissileExplosionEffect(explosionCenter);
        this.updateHUD();
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
      
        // 爆炸粒子
        if (this.explosionEmitter) {
            this.explosionEmitter.setPosition(center.x, center.y);
            this.explosionEmitter.start();
            this.time.delayedCall(300, () => { 
                if (this.explosionEmitter) this.explosionEmitter.stop(); 
            });
        }
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
        // 创建临时粒子发射器
        const radiationEmitter = this.add.particles(center.x, center.y, 'bullet', {
            speed: { min: 100, max: 400 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1500,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 3,
            tint: [0xff0000, 0xff6600, 0xffff00, 0x00ff00]
        }).setDepth(600);
      
        // 2秒后停止粒子效果
        this.time.delayedCall(2000, () => {
            radiationEmitter.destroy();
        });
    }

    // 🆕 创建敌人蒸发效果
    createEnemyVaporizeEffect(enemy) {
        // 敌人蒸发粒子
        const vaporize = this.add.particles(enemy.x, enemy.y, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 5,
            tint: 0x00ff00
        });
      
        this.time.delayedCall(1000, () => {
            vaporize.destroy();
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
            
            // 如果场景被暂停，先恢复
            if (this.scene.isPaused()) {
                this.scene.resume();
            }
            
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

    // 🆕 创建关卡背景（修正版，100% Phaser 兼容）
    createLevelBackground() {
        console.log('MainScene: 创建像素风关卡背景');
        
        // 🎨 使用像素艺术背景系统
        this.createPixelArtBackground();
        
        this.addEnvironmentEffects();
    }

    // 🎨 创建像素艺术背景
    createPixelArtBackground() {
        // 根据关卡索引选择主题
        const levelIndex = this.currentLevelIndex + 1;
        const theme = LEVEL_THEMES[levelIndex] || LEVEL_THEMES[1];
        
        // 创建背景图形
        const graphics = this.add.graphics();
        
        // 分层渐变天空背景（Phaser兼容）
        const gradientHeight = 400;
        const colorCount = theme.bgColors.length;
        const segmentHeight = gradientHeight / (colorCount - 1);
        
        for (let i = 0; i < colorCount - 1; i++) {
            const startY = i * segmentHeight;
            const endY = (i + 1) * segmentHeight;
            const startColor = this.hexToRgb(theme.bgColors[i]);
            const endColor = this.hexToRgb(theme.bgColors[i + 1]);
            
            // 创建渐变效果
            for (let y = startY; y < endY; y++) {
                const ratio = (y - startY) / segmentHeight;
                const color = this.interpolateColor(startColor, endColor, ratio);
                graphics.fillStyle(color);
                graphics.fillRect(0, y, 4000, 1);
            }
        }
        
        // 视差背景层
        this.createParallaxLayers(graphics, theme);
        
        // 地面
        graphics.fillStyle(this.hexToRgb(theme.groundColor));
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

    // 🎨 创建视差背景层
    createParallaxLayers(graphics, theme) {
        // 远景层
        graphics.fillStyle(0x222222);
        for (let i = 0; i < 20; i++) {
            const x = i * 200;
            graphics.fillRect(x, 300, 60, 100);
        }
        
        // 中景层
        graphics.fillStyle(0x444444);
        for (let i = 0; i < 33; i++) {
            const x = i * 120;
            graphics.fillRect(x, 350, 40, 50);
        }
        
        // 近景层
        graphics.fillStyle(0x666666);
        for (let i = 0; i < 50; i++) {
            const x = i * 80;
            graphics.fillRect(x, 380, 20, 20);
        }
    }

    // 1. 科技网格背景（修正版）
    generateTechGridBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xe6f3ff);
        graphics.fillRect(0, 0, 1280, 720);
        for (let i = 0; i < 10; i++) {
            const alpha = 0.1 - (i * 0.01);
            graphics.fillStyle(0xccddff, alpha);
            graphics.fillRect(0, i * 72, 1280, 72);
        }
        graphics.lineStyle(1, 0x99ccff, 0.3);
        const gridSize = 40;
        for (let x = 0; x <= 1280; x += gridSize) {
            graphics.beginPath();
            graphics.moveTo(x, 0);
            graphics.lineTo(x, 720);
            graphics.strokePath();
        }
        for (let y = 0; y <= 720; y += gridSize) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(1280, y);
            graphics.strokePath();
        }
        graphics.fillStyle(0x6699ff, 0.4);
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            graphics.fillCircle(x, y, 2);
            graphics.lineStyle(1, 0x6699ff, 0.3);
            graphics.beginPath();
            graphics.moveTo(x - 5, y);
            graphics.lineTo(x + 5, y);
            graphics.moveTo(x, y - 5);
            graphics.lineTo(x, y + 5);
            graphics.strokePath();
        }
        graphics.setDepth(-100);
    }

    // 2. 云朵背景（修正版）
    generateCloudBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf0f8ff);
        graphics.fillRect(0, 0, 1280, 720);
        for (let i = 0; i < 20; i++) {
            const alpha = 0.05 - (i * 0.002);
            graphics.fillStyle(0xe0e6ff, alpha);
            graphics.fillRect(0, i * 36, 1280, 36);
        }
        graphics.fillStyle(0xffffff, 0.6);
        for (let i = 0; i < 15; i++) {
            const cloudX = Phaser.Math.Between(0, 1280);
            const cloudY = Phaser.Math.Between(50, 400);
            const cloudSize = Phaser.Math.Between(30, 80);
            this.drawCloud(graphics, cloudX, cloudY, cloudSize);
        }
        graphics.setDepth(-100);
    }

    // 3. 电路板背景（修正版）
    generateCircuitBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf0fff0);
        graphics.fillRect(0, 0, 1280, 720);
        graphics.lineStyle(2, 0x90ee90, 0.6);
        for (let i = 0; i < 30; i++) {
            const startX = Phaser.Math.Between(0, 1280);
            const startY = Phaser.Math.Between(0, 720);
            const endX = startX + Phaser.Math.Between(-200, 200);
            const endY = startY + Phaser.Math.Between(-200, 200);
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
            graphics.fillStyle(0x32cd32, 0.8);
            graphics.fillCircle(startX, startY, 3);
            graphics.fillCircle(endX, startY, 3);
            graphics.fillCircle(endX, endY, 3);
        }
        graphics.fillStyle(0x98fb98, 0.4);
        graphics.lineStyle(1, 0x32cd32, 0.8);
        for (let i = 0; i < 10; i++) {
            const rectX = Phaser.Math.Between(50, 1200);
            const rectY = Phaser.Math.Between(50, 650);
            const rectW = Phaser.Math.Between(20, 60);
            const rectH = Phaser.Math.Between(15, 40);
            graphics.fillRect(rectX, rectY, rectW, rectH);
            graphics.strokeRect(rectX, rectY, rectW, rectH);
            for (let j = 0; j < 4; j++) {
                graphics.fillStyle(0x32cd32, 1);
                graphics.fillRect(rectX - 5, rectY + (j + 1) * (rectH / 5), 10, 2);
                graphics.fillRect(rectX + rectW - 5, rectY + (j + 1) * (rectH / 5), 10, 2);
            }
        }
        graphics.setDepth(-100);
    }

    // 4. 星空背景（修正版）
    generateStarFieldBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf8f8ff);
        graphics.fillRect(0, 0, 1280, 720);
        for (let radius = 500; radius > 0; radius -= 50) {
            const alpha = (500 - radius) / 500 * 0.1;
            graphics.fillStyle(0xe6e6fa, alpha);
            graphics.fillCircle(640, 360, radius);
        }
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Math.random() * 0.8 + 0.2;
            graphics.fillStyle(0xdda0dd, alpha);
            graphics.fillCircle(x, y, size);
            if (size >= 2) {
                graphics.lineStyle(1, 0xdda0dd, alpha * 0.5);
                graphics.beginPath();
                graphics.moveTo(x - size * 2, y);
                graphics.lineTo(x + size * 2, y);
                graphics.moveTo(x, y - size * 2);
                graphics.lineTo(x, y + size * 2);
                graphics.strokePath();
                }
            }
        graphics.setDepth(-100);
    }

    // 5. 六角形科技背景（保持不变）
    generateHexagonBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf5f5f5);
        graphics.fillRect(0, 0, 1280, 720);
        const hexSize = 30;
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        graphics.lineStyle(1, 0xd3d3d3, 0.8);
        for (let row = 0; row < Math.ceil(720 / (hexHeight * 0.75)) + 1; row++) {
            for (let col = 0; col < Math.ceil(1280 / hexWidth) + 1; col++) {
                const x = col * hexWidth + (row % 2) * (hexWidth / 2);
                const y = row * hexHeight * 0.75;
                this.drawHexagon(graphics, x, y, hexSize);
            }
        }
        graphics.fillStyle(0xe0e0e0, 0.5);
        for (let i = 0; i < 20; i++) {
            const randomRow = Phaser.Math.Between(0, Math.ceil(720 / (hexHeight * 0.75)));
            const randomCol = Phaser.Math.Between(0, Math.ceil(1280 / hexWidth));
            const x = randomCol * hexWidth + (randomRow % 2) * (hexWidth / 2);
            const y = randomRow * hexHeight * 0.75;
            this.fillHexagon(graphics, x, y, hexSize);
        }
        graphics.setDepth(-100);
    }

    // 6. 波浪背景（修正版）
    generateWaveBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf0ffff);
        graphics.fillRect(0, 0, 1280, 720);
        for (let i = 0; i < 15; i++) {
            const alpha = 0.08 - (i * 0.005);
            graphics.fillStyle(0xe0f6ff, alpha);
            graphics.fillRect(0, i * 48, 1280, 48);
        }
        const waveColors = [0xb0e0e6, 0x87ceeb, 0x87cefa];
        const waveAlphas = [0.3, 0.2, 0.1];
        for (let layer = 0; layer < 3; layer++) {
            graphics.fillStyle(waveColors[layer], waveAlphas[layer]);
            const amplitude = 30 + layer * 20;
            const frequency = 0.01 + layer * 0.005;
            const yOffset = 200 + layer * 150;
            graphics.beginPath();
            graphics.moveTo(0, yOffset);
            for (let x = 0; x <= 1280; x += 5) {
                const y = yOffset + Math.sin(x * frequency) * amplitude;
                graphics.lineTo(x, y);
            }
            graphics.lineTo(1280, 720);
            graphics.lineTo(0, 720);
            graphics.closePath();
            graphics.fillPath();
        }
        graphics.setDepth(-100);
        }
      
    // 简化版背景（降级方案）
    generateSimpleBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf0f8ff);
        graphics.fillRect(0, 0, 1280, 720);
        graphics.fillStyle(0xb0c4de, 0.3);
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const size = Phaser.Math.Between(2, 8);
            graphics.fillCircle(x, y, size);
        }
        graphics.lineStyle(1, 0xb0c4de, 0.2);
        for (let i = 0; i < 20; i++) {
            const x1 = Phaser.Math.Between(0, 1280);
            const y1 = Phaser.Math.Between(0, 720);
            const x2 = x1 + Phaser.Math.Between(-100, 100);
            const y2 = y1 + Phaser.Math.Between(-100, 100);
            graphics.beginPath();
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
            graphics.strokePath();
        }
        graphics.setDepth(-100);
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
        // 🎨 使用像素艺术角色纹理
        let characterType = 'warrior'; // 默认角色
        
        // 根据选择的角色或关卡确定角色类型
        if (this.selectedPlayer && this.selectedPlayer.key) {
            // 映射角色键到像素艺术类型
            const characterMap = {
                'elf': 'archer',
                'soldier': 'warrior', 
                'diver': 'mage',
                'tank': 'tank',
                'spaceship': 'assassin'
            };
            characterType = characterMap[this.selectedPlayer.key] || 'warrior';
        }
        
        // 使用像素艺术纹理
        const playerTexture = `${characterType}_0`; // 使用第一帧
        this.playerSpeed = (this.selectedPlayer && this.selectedPlayer.speed) || 400;
        this.playerSize = 40;
        
        this.player = this.physics.add.sprite(100, 360, playerTexture)
            .setCollideWorldBounds(true)
            .setDisplaySize(this.playerSize, this.playerSize);
      
        this.player.playerSpeed = this.playerSpeed;
        this.player.isInvincible = false;
        this.player.characterType = characterType;
        this.player.animationFrame = 0;
        
        // 🎨 设置角色动画
        this.player.animationTimer = this.time.addEvent({
            delay: 200, // 每200ms更新一帧
            callback: this.updatePlayerAnimation,
            callbackScope: this,
            loop: true
        });
        
        // 🆕 横版卷轴：设置摄像机跟随玩家
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1); // 平滑跟随
        this.cameras.main.setDeadzone(100, 50); // 死区设置，避免频繁移动
  
        console.log('MainScene: 像素风角色创建完成，类型:', characterType);
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
      
        // 🎨 使用像素艺术敌人类型
        const enemyTypes = ['drone', 'soldier', 'heavy', 'flyer'];
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemyTexture = `${enemyType}_0`; // 使用第一帧
      
        const y = Phaser.Math.Between(50, 670);
        // 🆕 横版卷轴：在摄像机右侧生成敌人
        const spawnX = this.cameras.main.scrollX + 900;
        const enemy = this.enemies.create(spawnX, y, enemyTexture);
      
        if (enemy) {
            // 🎨 设置像素艺术敌人数据
            const pixelEnemyData = ENEMY_TYPES[enemyType];
            enemy.enemyData = {
                name: pixelEnemyData.name,
                hp: pixelEnemyData.health,
                speed: 100 + Math.random() * 50,
                score: pixelEnemyData.health * 10,
                canShoot: enemyType === 'soldier' || enemyType === 'heavy',
                shootRate: 2000 + Math.random() * 1000,
                ai: 'straight'
            };
            
            enemy.maxHp = enemy.enemyData.hp;
            enemy.currentHp = enemy.enemyData.hp;
            enemy.enemySpeed = enemy.enemyData.speed;
            enemy.scoreValue = enemy.enemyData.score;
            enemy.canShoot = enemy.enemyData.canShoot;
            enemy.shootRate = enemy.enemyData.shootRate;
            enemy.aiType = enemy.enemyData.ai;
            enemy.pixelType = enemyType;
            enemy.animationFrame = 0;
            
            // 🎨 设置敌人动画
            enemy.animationTimer = this.time.addEvent({
                delay: 300,
                callback: () => this.updateEnemyAnimation(enemy),
                callbackScope: this,
                loop: true
            });
            
            // 初始化敌人
            enemy.init();
            this.currentEnemyCount++;
            
            console.log(`MainScene: 生成像素风敌人: ${enemy.enemyData.name}，当前数量: ${this.currentEnemyCount}/${this.maxEnemies}`);
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
  


    // 🆕 修改关卡完成检查
    checkLevelComplete() {
        if (this.isGameOver || this.isLevelCompleted) return;
      
        const currentTime = this.time.now;
        const survivalTime = currentTime - this.gameStartTime;
      
        // 🆕 横版卷轴：检查距离条件
        if (this.player && this.player.x >= 4000) {
            this.completeLevel(`到达关卡终点`);
            return;
        }
      
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
        
        // 确保R键监听器已设置
        this.input.keyboard.on('keydown-R', this.handleRestart, this);
    }

    // 🔧 在场景销毁时清理事件监听器
    destroy() {
        // 清理触摸控制
        if (this.touchControls) {
            this.touchControls.destroy();
        }
        
        // 🎨 清理像素艺术动画定时器
        if (this.player && this.player.animationTimer) {
            this.player.animationTimer.destroy();
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

    collectPowerUp(player, powerUp) {
        if (powerUp.collect) {
            powerUp.collect();
        }
    }

    updatePowerUpHUD() {
        if (this.powerUpHUDGroup) {
            this.powerUpHUDGroup.clear(true);
        } else {
            this.powerUpHUDGroup = this.add.group();
        }
        const activeBonuses = this.powerUpManager.getActiveBonuses();
        activeBonuses.forEach((bonus, index) => {
            const x = 50;
            const y = 150 + index * 40;
            const remainingTime = Math.max(0, bonus.endTime - Date.now());
            const seconds = Math.ceil(remainingTime / 1000);
            const bg = this.add.rectangle(x, y, 200, 30, 0x000000, 0.6)
                .setOrigin(0, 0.5)
                .setStroke(0xffffff, 1);
            const text = this.add.text(x + 10, y, `${bonus.symbol} ${bonus.name} ${seconds}s`, {
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            const progressWidth = 180;
            const progress = remainingTime / bonus.effect.duration;
            const progressBg = this.add.rectangle(x + 10, y + 12, progressWidth, 4, 0x333333)
                .setOrigin(0, 0.5);
            const progressBar = this.add.rectangle(x + 10, y + 12, progressWidth * progress, 4, 0x00ff00)
                .setOrigin(0, 0.5);
            this.powerUpHUDGroup.addMultiple([bg, text, progressBg, progressBar]);
        });
        this.powerUpHUDGroup.setDepth(1000);
    }

    switchLevel(levelType) {
        console.log(`🌍 切换到 ${levelType} 关卡`);
        
        // 🆕 更新障碍物系统关卡
        if (this.obstacleManager) {
            this.obstacleManager.setLevel(levelType);
            this.obstacleManager.spawnObstacles();
        }
        
        // ... 其他关卡切换逻辑 ...
    }
    
    // 🆕 横版卷轴：多层视差背景方法
    
    // 1. 科技网格视差背景
    generateParallaxTechGridBackground() {
        // 远景层（滚动速度 0.3）
        const farGraphics = this.add.graphics();
        farGraphics.fillStyle(0xe6f3ff);
        farGraphics.fillRect(0, 0, 4000, 720);
        for (let i = 0; i < 10; i++) {
            const alpha = 0.1 - (i * 0.01);
            farGraphics.fillStyle(0xccddff, alpha);
            farGraphics.fillRect(0, i * 72, 4000, 72);
        }
        farGraphics.setDepth(-300);
        farGraphics.setScrollFactor(0.3);
        
        // 中景层（滚动速度 0.6）
        const midGraphics = this.add.graphics();
        midGraphics.lineStyle(1, 0x99ccff, 0.3);
        const gridSize = 40;
        for (let x = 0; x <= 4000; x += gridSize) {
            midGraphics.beginPath();
            midGraphics.moveTo(x, 0);
            midGraphics.lineTo(x, 720);
            midGraphics.strokePath();
        }
        for (let y = 0; y <= 720; y += gridSize) {
            midGraphics.beginPath();
            midGraphics.moveTo(0, y);
            midGraphics.lineTo(4000, y);
            midGraphics.strokePath();
        }
        midGraphics.setDepth(-200);
        midGraphics.setScrollFactor(0.6);
        
        // 近景层（滚动速度 1.0）
        const nearGraphics = this.add.graphics();
        nearGraphics.fillStyle(0x6699ff, 0.4);
        for (let i = 0; i < 60; i++) {
            const x = Phaser.Math.Between(0, 4000);
            const y = Phaser.Math.Between(0, 720);
            nearGraphics.fillCircle(x, y, 2);
            nearGraphics.lineStyle(1, 0x6699ff, 0.3);
            nearGraphics.beginPath();
            nearGraphics.moveTo(x - 5, y);
            nearGraphics.lineTo(x + 5, y);
            nearGraphics.moveTo(x, y - 5);
            nearGraphics.lineTo(x, y + 5);
            nearGraphics.strokePath();
        }
        nearGraphics.setDepth(-100);
        nearGraphics.setScrollFactor(1.0);
    }
    
    // 2. 云朵视差背景
    generateParallaxCloudBackground() {
        // 远景层（滚动速度 0.3）
        const farGraphics = this.add.graphics();
        farGraphics.fillStyle(0xf0f8ff);
        farGraphics.fillRect(0, 0, 4000, 720);
        for (let i = 0; i < 20; i++) {
            const alpha = 0.05 - (i * 0.002);
            farGraphics.fillStyle(0xe0e6ff, alpha);
            farGraphics.fillRect(0, i * 36, 4000, 36);
        }
        farGraphics.setDepth(-300);
        farGraphics.setScrollFactor(0.3);
        
        // 中景层（滚动速度 0.6）
        const midGraphics = this.add.graphics();
        midGraphics.fillStyle(0xffffff, 0.4);
        for (let i = 0; i < 30; i++) {
            const cloudX = Phaser.Math.Between(0, 4000);
            const cloudY = Phaser.Math.Between(50, 400);
            const cloudSize = Phaser.Math.Between(40, 100);
            this.drawCloud(midGraphics, cloudX, cloudY, cloudSize);
        }
        midGraphics.setDepth(-200);
        midGraphics.setScrollFactor(0.6);
        
        // 近景层（滚动速度 1.0）
        const nearGraphics = this.add.graphics();
        nearGraphics.fillStyle(0xffffff, 0.6);
        for (let i = 0; i < 20; i++) {
            const cloudX = Phaser.Math.Between(0, 4000);
            const cloudY = Phaser.Math.Between(100, 500);
            const cloudSize = Phaser.Math.Between(30, 80);
            this.drawCloud(nearGraphics, cloudX, cloudY, cloudSize);
        }
        nearGraphics.setDepth(-100);
        nearGraphics.setScrollFactor(1.0);
    }
    
    // 3. 电路板视差背景
    generateParallaxCircuitBackground() {
        // 远景层（滚动速度 0.3）
        const farGraphics = this.add.graphics();
        farGraphics.fillStyle(0xf0fff0);
        farGraphics.fillRect(0, 0, 4000, 720);
        farGraphics.setDepth(-300);
        farGraphics.setScrollFactor(0.3);
        
        // 中景层（滚动速度 0.6）
        const midGraphics = this.add.graphics();
        midGraphics.lineStyle(2, 0x90ee90, 0.4);
        for (let i = 0; i < 80; i++) {
            const startX = Phaser.Math.Between(0, 4000);
            const startY = Phaser.Math.Between(0, 720);
            const endX = startX + Phaser.Math.Between(-200, 200);
            const endY = startY + Phaser.Math.Between(-200, 200);
            midGraphics.beginPath();
            midGraphics.moveTo(startX, startY);
            midGraphics.lineTo(endX, startY);
            midGraphics.lineTo(endX, endY);
            midGraphics.strokePath();
        }
        midGraphics.setDepth(-200);
        midGraphics.setScrollFactor(0.6);
        
        // 近景层（滚动速度 1.0）
        const nearGraphics = this.add.graphics();
        nearGraphics.fillStyle(0x32cd32, 0.8);
        nearGraphics.lineStyle(1, 0x32cd32, 0.8);
        for (let i = 0; i < 30; i++) {
            const rectX = Phaser.Math.Between(50, 3900);
            const rectY = Phaser.Math.Between(50, 650);
            const rectW = Phaser.Math.Between(20, 60);
            const rectH = Phaser.Math.Between(15, 40);
            nearGraphics.fillRect(rectX, rectY, rectW, rectH);
            nearGraphics.strokeRect(rectX, rectY, rectW, rectH);
        }
        nearGraphics.setDepth(-100);
        nearGraphics.setScrollFactor(1.0);
    }
    
    // 4. 星空视差背景
    generateParallaxStarFieldBackground() {
        // 远景层（滚动速度 0.3）
        const farGraphics = this.add.graphics();
        farGraphics.fillStyle(0xf8f8ff);
        farGraphics.fillRect(0, 0, 4000, 720);
        for (let radius = 500; radius > 0; radius -= 50) {
            const alpha = (500 - radius) / 500 * 0.1;
            farGraphics.fillStyle(0xe6e6fa, alpha);
            farGraphics.fillCircle(2000, 360, radius);
        }
        farGraphics.setDepth(-300);
        farGraphics.setScrollFactor(0.3);
        
        // 中景层（滚动速度 0.6）
        const midGraphics = this.add.graphics();
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, 4000);
            const y = Phaser.Math.Between(0, 720);
            const size = Phaser.Math.Between(1, 2);
            const alpha = Math.random() * 0.6 + 0.2;
            midGraphics.fillStyle(0xdda0dd, alpha);
            midGraphics.fillCircle(x, y, size);
        }
        midGraphics.setDepth(-200);
        midGraphics.setScrollFactor(0.6);
        
        // 近景层（滚动速度 1.0）
        const nearGraphics = this.add.graphics();
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 4000);
            const y = Phaser.Math.Between(0, 720);
            const size = Phaser.Math.Between(2, 4);
            const alpha = Math.random() * 0.8 + 0.2;
            nearGraphics.fillStyle(0xffffff, alpha);
            nearGraphics.fillCircle(x, y, size);
            if (size >= 3) {
                nearGraphics.lineStyle(1, 0xffffff, alpha * 0.5);
                nearGraphics.beginPath();
                nearGraphics.moveTo(x - size * 2, y);
                nearGraphics.lineTo(x + size * 2, y);
                nearGraphics.moveTo(x, y - size * 2);
                nearGraphics.lineTo(x, y + size * 2);
                nearGraphics.strokePath();
            }
        }
        nearGraphics.setDepth(-100);
        nearGraphics.setScrollFactor(1.0);
    }
    
    // 5. 六角形视差背景
    generateParallaxHexagonBackground() {
        // 远景层（滚动速度 0.3）
        const farGraphics = this.add.graphics();
        farGraphics.fillStyle(0xf5f5f5);
        farGraphics.fillRect(0, 0, 4000, 720);
        farGraphics.setDepth(-300);
        farGraphics.setScrollFactor(0.3);
        
        // 中景层（滚动速度 0.6）
        const midGraphics = this.add.graphics();
        const hexSize = 40;
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        midGraphics.lineStyle(1, 0xd3d3d3, 0.6);
        for (let row = 0; row < Math.ceil(720 / (hexHeight * 0.75)) + 1; row++) {
            for (let col = 0; col < Math.ceil(4000 / hexWidth) + 1; col++) {
                const x = col * hexWidth + (row % 2) * (hexWidth / 2);
                const y = row * hexHeight * 0.75;
                this.drawHexagon(midGraphics, x, y, hexSize);
            }
        }
        midGraphics.setDepth(-200);
        midGraphics.setScrollFactor(0.6);
        
        // 近景层（滚动速度 1.0）
        const nearGraphics = this.add.graphics();
        nearGraphics.fillStyle(0xe0e0e0, 0.5);
        for (let i = 0; i < 60; i++) {
            const randomRow = Phaser.Math.Between(0, Math.ceil(720 / (hexHeight * 0.75)));
            const randomCol = Phaser.Math.Between(0, Math.ceil(4000 / hexWidth));
            const x = randomCol * hexWidth + (randomRow % 2) * (hexWidth / 2);
            const y = randomRow * hexHeight * 0.75;
            this.fillHexagon(nearGraphics, x, y, hexSize);
        }
        nearGraphics.setDepth(-100);
        nearGraphics.setScrollFactor(1.0);
    }
    
    // 6. 波浪视差背景
    generateParallaxWaveBackground() {
        // 远景层（滚动速度 0.3）
        const farGraphics = this.add.graphics();
        farGraphics.fillStyle(0xf0ffff);
        farGraphics.fillRect(0, 0, 4000, 720);
        for (let i = 0; i < 15; i++) {
            const alpha = 0.08 - (i * 0.005);
            farGraphics.fillStyle(0xe0f6ff, alpha);
            farGraphics.fillRect(0, i * 48, 4000, 48);
        }
        farGraphics.setDepth(-300);
        farGraphics.setScrollFactor(0.3);
        
        // 中景层（滚动速度 0.6）
        const midGraphics = this.add.graphics();
        const waveColors = [0xb0e0e6, 0x87ceeb, 0x87cefa];
        const waveAlphas = [0.2, 0.15, 0.1];
        for (let layer = 0; layer < 3; layer++) {
            midGraphics.fillStyle(waveColors[layer], waveAlphas[layer]);
            const amplitude = 20 + layer * 15;
            const frequency = 0.008 + layer * 0.003;
            for (let x = 0; x < 4000; x += 5) {
                const y = 360 + Math.sin(x * frequency) * amplitude;
                midGraphics.fillCircle(x, y, 3);
            }
        }
        midGraphics.setDepth(-200);
        midGraphics.setScrollFactor(0.6);
        
        // 近景层（滚动速度 1.0）
        const nearGraphics = this.add.graphics();
        nearGraphics.fillStyle(0x00bfff, 0.3);
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 4000);
            const y = Phaser.Math.Between(100, 620);
            const size = Phaser.Math.Between(10, 30);
            nearGraphics.fillCircle(x, y, size);
        }
        nearGraphics.setDepth(-100);
        nearGraphics.setScrollFactor(1.0);
    }
}

// 🆕 导出到全局作用域
window.MainScene = MainScene; 