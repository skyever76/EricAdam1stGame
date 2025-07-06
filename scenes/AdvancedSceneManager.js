// AdvancedSceneManager.js - 高级场景管理器
class AdvancedSceneManager {
    constructor(scene) {
        this.scene = scene;
        this.currentSceneData = null;
        this.activeEffects = new Map();
        this.hazardTimers = new Map();
        this.mechanicStates = new Map();
      
        console.log('🌍 高级场景管理器初始化完成');
    }
  
    // 🎬 加载场景
    loadScene(sceneId) {
        const sceneData = ADVANCED_SCENES[sceneId];
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
      
        // 生成场景对象
        this.generateSceneObjects();
      
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
            if (effects[effectType]) {
                this.createEffect(effectType);
            }
        });
    }
  
    // 🎪 创建特效
    createEffect(effectType) {
        switch (effectType) {
            case 'steam':
                this.createSteamEffect();
                break;
            case 'electricArcs':
                this.createElectricArcs();
                break;
            case 'rotatingGears':
                this.createRotatingGears();
                break;
            case 'bloodFlow':
                this.createBloodFlow();
                break;
            case 'dataStream':
                this.createDataStream();
                break;
            case 'glitchArt':
                this.createGlitchEffect();
                break;
            case 'toxicSpores':
                this.createToxicSpores();
                break;
            case 'realityWarp':
                this.createRealityWarp();
                break;
            case 'divineLight':
                this.createDivineLight();
                break;
            case 'temporalRift':
                this.createTemporalRift();
                break;
            case 'crystalGlow':
                this.createCrystalGlow();
                break;
        }
    }
  
    // 🌫️ 蒸汽特效
    createSteamEffect() {
        const steamEmitters = [];
      
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
          
            const steam = this.scene.add.particles(x, y, 'bullet', {
                speed: { min: 20, max: 50 },
                scale: { start: 0.3, end: 0.8 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 3000,
                blendMode: 'ADD',
                angle: { min: 260, max: 280 },
                quantity: 2,
                frequency: 500,
                tint: 0xeeeeee
            }).setDepth(50);
          
            steamEmitters.push(steam);
        }
      
        this.activeEffects.set('steam', steamEmitters);
    }
  
    // ⚡ 电弧特效
    createElectricArcs() {
        const arcCount = 8;
        const arcs = [];
      
        for (let i = 0; i < arcCount; i++) {
            const arc = this.scene.add.graphics();
            arc.lineStyle(3, 0x00ffff, 0.8);
          
            const startX = Math.random() * 2000;
            const startY = Math.random() * 2000;
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = startY + (Math.random() - 0.5) * 200;
          
            this.drawLightning(arc, startX, startY, endX, endY);
            arc.setDepth(60);
            arcs.push(arc);
        }
      
        // 电弧闪烁
        this.scene.tweens.add({
            targets: arcs,
            alpha: 0.2,
            duration: 100,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
      
        this.activeEffects.set('electricArcs', arcs);
    }
  
    // 🔧 绘制闪电
    drawLightning(graphics, x1, y1, x2, y2) {
        const segments = 8;
        const noise = 20;
      
        graphics.moveTo(x1, y1);
      
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * noise;
            const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * noise;
            graphics.lineTo(x, y);
        }
      
        graphics.lineTo(x2, y2);
        graphics.stroke();
    }
  
    // ⚙️ 旋转齿轮
    createRotatingGears() {
        const gears = [];
        const gearCount = 12;
      
        for (let i = 0; i < gearCount; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            const size = 30 + Math.random() * 50;
          
            const gear = this.createGearGraphic(size);
            gear.setPosition(x, y);
            gear.setDepth(20);
          
            // 旋转动画
            this.scene.tweens.add({
                targets: gear,
                rotation: Math.PI * 2,
                duration: 3000 + Math.random() * 2000,
                repeat: -1,
                ease: 'Linear'
            });
          
            gears.push(gear);
        }
      
        this.activeEffects.set('rotatingGears', gears);
    }
  
    // ⚙️ 创建齿轮图形
    createGearGraphic(size) {
        const gear = this.scene.add.graphics();
        const teeth = 8;
        const innerRadius = size * 0.6;
        const outerRadius = size;
      
        gear.fillStyle(0x666666);
        gear.lineStyle(2, 0x888888);
      
        // 绘制齿轮
        gear.beginPath();
        for (let i = 0; i <= teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
          
            if (i === 0) {
                gear.moveTo(x, y);
            } else {
                gear.lineTo(x, y);
            }
        }
        gear.closePath();
        gear.fillPath();
        gear.strokePath();
      
        // 中心孔
        gear.fillStyle(0x222222);
        gear.fillCircle(0, 0, size * 0.3);
      
        return gear;
    }
  
    // 🩸 血液流动
    createBloodFlow() {
        const flowParticles = this.scene.add.particles(0, 0, 'bullet', {
            speed: { min: 80, max: 150 },
            scale: { start: 0.2, end: 0.1 },
            alpha: { start: 0.8, end: 0.3 },
            lifespan: 4000,
            blendMode: 'NORMAL',
            quantity: 3,
            frequency: 200,
            tint: 0xcc0000,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Rectangle(0, 0, 2000, 2000),
                quantity: 100
            }
        }).setDepth(10);
      
        // 流向效果
        this.scene.tweens.add({
            targets: flowParticles,
            x: 2000,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });
      
        this.activeEffects.set('bloodFlow', [flowParticles]);
    }
  
    // 💻 数据流
    createDataStream() {
        const streams = [];
      
        for (let i = 0; i < 10; i++) {
            const stream = this.scene.add.graphics();
            stream.lineStyle(2, 0x00ff00, 0.8);
          
            const x = i * 200;
            const codes = ['1', '0', '1', '0', '1'];
          
            codes.forEach((code, index) => {
                const y = index * 30;
                const codeText = this.scene.add.text(x, y, code, {
                    fontSize: '12px',
                    fill: code === '1' ? '#00ff00' : '#008800'
                });
                codeText.setDepth(40);
              
                // 下落动画
                this.scene.tweens.add({
                    targets: codeText,
                    y: y + 2000,
                    duration: 3000 + Math.random() * 2000,
                    repeat: -1,
                    delay: Math.random() * 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        codeText.y = -50;
                    }
                });
              
                streams.push(codeText);
            });
        }
      
        this.activeEffects.set('dataStream', streams);
    }
  
    // 🌀 故障艺术
    createGlitchEffect() {
        const glitchOverlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xff0000,
            0
        );
        glitchOverlay.setDepth(1000);
        glitchOverlay.setScrollFactor(0);
      
        // 随机故障
        this.scene.time.addEvent({
            delay: 2000 + Math.random() * 3000,
            callback: () => {
                glitchOverlay.setAlpha(0.3);
                this.scene.cameras.main.shake(200, 0.01);
              
                this.scene.time.delayedCall(100, () => {
                    glitchOverlay.setAlpha(0);
                });
            },
            loop: true
        });
      
        this.activeEffects.set('glitchArt', [glitchOverlay]);
    }
  
    // ☠️ 毒性孢子
    createToxicSpores() {
        const sporeEmitters = [];
      
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
          
            const spores = this.scene.add.particles(x, y, 'bullet', {
                speed: { min: 10, max: 30 },
                scale: { start: 0.1, end: 0.3 },
                alpha: { start: 0.7, end: 0.2 },
                lifespan: 8000,
                blendMode: 'ADD',
                angle: { min: 0, max: 360 },
                quantity: 1,
                frequency: 800,
                tint: 0x90ee90
            }).setDepth(30);
          
            sporeEmitters.push(spores);
        }
      
        this.activeEffects.set('toxicSpores', sporeEmitters);
    }
  
    // 🌀 现实扭曲
    createRealityWarp() {
        const warpZones = [];
      
        for (let i = 0; i < 4; i++) {
            const x = Math.random() * 1800 + 100;
            const y = Math.random() * 1800 + 100;
          
            const warp = this.scene.add.circle(x, y, 80, 0x9d4edd, 0.3);
            warp.setDepth(25);
          
            // 扭曲动画
            this.scene.tweens.add({
                targets: warp,
                scaleX: 1.5,
                scaleY: 0.5,
                rotation: Math.PI,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
          
            warpZones.push(warp);
        }
      
        this.activeEffects.set('realityWarp', warpZones);
    }
  
    // ⚡ 神圣光芒
    createDivineLight() {
        const lightBeams = [];
      
        for (let i = 0; i < 8; i++) {
            const x = i * 250;
            const beam = this.scene.add.rectangle(x, 0, 50, 2000, 0xffd700, 0.2);
            beam.setDepth(15);
          
            // 光束闪烁
            this.scene.tweens.add({
                targets: beam,
                alpha: 0.5,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
          
            lightBeams.push(beam);
        }
      
        this.activeEffects.set('divineLight', lightBeams);
    }
  
    // ⏰ 时空裂缝
    createTemporalRift() {
        const rifts = [];
      
        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 600;
            const y = 300 + Math.random() * 1400;
          
            const rift = this.scene.add.graphics();
            rift.lineStyle(4, 0xff6600, 0.8);
            rift.fillStyle(0x000000, 0.5);
          
            // 绘制裂缝形状
            rift.beginPath();
            rift.moveTo(x, y);
            for (let j = 1; j <= 10; j++) {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = j * 15;
                rift.lineTo(x + offsetX, y + offsetY);
            }
            rift.stroke();
            rift.setDepth(35);
          
            rifts.push(rift);
        }
      
        this.activeEffects.set('temporalRift', rifts);
    }
  
    // 💎 水晶光辉
    createCrystalGlow() {
        const crystals = [];
      
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            const size = 20 + Math.random() * 40;
          
            const crystal = this.scene.add.polygon(x, y, [
                0, -size,
                size * 0.7, -size * 0.3,
                size * 0.7, size * 0.3,
                0, size,
                -size * 0.7, size * 0.3,
                -size * 0.7, -size * 0.3
            ], 0x9370db, 0.8);
          
            crystal.setStroke(0xffffff, 2);
            crystal.setDepth(30);
          
            // 发光效果
            const glow = this.scene.add.circle(x, y, size * 1.5, 0x9370db, 0.2);
            glow.setDepth(29);
          
            this.scene.tweens.add({
                targets: [crystal, glow],
                alpha: 0.5,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
          
            crystals.push(crystal, glow);
        }
      
        this.activeEffects.set('crystalGlow', crystals);
    }
  
    // ⚠️ 设置环境危害
    setupHazards() {
        const hazards = this.currentSceneData.hazards;
      
        Object.keys(hazards).forEach(hazardType => {
            this.setupHazard(hazardType, hazards[hazardType]);
        });
    }
  
    // 💀 设置具体危害
    setupHazard(hazardType, hazardData) {
        switch (hazardType) {
            case 'steamJets':
                this.setupSteamJets(hazardData);
                break;
            case 'poisonSpores':
                this.setupPoisonSpores(hazardData);
                break;
            case 'glitchZone':
                this.setupGlitchZones(hazardData);
                break;
            case 'divineLightning':
                this.setupDivineLightning(hazardData);
                break;
        }
    }
  
    // 🌫️ 设置蒸汽喷射
    setupSteamJets(data) {
        const jetPositions = [
            { x: 300, y: 500 },
            { x: 800, y: 300 },
            { x: 1200, y: 700 },
            { x: 1600, y: 400 }
        ];
      
        jetPositions.forEach((pos, index) => {
            const timer = this.scene.time.addEvent({
                delay: data.interval,
                startAt: index * 1000, // 错开时间
                callback: () => {
                    this.triggerSteamJet(pos.x, pos.y, data.damage);
                },
                loop: true
            });
          
            this.hazardTimers.set(`steamJet_${index}`, timer);
        });
    }
  
    // 🌫️ 触发蒸汽喷射
    triggerSteamJet(x, y, damage) {
        // 警告效果
        const warning = this.scene.add.circle(x, y, 50, 0xff0000, 0.3);
        warning.setDepth(100);
      
        this.scene.time.delayedCall(1000, () => {
            warning.destroy();
          
            // 蒸汽爆发
            const steam = this.scene.add.particles(x, y, 'bullet', {
                speed: { min: 100, max: 200 },
                scale: { start: 0.5, end: 1 },
                alpha: { start: 1, end: 0 },
                lifespan: 1000,
                blendMode: 'ADD',
                angle: { min: 0, max: 360 },
                quantity: 20,
                tint: 0xeeeeee
            }).setDepth(120);
          
            // 伤害检测
            const player = this.scene.player;
            if (player) {
                const distance = Phaser.Math.Distance.Between(x, y, player.x, player.y);
                if (distance < 60 && player.takeDamage) {
                    player.takeDamage(damage);
                    console.log(`🌫️ 玩家被蒸汽伤害: ${damage}`);
                }
            }
          
            this.scene.time.delayedCall(1200, () => {
                steam.destroy();
            });
        });
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
  
    // 🔧 初始化具体机制
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
  
    // 🔧 可破坏管道机制
    initializeDestructiblePipes() {
        const pipes = [];
      
        for (let i = 0; i < 8; i++) {
            const x = 200 + i * 200;
            const y = 300 + Math.random() * 1400;
          
            const pipe = this.scene.add.rectangle(x, y, 20, 100, 0x666666);
            pipe.setDepth(25);
            pipe.health = 50;
            pipe.isPipe = true;
          
            // 添加物理体
            this.scene.physics.add.existing(pipe);
            pipe.body.setImmovable(true);
          
            pipes.push(pipe);
        }
      
        this.mechanicStates.set('destructiblePipes', pipes);
    }
  
    // 🩸 血液流向机制
    initializeBloodCurrent() {
        const currentZones = [];
      
        for (let i = 0; i < 6; i++) {
            const zone = {
                x: 300 + i * 250,
                y: 200,
                width: 200,
                height: 1600,
                forceX: 50,
                forceY: 0
            };
          
            // 可视化流向
            const visual = this.scene.add.rectangle(
                zone.x, zone.y + zone.height/2,
                zone.width, zone.height,
                0xff6666, 0.1
            );
            visual.setDepth(5);
          
            currentZones.push(zone);
        }
      
        this.mechanicStates.set('bloodCurrent', currentZones);
    }
  
    // 🌀 现实故障机制
    initializeRealityGlitch() {
        this.scene.time.addEvent({
            delay: 10000 + Math.random() * 15000,
            callback: () => {
                this.triggerRealityGlitch();
            },
            loop: true
        });
    }
  
    // 🌀 触发现实故障
    triggerRealityGlitch() {
        console.log('🌀 现实故障触发！');
      
        const glitchType = Math.floor(Math.random() * 3);
      
        switch (glitchType) {
            case 0: // 重力反转
                this.scene.physics.world.gravity.y *= -1;
                this.scene.time.delayedCall(3000, () => {
                    this.scene.physics.world.gravity.y *= -1;
                });
                break;
              
            case 1: // 敌人瞬移
                if (this.scene.enemyManager) {
                    this.scene.enemyManager.enemies.children.entries.forEach(enemy => {
                        enemy.x = Math.random() * 2000;
                        enemy.y = Math.random() * 2000;
                    });
                }
                break;
              
            case 2: // 颜色反转
                this.scene.cameras.main.setTint(0x00ffff);
                this.scene.time.delayedCall(2000, () => {
                    this.scene.cameras.main.clearTint();
                });
                break;
        }
    }
  
    // 💎 光线反射机制
    initializeLightReflection() {
        // 在水晶场景中，激光武器可以被水晶反射
        this.mechanicStates.set('lightReflection', {
            enabled: true,
            reflectionAngle: 45,
            maxReflections: 3
        });
    }
  
    // 🏗️ 生成场景对象
    generateSceneObjects() {
        // 生成敌人
        this.generateSceneEnemies();
      
        // 生成障碍物
        this.generateSceneObstacles();
      
        // 生成BOSS
        this.generateSceneBoss();
    }
  
    // 👹 生成场景敌人
    generateSceneEnemies() {
        const enemies = this.currentSceneData.enemies;
        if (!enemies || !this.scene.enemyManager) return;
      
        enemies.forEach(enemyType => {
            // 为每个敌人类型生成2-4个实例
            const count = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                const x = Math.random() * 1800 + 100;
                const y = Math.random() * 1800 + 100;
              
                // 这里需要扩展敌人管理器来支持新的敌人类型
                // this.scene.enemyManager.spawnSpecialEnemy(enemyType, x, y);
            }
        });
    }
  
    // 🗿 生成场景障碍物
    generateSceneObstacles() {
        const obstacles = this.currentSceneData.obstacles;
        if (!obstacles || !this.scene.obstacleManager) return;
      
        obstacles.forEach(obstacleType => {
            const count = 3 + Math.floor(Math.random() * 5);
            for (let i = 0; i < count; i++) {
                const x = Math.random() * 1800 + 100;
                const y = Math.random() * 1800 + 100;
              
                // 这里需要扩展障碍物管理器来支持新的障碍物类型
                // this.scene.obstacleManager.spawnSpecialObstacle(obstacleType, x, y);
            }
        });
    }
  
    // 👑 生成场景BOSS
    generateSceneBoss() {
        const bossType = this.currentSceneData.boss;
        if (!bossType || !this.scene.bossManager) return;
      
        // 延迟生成BOSS
        this.scene.time.delayedCall(30000, () => {
            const x = 1000 + Math.random() * 800;
            const y = 1000 + Math.random() * 800;
          
            // 这里需要扩展BOSS管理器来支持新的BOSS类型
            // this.scene.bossManager.spawnSpecialBoss(bossType, x, y);
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
      
        // 检查毒性孢子伤害
        if (this.currentSceneData.id === 'mutated_jungle') {
            this.checkSporePoison(player, time);
        }
      
        // 检查故障区域
        if (this.currentSceneData.id === 'cyberspace') {
            this.checkGlitchZones(player, time);
        }
    }
  
    // ☠️ 检查孢子中毒
    checkSporePoison(player, time) {
        if (!this.lastSporeCheck) this.lastSporeCheck = 0;
      
        if (time - this.lastSporeCheck > 1000) { // 每秒检查一次
            if (player.takeDamage) {
                player.takeDamage(8);
                console.log('☠️ 玩家受到孢子伤害');
            }
            this.lastSporeCheck = time;
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
        this.mechanicStates.clear();
      
        // 清理环境光
        if (this.ambientLight) {
            this.ambientLight.destroy();
            this.ambientLight = null;
        }
      
        console.log('🧹 场景清理完成');
    }
  
    // 📊 获取场景状态
    getSceneStatus() {
        return {
            currentScene: this.currentSceneData ? this.currentSceneData.name : 'None',
            effectsCount: this.activeEffects.size,
            hazardsCount: this.hazardTimers.size,
            mechanicsCount: this.mechanicStates.size
        };
    }
  
    // 💀 销毁管理器
    destroy() {
        this.clearCurrentScene();
        this.currentSceneData = null;
        console.log('💀 高级场景管理器已销毁');
    }
} 