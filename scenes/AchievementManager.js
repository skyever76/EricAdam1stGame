// scenes/AchievementManager.js - ES6模块成就管理器

import { StatsManager } from './StatsManager.js';
import { ACHIEVEMENT_CONFIG } from './configs.js';

export const AchievementManager = {
    achievements: {}, // 初始化为空，从配置和存档中加载

    // 初始化
    init() {
        // 从配置和存档初始化成就
        const saved = JSON.parse(localStorage.getItem('gameAchievements')) || {};
        Object.keys(ACHIEVEMENT_CONFIG).forEach(key => {
            this.achievements[key] = {
                ...ACHIEVEMENT_CONFIG[key],
                unlocked: saved[key]?.unlocked || false
            };
        });
    },

    // 检查成就（通用数据驱动方法）
    checkAchievements() {
        const stats = StatsManager.getStats();
        
        Object.keys(this.achievements).forEach(key => {
            const achievement = this.achievements[key];
            
            // 如果成就已解锁，则跳过
            if (achievement.unlocked) return;

            // 从配置中获取解锁条件
            const condition = achievement.condition;
            
            // 检查统计数据是否满足条件
            if (stats[condition.stat] >= condition.value) {
                this.unlockAchievement(key);
            }
        });
    },

    // 解锁成就
    unlockAchievement(achievementId) {
        if (this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
            this.achievements[achievementId].unlocked = true;
            this.saveAchievements();
            this.showAchievementNotification(achievementId);
        }
    },

    // 显示成就通知
    showAchievementNotification(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        // 创建成就通知
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🏆 成就解锁！</div>
            <div>${achievement.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${achievement.desc}</div>
        `;

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    },

    // 保存成就
    saveAchievements() {
        localStorage.setItem('gameAchievements', JSON.stringify(this.achievements));
    },

    // 加载成就
    loadAchievements() {
        const saved = localStorage.getItem('gameAchievements');
        if (saved) {
            this.achievements = {...this.achievements, ...JSON.parse(saved)};
        }
    },

    // 获取成就列表
    getAchievements() {
        return this.achievements;
    },

    // 重置所有成就
    resetAchievements() {
        Object.keys(this.achievements).forEach(key => {
            this.achievements[key].unlocked = false;
        });
        this.saveAchievements();
    }
};

console.log('✅ AchievementManager.js ES6模块已加载'); 