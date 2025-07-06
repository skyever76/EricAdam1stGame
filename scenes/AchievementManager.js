window.AchievementManager = {
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
        const stats = window.StatsManager.getStats();
      
        this.checkAndUnlock('firstKill', stats.totalKills >= 1);
        this.checkAndUnlock('killer10', stats.totalKills >= 10);
        this.checkAndUnlock('killer50', stats.totalKills >= 50);
        this.checkAndUnlock('scorer1000', stats.highestScore >= 1000);
        this.checkAndUnlock('survivor60', stats.longestSurvival >= 60000);
        this.checkAndUnlock('death10', stats.totalDeaths >= 10);
    },

    // 检查并解锁成就
    checkAndUnlock(id, condition) {
        if (condition && !this.achievements[id].unlocked) {
            this.achievements[id].unlocked = true;
            this.showAchievement(this.achievements[id]);
            this.saveAchievements();
        }
    },

    // 显示成就提示
    showAchievement(achievement) {
        // 创建成就提示
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #000; padding: 15px; border-radius: 10px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
            font-weight: bold; animation: slideIn 0.5s ease;
        `;
        popup.innerHTML = `🏆 成就解锁！<br>${achievement.name}<br><small>${achievement.desc}</small>`;
      
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);
      
        // 添加动画
        if (!document.querySelector('#achievementStyle')) {
            const style = document.createElement('style');
            style.id = 'achievementStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(300px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
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

    // 获取已解锁的成就
    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }
}; 