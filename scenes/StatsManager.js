// scenes/StatsManager.js - ES6模块统计管理器

export const StatsManager = {
    stats: {
        totalKills: 0,
        totalScore: 0,
        totalPlayTime: 0,
        totalDeaths: 0,
        gamesPlayed: 0,
        highestScore: 0,
        longestSurvival: 0
    },

    // 记录击杀
    addKill() {
        this.stats.totalKills++;
    },

    // 记录得分
    addScore(score) {
        this.stats.totalScore += score;
        if (score > this.stats.highestScore) {
            this.stats.highestScore = score;
        }
    },

    // 记录游戏结束
    gameEnd(score, survivalTime) {
        this.stats.gamesPlayed++;
        this.stats.totalDeaths++;
        if (survivalTime > this.stats.longestSurvival) {
            this.stats.longestSurvival = survivalTime;
        }
    },

    // 获取统计信息
    getStats() {
        return {
            ...this.stats,
            avgScore: Math.round(this.stats.totalScore / Math.max(1, this.stats.gamesPlayed)),
            killDeathRatio: (this.stats.totalKills / Math.max(1, this.stats.totalDeaths)).toFixed(2)
        };
    },

    // 重置所有统计数据
    reset() {
        this.stats = {
            totalKills: 0,
            totalScore: 0,
            totalPlayTime: 0,
            totalDeaths: 0,
            gamesPlayed: 0,
            highestScore: 0,
            longestSurvival: 0
        };
    }
};

console.log('✅ StatsManager.js ES6模块已加载'); 