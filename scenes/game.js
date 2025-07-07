// game.js - 更新配置支持iPad

// 🆕 使用全局变量，因为文件已通过script标签加载

console.log('开始初始化游戏配置...');

// 🧹 清理可能的重复定义
(function() {
    'use strict';
    
    const classesToClear = ['Enemy', 'EnemyBullet', 'PowerUp', 'Obstacle', 'MainScene', 'PreloaderScene', 'PlayerSelectScene'];
    
    classesToClear.forEach(className => {
        if (window[className] && window[className].__cleaned) {
            console.warn(`🔄 清理重复的类定义: ${className}`);
            delete window[className];
        }
    });
    
    console.log('🧹 类定义清理完成');
})();

// 🆕 更精确的设备检测
function getDeviceType() {
    const ua = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 检测iOS设备
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    
    // 检测Android设备
    const isAndroid = /Android/.test(ua);
    
    // 检测移动设备
    const isMobile = isIOS || isAndroid;
    
    // 更精确的平板检测
    let isTablet = false;
    
    if (isIOS) {
        // iOS设备：iPad有特定的UA标识
        isTablet = ua.includes('iPad');
    } else if (isAndroid) {
        // Android设备：结合UA和屏幕尺寸判断
        isTablet = !ua.includes('Mobile') && (screenWidth >= 768 || screenHeight >= 768);
    }
    
    // 桌面设备
    const isDesktop = !isMobile;
    
    // 大屏设备（包括大平板和桌面）
    const isLargeScreen = screenWidth >= 768 || screenHeight >= 768;
    
    console.log(`📱 设备检测: iOS=${isIOS}, Android=${isAndroid}, 平板=${isTablet}, 桌面=${isDesktop}, 大屏=${isLargeScreen}`);
    
    if (isTablet || (isDesktop && isLargeScreen)) {
        return 'tablet';
    } else if (isMobile) {
        return 'mobile';
    } else {
        return 'desktop';
    }
}

// 🆕 检测设备并设置合适的分辨率
function getGameConfig() {
    const deviceType = getDeviceType();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    let gameWidth, gameHeight;
  
    if (deviceType === 'tablet') {
        // 平板设备：使用更高分辨率
        gameWidth = Math.min(1920, screenWidth);
        gameHeight = Math.min(1080, screenHeight);
        console.log(`📱 平板设备模式: ${gameWidth}x${gameHeight}`);
    } else if (deviceType === 'mobile') {
        // 手机设备：使用中等分辨率
        gameWidth = Math.min(1280, screenWidth);
        gameHeight = Math.min(720, screenHeight);
        console.log(`📱 手机设备模式: ${gameWidth}x${gameHeight}`);
    } else {
        // 桌面设备：使用标准分辨率
        gameWidth = 1280;
        gameHeight = 720;
        console.log(`🖥️ 桌面设备模式: ${gameWidth}x${gameHeight}`);
    }
  
    console.log(`🎮 游戏分辨率设置: ${gameWidth}x${gameHeight}`);
    console.log(`📱 设备信息: 类型=${deviceType}, 屏幕=${screenWidth}x${screenHeight}`);
  
    return {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container',
        backgroundColor: '#000',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: gameWidth,
            height: gameHeight
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        audio: {
            disableWebAudio: false
        },
        input: {
            touch: {
                capture: true
            }
        },
        scene: [window.PreloaderScene, window.PlayerSelectScene, window.MainScene]
    };
}

const config = getGameConfig();

console.log('游戏配置:', config);

// 检查所有必要的类是否已定义
function validateClasses() {
    const requiredClasses = [
        { name: 'PreloaderScene', class: window.PreloaderScene, category: '场景类' },
        { name: 'PlayerSelectScene', class: window.PlayerSelectScene, category: '场景类' },
        { name: 'MainScene', class: window.MainScene, category: '场景类' },
        { name: 'Enemy', class: window.Enemy, category: '游戏对象' },
        { name: 'EnemyBullet', class: window.EnemyBullet, category: '游戏对象' },
        { name: 'PowerUp', class: window.PowerUp, category: '游戏对象' },
        { name: 'Obstacle', class: window.Obstacle, category: '游戏对象' },
        { name: 'StatsManager', class: window.StatsManager, category: '管理器' },
        { name: 'AchievementManager', class: window.AchievementManager, category: '管理器' },
        { name: 'SaveManager', class: window.SaveManager, category: '管理器' },
        { name: 'AudioManager', class: window.AudioManager, category: '管理器' },
        { name: 'PowerUpManager', class: window.PowerUpManager, category: '管理器' },
        { name: 'ObstacleManager', class: window.ObstacleManager, category: '管理器' },
        { name: 'UIManager', class: window.UIManager, category: '管理器' },
        { name: 'BackgroundManager', class: window.BackgroundManager, category: '管理器' },
        { name: 'Weapon', class: window.Weapon, category: '游戏对象' },
        { name: 'Bullet', class: window.Bullet, category: '游戏对象' },
        { name: 'PixelArtSystem', class: window.PixelArtSystem, category: '系统' },
        { name: 'TouchControls', class: window.TouchControls, category: '系统' }
    ];
  
    const missingClasses = requiredClasses.filter(item => !item.class);
  
    if (missingClasses.length > 0) {
        console.error('❌ 缺失的类:', missingClasses.map(item => `${item.name} (${item.category})`));
        console.error('💡 可能的原因:');
        console.error('   1. 脚本加载顺序错误');
        console.error('   2. 文件路径错误');
        console.error('   3. 类定义语法错误');
        console.error('   4. 网络加载失败');
        console.error('🔧 建议检查:');
        console.error('   - index.html中的脚本加载顺序');
        console.error('   - 浏览器控制台是否有404错误');
        console.error('   - 类定义是否正确导出到window对象');
        return false;
    }
  
    console.log('✅ 所有必要的类都已正确加载');
    console.log('📊 加载统计:');
    const categories = {};
    requiredClasses.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count}个`);
    });
    return true;
}

// 验证所有类
if (!validateClasses()) {
    throw new Error('必要的类未正确加载，请检查脚本加载顺序');
}

console.log('场景列表:', config.scene.map(scene => 
    scene ? (scene.name || scene.constructor?.name || 'Unknown') : 'undefined'
));

const game = new Phaser.Game(config);
console.log('游戏实例已创建');

// 🆕 处理屏幕方向变化
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        game.scale.refresh();
        console.log('📱 屏幕方向已更新');
    }, 100);
});

// 🆕 防止iOS Safari的双击缩放
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false); 