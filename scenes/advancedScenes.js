// advancedScenes.js - 高级场景配置

// 🎨 绘图工具对象 - 封装所有辅助绘图函数
const DrawingUtils = {
    // 绘制闪电效果
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
    },

    // 创建齿轮图形
    createGearGraphic(scene, size) {
        const gear = scene.add.graphics();
        gear.lineStyle(3, 0x888888, 0.8);
        
        const teeth = 12;
        const innerRadius = size * 0.3;
        const outerRadius = size;
        
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const nextAngle = ((i + 1) / teeth) * Math.PI * 2;
            
            const x1 = Math.cos(angle) * innerRadius;
            const y1 = Math.sin(angle) * innerRadius;
            const x2 = Math.cos(angle) * outerRadius;
            const y2 = Math.sin(angle) * outerRadius;
            const x3 = Math.cos(nextAngle) * outerRadius;
            const y3 = Math.sin(nextAngle) * outerRadius;
            const x4 = Math.cos(nextAngle) * innerRadius;
            const y4 = Math.sin(nextAngle) * innerRadius;
            
            gear.lineBetween(x1, y1, x2, y2);
            gear.lineBetween(x2, y2, x3, y3);
            gear.lineBetween(x3, y3, x4, y4);
        }
        
        gear.stroke();
        return gear;
    }
};

export const ADVANCED_SCENES = {
    // 🔧 机械内部场景
    mechanical_interior: {
        id: 'mechanical_interior',
        name: '机械内部',
        type: 'mechanical',
        description: '蒸汽管道和齿轮的世界',
        backgroundColor: 0x2c3e50,
        ambientColor: 0x34495e,
        effects: {
            steam: { 
                enabled: true,
                count: 5,
                frequency: 500,
                tint: 0xeeeeee,
                speed: { min: 20, max: 50 }
            },
            electricArcs: { 
                enabled: true,
                count: 8,
                color: 0x00ffff,
                alpha: 0.8
            },
            rotatingGears: { 
                enabled: true,
                count: 6,
                minSize: 30,
                maxSize: 80,
                color: 0x888888
            }
        },
        hazards: {
            steamJets: {
                enabled: true,
                positions: [
                    { x: 400, y: 300, damage: 15, interval: 3000 },
                    { x: 800, y: 500, damage: 15, interval: 4000 },
                    { x: 1200, y: 200, damage: 15, interval: 3500 }
                ]
            }
        },
        mechanics: {
            destructiblePipes: true
        },
        enemies: [
            { type: 'REPAIR_DRONE', weight: 0.6 },
            { type: 'MECHANICAL_SPIDER', weight: 0.4 }
        ],
        obstacles: [
            { type: 'building', count: 3, weight: 1.0 }
        ],
        boss: null
    },

    // 🔬 微观世界场景
    microscopic_world: {
        id: 'microscopic_world',
        name: '微观世界',
        type: 'microscopic',
        description: '病毒和细菌的战场',
        backgroundColor: 0x1a472a,
        ambientColor: 0x2d5016,
        effects: {
            bloodFlow: { 
                enabled: true,
                count: 4,
                color: 0x8b0000,
                alpha: 0.6,
                thickness: 8
            }
        },
        hazards: {},
        mechanics: {
            bloodCurrent: true
        },
        enemies: [
            { type: 'VIRUS', weight: 0.7 },
            { type: 'BACTERIA', weight: 0.3 }
        ],
        obstacles: [
            { type: 'coral', count: 4, weight: 1.0 }
        ],
        boss: null
    },

    // 💻 赛博空间场景
    cyberspace: {
        id: 'cyberspace',
        name: '赛博空间',
        type: 'cyberspace',
        description: '数据流和故障的世界',
        backgroundColor: 0x000033,
        ambientColor: 0x000066,
        effects: {
            dataStream: { 
                enabled: true,
                count: 10,
                speed: { min: 30, max: 80 },
                tint: 0x00ffff,
                frequency: 200
            },
            glitchArt: { 
                enabled: true,
                count: 3,
                color: 0xff00ff,
                alpha: 0.1,
                size: 200
            }
        },
        hazards: {},
        mechanics: {
            realityGlitch: true
        },
        enemies: [
            { type: 'TROJAN_HORSE', weight: 0.5 },
            { type: 'WORM_VIRUS', weight: 0.5 }
        ],
        obstacles: [
            { type: 'asteroid', count: 5, weight: 1.0 }
        ],
        boss: null
    },

    // 🍄 变异丛林场景
    mutated_jungle: {
        id: 'mutated_jungle',
        name: '变异丛林',
        type: 'mutant',
        description: '有毒孢子和变异生物',
        backgroundColor: 0x2d5016,
        ambientColor: 0x1a472a,
        effects: {
            toxicSpores: { 
                enabled: true,
                count: 8,
                speed: { min: 10, max: 30 },
                tint: 0x90ee90,
                frequency: 1000
            }
        },
        hazards: {
            sporePoison: {
                enabled: true,
                damage: 8,
                interval: 1000
            }
        },
        mechanics: {},
        enemies: [
            { type: 'MUTANT_BUG', weight: 0.6 },
            { type: 'WALKING_PLANT', weight: 0.4 }
        ],
        obstacles: [
            { type: 'tree', count: 6, weight: 1.0 }
        ],
        boss: null
    },

    // 🌀 梦境场景
    dream_realm: {
        id: 'dream_realm',
        name: '梦境领域',
        type: 'dream',
        description: '现实扭曲的梦境世界',
        backgroundColor: 0x4b0082,
        ambientColor: 0x800080,
        effects: {
            realityWarp: { 
                enabled: true,
                count: 5,
                color: 0x800080,
                alpha: 0.7,
                size: 100
            }
        },
        hazards: {},
        mechanics: {},
        enemies: [
            { type: 'SHADOW_PERSON', weight: 0.5 },
            { type: 'NIGHTMARE', weight: 0.5 }
        ],
        obstacles: [
            { type: 'rock', count: 4, weight: 1.0 }
        ],
        boss: null
    },

    // ⚡ 天界场景
    celestial_realm: {
        id: 'celestial_realm',
        name: '天界领域',
        type: 'celestial',
        description: '神圣光芒和空中生物',
        backgroundColor: 0x4169e1,
        ambientColor: 0x87ceeb,
        effects: {
            divineLight: { 
                enabled: true,
                count: 6,
                color: 0xffffff,
                alpha: 0.8,
                thickness: 6
            }
        },
        hazards: {},
        mechanics: {
            lightReflection: true
        },
        enemies: [
            { type: 'HARPY', weight: 0.6 },
            { type: 'GRYPHON', weight: 0.4 }
        ],
        obstacles: [
            { type: 'building', count: 3, weight: 1.0 }
        ],
        boss: null
    },

    // ⏰ 时空战场场景
    temporal_battlefield: {
        id: 'temporal_battlefield',
        name: '时空战场',
        type: 'temporal',
        description: '时间裂隙和时空战士',
        backgroundColor: 0xff6600,
        ambientColor: 0xff8c00,
        effects: {
            temporalRift: { 
                enabled: true,
                count: 4,
                color: 0xff6600,
                alpha: 0.8,
                size: 80
            }
        },
        hazards: {},
        mechanics: {},
        enemies: [
            { type: 'CYBER_SAMURAI', weight: 0.5 },
            { type: 'TIME_SOLDIER', weight: 0.5 }
        ],
        obstacles: [
            { type: 'asteroid', count: 4, weight: 1.0 }
        ],
        boss: null
    },

    // 💎 水晶洞穴场景
    crystal_cavern: {
        id: 'crystal_cavern',
        name: '水晶洞穴',
        type: 'crystal',
        description: '水晶光芒和元素生物',
        backgroundColor: 0x9370db,
        ambientColor: 0xda70d6,
        effects: {
            crystalGlow: { 
                enabled: true,
                count: 7,
                color: 0x9370db,
                alpha: 0.6
            }
        },
        hazards: {},
        mechanics: {},
        enemies: [
            { type: 'CRYSTAL_GOLEM', weight: 0.4 },
            { type: 'LIGHT_ELEMENTAL', weight: 0.6 }
        ],
        obstacles: [
            { type: 'rock', count: 5, weight: 1.0 }
        ],
        boss: null
    }
};

