// levels.js - 关卡配置系统

export const LEVELS_CONFIG = [
    {
        id: 1,
        name: "城市危机",
        description: "暴徒正在城市中肆虐，消灭他们！",
        background: "city",
        bgColor: 0xe8f4f8,
        playerSkin: "soldier",
        music: "city_theme",
        spawnRate: 2000, // 敌人生成间隔（毫秒）
        maxEnemies: 5, // 同时最大敌人数
        levelDuration: 90000, // 关卡时长（毫秒）- 90秒
        targetKills: 20, // 目标击杀数
        enemies: [
            {
                name: "暴徒",
                sprite: "thug",
                color: 0x8B0000,
                hp: 50,
                speed: 80,
                score: 38,  // 25*1.5=37.5 向上取整
                ai: "straight",
                canShoot: false,
                shootRate: 0,
                weight: 0.8 // 生成权重
            },
            {
                name: "枪手",
                sprite: "thug",
                color: 0x8B0000,
                hp: 60,
                speed: 60,
                score: 53,  // 35*1.5=52.5 向上取整
                ai: "straight",
                canShoot: true,
                shootRate: 4000,
                weight: 0.2
            }
        ],
        powerUps: ["health", "ammo"],
        environmentEffects: []
    },
    {
        id: 2,
        name: "沙漠风暴",
        description: "沙漠蝎群来袭，小心它们的弧线攻击！",
        background: "desert",
        bgColor: 0xf4e4bc,
        playerSkin: "tank",
        music: "desert_theme",
        spawnRate: 1800,
        maxEnemies: 6,
        levelDuration: 90000, // 90秒
        targetKills: 25,
        enemies: [
            {
                name: "沙漠蝎",
                sprite: "scorpion",
                color: 0x8B4513,
                hp: 80,
                speed: 40,  // 🔧 降低60%：从100降到40
                score: 53,  // 35*1.5=52.5 向上取整
                ai: "curve",
                canShoot: false,
                shootRate: 0,
                weight: 0.4
            },
            {
                name: "暴徒",
                sprite: "thug",
                color: 0x8B0000,
                hp: 60,
                speed: 36,  // 🔧 降低60%：从90降到36
                score: 45,  // 30*1.5=45
                ai: "straight",
                canShoot: false,
                shootRate: 0,
                weight: 0.15
            },
            {
                name: "沙漠射手",
                sprite: "scorpion",
                color: 0x8B4513,
                hp: 70,
                speed: 30,
                score: 60,  // 40*1.5=60
                ai: "straight",
                canShoot: true,
                shootRate: 3500,
                weight: 0.25
            },
            {
                name: "沙漠猎手",
                sprite: "scorpion",
                color: 0x8B4513,
                hp: 65,
                speed: 60,  // 1.5倍速度：40*1.5=60
                score: 75,  // 50*1.5=75
                ai: "curve",
                canShoot: false,
                shootRate: 0,
                weight: 0.2
            }
        ],
        powerUps: ["health", "ammo", "damage"],
        environmentEffects: ["sandstorm"]
    },
    {
        id: 3,
        name: "森林迷雾",
        description: "在迷雾森林中，敌人变得更加狡猾！",
        background: "forest",
        bgColor: 0xd4f0d4,
        playerSkin: "soldier",
        music: "forest_theme",
        spawnRate: 1600,
        maxEnemies: 7,
        levelDuration: 90000,
        targetKills: 30,
        enemies: [
            {
                name: "森林狼",
                sprite: "wolf",
                color: 0x696969,
                hp: 100,
                speed: 80,  // 🔧 降低速度：从120降到80
                score: 68,  // 45*1.5=67.5 向上取整
                ai: "zigzag",
                canShoot: false,
                shootRate: 0,
                weight: 0.3
            },
            {
                name: "弓箭手",
                sprite: "archer",
                color: 0x4B0082,
                hp: 70,
                speed: 40,  // 🔧 降低速度：从60降到40
                score: 75,  // 50*1.5=75
                ai: "straight",
                canShoot: true,
                shootRate: 3000,
                weight: 0.3
            },
            {
                name: "森林守卫",
                sprite: "wolf",
                color: 0x696969,
                hp: 90,
                speed: 60,
                score: 83,  // 55*1.5=82.5 向上取整
                ai: "zigzag",
                canShoot: true,
                shootRate: 2800,
                weight: 0.15
            },
            {
                name: "森林猎手",
                sprite: "wolf",
                color: 0x696969,
                hp: 85,
                speed: 120,  // 1.5倍速度：80*1.5=120
                score: 90,  // 60*1.5=90
                ai: "zigzag",
                canShoot: false,
                shootRate: 0,
                weight: 0.25
            }
        ],
        powerUps: ["health", "ammo", "damage", "speed"],
        environmentEffects: ["fog"]
    },
    {
        id: 4,
        name: "海洋深渊",
        description: "深海怪物拥有智能，它们会主动追击！",
        background: "ocean",
        bgColor: 0xe6f3ff,
        playerSkin: "diver",
        music: "ocean_theme",
        spawnRate: 1400,
        maxEnemies: 8,
        levelDuration: 90000, // 90秒
        targetKills: 35,
        enemies: [
            {
                name: "深海鱿鱼",
                sprite: "squid",
                color: 0x4B0082,
                hp: 120,
                speed: 140,
                score: 83,  // 55*1.5=82.5 向上取整
                ai: "chase",
                canShoot: true,
                shootRate: 2500,
                weight: 0.3
            },
            {
                name: "电鳗",
                sprite: "eel",
                color: 0x2F4F4F,
                hp: 90,
                speed: 160,
                score: 68,  // 45*1.5=67.5 向上取整
                ai: "zigzag",
                canShoot: false,
                shootRate: 0,
                weight: 0.15
            },
            {
                name: "海盗",
                sprite: "pirate",
                color: 0x8B4513,
                hp: 110,
                speed: 80,
                score: 90,  // 60*1.5=90
                ai: "straight",
                canShoot: true,
                shootRate: 2000,
                weight: 0.2
            },
            {
                name: "深海狙击手",
                sprite: "squid",
                color: 0x4B0082,
                hp: 100,
                speed: 100,
                score: 98,  // 65*1.5=97.5 向上取整
                ai: "smart",
                canShoot: true,
                shootRate: 1800,
                weight: 0.1
            },
            {
                name: "深海猎手",
                sprite: "squid",
                color: 0x4B0082,
                hp: 105,
                speed: 210,  // 1.5倍速度：140*1.5=210
                score: 105,  // 70*1.5=105
                ai: "chase",
                canShoot: false,
                shootRate: 0,
                weight: 0.25
            },
            {
                name: "高速追击者",
                sprite: "shark",
                color: 0x8B0000,
                hp: 80,
                speed: 200,  // 比普通敌人快2倍
                score: 75,
                ai: "fast_chase",
                canShoot: false,
                shootRate: 0,
                weight: 0.2
            }
        ],
        powerUps: ["health", "ammo", "damage", "speed", "shield"],
        environmentEffects: ["bubbles", "current"]
    },
    {
        id: 5,
        name: "太空堡垒",
        description: "最终决战！面对太空中最强的敌人！",
        background: "space",
        bgColor: 0xf0f0f0,
        playerSkin: "spaceship",
        music: "space_theme",
        spawnRate: 1000,
        maxEnemies: 10,
        levelDuration: 90000, // 90秒
        targetKills: 50,
        enemies: [
            {
                name: "外星战士",
                sprite: "alien",
                color: 0x00FF00,
                hp: 150,
                speed: 100,
                score: 105,  // 70*1.5=105
                ai: "chase",
                canShoot: true,
                shootRate: 1500,
                weight: 0.3
            },
            {
                name: "机器人",
                sprite: "robot",
                color: 0x4169E1,
                hp: 200,
                speed: 80,
                score: 120,  // 80*1.5=120
                ai: "smart",
                canShoot: true,
                shootRate: 1800,
                weight: 0.2
            },
            {
                name: "飞碟",
                sprite: "ufo",
                color: 0xFF1493,
                hp: 120,
                speed: 180,
                score: 98,  // 65*1.5=97.5 向上取整
                ai: "curve",
                canShoot: true,
                shootRate: 2200,
                weight: 0.15
            },
            {
                name: "太空狙击手",
                sprite: "alien",
                color: 0x00FF00,
                hp: 130,
                speed: 120,
                score: 113,  // 75*1.5=112.5 向上取整
                ai: "smart",
                canShoot: true,
                shootRate: 1200,
                weight: 0.1
            },
            {
                name: "太空猎手",
                sprite: "alien",
                color: 0x00FF00,
                hp: 140,
                speed: 150,  // 1.5倍速度：100*1.5=150
                score: 120,  // 80*1.5=120
                ai: "chase",
                canShoot: false,
                shootRate: 0,
                weight: 0.15
            },
            {
                name: "BOSS",
                sprite: "boss",
                color: 0xFF1493,
                hp: 500,
                speed: 60,
                score: 450,  // 300*1.5=450
                ai: "boss",
                canShoot: true,
                shootRate: 800,
                weight: 0.1
            },
            {
                name: "极速猎手",
                sprite: "alien",
                color: 0x00FF00,
                hp: 120,
                speed: 300,  // 比普通敌人快3倍
                score: 120,
                ai: "lightning_hunt",
                canShoot: false,
                shootRate: 0,
                weight: 0.1  // 稀有敌人
            }
        ],
        powerUps: ["health", "ammo", "damage", "speed", "shield", "multishot"],
        environmentEffects: ["stars", "nebula", "asteroids"]
    }
];

