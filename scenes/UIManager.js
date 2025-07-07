// scenes/UIManager.js - UI管理器

class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.game = scene.game;
        
        // UI元素引用
        this.hudElements = {};
        this.dialogs = {};
        this.buttons = {};
        this.containers = {};
        
        // UI状态
        this.isPaused = false;
        this.isGameOver = false;
        this.isLevelCompleted = false;
    }

    // 🎯 创建主HUD
    createHUD() {
        console.log('UIManager: 创建游戏HUD');
        
        // 游戏状态初始化
        this.scene.score = (this.scene.selectedPlayer && this.scene.selectedPlayer.initPoints) ? this.scene.selectedPlayer.initPoints : 0;
        this.scene.level = 1;
        
        // 创建HUD容器
        this.hudContainer = this.scene.add.container(0, 0).setScrollFactor(0);
        
        // 创建各个HUD元素
        this.createScoreDisplay();
        this.createHealthDisplay();
        this.createLevelInfo();
        this.createDistanceProgress();
        this.createMiniMap();
        this.createWeaponDisplay();
        this.createRightSideHUD();
        this.createAudioControls();
        this.createStatsButton();
        
        // 移动端适配
        if (this.scene.touchControls && this.scene.touchControls.isMobile) {
            this.adjustForMobile();
        }
        
        console.log('📊 UIManager: HUD创建完成');
    }

    // 📊 创建分数显示
    createScoreDisplay() {
        const style = this.getHUDStyle();
        this.hudElements.scoreText = this.scene.add.text(
            UI_LAYOUT.SCORE_POS.x, 
            UI_LAYOUT.SCORE_POS.y, 
            '分数: 0', 
            style
        );
        this.hudContainer.add(this.hudElements.scoreText);
    }

    // ❤️ 创建血量显示
    createHealthDisplay() {
        const style = this.getHUDStyle();
        this.hudElements.healthText = this.scene.add.text(
            UI_LAYOUT.HEALTH_POS.x, 
            UI_LAYOUT.HEALTH_POS.y, 
            `血量: ${this.scene.currentHealth}/${this.scene.maxHealth}`, 
            style
        );
        this.hudContainer.add(this.hudElements.healthText);
        
        // 创建血量条
        this.createHealthBar();
    }

    // 🩸 创建血量条
    createHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = UI_LAYOUT.HEALTH_POS.x + 80;
        const y = UI_LAYOUT.HEALTH_POS.y + 10;
        
        // 血量条背景
        this.hudElements.healthBarBg = this.scene.add.rectangle(
            x, y, barWidth, barHeight, 
            COLOR_CONFIG.BLACK, 0.8
        ).setOrigin(0, 0.5);
        
        // 血量条
        this.hudElements.healthBar = this.scene.add.rectangle(
            x, y, barWidth, barHeight, 
            COLOR_CONFIG.HEALTH_FULL, 0.8
        ).setOrigin(0, 0.5);
        
        this.hudContainer.add([this.hudElements.healthBarBg, this.hudElements.healthBar]);
    }

    // 🌍 创建关卡信息
    createLevelInfo() {
        this.hudElements.levelInfoText = this.scene.add.text(
            UI_LAYOUT.DIALOG_CENTER.x, 
            20, 
            `${this.scene.currentLevel.name}`, 
            this.getHUDStyle()
        ).setOrigin(0.5, 0);
        
        this.hudContainer.add(this.hudElements.levelInfoText);
    }

    // 📏 创建距离进度
    createDistanceProgress() {
        // 距离文本
        this.hudElements.distanceText = this.scene.add.text(
            UI_LAYOUT.DIALOG_CENTER.x, 
            50, 
            '距离: 0/4000', 
            {
                font: '16px Arial',
                fill: '#00ffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }
        ).setOrigin(0.5, 0);
        
        this.hudContainer.add(this.hudElements.distanceText);
        
        // 距离进度条
        this.createDistanceProgressBar();
    }

    // 📊 创建距离进度条
    createDistanceProgressBar() {
        const { x, y } = UI_LAYOUT.DISTANCE_PROGRESS_POS;
        const { width, height } = UI_LAYOUT.DISTANCE_PROGRESS_SIZE;
        
        // 进度条背景
        this.hudElements.distanceProgressBg = this.scene.add.rectangle(
            x, y, width, height, 
            COLOR_CONFIG.BLACK, 0.8
        ).setOrigin(0.5, 0.5);
        
        // 进度条
        this.hudElements.distanceProgressBar = this.scene.add.rectangle(
            x, y, 0, height, 
            COLOR_CONFIG.CYAN, 0.8
        ).setOrigin(0, 0.5);
        
        this.hudContainer.add([this.hudElements.distanceProgressBg, this.hudElements.distanceProgressBar]);
    }

    // 🗺️ 创建小地图
    createMiniMap() {
        const { x, y } = UI_LAYOUT.MINIMAP_POS;
        const { width, height } = UI_LAYOUT.MINIMAP_SIZE;
        
        // 小地图背景
        this.hudElements.minimapBg = this.scene.add.rectangle(
            x, y, width, height, 
            COLOR_CONFIG.BLACK, 0.8
        ).setOrigin(0, 0);
        
        // 小地图边框
        this.hudElements.minimapBorder = this.scene.add.rectangle(
            x, y, width, height, 
            COLOR_CONFIG.WHITE, 0
        ).setOrigin(0, 0).setStrokeStyle(2, COLOR_CONFIG.WHITE);
        
        // 小地图标题
        this.hudElements.minimapTitle = this.scene.add.text(
            x + width/2, y + 10, 
            '小地图', 
            { font: '12px Arial', fill: '#ffffff' }
        ).setOrigin(0.5, 0);
        
        this.hudContainer.add([this.hudElements.minimapBg, this.hudElements.minimapBorder, this.hudElements.minimapTitle]);
    }

    // 🔫 创建武器显示
    createWeaponDisplay() {
        const style = this.getHUDStyle();
        
        this.hudElements.weaponText = this.scene.add.text(
            UI_LAYOUT.WEAPON_POS.x, 
            UI_LAYOUT.WEAPON_POS.y, 
            '武器: AK47', 
            style
        );
        
        this.hudElements.bulletCountText = this.scene.add.text(
            UI_LAYOUT.WEAPON_POS.x, 
            UI_LAYOUT.WEAPON_POS.y + 30, 
            '子弹: 无限', 
            {
                font: '14px Arial',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 6, y: 2 }
            }
        );
        
        this.hudContainer.add([this.hudElements.weaponText, this.hudElements.bulletCountText]);
    }

    // 📱 创建右侧HUD
    createRightSideHUD() {
        const rightStyle = this.getHUDStyle();
        const rightX = this.scene.cameras.main.width - 20;
        
        // 时间显示
        this.hudElements.timeText = this.scene.add.text(
            rightX, 20, '时间: 00:00', rightStyle
        ).setOrigin(1, 0);
        
        // 击杀数显示
        this.hudElements.killText = this.scene.add.text(
            rightX, 50, '击杀: 0/30', rightStyle
        ).setOrigin(1, 0);
        
        // 障碍物状态显示
        this.hudElements.obstacleText = this.scene.add.text(
            rightX, 80, '🪨 障碍物: 0/0', rightStyle
        ).setOrigin(1, 0);
        
        // 场景信息显示
        this.hudElements.sceneText = this.scene.add.text(
            rightX, 110, '🌍 场景: 巨型机械内部', rightStyle
        ).setOrigin(1, 0);
        
        // 场景切换提示
        this.hudElements.sceneHintText = this.scene.add.text(
            rightX, 140, '按 M 键切换场景', 
            {
                font: '14px Arial',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }
        ).setOrigin(1, 0);
        
        this.hudContainer.add([
            this.hudElements.timeText, 
            this.hudElements.killText, 
            this.hudElements.obstacleText, 
            this.hudElements.sceneText, 
            this.hudElements.sceneHintText
        ]);
    }

    // 🔊 创建音效控制
    createAudioControls() {
        const audioX = this.scene.cameras.main.width - 20;
        const audioY = 170;
        
        // 音效标题
        this.hudElements.audioTitleText = this.scene.add.text(
            audioX, audioY, '🔊 音效', 
            {
                font: '14px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }
        ).setOrigin(1, 0);
        
        // 音量显示
        this.hudElements.volumeText = this.scene.add.text(
            audioX, audioY + 25, '音量: 50%', 
            {
                font: '12px Arial',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        ).setOrigin(1, 0);
        
        // 静音按钮
        this.hudElements.muteButton = this.scene.add.text(
            audioX, audioY + 50, '🔊', 
            {
                font: '20px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(1, 0).setInteractive();
        
        // 静音按钮交互
        this.hudElements.muteButton.on('pointerdown', () => {
            const isMuted = this.scene.audioManager.toggleMute();
            this.hudElements.muteButton.setText(isMuted ? '🔇' : '🔊');
            this.hudElements.volumeText.setText(
                isMuted ? '音量: 静音' : `音量: ${Math.round(this.scene.audioManager.getVolume() * 100)}%`
            );
        });
        
        this.hudContainer.add([
            this.hudElements.audioTitleText, 
            this.hudElements.volumeText, 
            this.hudElements.muteButton
        ]);
    }

    // 📊 创建统计按钮
    createStatsButton() {
        const { x, y } = UI_LAYOUT.STATS_BUTTON_POS;
        
        this.hudElements.statsButton = this.scene.add.text(
            x, y, '📊 统计', 
            {
                font: '16px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(1, 0).setInteractive();
        
        this.hudElements.statsButton.on('pointerdown', () => {
            this.showStatsDialog();
        });
        
        this.hudContainer.add(this.hudElements.statsButton);
    }

    // 📊 显示统计对话框
    showStatsDialog() {
        const container = this.scene.add.container(
            UI_LAYOUT.DIALOG_CENTER.x, 
            UI_LAYOUT.DIALOG_CENTER.y
        ).setScrollFactor(0).setDepth(1000);
        
        // 背景
        const background = this.scene.add.rectangle(
            0, 0, 
            UI_LAYOUT.DIALOG_SIZE.width, 
            UI_LAYOUT.DIALOG_SIZE.height, 
            COLOR_CONFIG.UI_BACKGROUND, 0.9
        );
        
        // 标题
        const title = this.scene.add.text(
            0, -160, '📊 游戏统计', 
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 统计信息
        const stats = window.StatsManager.getStats();
        const statsText = this.scene.add.text(
            0, -100, 
            `总击杀数: ${stats.totalKills}\n总分数: ${stats.totalScore}\n游戏次数: ${stats.gamesPlayed}\n最高分: ${stats.highestScore}\n平均分: ${stats.avgScore}\n击杀死亡比: ${stats.killDeathRatio}`, 
            { font: '16px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 关闭按钮
        const closeButton = this.scene.add.text(
            0, 190, '关闭', 
            {
                font: '18px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        closeButton.on('pointerdown', () => {
            container.destroy();
        });
        
        container.add([background, title, statsText, closeButton]);
        this.dialogs.stats = container;
    }

    // 🏆 显示成就对话框
    showAchievementDialog() {
        const container = this.scene.add.container(
            UI_LAYOUT.DIALOG_CENTER.x, 
            UI_LAYOUT.DIALOG_CENTER.y
        ).setScrollFactor(0).setDepth(1000);
        
        // 背景
        const background = this.scene.add.rectangle(
            0, 0, 
            UI_LAYOUT.DIALOG_SIZE.width, 
            UI_LAYOUT.DIALOG_SIZE.height, 
            COLOR_CONFIG.UI_BACKGROUND, 0.9
        );
        
        // 标题
        const title = this.scene.add.text(
            0, -160, '🏆 成就', 
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 成就列表
        const achievements = window.AchievementManager.getUnlockedAchievements();
        const achievementText = this.scene.add.text(
            0, -100, 
            achievements.length > 0 ? 
            achievements.map(a => `${a.name}: ${a.desc}`).join('\n') : 
            '暂无成就', 
            { font: '16px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 关闭按钮
        const closeButton = this.scene.add.text(
            0, 190, '关闭', 
            {
                font: '18px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        closeButton.on('pointerdown', () => {
            container.destroy();
        });
        
        container.add([background, title, achievementText, closeButton]);
        this.dialogs.achievement = container;
    }

    // 💾 显示数据对话框
    showDataDialog() {
        const container = this.scene.add.container(
            UI_LAYOUT.DIALOG_CENTER.x, 
            UI_LAYOUT.DIALOG_CENTER.y
        ).setScrollFactor(0).setDepth(1000);
        
        // 背景
        const background = this.scene.add.rectangle(
            0, 0, 
            UI_LAYOUT.DIALOG_SIZE.width, 
            UI_LAYOUT.DIALOG_SIZE.height, 
            COLOR_CONFIG.UI_BACKGROUND, 0.9
        );
        
        // 标题
        const title = this.scene.add.text(
            0, -160, '💾 数据管理', 
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // 按钮
        const saveButton = this.scene.add.text(
            -100, -50, '保存', 
            {
                font: '16px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setInteractive();
        
        const loadButton = this.scene.add.text(
            0, -50, '加载', 
            {
                font: '16px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setInteractive();
        
        const resetButton = this.scene.add.text(
            100, -50, '重置', 
            {
                font: '16px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setInteractive();
        
        const closeButton = this.scene.add.text(
            0, 190, '关闭', 
            {
                font: '18px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        // 按钮事件
        saveButton.on('pointerdown', () => {
            window.SaveManager.saveAll();
            this.showMessage('数据已保存');
        });
        
        loadButton.on('pointerdown', () => {
            window.SaveManager.loadAll();
            this.showMessage('数据已加载');
        });
        
        resetButton.on('pointerdown', () => {
            window.SaveManager.resetAll();
            this.showMessage('数据已重置');
        });
        
        closeButton.on('pointerdown', () => {
            container.destroy();
        });
        
        container.add([background, title, saveButton, loadButton, resetButton, closeButton]);
        this.dialogs.data = container;
    }

    // 📱 移动端适配
    adjustForMobile() {
        // 调整HUD位置以适应移动端
        if (this.hudElements.scoreText) {
            this.hudElements.scoreText.setPosition(10, 10);
        }
        
        if (this.hudElements.healthText) {
            this.hudElements.healthText.setPosition(10, 40);
        }
        
        if (this.hudElements.weaponText) {
            this.hudElements.weaponText.setPosition(10, 70);
        }
        
        if (this.hudElements.bulletCountText) {
            this.hudElements.bulletCountText.setPosition(10, 100);
        }
    }

    // 📝 显示消息
    showMessage(text, duration = 2000) {
        const message = this.scene.add.text(
            UI_LAYOUT.DIALOG_CENTER.x, 
            200, 
            text, 
            {
                font: '24px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        this.scene.time.delayedCall(duration, () => {
            message.destroy();
        });
    }

    // 🔄 更新HUD
    updateHUD() {
        if (!this.hudElements) return;
        
        // 更新分数
        if (this.hudElements.scoreText) {
            this.hudElements.scoreText.setText(`分数: ${this.scene.score}`);
        }
        
        // 更新血量
        if (this.hudElements.healthText) {
            this.hudElements.healthText.setText(`血量: ${this.scene.currentHealth}/${this.scene.maxHealth}`);
        }
        
        // 更新血量条
        this.updateHealthBar();
        
        // 更新距离
        if (this.hudElements.distanceText) {
            const distance = Math.round(this.scene.player ? this.scene.player.x : 0);
            this.hudElements.distanceText.setText(`距离: ${distance}/${GAME_CONFIG.WORLD_WIDTH}`);
        }
        
        // 更新距离进度条
        this.updateDistanceProgressBar();
        
        // 更新小地图
        this.updateMiniMap();
        
        // 更新武器信息
        if (this.hudElements.weaponText && this.scene.currentWeapon) {
            this.hudElements.weaponText.setText(`武器: ${this.scene.currentWeapon.name}`);
        }
        
        if (this.hudElements.bulletCountText && this.scene.currentWeapon) {
            const bulletText = this.scene.currentWeapon.bulletCost > 0 ? 
                `子弹: ${this.scene.currentWeapon.bulletCount}` : '子弹: 无限';
            this.hudElements.bulletCountText.setText(bulletText);
        }
        
        // 更新时间
        if (this.hudElements.timeText) {
            const elapsed = Math.floor((this.scene.time.now - this.scene.gameStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.hudElements.timeText.setText(`时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
        
        // 更新击杀数
        if (this.hudElements.killText) {
            this.hudElements.killText.setText(`击杀: ${this.scene.killCount}/${this.scene.levelCompleteKills}`);
        }
        
        // 更新障碍物状态
        if (this.hudElements.obstacleText && this.scene.obstacleManager) {
            const obstacleCount = this.scene.obstacleManager.getObstacleCount();
            this.hudElements.obstacleText.setText(`🪨 障碍物: ${obstacleCount}`);
        }
    }

    // 🩸 更新血量条
    updateHealthBar() {
        if (!this.hudElements.healthBar) return;
        
        const healthRatio = this.scene.currentHealth / this.scene.maxHealth;
        const barWidth = 200;
        
        this.hudElements.healthBar.width = barWidth * healthRatio;
        
        // 根据血量改变颜色
        let color = COLOR_CONFIG.HEALTH_FULL;
        if (healthRatio < 0.3) {
            color = COLOR_CONFIG.HEALTH_LOW;
        } else if (healthRatio < 0.7) {
            color = COLOR_CONFIG.HEALTH_MEDIUM;
        }
        
        this.hudElements.healthBar.fillColor = color;
    }

    // 📏 更新距离进度条
    updateDistanceProgressBar() {
        if (!this.hudElements.distanceProgressBar) return;
        
        const distance = this.scene.player ? this.scene.player.x : 0;
        const progress = distance / GAME_CONFIG.WORLD_WIDTH;
        const barWidth = UI_LAYOUT.DISTANCE_PROGRESS_SIZE.width;
        
        this.hudElements.distanceProgressBar.width = barWidth * progress;
    }

    // 🗺️ 更新小地图
    updateMiniMap() {
        if (!this.hudElements.minimapBg || !this.scene.player) return;
        
        // 清除旧的小地图内容
        if (this.minimapElements) {
            this.minimapElements.forEach(element => element.destroy());
        }
        
        this.minimapElements = [];
        
        const { x, y } = UI_LAYOUT.MINIMAP_POS;
        const { width, height } = UI_LAYOUT.MINIMAP_SIZE;
        
        // 绘制玩家位置
        const playerX = x + (this.scene.player.x / GAME_CONFIG.WORLD_WIDTH) * width;
        const playerY = y + (this.scene.player.y / GAME_CONFIG.WORLD_HEIGHT) * height;
        
        const playerDot = this.scene.add.circle(
            playerX, playerY, 3, COLOR_CONFIG.GREEN
        );
        this.minimapElements.push(playerDot);
        
        // 绘制敌人位置
        this.scene.enemies.getChildren().forEach(enemy => {
            const enemyX = x + (enemy.x / GAME_CONFIG.WORLD_WIDTH) * width;
            const enemyY = y + (enemy.y / GAME_CONFIG.WORLD_HEIGHT) * height;
            
            if (enemyX >= x && enemyX <= x + width && enemyY >= y && enemyY <= y + height) {
                const enemyDot = this.scene.add.circle(
                    enemyX, enemyY, 2, COLOR_CONFIG.RED
                );
                this.minimapElements.push(enemyDot);
            }
        });
        
        // 绘制摄像机视口
        const camera = this.scene.cameras.main;
        const viewportX = x + (camera.scrollX / GAME_CONFIG.WORLD_WIDTH) * width;
        const viewportY = y + (camera.scrollY / GAME_CONFIG.WORLD_HEIGHT) * height;
        const viewportWidth = (camera.width / GAME_CONFIG.WORLD_WIDTH) * width;
        const viewportHeight = (camera.height / GAME_CONFIG.WORLD_HEIGHT) * height;
        
        const viewportRect = this.scene.add.rectangle(
            viewportX + viewportWidth/2, 
            viewportY + viewportHeight/2, 
            viewportWidth, 
            viewportHeight, 
            COLOR_CONFIG.CYAN, 0
        ).setStrokeStyle(1, COLOR_CONFIG.CYAN);
        
        this.minimapElements.push(viewportRect);
    }

    // 🎨 获取HUD样式
    getHUDStyle() {
        return {
            font: '18px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        };
    }

    // 🧹 清理UI
    destroy() {
        if (this.hudContainer) {
            this.hudContainer.destroy();
        }
        
        if (this.minimapElements) {
            this.minimapElements.forEach(element => element.destroy());
        }
        
        Object.values(this.dialogs).forEach(dialog => {
            if (dialog) dialog.destroy();
        });
    }
}

// 将UIManager类暴露到全局
window.UIManager = UIManager; 