// powerUps.js - 道具配置
const POWER_UP_TYPES = {
    HEALTH_PACK: {
        type: 'health_pack',
        name: '医疗包',
        symbol: '❤️',
        color: 0xff4444,
        lifeTime: 20000,
        rarity: 0.15,
        description: '恢复50点生命值',
        effect: {
            type: 'heal',
            amount: 50
        }
    },
    POWER_PILL: {
        type: 'power_pill',
        name: '大力丸',
        symbol: '💊',
        color: 0xffaa00,
        lifeTime: 25000,
        rarity: 0.08,
        description: '30秒内攻击力翻倍、射速提升、子弹免费',
        effect: {
            type: 'temporary_boost',
            duration: 30000,
            damageMultiplier: 2.0,
            fireRateMultiplier: 1.5,
            freeBullets: true
        }
    },
    RAPID_FIRE: {
        type: 'rapid_fire',
        name: '连射器',
        symbol: '🔫',
        color: 0x00ff88,
        lifeTime: 18000,
        rarity: 0.12,
        description: '15秒内射速大幅提升',
        effect: {
            type: 'temporary_boost',
            duration: 15000,
            fireRateMultiplier: 2.5
        }
    },
    SHIELD: {
        type: 'shield',
        name: '护盾',
        symbol: '🛡️',
        color: 0x4488ff,
        lifeTime: 22000,
        rarity: 0.10,
        description: '10秒内免疫伤害',
        effect: {
            type: 'temporary_boost',
            duration: 10000,
            invulnerable: true
        }
    }
};
const ENEMY_DROP_RATES = {
    '小兵': 0.15,
    '士兵': 0.20,
    '狙击手': 0.25,
    '机枪手': 0.30,
    '坦克': 0.35,
    '直升机': 0.40,
    'BOSS': 0.60
};
window.POWER_UP_TYPES = POWER_UP_TYPES;
window.ENEMY_DROP_RATES = ENEMY_DROP_RATES; 