// ObstacleManager.js - 障碍物管理器
import { Obstacle } from './Obstacle.js';
import { OBSTACLE_TYPES, LEVEL_OBSTACLE_CONFIG, OBSTACLE_SPAWN_PATTERNS } from './obstacleTypes.js';

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        
        // 使用对象池创建障碍物组
        this.obstacles = this.scene.physics.add.group({
            classType: Obstacle,
            maxSize: 50, // 最大对象池大小
            runChildUpdate: true
        });
        
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
        // 回收所有活跃的障碍物
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.active) {
                obstacle.recycle();
            }
        });
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
  
    // ✅ 检查位置是否有效 - 修复循环逻辑错误
    isPositionValid(x, y) {
        const minObstacleDistance = 80;
      
        // 检查与现有障碍物的距离 - 使用 for...of 循环
        for (const obstacle of this.obstacles.getChildren()) {
            if (obstacle.active) {
                const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
                if (distance < minObstacleDistance) {
                    return false; // ✅ 正确中断并返回值
                }
            }
        }
      
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
  
    // 🪨 创建单个障碍物 - 专注生成，移除碰撞设置
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
      
        // group.get() 会自动处理创建新实例的情况
        const obstacle = this.obstacles.get(x, y);
        
        if (obstacle) {
            // 不论是获取的还是新建的，都调用 spawn 来初始化/重置
            obstacle.spawn(x, y, obstacleData);
        }
        
        this.obstaclesSpawned++;
    }
  
    // 💀 障碍物被摧毁时的回调
    onObstacleDestroyed(obstacle) {
        this.obstaclesSpawned--;
        console.log(`💀 障碍物被摧毁: ${obstacle.name}, 剩余: ${this.obstaclesSpawned}`);
      
        // 在这里调用，时机最精确
        this.checkSpawnNewObstacles();
    }
  
    // 🔄 检查是否需要生成新的障碍物
    checkSpawnNewObstacles() {
        // 如果障碍物数量低于阈值，生成新的
        const minObstacles = Math.max(5, this.maxObstacles * 0.3);
        if (this.obstaclesSpawned < minObstacles) {
            this.spawnObstacles();
        }
    }
  
    // 📊 获取障碍物状态
    getObstacleStatus() {
        return {
            active: this.obstaclesSpawned, // 直接使用这个计数器
            max: this.maxObstacles,
            level: this.currentLevel
        };
    }
  
    // 💀 销毁障碍物管理器
    destroy() {
        // 清理所有障碍物
        this.obstacles.clear(true, true);
        console.log('💀 障碍物管理器已销毁');
    }
} 