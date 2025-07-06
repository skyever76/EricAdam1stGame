// scenes/MainScene.js

// 🆕 武器系统类
class Weapon {
    constructor(name, damage, fireRate, bulletSpeed, bulletSize, bulletColor, texture, 
                burstCount = 1, burstDelay = 0, bulletCost = 0, specialEffect = null, 
                isContinuous = false, duration = 0) {
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
            this.destroy();
        }
    }
}

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    init(data) {
        console.log('MainScene: 初始化，接收到的数据:', data);
        this.selectedPlayer = data.player || null;
        console.log('MainScene: 选中的玩家:', this.selectedPlayer);
    }

    create() {
        console.log('MainScene: 创建场景开始');
        console.log('MainScene: 可用纹理列表:', this.textures.getTextureKeys());
      
        // 🆕 武器系统初始化
        this.initWeaponSystem();
      
        // 🆕 关卡系统初始化
        this.gameStartTime = this.time.now;
        this.killCount = 0;
        this.levelCompleteTime = 90000; // 90秒
        this.levelCompleteKills = 30; // 30个敌人
        this.levelEndTime = null; // 关卡结束时间
        this.levelComplete = false; // 关卡是否完成
      
        // 初始化血量系统
        this.initHealthSystem();
    
        // 创建背景
        this.createBackground();
    
        // 设置物理边界
        this.physics.world.setBounds(0, 0, 1280, 720);
        console.log('MainScene: 物理世界边界已设置:', this.physics.world.bounds);
    
        // 创建玩家
        this.createPlayer();
    
        // 创建游戏对象组
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 50
        });
    
        this.enemies = this.physics.add.group();
        
        console.log('MainScene: 游戏对象组创建完成');
        console.log('MainScene: 子弹组已创建');
        console.log('MainScene: 敌人组已创建');
    
        // 碰撞检测
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHit, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, null, this);
    
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
    
        // 开始生成敌人
        this.startEnemySpawner();

        // 显示版本信息
        this.add.text(1200, 700, 'v3.0-WeaponSystem', { 
            font: '14px Arial', 
            fill: '#666666' 
        }).setOrigin(1);
      
        console.log('MainScene: 场景创建完成');
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
            
            // 沙漠之鹰 - 射速慢，伤害高，一发 (免费无限子弹)
            new Weapon('沙漠之鹰', 40, 600, 800, {width: 12, height: 8}, 0xff6600, 'pistol', 
                1, 0, 0), // 单发，免费
            
            // 加特林 - 射速极快，一次20发，每次5秒冷却 (每发10积分)
            new Weapon('加特林', 8, 100, 700, {width: 8, height: 4}, 0xff0000, 'gatling', 
                20, 30, 10), // 20发连射，30ms间隔，每发10积分
            
            // 导弹 - 射速慢，爆炸范围大 (每发20积分)
            new Weapon('导弹', 60, 1000, 400, {width: 15, height: 10}, 0x00ff00, 'missile', 
                1, 0, 20, 
                (bullet, x, y) => {
                    // 导弹尾迹效果
                    bullet.scene.tweens.add({
                        targets: bullet,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 100,
                        yoyo: true,
                        repeat: -1
                    });
                }
            ),
            
            // 核弹 - 射速慢，全屏消灭敌人 (每发50积分)
            new Weapon('核弹', 200, 3000, 300, {width: 20, height: 15}, 0xff00ff, 'nuke', 
                1, 0, 50,
                (bullet, x, y) => {
                    // 核弹发光效果
                    bullet.scene.tweens.add({
                        targets: bullet,
                        alpha: 0.5,
                        duration: 200,
                        yoyo: true,
                        repeat: -1
                    });
                }
            ),
            
            // 特斯拉枪 - 射速快，伤害高，光线持续2秒 (每发15积分)
            new Weapon('特斯拉枪', 35, 150, 900, {width: 6, height: 100}, 0x00ffff, 'tesla', 
                1, 0, 15, 
                (bullet, x, y) => {
                    // 电击效果
                    bullet.scene.tweens.add({
                        targets: bullet,
                        rotation: Math.PI * 2,
                        duration: 100,
                        repeat: -1
                    });
                },
                true, 2000 // 持续武器，持续2秒
            )
        ];
        
        // 🆕 武器冷却时间
        this.weaponCooldowns = [0, 0, 0, 0, 0, 0]; // 每种武器的冷却时间
        
        // 🆕 加特林特殊冷却
        this.gatlingLastUseTime = 0;
        this.gatlingCooldown = 5000; // 5秒使用时间
        this.gatlingRestCooldown = 2000; // 2秒休息时间
        this.gatlingIsResting = false; // 是否在休息状态
        
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
        this.score = 0;
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
      
        // 关卡显示
        this.levelText = this.add.text(20, 110, '关卡: 1', hudStyle);
        
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
      
        // 🆕 检查关卡完成条件
        this.checkLevelComplete();
      
        // 🆕 检查敌人逃脱
        this.checkEnemyEscape();
        
        // 🆕 更新HUD（包括时间显示）
        this.updateHUD();
        
        // 调试敌人移动
        if (this.enemies && this.enemies.children.size > 0) {
            this.enemies.children.entries.forEach(enemy => {
                if (enemy.active && enemy.body) {
                    // 确保敌人持续向左移动
                    if (enemy.body.velocity.x > -50) {
                        enemy.setVelocityX(-100);
                    }
                }
            });
        }
      
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
        // 🆕 特殊武器爆炸效果处理
        if (bullet.weaponType === '导弹') {
            this.executeMissileExplosion(bullet, enemy);
        } else if (bullet.weaponType === '核弹') {
            this.executeNuclearStrike(bullet, enemy);
        } else {
            // 普通武器直接销毁敌人
            enemy.destroy();
        }
        
        bullet.destroy();
      
        // 🆕 根据武器伤害计算分数
        const scoreGain = bullet.damage;
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
        
        // 🆕 检查加特林特殊冷却
        if (this.currentWeapon.name === '加特林') {
            const timeSinceLastUse = currentTime - this.gatlingLastUseTime;
            
            // 如果正在休息状态
            if (this.gatlingIsResting) {
                if (timeSinceLastUse < this.gatlingCooldown + this.gatlingRestCooldown) {
                    const remainingRestTime = Math.ceil((this.gatlingCooldown + this.gatlingRestCooldown - timeSinceLastUse) / 1000);
                    this.showWeaponCooldownMessage(remainingRestTime, '休息');
                    return;
                } else {
                    // 休息结束，重置状态
                    this.gatlingIsResting = false;
                    this.gatlingLastUseTime = currentTime;
                }
            } else {
                // 检查是否超过5秒使用时间，需要进入休息状态
                if (timeSinceLastUse >= this.gatlingCooldown) {
                    this.gatlingIsResting = true;
                    this.gatlingLastUseTime = currentTime;
                    const remainingRestTime = Math.ceil(this.gatlingRestCooldown / 1000);
                    this.showWeaponCooldownMessage(remainingRestTime, '休息');
                    return;
                }
            }
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
        
        // 🆕 加特林特殊处理
        if (this.currentWeapon.name === '加特林') {
            // 只在非休息状态时更新使用时间
            if (!this.gatlingIsResting) {
                this.gatlingLastUseTime = currentTime;
            }
        }
      
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
    
    // 🆕 发射单发子弹
    fireSingleBullet(x, y, angle, weapon) {
        const bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(x, y, weapon);
            
            // 🆕 特殊武器效果（只有特斯拉枪在发射时有效果）
            if (weapon.name === '特斯拉枪' && weapon.isContinuous) {
                this.executeTeslaBeam(bullet);
            }
        }
    }
    
    // 🆕 核弹爆炸效果
    executeNuclearStrike(bullet, hitEnemy) {
        // 使用被击中的敌人作为爆炸中心
        const explosionCenter = hitEnemy;
        
        // 核弹大范围爆炸攻击
        const explosionRadius = 300;
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(explosionCenter.x, explosionCenter.y, enemy.x, enemy.y);
                if (distance <= explosionRadius) {
                    enemy.destroy();
                    this.killCount++;
                }
            }
        });
        
        // 核弹爆炸效果
        const explosion = this.add.circle(explosionCenter.x, explosionCenter.y, explosionRadius, 0xff0000, 0.3);
        this.tweens.add({
            targets: explosion,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1000,
            onComplete: () => explosion.destroy()
        });
        
        console.log('MainScene: 核弹爆炸攻击！');
    }
    
    // 🆕 导弹爆炸效果
    executeMissileExplosion(bullet, hitEnemy) {
        // 使用被击中的敌人作为爆炸中心
        const explosionCenter = hitEnemy;
        
        // 导弹爆炸范围攻击
        const explosionRadius = 150;
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(explosionCenter.x, explosionCenter.y, enemy.x, enemy.y);
                if (distance <= explosionRadius) {
                    enemy.destroy();
                    this.killCount++;
                }
            }
        });
        
        // 爆炸视觉效果
        const explosion = this.add.circle(explosionCenter.x, explosionCenter.y, explosionRadius, 0xff6600, 0.4);
        this.tweens.add({
            targets: explosion,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => explosion.destroy()
        });
    }
    
    // 🆕 特斯拉光线持续效果
    executeTeslaBeam(bullet) {
        // 特斯拉光线持续2秒
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
        if (this.isGameOver) {
            console.log('MainScene: 检测到R键，重新开始游戏');
            // 清理所有事件监听器
            this.input.keyboard.off('keydown-R', this.handleRestart, this);
            
            // 重新开始场景
            this.scene.restart();
        }
    }
    
    // 🆕 检查关卡完成条件
    checkLevelComplete() {
        if (this.isGameOver) return; // 游戏结束时不检查
        
        const currentTime = this.time.now;
        const survivalTime = currentTime - this.gameStartTime;
        
        // 检查生存时间条件（90秒）
        if (survivalTime >= this.levelCompleteTime) {
            this.completeLevel('生存时间达到90秒');
            return;
        }
        
        // 检查击杀数条件（30个敌人）
        if (this.killCount >= this.levelCompleteKills) {
            this.completeLevel(`击杀${this.levelCompleteKills}个敌人`);
            return;
        }
    }
    
    // 🆕 完成关卡
    completeLevel(reason) {
        if (this.isLevelCompleted) return; // 防止重复触发
        
        this.isLevelCompleted = true;
        console.log(`MainScene: 关卡${this.level}完成！原因: ${reason}`);
        
        // 🆕 记录关卡完成时间
        this.levelEndTime = this.time.now;
        this.levelComplete = true;
        
        // 停止敌人生成
        if (this.enemySpawner) {
            this.enemySpawner.remove();
            this.enemySpawner = null;
        }
        
        // 清除所有敌人
        this.enemies.clear(true, true);
        
        // 显示关卡完成界面
        const completeBg = this.add.rectangle(640, 360, 500, 250, 0x000000, 0.9);
        
        this.add.text(640, 280, '关卡完成！', {
            font: '48px Arial',
            fill: '#00ff00',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.add.text(640, 340, `完成条件: ${reason}`, {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(640, 370, `最终分数: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(640, 400, '按 R 重新开始', {
            font: '16px Arial',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        this.add.text(640, 430, '按 N 下一关', {
            font: '16px Arial',
            fill: '#00ffff'
        }).setOrigin(0.5);
        
        // 添加下一关按键监听器
        this.input.keyboard.on('keydown-N', this.nextLevel, this);
        
        // 🆕 不暂停场景，保持输入监听器活跃
        // this.scene.pause(); // 移除这行，避免输入监听器失效
    }
    
    // 🆕 下一关
    nextLevel() {
        console.log('MainScene: 进入下一关');
        this.level++;
        
        // 清理事件监听器
        this.input.keyboard.off('keydown-N', this.nextLevel, this);
        
        // 重新开始场景，传递新的关卡信息
        this.scene.restart();
    }
} 