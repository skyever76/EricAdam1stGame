// SceneSwitcher.js - 场景切换UI
class SceneSwitcher {
    constructor(scene, sceneConfig) {
        this.scene = scene;
        this.sceneConfig = sceneConfig; // 保存注入的场景配置
        this.isVisible = false;
        this.container = null;
      
        this.createSwitcherUI();
    }
  
    // 🎨 创建切换器UI
    createSwitcherUI() {
        this.container = this.scene.add.container(100, 100);
        this.container.setDepth(1500);
        this.container.setScrollFactor(0);
        this.container.setVisible(false);
      
        // 背景
        const bg = this.scene.add.rectangle(0, 0, 300, 400, 0x000000, 0.8);
        // 使用Graphics绘制边框，兼容性更好
        const border = this.scene.add.graphics();
        border.lineStyle(2, 0xffffff);
        border.strokeRect(-150, -200, 300, 400);
      
        // 标题
        const title = this.scene.add.text(0, -180, '🌍 场景选择', {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
      
        this.container.add([bg, border, title]);
      
        // 创建场景按钮
        this.createSceneButtons();
      
        // 关闭按钮
        const closeBtn = this.scene.add.text(130, -180, '✖', {
            fontSize: '18px',
            fill: '#ff0000'
        }).setOrigin(0.5);
      
        closeBtn.setInteractive({ cursor: 'pointer' });
        closeBtn.on('pointerdown', () => {
            this.hide();
        });
      
        this.container.add(closeBtn);
    }
  
    // 🔘 创建场景按钮
    createSceneButtons() {
        // 使用注入的场景配置而不是全局变量
        const scenes = Object.values(this.sceneConfig);
      
        scenes.forEach((sceneData, index) => {
            const y = -120 + index * 45;
          
            // 按钮背景
            const btnBg = this.scene.add.rectangle(0, y, 260, 35, 0x333333);
            // 使用Graphics绘制按钮边框
            const btnBorder = this.scene.add.graphics();
            btnBorder.lineStyle(1, 0x666666);
            btnBorder.strokeRect(-130, y - 17.5, 260, 35);
            btnBg.setInteractive({ cursor: 'pointer' });
          
            // 场景名称
            const name = this.scene.add.text(-100, y, sceneData.name, {
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
          
            // 场景描述
            const desc = this.scene.add.text(100, y, '进入', {
                fontSize: '12px',
                fill: '#00ff00'
            }).setOrigin(1, 0.5);
          
            // 点击事件
            btnBg.on('pointerdown', () => {
                this.switchToScene(sceneData.id);
            });
          
            // 悬停效果
            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0x555555);
                name.setFill('#ffff00');
            });
          
            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x333333);
                name.setFill('#ffffff');
            });
          
            this.container.add([btnBg, btnBorder, name, desc]);
        });
    }
  
    // 🌍 切换到场景
    switchToScene(sceneId) {
        console.log(`🌍 切换到场景: ${sceneId}`);
      
        if (this.scene.advancedSceneManager) {
            this.scene.advancedSceneManager.loadScene(sceneId);
        }
      
        this.hide();
      
        // 显示切换通知
        this.showSwitchNotification(sceneId);
    }
  
    // 📢 显示切换通知
    showSwitchNotification(sceneId) {
        // 使用注入的场景配置而不是全局变量
        const sceneData = this.sceneConfig[sceneId];
        if (!sceneData) return;
      
        const notification = this.scene.add.container(640, 150);
      
        const bg = this.scene.add.rectangle(0, 0, 400, 80, 0x000000, 0.8);
        // 使用Graphics绘制通知边框
        const notifBorder = this.scene.add.graphics();
        notifBorder.lineStyle(2, 0x00ff00);
        notifBorder.strokeRect(-200, -40, 400, 80);
      
        const text = this.scene.add.text(0, -15, `🌍 进入场景`, {
            fontSize: '18px',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
      
        const name = this.scene.add.text(0, 15, sceneData.name, {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
      
        notification.add([bg, notifBorder, text, name]);
        notification.setDepth(2000);
        notification.setScrollFactor(0);
      
        // 动画
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 180,
            duration: 500,
            ease: 'Back'
        });
      
        // 3秒后消失
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                y: 120,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
  
    // 👁️ 显示切换器
    show() {
        this.isVisible = true;
        this.container.setVisible(true);
      
        // 淡入动画
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }
  
    // 🙈 隐藏切换器
    hide() {
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.isVisible = false;
                this.container.setVisible(false);
            }
        });
    }
  
    // 🔄 切换显示状态
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// ES6模块导出
export { SceneSwitcher }; 