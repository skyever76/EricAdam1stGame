// scenes/Bullet.js - ES6模块子弹系统

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // 使用占位符纹理初始化Sprite
        super(scene, x, y, 'bullet_dummy');
        
        this.scene = scene;
        this.damage = 25;
        this.speed = 600;
        this.lifetime = 3000;
        this.size = { width: 8, height: 8 };
        this.color = 0xffff00;
        this.weaponType = 'default';
        
        // 物理已由继承Phaser.Physics.Arcade.Sprite自动处理
        // 不需要手动调用scene.physics.add.existing(this)
        
        // 设置生命周期
        this.lifeTimer = null;
        
        // 添加到场景
        scene.add.existing(this);
    }
    
    // 🆕 fire方法 - 从Weapon配置初始化子弹
    fire(x, y, angle, weapon) {
        // 激活Sprite
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true; // 确保物理体是激活的
        
        // 设置位置
        this.setPosition(x, y);
        
        // ✅ 关键修复！设置高深度确保子弹在最上层
        this.setDepth(100);
        
        // 🆕 添加调试信息
        console.log(`🔫 子弹fire方法: 位置(${x}, ${y}), 深度=${this.depth}, 可见性=${this.visible}, 激活=${this.active}`);
        
        // 从武器配置获取属性
        this.damage = weapon.damage;
        this.speed = weapon.bulletSpeed;
        this.size = weapon.bulletSize;
        this.color = weapon.bulletColor;
        this.weaponType = weapon.name;
        // 🆕 设置子弹生命周期 - 从武器配置或使用默认值
        this.lifetime = weapon.lifetime || 3000; // 默认3秒
        
        // 动态生成并应用纹理
        this.generateAndApplyTexture(weapon);
        
        // ✅ 确保子弹可见性
        this.setAlpha(1); // 确保完全不透明
        
        // 计算并设置物理速度
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        
        // 🆕 添加子弹飞行信息
        const angleDegrees = Phaser.Math.RadToDeg(angle);
        const velocityX = this.body.velocity.x;
        const velocityY = this.body.velocity.y;
        console.log(`🚀 子弹发射: ${weapon.name} | 角度: ${angleDegrees.toFixed(1)}° | 速度: ${this.speed} | 方向: (${velocityX.toFixed(0)}, ${velocityY.toFixed(0)})`);
        
        // 设置生命周期
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
        this.lifeTimer = this.scene.time.delayedCall(this.lifetime, () => {
            console.log(`⏰ 子弹超时销毁: ${weapon.name} | 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)})`);
            this.kill();
        });
    }
    
    // 动态纹理生成逻辑
    generateAndApplyTexture(weaponConfig) {
        const size = Math.max(weaponConfig.bulletSize.width, 12); // 🆕 最小12像素确保可见
        const textureKey = `bullet_${weaponConfig.name}_${size}`; // 创建唯一的纹理key
        
        // 如果纹理尚未缓存，则创建它
        if (!this.scene.textures.exists(textureKey)) {
            const graphics = this.scene.add.graphics();
            
            // 🆕 绘制子弹主体 - 确保可见
            graphics.fillStyle(weaponConfig.bulletColor);
            graphics.fillCircle(size / 2, size / 2, size / 2);
            
            // 根据武器类型添加特效
            switch (weaponConfig.name) {
                case 'AK47':
                    // 添加发光效果
                    graphics.fillStyle(0xffff00, 0.8);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 4);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(3, 0xffaa00);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    // 高光效果
                    graphics.fillStyle(0xffffff, 0.9);
                    graphics.fillCircle(size / 2 - 3, size / 2 - 3, 3);
                    break;
                    
                case '沙漠之鹰':
                    // 添加发光效果
                    graphics.fillStyle(0xffff00, 0.7);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 3);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(2, 0xff6600);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    // 高光效果
                    graphics.fillStyle(0xffffff, 0.8);
                    graphics.fillCircle(size / 2 - 2, size / 2 - 2, 2);
                    break;
                    
                case '加特林':
                    // 添加发光效果
                    graphics.fillStyle(0xff6666, 0.7);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 2);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(2, 0xff0000);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    break;
                    
                case '声波枪':
                    // 添加发光效果
                    graphics.fillStyle(0x00ffff, 0.7);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 3);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(2, 0x00ffff);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    // 电弧效果
                    graphics.lineStyle(2, 0xffffff);
                    graphics.beginPath();
                    graphics.moveTo(-3, size / 2 - 3);
                    graphics.lineTo(-6, size / 2 + 3);
                    graphics.strokePath();
                    break;
                    
                case '导弹':
                    // 添加发光效果
                    graphics.fillStyle(0xffaa00, 0.7);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 4);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(3, 0xff00ff);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    // 添加尾焰效果
                    graphics.fillStyle(0xffaa00);
                    graphics.fillCircle(-4, size / 2, 4);
                    break;
                    
                case '核弹':
                    // 添加发光效果
                    graphics.fillStyle(0xff6666, 0.8);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 5);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(4, 0xff0000);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    // 添加放射性效果
                    graphics.fillStyle(0x00ff00);
                    graphics.fillCircle(size / 2, size / 2, 3);
                    break;
                    
                default:
                    // 🆕 默认发光效果 - 确保可见
                    graphics.fillStyle(0xffffff, 0.6);
                    graphics.fillCircle(size / 2, size / 2, size / 2 + 2);
                    // 主体
                    graphics.fillStyle(weaponConfig.bulletColor);
                    graphics.fillCircle(size / 2, size / 2, size / 2);
                    // 边框
                    graphics.lineStyle(2, 0xffffff);
                    graphics.strokeCircle(size / 2, size / 2, size / 2);
                    break;
            }
            
            // 生成纹理并销毁graphics对象
            graphics.generateTexture(textureKey, size, size);
            graphics.destroy();
        }
        
        // 将动态生成的纹理应用到这个Sprite上
        this.setTexture(textureKey);
        // 🆕 调整物理体大小以匹配纹理
        this.body.setSize(size, size);
        
        // 🆕 添加调试信息
        console.log(`🔫 子弹纹理生成: 纹理键=${textureKey}, 大小=${size}, 物理体大小=${this.body.width}x${this.body.height}`);
    }
    
    // update方法现在是Sprite的一部分，Phaser会自动调用
    preUpdate(time, delta) {
        super.preUpdate(time, delta); // 必须调用父类的preUpdate
        
        // 🆕 添加子弹位置跟踪（每秒显示一次）
        if (time % 1000 < 16) { // 每秒显示一次
            console.log(`🎯 子弹飞行: ${this.weaponType} | 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)}) | 速度: (${this.body.velocity.x.toFixed(0)}, ${this.body.velocity.y.toFixed(0)})`);
        }
        
        // 检查边界
        if (this.x < -100 || this.x > 4100 || this.y < -100 || this.y > 820) {
            console.log(`🌍 子弹飞出边界: ${this.weaponType} | 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)})`);
            this.kill();
        }
    }
    
    // 定义一个kill方法用于回收对象池
    kill() {
        console.log(`💥 子弹销毁: ${this.weaponType} | 最终位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)})`);
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.enable = false; // 禁用物理体
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
    }
    
    destroy() {
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
        super.destroy();
    }
}

console.log('✅ Bullet.js ES6模块已加载'); 