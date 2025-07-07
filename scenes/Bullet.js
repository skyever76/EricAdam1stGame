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
        
        // 从武器配置获取属性
        this.damage = weapon.damage;
        this.speed = weapon.bulletSpeed;
        this.size = weapon.bulletSize;
        this.color = weapon.bulletColor;
        this.weaponType = weapon.name;
        
        // 动态生成并应用纹理
        this.generateAndApplyTexture(weapon);
        
        // 计算并设置物理速度
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        
        // 设置生命周期
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
        this.lifeTimer = this.scene.time.delayedCall(this.lifetime, () => {
            this.kill();
        });
    }
    
    // 动态纹理生成逻辑
    generateAndApplyTexture(weaponConfig) {
        const size = weaponConfig.bulletSize.width; // 假设宽高一致
        const textureKey = `bullet_${weaponConfig.name}_${size}`; // 创建唯一的纹理key
        
        // 如果纹理尚未缓存，则创建它
        if (!this.scene.textures.exists(textureKey)) {
            const graphics = this.scene.add.graphics();
            
            // 绘制子弹主体
            graphics.fillStyle(weaponConfig.bulletColor);
            graphics.fillCircle(size / 2, size / 2, size / 2);
            
            // 根据武器类型添加特效
            switch (weaponConfig.name) {
                case 'AK47':
                    graphics.lineStyle(2, 0xffaa00);
                    graphics.strokeCircle(size / 2, size / 2, size / 2 + 2);
                    break;
                case '沙漠之鹰':
                    graphics.lineStyle(3, 0xff6600);
                    graphics.strokeCircle(size / 2, size / 2, size / 2 + 3);
                    break;
                case '加特林':
                    graphics.lineStyle(1, 0xff0000);
                    graphics.strokeCircle(size / 2, size / 2, size / 2 + 1);
                    break;
                case '导弹':
                    graphics.lineStyle(2, 0xff00ff);
                    graphics.strokeCircle(size / 2, size / 2, size / 2 + 2);
                    // 添加尾焰效果
                    graphics.fillStyle(0xffaa00);
                    graphics.fillCircle(-3, size / 2, 3); // 在圆心左侧3像素处绘制
                    break;
                case '核弹':
                    graphics.lineStyle(4, 0xff0000);
                    graphics.strokeCircle(size / 2, size / 2, size / 2 + 4);
                    // 添加放射性效果
                    graphics.fillStyle(0x00ff00);
                    graphics.fillCircle(size / 2, size / 2, 2);
                    break;
                case '特斯拉枪':
                    graphics.lineStyle(2, 0x00ffff);
                    graphics.strokeCircle(size / 2, size / 2, size / 2 + 2);
                    // 添加电弧效果
                    graphics.lineStyle(1, 0xffffff);
                    graphics.beginPath();
                    graphics.moveTo(-2, size / 2 - 2);
                    graphics.lineTo(-4, size / 2 + 2);
                    graphics.strokePath();
                    break;
            }
            
            // 生成纹理并销毁graphics对象
            graphics.generateTexture(textureKey, size, size);
            graphics.destroy();
        }
        
        // 将动态生成的纹理应用到这个Sprite上
        this.setTexture(textureKey);
        // 调整物理体大小以匹配纹理
        this.body.setSize(size, size);
    }
    
    // update方法现在是Sprite的一部分，Phaser会自动调用
    preUpdate(time, delta) {
        super.preUpdate(time, delta); // 必须调用父类的preUpdate
        
        // 检查边界
        if (this.x < -100 || this.x > 4100 || this.y < -100 || this.y > 820) {
            this.kill();
        }
    }
    
    // 定义一个kill方法用于回收对象池
    kill() {
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