// scenes/AchievementManager.js - ES6模块成就管理器

import { StatsManager } from './StatsManager.js';

export const AchievementManager = {
    achievements: {
        firstKill: { name: "首次击杀", desc: "击败第一个敌人", unlocked: false },
        killer10: { name: "新手猎手", desc: "击杀10个敌人", unlocked: false },
        killer50: { name: "经验猎手", desc: "击杀50个敌人", unlocked: false },
        scorer1000: { name: "千分达人", desc: "单局得分1000", unlocked: false },
        survivor60: { name: "生存专家", desc: "生存60秒", unlocked: false },
        death10: { name: "不屈意志", desc: "死亡10次仍不放弃", unlocked: false }
    },

    // 初始化
    init() {
        this.loadAchievements();
    },

    // 检查成就
    checkAchievements() {
        const stats = StatsManager.getStats();
        
        // 检查各种成就
        this.checkKillAchievements(stats);
        this.checkScoreAchievements(stats);
        this.checkSurvivalAchievements(stats);
        this.checkDeathAchievements(stats);
    },

    // 检查击杀成就
    checkKillAchievements(stats) {
        if (stats.totalKills >= 1 && !this.achievements.firstKill.unlocked) {
            this.unlockAchievement('firstKill');
        }
        if (stats.totalKills >= 10 && !this.achievements.killer10.unlocked) {
            this.unlockAchievement('killer10');
        }
        if (stats.totalKills >= 50 && !this.achievements.killer50.unlocked) {
            this.unlockAchievement('killer50');
        }
    },

    // 检查得分成就
    checkScoreAchievements(stats) {
        if (stats.highestScore >= 1000 && !this.achievements.scorer1000.unlocked) {
            this.unlockAchievement('scorer1000');
        }
    },

    // 检查生存成就
    checkSurvivalAchievements(stats) {
        if (stats.longestSurvival >= 60000 && !this.achievements.survivor60.unlocked) {
            this.unlockAchievement('survivor60');
        }
    },

    // 检查死亡成就
    checkDeathAchievements(stats) {
        if (stats.totalDeaths >= 10 && !this.achievements.death10.unlocked) {
            this.unlockAchievement('death10');
        }
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