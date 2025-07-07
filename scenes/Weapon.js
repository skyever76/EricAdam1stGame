// scenes/Weapon.js - 武器类

// 🆕 武器系统类
class Weapon {
    constructor(name, damage, fireRate, bulletSpeed, bulletSize, bulletColor, texture, 
                burstCount = 1, burstDelay = 0, bulletCost = 0, specialEffect = null, 
                isContinuous = false, duration = 0, config = {}) {
        this.name = name;
        this.damage = damage;
        this.fireRate = fireRate; // 毫秒
        this.bulletSpeed = bulletSpeed;
        this.bulletSize = bulletSize;
        this.bulletColor = bulletColor;
        this.texture = texture;
        this.burstCount = burstCount; // 连发数量
        this.burstDelay = burstDelay; // 连发间隔
        this.bulletCost = bulletCost; // 每发子弹消耗积分
        this.specialEffect = specialEffect;
        this.isContinuous = isContinuous; // 是否持续武器
        this.duration = duration; // 持续时间
        this.bulletCount = 0; // 当前子弹数量
        this.config = config;
    }

    // 检查是否可以射击
    canFire() {
        if (this.bulletCost > 0 && this.bulletCount <= 0) {
            return false;
        }
        return true;
    }

    // 消耗子弹
    consumeBullet() {
        if (this.bulletCost > 0) {
            this.bulletCount = Math.max(0, this.bulletCount - 1);
        }
    }

    // 添加子弹
    addBullets(count) {
        this.bulletCount += count;
    }

    // 获取子弹数量
    getBulletCount() {
        return this.bulletCount;
    }

    // 获取武器信息
    getInfo() {
        return {
            name: this.name,
            damage: this.damage,
            fireRate: this.fireRate,
            bulletSpeed: this.bulletSpeed,
            bulletCost: this.bulletCost,
            bulletCount: this.bulletCount,
            isContinuous: this.isContinuous,
            duration: this.duration
        };
    }
}

// 将Weapon类暴露到全局
window.Weapon = Weapon; 