// scenes/SaveManager.js - ES6模块保存管理器

import { StatsManager } from './StatsManager.js';
import { AchievementManager } from './AchievementManager.js';
import { SAVE_KEY } from './configs.js';

export const SaveManager = {
    // 保存所有游戏数据
    saveAll() {
        const gameData = {
            stats: StatsManager.stats,
            achievements: AchievementManager.achievements,
            settings: {
                // 可以保存音量、画质等设置
                volume: 1.0,
                quality: 'high'
            },
            timestamp: Date.now()
        };
      
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
    },

    // 加载所有游戏数据
    loadAll() {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                const gameData = JSON.parse(saved);
                StatsManager.stats = {...StatsManager.stats, ...gameData.stats};
                AchievementManager.achievements = {...AchievementManager.achievements, ...gameData.achievements};
                return true;
            } catch (e) {
                console.error('数据加载失败:', e);
                return false;
            }
        }
        return false;
    },

    // 重置所有数据
    resetAll() {
        if (confirm('确定要重置所有游戏数据吗？此操作不可恢复！')) {
            // 清理所有相关的localStorage键
            localStorage.removeItem(SAVE_KEY);
            localStorage.removeItem('gameStats');
            localStorage.removeItem('gameAchievements');
          
            // 调用各自管理器的重置方法，遵循单一职责原则
            if (StatsManager.reset) {
                StatsManager.reset();
            }
            if (AchievementManager.resetAchievements) {
                AchievementManager.resetAchievements();
            }
          
            this.showMessage('所有数据已重置！', 'warning');
        }
    },

    // 显示消息
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 2000);
    },

    // 导出数据
    exportData() {
        const gameData = {
            stats: StatsManager.stats,
            achievements: AchievementManager.achievements,
            settings: {
                volume: 1.0,
                quality: 'high'
            },
            timestamp: Date.now()
        };
        
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `game-save-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    },

    // 导入数据
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (gameData.stats && gameData.achievements) {
                    StatsManager.stats = {...StatsManager.stats, ...gameData.stats};
                    AchievementManager.achievements = {...AchievementManager.achievements, ...gameData.achievements};
                    
                    // 保存到本地存储
                    this.saveAll();
                    
                    this.showMessage('数据导入成功！', 'success');
                } else {
                    this.showMessage('数据格式无效！', 'error');
                }
            } catch (error) {
                this.showMessage('数据导入失败！', 'error');
            }
        };
        reader.readAsText(file);
    }
};

console.log('✅ SaveManager.js ES6模块已加载'); 