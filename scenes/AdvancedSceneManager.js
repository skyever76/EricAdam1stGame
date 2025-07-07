// AdvancedSceneManager.js - 高级场景管理器（重构版）

import { ADVANCED_SCENES, SCENE_EFFECTS } from './advancedScenes.js';

export class AdvancedSceneManager {
    constructor(scene, sceneConfig = null) {
        this.scene = scene;
        this.sceneConfig = sceneConfig || ADVANCED_SCENES;
        this.currentSceneData = null;
        this.activeEffects = new Map();
        this.hazardTimers = new Map();
        this.mechanicStates = new Map();
        this.damageZones = new Map(); // 新增：伤害区域管理
      
        console.log('🌍 高级场景管理器初始化完成');
    }
  
    // 🎬 加载场景
    loadScene(sceneId) {
        const sceneData = this.sceneConfig[sceneId];
        if (!sceneData) {
            console.warn(`⚠️ 未找到场景: ${sceneId}`);
            return false;
        }
      
        console.log(`🎬 加载场景: ${sceneData.name}`);
      
        // 清理当前场景
        this.clearCurrentScene();
      
        this.currentSceneData = sceneData;
      
        // 设置场景基础
        this.setupSceneBase();
      
        // 初始化特效
        this.initializeEffects();
      
        // 设置环境危害
        this.setupHazards();
      
        // 初始化特殊机制
        this.initializeMechanics();
      
        // 编排其他管理器生成实体
        this.orchestrateEntityGeneration();
      
        console.log(`✅ 场景加载完成: ${sceneData.name}`);
        return true;
    }
  
    // 🎨 设置场景基础
    setupSceneBase() {
        const data = this.currentSceneData;
      
        // 设置背景色
        this.scene.cameras.main.setBackgroundColor(data.backgroundColor);
      
        // 创建环境光效
        this.createAmbientLighting(data.ambientColor);
    }
  
