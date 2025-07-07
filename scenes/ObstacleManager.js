// ObstacleManager.js - 障碍物管理器
class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = scene.add.group();
        this.currentLevel = 'forest';
        this.obstaclesSpawned = 0;
        this.maxObstacles = 20;
      
        // 生成配置
        this.spawnConfig = null;
        this.spawnPattern = null;
      
        console.log('🪨 障碍物管理器初始化完成');
    }
  
    // 🌍 设置当前关卡
    setLevel(levelType) {
        this.currentLevel = levelType;
        this.resetObstacles();
        this.loadLevelConfig();
        console.log(`🌍 障碍物系统切换到关卡: ${levelType}`);
    }
  
    // 🔄 重置障碍物
    resetObstacles() {
        this.obstacles.clear(true, true);
        this.obstaclesSpawned = 0;
    }
  
    // 📋 加载关卡配置
    loadLevelConfig() {
        this.spawnConfig = LEVEL_OBSTACLE_CONFIG[this.currentLevel];
        if (this.spawnConfig) {
            this.spawnPattern = OBSTACLE_SPAWN_PATTERNS[this.spawnConfig.spawnPattern];
            this.maxObstacles = this.spawnConfig.maxCount;
            console.log(`📋 加载关卡配置: ${this.currentLevel}, 最大障碍物: ${this.maxObstacles}`);
        }
    }
  
    // 🎯 生成障碍物
    spawnObstacles() {
        if (!this.spawnConfig || this.obstaclesSpawned >= this.maxObstacles) {
            return;
        }
      
        console.log(`🎯 开始生成障碍物，当前: ${this.obstaclesSpawned}/${this.maxObstacles}`);
      
        const pattern = this.spawnConfig.spawnPattern;
        const clusterSize = this.spawnPattern.clusterSize;
        const attempts = 50; // 最大尝试次数
      
        for (let attempt = 0; attempt < attempts && this.obstaclesSpawned < this.maxObstacles; attempt++) {
            const spawnPos = this.findValidSpawnPosition();
            if (spawnPos) {
                this.createObstacleCluster(spawnPos.x, spawnPos.y, clusterSize);
            }
        }
      
        console.log(`✅ 障碍物生成完成，总数: ${this.obstaclesSpawned}`);
    }
  
    // 📍 寻找有效生成位置
    findValidSpawnPosition() {
        // 🆕 横版卷轴：使用扩展的世界尺寸
        const mapWidth = 4000;
        const mapHeight = 720;
        const player = this.scene.player;
        const playerX = player ? player.x : 100;
        const playerY = player ? player.y : mapHeight / 2;
      
        const minDistance = this.spawnPattern.minDistance;
        const maxDistance = this.spawnPattern.maxDistance;
      
        for (let i = 0; i < 20; i++) {
            // 🆕 横版卷轴：在玩家前方生成障碍物
            const distance = Phaser.Math.FloatBetween(minDistance, maxDistance);
            const x = playerX + distance; // 在玩家右侧生成
            const y = Phaser.Math.FloatBetween(100, mapHeight - 100);
          
            // 检查边界
            if (x < playerX + 200 || x > mapWidth - 100 || y < 100 || y > mapHeight - 100) {
                continue;
            }
          
            // 检查与其他障碍物的距离
            if (this.isPositionValid(x, y)) {
                return { x, y };
            }
        }
      
        return null;
    }
  
    // ✅ 检查位置是否有效
    isPositionValid(x, y) {
        const minObstacleDistance = 80;
      
        // 检查与现有障碍物的距离
        this.obstacles.children.entries.forEach(obstacle => {
            const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
            if (distance < minObstacleDistance) {
                return false;
            }
        });
      
        // 检查与玩家的距离
        const player = this.scene.player;
        if (player) {
            const playerDistance = Phaser.Math.Distance.Between(x, y, player.x, player.y);
            if (playerDistance < 150) {
                return false;
            }
        }
      
        return true;
    }
  
    // 🎯 创建障碍物集群
    createObstacleCluster(centerX, centerY, clusterSize) {
        const clusterRadius = 60;
      
        for (let i = 0; i < clusterSize && this.obstaclesSpawned < this.maxObstacles; i++) {
            const angle = (i / clusterSize) * Math.PI * 2;
            const distance = Phaser.Math.FloatBetween(20, clusterRadius);
          
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
          
            if (this.isPositionValid(x, y)) {
                this.createSingleObstacle(x, y);
            }
        }
    }
  
    // 🪨 创建单个障碍物
    createSingleObstacle(x, y) {
        // 随机选择障碍物类型
        const availableTypes = this.spawnConfig.types;
        const randomType = Phaser.Utils.Array.GetRandom(availableTypes);
        const obstacleData = OBSTACLE_TYPES[randomType];
      
        if (!obstacleData) {
            console.warn(`⚠️ 未找到障碍物数据: ${randomType}`);
            return;
        }
      
        console.log(`🪨 生成障碍物: ${obstacleData.name} 在位置 (${x}, ${y})`);
      
        // 创建障碍物
        const obstacle = new Obstacle(this.scene, x, y, obstacleData);
        this.obstacles.add(obstacle);
        this.obstaclesSpawned++;
      
        // 设置碰撞
        this.setupObstacleCollisions(obstacle);
    }
  
    // ⚙️ 设置障碍物碰撞
    setupObstacleCollisions(obstacle) {
        // 玩家与障碍物碰撞
        this.scene.physics.add.collider(
            this.scene.player,
            obstacle,
            this.handlePlayerObstacleCollision,
            null,
            this.scene
        );
      
        // 敌人与障碍物碰撞
        if (this.scene.enemies) {
            this.scene.physics.add.collider(
                this.scene.enemies,
                obstacle,
                this.handleEnemyObstacleCollision,
                null,
                this.scene
            );
        }
      
        // 玩家子弹与障碍物碰撞
        if (this.scene.bullets) {
            this.scene.physics.add.overlap(
                this.scene.bullets,
                obstacle,
                this.handleBulletObstacleCollision,
                null,
                this.scene
            );
        }
      
        // 敌人子弹与障碍物碰撞
        if (this.scene.enemyBullets) {
            this.scene.physics.add.overlap(
                this.scene.enemyBullets,
                obstacle,
                this.handleEnemyBulletObstacleCollision,
                null,
                this.scene
            );
        }
    }
  
    // 💥 玩家与障碍物碰撞
    handlePlayerObstacleCollision(player, obstacle) {
        console.log(`💥 玩家撞击障碍物: ${obstacle.name}`);
      
        // 击退玩家
        const angle = Phaser.Math.Angle.Between(obstacle.x, obstacle.y, player.x, player.y);
        const knockbackForce = 200;
      
        player.body.setVelocity(
            Math.cos(angle) * knockbackForce,
            Math.sin(angle) * knockbackForce
        );
      
        // 如果障碍物可摧毁，造成伤害
        if (obstacle.isDestructible && player.takeDamage) {
            player.takeDamage(10); // 撞击伤害
        }
    }
  
    // 🤖 敌人与障碍物碰撞
    handleEnemyObstacleCollision(enemy, obstacle) {
        // 击退敌人
        const angle = Phaser.Math.Angle.Between(obstacle.x, obstacle.y, enemy.x, enemy.y);
        const knockbackForce = 150;
      
        enemy.body.setVelocity(
            Math.cos(angle) * knockbackForce,
            Math.sin(angle) * knockbackForce
        );
      
        // 敌人受到伤害
        if (enemy.takeDamage) {
            enemy.takeDamage(20);
        }
    }
  
    // 🔫 玩家子弹与障碍物碰撞
    handleBulletObstacleCollision(bullet, obstacle) {
        if (!bullet.active || !obstacle.isDestructible) return;
      
        console.log(`🔫 ${bullet.weaponType} 击中障碍物: ${obstacle.name}`);
      
        // 计算伤害
        let damage = bullet.damage || 20;
      
        // 武器类型加成
        switch (bullet.weaponType) {
            case '狙击枪':
                damage *= 1.5;
                break;
            case '火箭筒':
                damage *= 2.0;
                break;
            case '激光枪':
                damage *= 1.3;
                break;
            case '导弹':
                damage *= 3.0;
                break;
            case '核弹':
                damage *= 5.0;
                break;
        }
      
        // 对障碍物造成伤害
        obstacle.takeDamage(damage, 'bullet', bullet);
      
        // 销毁子弹
        bullet.destroy();
      
        // 创建撞击特效
        this.createObstacleHitEffect(bullet.x, bullet.y, bullet.weaponType);
    }
  
    // 💀 敌人子弹与障碍物碰撞
    handleEnemyBulletObstacleCollision(bullet, obstacle) {
        if (!bullet.active) return;
      
        console.log(`💀 敌人子弹击中障碍物: ${obstacle.name}`);
      
        // 回收子弹到对象池
        bullet.kill();
      
        // 创建撞击特效
        this.createObstacleHitEffect(bullet.x, bullet.y, 'enemy');
    }
  
    // ✨ 创建障碍物受击特效
    createObstacleHitEffect(x, y, weaponType) {
        let tintColor = 0xffff00;
        let quantity = 8;
      
        switch (weaponType) {
            case '狙击枪':
                tintColor = 0xff0000;
                quantity = 10;
                break;
            case '激光枪':
                tintColor = 0x00ffff;
                quantity = 8;
                break;
            case '火箭筒':
                tintColor = 0xff4444;
                quantity = 12;
                break;
            case 'enemy':
                tintColor = 0xff6666;
                quantity = 6;
                break;
        }
      
        const hitEffect = this.scene.add.particles(x, y, 'bullet', {
            speed: { min: 40, max: 100 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: quantity,
            tint: tintColor
        }).setDepth(150);
      
        this.scene.time.delayedCall(600, () => {
            hitEffect.destroy();
        });
    }
  
    // 🏆 障碍物被摧毁
    onObstacleDestroyed(obstacle) {
        console.log(`🏆 障碍物被摧毁: ${obstacle.name}`);
      
        // 从组中移除
        this.obstacles.remove(obstacle);
        this.obstaclesSpawned--;
      
        // 显示摧毁通知
        this.showDestructionNotification(obstacle.name);
      
        // 可能生成新的障碍物
        this.checkSpawnNewObstacles();
    }
  
    // 📢 显示摧毁通知
    showDestructionNotification(obstacleName) {
        const notification = this.scene.add.container(640, 100);
      
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 300, 60, 0x000000, 0.7)
            .setStroke(0xff8800, 2);
      
        // 文字
        const text = this.scene.add.text(0, 0, `💥 ${obstacleName} 被摧毁！`, {
            fontSize: '16px',
            fill: '#ff8800',
            align: 'center'
        }).setOrigin(0.5);
      
        notification.add([bg, text]);
        notification.setDepth(1500);
      
        // 动画
        notification.setScale(0);
        this.scene.tweens.add({
            targets: notification,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back'
        });
      
        // 3秒后消失
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
  
    // 🔄 检查生成新障碍物
    checkSpawnNewObstacles() {
        // 如果障碍物数量低于阈值，生成新的
        const threshold = this.maxObstacles * 0.7;
        if (this.obstaclesSpawned < threshold) {
            this.spawnObstacles();
        }
    }
  
    // 🔄 更新障碍物系统
    update(time, delta) {
        // 更新所有障碍物
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.update) {
                obstacle.update(time, delta);
            }
        });
    }
  
    // 📊 获取障碍物状态
    getObstacleStatus() {
        return {
            count: this.obstaclesSpawned,
            maxCount: this.maxObstacles,
            level: this.currentLevel
        };
    }
  
    // 🧹 清理障碍物系统
    destroy() {
        this.obstacles.clear(true, true);
        this.resetObstacles();
    }
}

window.ObstacleManager = ObstacleManager; 