// 🆕 AI行为配置
export const AI_BEHAVIORS = {
    straight: {
        name: "直线移动",
        update: (enemy) => {
            // 简单直线移动，已在基础移动中实现
        }
    },
    curve: {
        name: "弧线移动",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    amplitude: Phaser.Math.Between(50, 150),
                    frequency: Phaser.Math.Between(2, 5),
                    startY: enemy.y
                };
            }
            const time = enemy.scene.time.now * 0.001;
            const newY = enemy.aiData.startY + 
                Math.sin(time * enemy.aiData.frequency) * enemy.aiData.amplitude;
            enemy.setY(newY);
        }
    },
    zigzag: {
        name: "之字形移动",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    direction: 1,
                    changeInterval: 1000,
                    lastChange: enemy.scene.time.now,
                    speed: enemy.speed
                };
            }
          
            const currentTime = enemy.scene.time.now;
            if (currentTime - enemy.aiData.lastChange > enemy.aiData.changeInterval) {
                enemy.aiData.direction *= -1;
                enemy.aiData.lastChange = currentTime;
                enemy.aiData.changeInterval = Phaser.Math.Between(800, 1500);
            }
          
            enemy.setVelocityY(enemy.aiData.direction * enemy.aiData.speed * 0.5);
        }
    },
    chase: {
        name: "追踪玩家",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
          
            const player = enemy.scene.player;
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y, 
                player.x, player.y
            );
          
            const speed = enemy.speed * 0.8;
            enemy.scene.physics.velocityFromRotation(angle, speed, enemy.body.velocity);
        }
    },
    smart: {
        name: "智能移动",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
          
            if (!enemy.aiData) {
                enemy.aiData = {
                    strategy: Phaser.Math.Between(0, 2), // 0: 直接追击, 1: 侧面包抄, 2: 保持距离
                    changeTime: enemy.scene.time.now + 3000
                };
            }
          
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
          
            // 切换策略
            if (enemy.scene.time.now > enemy.aiData.changeTime) {
                enemy.aiData.strategy = Phaser.Math.Between(0, 2);
                enemy.aiData.changeTime = enemy.scene.time.now + Phaser.Math.Between(2000, 4000);
            }
          
            let targetX, targetY;
            const speed = enemy.speed;
          
            switch (enemy.aiData.strategy) {
                case 0: // 直接追击
                    targetX = player.x;
                    targetY = player.y;
                    break;
                case 1: // 侧面包抄
                    targetX = player.x;
                    targetY = player.y + (distance > 200 ? -100 : 100);
                    break;
                case 2: // 保持距离
                    if (distance < 150) {
                        targetX = enemy.x - (player.x - enemy.x);
                        targetY = enemy.y - (player.y - enemy.y);
                    } else {
                        targetX = player.x;
                        targetY = player.y;
                    }
                    break;
            }
          
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            enemy.scene.physics.velocityFromRotation(angle, speed * 0.7, enemy.body.velocity);
        }
    },
    boss: {
        name: "Boss行为",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
          
            if (!enemy.aiData) {
                enemy.aiData = {
                    phase: 1,
                    phaseTimer: 0,
                    movePattern: 0,
                    centerY: 360
                };
            }
          
            const player = enemy.scene.player;
            const time = enemy.scene.time.now * 0.001;
          
            // Boss移动模式
            switch (enemy.aiData.movePattern) {
                case 0: // 上下移动
                    enemy.setY(enemy.aiData.centerY + Math.sin(time * 2) * 100);
                    break;
                case 1: // 追踪玩家Y坐标
                    const targetY = Phaser.Math.Linear(enemy.y, player.y, 0.02);
                    enemy.setY(targetY);
                    break;
            }
          
            // 切换移动模式
            enemy.aiData.phaseTimer++;
            if (enemy.aiData.phaseTimer > 300) { // 5秒切换
                enemy.aiData.movePattern = (enemy.aiData.movePattern + 1) % 2;
                enemy.aiData.phaseTimer = 0;
            }
        }
    },
    fast_chase: {
        name: "高速追击",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
          
            const player = enemy.scene.player;
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y, 
                player.x, player.y
            );
          
            // 使用完整速度进行追击
            const speed = enemy.speed;
            enemy.scene.physics.velocityFromRotation(angle, speed, enemy.body.velocity);
          
            // 添加冲刺效果
            if (!enemy.aiData) {
                enemy.aiData = { rushCooldown: 0 };
            }
          
            // 每3秒进行一次冲刺加速
            if (enemy.scene.time.now > enemy.aiData.rushCooldown) {
                const rushSpeed = speed * 1.5;
                enemy.scene.physics.velocityFromRotation(angle, rushSpeed, enemy.body.velocity);
                enemy.aiData.rushCooldown = enemy.scene.time.now + 3000;
            }
        }
    },
    lightning_hunt: {
        name: "闪电猎杀",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
          
            if (!enemy.aiData) {
                enemy.aiData = {
                    strategy: 0, // 0: 预判追击, 1: 绕后包抄
                    changeTime: enemy.scene.time.now + 2000,
                    lastPlayerPos: { x: 0, y: 0 }
                };
            }
          
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
          
            // 策略切换
            if (enemy.scene.time.now > enemy.aiData.changeTime) {
                enemy.aiData.strategy = Phaser.Math.Between(0, 1);
                enemy.aiData.changeTime = enemy.scene.time.now + Phaser.Math.Between(1500, 2500);
            }
          
            let targetX, targetY;
            const speed = enemy.speed;
          
            switch (enemy.aiData.strategy) {
                case 0: // 预判追击 - 预测玩家位置
                    const playerVelX = player.body.velocity.x || 0;
                    const playerVelY = player.body.velocity.y || 0;
                    const predictionTime = distance / speed; // 预判时间
                  
                    targetX = player.x + playerVelX * predictionTime;
                    targetY = player.y + playerVelY * predictionTime;
                    break;
                  
                case 1: // 绕后包抄
                    if (distance > 150) {
                        // 距离远时直接追击
                        targetX = player.x;
                        targetY = player.y;
                    } else {
                        // 距离近时绕到玩家背后
                        const playerAngle = Math.atan2(player.body.velocity.y, player.body.velocity.x);
                        const behindDistance = 100;
                        targetX = player.x - Math.cos(playerAngle) * behindDistance;
                        targetY = player.y - Math.sin(playerAngle) * behindDistance;
                    }
                    break;
            }
          
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
          
            // 使用更高的速度倍数
            const finalSpeed = distance < 200 ? speed * 1.2 : speed;
            enemy.scene.physics.velocityFromRotation(angle, finalSpeed, enemy.body.velocity);
          
            // 记录玩家位置用于预判
            enemy.aiData.lastPlayerPos = { x: player.x, y: player.y };
        }
    },

    // 🆕 高级敌人AI行为
    patrol: {
        name: "巡逻移动",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    direction: 1,
                    patrolRange: 200,
                    startX: enemy.x,
                    changeTime: enemy.scene.time.now + 3000
                };
            }
            
            // 定期改变方向
            if (enemy.scene.time.now > enemy.aiData.changeTime) {
                enemy.aiData.direction *= -1;
                enemy.aiData.changeTime = enemy.scene.time.now + Phaser.Math.Between(2000, 4000);
            }
            
            // 在巡逻范围内移动
            const targetX = enemy.aiData.startX + enemy.aiData.direction * enemy.aiData.patrolRange;
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, enemy.y);
            enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.6, enemy.body.velocity);
        }
    },

    ambush: {
        name: "伏击行为",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    state: 'hiding', // hiding, charging, attacking
                    chargeCooldown: 0,
                    lastAttack: 0
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            switch (enemy.aiData.state) {
                case 'hiding':
                    // 保持距离，等待时机
                    if (distance < 300) {
                        const escapeAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
                        enemy.scene.physics.velocityFromRotation(escapeAngle, enemy.speed * 0.8, enemy.body.velocity);
                    } else if (distance > 400) {
                        enemy.aiData.state = 'charging';
                    }
                    break;
                    
                case 'charging':
                    // 蓄力准备攻击
                    if (enemy.scene.time.now > enemy.aiData.chargeCooldown) {
                        enemy.aiData.state = 'attacking';
                        enemy.aiData.chargeCooldown = enemy.scene.time.now + 2000;
                    }
                    break;
                    
                case 'attacking':
                    // 快速攻击
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                    enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 1.5, enemy.body.velocity);
                    
                    if (distance < 100) {
                        enemy.aiData.state = 'hiding';
                    }
                    break;
            }
        }
    },

    swarm: {
        name: "集群行为",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    swarmCenter: { x: enemy.x, y: enemy.y },
                    swarmRadius: 150,
                    lastCenterUpdate: 0
                };
            }
            
            // 更新集群中心
            if (enemy.scene.time.now > enemy.aiData.lastCenterUpdate) {
                const nearbyEnemies = enemy.scene.enemies?.getChildren() || [];
                let centerX = 0, centerY = 0, count = 0;
                
                nearbyEnemies.forEach(otherEnemy => {
                    if (otherEnemy !== enemy && otherEnemy.active) {
                        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, otherEnemy.x, otherEnemy.y);
                        if (dist < 200) {
                            centerX += otherEnemy.x;
                            centerY += otherEnemy.y;
                            count++;
                        }
                    }
                });
                
                if (count > 0) {
                    enemy.aiData.swarmCenter.x = centerX / count;
                    enemy.aiData.swarmCenter.y = centerY / count;
                }
                
                enemy.aiData.lastCenterUpdate = enemy.scene.time.now + 1000;
            }
            
            // 向集群中心移动
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.aiData.swarmCenter.x, enemy.aiData.swarmCenter.y);
            enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.7, enemy.body.velocity);
        }
    },

    drift: {
        name: "漂流行为",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    driftDirection: Phaser.Math.Between(0, 360),
                    changeTime: enemy.scene.time.now + Phaser.Math.Between(2000, 5000)
                };
            }
            
            // 定期改变漂流方向
            if (enemy.scene.time.now > enemy.aiData.changeTime) {
                enemy.aiData.driftDirection = Phaser.Math.Between(0, 360);
                enemy.aiData.changeTime = enemy.scene.time.now + Phaser.Math.Between(2000, 5000);
            }
            
            // 添加随机漂移
            const driftAngle = Phaser.Math.DegToRad(enemy.aiData.driftDirection);
            const driftSpeed = enemy.speed * 0.3;
            enemy.scene.physics.velocityFromRotation(driftAngle, driftSpeed, enemy.body.velocity);
        }
    },

    deceive: {
        name: "欺骗行为",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    disguise: true,
                    disguiseTimer: 0,
                    realBehavior: 'chase'
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            // 伪装状态：看起来无害
            if (enemy.aiData.disguise) {
                // 缓慢远离玩家
                const escapeAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
                enemy.scene.physics.velocityFromRotation(escapeAngle, enemy.speed * 0.3, enemy.body.velocity);
                
                // 距离很近时暴露真面目
                if (distance < 150) {
                    enemy.aiData.disguise = false;
                    enemy.aiData.disguiseTimer = enemy.scene.time.now + 5000;
                }
            } else {
                // 攻击状态
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 1.2, enemy.body.velocity);
                
                // 一段时间后重新伪装
                if (enemy.scene.time.now > enemy.aiData.disguiseTimer) {
                    enemy.aiData.disguise = true;
                }
            }
        }
    },

    tunnel: {
        name: "隧道行为",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    tunnelPoints: [],
                    currentPoint: 0,
                    tunnelSpeed: enemy.speed * 1.3
                };
                
                // 生成隧道路径点
                for (let i = 0; i < 5; i++) {
                    enemy.aiData.tunnelPoints.push({
                        x: Math.random() * 2000,
                        y: Math.random() * 1200
                    });
                }
            }
            
            const currentTarget = enemy.aiData.tunnelPoints[enemy.aiData.currentPoint];
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, currentTarget.x, currentTarget.y);
            
            if (distance < 50) {
                // 到达当前点，移动到下一个
                enemy.aiData.currentPoint = (enemy.aiData.currentPoint + 1) % enemy.aiData.tunnelPoints.length;
            }
            
            const nextTarget = enemy.aiData.tunnelPoints[enemy.aiData.currentPoint];
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nextTarget.x, nextTarget.y);
            enemy.scene.physics.velocityFromRotation(angle, enemy.aiData.tunnelSpeed, enemy.body.velocity);
        }
    },

    buzz: {
        name: "嗡嗡飞行",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    buzzAmplitude: 30,
                    buzzFrequency: 8,
                    startY: enemy.y,
                    horizontalSpeed: enemy.speed * 0.8
                };
            }
            
            // 水平移动
            enemy.setVelocityX(-enemy.aiData.horizontalSpeed);
            
            // 垂直嗡嗡运动
            const time = enemy.scene.time.now * 0.001;
            const newY = enemy.aiData.startY + Math.sin(time * enemy.aiData.buzzFrequency) * enemy.aiData.buzzAmplitude;
            enemy.setY(newY);
        }
    },

    root: {
        name: "扎根行为",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    rooted: false,
                    rootTimer: 0,
                    attackCooldown: 0
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            if (!enemy.aiData.rooted) {
                // 寻找扎根位置
                if (distance < 300) {
                    enemy.aiData.rooted = true;
                    enemy.aiData.rootTimer = enemy.scene.time.now + 8000; // 扎根8秒
                    enemy.setVelocity(0, 0);
                } else {
                    // 向玩家移动
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                    enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.5, enemy.body.velocity);
                }
            } else {
                // 扎根状态，停止移动，准备攻击
                enemy.setVelocity(0, 0);
                
                // 扎根时间结束
                if (enemy.scene.time.now > enemy.aiData.rootTimer) {
                    enemy.aiData.rooted = false;
                }
            }
        }
    },

    phase: {
        name: "相位移动",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    phaseTimer: 0,
                    phaseDuration: 2000,
                    normalSpeed: enemy.speed,
                    phaseSpeed: enemy.speed * 2
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            // 相位状态切换
            if (enemy.scene.time.now > enemy.aiData.phaseTimer) {
                enemy.aiData.phaseTimer = enemy.scene.time.now + enemy.aiData.phaseDuration;
            }
            
            const isPhasing = (enemy.scene.time.now - enemy.aiData.phaseTimer) < 1000;
            const currentSpeed = isPhasing ? enemy.aiData.phaseSpeed : enemy.aiData.normalSpeed;
            
            // 向玩家移动
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            enemy.scene.physics.velocityFromRotation(angle, currentSpeed, enemy.body.velocity);
            
            // 相位效果：透明度变化
            enemy.setAlpha(isPhasing ? 0.5 : 1);
        }
    },

    terrorize: {
        name: "恐吓行为",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    terrorRadius: 250,
                    terrorCooldown: 0,
                    lastTerror: 0
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            // 在恐吓范围内缓慢移动
            if (distance < enemy.aiData.terrorRadius) {
                // 围绕玩家移动
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                const orbitAngle = angle + Math.PI / 2; // 垂直方向
                enemy.scene.physics.velocityFromRotation(orbitAngle, enemy.speed * 0.6, enemy.body.velocity);
            } else {
                // 向玩家移动
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.8, enemy.body.velocity);
            }
        }
    },

    dive: {
        name: "俯冲攻击",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    state: 'circling', // circling, diving, recovering
                    diveCooldown: 0,
                    diveSpeed: enemy.speed * 2
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            switch (enemy.aiData.state) {
                case 'circling':
                    // 在玩家上方盘旋
                    const orbitAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                    const circleAngle = orbitAngle + Math.PI / 2;
                    enemy.scene.physics.velocityFromRotation(circleAngle, enemy.speed * 0.8, enemy.body.velocity);
                    
                    // 准备俯冲
                    if (enemy.scene.time.now > enemy.aiData.diveCooldown) {
                        enemy.aiData.state = 'diving';
                    }
                    break;
                    
                case 'diving':
                    // 快速俯冲
                    const diveAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                    enemy.scene.physics.velocityFromRotation(diveAngle, enemy.aiData.diveSpeed, enemy.body.velocity);
                    
                    if (distance < 100 || enemy.y > 800) {
                        enemy.aiData.state = 'recovering';
                    }
                    break;
                    
                case 'recovering':
                    // 恢复高度
                    enemy.setVelocityY(-enemy.speed);
                    if (enemy.y < 200) {
                        enemy.aiData.state = 'circling';
                        enemy.aiData.diveCooldown = enemy.scene.time.now + 3000;
                    }
                    break;
            }
        }
    },

    aerial: {
        name: "空中战斗",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    altitude: 200,
                    attackPattern: 0,
                    patternTimer: 0
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            // 保持高度
            if (enemy.y < enemy.aiData.altitude) {
                enemy.setVelocityY(enemy.speed * 0.5);
            } else if (enemy.y > enemy.aiData.altitude + 50) {
                enemy.setVelocityY(-enemy.speed * 0.5);
            }
            
            // 攻击模式切换
            if (enemy.scene.time.now > enemy.aiData.patternTimer) {
                enemy.aiData.attackPattern = (enemy.aiData.attackPattern + 1) % 3;
                enemy.aiData.patternTimer = enemy.scene.time.now + 4000;
            }
            
            let targetX, targetY;
            switch (enemy.aiData.attackPattern) {
                case 0: // 直接攻击
                    targetX = player.x;
                    targetY = player.y;
                    break;
                case 1: // 侧翼攻击
                    targetX = player.x + 100;
                    targetY = player.y;
                    break;
                case 2: // 包抄攻击
                    targetX = player.x - 100;
                    targetY = player.y;
                    break;
            }
            
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.9, enemy.body.velocity);
        }
    },

    honor: {
        name: "武士道",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    stance: 'ready', // ready, attacking, defending
                    stanceTimer: 0,
                    honorDistance: 150
                };
            }
            
            const player = enemy.scene.player;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
            
            // 保持武士距离
            if (distance < enemy.aiData.honorDistance) {
                const backAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
                enemy.scene.physics.velocityFromRotation(backAngle, enemy.speed * 0.5, enemy.body.velocity);
            } else if (distance > enemy.aiData.honorDistance + 50) {
                const approachAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                enemy.scene.physics.velocityFromRotation(approachAngle, enemy.speed * 0.7, enemy.body.velocity);
            } else {
                // 在理想距离，准备攻击
                enemy.setVelocity(0, 0);
                
                if (enemy.scene.time.now > enemy.aiData.stanceTimer) {
                    enemy.aiData.stance = 'attacking';
                    enemy.aiData.stanceTimer = enemy.scene.time.now + 1000;
                }
            }
        }
    },

    tactical: {
        name: "战术移动",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    tacticalPosition: { x: 0, y: 0 },
                    positionTimer: 0,
                    coverPoints: []
                };
                
                // 生成战术位置点
                for (let i = 0; i < 4; i++) {
                    enemy.aiData.coverPoints.push({
                        x: 400 + i * 300,
                        y: 200 + (i % 2) * 400
                    });
                }
            }
            
            const player = enemy.scene.player;
            
            // 定期选择新的战术位置
            if (enemy.scene.time.now > enemy.aiData.positionTimer) {
                const randomPoint = enemy.aiData.coverPoints[Phaser.Math.Between(0, 3)];
                enemy.aiData.tacticalPosition = randomPoint;
                enemy.aiData.positionTimer = enemy.scene.time.now + 5000;
            }
            
            // 移动到战术位置
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.aiData.tacticalPosition.x, enemy.aiData.tacticalPosition.y);
            enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.8, enemy.body.velocity);
        }
    },

    guard: {
        name: "守卫行为",
        update: (enemy) => {
            if (!enemy.aiData) {
                enemy.aiData = {
                    guardPosition: { x: enemy.x, y: enemy.y },
                    guardRadius: 100,
                    lastMove: 0
                };
            }
            
            // 在守卫位置附近巡逻
            const distanceFromGuard = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.aiData.guardPosition.x, enemy.aiData.guardPosition.y);
            
            if (distanceFromGuard > enemy.aiData.guardRadius) {
                // 返回守卫位置
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.aiData.guardPosition.x, enemy.aiData.guardPosition.y);
                enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.6, enemy.body.velocity);
            } else {
                // 在守卫范围内缓慢移动
                if (enemy.scene.time.now > enemy.aiData.lastMove) {
                    const randomAngle = Phaser.Math.Between(0, 360);
                    const randomDistance = Phaser.Math.Between(20, 50);
                    const targetX = enemy.aiData.guardPosition.x + Math.cos(Phaser.Math.DegToRad(randomAngle)) * randomDistance;
                    const targetY = enemy.aiData.guardPosition.y + Math.sin(Phaser.Math.DegToRad(randomAngle)) * randomDistance;
                    
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
                    enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.3, enemy.body.velocity);
                    
                    enemy.aiData.lastMove = enemy.scene.time.now + 2000;
                }
            }
        }
    },

    beam: {
        name: "光束移动",
        update: (enemy) => {
            if (!enemy.scene.player || !enemy.scene.player.active) return;
            
            if (!enemy.aiData) {
                enemy.aiData = {
                    beamTimer: 0,
                    beamDuration: 1000,
                    isBeaming: false
                };
            }
            
            const player = enemy.scene.player;
            
            if (!enemy.aiData.isBeaming) {
                // 准备光束攻击
                if (enemy.scene.time.now > enemy.aiData.beamTimer) {
                    enemy.aiData.isBeaming = true;
                    enemy.aiData.beamTimer = enemy.scene.time.now + enemy.aiData.beamDuration;
                    
                    // 停止移动，准备发射
                    enemy.setVelocity(0, 0);
                } else {
                    // 移动到合适位置
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                    enemy.scene.physics.velocityFromRotation(angle, enemy.speed * 0.7, enemy.body.velocity);
                }
            } else {
                // 光束攻击状态
                if (enemy.scene.time.now > enemy.aiData.beamTimer) {
                    enemy.aiData.isBeaming = false;
                    enemy.aiData.beamTimer = enemy.scene.time.now + 3000; // 3秒冷却
                }
            }
        }
    }
}; 