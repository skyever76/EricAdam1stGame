// scenes/Bullet.js - 子弹类

// 🆕 子弹类，支持不同武器类型
class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.weaponType = null;
        this.damage = 10;
    }

    fire(x, y, weapon) {
        this.setActive(true).setVisible(true);
        this.body.reset(x, y);
        this.weaponType = weapon.name;
        this.damage = weapon.damage;

        // 计算射击角度（朝向鼠标位置）
        const angle = Phaser.Math.Angle.Between(
            x, y,
            this.scene.input.activePointer.worldX,
            this.scene.input.activePointer.worldY
        );

        // 设置速度和大小
        this.scene.physics.velocityFromRotation(
            angle,
            weapon.bulletSpeed,
            this.body.velocity
        );
      
        this.setDisplaySize(weapon.bulletSize.width, weapon.bulletSize.height);
        this.setTint(weapon.bulletColor);
        
        // 🆕 声波枪特殊旋转处理
        if (weapon.name === '声波枪') {
            this.setRotation(angle + Math.PI / 2);
        }

        // 🆕 特殊武器效果
        if (weapon.specialEffect) {
            weapon.specialEffect(this, x, y);
        }

        // 自动销毁
        this.scene.time.delayedCall(GAME_CONFIG.BULLET_LIFETIME, () => {
            if (this.active) this.destroy();
        }, null, this);
    }

    // 销毁越界子弹
    preUpdate() {
        super.preUpdate();
      
        // 🆕 横版卷轴：检查是否飞出边界
        const worldView = this.scene.cameras.main.worldView;
        const margin = GAME_CONFIG.BULLET_BOUNDARY_MARGIN;
        const isOutOfBounds = 
            this.x < worldView.x - margin || 
            this.x > worldView.x + worldView.width + margin ||
            this.y < -margin || 
            this.y > GAME_CONFIG.WORLD_HEIGHT + margin;
      
        if (isOutOfBounds) {
            // 导弹和核弹在边界爆炸
            if (this.weaponType === '导弹' || this.weaponType === '核弹') {
                this.explodeAtBoundary();
            } else {
                this.destroy();
            }
        }
    }
    
    // 🆕 在边界爆炸
    explodeAtBoundary() {
        console.log(`边界爆炸触发：${this.weaponType} 在位置 (${this.x}, ${this.y})`);
        
        if (this.weaponType === '导弹') {
            this.scene.executeMissileExplosion(this, { x: this.x, y: this.y });
        } else if (this.weaponType === '核弹') {
            this.scene.executeNuclearStrike(this, { x: this.x, y: this.y });
        }
        
        // 延迟销毁子弹，确保爆炸效果完成
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
}

// 将Bullet类暴露到全局
window.Bullet = Bullet; 