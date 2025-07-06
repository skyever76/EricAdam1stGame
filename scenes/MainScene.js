// scenes/MainScene.js

// 定义一个子弹类，用于对象池和自我管理
class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(player, weapon) {
        this.setActive(true).setVisible(true);
        this.body.reset(player.x + 30, player.y);

        // 计算射击角度
        const angle = Phaser.Math.Angle.Between(
            player.x, player.y,
            this.scene.input.activePointer.worldX,
            this.scene.input.activePointer.worldY
        );

        // 设置速度和大小
        this.scene.physics.velocityFromRotation(
            angle,
            weapon.speed,
            this.body.velocity
        );
      
        this.setDisplaySize(10, 5);
        this.setTint(0xffff00); // 添加黄色子弹颜色

        // 自动销毁
        this.scene.time.delayedCall(2000, () => {
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
      
        // 初始化玩家系统
        this.selectedPlayer = data?.player || {
            key: 'soldier',
            name: '士兵',
            speed: 400,
            health: 100
        };

        console.log('MainScene: 选中的玩家:', this.selectedPlayer);

        // 获取保存的积分
        this.savedPoints = this.getSavedPoints();
    
        // 游戏状态
        this.playerHealth = this.selectedPlayer.health;
        this.score = 0;
        this.gameTime = 0;
        this.kills = 0;
        this.difficultyLevel = 1;
    
        // 难度配置
        this.difficulty = {
            enemySpawnRate: 2000,
            enemySpeed: 100,
            enemyHealth: 30
        };
    }

    create() {
        console.log('MainScene: 创建场景开始');
        console.log('MainScene: 可用纹理列表:', this.textures.getTextureKeys());
      
        // 射击冷却时间初始化
        this.lastShootTime = 0;
    
        // 创建背景
        this.createBackground();
    
        // 设置物理边界
        this.physics.world.setBounds(0, 0, 1280, 720);
    
        // 创建玩家
        this.createPlayer();
      
        // 子弹系统
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 50
        });
      
        // 敌人系统
        this.enemies = this.physics.add.group();
      