// 🎨 场景特效配置
export const SCENE_EFFECTS = {
    steam: (scene, config = {}) => {
        const steamEmitters = [];
        const count = config.count || 5;
        const tint = config.tint || 0xeeeeee;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            
            // ✅ 使用现代Graphics替代过时的粒子系统
            const steam = scene.add.graphics();
            steam.fillStyle(tint, 0.6);
            steam.fillCircle(x, y, 15);
            steam.setDepth(50);
            
            // 创建蒸汽动画
            scene.tweens.add({
                targets: steam,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 3000,
                ease: 'Power2',
                onComplete: () => steam.destroy()
            });
            
            steamEmitters.push(steam);
        }
        return steamEmitters;
    },

    electricArcs: (scene, config = {}) => {
        const arcCount = config.count || 8;
        const color = config.color || 0x00ffff;
        const alpha = config.alpha || 0.8;
        const arcs = [];
        
        for (let i = 0; i < arcCount; i++) {
            const arc = scene.add.graphics();
            arc.lineStyle(3, color, alpha);
            
            const startX = Math.random() * 2000;
            const startY = Math.random() * 2000;
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = startY + (Math.random() - 0.5) * 200;
            
            DrawingUtils.drawLightning(arc, startX, startY, endX, endY);
            arc.setDepth(60);
            arcs.push(arc);
        }
        
        return arcs;
    },

    rotatingGears: (scene, config = {}) => {
        const gears = [];
        const count = config.count || 6;
        const minSize = config.minSize || 30;
        const maxSize = config.maxSize || 80;
        const color = config.color || 0x888888;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            const size = Phaser.Math.Between(minSize, maxSize);
            
            const gear = DrawingUtils.createGearGraphic(scene, size);
            gear.setPosition(x, y);
            gear.setDepth(40);
            
            gears.push(gear);
        }
        return gears;
    },

    bloodFlow: (scene, config = {}) => {
        const bloodStreams = [];
        const count = config.count || 4;
        const color = config.color || 0x8b0000;
        const alpha = config.alpha || 0.6;
        const thickness = config.thickness || 8;
        
        for (let i = 0; i < count; i++) {
            const stream = scene.add.graphics();
            stream.lineStyle(thickness, color, alpha);
            
            const startX = Math.random() * 2000;
            const startY = Math.random() * 2000;
            const endX = startX + (Math.random() - 0.5) * 400;
            const endY = startY + (Math.random() - 0.5) * 400;
            
            stream.lineBetween(startX, startY, endX, endY);
            stream.setDepth(45);
            bloodStreams.push(stream);
        }
        return bloodStreams;
    },

    dataStream: (scene, config = {}) => {
        const dataParticles = [];
        const count = config.count || 10;
        const tint = config.tint || 0x00ffff;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            
            // ✅ 使用现代Graphics替代过时的粒子系统
            const data = scene.add.circle(x, y, 3, tint, 0.8);
            data.setDepth(55);
            
            // 创建数据流动画
            scene.tweens.add({
                targets: data,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => data.destroy()
            });
            
            dataParticles.push(data);
        }
        return dataParticles;
    },

    glitchArt: (scene, config = {}) => {
        const glitchZones = [];
        const count = config.count || 3;
        const color = config.color || 0xff00ff;
        const alpha = config.alpha || 0.1;
        const size = config.size || 200;
        
        for (let i = 0; i < count; i++) {
            const zone = scene.add.graphics();
            zone.fillStyle(color, alpha);
            zone.fillRect(
                Math.random() * 1800,
                Math.random() * 1000,
                size,
                size
            );
            zone.setDepth(70);
            glitchZones.push(zone);
        }
        return glitchZones;
    },

    toxicSpores: (scene, config = {}) => {
        const sporeEmitters = [];
        const count = config.count || 8;
        const tint = config.tint || 0x90ee90;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            
            // ✅ 使用现代Graphics替代过时的粒子系统
            const spores = scene.add.circle(x, y, 4, tint, 0.5);
            spores.setDepth(50);
            
            // 创建孢子动画
            scene.tweens.add({
                targets: spores,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 4000,
                ease: 'Power2',
                onComplete: () => spores.destroy()
            });
            
            sporeEmitters.push(spores);
        }
        return sporeEmitters;
    },

    realityWarp: (scene, config = {}) => {
        const warpEffects = [];
        const count = config.count || 5;
        const color = config.color || 0x800080;
        const alpha = config.alpha || 0.7;
        const size = config.size || 100;
        
        for (let i = 0; i < count; i++) {
            const warp = scene.add.graphics();
            warp.lineStyle(4, color, alpha);
            warp.strokeCircle(
                Math.random() * 2000,
                Math.random() * 1000,
                size
            );
            warp.setDepth(65);
            
            warpEffects.push(warp);
        }
        return warpEffects;
    },

    divineLight: (scene, config = {}) => {
        const lightBeams = [];
        const count = config.count || 6;
        const color = config.color || 0xffffff;
        const alpha = config.alpha || 0.8;
        const thickness = config.thickness || 6;
        
        for (let i = 0; i < count; i++) {
            const beam = scene.add.graphics();
            beam.lineStyle(thickness, color, alpha);
            
            const startX = Math.random() * 2000;
            const startY = 0;
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = 1000;
            
            beam.lineBetween(startX, startY, endX, endY);
            beam.setDepth(60);
            lightBeams.push(beam);
        }
        return lightBeams;
    },

    temporalRift: (scene, config = {}) => {
        const rifts = [];
        const count = config.count || 4;
        const color = config.color || 0xff6600;
        const alpha = config.alpha || 0.8;
        const size = config.size || 80;
        
        for (let i = 0; i < count; i++) {
            const rift = scene.add.graphics();
            rift.lineStyle(5, color, alpha);
            rift.strokeCircle(
                Math.random() * 2000,
                Math.random() * 1000,
                size
            );
            rift.setDepth(65);
            
            rifts.push(rift);
        }
        return rifts;
    },

    crystalGlow: (scene, config = {}) => {
        const crystals = [];
        const count = config.count || 7;
        const color = config.color || 0x9370db;
        const alpha = config.alpha || 0.6;
        
        for (let i = 0; i < count; i++) {
            const crystal = scene.add.graphics();
            crystal.fillStyle(color, alpha);
            crystal.fillTriangle(
                Math.random() * 2000,
                Math.random() * 1000,
                Math.random() * 2000,
                Math.random() * 1000,
                Math.random() * 2000,
                Math.random() * 1000
            );
            crystal.setDepth(55);
            crystals.push(crystal);
        }
        return crystals;
    }
}; 