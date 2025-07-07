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
        
        // 动态生成纹理
        this.generateAndApplyTexture(config);
        
        // 计算并设置物理速度
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        this.setRotation(angle);
        
        // 设置生命周期
        if (this.lifeTimer) {
            this.lifeTimer.remove(false);
        }
        this.lifeTimer = this.scene.time.delayedCall(this.lifetime, this.kill, [], this);
    }
    
    // 动态纹理生成逻辑
    generateAndApplyTexture(config) {
        const size = config.size || 8;
        const color = config.color || 0xff0000;
        const textureKey = `enemy_bullet_${size}_${color}`;
        
        // 如果纹理尚未缓存，则创建它
        if (!this.scene.textures.exists(textureKey)) {
            const graphics = this.scene.add.graphics();
            
            // 绘制子弹主体
            graphics.fillStyle(color);
            graphics.fillCircle(size / 2, size / 2, size / 2);
            
            // 根据敌人类型添加特效（可选）
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
                        graphics.lineStyle(2, 0xff0000);
                        graphics.strokeCircle(size / 2, size / 2, size / 2 + 2);
                        // 添加能量效果
                        graphics.fillStyle(0xffff00);
                        graphics.fillCircle(size / 2, size / 2, 2);
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
        if (!this.active) return; // 防止重复回收
        
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
        // 创建小型爆炸效果
        const particles = this.scene.add.particles('particle');
        const emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 500,
            quantity: 8
        });
        
        // 延迟销毁粒子
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
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