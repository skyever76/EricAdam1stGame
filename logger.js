// 自动日志记录系统
class GameLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // 最多保存1000条日志
        this.loadLogs();
        this.setupConsoleOverride();
    }

    // 安全序列化函数，处理循环引用
    safeStringify(obj) {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            // 处理循环引用
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular Reference]';
                }
                seen.add(value);
            }
            
            // 处理Phaser对象
            if (value && typeof value === 'object') {
                // 检查是否是Phaser对象
                if (value.constructor && value.constructor.name) {
                    const constructorName = value.constructor.name;
                    if (constructorName.includes('Scene') || 
                        constructorName.includes('Group') || 
                        constructorName.includes('Sprite') ||
                        constructorName.includes('Game') ||
                        constructorName.includes('initialize')) {
                        return `[Phaser ${constructorName}]`;
                    }
                }
                
                // 处理DOM元素
                if (value instanceof Element) {
                    return `[DOM ${value.tagName}]`;
                }
                
                // 处理函数
                if (typeof value === 'function') {
                    return `[Function ${value.name || 'anonymous'}]`;
                }
            }
            
            return value;
        });
    }

    // 安全转换对象为字符串
    safeStringifyObject(obj) {
        try {
            if (typeof obj === 'string') {
                return obj;
            }
            if (typeof obj === 'number' || typeof obj === 'boolean') {
                return String(obj);
            }
            if (obj === null) {
                return 'null';
            }
            if (obj === undefined) {
                return 'undefined';
            }
            
            // 处理Phaser对象
            if (obj && typeof obj === 'object') {
                if (obj.constructor && obj.constructor.name) {
                    const constructorName = obj.constructor.name;
                    if (constructorName.includes('Scene') || 
                        constructorName.includes('Group') || 
                        constructorName.includes('Sprite') ||
                        constructorName.includes('Game') ||
                        constructorName.includes('initialize')) {
                        return `[Phaser ${constructorName}]`;
                    }
                }
                
                // 处理DOM元素
                if (obj instanceof Element) {
                    return `[DOM ${obj.tagName}]`;
                }
                
                // 处理函数
                if (typeof obj === 'function') {
                    return `[Function ${obj.name || 'anonymous'}]`;
                }
                
                // 处理数组
                if (Array.isArray(obj)) {
                    return `[Array(${obj.length})]`;
                }
                
                // 处理普通对象
                return '[Object]';
            }
            
            return String(obj);
        } catch (e) {
            return '[Error converting object]';
        }
    }

    // 加载已保存的日志
    loadLogs() {
        const savedLogs = localStorage.getItem('gameLogs');
        if (savedLogs) {
            try {
                this.logs = JSON.parse(savedLogs);
            } catch (e) {
                this.logs = [];
            }
        }
    }

    // 保存日志到localStorage
    saveLogs() {
        try {
            localStorage.setItem('gameLogs', this.safeStringify(this.logs));
        } catch (e) {
            console.error('保存日志失败:', e);
        }
    }

    // 添加日志
    addLog(level, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            data: data
        };

        this.logs.push(logEntry);

        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        this.saveLogs();
    }

    // 重写console方法
    setupConsoleOverride() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            // 安全处理参数，避免循环引用
            const safeArgs = args.map(arg => this.safeStringifyObject(arg));
            const safeMessage = args.map(arg => this.safeStringifyObject(arg)).join(' ');
            
            this.addLog('log', safeMessage, safeArgs);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            // 安全处理参数，避免循环引用
            const safeArgs = args.map(arg => this.safeStringifyObject(arg));
            const safeMessage = args.map(arg => this.safeStringifyObject(arg)).join(' ');
            
            this.addLog('error', safeMessage, safeArgs);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            // 安全处理参数，避免循环引用
            const safeArgs = args.map(arg => this.safeStringifyObject(arg));
            const safeMessage = args.map(arg => this.safeStringifyObject(arg)).join(' ');
            
            this.addLog('warn', safeMessage, safeArgs);
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            // 安全处理参数，避免循环引用
            const safeArgs = args.map(arg => this.safeStringifyObject(arg));
            const safeMessage = args.map(arg => this.safeStringifyObject(arg)).join(' ');
            
            this.addLog('info', safeMessage, safeArgs);
            originalInfo.apply(console, args);
        };
    }

    // 获取所有日志
    getLogs() {
        return this.logs;
    }

    // 清空日志
    clearLogs() {
        this.logs = [];
        this.saveLogs();
    }

    // 导出日志
    exportLogs() {
        const logText = this.logs.map(log => 
            `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-logs-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 显示日志界面
    showLogViewer() {
        // 创建日志查看器
        const viewer = document.createElement('div');
        viewer.id = 'log-viewer';
        viewer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            height: 500px;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border: 1px solid #333;
            border-radius: 5px;
            z-index: 10000;
            overflow-y: auto;
            display: none;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #333;
        `;

        const title = document.createElement('h3');
        title.textContent = '游戏日志';
        title.style.margin = '0';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.onclick = () => viewer.style.display = 'none';
        closeBtn.style.cssText = `
            background: #ff4444;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        `;

        const exportBtn = document.createElement('button');
        exportBtn.textContent = '导出';
        exportBtn.onclick = () => this.exportLogs();
        exportBtn.style.cssText = `
            background: #44aa44;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 5px;
        `;

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '清空';
        clearBtn.onclick = () => {
            this.clearLogs();
            this.updateLogDisplay();
        };
        clearBtn.style.cssText = `
            background: #ffaa44;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 5px;
        `;

        header.appendChild(title);
        header.appendChild(clearBtn);
        header.appendChild(exportBtn);
        header.appendChild(closeBtn);

        const logContent = document.createElement('div');
        logContent.id = 'log-content';

        viewer.appendChild(header);
        viewer.appendChild(logContent);
        document.body.appendChild(viewer);

        // 更新日志显示
        this.updateLogDisplay = () => {
            const content = document.getElementById('log-content');
            if (content) {
                content.innerHTML = this.logs.map(log => 
                    `<div style="margin-bottom: 2px; color: ${this.getLogColor(log.level)};">
                        [${log.timestamp.slice(11, 19)}] ${log.message}
                    </div>`
                ).join('');
                content.scrollTop = content.scrollHeight;
            }
        };

        this.updateLogDisplay();
        viewer.style.display = 'block';
    }

    // 获取日志颜色
    getLogColor(level) {
        switch (level) {
            case 'error': return '#ff4444';
            case 'warn': return '#ffaa44';
            case 'info': return '#44aaff';
            default: return '#ffffff';
        }
    }
}

// 创建全局日志实例
window.gameLogger = new GameLogger();

// 添加键盘快捷键显示日志
document.addEventListener('keydown', (e) => {
    // Command + L 显示日志
    if (e.metaKey && e.key === 'l') {
        e.preventDefault();
        window.gameLogger.showLogViewer();
    }
});

// 在页面加载时记录
window.gameLogger.addLog('info', '页面加载完成，日志系统已启动');

console.log('日志系统已初始化，按 Command+L 查看日志'); 