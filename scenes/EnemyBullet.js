// EnemyBullet.js - 敌人子弹类

class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemyBullet');
        this.speed = 300;
        this.damage = 15;
    }
  
    fireAtPlayer(x, y, player) {
        this.setActive(true).setVisible(true);
        this.body.reset(x, y);
      
        // 计算朝向玩家的角度
        const angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);
      
        // 设置速度
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      
        // 设置外观
        this.setDisplaySize(8, 8);
        this.setTint(0x990000); // 深红色敌人子弹，在偏淡背景上更清晰
      
        // 自动销毁
        this.scene.time.delayedCall(4000, () => {
            if (this.active) this.destroy();
        }, null, this);
    }
  
    preUpdate() {
        super.preUpdate();
      
        // 越界销毁
        if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
            this.destroy();
        }
    }
}

// 🆕 导出到全局作用域
window.EnemyBullet = EnemyBullet; 