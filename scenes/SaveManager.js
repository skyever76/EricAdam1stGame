window.SaveManager = {
    // 保存所有游戏数据
    saveAll() {
        const gameData = {
            stats: window.StatsManager.stats,
            achievements: window.AchievementManager.achievements,
            settings: {
                // 可以保存音量、画质等设置
                volume: 1.0,
                quality: 'high'
            },
            timestamp: Date.now()
        };
      
        localStorage.setItem('gameData', JSON.stringify(gameData));
        this.showMessage('游戏数据已保存！', 'success');
    },

    // 加载所有游戏数据
    loadAll() {
        const saved = localStorage.getItem('gameData');
        if (saved) {
            try {
                const gameData = JSON.parse(saved);
                window.StatsManager.stats = {...window.StatsManager.stats, ...gameData.stats};
                window.AchievementManager.achievements = {...window.AchievementManager.achievements, ...gameData.achievements};
                this.showMessage('游戏数据已加载！', 'success');
                return true;
            } catch (e) {
                this.showMessage('数据加载失败！', 'error');
                return false;
            }
        }
        return false;
    },

    // 重置所有数据
    resetAll() {
        if (confirm('确定要重置所有游戏数据吗？此操作不可恢复！')) {
            localStorage.removeItem('gameData');
            localStorage.removeItem('gameStats');
            localStorage.removeItem('gameAchievements');
          
            // 重置对象
            window.StatsManager.stats = {
                totalKills: 0, totalScore: 0, totalPlayTime: 0,
                totalDeaths: 0, gamesPlayed: 0, highestScore: 0, longestSurvival: 0
            };
          
            Object.keys(window.AchievementManager.achievements).forEach(key => {
                window.AchievementManager.achievements[key].unlocked = false;
            });
          
            this.showMessage('所有数据已重置！', 'warning');
        }
    },

    // 导出数据
    exportData() {
        const gameData = {
            stats: window.StatsManager.stats,
            achievements: window.AchievementManager.achievements,
            timestamp: Date.now()
        };
      
        const dataStr = JSON.stringify(gameData, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
      
        const a = document.createElement('a');
        a.href = url;
        a.download = `game_save_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
      
        URL.revokeObjectURL(url);
        this.showMessage('数据已导出！', 'success');
    },

    // 导入数据
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const gameData = JSON.parse(e.target.result);
                        window.StatsManager.stats = {...window.StatsManager.stats, ...gameData.stats};
                        window.AchievementManager.achievements = {...window.AchievementManager.achievements, ...gameData.achievements};
                        this.saveAll();
                        this.showMessage('数据导入成功！', 'success');
                    } catch (err) {
                        this.showMessage('文件格式错误！', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    // 显示消息
    showMessage(text, type = 'info') {
        const popup = document.createElement('div');
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
      
        popup.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: ${colors[type]}; color: white; padding: 20px;
            border-radius: 10px; z-index: 2000; font-weight: bold;
        `;
        popup.textContent = text;
      
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 2000);
    }
}; 