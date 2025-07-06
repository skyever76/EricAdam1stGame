// levels.js - 关卡配置系统

export const LEVELS_CONFIG = [
    {
        id: 1,
        name: "城市危机",
        description: "暴徒正在城市中肆虐，消灭他们！",
        background: "city",
        bgColor: 0x2c3e50,
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
                hp: 50,
                speed: 80,
                score: 25,  // 🔧 提高积分：从15增加到25
                ai: "straight",
                canShoot: false,
                shootRate: 0,
                weight: 1.0 // 生成权重
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
        bgColor: 0xd2691e,
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
                hp: 80,
                speed: 40,  // 🔧 降低60%：从100降到40
                score: 35,  // 🔧 提高积分：从20增加到35
                ai: "curve",
                canShoot: false,
                shootRate: 0,
                weight: 0.8
            },
            {
                name: "暴徒",
                sprite: "thug",
                hp: 60,
                speed: 36,  // 🔧 降低60%：从90降到36
                score: 30,  // 🔧 提高积分：从15增加到30
                ai: "straight",
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
        bgColor: 0x228b22,
        playerSkin: "elf",
        music: "forest_theme",
        spawnRate: 1600,
        maxEnemies: 7,
        levelDuration: 90000,
        targetKills: 30,
        enemies: [
            {
                name: "森林狼",
                sprite: "wolf",
                hp: 100,
                speed: 80,  // 🔧 降低速度：从120降到80
                score: 45,  // 🔧 提高积分：从25增加到45
                ai: "zigzag",
                canShoot: false,
                shootRate: 0,
                weight: 0.6
            },
            {
                name: "弓箭手",
                sprite: "archer",
                hp: 70,
                speed: 40,  // 🔧 降低速度：从60降到40
                score: 50,  // 🔧 提高积分：从30增加到50
                ai: "straight",
                canShoot: true,
                shootRate: 3000,
                weight: 0.4
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
        bgColor: 0x191970,
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
                hp: 120,
                speed: 140,
                score: 55,  // 🔧 提高积分：从30增加到55
                ai: "chase",
                canShoot: true,
                shootRate: 2500,
                weight: 0.5
            },
            {
                name: "电鳗",
                sprite: "eel",
                hp: 90,
                speed: 160,
                score: 45,  // 🔧 提高积分：从25增加到45
                ai: "zigzag",
                canShoot: false,
                shootRate: 0,
                weight: 0.3
            },
            {
                name: "海盗",
                sprite: "pirate",
                hp: 110,
                speed: 80,
                score: 60,  // 🔧 提高积分：从35增加到60
                ai: "straight",
                canShoot: true,
                shootRate: 2000,
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
        bgColor: 0x000000,
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
                hp: 150,
                speed: 100,
                score: 70,  // 🔧 提高积分：从40增加到70
                ai: "chase",
                canShoot: true,
                shootRate: 1500,
                weight: 0.4
            },
            {
                name: "机器人",
                sprite: "robot",
                hp: 200,
                speed: 80,
                score: 80,  // 🔧 提高积分：从50增加到80
                ai: "smart",
                canShoot: true,
                shootRate: 1800,
                weight: 0.3
            },
            {
                name: "飞碟",
                sprite: "ufo",
                hp: 120,
                speed: 180,
                score: 65,  // 🔧 提高积分：从35增加到65
                ai: "curve",
                canShoot: true,
                shootRate: 2200,
                weight: 0.2
            },
            {
                name: "BOSS",
                sprite: "boss",
                hp: 500,
                speed: 60,
                score: 300,  // 🔧 提高积分：从200增加到300
                ai: "boss",
                canShoot: true,
                shootRate: 800,
                weight: 0.1
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
                    speed: enemy.enemyData.speed
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
          
            const speed = enemy.enemyData.speed * 0.8;
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
            const speed = enemy.enemyData.speed;
          
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
    }
}; 