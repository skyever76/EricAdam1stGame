// scenes/EnemyBullet.js - ES6模块敌人子弹类

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // 使用占位符纹理初始化Sprite
        super(scene, x, y, 'bullet_dummy');
        
        this.scene = scene;
        this.damage = 20;
        this.speed = 200;
        this.lifetime = 3000;
        
        // 物理已由继承Phaser.Physics.Arcade.Sprite自动处理
        // 不需要手动调用scene.add.existing(this)和scene.physics.add.existing(this)
        
        // 设置生命周期计时器
        this.lifeTimer = null;
        
        // 添加到场景
        scene.add.existing(this);
    }
    
    fire(x, y, angle, config) {
        // 激活Sprite
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        
        // 设置位置
        this.setPosition(x, y);
        
        // 从配置对象设置属性
        this.damage = config.damage || 20;
        this.speed = config.speed || 200;
        
        // 🆕 添加敌人子弹发射信息
        const angleDegrees = Phaser.Math.RadToDeg(angle);
        console.log(`👹 敌人子弹发射: ${config.name || '敌人子弹'} | 位置: (${x}, ${y}) | 角度: ${angleDegrees.toFixed(1)}° | 速度: ${this.speed} | 伤害: ${this.damage} | 颜色: 红色 | 大小: ${config.size || 12}`);
        
        // 动态生成纹理
        this.generateAndApplyTexture(config);
        
        // 计算并设置物理速度
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        this.setRotation(angle);
        
        // 设置生命周期
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
        this.lifeTimer = this.scene.time.delayedCall(this.lifetime, () => {
            console.log(`⏰ 敌人子弹超时: ${config.name || '敌人子弹'} | 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)})`);
            this.kill();
        });
    }
    
    // 动态纹理生成逻辑
    generateAndApplyTexture(config) {
        const size = config.size || 12;
        const color = config.color || 0xff0000;
        const textureKey = `enemy_bullet_${size}_${color}`;
        
        // 如果纹理尚未缓存，则创建它
        if (!this.scene.textures.exists(textureKey)) {
            const graphics = this.scene.add.graphics();
            
            // 🆕 改进敌人子弹视觉效果，使其更明显
            // 1. 添加发光效果
            graphics.fillStyle(0xffffff, 0.6);
            graphics.fillCircle(size / 2, size / 2, size / 2 + 3);
            
            // 2. 绘制子弹主体
            graphics.fillStyle(color);
            graphics.fillCircle(size / 2, size / 2, size / 2);
            
            // 3. 添加边框
            graphics.lineStyle(2, 0xffffff);
            graphics.strokeCircle(size / 2, size / 2, size / 2);
            
            // 4. 添加内部高光
            graphics.fillStyle(0xffffff, 0.8);
            graphics.fillCircle(size / 2 - 2, size / 2 - 2, 3);
            
            // 根据敌人类型添加特殊特效
            if (config.enemyType) {
                switch (config.enemyType) {
                    case 'alien':
                        graphics.lineStyle(1, 0x00ff00);
                        graphics.strokeCircle(size / 2, size / 2, size / 2 + 1);
                        break;
                    case 'robot':
                        graphics.lineStyle(1, 0x888888);
                        graphics.strokeCircle(size / 2, size / 2, size / 2 + 1);
                        break;
                    case 'boss':
                        graphics.lineStyle(3, 0xff0000);
                        graphics.strokeCircle(size / 2, size / 2, size / 2 + 2);
                        // 添加能量效果
                        graphics.fillStyle(0xffff00);
                        graphics.fillCircle(size / 2, size / 2, 3);
                        break;
                }
            }
            
            // 生成纹理并销毁graphics对象
            graphics.generateTexture(textureKey, size, size);
            graphics.destroy();
        }
        
        // 将动态生成的纹理应用到这个Sprite上
        this.setTexture(textureKey);
        // 调整物理体大小以匹配纹理
        this.body.setSize(size, size);
        
        // 🆕 设置高深度，确保敌人子弹在最上层显示
        this.setDepth(50);
    }
    
    // update方法现在是Sprite的一部分，Phaser会自动调用
    preUpdate(time, delta) {
        super.preUpdate(time, delta); // 必须调用父类的preUpdate
        
        // 🆕 添加敌人子弹位置跟踪（每秒显示一次）
        if (time % 1000 < 16) { // 每秒显示一次
            console.log(`🎯 敌人子弹飞行: 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)}) | 速度: (${this.body.velocity.x.toFixed(0)}, ${this.body.velocity.y.toFixed(0)})`);
        }
        
        // 检查边界
        if (this.x < -100 || this.x > 4100 || this.y < -100 || this.y > 820) {
            console.log(`🌍 敌人子弹飞出边界: 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)})`);
            this.kill();
        }
    }
    
    // 定义一个kill方法用于回收对象池
    kill() {
        if (!this.active) return; // 防止重复回收
        
        console.log(`💥 敌人子弹销毁: 位置: (${this.x.toFixed(0)}, ${this.y.toFixed(0)})`);
        
        // 创建销毁效果
        this.createDestroyEffect();
        
        // 回收对象
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.enable = false;
        
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
    }
    
    createDestroyEffect() {
        // 🆕 改进敌人子弹销毁效果，使其更明显
        const effect = this.scene.add.graphics();
        
        // 创建多层爆炸效果
        // 外层光晕
        effect.fillStyle(0xffffff, 0.8);
        effect.fillCircle(this.x, this.y, 15);
        
        // 中层红色
        effect.fillStyle(0xff0000, 0.9);
        effect.fillCircle(this.x, this.y, 10);
        
        // 内层白色
        effect.fillStyle(0xffffff, 1);
        effect.fillCircle(this.x, this.y, 5);
        
        effect.setDepth(60);
        
        // 改进的缩放和淡出动画
        this.scene.tweens.add({
            targets: effect,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                if (effect && effect.active) {
                    effect.destroy();
                }
            }
        });
    }
    
    destroy() {
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
        super.destroy();
    }
}

console.log('✅ EnemyBullet.js ES6模块已加载'); 