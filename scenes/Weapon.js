// scenes/Weapon.js - ES6模块武器系统

export class Weapon {
    constructor(scene, config) {
        this.scene = scene; // 保留对scene的引用可能有用
        
        // 1. 直接从配置初始化所有属性
        this.name = config.name;
        this.damage = config.damage;
        this.fireRate = config.fireRate;
        this.bulletSpeed = config.bulletSpeed;
        this.bulletSize = config.bulletSize;
        this.bulletColor = config.bulletColor;
        this.texture = config.texture; // 子弹的纹理
        this.burstCount = config.burstCount || 1;
        this.burstDelay = config.burstDelay || 0;
        this.bulletCost = config.bulletCost || 0;
        this.isContinuous = config.isContinuous || false;
        this.duration = config.duration || 0;
        
        // 2. 管理自身的状态 (例如，子弹数量)
        this.bulletCount = config.initialBullets || 0;
        
        // 3. 移除所有与子弹创建、物理和对象池相关的逻辑
        // 这些逻辑应该在MainScene中处理
    }

    // 可以保留一些辅助方法，如果需要的话
    hasAmmo() {
        if (this.bulletCost === 0) return true; // 无限子弹
        return this.bulletCount > 0;
    }

    consumeAmmo() {
        if (this.bulletCost > 0) {
            this.bulletCount--;
        }
    }
    
    // 获取武器配置信息
    getConfig() {
        return {
            name: this.name,
            damage: this.damage,
            fireRate: this.fireRate,
            bulletSpeed: this.bulletSpeed,
            bulletSize: this.bulletSize,
            bulletColor: this.bulletColor,
            texture: this.texture,
            burstCount: this.burstCount,
            burstDelay: this.burstDelay,
            bulletCost: this.bulletCost,
            isContinuous: this.isContinuous,
            duration: this.duration
        };
    }
    
    // 检查是否可以射击（基于冷却时间）
    canFire(lastFireTime) {
        const now = Date.now();
        return now - lastFireTime >= this.fireRate;
    }
    
    // 获取连发延迟数组
    getBurstDelays() {
        const delays = [];
        for (let i = 0; i < this.burstCount; i++) {
            delays.push(i * this.burstDelay);
        }
        return delays;
    }
}

console.log('✅ Weapon.js ES6模块已加载'); 