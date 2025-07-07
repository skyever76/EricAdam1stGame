// scenes/UIManager.js - ES6模块UI管理系统

import { UI_LAYOUT, COLOR_CONFIG } from './configs.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.hudElements = {};
        this.dialogs = {};
        this.audioControls = {};
        this.statsButton = null;
        
        this.createHUD();
        this.createAudioControls();
        this.createStatsButton();
    }
    
    createHUD() {
        this.createScoreDisplay();
        this.createHealthBar();
        this.createWeaponInfo();
        this.createKillCount();
        this.createTimeDisplay();
        this.createDistanceProgressBar();
        this.createMinimap();
    }
    
    createScoreDisplay() {
        this.hudElements.score = this.scene.add.text(
            UI_LAYOUT.SCORE_POS.x, 
            UI_LAYOUT.SCORE_POS.y, 
            '分数: 0', 
            { 
                fontSize: '24px', 
                fill: `#${COLOR_CONFIG.UI_TEXT.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        this.hudElements.score.setScrollFactor(0);
    }
    
    createHealthBar() {
        // 血量条
        this.hudElements.healthBar = this.scene.add.graphics();
        this.hudElements.healthBar.setScrollFactor(0);
        
        // 血量文本
        this.hudElements.healthText = this.scene.add.text(
            UI_LAYOUT.HEALTH_POS.x, 
            UI_LAYOUT.HEALTH_POS.y, 
            '血量: 100/100', 
            { 
                fontSize: '20px', 
                fill: `#${COLOR_CONFIG.HEALTH_FULL.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        this.hudElements.healthText.setScrollFactor(0);
    }
    
    createWeaponInfo() {
        this.hudElements.weaponInfo = this.scene.add.text(
            UI_LAYOUT.WEAPON_POS.x, 
            UI_LAYOUT.WEAPON_POS.y, 
            '武器: AK47', 
            { 
                fontSize: '18px', 
                fill: `#${COLOR_CONFIG.WEAPON_ACTIVE.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        this.hudElements.weaponInfo.setScrollFactor(0);
    }
    
    createKillCount() {
        this.hudElements.killCount = this.scene.add.text(
            UI_LAYOUT.KILL_COUNT_POS.x, 
            UI_LAYOUT.KILL_COUNT_POS.y, 
            '击杀: 0', 
            { 
                fontSize: '18px', 
                fill: `#${COLOR_CONFIG.UI_TEXT.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        this.hudElements.killCount.setScrollFactor(0);
    }
    
    createTimeDisplay() {
        this.hudElements.timeDisplay = this.scene.add.text(
            UI_LAYOUT.TIME_POS.x, 
            UI_LAYOUT.TIME_POS.y, 
            '时间: 00:00', 
            { 
                fontSize: '18px', 
                fill: `#${COLOR_CONFIG.UI_TEXT.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        this.hudElements.timeDisplay.setScrollFactor(0);
    }
    
    createDistanceProgressBar() {
        this.hudElements.distanceProgress = this.scene.add.graphics();
        this.hudElements.distanceProgress.setScrollFactor(0);
    }
    
    createMinimap() {
        const minimap = this.scene.add.graphics();
        minimap.setScrollFactor(0);
        minimap.setPosition(UI_LAYOUT.MINIMAP_POS.x, UI_LAYOUT.MINIMAP_POS.y);
        
        // 绘制小地图边框
        minimap.lineStyle(2, COLOR_CONFIG.UI_BORDER);
        minimap.strokeRect(0, 0, UI_LAYOUT.MINIMAP_SIZE.width, UI_LAYOUT.MINIMAP_SIZE.height);
        
        this.hudElements.minimap = minimap;
    }
    
    createAudioControls() {
        // 音量滑块
        this.audioControls.volumeSlider = this.scene.add.graphics();
        this.audioControls.volumeSlider.setScrollFactor(0);
        this.audioControls.volumeSlider.setPosition(UI_LAYOUT.AUDIO_CONTROLS_POS.x, UI_LAYOUT.AUDIO_CONTROLS_POS.y);
        
        // 静音按钮
        this.audioControls.muteButton = this.scene.add.text(
            UI_LAYOUT.AUDIO_CONTROLS_POS.x, 
            UI_LAYOUT.AUDIO_CONTROLS_POS.y + 30, 
            '🔊', 
            { 
                fontSize: '24px', 
                fill: `#${COLOR_CONFIG.UI_TEXT.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        this.audioControls.muteButton.setScrollFactor(0);
        this.audioControls.muteButton.setInteractive();
        
        // 静音按钮事件
        this.audioControls.muteButton.on('pointerdown', () => {
            this.toggleMute();
        });
    }
    
    createStatsButton() {
        this.statsButton = this.scene.add.text(
            UI_LAYOUT.STATS_BUTTON_POS.x, 
            UI_LAYOUT.STATS_BUTTON_POS.y, 
            '📊 统计', 
            { 
                fontSize: '20px', 
                fill: `#${COLOR_CONFIG.UI_HIGHLIGHT.toString(16)}`,
                fontFamily: 'Arial',
                backgroundColor: `#${COLOR_CONFIG.UI_BACKGROUND.toString(16)}`,
                padding: { x: 10, y: 5 }
            }
        );
        this.statsButton.setScrollFactor(0);
        this.statsButton.setInteractive();
        
        this.statsButton.on('pointerdown', () => {
            this.showStats();
        });
    }
    
    update(gameState) {
        // 🎯 这是现在唯一更新UI元素的地方
        // 接收完整的游戏状态数据包并更新所有UI元素
        
        // 更新分数文本
        this.updateScore(gameState.score);
        
        // 更新血量条
        this.updateHealthBar(gameState.currentHealth, gameState.maxHealth);
        
        // 更新武器信息
        this.updateWeaponInfo(gameState.weapon);
        
        // 更新击杀数
        this.updateKillCount(gameState.killCount, gameState.levelCompleteKills);
        
        // 更新距离进度条
        this.updateDistanceProgressBar(gameState.player);
        
        // 更新小地图
        this.updateMinimap(gameState);
        
        // 更新时间显示
        this.updateTimeDisplay(gameState);
        
        // 更新道具HUD
        this.updatePowerUpHUD(gameState.powerUpManager);
        
        // 更新障碍物状态
        this.updateObstacleStatus(gameState.obstacleManager);
        
        // 更新场景状态
        this.updateSceneStatus(gameState.advancedSceneManager);
    }
    
    updateScore(score) {
        if (this.hudElements.score) {
            this.hudElements.score.setText(`分数: ${score || 0}`);
        }
    }
    
    updateHealthBar(health, maxHealth) {
        if (this.hudElements.healthText && this.hudElements.healthBar) {
            const currentHealth = health || 100;
            const maxHealthValue = maxHealth || 100;
            const healthPercent = currentHealth / maxHealthValue;
            
            this.hudElements.healthText.setText(`血量: ${currentHealth}/${maxHealthValue}`);
            
            // 更新血量条颜色
            let healthColor = COLOR_CONFIG.HEALTH_FULL;
            if (healthPercent < 0.3) {
                healthColor = COLOR_CONFIG.HEALTH_LOW;
            } else if (healthPercent < 0.7) {
                healthColor = COLOR_CONFIG.HEALTH_MEDIUM;
            }
            
            this.hudElements.healthText.setColor('#' + healthColor.toString(16));
            
            // 绘制血量条
            this.hudElements.healthBar.clear();
            this.hudElements.healthBar.fillStyle(COLOR_CONFIG.UI_BACKGROUND);
            this.hudElements.healthBar.fillRect(UI_LAYOUT.HEALTH_POS.x + 80, UI_LAYOUT.HEALTH_POS.y + 5, 100, 15);
            this.hudElements.healthBar.fillStyle(healthColor);
            this.hudElements.healthBar.fillRect(UI_LAYOUT.HEALTH_POS.x + 80, UI_LAYOUT.HEALTH_POS.y + 5, 100 * healthPercent, 15);
        }
    }
    
    updateWeaponInfo(weapon) {
        if (this.hudElements.weaponInfo && weapon) {
            this.hudElements.weaponInfo.setText(`武器: ${weapon.name}`);
        }
    }
    
    updateKillCount(killCount, levelCompleteKills) {
        if (this.hudElements.killCount) {
            this.hudElements.killCount.setText(`击杀: ${killCount || 0}/${levelCompleteKills || 0}`);
        }
    }
    
    updateTimeDisplay(gameState) {
        if (this.hudElements.timeDisplay) {
            // 关卡结束后停止计时
            const elapsedTime = gameState.isGameOver || gameState.levelComplete ? 
                Math.floor((gameState.levelEndTime - gameState.gameStartTime) / 1000) : 
                Math.floor((gameState.time.now - gameState.gameStartTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            const timeString = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.hudElements.timeDisplay.setText(timeString);
        }
    }
    
    updateDistanceProgressBar(player) {
        if (this.hudElements.distanceProgress && player) {
            const currentDistance = Math.max(0, Math.round(player.x));
            const maxDistanceValue = 4000;
            const progress = currentDistance / maxDistanceValue;
            
            this.hudElements.distanceProgress.clear();
            this.hudElements.distanceProgress.fillStyle(COLOR_CONFIG.UI_BACKGROUND);
            this.hudElements.distanceProgress.fillRect(
                UI_LAYOUT.DISTANCE_PROGRESS_POS.x - UI_LAYOUT.DISTANCE_PROGRESS_SIZE.width / 2,
                UI_LAYOUT.DISTANCE_PROGRESS_POS.y - UI_LAYOUT.DISTANCE_PROGRESS_SIZE.height / 2,
                UI_LAYOUT.DISTANCE_PROGRESS_SIZE.width,
                UI_LAYOUT.DISTANCE_PROGRESS_SIZE.height
            );
            this.hudElements.distanceProgress.fillStyle(COLOR_CONFIG.UI_HIGHLIGHT);
            this.hudElements.distanceProgress.fillRect(
                UI_LAYOUT.DISTANCE_PROGRESS_POS.x - UI_LAYOUT.DISTANCE_PROGRESS_SIZE.width / 2,
                UI_LAYOUT.DISTANCE_PROGRESS_POS.y - UI_LAYOUT.DISTANCE_PROGRESS_SIZE.height / 2,
                UI_LAYOUT.DISTANCE_PROGRESS_SIZE.width * progress,
                UI_LAYOUT.DISTANCE_PROGRESS_SIZE.height
            );
        }
    }
    
    updateMinimap(gameState) {
        if (!this.hudElements.minimap) return;
        
        this.hudElements.minimap.clear();
        
        // 绘制小地图边框
        this.hudElements.minimap.lineStyle(2, COLOR_CONFIG.UI_BORDER);
        this.hudElements.minimap.strokeRect(0, 0, UI_LAYOUT.MINIMAP_SIZE.width, UI_LAYOUT.MINIMAP_SIZE.height);
        
        // 绘制玩家位置
        if (gameState.player) {
            const playerX = (gameState.player.x / 4000) * UI_LAYOUT.MINIMAP_SIZE.width;
            const playerY = (gameState.player.y / 720) * UI_LAYOUT.MINIMAP_SIZE.height;
            
            this.hudElements.minimap.fillStyle(COLOR_CONFIG.GREEN);
            this.hudElements.minimap.fillCircle(playerX, playerY, 3);
        }
        
        // 绘制敌人位置
        if (gameState.enemies) {
            this.hudElements.minimap.fillStyle(COLOR_CONFIG.RED);
            gameState.enemies.forEach(enemy => {
                const enemyX = (enemy.x / 4000) * UI_LAYOUT.MINIMAP_SIZE.width;
                const enemyY = (enemy.y / 720) * UI_LAYOUT.MINIMAP_SIZE.height;
                this.hudElements.minimap.fillCircle(enemyX, enemyY, 2);
            });
        }
        
        // 绘制摄像机视口
        if (gameState.camera) {
            const cameraX = (gameState.camera.x / 4000) * UI_LAYOUT.MINIMAP_SIZE.width;
            const cameraY = (gameState.camera.y / 720) * UI_LAYOUT.MINIMAP_SIZE.height;
            const cameraWidth = (gameState.camera.width / 4000) * UI_LAYOUT.MINIMAP_SIZE.width;
            const cameraHeight = (gameState.camera.height / 720) * UI_LAYOUT.MINIMAP_SIZE.height;
            
            this.hudElements.minimap.lineStyle(1, COLOR_CONFIG.CYAN);
            this.hudElements.minimap.strokeRect(cameraX, cameraY, cameraWidth, cameraHeight);
        }
    }

    // 🆕 更新道具HUD
    updatePowerUpHUD(powerUpManager) {
        if (!powerUpManager) return;
        
        if (this.powerUpHUDGroup) {
            this.powerUpHUDGroup.clear(true);
        } else {
            this.powerUpHUDGroup = this.scene.add.group();
        }
        
        const activeBonuses = powerUpManager.getActiveBonuses();
        activeBonuses.forEach((bonus, index) => {
            const x = 50;
            const y = 150 + index * 40;
            const remainingTime = Math.max(0, bonus.endTime - Date.now());
            const seconds = Math.ceil(remainingTime / 1000);
            
            const bg = this.scene.add.rectangle(x, y, 200, 30, 0x000000, 0.6)
                .setOrigin(0, 0.5)
                .setScrollFactor(0);
            // 使用Graphics绘制边框
            const border = this.scene.add.graphics();
            border.lineStyle(1, 0xffffff);
            border.strokeRect(x - 100, y - 15, 200, 30);
            border.setScrollFactor(0);
                
            const text = this.scene.add.text(x + 10, y, `${bonus.symbol} ${bonus.name} ${seconds}s`, {
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5).setScrollFactor(0);
            
            const progressWidth = 180;
            const progress = remainingTime / bonus.effect.duration;
            const progressBg = this.scene.add.rectangle(x + 10, y + 12, progressWidth, 4, 0x333333)
                .setOrigin(0, 0.5)
                .setScrollFactor(0);
            const progressBar = this.scene.add.rectangle(x + 10, y + 12, progressWidth * progress, 4, 0x00ff00)
                .setOrigin(0, 0.5)
                .setScrollFactor(0);
                
            this.powerUpHUDGroup.addMultiple([bg, border, text, progressBg, progressBar]);
        });
        
        this.powerUpHUDGroup.setDepth(1000);
    }

    // 🆕 更新障碍物状态
    updateObstacleStatus(obstacleManager) {
        if (obstacleManager && this.hudElements.obstacleText) {
            const obstacleStatus = obstacleManager.getObstacleStatus();
            this.hudElements.obstacleText.setText(`🪨 障碍物: ${obstacleStatus.count}/${obstacleStatus.maxCount}`);
        }
    }

    // 🆕 更新场景状态
    updateSceneStatus(advancedSceneManager) {
        if (advancedSceneManager && this.hudElements.sceneText) {
            const sceneStatus = advancedSceneManager.getSceneStatus();
            this.hudElements.sceneText.setText(`🌍 场景: ${sceneStatus.currentScene}`);
        }
    }
    
    showDialog(title, message, type = 'info') {
        // 创建对话框背景
        const dialogBg = this.scene.add.graphics();
        dialogBg.setScrollFactor(0);
        dialogBg.fillStyle(COLOR_CONFIG.UI_BACKGROUND, 0.9);
        dialogBg.fillRect(
            UI_LAYOUT.DIALOG_CENTER.x - UI_LAYOUT.DIALOG_SIZE.width / 2,
            UI_LAYOUT.DIALOG_CENTER.y - UI_LAYOUT.DIALOG_SIZE.height / 2,
            UI_LAYOUT.DIALOG_SIZE.width,
            UI_LAYOUT.DIALOG_SIZE.height
        );
        dialogBg.lineStyle(2, COLOR_CONFIG.UI_BORDER);
        dialogBg.strokeRect(
            UI_LAYOUT.DIALOG_CENTER.x - UI_LAYOUT.DIALOG_SIZE.width / 2,
            UI_LAYOUT.DIALOG_CENTER.y - UI_LAYOUT.DIALOG_SIZE.height / 2,
            UI_LAYOUT.DIALOG_SIZE.width,
            UI_LAYOUT.DIALOG_SIZE.height
        );
        
        // 创建标题
        const titleText = this.scene.add.text(
            UI_LAYOUT.DIALOG_CENTER.x,
            UI_LAYOUT.DIALOG_CENTER.y - 80,
            title,
            {
                fontSize: '24px',
                fill: `#${COLOR_CONFIG.UI_HIGHLIGHT.toString(16)}`,
                fontFamily: 'Arial'
            }
        );
        titleText.setScrollFactor(0);
        titleText.setOrigin(0.5);
        
        // 创建消息
        const messageText = this.scene.add.text(
            UI_LAYOUT.DIALOG_CENTER.x,
            UI_LAYOUT.DIALOG_CENTER.y,
            message,
            {
                fontSize: '18px',
                fill: `#${COLOR_CONFIG.UI_TEXT.toString(16)}`,
                fontFamily: 'Arial',
                wordWrap: { width: UI_LAYOUT.DIALOG_SIZE.width - 40 }
            }
        );
        messageText.setScrollFactor(0);
        messageText.setOrigin(0.5);
        
        // 创建关闭按钮
        const closeButton = this.scene.add.text(
            UI_LAYOUT.DIALOG_CENTER.x,
            UI_LAYOUT.DIALOG_CENTER.y + 80,
            '确定',
            {
                fontSize: '20px',
                fill: `#${COLOR_CONFIG.UI_HIGHLIGHT.toString(16)}`,
                fontFamily: 'Arial',
                backgroundColor: `#${COLOR_CONFIG.UI_BORDER.toString(16)}`,
                padding: { x: 20, y: 10 }
            }
        );
        closeButton.setScrollFactor(0);
        closeButton.setOrigin(0.5);
        closeButton.setInteractive();
        
        closeButton.on('pointerdown', () => {
            dialogBg.destroy();
            titleText.destroy();
            messageText.destroy();
            closeButton.destroy();
        });
        
        // 保存对话框引用
        this.dialogs[title] = {
            bg: dialogBg,
            title: titleText,
            message: messageText,
            button: closeButton
        };
    }
    
    hideDialog(title) {
        if (this.dialogs[title]) {
            Object.values(this.dialogs[title]).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            delete this.dialogs[title];
        }
    }
    
    toggleMute() {
        if (this.audioControls.muteButton) {
            const isMuted = this.audioControls.muteButton.text === '🔇';
            this.audioControls.muteButton.setText(isMuted ? '🔊' : '🔇');
            
            // 触发静音事件
            this.scene.events.emit('toggleMute', !isMuted);
        }
    }
    
    showStats() {
        // 获取统计数据
        const stats = this.scene.getStats ? this.scene.getStats() : {};
        
        const statsText = `
总击杀: ${stats.totalKills || 0}
总分数: ${stats.totalScore || 0}
最高分: ${stats.highestScore || 0}
游戏次数: ${stats.gamesPlayed || 0}
平均分: ${stats.avgScore || 0}
最长生存: ${Math.floor((stats.longestSurvival || 0) / 1000)}秒
击杀死亡比: ${stats.killDeathRatio || '0.00'}
        `.trim();
        
        this.showDialog('游戏统计', statsText, 'stats');
    }
    
    destroy() {
        // 清理所有UI元素
        Object.values(this.hudElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        Object.values(this.audioControls).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        Object.values(this.dialogs).forEach(dialog => {
            Object.values(dialog).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });
        
        if (this.statsButton && this.statsButton.destroy) {
            this.statsButton.destroy();
        }
    }
}

console.log('✅ UIManager.js ES6模块已加载'); 