    // 💡 创建环境光效
    createAmbientLighting(color) {
        this.ambientLight = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            color,
            0.1
        );
        this.ambientLight.setBlendMode(Phaser.BlendModes.ADD);
        this.ambientLight.setDepth(-10);
        this.ambientLight.setScrollFactor(0.5);
    }
  
    // ✨ 初始化特效
    initializeEffects() {
        const effects = this.currentSceneData.effects;
      
        Object.keys(effects).forEach(effectType => {
            if (effects[effectType] && SCENE_EFFECTS[effectType]) {
                this.createEffect(effectType);
            }
        });
    }
  
    // 🎪 创建特效（使用策略模式）
    createEffect(effectType) {
        const effectConfig = this.currentSceneData.effects[effectType];
        if (effectConfig && effectConfig.enabled && SCENE_EFFECTS[effectType]) {
            // 将详细配置传递给特效函数
            const createdEffects = SCENE_EFFECTS[effectType](this.scene, effectConfig);
            this.activeEffects.set(effectType, createdEffects);
            
            // 根据特效类型应用动画
            this.applyEffectAnimations(effectType, createdEffects);
            
            console.log(`✨ 创建特效: ${effectType}`);
        }
    }
    
    // 🎬 应用特效动画
    applyEffectAnimations(effectType, effects) {
        switch (effectType) {
            case 'electricArcs':
                // 电弧闪烁动画
                this.scene.tweens.add({
                    targets: effects,
                    alpha: 0.2,
                    duration: 100,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Power2'
                });
                break;
                
            case 'rotatingGears':
                // 齿轮旋转动画
                effects.forEach(gear => {
                    this.scene.tweens.add({
                        targets: gear,
                        angle: 360,
                        duration: Phaser.Math.Between(3000, 8000),
                        repeat: -1,
                        ease: 'Linear'
                    });
                });
                break;
                
            case 'realityWarp':
                // 现实扭曲动画
                effects.forEach(warp => {
                    this.scene.tweens.add({
                        targets: warp,
                        scaleX: 1.5,
                        scaleY: 1.5,
                        alpha: 0,
                        duration: 2000,
                        repeat: -1,
                        ease: 'Power2'
                    });
                });
                break;
                
            case 'temporalRift':
                // 时空裂隙动画
                effects.forEach(rift => {
                    this.scene.tweens.add({
                        targets: rift,
                        scaleX: 2,
                        scaleY: 2,
                        alpha: 0,
                        duration: 1500,
                        repeat: -1,
                        ease: 'Power2'
                    });
                });
                break;
        }
    }
  
    // ⚠️ 设置环境危害
    setupHazards() {
        const hazards = this.currentSceneData.hazards;
      
        Object.keys(hazards).forEach(hazardType => {
            if (hazards[hazardType] && hazards[hazardType].enabled) {
                this.setupHazard(hazardType, hazards[hazardType]);
            }
        });
    }
  
    // 🚨 设置单个危害
    setupHazard(hazardType, hazardData) {
        switch (hazardType) {
            case 'steamJets':
                this.setupSteamJets(hazardData);
                break;
            case 'sporePoison':
                this.setupSporePoison(hazardData);
                break;
        }
    }
  
    // 🌫️ 设置蒸汽喷射
    setupSteamJets(data) {
        const jetPositions = data.positions || [];
        const steamJets = [];
      
        jetPositions.forEach((jet, index) => {
            const steamJet = {
                x: jet.x,
                y: jet.y,
                damage: jet.damage || 15,
                interval: jet.interval || 3000,
                lastTrigger: 0,
                active: false
            };
          
            // 创建蒸汽喷射的视觉指示器
            const indicator = this.scene.add.graphics();
            indicator.lineStyle(3, 0x888888, 0.5);
            indicator.strokeCircle(jet.x, jet.y, 30);
            indicator.setDepth(20);
          
            steamJet.indicator = indicator;
            steamJets.push(steamJet);
        });
      
        this.mechanicStates.set('steamJets', steamJets);
        console.log(`🌫️ 设置蒸汽喷射: ${steamJets.length}个`);
    }
  
    // ☠️ 设置孢子毒害
    setupSporePoison(data) {
        this.mechanicStates.set('sporePoison', {
            damage: data.damage || 8,
            interval: data.interval || 1000,
            lastDamage: 0
        });
        console.log('☠️ 设置孢子毒害');
    }
  
    // ⚙️ 初始化特殊机制
    initializeMechanics() {
        const mechanics = this.currentSceneData.mechanics;
      
        Object.keys(mechanics).forEach(mechanicType => {
            if (mechanics[mechanicType]) {
                this.initializeMechanic(mechanicType);
            }
        });
    }
  
    // 🔧 初始化单个机制
    initializeMechanic(mechanicType) {
        switch (mechanicType) {
            case 'destructiblePipes':
                this.initializeDestructiblePipes();
                break;
            case 'bloodCurrent':
                this.initializeBloodCurrent();
                break;
            case 'realityGlitch':
                this.initializeRealityGlitch();
                break;
            case 'lightReflection':
                this.initializeLightReflection();
                break;
        }
    }
  
    // 🔧 初始化可破坏管道
    initializeDestructiblePipes() {
        const pipes = [];
        for (let i = 0; i < 3; i++) {
            const pipe = this.scene.add.graphics();
            pipe.fillStyle(0x888888, 0.8);
            pipe.fillRect(
                300 + i * 400,
                200 + (i % 2) * 300,
                100,
                200
            );
            pipe.setDepth(30);
            pipe.health = 100;
            pipe.active = true;
            pipes.push(pipe);
        }
        this.mechanicStates.set('destructiblePipes', pipes);
        console.log('🔧 初始化可破坏管道');
    }
  
    // 🩸 初始化血液流动
    initializeBloodCurrent() {
        const currentZones = [];
        for (let i = 0; i < 2; i++) {
            const zone = {
                x: 500 + i * 800,
                y: 300 + (i % 2) * 200,
                width: 200,
                height: 400,
                forceX: 50,
                forceY: 0
            };
            currentZones.push(zone);
        }
        this.mechanicStates.set('bloodCurrent', currentZones);
        console.log('🩸 初始化血液流动');
    }
  
    // 🌀 初始化现实故障
    initializeRealityGlitch() {
        this.mechanicStates.set('realityGlitch', {
            lastGlitch: 0,
            glitchInterval: 5000
        });
        console.log('🌀 初始化现实故障');
    }
  
    // 💡 初始化光线反射
    initializeLightReflection() {
        const reflectors = [];
        for (let i = 0; i < 4; i++) {
            const reflector = this.scene.add.graphics();
            reflector.lineStyle(4, 0xffffff, 0.6);
            reflector.strokeCircle(
                200 + i * 400,
                150 + (i % 2) * 300,
                40
            );
            reflector.setDepth(25);
            reflectors.push(reflector);
        }
        this.mechanicStates.set('lightReflectors', reflectors);
        console.log('💡 初始化光线反射');
    }
  
    // 🎭 编排实体生成（委托给其他管理器）
    orchestrateEntityGeneration() {
        // 委托给敌人管理器生成敌人
        this.orchestrateEnemyGeneration();
        
        // 委托给障碍物管理器生成障碍物
        this.orchestrateObstacleGeneration();
        
        // 委托给BOSS管理器生成BOSS
        this.orchestrateBossGeneration();
    }
  
    // 👹 编排敌人生成
    orchestrateEnemyGeneration() {
        const enemies = this.currentSceneData.enemies;
        if (!enemies || !this.scene.enemyManager) return;
      
        enemies.forEach(enemyConfig => {
            // 委托给敌人管理器
            if (this.scene.enemyManager && this.scene.enemyManager.spawnAdvancedEnemy) {
                this.scene.enemyManager.spawnAdvancedEnemy(enemyConfig);
            } else {
                console.warn('⚠️ 敌人管理器未找到或缺少spawnAdvancedEnemy方法');
            }
        });
    }
  
    // 🗿 编排障碍物生成
    orchestrateObstacleGeneration() {
        const obstacles = this.currentSceneData.obstacles;
        if (!obstacles || !this.scene.obstacleManager) return;
      
        obstacles.forEach(obstacleConfig => {
            // 委托给障碍物管理器
            if (this.scene.obstacleManager && this.scene.obstacleManager.spawnAdvancedObstacle) {
                this.scene.obstacleManager.spawnAdvancedObstacle(obstacleConfig);
            } else {
                console.warn('⚠️ 障碍物管理器未找到或缺少spawnAdvancedObstacle方法');
            }
        });
    }
  
    // 👑 编排BOSS生成
    orchestrateBossGeneration() {
        const bossType = this.currentSceneData.boss;
        if (!bossType || !this.scene.bossManager) return;
      
        // 延迟生成BOSS
        this.scene.time.delayedCall(30000, () => {
            if (this.scene.bossManager && this.scene.bossManager.spawnAdvancedBoss) {
                this.scene.bossManager.spawnAdvancedBoss(bossType);
            } else {
                console.warn('⚠️ BOSS管理器未找到或缺少spawnAdvancedBoss方法');
            }
        });
    }
  
    // 🔄 更新场景
    update(time, delta) {
        // 更新特效
        this.updateEffects(time, delta);
      
        // 更新机制
        this.updateMechanics(time, delta);
      
        // 检查环境危害
        this.checkEnvironmentalHazards(time, delta);
    }
  
    // ✨ 更新特效
    updateEffects(time, delta) {
        // 特效更新逻辑
        if (this.activeEffects.has('rotatingGears')) {
            // 齿轮已经有动画，不需要额外更新
        }
      
        if (this.activeEffects.has('bloodFlow')) {
            // 血液流动更新
            this.updateBloodFlow(time, delta);
        }
    }
  
    // 🩸 更新血液流动
    updateBloodFlow(time, delta) {
        const player = this.scene.player;
        if (!player) return;
      
        const currentZones = this.mechanicStates.get('bloodCurrent');
        if (!currentZones) return;
      
        currentZones.forEach(zone => {
            if (player.x >= zone.x - zone.width/2 && 
                player.x <= zone.x + zone.width/2 &&
                player.y >= zone.y && 
                player.y <= zone.y + zone.height) {
              
                // 应用血液流向力
                player.body.setAcceleration(zone.forceX, zone.forceY);
            }
        });
    }
  
    // ⚙️ 更新机制
    updateMechanics(time, delta) {
        // 检查可破坏管道
        const pipes = this.mechanicStates.get('destructiblePipes');
        if (pipes) {
            pipes.forEach(pipe => {
                if (pipe.health <= 0 && pipe.active) {
                    this.destroyPipe(pipe);
                }
            });
        }
        
        // 更新蒸汽喷射
        this.updateSteamJets(time, delta);
        
        // 更新现实故障
        this.updateRealityGlitch(time, delta);
    }
  
    // 🌫️ 更新蒸汽喷射
    updateSteamJets(time, delta) {
        const steamJets = this.mechanicStates.get('steamJets');
        if (!steamJets) return;
        
        steamJets.forEach(jet => {
            if (time - jet.lastTrigger > jet.interval) {
                this.triggerSteamJet(jet.x, jet.y, jet.damage);
                jet.lastTrigger = time;
            }
        });
    }
  
    // 🌫️ 触发蒸汽喷射
    triggerSteamJet(x, y, damage) {
        // 创建蒸汽喷射效果
        const steam = this.scene.add.particles(x, y, 'bullet', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            angle: { min: 240, max: 300 },
            quantity: 10,
            tint: 0xeeeeee
        }).setDepth(100);
      
        // 创建伤害区域（而不是直接伤害玩家）
        const damageZone = this.scene.add.zone(x, y, 80, 80);
        damageZone.setData('damage', damage);
        damageZone.setData('type', 'steamJet');
        this.damageZones.set(damageZone, {
            damage: damage,
            type: 'steamJet',
            created: this.scene.time.now
        });
      
        // 1秒后销毁
        this.scene.time.delayedCall(1000, () => {
            steam.destroy();
            damageZone.destroy();
            this.damageZones.delete(damageZone);
        });
    }
  
    // 🌀 更新现实故障
    updateRealityGlitch(time, delta) {
        const glitchData = this.mechanicStates.get('realityGlitch');
        if (!glitchData) return;
        
        if (time - glitchData.lastGlitch > glitchData.glitchInterval) {
            this.triggerRealityGlitch();
            glitchData.lastGlitch = time;
        }
    }
  
    // 🌀 触发现实故障
    triggerRealityGlitch() {
        const player = this.scene.player;
        if (!player) return;
      
        // 创建故障效果
        const glitch = this.scene.add.graphics();
        glitch.fillStyle(0xff00ff, 0.3);
        glitch.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        glitch.setDepth(200);
      
        // 随机移动玩家
        const randomX = (Math.random() - 0.5) * 200;
        const randomY = (Math.random() - 0.5) * 200;
        player.setPosition(player.x + randomX, player.y + randomY);
      
        // 0.5秒后移除故障效果
        this.scene.time.delayedCall(500, () => {
            glitch.destroy();
        });
    }
  
    // 🔧 销毁管道
    destroyPipe(pipe) {
        console.log('🔧 管道被摧毁');
      
        // 爆炸效果
        const explosion = this.scene.add.particles(pipe.x, pipe.y, 'bullet', {
            speed: { min: 80, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            blendMode: 'ADD',
            angle: { min: 0, max: 360 },
            quantity: 15,
            tint: 0x888888
        }).setDepth(100);
      
        pipe.destroy();
      
        this.scene.time.delayedCall(1000, () => {
            explosion.destroy();
        });
    }
  
    // ⚠️ 检查环境危害
    checkEnvironmentalHazards(time, delta) {
        const player = this.scene.player;
        if (!player) return;
      
        // 检查孢子毒害伤害
        const sporePoison = this.mechanicStates.get('sporePoison');
        if (sporePoison && this.currentSceneData.id === 'mutated_jungle') {
            if (time - sporePoison.lastDamage > sporePoison.interval) {
                // 创建伤害区域而不是直接伤害
                const damageZone = this.scene.add.zone(player.x, player.y, 50, 50);
                damageZone.setData('damage', sporePoison.damage);
                damageZone.setData('type', 'sporePoison');
                this.damageZones.set(damageZone, {
                    damage: sporePoison.damage,
                    type: 'sporePoison',
                    created: time
                });
                
                sporePoison.lastDamage = time;
                
                // 1秒后销毁伤害区域
                this.scene.time.delayedCall(1000, () => {
                    damageZone.destroy();
                    this.damageZones.delete(damageZone);
                });
            }
        }
      
        // 检查故障区域
        if (this.currentSceneData.id === 'cyberspace') {
            this.checkGlitchZones(player, time);
        }
    }
  
    // 🌀 检查故障区域
    checkGlitchZones(player, time) {
        const glitchZones = this.activeEffects.get('glitchArt');
        if (!glitchZones) return;
      
        // 在故障区域内时的混乱效果
        if (Math.random() < 0.01) { // 1%几率
            player.body.setVelocity(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
        }
    }
  
    // 🧹 清理当前场景
    clearCurrentScene() {
        // 清理特效
        this.activeEffects.forEach(effects => {
            effects.forEach(effect => {
                if (effect.destroy) effect.destroy();
            });
        });
        this.activeEffects.clear();
      
        // 清理危害定时器
        this.hazardTimers.forEach(timer => {
            timer.destroy();
        });
        this.hazardTimers.clear();
      
        // 清理机制状态
        this.mechanicStates.forEach(state => {
            if (Array.isArray(state)) {
                state.forEach(item => {
                    if (item.destroy) item.destroy();
                });
            }
        });
        this.mechanicStates.clear();
        
        // 清理伤害区域
        this.damageZones.forEach((data, zone) => {
            if (zone.destroy) zone.destroy();
        });
        this.damageZones.clear();
      
        // 清理环境光
        if (this.ambientLight) {
            this.ambientLight.destroy();
            this.ambientLight = null;
        }
    }
  
    // 📊 获取场景状态
    getSceneStatus() {
        return {
            currentScene: this.currentSceneData?.name || 'None',
            activeEffects: this.activeEffects.size,
            activeHazards: this.hazardTimers.size,
            activeMechanics: this.mechanicStates.size,
            damageZones: this.damageZones.size
        };
    }
  
    // 🗑️ 销毁管理器
    destroy() {
        this.clearCurrentScene();
        console.log('🗑️ 高级场景管理器已销毁');
    }
} 