        // 碰撞检测
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHit, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, null, this);
      
        // 输入控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.shoot, this);
        this.input.keyboard.on('keydown-SPACE', this.shoot, this);
      
        // 添加暂停功能
        this.input.keyboard.on('keydown-P', this.togglePause, this);
      
        // 创建UI
        this.createHUD();
      
        // 开始生成敌人
        this.startEnemySpawner();

        // 显示游戏版本
        this.add.text(1200, 700, 'v2.2-Fixed', { 
            font: '14px Arial', 
            fill: '#666666' 
        }).setOrigin(1);
      
        console.log('MainScene: 场景创建完成');
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
      
        if (this.selectedPlayer && this.textures.exists(this.selectedPlayer.key)) {
            playerTexture = this.selectedPlayer.key;
            console.log('MainScene: 使用角色纹理:', playerTexture);
        } else {
            console.log('MainScene: 使用默认玩家纹理:', playerTexture);
        }
          
        this.player = this.physics.add.sprite(100, 360, playerTexture)
            .setCollideWorldBounds(true)
            .setDisplaySize(40, 40);
    
        console.log('MainScene: 玩家创建完成');
    }

    createHUD() {
        const style = { font: '20px Arial', fill: '#ffffff', backgroundColor: '#000' };
      
        // 玩家信息显示
        this.playerText = this.add.text(20, 20, `角色: ${this.selectedPlayer.name}`, {
            font: '20px Arial',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
      
        // 保存的积分显示
        this.savedPointsText = this.add.text(20, 50, `保存积分: ${this.savedPoints}`, {
            font: '20px Arial',
            fill: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
      
        // 当前游戏分数显示
        this.scoreText = this.add.text(20, 80, '当前分数: 0', {
            font: '20px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
      
        // 生命值显示
        this.healthText = this.add.text(20, 110, `生命值: ${this.playerHealth}`, {
            font: '20px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
      
        // 时间显示
        this.timeText = this.add.text(20, 140, '时间: 0秒', {
            font: '20px Arial',
            fill: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
      
        // 击杀显示
        this.killsText = this.add.text(20, 170, '击杀: 0', {
            font: '20px Arial',
            fill: '#ff00ff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
      
        // 控制说明
        this.add.text(1100, 20, '控制说明:', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        });
      
        const controls = [
            '方向键: 移动',
            '空格/鼠标: 射击',
            'P: 暂停',
            'S: 保存积分'
        ];
      
        controls.forEach((text, i) => {
            this.add.text(1100, 45 + i * 20, text, {
                font: '14px Arial',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
        });

        // 添加保存积分按钮
        this.saveButton = this.add.text(1100, 150, '保存积分', { 
            font: '18px Arial', 
            fill: '#00ff00',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.savePoints());

        // 添加键盘快捷键
        this.input.keyboard.on('keydown-S', () => this.savePoints());
    }

    update(time, delta) {
        if (this.scene.isPaused()) return;
      
        // 更新时间
        this.gameTime += delta;
        this.timeText.setText(`时间: ${Math.floor(this.gameTime / 1000)}秒`);
      
        // 玩家移动
        this.handlePlayerMovement();
      
        // 敌人生成
        if (this.nextSpawn && time > this.nextSpawn) {
            this.spawnEnemy();
            this.nextSpawn = time + this.difficulty.enemySpawnRate;
        }
    }

    handlePlayerMovement() {
        this.player.setVelocity(0);
        const speed = this.selectedPlayer.speed; // 使用玩家角色的速度

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        if (this.cursors.down.isDown) this.player.setVelocityY(speed);
    }

    shoot() {
        const now = this.time.now;
      
        // 添加this.lastShootTime的初始化检查
        if (typeof this.lastShootTime === 'undefined') {
            this.lastShootTime = 0;  // 确保变量已初始化
        }
      
        // 检查射击冷却
        if (now - this.lastShootTime > 300) { // 固定射速
            // 从池中获取子弹
            const bullet = this.bullets.get(this.player.x, this.player.y);
          
            if (bullet) {
                bullet.fire(this.player, { speed: 400 }); // 固定子弹速度
                this.lastShootTime = now;
            }
        }
    }

    startEnemySpawner() {
        this.nextSpawn = this.time.now + this.difficulty.enemySpawnRate;
      
        // 10秒后开始增加难度
        this.time.delayedCall(10000, () => {
            this.increaseDifficulty();
          
            // 每20秒增加一次难度
            this.difficultyTimer = this.time.addEvent({
                delay: 20000,
                callback: this.increaseDifficulty,
                callbackScope: this,
                loop: true
            });
        });
    }

    spawnEnemy() {
        // 安全检查
        if (!this.player || !this.player.active) return;

        // 创建敌人
        const enemy = this.enemies.create(
            Phaser.Math.Between(1100, 1300),
            Phaser.Math.Between(100, 620),
            'enemy'
        );
      
        enemy.setTint(0xff0000)
            .setDisplaySize(30, 30)
            .setCollideWorldBounds(true);
      
        // 设置敌人行为
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (enemy.active) {
                    this.physics.moveToObject(enemy, this.player, 100);
                }
            }
        });
    }

    handleBulletHit(bullet, enemy) {
        bullet.destroy();
      
        // 处理伤害
        if (enemy.health === undefined) enemy.health = 10;
        enemy.health -= 10; // 固定伤害
      
        if (enemy.health <= 0) {
            enemy.destroy();
            this.kills++;
            this.score += 10;
            this.updateHUD();
        }
    }

    handlePlayerHit(player, enemy) {
        enemy.destroy();
        this.playerHealth -= 20;
        this.updateHUD();
      
        // 屏幕震动
        this.cameras.main.shake(100);
      
        // 检查游戏结束
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    updateHUD() {
        this.scoreText.setText(`当前分数: ${this.score}`);
        this.healthText.setText(`生命值: ${this.playerHealth}`);
        this.killsText.setText(`击杀: ${this.kills}`);
      
        // 根据生命值变化颜色 - 修复：使用setStyle而不是setColor
        if (this.playerHealth <= 30) {
            this.healthText.setStyle({ fill: '#ff0000' });
        } else if (this.playerHealth <= 60) {
            this.healthText.setStyle({ fill: '#ffff00' });
        } else {
            this.healthText.setStyle({ fill: '#00ff00' });
        }
    }

    savePoints() {
        // 保存当前积分到localStorage
        const totalPoints = this.savedPoints + this.score;
        localStorage.setItem('gamePoints', totalPoints.toString());
      
        // 更新显示
        this.savedPoints = totalPoints;
        this.savedPointsText.setText(`保存积分: ${this.savedPoints}`);
      
        // 修复：正确设置名称和移除
        const saveMessage = this.add.text(640, 200, '积分已保存！', { 
            font: '32px Arial', 
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setName('saveMessage'); // 添加名称
      
        // 2秒后移除提示
        this.time.delayedCall(2000, () => {
            if (saveMessage && saveMessage.active) {
                saveMessage.destroy();
            }
        });
    }

    getSavedPoints() {
        // 从localStorage获取保存的积分
        const savedPoints = localStorage.getItem('gamePoints');
        return savedPoints ? parseInt(savedPoints) : 0;
    }

    togglePause() {
        if (this.scene.isPaused()) {
            this.scene.resume();
            // 修复：正确移除暂停菜单
            const pauseMenu = this.children.getByName('pauseMenu');
            if (pauseMenu) {
                pauseMenu.destroy();
            }
        } else {
            this.scene.pause();
        
            // 创建暂停菜单 - 修复组的创建和命名
            const pauseGroup = this.add.group();
            pauseGroup.setName('pauseMenu');
        
            // 半透明背景
            const pauseBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
            pauseGroup.add(pauseBg);
        
            // 标题
            const pauseTitle = this.add.text(640, 200, '游戏暂停', 
                { font: '64px Arial', fill: '#ffff00' }
            ).setOrigin(0.5);
            pauseGroup.add(pauseTitle);
        
            // 继续游戏按钮
            const continueBtn = this.add.text(640, 320, '继续游戏', 
                { font: '32px Arial', fill: '#00ff00' }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.togglePause());
        
            pauseGroup.add(continueBtn);
        
            // 主菜单按钮
            const menuBtn = this.add.text(640, 380, '返回主菜单', 
                { font: '32px Arial', fill: '#ff0000' }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop();
                this.scene.start('PlayerSelectScene');
            });
        
            pauseGroup.add(menuBtn);
        }
    }

    gameOver() {
        this.physics.pause();
      
        // 游戏结束文本
        this.add.text(640, 300, '游戏结束', 
            { font: '64px Arial', fill: '#ff0000' }
        ).setOrigin(0.5);
      
        // 最终统计
        const stats = [
            `最终分数: ${this.score}`,
            `生存时间: ${Math.floor(this.gameTime / 1000)}秒`,
            `击杀数: ${this.kills}`,
            `保存的积分: ${this.savedPoints + this.score}`
        ];
      
        stats.forEach((text, i) => {
            this.add.text(640, 370 + i * 40, text, 
                { font: '32px Arial', fill: '#ffffff' }
            ).setOrigin(0.5);
        });
      
        // 重新开始提示
        this.add.text(640, 580, '按R键重新开始', 
            { font: '24px Arial', fill: '#00ff00' }
        ).setOrigin(0.5);
      
        // 重新开始监听
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('PlayerSelectScene');
        });
    }

    increaseDifficulty() {
        this.difficultyLevel++;
      
        // 增加难度
        this.difficulty.enemySpawnRate = Math.max(1000, this.difficulty.enemySpawnRate - 150);
        this.difficulty.enemySpeed += 10;
      
        // 难度提示
        this.add.text(640, 100, `难度提升至 ${this.difficultyLevel}`, 
            { font: '32px Arial', fill: '#ff0000' }
        )
        .setOrigin(0.5)
        .setDepth(100);
    }
} 